import React, { useState, useMemo } from 'react';
import { X, Search, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { formatPKR } from '../utils/format';
import { getSafeImageUrl, handleImageError } from '../utils/imageFallback';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return products.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.embroideryWork.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [searchTerm, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-6 flex items-start justify-center pt-20">
      <div className="relative bg-[#faf8f5] w-full max-w-2xl rounded-xl shadow-2xl border border-[#e7dfd5] overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 bg-white border-b border-[#e7dfd5] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#9e7d23]" />
          <input
            id="input-global-search-modal"
            type="text"
            autoFocus
            placeholder="Search raw silk, velvet shawls, bridal lehenga, SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#1c1917] focus:outline-none placeholder:text-[#a8a29e]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-[#a8a29e] hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-[#78716c] hover:text-[#1c1917] hover:bg-[#ede7df] rounded"
          >
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2 text-xs">
          {!searchTerm.trim() ? (
            <div className="py-8 text-center text-[#78716c]">
              <p className="font-serif text-sm font-semibold text-[#1c1917] mb-1">
                Explore Pakistani Haute Couture
              </p>
              <p className="text-xs">
                Search by keyword like "Silk", "Bridal", "Velvet", "Unstitched", or "Kurta"
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-[#78716c]">
              <p>No products found matching "{searchTerm}"</p>
            </div>
          ) : (
            filtered.map(product => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#e7dfd5] cursor-pointer transition-colors"
              >
                <img
                  src={getSafeImageUrl(product.images[0])}
                  alt={product.title}
                  onError={handleImageError}
                  className="w-12 h-16 object-cover object-[center_top] rounded bg-[#f5f0ea]"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-[#1c1917] truncate">{product.title}</h4>
                  <p className="text-[11px] text-[#78716c]">
                    {product.categoryName} · {product.fabric}
                  </p>
                  <p className="text-xs font-bold text-[#9e7d23] mt-0.5">
                    {formatPKR(product.salePrice || product.price)}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#78716c]" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
