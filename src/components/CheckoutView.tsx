import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatPKR, validatePakistaniPhone, PAKISTAN_PROVINCES, MAJOR_PAKISTAN_CITIES } from '../utils/format';
import { Truck, ShieldCheck, ArrowLeft, CheckCircle2, CreditCard, Banknote, Smartphone, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';
import { getSafeImageUrl, handleImageError } from '../utils/imageFallback';

interface CheckoutViewProps {
  onBackToShopping: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onBackToShopping, onOrderSuccess }) => {
  const { cart, subtotal, discountAmount, shippingFee, total, appliedCoupon, clearCart } = useCart();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartmentSuite, setApartmentSuite] = useState('');
  const [city, setCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [nearbyLandmark, setNearbyLandmark] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'easypaisa' | 'raast'>('cod');

  // Validation & Submission
  const [phoneError, setPhoneError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill demo details for rapid local testing
  const handleAutoFillDemo = () => {
    setFullName('Syeda Fatima Zahra');
    setPhone('03001234567');
    setEmail('fatima.z@gmail.com');
    setStreetAddress('House 45-B, Sector G-11/3, Islamabad');
    setApartmentSuite('Floor 1');
    setCity('Islamabad');
    setProvince('Islamabad Capital Territory');
    setNearbyLandmark('Behind G-11 Markaz Al-Madina Masjid');
    setDeliveryInstructions('Cash on Delivery. Please call 15 minutes before arrival.');
    setPhoneError('');
    setFormError('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please provide customer full name.');
      return;
    }

    if (!validatePakistaniPhone(phone)) {
      setPhoneError('Please enter a valid 11-digit Pakistani mobile number (e.g. 0300-1234567).');
      return;
    }
    setPhoneError('');

    if (!streetAddress.trim()) {
      setFormError('Please enter your complete street delivery address.');
      return;
    }

    if (cart.length === 0) {
      setFormError('Your shopping cart is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: fullName.trim(),
        customerEmail: email.trim() || 'customer@sheikhiqbalboutique.pk',
        customerPhone: phone.trim(),
        customer: {
          name: fullName.trim(),
          email: email.trim() || 'customer@sheikhiqbalboutique.pk',
          phone: phone.trim(),
        },
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          streetAddress: streetAddress.trim(),
          apartmentSuite: apartmentSuite.trim(),
          city,
          province,
          postalCode: '54000',
          nearbyLandmark: nearbyLandmark.trim(),
          deliveryInstructions: deliveryInstructions.trim(),
        },
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          stitching: item.stitching,
        })),
        paymentMethod,
        couponCode: appliedCoupon?.code,
        notes: deliveryInstructions.trim(),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Order placement failed. Please review your details.');
        setIsSubmitting(false);
        return;
      }

      // Celebrate order success!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#1c1917', '#ffffff', '#e9d69e'],
      });

      clearCart();
      onOrderSuccess(data.order);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setFormError('Unable to connect to order server. Please check your connection.');
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#1c1917] mb-2">No items in your bag</h2>
        <p className="text-xs text-[#78716c] mb-6">Your shopping bag is currently empty.</p>
        <button
          onClick={onBackToShopping}
          className="px-6 py-2.5 bg-[#1c1917] text-[#faf8f5] text-xs font-semibold uppercase tracking-widest rounded hover:bg-[#9e7d23]"
        >
          Return to Collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button & Title */}
      <div className="flex items-center justify-between pb-6 border-b border-[#e7dfd5] mb-8">
        <button
          onClick={onBackToShopping}
          className="flex items-center gap-1.5 text-xs font-medium text-[#78716c] hover:text-[#1c1917] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
        <h1 className="font-serif text-2xl font-bold text-[#1c1917]">
          Secure Checkout · تکمیلِ آرڈر
        </h1>
        <button
          type="button"
          onClick={handleAutoFillDemo}
          className="text-xs font-semibold text-[#9e7d23] hover:underline bg-[#f5f0ea] px-3 py-1.5 rounded border border-[#e7dfd5]"
          title="Fill sample Pakistani address and 0300 phone"
        >
          ⚡ Auto-Fill Demo Address
        </button>
      </div>

      {formError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Shipping & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* STEP 1: Delivery Address */}
          <div className="bg-white p-6 rounded-lg border border-[#e7dfd5] shadow-xs">
            <h2 className="font-serif text-lg font-bold text-[#1c1917] pb-3 border-b border-[#f0eae1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1c1917] text-[#d4af37] text-xs flex items-center justify-center font-bold">1</span>
              <span>Pakistani Delivery Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#44403c] mb-1">
                  Recipient Full Name *
                </label>
                <input
                  id="input-checkout-fullname"
                  type="text"
                  placeholder="e.g. Ayesha Tariq"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="w-full p-2.5 border border-[#d1c7bc] rounded bg-[#faf8f5] focus:outline-none focus:border-[#9e7d23]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#44403c] mb-1">
                  Mobile Number (03XX-XXXXXXX) *
                </label>
                <input
                  id="input-checkout-phone"
                  type="tel"
                  placeholder="03001234567"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  required
                  className="w-full p-2.5 border border-[#d1c7bc] rounded bg-[#faf8f5] focus:outline-none focus:border-[#9e7d23]"
                />
                {phoneError && <p className="text-[11px] text-red-600 mt-1">{phoneError}</p>}
                <p className="text-[10px] text-[#78716c] mt-0.5">Used for TCS SMS tracking & rider call</p>
              </div>

              <div>
                <label className="block font-semibold text-[#44403c] mb-1">
                  Email Address
                </label>
                <input
                  id="input-checkout-email"
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-[#d1c7bc] rounded bg-[#faf8f5] focus:outline-none focus:border-[#9e7d23]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#44403c] mb-1">
                  Complete Street Address (House #, Street / Sector / Block) *
                </label>
                <input
                  id="input-checkout-address"
                  type="text"
                  placeholder="House 12-C, Street 4, Phase 5 DHA"
                  value={streetAddress}
                  onChange={e => setStreetAddress(e.target.value)}
                  required
                  className="w-full p-2.5 border border-[#d1c7bc] rounded bg-[#faf8f5] focus:outline-none focus:border-[#9e7d23]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#44403c] mb-1">
                  City *
                </label>
                <select
                  id="select-checkout-city"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full p-2.5 border border-[#d1c7bc] rounded bg-[#faf8f5] focus:outline-none focus:border-[#9e7d23] font-medium"
                >
                  {MAJOR_PAKISTAN_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#44403c] mb-1">
                  Province *
                </label>
                <select
                  id="select-checkout-province"
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="w-full p-2.5 border border-[#d1c7bc] rounded bg-[#faf8f5] focus:outline-none focus:border-[#9e7d23] font-medium"
                >
                  {PAKISTAN_PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#44403c] mb-1">
                  Prominent Landmark / Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Cavalry Supermarket, Gate 2"
                  value={deliveryInstructions}
                  onChange={e => setDeliveryInstructions(e.target.value)}
                  className="w-full p-2.5 border border-[#d1c7bc] rounded bg-[#faf8f5] focus:outline-none focus:border-[#9e7d23]"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Payment Method Selection */}
          <div className="bg-white p-6 rounded-lg border border-[#e7dfd5] shadow-xs">
            <h2 className="font-serif text-lg font-bold text-[#1c1917] pb-3 border-b border-[#f0eae1] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1c1917] text-[#d4af37] text-xs flex items-center justify-center font-bold">2</span>
              <span>Payment Options · ادائیگی کا طریقہ</span>
            </h2>

            <div className="space-y-3 mt-4">
              {/* Cash on Delivery (COD) */}
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#9e7d23] bg-[#faf8f5] ring-1 ring-[#9e7d23]'
                    : 'border-[#e7dfd5] hover:border-[#d1c7bc]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-[#9e7d23] focus:ring-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1c1917] flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-emerald-700" />
                      <span>Cash on Delivery (COD)</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-[#57534e] mt-1">
                    Pay exact cash to the courier rider upon parcel arrival at your doorstep. No advance card details required.
                  </p>
                </div>
              </label>

              {/* JazzCash */}
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'jazzcash'
                    ? 'border-[#9e7d23] bg-[#faf8f5] ring-1 ring-[#9e7d23]'
                    : 'border-[#e7dfd5] hover:border-[#d1c7bc]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="jazzcash"
                  checked={paymentMethod === 'jazzcash'}
                  onChange={() => setPaymentMethod('jazzcash')}
                  className="mt-1 text-[#9e7d23] focus:ring-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1c1917] flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-red-600" />
                      <span>JazzCash (Mobile Wallet / Card)</span>
                    </span>
                    <span className="text-[11px] text-[#78716c]">Sandbox / Live API</span>
                  </div>
                  <p className="text-xs text-[#57534e] mt-1">
                    Instant payment via your JazzCash registered mobile account number or debit card.
                  </p>
                </div>
              </label>

              {/* Easypaisa */}
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'easypaisa'
                    ? 'border-[#9e7d23] bg-[#faf8f5] ring-1 ring-[#9e7d23]'
                    : 'border-[#e7dfd5] hover:border-[#d1c7bc]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="easypaisa"
                  checked={paymentMethod === 'easypaisa'}
                  onChange={() => setPaymentMethod('easypaisa')}
                  className="mt-1 text-[#9e7d23] focus:ring-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1c1917] flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Easypaisa (OTC / Wallet)</span>
                    </span>
                    <span className="text-[11px] text-[#78716c]">Telenor Microfinance</span>
                  </div>
                  <p className="text-xs text-[#57534e] mt-1">
                    Pay securely using Easypaisa mobile balance, OTP authorization, or Easypaisa shop.
                  </p>
                </div>
              </label>

              {/* Raast Instant Bank Transfer */}
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'raast'
                    ? 'border-[#9e7d23] bg-[#faf8f5] ring-1 ring-[#9e7d23]'
                    : 'border-[#e7dfd5] hover:border-[#d1c7bc]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="raast"
                  checked={paymentMethod === 'raast'}
                  onChange={() => setPaymentMethod('raast')}
                  className="mt-1 text-[#9e7d23] focus:ring-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1c1917] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-700" />
                      <span>Raast Instant Bank Transfer (SBP)</span>
                    </span>
                    <span className="text-[11px] font-semibold text-blue-700">Zero Transaction Fee</span>
                  </div>
                  <p className="text-xs text-[#57534e] mt-1">
                    Direct P2M transfer from any Pakistani bank (HBL, Meezan, Alfalah, Standard Chartered) using Raast IBAN.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Placement (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white p-6 rounded-lg border border-[#e7dfd5] shadow-sm space-y-6">
            <h2 className="font-serif text-lg font-bold text-[#1c1917] pb-3 border-b border-[#f0eae1]">
              Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)
            </h2>

            {/* Items review */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map(item => (
                <div key={item.cartItemId} className="flex gap-3 text-xs">
                  <img
                    src={getSafeImageUrl(item.image)}
                    alt={item.title}
                    onError={handleImageError}
                    className="w-14 h-18 object-cover object-[center_top] rounded bg-[#faf8f5] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#1c1917] truncate">{item.title}</h4>
                    <p className="text-[11px] text-[#78716c]">
                      Size: <strong>{item.size}</strong> · Qty: <strong>{item.quantity}</strong>
                    </p>
                    <p className="text-[11px] text-[#78716c]">
                      {item.stitching === 'custom_tailored' ? 'Custom Tailored' : 'RTW Stitched'}
                    </p>
                    <p className="text-xs font-bold text-[#9e7d23] mt-1">
                      {formatPKR((item.salePrice || item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-[#f0eae1] space-y-2 text-xs text-[#57534e]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1c1917]">{formatPKR(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-{formatPKR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Nationwide Shipping</span>
                <span>{shippingFee === 0 ? <span className="text-emerald-700 font-semibold">FREE (Over Rs. 5,000)</span> : formatPKR(shippingFee)}</span>
              </div>

              <div className="pt-3 border-t border-[#e7dfd5] flex justify-between text-base font-bold text-[#1c1917]">
                <span>Total Due</span>
                <span className="text-[#9e7d23] text-xl">{formatPKR(total)}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              id="btn-place-order-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 bg-[#1c1917] text-[#faf8f5] font-bold text-xs uppercase tracking-widest rounded shadow-lg hover:bg-[#9e7d23] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Generating Order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                  <span>
                    {paymentMethod === 'cod' ? 'Place Order with Cash on Delivery' : `Pay ${formatPKR(total)} Now`}
                  </span>
                </>
              )}
            </button>

            {/* Security Assurance */}
            <div className="p-3 bg-[#faf8f5] rounded border border-[#e7dfd5] text-[11px] text-[#78716c] space-y-1">
              <p className="flex items-center gap-1 font-semibold text-[#1c1917]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>100% Authentic Pakistani Haute Couture</span>
              </p>
              <p>
                Parcels are insured during transit. For COD orders, pay cash only after receiving your sealed Sheikh Iqbal luxury package.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
