import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { db } from './server/db.js';
import { paymentService } from './server/paymentService.js';
import { generateStylingConsultation } from './server/geminiStylist.js';
import { authenticateToken, requireAdmin, generateAuthToken, AuthenticatedRequest, verifyAuthToken } from './server/authMiddleware.js';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './server/config.js';
import bcrypt from 'bcrypt';
import { paymentProviders } from './server/payments.js';


const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for Cloud Run and monitoring
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Request logger
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// ==========================================
// 1. PRODUCTS API
// ==========================================
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, fabric, featured, status, sort } = req.query;
    const products = db.getProducts({
      category: category as string,
      search: search as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      fabric: fabric as string,
      featured: featured !== undefined ? featured === 'true' : undefined,
      status: status as string,
      sort: sort as string
    });
    res.json({ success: true, count: products.length, products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products/admin', requireAdmin, (req: Request, res: Response) => {
  try {
    const products = db.getAllProductsAdmin();
    res.json({ success: true, count: products.length, products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products/:identifier', (req: Request, res: Response) => {
  try {
    const product = db.getProductByIdOrSlug(req.params.identifier);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/products', requireAdmin, (req: Request, res: Response) => {
  try {
    const productData = req.body;
    if (!productData.title || !productData.price || !productData.sku) {
      return res.status(400).json({ success: false, error: 'Title, price and SKU are required' });
    }
    const newProduct = db.addProduct(productData);
    res.status(201).json({ success: true, product: newProduct });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const deleted = db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. CATEGORIES API
// ==========================================
app.get('/api/categories', (req: Request, res: Response) => {
  try {
    const categories = db.getCategories();
    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/categories', requireAdmin, (req: Request, res: Response) => {
  try {
    const newCat = db.addCategory(req.body);
    res.status(201).json({ success: true, category: newCat });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, category: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const deleted = db.deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. ORDERS & CHECKOUT API
// ==========================================
app.get('/api/orders', requireAdmin, (req: Request, res: Response) => {
  try {
    const { status, phone, email } = req.query;
    const orders = db.getOrders({
      status: status as string,
      phone: phone as string,
      email: email as string
    });
    res.json({ success: true, count: orders.length, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/account/orders', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Customer account required.' });
    }
    const customer = db.findUserById(req.user.userId);
    if (!customer) return res.status(404).json({ success: false, error: 'Account not found.' });
    const filters: { userId: string; phone?: string } = { userId: customer.id };
    if (customer.phone) filters.phone = customer.phone;
    const orders = [
      ...db.getOrders({ userId: filters.userId }),
      ...(filters.phone ? db.getOrders({ phone: filters.phone }) : [])
    ];
    // Include legacy orders that predate the userId field but belong to the authenticated phone number.
    const unique = Array.from(new Map(orders.map(order => [order.id, order])).values());
    res.json({ success: true, count: unique.length, orders: unique });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders/:identifier', (req: Request, res: Response) => {
  try {
    const order = db.getOrderByIdOrNumber(req.params.identifier);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found. Please verify Order # or Phone number.' });
    }
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const {
      shippingAddress,
      items,
      couponCode,
      paymentMethod,
      notes
    } = req.body;

    // Support both direct fields and nested customer object
    const customerName = req.body.customerName || req.body.customer?.name || shippingAddress?.fullName;
    const customerEmail = req.body.customerEmail || req.body.customer?.email || shippingAddress?.email || 'guest@sheikhiqbal.pk';
    const customerPhone = req.body.customerPhone || req.body.customer?.phone || shippingAddress?.phone;

    if (!customerName || !customerPhone || !items || !items.length || !shippingAddress) {
      return res.status(400).json({ success: false, error: 'Missing required order fields (customer details, items, address).' });
    }

    const cleanPhone = String(customerPhone).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'Please enter a valid Pakistani mobile number (e.g. 03001234567).' });
    }

    const result = db.createOrder({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      userId: (() => {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) return undefined;
        const verification = verifyAuthToken(header.substring(7).trim());
        return verification.valid && verification.payload?.role === 'customer' ? verification.payload.userId : undefined;
      })(),
      shippingAddress,
      items,
      couponCode,
      paymentMethod: paymentMethod || 'cod',
      notes
    });

    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    // Initialize payment process
    const paymentInit = await paymentService.initiate({
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      amount: result.order.totalAmount,
      customerName: result.order.customerName,
      customerEmail: result.order.customerEmail,
      customerPhone: result.order.customerPhone,
      paymentMethod: result.order.paymentMethod
    });

    res.status(201).json({
      success: true,
      order: result.order,
      payment: paymentInit
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  try {
    const { orderStatus, paymentStatus, courierDetails } = req.body;
    const updated = db.updateOrderStatus(req.params.id, {
      orderStatus,
      paymentStatus,
      courierDetails
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. COUPONS API
// ==========================================
app.post('/api/coupons/validate', (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || typeof subtotal !== 'number') {
      return res.status(400).json({ valid: false, message: 'Invalid coupon code or cart total' });
    }
    const result = db.validateCoupon(code, subtotal);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ valid: false, message: err.message });
  }
});

app.get('/api/coupons', (req: Request, res: Response) => {
  try {
    const coupons = db.getCoupons();
    res.json({ success: true, coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/coupons', requireAdmin, (req: Request, res: Response) => {
  try {
    const coupon = db.addCoupon(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/coupons/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const deleted = db.deleteCoupon(req.params.id);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. REVIEWS API
// ==========================================
app.get('/api/reviews/:productId', (req: Request, res: Response) => {
  try {
    const reviews = db.getReviewsByProductId(req.params.productId);
    res.json({ success: true, reviews });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/reviews', (req: Request, res: Response) => {
  try {
    const { productId, customerName, city, rating, comment } = req.body;
    if (!productId || !customerName || !rating || !comment) {
      return res.status(400).json({ success: false, error: 'All review fields are required.' });
    }
    const review = db.addReview({
      productId,
      customerName,
      city: city || 'Pakistan',
      rating: Number(rating),
      comment,
      verifiedPurchase: true
    });
    res.status(201).json({ success: true, review });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. STORE SETTINGS & ANALYTICS
// ==========================================
app.get('/api/settings', (req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/analytics', requireAdmin, (req: Request, res: Response) => {
  try {
    const analytics = db.getAnalytics();
    res.json({ success: true, analytics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. AUTHENTICATION (ADMIN & CUSTOMER)
// ==========================================
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password are required.' });

    if (email === ADMIN_EMAIL.toLowerCase()) {
      const validAdminPassword = password.length === ADMIN_PASSWORD.length && crypto.timingSafeEqual(Buffer.from(password), Buffer.from(ADMIN_PASSWORD));
      if (!validAdminPassword) return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      const adminUser = { id: 'usr-admin', name: 'Atelier Director', email: ADMIN_EMAIL, role: 'admin' as const };
      const token = generateAuthToken(adminUser);
      return res.json({ success: true, user: { ...adminUser, token }, token });
    }

    const user = db.findUserByEmail(email);
    if (!user || !user.passwordHash) return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) return res.status(401).json({ success: false, error: 'Invalid email or password.' });

    const publicUser = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, addresses: user.addresses, createdAt: user.createdAt };
    const token = generateAuthToken(user);
    return res.json({ success: true, user: { ...publicUser, token }, token });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Authentication service unavailable.' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : undefined;
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!name || !email || !password) return res.status(400).json({ success: false, error: 'Name, email and password are required.' });
    if (password.length < 8) return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
    const existing = db.findUserByEmail(email);
    if (existing) return res.status(400).json({ success: false, error: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = db.createUser({ name, email, phone, passwordHash, role: 'customer' });
    const token = generateAuthToken(newUser);
    const publicUser = { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role, addresses: newUser.addresses, createdAt: newUser.createdAt };
    res.status(201).json({ success: true, user: { ...publicUser, token }, token });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Registration service unavailable.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});

// ==========================================
// 8. PAYMENT INTEGRATION, WEBHOOKS & VERIFICATION
// ==========================================
app.post('/api/payments/verify', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { orderId, transactionId, paymentMethod } = req.body;
    const verified = await paymentService.verify({ orderId, transactionId, paymentMethod, rawPayload: req.body.rawPayload });

    let updatedOrder = null;
    if (verified.isVerified && req.body.rawPayload) {
      updatedOrder = db.updateOrderStatus(orderId, { paymentStatus: 'paid', orderStatus: 'confirmed' });
    }

    res.json({
      success: true,
      verification: verified,
      order: updatedOrder
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// JazzCash signed callback / IPN
app.post('/api/payments/webhook/jazzcash', (req: Request, res: Response) => {
  try {
    const verification = paymentProviders.JazzCashProvider.verify(req.body);
    if (!verification.verified) return res.status(400).json({ status: 'rejected', message: verification.error || 'Invalid JazzCash callback.' });
    const reference = String(req.body.pp_BillReference || '');
    const order = db.getOrderByIdOrNumber(reference);
    if (!order) return res.status(404).json({ status: 'error', message: 'Order not found.' });
    if (Math.abs(order.totalAmount - verification.amount) > 0.01) return res.status(400).json({ status: 'rejected', message: 'Payment amount mismatch.' });
    const updated = db.updateOrderStatus(order.id, { paymentStatus: 'paid', orderStatus: 'confirmed' });
    return res.status(200).json({ status: 'success', message: 'Payment recorded', orderId: updated?.id });
  } catch (err: any) {
    console.error('JazzCash webhook verification error:', err);
    return res.status(500).json({ error: 'Payment callback processing failed.' });
  }
});

// Easypaisa signed callback / IPN
app.post('/api/payments/webhook/easypaisa', (req: Request, res: Response) => {
  try {
    const verification = paymentProviders.EasypaisaProvider.verify(req.body);
    if (!verification.verified) return res.status(400).json({ status: 'rejected', message: verification.error || 'Invalid Easypaisa callback.' });
    const reference = String(req.body.orderRefNumber || req.body.orderRefNum || req.body.orderId || '');
    const order = db.getOrderByIdOrNumber(reference);
    if (!order) return res.status(404).json({ status: 'error', message: 'Order not found.' });
    if (Math.abs(order.totalAmount - verification.amount) > 0.01) return res.status(400).json({ status: 'rejected', message: 'Payment amount mismatch.' });
    const updated = db.updateOrderStatus(order.id, { paymentStatus: 'paid', orderStatus: 'confirmed' });
    return res.status(200).json({ status: 'success', message: 'Payment recorded', orderId: updated?.id });
  } catch (err: any) {
    console.error('Easypaisa webhook verification error:', err);
    return res.status(500).json({ error: 'Payment callback processing failed.' });
  }
});

app.post('/api/payments/verify-simulated', requireAdmin, (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, error: 'Simulated payment verification is disabled in production.' });
  }
  try {
    const { orderId, provider, transactionRef } = req.body;
    const updated = db.updateOrderStatus(orderId, {
      paymentStatus: 'paid',
      orderStatus: 'confirmed'
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({
      success: true,
      order: updated,
      message: `Payment of Rs. ${updated.totalAmount.toLocaleString()} verified successfully via ${provider?.toUpperCase() || 'Gateway'} (Ref: ${transactionRef || 'SIM-TEST'}).`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 9. AI LUXURY STYLIST & CONCIERGE (Gemini 3.1 Pro with High Thinking)
// ==========================================
app.post('/api/ai/stylist', async (req: Request, res: Response) => {
  try {
    const userQuery = req.body.userQuery || req.body.query || '';
    const occasion = req.body.occasion || 'Festive Wedding Celebration';
    const budgetPkr = req.body.budgetPkr || req.body.budgetPKR;
    const preferredFabric = req.body.preferredFabric || 'Pure Raw Silk / Chiffon';
    const gender = req.body.gender || 'Women';
    const cityOrClimate = req.body.cityOrClimate || req.body.city || 'Pakistan';

    if (!userQuery && !req.body.occasion) {
      return res.status(400).json({
        success: false,
        error: 'Please describe your event or style preference for Begum Zauq.'
      });
    }

    const consultation = await generateStylingConsultation({
      occasion,
      budgetPkr: budgetPkr ? Number(budgetPkr) : undefined,
      preferredFabric,
      gender,
      cityOrClimate,
      userQuery: userQuery || `Haute couture wardrobe advice for ${occasion}`
    });

    // Populate suggested products
    const suggestedProducts = consultation.suggestedProductIds
      .map(id => db.getProductByIdOrSlug(id))
      .filter(Boolean);

    res.json({
      success: true,
      stylistAdvice: consultation.recommendation,
      stylingTips: consultation.stylingTips,
      recommendedProductIds: consultation.suggestedProductIds,
      suggestedColorPalette: ['Royal Ivory', 'Antique Gold', 'Deep Plum', 'Emerald Forest'],
      thoughtProcess: 'Synthesized using Begum Zauq high-thinking fashion ontology, factoring in traditional Old Lahore karigari and Pakistani climatic suitability.',
      consultation: {
        recommendation: consultation.recommendation,
        stylingTips: consultation.stylingTips,
        products: suggestedProducts
      }
    });
  } catch (err: any) {
    console.error('AI Stylist error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// DIRECT PROJECT ZIP ARCHIVE DOWNLOAD
// ==========================================
app.get(['/api/download-project', '/download-project.zip', '/sheikh-iqbal-boutique-complete.zip'], requireAdmin, (req: Request, res: Response) => {
  const rootDir = process.cwd();
  let zipPath = path.resolve(rootDir, 'sheikh-iqbal-boutique-complete.zip');
  if (!fs.existsSync(zipPath)) {
    const publicZip = path.resolve(rootDir, 'public', 'sheikh-iqbal-boutique-complete.zip');
    if (fs.existsSync(publicZip)) {
      zipPath = publicZip;
    }
  }
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="sheikh-iqbal-boutique-complete.zip"');
  res.download(zipPath, 'sheikh-iqbal-boutique-complete.zip', (err) => {
    if (err && !res.headersSent) {
      console.error('Failed to download project zip:', err);
      res.status(500).json({ success: false, error: 'Could not download archive' });
    }
  });
});

// ==========================================
// 10. FRONTEND VITE INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sheikh Iqbal Atelier] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
