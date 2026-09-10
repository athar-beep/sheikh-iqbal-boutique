import dotenv from 'dotenv';

dotenv.config();

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`FATAL: ${name} must be set in the environment before the server starts.`);
  }
  return value;
}

export const JWT_SECRET = requiredEnv('JWT_SECRET');
export const ADMIN_EMAIL = requiredEnv('ADMIN_EMAIL');
export const ADMIN_PASSWORD = requiredEnv('ADMIN_PASSWORD');
