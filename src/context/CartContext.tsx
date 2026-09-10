import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Coupon } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  totalItemsCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('zauq_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('zauq_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('zauq_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('zauq_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('zauq_coupon');
      }
    } catch (err) {
      console.error('Failed to save coupon to localStorage', err);
    }
  }, [appliedCoupon]);

  const addToCart = (newItem: Omit<CartItem, 'cartItemId'>) => {
    const cartItemId = `${newItem.productId}-${newItem.size}-${newItem.color}-${newItem.stitching}`;
    
    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        const newQty = Math.min(existing.quantity + newItem.quantity, newItem.stockAvailable);
        return prev.map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { ...newItem, cartItemId }];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.stockAvailable) return item; // stock limit
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const subtotal = cart.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to apply coupon' };
      }

      setAppliedCoupon({
        id: 'cp-' + code,
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: 0,
        expiryDate: '',
        usageLimit: 1000,
        timesUsed: 0,
        isActive: true,
      });

      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: 'Network error validating coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscountAmount && discountAmount > appliedCoupon.maxDiscountAmount) {
        discountAmount = appliedCoupon.maxDiscountAmount;
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  // Free delivery across Pakistan over Rs. 5,000, otherwise Rs. 250
  const shippingFee = cart.length === 0 ? 0 : subtotal >= 5000 ? 0 : 250;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        shippingFee,
        total,
        totalItemsCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
