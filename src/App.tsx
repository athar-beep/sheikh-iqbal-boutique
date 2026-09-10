import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryShowcase } from './components/CategoryShowcase';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutView } from './components/CheckoutView';
import { OrderConfirmationView } from './components/OrderConfirmationView';
import { AiStylistDrawer } from './components/AiStylistDrawer';
import { SearchModal } from './components/SearchModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Footer } from './components/Footer';
import { Product, Category, Order } from './types';

function SheikhIqbalStoreApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Active navigation / view state
  const [currentView, setCurrentView] = useState<'store' | 'checkout' | 'order_confirmation' | 'admin'>('store');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isStylistOpen, setIsStylistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const { isAdmin } = useAuth();

  // Load catalog and categories from backend
  const loadStoreData = async () => {
    try {
      setLoading(true);
      const [prodsRes, catsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      if (prodsRes.ok) {
        const data = await prodsRes.json();
        setProducts(data.products || []);
      }

      if (catsRes.ok) {
        const catsData = await catsRes.json();
        setCategories(Array.isArray(catsData) ? catsData : catsData.categories || []);
      }
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  // Handle category change & scroll to catalog
  const handleSelectCategory = (categorySlug: string) => {
    setActiveCategory(categorySlug);
    setCurrentView('store');
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle successful order creation
  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentView('order_confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] flex flex-col font-sans antialiased selection:bg-[#d4af37] selection:text-black">
      {/* If Admin view is active, render Admin Dashboard directly */}
      {currentView === 'admin' && isAdmin ? (
        <AdminDashboard
          onBackToStore={() => setCurrentView('store')}
          products={products}
          onRefreshProducts={loadStoreData}
        />
      ) : (
        <>
          {/* Main Global Header */}
          <Header
            onOpenStylist={() => setIsStylistOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onSelectCategory={handleSelectCategory}
            activeCategory={activeCategory}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentView={currentView}
          />

          {/* Main Body Switcher */}
          <main className="flex-1">
            {currentView === 'store' && (
              <>
                {/* Hero Showcase with Callouts */}
                <HeroSection
                  onExploreClick={() => {
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onOpenStylist={() => setIsStylistOpen(true)}
                />

                {/* Category Showcase Bento / Carousel */}
                <CategoryShowcase
                  categories={categories}
                  activeCategory={activeCategory}
                  onSelectCategory={handleSelectCategory}
                />

                {/* Interactive Product Catalog */}
                <ProductCatalog
                  products={products}
                  categories={categories}
                  activeCategory={activeCategory}
                  onSelectCategory={handleSelectCategory}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </>
            )}

            {currentView === 'checkout' && (
              <CheckoutView
                onBackToShopping={() => setCurrentView('store')}
                onOrderSuccess={handleOrderSuccess}
              />
            )}

            {currentView === 'order_confirmation' && confirmedOrder && (
              <OrderConfirmationView
                order={confirmedOrder}
                onContinueShopping={() => {
                  setConfirmedOrder(null);
                  setCurrentView('store');
                }}
              />
            )}
          </main>

          {/* Global Footer */}
          <Footer
            onSelectCategory={handleSelectCategory}
            onOpenStylist={() => setIsStylistOpen(true)}
            onNavigateAdmin={() => setCurrentView('admin')}
          />

          {/* Slide-over Cart Drawer */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cart}
            onUpdateQuantity={(cartItemId, newQty) => {
              const item = cart.find((i) => i.cartItemId === cartItemId);
              if (item) updateQuantity(cartItemId, newQty - item.quantity);
            }}
            onRemoveItem={removeFromCart}
            freeShippingThreshold={5000}
            flatShippingFee={250}
            onProceedToCheckout={() => {
              setIsCartOpen(false);
              setCurrentView('checkout');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Product Detail & Custom Tailoring Modal with Exit Transitions */}
          <ProductDetailModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onDirectCheckout={() => {
              setQuickViewProduct(null);
              setCurrentView('checkout');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* AI Stylist Concierge Drawer (Powered by Gemini 3.1 Pro with High Thinking) */}
          <AiStylistDrawer
            isOpen={isStylistOpen}
            onClose={() => setIsStylistOpen(false)}
            products={products}
            onSelectProduct={(prod) => {
              setIsStylistOpen(false);
              setQuickViewProduct(prod);
            }}
          />

          {/* Global Fast Search Modal */}
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            products={products}
            onSelectProduct={(prod) => {
              setIsSearchOpen(false);
              setQuickViewProduct(prod);
            }}
          />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SheikhIqbalStoreApp />
      </CartProvider>
    </AuthProvider>
  );
}
