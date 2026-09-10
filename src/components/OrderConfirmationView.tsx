import React, { useState } from 'react';
import { Order } from '../types';
import { formatPKR } from '../utils/format';
import { CheckCircle2, Truck, Package, Clock, Phone, MapPin, Printer, ArrowRight, ShieldCheck } from 'lucide-react';
import { getSafeImageUrl, handleImageError } from '../utils/imageFallback';

interface OrderConfirmationViewProps {
  order: Order;
  onContinueShopping: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  onContinueShopping,
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const statusSteps = [
    { key: 'pending', label: 'Order Received' },
    { key: 'confirmed', label: 'Confirmed by Atelier' },
    { key: 'processing', label: 'Karigar Handcrafting' },
    { key: 'shipped', label: 'Dispatched via TCS' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const activeIdx = getStepIndex(currentOrder.orderStatus);


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Celebration Header */}
      <div className="text-center space-y-3 pb-8 border-b border-[#e7dfd5]">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#9e7d23]">
          Mubarak! Order Confirmed · مبارک ہو
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1917]">
          Thank You, {currentOrder.customerName}
        </h1>
        <p className="text-xs sm:text-sm text-[#78716c] max-w-md mx-auto">
          Your order <strong className="text-[#1c1917]">#{currentOrder.orderNumber}</strong> has been received by Sheikh Iqbal Cloth &amp; Boutique Centre.
        </p>

        {currentOrder.paymentMethod === 'cod' ? (
          <div className="inline-block mt-2 px-4 py-1.5 bg-amber-50 border border-amber-300 rounded-full text-amber-900 text-xs font-semibold">
            💵 Cash on Delivery: Please keep <strong>{formatPKR(currentOrder.totalAmount)}</strong> ready for the courier rider.
          </div>
        ) : currentOrder.paymentStatus === 'paid' ? (
          <div className="inline-block mt-2 px-4 py-1.5 bg-emerald-50 border border-emerald-300 rounded-full text-emerald-900 text-xs font-semibold">
            ✅ Payment of {formatPKR(currentOrder.totalAmount)} Received via {currentOrder.paymentMethod.toUpperCase()}
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-xs text-amber-800">
              Payment pending via {currentOrder.paymentMethod.toUpperCase()}. Please complete payment through the provider.
            </p>
          </div>
        )}
      </div>

      {/* Progress Timeline */}
      <div className="py-8 border-b border-[#e7dfd5]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c1917] mb-6 text-center">
          Live Tracking & Handcrafting Status
        </h3>
        <div className="relative flex items-center justify-between max-w-2xl mx-auto">
          {/* Background track */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#e7dfd5] z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#d4af37] z-0 transition-all duration-500"
            style={{ width: `${(activeIdx / (statusSteps.length - 1)) * 100}%` }}
          />

          {statusSteps.map((step, idx) => {
            const isCompleted = idx <= activeIdx;
            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-[#1c1917] text-[#d4af37] ring-4 ring-[#faf8f5]'
                      : 'bg-[#e7dfd5] text-[#78716c]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-[#44403c] mt-2 text-center max-w-[70px] sm:max-w-[100px] leading-tight">
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Courier & Tracking Details */}
      {currentOrder.courierDetails && (
        <div className="my-6 p-4 bg-[#f5f0ea] rounded-lg border border-[#e7dfd5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-[#9e7d23]" />
            <div>
              <p className="font-semibold text-[#1c1917]">{currentOrder.courierDetails.courierName}</p>
              <p className="text-[#78716c]">
                Airway Bill Tracking #: <strong className="text-[#1c1917]">{currentOrder.courierDetails.trackingNumber}</strong>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              Estimated: {currentOrder.courierDetails.estimatedDelivery}
            </span>
          </div>
        </div>
      )}

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 text-xs">
        {/* Ordered Items */}
        <div className="bg-white p-6 rounded-lg border border-[#e7dfd5] space-y-4">
          <h4 className="font-serif text-sm font-bold text-[#1c1917] pb-2 border-b border-[#f0eae1]">
            Purchased Items
          </h4>
          <div className="space-y-3">
            {currentOrder.items.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <img
                  src={getSafeImageUrl(item.image)}
                  alt={item.title}
                  onError={handleImageError}
                  className="w-12 h-16 object-cover object-[center_top] rounded bg-[#faf8f5]"
                />
                <div className="flex-1">
                  <p className="font-semibold text-[#1c1917]">{item.title}</p>
                  <p className="text-[11px] text-[#78716c]">
                    Size: {item.size} · Qty: {item.quantity} · {item.stitching === 'custom_tailored' ? 'Custom Tailored' : 'RTW'}
                  </p>
                  <p className="font-bold text-[#9e7d23] mt-0.5">{formatPKR(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#f0eae1] space-y-1.5 text-[#57534e]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPKR(currentOrder.subtotal)}</span>
            </div>
            {currentOrder.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({currentOrder.couponCode})</span>
                <span>-{formatPKR(currentOrder.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>{currentOrder.shippingFee === 0 ? 'FREE' : formatPKR(currentOrder.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#1c1917] pt-2 border-t border-[#e7dfd5]">
              <span>Total Amount</span>
              <span className="text-[#9e7d23] text-base">{formatPKR(currentOrder.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Contact Destination */}
        <div className="bg-white p-6 rounded-lg border border-[#e7dfd5] space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-serif text-sm font-bold text-[#1c1917] pb-2 border-b border-[#f0eae1]">
              Delivery Destination
            </h4>
            <div className="space-y-2 mt-3 text-[#44403c]">
              <p className="font-semibold text-[#1c1917]">{currentOrder.shippingAddress.fullName}</p>
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#9e7d23] flex-shrink-0 mt-0.5" />
                <span>
                  {currentOrder.shippingAddress.streetAddress}, {currentOrder.shippingAddress.apartmentSuite && `${currentOrder.shippingAddress.apartmentSuite}, `}
                  {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.province}
                </span>
              </p>
              {currentOrder.shippingAddress.nearbyLandmark && (
                <p className="text-[11px] text-[#78716c]">
                  Landmark: {currentOrder.shippingAddress.nearbyLandmark}
                </p>
              )}
              <p className="flex items-center gap-1.5 pt-1">
                <Phone className="w-3.5 h-3.5 text-[#9e7d23]" />
                <span>{currentOrder.shippingAddress.phone}</span>
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#faf8f5] rounded border border-[#e7dfd5] text-[11px] text-[#78716c]">
            <p className="font-semibold text-[#1c1917]">Need assistance with this order?</p>
            <p>Our Lahore Atelier team is reachable on WhatsApp at <strong>+92 300 8492011</strong>.</p>
          </div>
        </div>
      </div>

      {/* Action CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-white border border-[#d1c7bc] text-[#1c1917] rounded text-xs font-semibold hover:bg-[#ede7df] flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print Order Receipt</span>
        </button>

        <button
          onClick={onContinueShopping}
          className="px-6 py-2.5 bg-[#1c1917] text-[#faf8f5] rounded text-xs font-semibold uppercase tracking-widest hover:bg-[#9e7d23] flex items-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
