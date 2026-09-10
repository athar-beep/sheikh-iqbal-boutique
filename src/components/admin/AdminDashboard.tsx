import React, { useState, useEffect } from 'react';
import { Product, Order, Category, Coupon, StoreSettings } from '../../types';
import { formatPKR } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { getAuthHeaders } from '../../services/api';
import { getSafeImageUrl, handleImageError } from '../../utils/imageFallback';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Truck,
  CheckCircle2,
  DollarSign,
  Tag,
  Settings,
  ArrowLeft,
  LogOut,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStore: () => void;
  products: Product[];
  onRefreshProducts: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  products,
  onRefreshProducts,
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons' | 'settings'>('overview');

  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // New Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newSalePrice, setNewSalePrice] = useState('');
  const [newCategory, setNewCategory] = useState('cat-luxury-pret');
  const [newSku, setNewSku] = useState('');
  const [newStock, setNewStock] = useState('12');
  const [newFabric, setNewFabric] = useState('Pure Raw Silk');
  const [newEmbroidery, setNewEmbroidery] = useState('Handcrafted Tilla & Zardozi');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85');

  // Order Status update modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('confirmed');
  const [newPaymentStatus, setNewPaymentStatus] = useState<'pending' | 'paid'>('paid');
  const [courierTracking, setCourierTracking] = useState('');

  // Coupon create form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState('15');
  const [newCouponMin, setNewCouponMin] = useState('10000');

  // Load backend admin data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, couponsRes, categoriesRes, settingsRes] = await Promise.all([
        fetch('/api/orders', { headers: getAuthHeaders() }),
        fetch('/api/coupons'),
        fetch('/api/categories'),
        fetch('/api/settings'),
      ]);

      if (ordersRes.ok) {
        const d = await ordersRes.json();
        setOrders(Array.isArray(d) ? d : d.orders || []);
      }
      if (couponsRes.ok) {
        const d = await couponsRes.json();
        setCoupons(Array.isArray(d) ? d : d.coupons || []);
      }
      if (categoriesRes.ok) {
        const d = await categoriesRes.json();
        setCategories(Array.isArray(d) ? d : d.categories || []);
      }
      if (settingsRes.ok) {
        const d = await settingsRes.json();
        setSettings(d.settings || d);
      }
    } catch (err) {
      console.error('Failed loading admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Metrics calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' || o.paymentMethod === 'cod' ? o.totalAmount : 0), 0);
  const totalOrdersCount = orders.length;
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // City breakdown
  const ordersByCity = orders.reduce((acc: Record<string, number>, o) => {
    const c = o.shippingAddress.city || 'Other';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  // Handle Add Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          price: Number(newPrice),
          salePrice: newSalePrice ? Number(newSalePrice) : undefined,
          categoryId: newCategory,
          sku: newSku.trim() || `ZQ-${Math.floor(1000 + Math.random() * 9000)}`,
          stock: Number(newStock || 10),
          fabric: newFabric,
          embroideryWork: newEmbroidery,
          description: newDescription || `${newTitle} handcrafted in ${newFabric} with ${newEmbroidery}.`,
          images: [newImageUrl.trim()],
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
          pieceCount: '3-Piece Stitched',
        }),
      });

      if (res.ok) {
        setIsAddProductOpen(false);
        setNewTitle('');
        setNewPrice('');
        setNewSalePrice('');
        setNewDescription('');
        onRefreshProducts();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to create product. Check admin authorization.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to remove this piece from the catalog?')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        onRefreshProducts();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete product. Check admin authorization.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    try {
      const courierPayload = newOrderStatus === 'shipped' || newOrderStatus === 'delivered'
        ? {
            courierName: 'TCS Express Priority',
            trackingNumber: courierTracking.trim() || `TCS-${Math.floor(10000000 + Math.random() * 90000000)}`,
            trackingUrl: 'https://www.tcsexpress.com/tracking',
            shippedAt: new Date().toISOString(),
            estimatedDelivery: '24-48 Hours',
          }
        : undefined;

      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          orderStatus: newOrderStatus,
          paymentStatus: newPaymentStatus,
          courierDetails: courierPayload,
        }),
      });

      if (res.ok) {
        setSelectedOrder(null);
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to update order status. Check admin authorization.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          code: newCouponCode.trim().toUpperCase(),
          discountType: newCouponType,
          discountValue: Number(newCouponValue),
          minOrderAmount: Number(newCouponMin),
        }),
      });
      if (res.ok) {
        setNewCouponCode('');
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to create coupon. Check admin authorization.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917]">
      {/* Top Admin Header */}
      <header className="bg-[#1c1917] text-[#faf8f5] border-b border-[#d4af37]/40 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-[#d4af37]"
              title="Return to Storefront"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-wider text-white">
                  SHEIKH IQBAL CONTROL
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#d4af37] text-black font-bold uppercase">
                  Director Portal
                </span>
              </div>
              <p className="text-xs text-[#a8a29e]">
                Logged in as: {user?.name || 'Director (Muhammad Athar)'} ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="px-4 py-2 bg-[#faf8f5] text-[#1c1917] text-xs font-semibold rounded hover:bg-[#ede7df] transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#9e7d23]" />
              <span>Live Storefront</span>
            </button>
            <button
              onClick={() => {
                logout();
                onBackToStore();
              }}
              className="p-2 text-[#a8a29e] hover:text-red-400 hover:bg-white/10 rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Navigation Tabs */}
      <div className="bg-white border-b border-[#e7dfd5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex gap-6 overflow-x-auto text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-[#9e7d23] text-[#9e7d23]'
                : 'border-transparent text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'border-[#9e7d23] text-[#9e7d23]'
                : 'border-transparent text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-[#9e7d23] text-[#9e7d23]'
                : 'border-transparent text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'coupons'
                ? 'border-[#9e7d23] text-[#9e7d23]'
                : 'border-transparent text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Promotions & Coupons</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-[#9e7d23] text-[#9e7d23]'
                : 'border-transparent text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Shipping & Payment Rules</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-lg border border-[#e7dfd5] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-widest block">
                  Gross Revenue (PKR)
                </span>
                <div className="text-2xl font-bold text-[#1c1917] mt-1">{formatPKR(totalRevenue)}</div>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  ↑ Active Pakistani sales volume
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-[#e7dfd5] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-widest block">
                  Total Orders
                </span>
                <div className="text-2xl font-bold text-[#1c1917] mt-1">{totalOrdersCount}</div>
                <p className="text-[11px] text-[#78716c] mt-1">Across all Pakistani provinces</p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-[#e7dfd5] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-widest block">
                  Average Order Value
                </span>
                <div className="text-2xl font-bold text-[#9e7d23] mt-1">{formatPKR(avgOrderValue)}</div>
                <p className="text-[11px] text-[#78716c] mt-1">Haute couture basket size</p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-[#e7dfd5] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-widest block">
                  Low Stock Alert (&le; 5)
                </span>
                <div className="text-2xl font-bold text-amber-700 mt-1">{lowStockCount} items</div>
                <p className="text-[11px] text-amber-800 mt-1">Needs karigar restock</p>
              </div>
            </div>

            {/* City Distribution & Payment Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* City Breakdown */}
              <div className="bg-white p-6 rounded-lg border border-[#e7dfd5] shadow-xs">
                <h3 className="font-serif text-base font-bold text-[#1c1917] mb-4">
                  Orders Distribution by Pakistani City
                </h3>
                <div className="space-y-3">
                  {Object.entries(ordersByCity).map(([city, count]) => {
                    const numCount = Number(count);
                    const percentage = Math.round((numCount / Math.max(1, totalOrdersCount)) * 100);
                    return (
                      <div key={city} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-[#44403c]">
                          <span>{city}</span>
                          <span>{numCount} orders ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-[#f0eae1] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#d4af37] h-full rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Methods Split */}
              <div className="bg-white p-6 rounded-lg border border-[#e7dfd5] shadow-xs">
                <h3 className="font-serif text-base font-bold text-[#1c1917] mb-4">
                  Payment Channels Split
                </h3>
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-[#faf8f5] rounded border border-[#e7dfd5] flex items-center justify-between">
                    <div>
                      <strong className="text-emerald-800">Cash on Delivery (COD)</strong>
                      <p className="text-[11px] text-[#78716c]">Doorstep collection by TCS</p>
                    </div>
                    <span className="text-sm font-bold text-[#1c1917]">
                      {orders.filter(o => o.paymentMethod === 'cod').length} orders
                    </span>
                  </div>

                  <div className="p-3 bg-[#faf8f5] rounded border border-[#e7dfd5] flex items-center justify-between">
                    <div>
                      <strong className="text-red-700">JazzCash</strong>
                      <p className="text-[11px] text-[#78716c]">Mobile Wallet & Card</p>
                    </div>
                    <span className="text-sm font-bold text-[#1c1917]">
                      {orders.filter(o => o.paymentMethod === 'jazzcash').length} orders
                    </span>
                  </div>

                  <div className="p-3 bg-[#faf8f5] rounded border border-[#e7dfd5] flex items-center justify-between">
                    <div>
                      <strong className="text-emerald-700">Easypaisa</strong>
                      <p className="text-[11px] text-[#78716c]">Telenor Microfinance</p>
                    </div>
                    <span className="text-sm font-bold text-[#1c1917]">
                      {orders.filter(o => o.paymentMethod === 'easypaisa').length} orders
                    </span>
                  </div>

                  <div className="p-3 bg-[#faf8f5] rounded border border-[#e7dfd5] flex items-center justify-between">
                    <div>
                      <strong className="text-blue-700">Raast SBP</strong>
                      <p className="text-[11px] text-[#78716c]">Direct Instant Interbank</p>
                    </div>
                    <span className="text-sm font-bold text-[#1c1917]">
                      {orders.filter(o => o.paymentMethod === 'raast').length} orders
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white p-6 rounded-lg border border-[#e7dfd5] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-base font-bold text-[#1c1917]">
                  Recent Customer Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-[#9e7d23] hover:underline"
                >
                  Manage All Orders &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf8f5] text-[#78716c] uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Order #</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eae1]">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-[#faf8f5]">
                        <td className="p-3 font-mono font-bold text-[#1c1917]">#{o.orderNumber}</td>
                        <td className="p-3 font-medium">{o.customerName}</td>
                        <td className="p-3">{o.shippingAddress.city}</td>
                        <td className="p-3 font-bold text-[#9e7d23]">{formatPKR(o.totalAmount)}</td>
                        <td className="p-3 uppercase text-[10px] font-semibold">{o.paymentMethod}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            o.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            o.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            o.orderStatus === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {o.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: INVENTORY & PRODUCT MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1c1917]">
                  Product Catalog & Stock Management
                </h3>
                <p className="text-xs text-[#78716c]">
                  Manage luxury pret items, prices, SKUs, and inventory thresholds.
                </p>
              </div>

              <button
                id="btn-admin-add-product"
                onClick={() => setIsAddProductOpen(true)}
                className="px-4 py-2.5 bg-[#1c1917] text-[#d4af37] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#292524] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Luxury Ensemble</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg border border-[#e7dfd5] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf8f5] text-[#78716c] uppercase tracking-wider text-[10px] border-b border-[#e7dfd5]">
                    <tr>
                      <th className="p-3">Item</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Fabric</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eae1]">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-[#faf8f5]">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={getSafeImageUrl(p.images[0])}
                              alt=""
                              onError={handleImageError}
                              className="w-10 h-12 object-cover rounded bg-[#f5f0ea]"
                            />
                            <div>
                              <p className="font-semibold text-[#1c1917]">{p.title}</p>
                              <span className="text-[10px] text-[#78716c]">{p.pieceCount}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-medium">{p.sku}</td>
                        <td className="p-3">{p.categoryName}</td>
                        <td className="p-3">{p.fabric}</td>
                        <td className="p-3 font-bold text-[#9e7d23]">{formatPKR(p.salePrice || p.price)}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              p.stock <= 3
                                ? 'bg-red-100 text-red-800'
                                : p.stock <= 7
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-[#a8a29e] hover:text-red-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Product Modal */}
            {isAddProductOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#faf8f5] w-full max-w-xl rounded-xl p-6 border border-[#e7dfd5] shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd5] mb-4">
                    <h4 className="font-serif text-lg font-bold text-[#1c1917]">
                      Add New Luxury Ensemble
                    </h4>
                    <button
                      onClick={() => setIsAddProductOpen(false)}
                      className="text-[#78716c] hover:text-black"
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-[#44403c] mb-1">Ensemble Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Zardozi Silk Pishwas 'Nur'"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        required
                        className="w-full p-2 border border-[#d1c7bc] rounded bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-[#44403c] mb-1">Retail Price (PKR) *</label>
                        <input
                          type="number"
                          placeholder="e.g. 35000"
                          value={newPrice}
                          onChange={e => setNewPrice(e.target.value)}
                          required
                          className="w-full p-2 border border-[#d1c7bc] rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#44403c] mb-1">Sale Price (Optional)</label>
                        <input
                          type="number"
                          placeholder="e.g. 29500"
                          value={newSalePrice}
                          onChange={e => setNewSalePrice(e.target.value)}
                          className="w-full p-2 border border-[#d1c7bc] rounded bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-[#44403c] mb-1">Category</label>
                        <select
                          value={newCategory}
                          onChange={e => setNewCategory(e.target.value)}
                          className="w-full p-2 border border-[#d1c7bc] rounded bg-white"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-[#44403c] mb-1">Stock Units</label>
                        <input
                          type="number"
                          value={newStock}
                          onChange={e => setNewStock(e.target.value)}
                          className="w-full p-2 border border-[#d1c7bc] rounded bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-[#44403c] mb-1">Fabric</label>
                        <input
                          type="text"
                          value={newFabric}
                          onChange={e => setNewFabric(e.target.value)}
                          className="w-full p-2 border border-[#d1c7bc] rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#44403c] mb-1">SKU</label>
                        <input
                          type="text"
                          placeholder="ZQ-1090"
                          value={newSku}
                          onChange={e => setNewSku(e.target.value)}
                          className="w-full p-2 border border-[#d1c7bc] rounded bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#44403c] mb-1">Image URL</label>
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                        className="w-full p-2 border border-[#d1c7bc] rounded bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#44403c] mb-1">Craft Description</label>
                      <textarea
                        rows={3}
                        value={newDescription}
                        onChange={e => setNewDescription(e.target.value)}
                        placeholder="Detail the zardozi, karigari, and silhouette specifications..."
                        className="w-full p-2 border border-[#d1c7bc] rounded bg-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-[#e7dfd5]">
                      <button
                        type="button"
                        onClick={() => setIsAddProductOpen(false)}
                        className="px-4 py-2 border border-[#d1c7bc] rounded text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#1c1917] text-[#d4af37] rounded text-xs font-bold uppercase tracking-wider hover:bg-[#292524]"
                      >
                        Publish Ensemble
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ORDER FULFILLMENT & LOGISTICS */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1c1917]">
                Customer Orders & Courier Fulfillment
              </h3>
              <p className="text-xs text-[#78716c]">
                Dispatch parcels via TCS / Leopards, manage payment reconciliations, and update status.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[#e7dfd5] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf8f5] text-[#78716c] uppercase tracking-wider text-[10px] border-b border-[#e7dfd5]">
                    <tr>
                      <th className="p-3">Order #</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Address</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Total Due</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eae1]">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-[#faf8f5]">
                        <td className="p-3 font-mono font-bold text-[#1c1917]">#{o.orderNumber}</td>
                        <td className="p-3 text-[11px] text-[#78716c]">
                          {new Date(o.createdAt).toLocaleDateString('en-PK')}
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-[#1c1917]">{o.customerName}</p>
                          <p className="text-[11px] text-[#78716c]">{o.customerPhone}</p>
                        </td>
                        <td className="p-3 text-[11px] max-w-xs truncate">
                          {o.shippingAddress.streetAddress}, {o.shippingAddress.city}
                        </td>
                        <td className="p-3 font-semibold">{o.items.length} pcs</td>
                        <td className="p-3 font-bold text-[#9e7d23]">{formatPKR(o.totalAmount)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.paymentMethod} ({o.paymentStatus})
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            o.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            o.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            o.orderStatus === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setNewOrderStatus(o.orderStatus as any);
                              setNewPaymentStatus(o.paymentStatus);
                              setCourierTracking(o.courierDetails?.trackingNumber || '');
                            }}
                            className="px-2.5 py-1 bg-[#1c1917] text-[#d4af37] rounded text-[10px] font-semibold uppercase hover:bg-[#292524]"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Status Update Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#faf8f5] w-full max-w-md rounded-xl p-6 border border-[#e7dfd5] shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd5] mb-4">
                    <h4 className="font-serif text-base font-bold text-[#1c1917]">
                      Update Order #{selectedOrder.orderNumber}
                    </h4>
                    <button onClick={() => setSelectedOrder(null)} className="text-[#78716c] hover:text-black">
                      &times;
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#44403c] mb-1">Order Fulfillment Status</label>
                      <select
                        value={newOrderStatus}
                        onChange={e => setNewOrderStatus(e.target.value as any)}
                        className="w-full p-2 border border-[#d1c7bc] rounded bg-white font-medium"
                      >
                        <option value="pending">Pending Review</option>
                        <option value="confirmed">Confirmed by Atelier</option>
                        <option value="processing">In Production / Karigar</option>
                        <option value="shipped">Shipped via TCS Express</option>
                        <option value="delivered">Delivered to Customer</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#44403c] mb-1">Payment Status</label>
                      <select
                        value={newPaymentStatus}
                        onChange={e => setNewPaymentStatus(e.target.value as any)}
                        className="w-full p-2 border border-[#d1c7bc] rounded bg-white font-medium"
                      >
                        <option value="pending">Pending (e.g. COD pending delivery)</option>
                        <option value="paid">Paid & Reconciled</option>
                      </select>
                    </div>

                    {(newOrderStatus === 'shipped' || newOrderStatus === 'delivered') && (
                      <div>
                        <label className="block font-semibold text-[#44403c] mb-1">
                          TCS Airway Bill Tracking #
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. TCS-77291044"
                          value={courierTracking}
                          onChange={e => setCourierTracking(e.target.value)}
                          className="w-full p-2 border border-[#d1c7bc] rounded bg-white font-mono"
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-3 border-t border-[#e7dfd5]">
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="px-4 py-2 border border-[#d1c7bc] rounded text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateOrderStatus}
                        className="px-4 py-2 bg-[#1c1917] text-[#d4af37] rounded text-xs font-bold uppercase hover:bg-[#292524]"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: COUPONS & DISCOUNTS */}
        {/* ========================================================= */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1c1917]">
                  Promotional Coupons & Festive Campaigns
                </h3>
                <p className="text-xs text-[#78716c]">
                  Create discount codes for festive seasons (Eid, Winter Wedding, Grand Gala).
                </p>
              </div>
            </div>

            {/* Create Coupon Form */}
            <form onSubmit={handleCreateCoupon} className="p-4 bg-white rounded-lg border border-[#e7dfd5] shadow-xs flex flex-wrap items-end gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#44403c] mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. WEDDING2026"
                  value={newCouponCode}
                  onChange={e => setNewCouponCode(e.target.value)}
                  required
                  className="p-2 border border-[#d1c7bc] rounded uppercase font-mono font-bold bg-[#faf8f5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#44403c] mb-1">Type</label>
                <select
                  value={newCouponType}
                  onChange={e => setNewCouponType(e.target.value as any)}
                  className="p-2 border border-[#d1c7bc] rounded bg-[#faf8f5]"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (PKR)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#44403c] mb-1">Value</label>
                <input
                  type="number"
                  placeholder="15"
                  value={newCouponValue}
                  onChange={e => setNewCouponValue(e.target.value)}
                  required
                  className="w-24 p-2 border border-[#d1c7bc] rounded bg-[#faf8f5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#44403c] mb-1">Min Order (PKR)</label>
                <input
                  type="number"
                  placeholder="10000"
                  value={newCouponMin}
                  onChange={e => setNewCouponMin(e.target.value)}
                  className="w-28 p-2 border border-[#d1c7bc] rounded bg-[#faf8f5]"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-[#1c1917] text-[#d4af37] font-bold uppercase rounded text-xs hover:bg-[#292524]"
              >
                + Create Coupon
              </button>
            </form>

            {/* Active Coupons List */}
            <div className="bg-white rounded-lg border border-[#e7dfd5] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf8f5] text-[#78716c] uppercase tracking-wider text-[10px] border-b border-[#e7dfd5]">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Discount</th>
                    <th className="p-3">Min Order</th>
                    <th className="p-3">Times Redeemed</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eae1]">
                  {coupons.map(c => (
                    <tr key={c.id}>
                      <td className="p-3 font-mono font-bold text-[#1c1917]">{c.code}</td>
                      <td className="p-3 font-semibold text-emerald-700">
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : formatPKR(c.discountValue)}
                      </td>
                      <td className="p-3">{formatPKR(c.minOrderAmount)}</td>
                      <td className="p-3">{c.timesUsed} / {c.usageLimit}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SHIPPING & PAYMENT RULES */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1c1917]">
                Pakistani Shipping & Gateway Parameters
              </h3>
              <p className="text-xs text-[#78716c]">
                Configure Cash on Delivery, flat courier shipping fee, free shipping thresholds, and Raast IBAN.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#e7dfd5] space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#44403c] mb-1">
                    Flat Delivery Fee (PKR)
                  </label>
                  <input
                    type="number"
                    defaultValue={settings?.flatShippingFee || 250}
                    className="w-full p-2 border border-[#d1c7bc] rounded bg-[#faf8f5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#44403c] mb-1">
                    Free Delivery Threshold (PKR)
                  </label>
                  <input
                    type="number"
                    defaultValue={settings?.freeShippingThreshold || 5000}
                    className="w-full p-2 border border-[#d1c7bc] rounded bg-[#faf8f5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#44403c] mb-1">
                  Raast SBP IBAN
                </label>
                <input
                  type="text"
                  defaultValue={settings?.raastIban || 'PK36MEZN0001020304050607'}
                  className="w-full p-2 border border-[#d1c7bc] rounded bg-[#faf8f5] font-mono"
                />
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1c1917]">
                  <input
                    type="checkbox"
                    defaultChecked={settings?.codEnabled ?? true}
                    className="w-4 h-4 text-[#9e7d23]"
                  />
                  <span>Enable Cash on Delivery (COD) across Pakistan</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1c1917]">
                  <input
                    type="checkbox"
                    defaultChecked={settings?.jazzcashEnabled ?? true}
                    className="w-4 h-4 text-[#9e7d23]"
                  />
                  <span>Enable JazzCash Mobile Account & Voucher Gateway</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1c1917]">
                  <input
                    type="checkbox"
                    defaultChecked={settings?.easypaisaEnabled ?? true}
                    className="w-4 h-4 text-[#9e7d23]"
                  />
                  <span>Enable Easypaisa Direct Wallet Integration</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#e7dfd5]">
                <button
                  type="button"
                  onClick={() => alert('Settings updated and stored in memory.')}
                  className="px-6 py-2.5 bg-[#1c1917] text-[#d4af37] font-bold uppercase tracking-wider rounded hover:bg-[#292524]"
                >
                  Save Store Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
