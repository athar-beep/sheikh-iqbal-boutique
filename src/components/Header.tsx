import React, { useState } from 'react';
import { ShoppingBag, Search, Sparkles, User, ShieldCheck, Menu, X, Heart, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenStylist: () => void;
  onOpenSearch: () => void;
  onSelectCategory: (categorySlug: string) => void;
  activeCategory: string;
  onNavigate: (view: 'store' | 'admin' | 'orders' | 'checkout') => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStylist,
  onOpenSearch,
  onSelectCategory,
  activeCategory,
  onNavigate,
  currentView,
}) => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { user, isAdmin, logout, login } = useAuth();
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'All Collections', slug: 'all' },
    { label: 'Luxury Pret', slug: 'luxury-pret' },
    { label: 'Festive Formals', slug: 'festive-formals' },
    { label: 'Festive Unstitched', slug: 'festive-unstitched' },
    { label: 'Bridal Couture', slug: 'bridal-couture' },
    { label: 'Men’s Sartorial', slug: 'mens-sartorial' },
    { label: 'Heirloom Shawls', slug: 'heirloom-shawls' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e7dfd5]">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#1c1917] text-[#e7dfd5] text-xs py-1.5 sm:py-2 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#d4af37] animate-pulse shrink-0"></span>
            <span className="sm:hidden font-medium tracking-wide text-[10.5px]">
              Festive ’26 · Free Express Shipping &gt; Rs. 5,000 · COD Nationwide
            </span>
            <span className="hidden sm:inline font-medium tracking-wide">
              Festive Collection ’26 Live — Free Express Delivery across Pakistan on orders over Rs. 5,000 | Cash on Delivery (COD) Available
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[#c7bcaf]">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-1.5 hover:text-[#d4af37] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp Concierge: [WHATSAPP NUMBER]</span>
            </a>
            <span className="text-[#574e45]">|</span>
            <span className="tracking-widest text-[#d4af37] font-semibold">PKR (₨)</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN BRAND HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu Toggle */}
          <button
            id="btn-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#292524] hover:text-[#d4af37] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo & Royal Title */}
          <button
            id="btn-brand-logo-home"
            onClick={() => {
              onNavigate('store');
              onSelectCategory('all');
            }}
            className="text-left flex flex-col items-start focus:outline-none group"
          >
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.1em] text-[#1c1917] group-hover:text-[#9e7d23] transition-colors uppercase">
                Sheikh Iqbal
              </span>
              <span className="font-urdu text-base sm:text-lg text-[#b8932b] font-normal" dir="rtl">
                شیخ اقبال
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-[0.22em] text-[#78716c] uppercase font-medium">
              Cloth &amp; Boutique Centre
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map(link => {
              const isActive = currentView === 'store' && activeCategory === link.slug;
              return (
                <button
                  key={link.slug}
                  id={`nav-link-${link.slug}`}
                  onClick={() => {
                    onNavigate('store');
                    onSelectCategory(link.slug);
                  }}
                  className={`text-xs uppercase tracking-[0.15em] font-medium py-1 relative transition-colors ${
                    isActive ? 'text-[#b8932b] font-semibold' : 'text-[#44403c] hover:text-[#1c1917]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#d4af37]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Luxury Stylist Button */}
            <button
              id="btn-trigger-ai-stylist"
              onClick={onOpenStylist}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#1c1917] to-[#292524] text-[#e7dfd5] hover:text-[#d4af37] border border-[#d4af37]/40 shadow-sm text-xs font-medium transition-all hover:scale-105 active:scale-95"
              title="Consult AI Luxury Stylist with High Thinking"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">AI Stylist</span>
            </button>

            {/* Search Button */}
            <button
              id="btn-header-search"
              onClick={onOpenSearch}
              className="p-2 text-[#44403c] hover:text-[#1c1917] hover:bg-[#ede7df] rounded-full transition-colors"
              title="Search collection"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Switch / Profile */}
            {isAdmin ? (
              <button
                id="btn-nav-admin-dashboard"
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  currentView === 'admin'
                    ? 'bg-[#1c1917] text-[#d4af37] border-[#d4af37]'
                    : 'bg-[#ede7df] text-[#1c1917] border-[#d1c7bc] hover:bg-[#e0d6c9]'
                }`}
                title="Admin Management Panel"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#b8932b]" />
                <span className="hidden md:inline">Admin Panel</span>
              </button>
            ) : (
              <button
                id="btn-quick-admin-login"
                onClick={() => { setAdminLoginOpen(true); setAdminLoginError(''); }}
                className="hidden sm:flex items-center gap-1 text-xs text-[#78716c] hover:text-[#1c1917] px-2 py-1 rounded hover:bg-[#ede7df] transition-colors"
                title="Owner / Admin Portal Demo Login"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}

            {/* Cart Slideover Trigger */}
            <button
              id="btn-cart-drawer-trigger"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#1c1917] hover:text-[#9e7d23] hover:bg-[#ede7df] rounded-full transition-colors"
              aria-label="Open shopping bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-black bg-[#d4af37] rounded-full ring-2 ring-[#faf8f5]">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {adminLoginOpen && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAdminLoginOpen(false)}>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setAdminLoginError('');
              const result = await login(adminEmail, adminPassword);
              if (result.success) {
                setAdminPassword('');
                setAdminLoginOpen(false);
                onNavigate('admin');
              } else {
                setAdminLoginError(result.error || 'Invalid admin credentials.');
              }
            }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-[#faf8f5] border border-[#d4af37]/40 shadow-2xl p-6 space-y-4"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9e7d23]">Sheikh Iqbal</p>
              <h2 className="font-serif text-2xl font-bold text-[#1c1917]">Director Access</h2>
            </div>
            <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} type="email" autoComplete="username" required placeholder="Admin email" className="w-full px-3 py-2.5 rounded-lg border border-[#d6cec3] bg-white text-sm outline-none focus:ring-2 focus:ring-[#d4af37]/40" />
            <input value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} type="password" autoComplete="current-password" required placeholder="Password" className="w-full px-3 py-2.5 rounded-lg border border-[#d6cec3] bg-white text-sm outline-none focus:ring-2 focus:ring-[#d4af37]/40" />
            {adminLoginError && <p className="text-xs text-red-700">{adminLoginError}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setAdminLoginOpen(false)} className="px-4 py-2 rounded-lg text-xs font-semibold text-[#57534e] hover:bg-[#ede7df]">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-[#1c1917] text-[#d4af37] text-xs font-semibold hover:bg-black">Sign In</button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1c1917] text-[#faf8f5] border-b border-[#d4af37]/30 px-4 py-5 space-y-3 shadow-2xl animate-fadeIn">
          {/* Quick AI Stylist bar on Mobile */}
          <button
            onClick={() => {
              onOpenStylist();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-[#292524] to-[#1c1917] border border-[#d4af37]/50 text-[#e9d69e] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-spin" style={{ animationDuration: '6s' }} />
            <span>Consult AI Luxury Stylist</span>
          </button>

          <div className="space-y-1 pt-1">
            {navLinks.map(link => {
              const isActive = currentView === 'store' && activeCategory === link.slug;
              return (
                <button
                  key={link.slug}
                  onClick={() => {
                    onNavigate('store');
                    onSelectCategory(link.slug);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between w-full text-left py-2.5 px-3 rounded-md text-xs tracking-[0.15em] uppercase font-medium transition-colors ${
                    isActive
                      ? 'bg-[#292524] text-[#d4af37] font-semibold border-l-2 border-[#d4af37]'
                      : 'text-[#d1c7bc] hover:bg-[#292524] hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2 text-xs text-[#a8a29e]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#e9d69e]">
                <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>WhatsApp: [WHATSAPP NUMBER]</span>
              </span>
              <span className="text-[#d4af37] font-bold">PKR (₨)</span>
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span>Helpline: [PHONE NUMBER]</span>
              <button
                onClick={() => {
                  setAdminLoginOpen(true); setAdminLoginError(''); setMobileMenuOpen(false);
                  setMobileMenuOpen(false);
                }}
                className="text-[#d4af37] font-semibold underline hover:text-[#e9d69e]"
              >
                Admin Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
