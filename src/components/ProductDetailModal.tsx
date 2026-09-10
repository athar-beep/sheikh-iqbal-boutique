import React, { useState, useRef } from 'react';
import { X, Star, Truck, ShieldCheck, Heart, Share2, Plus, Minus, ShoppingBag, Check, Sparkles, Ruler, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Review } from '../types';
import { formatPKR } from '../utils/format';
import { useCart } from '../context/CartContext';
import { LUXURY_EASE } from '../utils/motion';
import { MughalArchDivider } from './OldLahoreAccents';
import { getSafeImageUrl, handleImageError } from '../utils/imageFallback';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onDirectCheckout: () => void;
}

interface ProductDetailModalContentProps {
  product: Product;
  onClose: () => void;
  onDirectCheckout: () => void;
}

const ProductDetailModalContent: React.FC<ProductDetailModalContentProps> = ({
  product,
  onClose,
  onDirectCheckout,
}) => {
  const { addToCart } = useCart();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Default');
  const [stitchingOption, setStitchingOption] = useState<'ready_to_wear' | 'custom_tailored'>('ready_to_wear');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Zoom / Fabric Texture Inspection Lens
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Review submission state
  const [reviewName, setReviewName] = useState('');
  const [reviewCity, setReviewCity] = useState('Lahore');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmittedMessage, setReviewSubmittedMessage] = useState('');

  const currentPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const handleImagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = imageContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[activeImageIdx] || product.images[0],
      size: selectedSize,
      color: selectedColor,
      stitching: stitchingOption,
      quantity,
      stockAvailable: product.stock,
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyWithCOD = () => {
    handleAddToCart();
    onClose();
    onDirectCheckout();
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewName.trim(),
          city: reviewCity,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      if (res.ok) {
        setReviewSubmittedMessage('Thank you! Your verified review has been published.');
        setReviewName('');
        setReviewComment('');
      }
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.45, ease: LUXURY_EASE }}
        className="relative bg-[#faf8f5] w-full max-w-5xl rounded-xl shadow-2xl border border-[#d4af37]/30 overflow-hidden my-auto max-h-[94vh] flex flex-col"
      >
        {/* Header Close Button */}
        <button
          id="btn-close-product-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 text-[#44403c] bg-white/90 hover:bg-white hover:text-black rounded-full shadow-md transition-all cursor-pointer active:scale-95 border border-[#e7dfd5]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Haute Couture Image Gallery with Interactive Fabric Loupe */}
          <div className="space-y-4">
            <div
              ref={imageContainerRef}
              onPointerEnter={() => setIsZooming(true)}
              onPointerLeave={() => setIsZooming(false)}
              onPointerMove={handleImagePointerMove}
              className="relative aspect-[3/4] bg-[#f5f0ea] rounded-lg overflow-hidden border border-[#e7dfd5] group cursor-crosshair shadow-inner select-none"
            >
              <img
                src={getSafeImageUrl(product.images[activeImageIdx] || product.images[0])}
                alt={product.title}
                onError={handleImageError}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZooming ? 'scale(1.85)' : 'scale(1)',
                }}
                className="w-full h-full object-cover object-[center_top] transition-transform duration-200 ease-out"
              />

              {/* Discount Tag */}
              {hasDiscount && (
                <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-rose-700 text-white rounded shadow-sm z-10">
                  Save {discountPercent}%
                </span>
              )}

              {/* Fabric Loupe Instruction Pill */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/75 backdrop-blur-md rounded text-[11px] text-[#e9d69e] flex items-center gap-1.5 pointer-events-none opacity-85 group-hover:opacity-0 transition-opacity">
                <Search className="w-3 h-3 text-[#d4af37]" />
                <span>Hover to inspect zardozi texture</span>
              </div>
            </div>

            {/* Thumbnail Gallery with Gold Outline Focus */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-24 rounded border overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                      activeImageIdx === idx
                        ? 'ring-2 ring-[#d4af37] border-transparent shadow-md scale-105'
                        : 'opacity-70 hover:opacity-100 border-[#e7dfd5]'
                    }`}
                  >
                    <img
                      src={getSafeImageUrl(img)}
                      alt=""
                      onError={handleImageError}
                      className="w-full h-full object-cover object-[center_top]"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Controls */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Piece Count */}
              <div className="flex items-center justify-between text-xs text-[#78716c] uppercase tracking-widest font-medium mb-1">
                <span>{product.categoryName}</span>
                <span className="text-[#9e7d23] font-semibold">{product.pieceCount}</span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1917] leading-tight mb-2">
                {product.title}
              </h1>

              {/* Rating Summary */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-[#d4af37]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-[#d4af37]' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#1c1917]">{product.rating}</span>
                <span className="text-xs text-[#78716c]">({product.reviewsCount} verified reviews)</span>
              </div>

              {/* Price Callout */}
              <div className="flex items-baseline gap-3 p-3.5 bg-[#f5f0ea] rounded-lg border border-[#e7dfd5] mb-6">
                <span className="text-2xl font-bold text-[#1c1917]">
                  {formatPKR(currentPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-[#78716c] line-through">
                      {formatPKR(product.price)}
                    </span>
                    <span className="text-xs font-bold text-rose-700 uppercase">
                      (You save {formatPKR(product.price - product.salePrice!)})
                    </span>
                  </>
                )}
                <span className="ml-auto text-[11px] text-[#78716c] font-medium">
                  SKU: {product.sku}
                </span>
              </div>

              {/* Fabric Details Badges */}
              <div className="grid grid-cols-2 gap-2.5 text-xs mb-6">
                <div className="p-3 bg-white border border-[#e7dfd5] rounded-lg shadow-sm">
                  <span className="text-[10px] uppercase text-[#78716c] block font-semibold">Fabric Weave</span>
                  <strong className="text-[#1c1917] text-xs font-serif">{product.fabric}</strong>
                </div>
                <div className="p-3 bg-white border border-[#e7dfd5] rounded-lg shadow-sm">
                  <span className="text-[10px] uppercase text-[#78716c] block font-semibold">Embroidery Craft</span>
                  <strong className="text-[#1c1917] text-xs font-serif">{product.embroideryWork}</strong>
                </div>
              </div>

              {/* Size Selector with Animated Selection */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-[#1c1917] tracking-wider">
                    Select Size: <span className="text-[#9e7d23]">{selectedSize}</span>
                  </span>
                  <button
                    onClick={() => setIsSizeGuideOpen(!isSizeGuideOpen)}
                    className="flex items-center gap-1 text-xs text-[#9e7d23] hover:underline font-medium cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Pakistani Size Guide</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[46px] h-10 px-3 text-xs font-semibold rounded border transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-[#1c1917] text-[#d4af37] border-[#1c1917] shadow-sm scale-105'
                          : 'bg-white text-[#44403c] border-[#d1c7bc] hover:border-[#1c1917]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Size Guide Modal Popup */}
                {isSizeGuideOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-white border border-[#d4af37] rounded-lg text-xs space-y-2 text-[#44403c] mt-2 shadow-md"
                  >
                    <p className="font-bold text-[#1c1917] uppercase tracking-wider text-[11px]">
                      Standard Pakistani Women’s Sizing (Inches):
                    </p>
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="bg-[#f5f0ea] text-[#1c1917]">
                          <th className="p-1.5 border border-[#e7dfd5]">Size</th>
                          <th className="p-1.5 border border-[#e7dfd5]">Chest</th>
                          <th className="p-1.5 border border-[#e7dfd5]">Waist</th>
                          <th className="p-1.5 border border-[#e7dfd5]">Hip</th>
                          <th className="p-1.5 border border-[#e7dfd5]">Shirt Length</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="p-1 border border-[#e7dfd5] font-bold">XS</td><td className="p-1 border border-[#e7dfd5]">34"</td><td className="p-1 border border-[#e7dfd5]">28"</td><td className="p-1 border border-[#e7dfd5]">37"</td><td className="p-1 border border-[#e7dfd5]">42"</td></tr>
                        <tr><td className="p-1 border border-[#e7dfd5] font-bold">S</td><td className="p-1 border border-[#e7dfd5]">36"</td><td className="p-1 border border-[#e7dfd5]">30"</td><td className="p-1 border border-[#e7dfd5]">39"</td><td className="p-1 border border-[#e7dfd5]">43"</td></tr>
                        <tr><td className="p-1 border border-[#e7dfd5] font-bold">M</td><td className="p-1 border border-[#e7dfd5]">39"</td><td className="p-1 border border-[#e7dfd5]">33"</td><td className="p-1 border border-[#e7dfd5]">42"</td><td className="p-1 border border-[#e7dfd5]">44"</td></tr>
                        <tr><td className="p-1 border border-[#e7dfd5] font-bold">L</td><td className="p-1 border border-[#e7dfd5]">42"</td><td className="p-1 border border-[#e7dfd5]">37"</td><td className="p-1 border border-[#e7dfd5]">46"</td><td className="p-1 border border-[#e7dfd5]">45"</td></tr>
                        <tr><td className="p-1 border border-[#e7dfd5] font-bold">XL</td><td className="p-1 border border-[#e7dfd5]">46"</td><td className="p-1 border border-[#e7dfd5]">41"</td><td className="p-1 border border-[#e7dfd5]">50"</td><td className="p-1 border border-[#e7dfd5]">45"</td></tr>
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </div>

              {/* Stitching Option Toggle with Animated Spring Indicator */}
              <div className="space-y-1.5 mb-5">
                <span className="text-xs uppercase font-bold text-[#1c1917] tracking-wider">
                  Tailoring Preference:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setStitchingOption('ready_to_wear')}
                    className={`py-2 px-3 rounded text-xs font-semibold border text-left transition-all cursor-pointer ${
                      stitchingOption === 'ready_to_wear'
                        ? 'bg-[#1c1917] text-[#d4af37] border-[#1c1917] shadow-sm'
                        : 'bg-white text-[#44403c] border-[#d1c7bc]'
                    }`}
                  >
                    <span>Ready to Wear (RTW)</span>
                    <span className="block text-[10px] opacity-75">Standard Stitching</span>
                  </button>

                  <button
                    onClick={() => setStitchingOption('custom_tailored')}
                    className={`py-2 px-3 rounded text-xs font-semibold border text-left transition-all cursor-pointer ${
                      stitchingOption === 'custom_tailored'
                        ? 'bg-[#1c1917] text-[#d4af37] border-[#1c1917] shadow-sm'
                        : 'bg-white text-[#44403c] border-[#d1c7bc]'
                    }`}
                  >
                    <span>Custom Bespoke</span>
                    <span className="block text-[10px] opacity-75">Tailored to your body</span>
                  </button>
                </div>
              </div>

              {/* Quantity Selector & Stock Alert */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase font-bold text-[#1c1917]">Qty:</span>
                  <div className="flex items-center border border-[#d1c7bc] rounded bg-white shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-[#78716c] hover:text-black cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-[#1c1917]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-2 text-[#78716c] hover:text-black disabled:opacity-30 cursor-pointer"
                      disabled={quantity >= product.stock}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {product.stock <= 5 && product.stock > 0 ? (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                    ⚡ Only {product.stock} items left in stock!
                  </span>
                ) : (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    In Stock for Immediate Dispatch
                  </span>
                )}
              </div>

              {/* Action Buttons: Add to Bag & Direct Buy with COD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  id="btn-modal-add-to-cart"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`py-3.5 px-4 rounded font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    product.stock <= 0
                      ? 'bg-[#e7dfd5] text-[#78716c] cursor-not-allowed'
                      : addedAnimation
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#1c1917] text-[#faf8f5] hover:bg-[#9e7d23]'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-modal-buy-with-cod"
                  onClick={handleBuyWithCOD}
                  disabled={product.stock <= 0}
                  className="py-3.5 px-4 rounded font-bold text-xs uppercase tracking-widest bg-[#d4af37] text-black hover:bg-[#e4c256] transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Buy Now with COD</span>
                </button>
              </div>

              {/* Delivery Assurance */}
              <div className="p-3 bg-[#f5f0ea] rounded-lg border border-[#e7dfd5] text-xs text-[#57534e] space-y-1">
                <p className="flex items-center gap-1.5 font-semibold text-[#1c1917]">
                  <Truck className="w-3.5 h-3.5 text-[#9e7d23]" />
                  <span>Pakistani Express Courier Delivery (TCS / Leopards)</span>
                </p>
                <p className="text-[11px] pl-5">
                  Karachi, Lahore & Islamabad: <strong>48 to 72 hours</strong>. Other cities: <strong>3 to 5 business days</strong>. Cash collected at doorstep.
                </p>
              </div>
            </div>

            {/* Description & Reviews Tabs with Animated Gold Indicator */}
            <div className="pt-6 border-t border-[#e7dfd5]">
              <div className="flex border-b border-[#e7dfd5] mb-4 relative">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 px-4 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === 'details'
                      ? 'text-[#1c1917] border-b-2 border-[#d4af37]'
                      : 'text-[#78716c] hover:text-[#1c1917]'
                  }`}
                >
                  Craft & Specifications
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 px-4 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'text-[#1c1917] border-b-2 border-[#d4af37]'
                      : 'text-[#78716c] hover:text-[#1c1917]'
                  }`}
                >
                  Patron Reviews ({product.reviewsCount})
                </button>
              </div>

              {activeTab === 'details' ? (
                <div className="text-xs text-[#57534e] space-y-2 leading-relaxed">
                  <p>{product.description}</p>
                  <ul className="list-disc pl-4 space-y-1 text-[#44403c] pt-2">
                    <li>Package includes: {product.pieceCount}</li>
                    <li>Craft technique: {product.embroideryWork}</li>
                    <li>Care instructions: Dry clean only to preserve raw silk luster and antique zari work</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Write a Review Form */}
                  <form onSubmit={handleSubmitReview} className="p-3.5 bg-white rounded-lg border border-[#e7dfd5] space-y-2.5 text-xs">
                    <p className="font-bold text-[#1c1917]">Submit Verified Review</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        value={reviewName}
                        onChange={e => setReviewName(e.target.value)}
                        required
                        className="p-2 border border-[#d1c7bc] rounded text-xs bg-[#faf8f5]"
                      />
                      <input
                        type="text"
                        placeholder="City (e.g. Lahore / Karachi)"
                        value={reviewCity}
                        onChange={e => setReviewCity(e.target.value)}
                        className="p-2 border border-[#d1c7bc] rounded text-xs bg-[#faf8f5]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Rating:</span>
                      <select
                        value={reviewRating}
                        onChange={e => setReviewRating(Number(e.target.value))}
                        className="p-1.5 border border-[#d1c7bc] rounded text-xs bg-[#faf8f5]"
                      >
                        <option value="5">★★★★★ (5/5) Exceptional</option>
                        <option value="4">★★★★☆ (4/5) Very Good</option>
                        <option value="3">★★★☆☆ (3/5) Average</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Share your experience regarding fabric quality, stitching, and packaging..."
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      required
                      rows={2}
                      className="w-full p-2 border border-[#d1c7bc] rounded text-xs bg-[#faf8f5]"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-4 py-2 bg-[#1c1917] text-[#e7dfd5] rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#9e7d23] cursor-pointer transition-colors"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                    {reviewSubmittedMessage && (
                      <p className="text-emerald-700 text-xs font-semibold">{reviewSubmittedMessage}</p>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onDirectCheckout,
}) => {
  return (
    <AnimatePresence>
      {product && (
        <ProductDetailModalContent
          key={product.id}
          product={product}
          onClose={onClose}
          onDirectCheckout={onDirectCheckout}
        />
      )}
    </AnimatePresence>
  );
};
