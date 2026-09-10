import { Product, Category, Order, Coupon, Review, StoreSettings, User } from '../types';

const API_BASE = '/api';

export function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('zauq_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  fabric?: string;
  featured?: boolean;
  sort?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
  if (params?.fabric) query.append('fabric', params.fabric);
  if (params?.featured !== undefined) query.append('featured', params.featured.toString());
  if (params?.sort) query.append('sort', params.sort);

  const res = await fetch(`${API_BASE}/products?${query.toString()}`);
  const data = await res.json();
  return data.products || [];
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products/admin`, { headers: getAuthHeaders() });
  const data = await res.json();
  return data.products || [];
}

export async function fetchProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  const res = await fetch(`${API_BASE}/products/${idOrSlug}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.product || null;
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(product)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create product');
  return data.product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update product');
  return data.product;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete product');
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  const data = await res.json();
  return data.categories || [];
}

export async function createCategory(cat: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cat)
  });
  const data = await res.json();
  return data.category;
}

export async function fetchOrders(filter?: { phone?: string; email?: string }): Promise<Order[]> {
  const query = new URLSearchParams();
  if (filter?.phone) query.append('phone', filter.phone);
  if (filter?.email) query.append('email', filter.email);

  const res = await fetch(`${API_BASE}/orders?${query.toString()}`, { headers: getAuthHeaders() });
  const data = await res.json();
  return data.orders || [];
}

export async function fetchMyOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/account/orders`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load your orders');
  return data.orders || [];
}

export async function fetchOrderByIdOrNumber(idOrNumber: string): Promise<Order | null> {
  const res = await fetch(`${API_BASE}/orders/${idOrNumber}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.order || null;
}

export async function createOrder(payload: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: any;
  items: any[];
  couponCode?: string;
  paymentMethod: string;
  notes?: string;
}): Promise<{ order: Order; payment?: any }> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to place order');
  return data;
}

export async function updateOrderStatus(
  id: string,
  updates: {
    orderStatus?: Order['orderStatus'];
    paymentStatus?: Order['paymentStatus'];
    courierDetails?: Order['courierDetails'];
  }
): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update order');
  return data.order;
}

export async function validateCoupon(code: string, subtotal: number) {
  const res = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal })
  });
  return await res.json();
}

export async function fetchCoupons(): Promise<Coupon[]> {
  const res = await fetch(`${API_BASE}/coupons`);
  const data = await res.json();
  return data.coupons || [];
}

export async function createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  const res = await fetch(`${API_BASE}/coupons`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(coupon)
  });
  const data = await res.json();
  return data.coupon;
}

export async function deleteCoupon(id: string): Promise<void> {
  await fetch(`${API_BASE}/coupons/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  const res = await fetch(`${API_BASE}/reviews/${productId}`);
  const data = await res.json();
  return data.reviews || [];
}

export async function submitReview(review: {
  productId: string;
  customerName: string;
  city?: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit review');
  return data.review;
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  const data = await res.json();
  return data.settings;
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings)
  });
  const data = await res.json();
  return data.settings;
}

export async function fetchAdminAnalytics() {
  const res = await fetch(`${API_BASE}/admin/analytics`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  return data.analytics;
}

export async function requestStylistConsultation(payload: {
  occasion: string;
  budgetPkr?: number;
  preferredFabric?: string;
  gender?: string;
  cityOrClimate?: string;
  userQuery: string;
}) {
  const res = await fetch(`${API_BASE}/ai/stylist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Stylist consultation unavailable');
  return data.consultation;
}
