-- ==========================================================
-- ZAUQ Luxury Atelier: Production PostgreSQL / Supabase Schema
-- Includes tables for Users, Products, Categories, Orders,
-- Order Items, Coupons, Reviews, Payments, and Settings.
-- ==========================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  product_count INT DEFAULT 0
);

-- 2. PRODUCTS & INVENTORY TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  sale_price NUMERIC(12, 2),
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT,
  fabric TEXT NOT NULL,
  work TEXT NOT NULL,
  pieces INT DEFAULT 1,
  sizes JSONB NOT NULL DEFAULT '["S", "M", "L", "XL"]'::jsonb,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  stitching_options JSONB NOT NULL DEFAULT '["ready_to_wear"]'::jsonb,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_featured BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  sku TEXT UNIQUE NOT NULL,
  delivery_timeline TEXT,
  care_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USERS & ROLES TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  password_hash TEXT NOT NULL DEFAULT '',
  addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  total_amount NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'jazzcash', 'easypaisa', 'raast')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'stitching', 'dispatched', 'delivered', 'cancelled')),
  courier_details JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

-- 5. ORDER ITEMS (NORMALIZED RELATIONAL ITEMS)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  stitching TEXT NOT NULL,
  image TEXT
);

-- 6. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value NUMERIC(12, 2) NOT NULL,
  min_order_value NUMERIC(12, 2) DEFAULT 0,
  max_discount NUMERIC(12, 2),
  valid_until TIMESTAMPTZ,
  usage_limit INT,
  times_used INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  city TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PAYMENTS & AUDIT LEDGER
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('cod', 'jazzcash', 'easypaisa', 'raast')),
  transaction_ref TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  store_name TEXT NOT NULL,
  tagline TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  store_address TEXT NOT NULL,
  city TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PKR',
  free_shipping_threshold NUMERIC(12, 2) NOT NULL DEFAULT 5000,
  flat_shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 250,
  express_delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 450,
  cod_enabled BOOLEAN DEFAULT TRUE,
  cod_advance_verification BOOLEAN DEFAULT TRUE,
  jazzcash_enabled BOOLEAN DEFAULT TRUE,
  easypaisa_enabled BOOLEAN DEFAULT TRUE,
  raast_enabled BOOLEAN DEFAULT TRUE,
  raast_iban TEXT NOT NULL,
  announcement_text TEXT
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
