import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { CartItem } from '../types';
import { validateCoupon } from '../services/api';
import { getSafeImageUrl, handleImageError } from '../utils/imageFallback';
import { LUXURY_EASE } from '../utils/motion';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: (appliedCouponCode?: string, discountAmount?: number) => void;
  freeShippingThreshold: number;
  flatShippingFee: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  freeShippingThreshold,
  flatShippingFee
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
    0
  );

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : flatShippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await validateCoupon(couponInput.trim(), subtotal);
      if (res.valid) {
        setAppliedCoupon(couponInput.trim().toUpperCase());
        setDiscountAmount(res.discountAmount);
        setCouponSuccess(res.message);
      } else {
        setCouponError(res.message);
      }
    } catch (err: any) {
      setCouponError('Unable to apply coupon. Please check network.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput('');
    setCouponSuccess(null);
    setCouponError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: LUXURY_EASE }}
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.45, ease: LUXURY_EASE }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#faf8f5] shadow-2xl flex flex-col h-full border-l border-[#e7dfd5]">
        {/* Cart Header */}
        <div className="p-5 border-b border-[#e7dfd5] flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#b38f48]" />
            <h3 className="font-serif text-lg font-medium text-[#1c1917] tracking-wide">
              Your Atelier Bag ({cartItems.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            id="close-cart-drawer-btn"
            className="p-1.5 text-[#5e554b] hover:text-[#1c1917] hover:bg-[#eee7de] rounded-full transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#f2ece2] px-5 py-3 border-b border-[#e7dfd5] text-xs">
          {amountNeededForFreeShipping > 0 ? (
            <div>
              <p className="text-[#5e554b]">
                Add <span className="font-semibold text-[#1c1917]">Rs. {amountNeededForFreeShipping.toLocaleString()}</span> more for <span className="text-[#b38f48] font-bold">Complimentary Express Shipping</span> across Pakistan!
              </p>
              <div className="w-full bg-[#dcd3c5] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#b38f48] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-[#3e6844] font-medium flex items-center space-x-1.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>You have unlocked Complimentary Express Delivery!</span>
            </p>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#eee7de] flex items-center justify-center text-[#8c8276]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-serif text-lg text-[#1c1917]">Your shopping bag is empty</p>
              <p className="text-xs text-[#71685e] max-w-xs mx-auto">
                Explore our festive pret, embroidered unstitched silks, and royal kurtas to find your heirloom piece.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-[#1c1917] text-white text-xs uppercase tracking-widest rounded-xs hover:bg-[#c5a059] hover:text-[#1c1917] transition-colors cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const itemPrice = item.salePrice || item.price;
              return (
                <div
                  key={item.cartItemId}
                  id={`cart-item-${item.cartItemId}`}
                  className="flex space-x-4 p-3 bg-white border border-[#e7dfd5] rounded-xs relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 shrink-0 overflow-hidden rounded-xs bg-[#eee7de]">
                    <img
                      src={getSafeImageUrl(item.image)}
                      alt={item.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover object-[center_top]"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-serif font-medium text-[#1c1917] line-clamp-1 pr-4">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.cartItemId)}
                          className="text-[#8c8276] hover:text-[#8c2a3e] p-1 cursor-pointer transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#71685e] mt-1 space-x-2">
                        <span>Size: <strong className="text-[#1c1917]">{item.size}</strong></span>
                        {item.color && <span>Color: <strong>{item.color}</strong></span>}
                      </div>

                      <div className="text-[10px] text-[#b38f48] mt-0.5 font-medium">
                        {item.stitching === 'custom_tailored' ? 'Bespoke Made-to-Measure' : 'Ready-to-Wear'}
                      </div>
                    </div>

                    {/* Quantity controls & Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#e7dfd5] rounded-xs">
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs hover:bg-[#eee7de] cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                          disabled={item.quantity >= item.stockAvailable}
                          className="w-6 h-6 flex items-center justify-center text-xs hover:bg-[#eee7de] disabled:opacity-30 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-serif font-semibold text-[#1c1917]">
                        Rs. {(itemPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Footer / Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-[#e7dfd5] bg-[#faf8f5] space-y-3">
            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-[#f0f7f1] border border-[#a3d1aa] rounded-xs text-xs">
                  <div className="flex items-center space-x-2 text-[#2d6635]">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{appliedCoupon}</strong> (-Rs. {discountAmount.toLocaleString()})</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[#8c2a3e] hover:underline text-[11px] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. EID2026)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-[#e7dfd5] rounded-xs uppercase tracking-wider focus:outline-none focus:border-[#b38f48] bg-white"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="px-4 py-2 bg-[#2d2823] text-white text-xs uppercase tracking-wider rounded-xs hover:bg-[#b38f48] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-[#8c2a3e] mt-1">{couponError}</p>}
              {couponSuccess && <p className="text-[11px] text-[#3e6844] mt-1">{couponSuccess}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-[#5e554b] pt-2 border-t border-[#e7dfd5]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#3e6844]">
                  <span>Promotional Discount</span>
                  <span>-Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Nationwide Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-[#3e6844]">FREE</strong> : `Rs. ${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-serif font-bold text-[#1c1917] pt-2 border-t border-[#e7dfd5]">
                <span>Total Amount (PKR)</span>
                <span>Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => onProceedToCheckout(appliedCoupon || undefined, discountAmount)}
              id="proceed-to-checkout-btn"
              className="w-full py-4 bg-[#c5a059] hover:bg-[#b38f48] text-[#1c1917] font-semibold text-xs uppercase tracking-[0.2em] rounded-xs transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-[#8c8276]">
              Cash on Delivery & Secure Pakistani Gateways available at checkout
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
