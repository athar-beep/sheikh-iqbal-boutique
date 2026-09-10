export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  fabric: string;
  embroideryWork: string;
  pieceCount: string; // e.g. "3-Piece Stitched", "2-Piece Stitched", "3-Piece Unstitched"
  images: string[];
  sizes: ('XS' | 'S' | 'M' | 'L' | 'XL' | 'Custom')[];
  colors: string[];
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  status: 'active' | 'draft' | 'archived';
  weightKg?: number;
  dimensionsCm?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  isActive: boolean;
  productCount?: number;
}

export interface CartItem {
  cartItemId: string; // generated unique id (productId + size + color + stitching)
  productId: string;
  title: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string;
  size: string;
  color: string;
  stitching: 'ready_to_wear' | 'custom_tailored';
  customMeasurements?: {
    chest?: number;
    waist?: number;
    hip?: number;
    shirtLength?: number;
    trouserLength?: number;
  };
  quantity: number;
  stockAvailable: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string; // Pakistani phone format (03XXXXXXXXX)
  email: string;
  streetAddress: string;
  apartmentSuite?: string;
  city: string;
  province: string; // Punjab, Sindh, KPK, Balochistan, Islamabad Capital Territory, AJK, GB
  postalCode?: string;
  nearbyLandmark?: string;
  deliveryInstructions?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  stitching: string;
  image: string;
}

export interface Order {
  id: string;
  userId?: string;
  orderNumber: string; // e.g. "ZQ-98241"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: 'cod' | 'jazzcash' | 'easypaisa' | 'raast';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  courierDetails?: {
    courierName: string; // e.g. "TCS Express", "Leopards Courier", "Trax Logistics"
    trackingNumber: string;
    trackingUrl?: string;
    shippedAt?: string;
    estimatedDelivery?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  city: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  storeAddress: string;
  city: string;
  currency: string;
  freeShippingThreshold: number;
  flatShippingFee: number;
  expressDeliveryFee: number;
  codEnabled: boolean;
  codAdvanceVerification: boolean;
  jazzcashEnabled: boolean;
  easypaisaEnabled: boolean;
  raastEnabled: boolean;
  raastIban: string;
  announcementText: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: 'admin' | 'customer';
  addresses?: ShippingAddress[];
  createdAt: string;
}
