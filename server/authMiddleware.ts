import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { JWT_SECRET } from './config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'customer';
  name?: string;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/** Generate a cryptographically signed bearer token with a seven-day lifetime. */
export function generateAuthToken(user: { id: string; email: string; role: 'admin' | 'customer'; name?: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${encodedPayload}`)
    .digest('base64url');

  return `${header}.${encodedPayload}.${signature}`;
}

export function verifyAuthToken(token: string): { valid: boolean; payload?: TokenPayload; error?: string } {
  if (!token) return { valid: false, error: 'No token provided' };

  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false, error: 'Malformed token structure' };

  const [header, encodedPayload, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${encodedPayload}`)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature);
    const expectedSigBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedSigBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
      return { valid: false, error: 'Invalid token signature' };
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as TokenPayload;
    if (!payload || !payload.userId || !payload.email || !payload.role || !payload.exp) {
      return { valid: false, error: 'Invalid token payload' };
    }
    if (Date.now() > payload.exp) return { valid: false, error: 'Token has expired' };

    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'Token decode failed' };
  }
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid Authorization header. Expected Bearer token.' });
  }

  const token = authHeader.substring(7).trim();
  const verification = verifyAuthToken(token);
  if (!verification.valid || !verification.payload) {
    return res.status(401).json({ success: false, error: `Unauthorized: ${verification.error || 'Invalid authentication token.'}` });
  }

  req.user = verification.payload;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Authentication required. Please log in as an administrator.' });
  }

  const token = authHeader.substring(7).trim();
  const verification = verifyAuthToken(token);
  if (!verification.valid || !verification.payload) {
    return res.status(401).json({ success: false, error: `Unauthorized: ${verification.error || 'Invalid authentication token.'}` });
  }

  if (verification.payload.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Forbidden: Insufficient privileges. Only Atelier Directors and Admins can perform this action.' });
  }

  req.user = verification.payload;
  next();
}
