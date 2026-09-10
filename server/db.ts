import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { Product, Category, Order, Coupon, Review, StoreSettings, User } from '../src/types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  settings: StoreSettings;
  users: User[];
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-pret',
    name: 'Luxury Pret',
    slug: 'luxury-pret',
    description: 'Ready-to-wear tailored silhouettes in pure raw silks, organza, and embroidered chiffons.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
    order: 1,
    isActive: true,
    productCount: 4
  },
  {
    id: 'cat-festive',
    name: 'Festive Unstitched',
    slug: 'festive-unstitched',
    description: '3-Piece embroidered lawn and chiffon masterworks with hand-embellished dupattas.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
    order: 2,
    isActive: true,
    productCount: 3
  },
  {
    id: 'cat-formals',
    name: 'Raw Silk Formals',
    slug: 'raw-silk-formals',
    description: 'Timeless 80g pure Pakistani raw silk ensembles adorned with tilla and zardozi.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    order: 3,
    isActive: true,
    productCount: 3
  },
  {
    id: 'cat-menswear',
    name: 'Handcrafted Menswear',
    slug: 'handcrafted-menswear',
    description: 'Bespoke cotton-karandi kurtas, royal jacquard waistcoats, and festive sherwanis.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
    order: 4,
    isActive: true,
    productCount: 2
  },
  {
    id: 'cat-shawls',
    name: 'Velvet & Pashmina Shawls',
    slug: 'velvet-pashmina-shawls',
    description: 'Micro-velvet and pure Kashmiri pashmina wraps embroidered with intricate resham.',
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=80',
    order: 5,
    isActive: true,
    productCount: 2
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    title: 'Gul-e-Noor Zardozi Raw Silk Peshwas',
    slug: 'gul-e-noor-zardozi-raw-silk-peshwas',
    shortDescription: '3-Piece ivory raw silk kalidaar peshwas with hand-cut organza borders and tilla embroidery.',
    description: 'Evoking the regal courtly heritage of Old Lahore, Gul-e-Noor features an ivory 80g pure Pakistani raw silk kalidaar adorned with intricate tilla, resham, and hand-cut zardozi work along the daaman and cuffs. Paired with a crushed silk sharara and a diaphanous organza dupatta featuring scalloped mukesh borders.',
    categoryId: 'cat-formals',
    categoryName: 'Raw Silk Formals',
    price: 38500,
    salePrice: 34500,
    sku: 'ZQ-FS-001',
    stock: 12,
    fabric: '80g Pure Raw Silk & Organza',
    embroideryWork: 'Handcrafted Zardozi, Tilla & Mukesh Details',
    pieceCount: '3-Piece Stitched',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'Custom'],
    colors: ['Ivory Gold', 'Blush Rose', 'Emerald Teal'],
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 28,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    status: 'active',
    weightKg: 1.2,
    dimensionsCm: '40x30x8',
    seoTitle: 'Gul-e-Noor Raw Silk Peshwas | Sheikh Iqbal Cloth & Boutique Centre',
    seoDescription: 'Handcrafted ivory Pakistani raw silk peshwas with hand-cut organza dupatta and zardozi borders.',
    createdAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 'prod-002',
    title: 'Surmayi Mehr-un-Nisa Chiffon Angrakha',
    slug: 'surmayi-mehr-un-nisa-chiffon-angrakha',
    shortDescription: 'Slate grey pure crinkle chiffon angrakha with silver gota patti and silk threadwork.',
    description: 'A poetic silhouette tailored in breathable pure crinkle chiffon in a dramatic charcoal slate hue. Features traditional angrakha overlapping neckline fastened with handmade silk latkans, finished with silver marori work and paired with a silk jamawar trouser.',
    categoryId: 'cat-pret',
    categoryName: 'Luxury Pret',
    price: 26500,
    sku: 'ZQ-PR-002',
    stock: 8,
    fabric: 'Pure Crinkle Chiffon & Silk Jamawar',
    embroideryWork: 'Silver Gota Patti, Marori & Resham',
    pieceCount: '3-Piece Stitched',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Surmayi Slate', 'Obsidian Black'],
    images: [
      'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.8,
    reviewsCount: 19,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    status: 'active',
    weightKg: 0.9,
    dimensionsCm: '38x28x6',
    seoTitle: 'Surmayi Chiffon Angrakha | Sheikh Iqbal Cloth & Boutique Centre',
    seoDescription: 'Pure crinkle chiffon Pakistani angrakha with silver gota patti and silk jamawar trouser.',
    createdAt: '2026-01-15T12:00:00Z'
  },
  {
    id: 'prod-003',
    title: 'Zafrani Firdaus Festive Embroidered Lawn',
    slug: 'zafrani-firdaus-festive-embroidered-lawn',
    shortDescription: '3-Piece unstitched premium Pima lawn with schiffli laser-cut embroidery and jacquard organza dupatta.',
    description: 'Woven from premium long-staple Pakistani Pima lawn, this unstitched ensemble features a mustard-saffron shirt with heavy schiffli cutwork, embroidered organza neckline patch, silk embroidered daaman lace, and a woven zari-jacquard organza dupatta with printed lawn trousers.',
    categoryId: 'cat-festive',
    categoryName: 'Festive Unstitched',
    price: 14800,
    salePrice: 12500,
    sku: 'ZQ-FE-003',
    stock: 25,
    fabric: 'Pima Cotton Lawn & Zari Organza',
    embroideryWork: 'Schiffli Cutwork & Delicate Resham Lace',
    pieceCount: '3-Piece Unstitched',
    sizes: ['Custom'],
    colors: ['Zafrani Saffron', 'Pistachio Mint'],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 42,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    status: 'active',
    weightKg: 1.1,
    dimensionsCm: '35x25x6',
    seoTitle: 'Zafrani Firdaus Festive Lawn | Sheikh Iqbal Cloth & Boutique Centre',
    seoDescription: 'Luxury Pakistani unstitched lawn suit with schiffli cutwork and zari organza dupatta.',
    createdAt: '2026-02-01T12:00:00Z'
  },
  {
    id: 'prod-004',
    title: 'Nawabzada Royal Jamawar Waistcoat',
    slug: 'nawabzada-royal-jamawar-waistcoat',
    shortDescription: 'Tailored men’s formal waistcoat in antique gold handwoven banarsi jamawar with metallic crest buttons.',
    description: 'Crafted for celebratory occasions, this waistcoat features a structured tailored fit in antique gold banarsi jamawar woven with metallic thread. Adorned with monogrammed antique brass buttons, Mandarin collar, and chest welt pocket. Can be worn over crisp white or raw silk kurtas.',
    categoryId: 'cat-menswear',
    categoryName: 'Handcrafted Menswear',
    price: 18500,
    sku: 'ZQ-MW-004',
    stock: 15,
    fabric: 'Banarsi Jamawar & Italian Cotton Lining',
    embroideryWork: 'Woven Metallic Zari & Monogram Buttons',
    pieceCount: '1-Piece Waistcoat',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Antique Gold', 'Deep Maroon', 'Midnight Navy'],
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 5.0,
    reviewsCount: 14,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    status: 'active',
    weightKg: 0.6,
    dimensionsCm: '40x30x4',
    seoTitle: 'Nawabzada Jamawar Waistcoat | Sheikh Iqbal Cloth & Boutique Centre',
    seoDescription: 'Luxury Pakistani men banarsi jamawar waistcoat for wedding events, Eid and celebrations.',
    createdAt: '2026-01-20T12:00:00Z'
  },
  {
    id: 'prod-005',
    title: 'Koshish Kashmiri Tilla Embroidered Velvet Shawl',
    slug: 'koshish-kashmiri-tilla-embroidered-velvet-shawl',
    shortDescription: 'Rich jewel-toned micro-velvet shawl with dense Kashmiri tilla borders and pearl finishes.',
    description: 'An heirloom accessory crafted in lush 9000-grade velvet in regal bottle green. Hand-finished with 4-sided Kashmiri antique golden tilla thread embroidery, delicate sequin spangles, and hand-strung freshwater seed pearl fringe tassels along the pallu.',
    categoryId: 'cat-shawls',
    categoryName: 'Velvet & Pashmina Shawls',
    price: 32000,
    salePrice: 28500,
    sku: 'ZQ-SH-005',
    stock: 7,
    fabric: '9000 Grade Micro-Velvet',
    embroideryWork: 'Handcrafted Kashmiri Antique Tilla & Seed Pearls',
    pieceCount: '1-Piece Luxury Shawl (2.75 Yards)',
    sizes: ['Custom'],
    colors: ['Emerald Bottle Green', 'Ruby Wine', 'Midnight Black'],
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 5.0,
    reviewsCount: 22,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    status: 'active',
    weightKg: 1.4,
    dimensionsCm: '42x32x7',
    seoTitle: 'Kashmiri Tilla Velvet Shawl | Sheikh Iqbal Cloth & Boutique Centre',
    seoDescription: 'Pure velvet Pakistani shawl with ornate antique tilla embroidery borders and pearl tassels.',
    createdAt: '2026-01-05T12:00:00Z'
  },
  {
    id: 'prod-006',
    title: 'Laila Ruby Red Chiffon Saree & Blouse',
    slug: 'laila-ruby-red-chiffon-saree-and-blouse',
    shortDescription: 'Romantic deep crimson pure French chiffon saree with micro-cut beads and embroidered raw silk blouse.',
    description: 'Crafted for soirée evenings, Laila features 6.5 yards of lightweight fluid French chiffon with an all-over hand-sprayed sitara spray and scalloped borders. Paired with a sweetheart-neckline raw silk blouse encrusted with dabka, french knots, and micro-crystals.',
    categoryId: 'cat-formals',
    categoryName: 'Raw Silk Formals',
    price: 42000,
    sku: 'ZQ-FS-006',
    stock: 4,
    fabric: 'Pure French Chiffon & Raw Silk',
    embroideryWork: 'Cut Beads, Sitara Spray, French Knots & Dabka',
    pieceCount: '2-Piece Saree Set with Petticoat',
    sizes: ['XS', 'S', 'M', 'L', 'Custom'],
    colors: ['Ruby Crimson', 'Onyx Noir'],
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.9,
    reviewsCount: 16,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    status: 'active',
    weightKg: 1.0,
    dimensionsCm: '38x28x6',
    seoTitle: 'Laila Crimson Chiffon Saree | Sheikh Iqbal Cloth & Boutique Centre',
    seoDescription: 'Ruby red French chiffon Pakistani designer saree with hand-embroidered raw silk blouse.',
    createdAt: '2026-02-10T12:00:00Z'
  },
  {
    id: 'prod-007',
    title: 'Mirza Hand-Spun Cotton Karandi Kurta Set',
    slug: 'mirza-hand-spun-cotton-karandi-kurta-set',
    shortDescription: 'Men’s 2-piece textured cotton-karandi kurta with subtle tone-on-tone thread embroidery and churidar.',
    description: 'An understated masterclass in luxury menswear. Woven on traditional handlooms using Egyptian cotton blends, the Mirza kurta features subtle geometric tone-on-tone embroidery across the placket and cuffs, styled with a classic band collar and tailored cotton-silk shalwar.',
    categoryId: 'cat-menswear',
    categoryName: 'Handcrafted Menswear',
    price: 15500,
    salePrice: 13900,
    sku: 'ZQ-MW-007',
    stock: 18,
    fabric: 'Hand-Spun Cotton Karandi',
    embroideryWork: 'Tone-on-Tone Shadow Stitch & Horn Buttons',
    pieceCount: '2-Piece Kurta Shalwar',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Sand Beige', 'Slate Blue', 'Charcoal Grey'],
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.8,
    reviewsCount: 31,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    status: 'active',
    weightKg: 0.7,
    dimensionsCm: '38x28x4',
    seoTitle: 'Mirza Cotton Karandi Kurta | Sheikh Iqbal Cloth & Boutique Centre',
    seoDescription: 'Pure hand-spun cotton karandi Pakistani kurta with tailored shalwar.',
    createdAt: '2026-01-12T12:00:00Z'
  },
  {
    id: 'prod-008',
    title: 'Shehnai Embroidered Organza Jacket & Culottes',
    slug: 'shehnai-embroidered-organza-jacket-and-culottes',
    shortDescription: 'Modern sheer organza front-open long jacket layered over silk camisole and wide-leg culottes.',
    description: 'Designed for the modern Pakistani woman seeking contemporary elegance. A floor-length organza cape featuring resham floral vines and pearl accents, accompanied by a raw silk camisole and tailored wide-leg trousers.',
    categoryId: 'cat-pret',
    categoryName: 'Luxury Pret',
    price: 29500,
    sku: 'ZQ-PR-008',
    stock: 6,
    fabric: 'Crystal Organza & Raw Silk Underlay',
    embroideryWork: 'Resham Floral Threadwork & Seed Pearls',
    pieceCount: '3-Piece Stitched',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Tea Pink', 'Powder Blue'],
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=80'
    ],
    rating: 4.7,
    reviewsCount: 11,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    status: 'active',
    weightKg: 0.8,
    dimensionsCm: '38x28x5',
    seoTitle: 'Shehnai Organza Jacket Set | Sheikh Iqbal Cloth & Boutique Centre',
    seoDescription: 'Sheer crystal organza Pakistani jacket with raw silk culottes and pearl detailing.',
    createdAt: '2026-02-18T12:00:00Z'
  }
];

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'coup-01',
    code: 'EID2026',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 10000,
    maxDiscountAmount: 5000,
    expiryDate: '2026-12-31T23:59:59Z',
    usageLimit: 500,
    timesUsed: 42,
    isActive: true
  },
  {
    id: 'coup-02',
    code: 'WELCOME1000',
    discountType: 'fixed',
    discountValue: 1000,
    minOrderAmount: 8000,
    expiryDate: '2026-12-31T23:59:59Z',
    usageLimit: 1000,
    timesUsed: 128,
    isActive: true
  },
  {
    id: 'coup-03',
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 250,
    minOrderAmount: 2000,
    expiryDate: '2026-12-31T23:59:59Z',
    usageLimit: 200,
    timesUsed: 89,
    isActive: true
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    productId: 'prod-001',
    customerName: 'Ayesha Siddiqui',
    city: 'Lahore (DHA Phase 5)',
    rating: 5,
    comment: 'The stitching and quality of raw silk is unmatched! The zardozi work is even more breathtaking in person. Received in 2 days via TCS express with Cash on Delivery.',
    verifiedPurchase: true,
    date: '2026-02-14',
    status: 'approved'
  },
  {
    id: 'rev-02',
    productId: 'prod-001',
    customerName: 'Fatima Zahra Khan',
    city: 'Karachi (Clifton)',
    rating: 5,
    comment: 'Wore this to my brother’s Qawwali night and received endless compliments. Sheikh Iqbal Boutique has truly redefined luxury pret in Pakistan.',
    verifiedPurchase: true,
    date: '2026-02-18',
    status: 'approved'
  },
  {
    id: 'rev-03',
    productId: 'prod-004',
    customerName: 'Hamza Tariq',
    city: 'Islamabad (F-7/2)',
    rating: 5,
    comment: 'The banarsi jamawar fabric has genuine weight and sheen. Fits perfectly as per the sizing chart. Very impressed with the packaging and prompt communication.',
    verifiedPurchase: true,
    date: '2026-02-22',
    status: 'approved'
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ZQ-98241',
    customerName: 'Mahnoor Tariq',
    customerEmail: 'mahnoor.t@gmail.com',
    customerPhone: '03008459123',
    shippingAddress: {
      fullName: 'Mahnoor Tariq',
      phone: '03008459123',
      email: 'mahnoor.t@gmail.com',
      streetAddress: 'House 42-B, Street 7, Sector Y, Phase 3, DHA',
      city: 'Lahore',
      province: 'Punjab',
      postalCode: '54792',
      nearbyLandmark: 'Near Y-Block Market',
      deliveryInstructions: 'Please call 15 minutes before arrival for cash handover.'
    },
    items: [
      {
        productId: 'prod-001',
        title: 'Gul-e-Noor Zardozi Raw Silk Peshwas',
        price: 34500,
        quantity: 1,
        size: 'M',
        color: 'Ivory Gold',
        stitching: 'ready_to_wear',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop'
      }
    ],
    subtotal: 34500,
    shippingFee: 0,
    discountAmount: 1000,
    couponCode: 'WELCOME1000',
    totalAmount: 33500,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'processing',
    courierDetails: {
      courierName: 'TCS Express',
      trackingNumber: 'TCS-771928491',
      trackingUrl: 'https://www.tcsexpress.com/tracking?track=TCS-771928491',
      estimatedDelivery: '2026-03-12'
    },
    notes: 'Urgent wedding dispatch requested.',
    createdAt: '2026-03-08T10:30:00Z',
    updatedAt: '2026-03-08T14:15:00Z'
  },
  {
    id: 'ord-1002',
    orderNumber: 'ZQ-98240',
    customerName: 'Zainab Bilgrami',
    customerEmail: 'zainab.b@outlook.com',
    customerPhone: '03219876543',
    shippingAddress: {
      fullName: 'Zainab Bilgrami',
      phone: '03219876543',
      email: 'zainab.b@outlook.com',
      streetAddress: 'Flat 402, Al-Razi Heights, Block 4, Clifton',
      city: 'Karachi',
      province: 'Sindh',
      postalCode: '75600',
      nearbyLandmark: 'Opposite Bilawal House',
      deliveryInstructions: 'Deliver to guard if unattended.'
    },
    items: [
      {
        productId: 'prod-003',
        title: 'Zafrani Firdaus Festive Embroidered Lawn',
        price: 12500,
        quantity: 2,
        size: 'Custom',
        color: 'Zafrani Saffron',
        stitching: 'ready_to_wear',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop'
      }
    ],
    subtotal: 25000,
    shippingFee: 0,
    discountAmount: 3750,
    couponCode: 'EID2026',
    totalAmount: 21250,
    paymentMethod: 'jazzcash',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    courierDetails: {
      courierName: 'Leopards Courier',
      trackingNumber: 'LCS-88910231',
      shippedAt: '2026-03-07T09:00:00Z',
      estimatedDelivery: '2026-03-10'
    },
    createdAt: '2026-03-06T15:20:00Z',
    updatedAt: '2026-03-07T09:00:00Z'
  }
];

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Sheikh Iqbal Cloth & Boutique Centre',
  tagline: 'Fine Heritage Cloth, Unstitched Silks & Bespoke Boutique Pret',
  contactEmail: 'concierge@sheikhiqbalboutique.com',
  contactPhone: '[PHONE NUMBER]',
  whatsappNumber: '[WHATSAPP NUMBER]',
  storeAddress: '[ADDRESS]',
  city: 'Pakistan',
  currency: 'PKR',
  freeShippingThreshold: 5000,
  flatShippingFee: 250,
  expressDeliveryFee: 450,
  codEnabled: true,
  codAdvanceVerification: true,
  jazzcashEnabled: true,
  easypaisaEnabled: true,
  raastEnabled: true,
  raastIban: 'PK12BAHL0001234567890123',
  announcementText: 'Complimentary Nationwide Shipping on Orders Over Rs. 5,000 | Cash on Delivery Available'
};

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Atelier Director',
    email: 'admin@sheikhiqbal.pk',
    passwordHash: '',
    phone: '03008459999',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr-cust-1',
    name: 'Mahnoor Tariq',
    email: 'mahnoor.t@gmail.com',
    passwordHash: '',
    phone: '03008459123',
    role: 'customer',
    createdAt: '2026-02-10T00:00:00Z'
  }
];

export class Database {
  private data: DatabaseSchema;
  private pool: pg.Pool | null = null;
  private isPgConnected: boolean = false;

  constructor() {
    this.data = this.loadData();
    this.initPostgres();
  }

  private async initPostgres() {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_URL;
    if (!dbUrl) {
      console.log('ℹ️ Running on atomic persistent local database (data/store.json). Set DATABASE_URL to connect to managed PostgreSQL/Supabase.');
      return;
    }

    try {
      this.pool = new pg.Pool({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === 'production' || dbUrl.includes('supabase') || dbUrl.includes('sslmode=require')
          ? { rejectUnauthorized: false }
          : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });

      const client = await this.pool.connect();
      console.log('✅ Connected successfully to managed PostgreSQL database.');
      this.isPgConnected = true;

      // Initialize relational schema if server/postgresSchema.sql exists
      try {
        const schemaSqlPath = path.resolve(process.cwd(), 'server/postgresSchema.sql');
        if (fs.existsSync(schemaSqlPath)) {
          const sql = fs.readFileSync(schemaSqlPath, 'utf-8');
          await client.query(sql);
          console.log('✅ PostgreSQL schema verified and up-to-date.');
        }
      } catch (schemaErr) {
        console.warn('PostgreSQL schema verification note:', schemaErr);
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.warn('⚠️ Unable to connect to PostgreSQL (falling back to atomic persistent store):', err.message);
      this.pool = null;
      this.isPgConnected = false;
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure default fallbacks if properties are missing
        return {
          products: parsed.products || DEFAULT_PRODUCTS,
          categories: parsed.categories || DEFAULT_CATEGORIES,
          orders: parsed.orders || DEFAULT_ORDERS,
          coupons: parsed.coupons || DEFAULT_COUPONS,
          reviews: parsed.reviews || DEFAULT_REVIEWS,
          settings: parsed.settings || DEFAULT_SETTINGS,
          users: (parsed.users || DEFAULT_USERS).map((u: any) => ({ ...u, passwordHash: typeof u.passwordHash === 'string' ? u.passwordHash : '' }))
        };
      }
    } catch (e) {
      console.warn('Error reading store database, initializing defaults:', e);
    }

    const initial: DatabaseSchema = {
      products: DEFAULT_PRODUCTS,
      categories: DEFAULT_CATEGORIES,
      orders: DEFAULT_ORDERS,
      coupons: DEFAULT_COUPONS,
      reviews: DEFAULT_REVIEWS,
      settings: DEFAULT_SETTINGS,
      users: DEFAULT_USERS
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const targetData = dataToSave || this.data;
      // Atomic write via unique temporary file then atomic rename to prevent corruption
      const tempFile = path.join(DATA_DIR, `.store.${Date.now()}.${Math.random().toString(36).substring(2, 7)}.tmp`);
      fs.writeFileSync(tempFile, JSON.stringify(targetData, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      console.error('Failed to persist database file:', e);
    }
  }

  // --- PRODUCTS ---
  public getProducts(query?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    fabric?: string;
    featured?: boolean;
    status?: string;
    sort?: string;
  }): Product[] {
    let result = [...this.data.products];

    if (query) {
      if (query.status) {
        result = result.filter(p => p.status === query.status);
      } else {
        // default to active for public catalog
        result = result.filter(p => p.status === 'active');
      }

      if (query.category) {
        result = result.filter(
          p => p.categoryId === query.category || p.categoryName.toLowerCase() === query.category.toLowerCase()
        );
      }

      if (query.fabric) {
        result = result.filter(p => p.fabric.toLowerCase().includes(query.fabric!.toLowerCase()));
      }

      if (query.featured !== undefined) {
        result = result.filter(p => p.isFeatured === query.featured);
      }

      if (query.minPrice !== undefined) {
        result = result.filter(p => (p.salePrice || p.price) >= query.minPrice!);
      }

      if (query.maxPrice !== undefined) {
        result = result.filter(p => (p.salePrice || p.price) <= query.maxPrice!);
      }

      if (query.search) {
        const q = query.search.toLowerCase().trim();
        result = result.filter(
          p =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.fabric.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.categoryName.toLowerCase().includes(q)
        );
      }

      if (query.sort) {
        if (query.sort === 'price-asc') {
          result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        } else if (query.sort === 'price-desc') {
          result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        } else if (query.sort === 'newest') {
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (query.sort === 'rating') {
          result.sort((a, b) => b.rating - a.rating);
        }
      }
    }

    return result;
  }

  public getAllProductsAdmin(): Product[] {
    return this.data.products;
  }

  public getProductByIdOrSlug(identifier: string): Product | undefined {
    return this.data.products.find(p => p.id === identifier || p.slug === identifier);
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.saveData();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.products[index] = {
      ...this.data.products[index],
      ...updates
    };
    this.saveData();
    return this.data.products[index];
  }

  public deleteProduct(id: string): boolean {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    // Soft delete or remove
    this.data.products.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.data.categories.filter(c => c.isActive);
  }

  public getAllCategoriesAdmin(): Category[] {
    return this.data.categories;
  }

  public addCategory(cat: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now().toString(36)}`
    };
    this.data.categories.push(newCat);
    this.saveData();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.categories[index] = { ...this.data.categories[index], ...updates };
    this.saveData();
    return this.data.categories[index];
  }

  public deleteCategory(id: string): boolean {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.data.categories.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- ORDERS ---
  public getOrders(filters?: { status?: string; phone?: string; email?: string; userId?: string }): Order[] {
    let result = [...this.data.orders];
    if (filters?.status) {
      result = result.filter(o => o.orderStatus === filters.status);
    }
    if (filters?.phone) {
      result = result.filter(o => o.customerPhone.includes(filters.phone!));
    }
    if (filters?.email) {
      result = result.filter(o => o.customerEmail.toLowerCase() === filters.email!.toLowerCase());
    }
    if (filters?.userId) {
      result = result.filter(o => o.userId === filters.userId);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderByIdOrNumber(identifier: string): Order | undefined {
    return this.data.orders.find(o => o.id === identifier || o.orderNumber.toUpperCase() === identifier.toUpperCase());
  }

  public createOrder(orderPayload: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    userId?: string;
    shippingAddress: any;
    items: any[];
    couponCode?: string;
    paymentMethod: 'cod' | 'jazzcash' | 'easypaisa' | 'raast';
    notes?: string;
  }): { order: Order; error?: string } {
    // 1. Validate items and compute authoritative server-side prices
    let subtotal = 0;
    const validatedItems: any[] = [];

    for (const item of orderPayload.items) {
      const product = this.data.products.find(p => p.id === item.productId);
      if (!product) {
        return { order: null as any, error: `Product not found: ${item.title || item.productId}` };
      }
      if (product.stock < item.quantity) {
        return { order: null as any, error: `Insufficient stock for '${product.title}'. Only ${product.stock} left.` };
      }

      const unitPrice = product.salePrice || product.price;
      subtotal += unitPrice * item.quantity;

      validatedItems.push({
        productId: product.id,
        title: product.title,
        price: unitPrice,
        quantity: item.quantity,
        size: item.size || 'M',
        color: item.color || product.colors[0] || 'Default',
        stitching: item.stitching || 'ready_to_wear',
        image: product.images[0]
      });

      // Deduct stock safely
      product.stock -= item.quantity;
    }

    // 2. Validate coupon if provided
    let discountAmount = 0;
    let validCouponCode = undefined;
    if (orderPayload.couponCode) {
      const coupon = this.data.coupons.find(
        c => c.code.toUpperCase() === orderPayload.couponCode!.toUpperCase() && c.isActive
      );
      if (coupon && subtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        coupon.timesUsed += 1;
        validCouponCode = coupon.code;
      }
    }

    // 3. Compute shipping
    const shippingFee = subtotal >= this.data.settings.freeShippingThreshold ? 0 : this.data.settings.flatShippingFee;
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    // 4. Generate unique Pakistani order number
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ZQ-${randomSuffix}`;

    const newOrder: Order = {
      id: `ord-${Date.now().toString(36)}-${randomSuffix}`,
      userId: orderPayload.userId,
      orderNumber,
      customerName: orderPayload.customerName,
      customerEmail: orderPayload.customerEmail,
      customerPhone: orderPayload.customerPhone,
      shippingAddress: orderPayload.shippingAddress,
      items: validatedItems,
      subtotal,
      shippingFee,
      discountAmount,
      couponCode: validCouponCode,
      totalAmount,
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: orderPayload.paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'pending',
      notes: orderPayload.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.orders.unshift(newOrder);
    this.saveData();

    return { order: newOrder };
  }

  public updateOrderStatus(
    id: string,
    updates: {
      orderStatus?: Order['orderStatus'];
      paymentStatus?: Order['paymentStatus'];
      courierDetails?: Order['courierDetails'];
    }
  ): Order | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;

    if (updates.orderStatus) {
      // If cancelling an active order, restore item stock to inventory
      if (updates.orderStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
        for (const item of order.items) {
          const prod = this.data.products.find(p => p.id === item.productId);
          if (prod) {
            prod.stock += item.quantity;
          }
        }
      } else if (order.orderStatus === 'cancelled' && updates.orderStatus !== 'cancelled') {
        // If re-activating a cancelled order, re-deduct item stock
        for (const item of order.items) {
          const prod = this.data.products.find(p => p.id === item.productId);
          if (prod) {
            prod.stock = Math.max(0, prod.stock - item.quantity);
          }
        }
      }
      order.orderStatus = updates.orderStatus;
    }
    if (updates.paymentStatus) order.paymentStatus = updates.paymentStatus;
    if (updates.courierDetails) {
      order.courierDetails = {
        ...order.courierDetails,
        ...updates.courierDetails
      };
    }
    order.updatedAt = new Date().toISOString();
    this.saveData();
    return order;
  }

  // --- COUPONS ---
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; discountAmount: number; message: string; coupon?: Coupon } {
    const coupon = this.data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
    if (!coupon) {
      return { valid: false, discountAmount: 0, message: 'Invalid or expired promotional code.' };
    }

    const now = new Date();
    if (new Date(coupon.expiryDate) < now) {
      return { valid: false, discountAmount: 0, message: 'This coupon code has expired.' };
    }

    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimum order of Rs. ${coupon.minOrderAmount.toLocaleString()} required for this coupon.`
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return {
      valid: true,
      discountAmount: discount,
      message: `Coupon '${coupon.code}' applied successfully! Savings: Rs. ${discount.toLocaleString()}`,
      coupon
    };
  }

  public addCoupon(coupon: Omit<Coupon, 'id' | 'timesUsed'>): Coupon {
    const newCoupon: Coupon = {
      ...coupon,
      id: `coup-${Date.now().toString(36)}`,
      timesUsed: 0
    };
    this.data.coupons.push(newCoupon);
    this.saveData();
    return newCoupon;
  }

  public deleteCoupon(id: string): boolean {
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.coupons.splice(idx, 1);
    this.saveData();
    return true;
  }

  // --- REVIEWS ---
  public getReviewsByProductId(productId: string): Review[] {
    return this.data.reviews.filter(r => r.productId === productId && r.status === 'approved');
  }

  public addReview(review: Omit<Review, 'id' | 'date' | 'status'>): Review {
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now().toString(36)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'approved'
    };
    this.data.reviews.push(newReview);

    // Update product rating
    const product = this.data.products.find(p => p.id === review.productId);
    if (product) {
      const approvedReviews = this.data.reviews.filter(r => r.productId === review.productId && r.status === 'approved');
      const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
      product.rating = Number((sum / approvedReviews.length).toFixed(1));
      product.reviewsCount = approvedReviews.length;
    }

    this.saveData();
    return newReview;
  }

  // --- SETTINGS ---
  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveData();
    return this.data.settings;
  }

  // --- USERS / AUTH ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: { name: string; email: string; phone?: string; role?: 'admin' | 'customer'; passwordHash: string }): User {
    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: userData.name,
      email: userData.email,
      passwordHash: userData.passwordHash,
      phone: userData.phone,
      role: userData.role || 'customer',
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  public getAnalytics() {
    const orders = this.data.orders;
    const totalSales = orders.reduce((sum, o) => (o.paymentStatus === 'paid' || o.orderStatus === 'delivered' ? sum + o.totalAmount : sum), 0);
    const pendingOrders = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'confirmed').length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;
    const totalProducts = this.data.products.length;
    const lowStockProducts = this.data.products.filter(p => p.stock < 10);

    // City distribution
    const cityBreakdown: Record<string, number> = {};
    orders.forEach(o => {
      const c = o.shippingAddress?.city || 'Other';
      cityBreakdown[c] = (cityBreakdown[c] || 0) + 1;
    });

    // Payment method breakdown
    const paymentMethodBreakdown: Record<string, number> = {
      cod: 0,
      jazzcash: 0,
      easypaisa: 0,
      raast: 0
    };
    orders.forEach(o => {
      if (paymentMethodBreakdown[o.paymentMethod] !== undefined) {
        paymentMethodBreakdown[o.paymentMethod]++;
      }
    });

    return {
      totalSales,
      totalOrders: orders.length,
      pendingOrders,
      deliveredOrders,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      cityBreakdown,
      paymentMethodBreakdown,
      recentOrders: orders.slice(0, 5)
    };
  }
}

export const db = new Database();
