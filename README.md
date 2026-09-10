# Sheikh Iqbal Cloth & Boutique Centre (شیخ اقبال)

> **Old Lahore Heritage × Haute Couture × Modern E-Commerce Platform**
> A full-stack Pakistani luxury pret, festive unstitched cloth, and boutique couture digital flagship.

---

## 🌟 Features Overview

- **Boutique Storefront**: Luxury Pakistani bridal, pret, raw silk formals, menswear, and handcrafted velvet shawls.
- **Interactive Catalogue**: Real-time filtering by category, price ranges, fabric types, and search with instant matching.
- **Product Details & 3D Polish**: High-resolution zoom inspection, size guides, fabric specifications, and customer reviews.
- **Bag & Wishlist System**: Persistent cart management, coupon code discounts, and real-time subtotal calculations.
- **Pakistani Payment Architecture**:
  - **Cash on Delivery (COD)** with nationwide courier coverage.
  - **Raast Instant Pay** with official IBAN & QR instructions.
  - **JazzCash Mobile Wallet** gateway integration.
  - **Easypaisa Mobile Wallet** OTC/Wallet API handlers.
  - **Direct Bank Transfer** verification.
- **Order Tracking**: Real-time tracking portal with city-based courier ETA (TCS, Leopards, Trax).
- **AI Luxury Stylist (Gemini 2.5/Flash)**: Context-aware personal fashion assistant trained on Old Lahore artisanal cuts, embroidery pairing, and styling advice.
- **Admin Director Portal**: Full inventory control, status updates, order lifecycle management, analytics, coupon generator, and customer activity logs.

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

### 2. Installation
Clone or unzip the repository into your desired directory, then run:

```bash
npm install
```

### 3. Environment Variables Configuration
Copy the `.env.example` template to create your local `.env`:

```bash
cp .env.example .env
```

Open `.env` and configure your settings:

```env
# Server Port (Runs on 3000 by default)
PORT=3000

# Gemini AI API Key (Required for AI Stylist consultation)
GEMINI_API_KEY="your-google-gemini-api-key"

# Database Persistence (Optional: defaults to automated local persistent JSON store in /data/store.json)
DATABASE_URL="postgresql://postgres:password@localhost:5432/sheikh_iqbal_ecommerce"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Admin Authentication
JWT_SECRET="generate-a-long-random-secret-here"
ADMIN_EMAIL="admin@sheikhiqbal.pk"
ADMIN_PASSWORD="set-a-strong-admin-password-here"

# Pakistani Payment Gateways (Sandbox or Production)
JAZZCASH_MERCHANT_ID="your-jazzcash-merchant-id"
JAZZCASH_PASSWORD="your-jazzcash-password"
JAZZCASH_INTEGRITY_SALT="your-jazzcash-integrity-salt"
JAZZCASH_RETURN_URL="https://your-domain.example/api/payments/webhook/jazzcash"

EASYPAISA_STORE_ID="your-easypaisa-store-id"
EASYPAISA_HASH_KEY="your-easypaisa-hash-key"
EASYPAISA_RETURN_URL="https://your-domain.example/api/payments/webhook/easypaisa"
```

### Payment callback security
JazzCash and Easypaisa callbacks are accepted only when their provider signature/hash validates with the configured merchant secret. `verify-simulated` is admin-only and disabled in production.

### 4. Running Locally in Development Mode
Start both the Express backend and the Vite client concurrently:

```bash
npm run dev
```

The application will be accessible at:
👉 **`http://localhost:3000`**

---

## 🛡️ Admin Director Portal Access

The boutique administration portal is accessible directly from the header, footer, or via URL state:
- **Location**: Click **"Director Access"** in the top navigation bar or footer.
- **Preset Demo Credentials**:
  - **Email**: `admin@sheikhiqbal.pk`
  - **Password**: Set `ADMIN_PASSWORD` in the server environment; it is not stored in source code.
- **Admin Capabilities**:
  - Add, edit, or restock luxury products and imagery
  - Update order fulfillment statuses (Pending → Processing → Dispatched → Delivered)
  - Issue courier tracking numbers
  - Generate and manage promotional discount coupons
  - Review live store analytics and revenue stats

---

## 🏗️ Building for Production

To create an optimized production build:

```bash
npm run build
```

This compiles the Vite frontend assets into `dist/` and bundles `server.ts` into `dist/server.cjs` via esbuild.

To test the production build locally:

```bash
npm start
```

---

## 🚢 Deployment Options

### Deploying to Cloud Run / Docker
A `Dockerfile` or direct container deployment works out of the box. Ensure:
- `PORT` is bound to `3000` (or `0.0.0.0:$PORT`).
- Pass `GEMINI_API_KEY` and any database secrets as environment variables.

### Deploying to Railway / Render / VPS
1. Connect your Git repository.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Set Environment Variables in your platform dashboard.

---

## 📁 Project Architecture

```
├── data/
│   └── store.json               # Automated local database store
├── public/
│   └── ...                      # Static assets and downloadable archives
├── server/
│   ├── authMiddleware.ts        # JWT and admin permission middleware
│   ├── db.ts                    # Database abstraction layer (PostgreSQL / local JSON)
│   ├── paymentService.ts        # Raast, COD, and payment orchestration
│   ├── payments.ts              # JazzCash & Easypaisa integrations
│   ├── postgresSchema.sql       # Production PostgreSQL/Supabase schema
│   └── seedData.ts              # Initial products, categories, coupons, and orders
├── src/
│   ├── components/              # Modular UI components (Hero, Catalog, Cards, Modals)
│   ├── context/                 # React Contexts (Cart, Auth)
│   ├── services/                # Client-side API client
│   ├── types.ts                 # TypeScript data contracts and interfaces
│   ├── utils/                   # Image fallbacks, animation curves, formatting
│   ├── App.tsx                  # Main application orchestrator
│   └── main.tsx                 # Client entry point
├── package.json                 # Dependencies and build scripts
├── server.ts                    # Express + Vite SSR / API gateway entry point
├── vite.config.ts               # Vite configuration with Tailwind CSS
└── tsconfig.json                # TypeScript compiler configuration
```

---

© 2026 Sheikh Iqbal Cloth & Boutique Centre (شیخ اقبال). All rights reserved.
