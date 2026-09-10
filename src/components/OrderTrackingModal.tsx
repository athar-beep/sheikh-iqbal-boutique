import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Truck, CheckCircle2, Clock, Package, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { fetchOrderByIdOrNumber } from '../services/api';
import { LUXURY_EASE } from '../utils/motion';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber
}) => {
  const [query, setQuery] = useState(initialOrderNumber || '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialOrderNumber) {
      setQuery(initialOrderNumber);
      handleSearch(initialOrderNumber);
    }
  }, [isOpen, initialOrderNumber]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetchOrderByIdOrNumber(searchQuery.trim());
      if (res) {
        setOrder(res);
      } else {
        setError(`No order found for "${searchQuery}". Please check your order reference (e.g. ZQ-98241) or phone number.`);
      }
    } catch (err: any) {
      setError('Unable to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'pending', label: 'Order Placed', desc: 'Received at Lahore Atelier' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Verified for tailoring/dispatch' },
    { key: 'shipped', label: 'In Transit', desc: 'Handed to TCS / Leopards Courier' },
    { key: 'delivered', label: 'Delivered', desc: 'Doorstep Delivery' }
  ];

  const getStepIndex = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed':
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: LUXURY_EASE }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.35, ease: LUXURY_EASE }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#faf8f5] w-full max-w-2xl rounded-xs shadow-2xl border border-[#e7dfd5] overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e7dfd5] bg-[#faf8f5] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-[#b38f48]" />
            <h2 className="font-serif text-lg font-medium text-[#1c1917] tracking-wide">
              Track Nationwide Delivery
            </h2>
          </div>
          <button
            onClick={onClose}
            id="close-tracking-modal-btn"
            className="p-1.5 text-[#5e554b] hover:text-[#1c1917] hover:bg-[#eee7de] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex space-x-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Order # (e.g. ZQ-98241) or Phone (03001234567)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#e7dfd5] rounded-xs focus:border-[#b38f48] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-[#1c1917] hover:bg-[#c5a059] hover:text-[#1c1917] text-[#faf8f5] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Locating...' : 'Track'}</span>
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="p-4 bg-[#fdf2f2] border border-[#f5c6cb] rounded-xs text-xs text-[#8c2a3e] flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Order Details & Tracking Journey */}
          {order && (
            <div className="space-y-6 bg-white p-5 border border-[#e7dfd5] rounded-xs">
              {/* Order Meta Bar */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#e7dfd5] text-xs gap-2">
                <div>
                  <span className="text-[#8c8276] uppercase tracking-wider">Order Reference:</span>
                  <p className="font-mono font-bold text-sm text-[#1c1917]">{order.orderNumber}</p>
                </div>
                <div>
                  <span className="text-[#8c8276] uppercase tracking-wider">Payment Method:</span>
                  <p className="font-semibold text-[#1c1917] uppercase">{order.paymentMethod}</p>
                </div>
                <div>
                  <span className="text-[#8c8276] uppercase tracking-wider">Destination:</span>
                  <p className="font-semibold text-[#1c1917]">{order.shippingAddress.city}</p>
                </div>
                <div>
                  <span className="text-[#8c8276] uppercase tracking-wider">Total:</span>
                  <p className="font-serif font-bold text-[#1c1917]">Rs. {order.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Steps Timeline */}
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-[#8c8276] mb-4">
                  Courier Progress Timeline
                </p>

                <div className="grid grid-cols-4 gap-2 text-center relative">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-[#1c1917] text-[#d4af37] ring-2 ring-[#d4af37]'
                              : 'bg-[#eee7de] text-[#8c8276]'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <p className={`text-xs mt-2 font-semibold ${isCurrent ? 'text-[#b38f48]' : 'text-[#1c1917]'}`}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-[#8c8276] hidden sm:block mt-0.5">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier Specific Details */}
              {order.courierDetails && (
                <div className="p-3.5 bg-[#fbf6ed] border border-[#e3d0a6] rounded-xs text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1c1917]">Courier Partner:</span>
                    <span className="font-bold text-[#7a591e]">{order.courierDetails.carrier} Express</span>
                  </div>
                  {order.courierDetails.trackingNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#5e554b]">CN / Tracking #:</span>
                      <span className="font-mono font-bold text-[#1c1917]">{order.courierDetails.trackingNumber}</span>
                    </div>
                  )}
                  {order.courierDetails.estimatedDelivery && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#5e554b]">Estimated Arrival:</span>
                      <span className="font-medium text-[#3e6844]">{order.courierDetails.estimatedDelivery}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Ordered Items preview */}
              <div className="pt-2 border-t border-[#e7dfd5]">
                <p className="text-xs uppercase tracking-wider font-semibold text-[#8c8276] mb-2">
                  Parcel Contents ({order.items.length} items)
                </p>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-[#1c1917]">
                        {item.title} <span className="text-[#8c8276]">({item.size} × {item.quantity})</span>
                      </span>
                      <span className="font-serif font-semibold">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
