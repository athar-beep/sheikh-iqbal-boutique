import React, { useState, useRef } from 'react';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { formatPKR } from '../utils/format';
import { useCart } from '../context/CartContext';
import { isMobileOrTouch } from '../utils/motion';
import { getSafeImageUrl, handleImageError } from '../utils/imageFallback';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const cardRef = useRef<HTMLDivElement>(null);

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'Standard');
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 3D Tilt & Specular Sheen State
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, sheenX: 50, sheenY: 50 });

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const currentPrice = product.salePrice || product.price;
  const hasSecondaryImage = product.images.length > 1;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMobileOrTouch()) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1; // -1 to 1
    const normY = (y / rect.height) * 2 - 1;

    // Controlled, restrained tilt (max 6 degrees)
    const rotateY = normX * 6;
    const rotateX = -normY * 6;

    const sheenX = Math.round((x / rect.width) * 100);
    const sheenY = Math.round((y / rect.height) * 100);

    setTilt({ rotateX, rotateY, sheenX, sheenY });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, sheenX: 50, sheenY: 50 });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0],
      size: selectedSize,
      color: product.colors[0] || 'Default',
      stitching: 'ready_to_wear',
      quantity: 1,
      stockAvailable: product.stock,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div
      ref={cardRef}
      id={`product-card-${product.id}`}
      onPointerMove={handlePointerMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handlePointerLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: isHovered
          ? 'transform 0.15s ease-out, box-shadow 0.3s ease'
          : 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s ease',
        transformStyle: 'preserve-3d',
      }}
      className={`group relative flex flex-col bg-white rounded-lg border border-[#e7dfd5] overflow-hidden transition-all ${
        isHovered
          ? 'shadow-xl shadow-black/10 border-[#d4af37]/60'
          : 'shadow-sm hover:border-[#d4af37]/40'
      }`}
    >
      {/* Dynamic Specular Sheen Overlay (Simulates silk luster catching directional light) */}
      <div
        className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300 rounded-lg"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle 220px at ${tilt.sheenX}% ${tilt.sheenY}%, rgba(212, 175, 55, 0.14) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Product Image Area with Shared Campaign Perspective */}
      <div
        className="relative aspect-[3/4] bg-[#f5f0ea] overflow-hidden cursor-pointer select-none"
        onClick={() => onQuickView(product)}
      >
        {/* Skeleton shimmer while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5f0ea] via-[#ece5db] to-[#f5f0ea] animate-pulse pointer-events-none" />
        )}

        {/* Primary Image */}
        <img
          src={getSafeImageUrl(product.images[0])}
          alt={product.title}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
          className={`absolute inset-0 w-full h-full object-cover object-[center_top] transition-all duration-700 ease-out ${
            !imageLoaded ? 'opacity-0 scale-98' : ''
          } ${
            isHovered && hasSecondaryImage
              ? 'opacity-0 scale-105'
              : imageLoaded
              ? 'opacity-100 group-hover:scale-105'
              : ''
          }`}
          loading="lazy"
        />

        {/* Secondary Image (Reveals intricate embroidery or alternative angle on hover) */}
        {hasSecondaryImage && (
          <img
            src={getSafeImageUrl(product.images[1])}
            alt={`${product.title} boutique detail`}
            onError={handleImageError}
            className={`absolute inset-0 w-full h-full object-cover object-[center_top] transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            loading="lazy"
          />
        )}

        {/* Subtle Ambient Shadow Falloff on Bottom of Image */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-rose-700 text-white rounded shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#1c1917] text-[#d4af37] rounded border border-[#d4af37]/30 shadow-sm">
              Best Seller
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider bg-[#d4af37] text-black rounded shadow-sm">
              New Arrival
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`btn-wishlist-${product.id}`}
          onClick={e => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 p-1.5 sm:p-2 rounded-full bg-white/85 backdrop-blur-md text-[#44403c] hover:text-red-500 hover:bg-white transition-all transform active:scale-90 z-10 shadow-sm"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : ''
            }`}
          />
        </button>

        {/* Quick View Overlay Button */}
        <div className="absolute inset-x-0 bottom-2.5 sm:bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 px-3 sm:px-4 translate-y-2 group-hover:translate-y-0">
          <button
            id={`btn-quickview-${product.id}`}
            onClick={e => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-1.5 sm:py-2 bg-black/90 backdrop-blur-md text-[#faf8f5] text-[10px] sm:text-xs font-semibold uppercase tracking-widest rounded shadow-md hover:bg-[#d4af37] hover:text-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between bg-white relative z-10">
        <div>
          {/* Fabric / Piece Count Tag */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#78716c] uppercase tracking-wider mb-1 font-medium">
            <span className="truncate pr-1">{product.fabric}</span>
            <span className="shrink-0">{product.pieceCount}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-serif text-xs sm:text-sm font-semibold text-[#1c1917] hover:text-[#9e7d23] transition-colors line-clamp-1 sm:line-clamp-2 cursor-pointer mb-1.5 sm:mb-2 leading-snug"
          >
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <span className="text-xs sm:text-base font-bold text-[#1c1917]">
              {formatPKR(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] sm:text-xs text-[#a8a29e] line-through">
                {formatPKR(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Quick Size Selector & Add to Cart */}
        <div className="pt-2 border-t border-[#f5f0ea]">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-[#78716c]">Size:</span>
            <div className="flex gap-1">
              {product.sizes.slice(0, 4).map(size => (
                <button
                  key={size}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`w-5 h-5 sm:w-6 sm:h-6 text-[9px] sm:text-[10px] font-semibold rounded border transition-all cursor-pointer flex items-center justify-center ${
                    selectedSize === size
                      ? 'bg-[#1c1917] text-[#d4af37] border-[#1c1917] shadow-sm'
                      : 'bg-[#faf8f5] text-[#44403c] border-[#d1c7bc] hover:border-[#1c1917]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button
            id={`btn-quick-add-${product.id}`}
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[34px] sm:min-h-[38px] ${
              product.stock <= 0
                ? 'bg-[#e7dfd5] text-[#78716c] cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-700 text-white'
                : 'bg-[#1c1917] text-[#faf8f5] hover:bg-[#9e7d23]'
            }`}
          >
            {product.stock <= 0 ? (
              <span>Sold Out</span>
            ) : addedAnimation ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d4af37]" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
