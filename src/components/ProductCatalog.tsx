import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { Filter, SlidersHorizontal, Search, X, Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPKR } from '../utils/format';
import { LUXURY_EASE } from '../utils/motion';
import { MughalArchDivider, JaaliWatermark } from './OldLahoreAccents';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  onQuickView: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  activeCategory,
  onSelectCategory,
  onQuickView,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(100000);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Fabrics present in catalog
  const fabricOptions = ['all', 'Pure Raw Silk', 'Chiffon', 'Lawn', 'Organza', 'Velvet', 'Pashmina'];

  // Filter and sort computation
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Category filter
        if (activeCategory !== 'all') {
          const matchedCategory = categories.find(c => c.slug === activeCategory);
          if (matchedCategory && p.categoryId !== matchedCategory.id) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchFabric = p.fabric.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchFabric && !matchSku) return false;
        }

        // Fabric filter
        if (selectedFabric !== 'all') {
          if (!p.fabric.toLowerCase().includes(selectedFabric.toLowerCase())) return false;
        }

        // Price filter
        const price = p.salePrice || p.price;
        if (price > maxPriceFilter) return false;

        // Stock filter
        if (inStockOnly && p.stock <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice || a.price;
        const priceB = b.salePrice || b.price;

        switch (sortOption) {
          case 'price_low_high':
            return priceA - priceB;
          case 'price_high_low':
            return priceB - priceA;
          case 'best_sellers':
            return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
          case 'rating':
            return b.rating - a.rating;
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        }
      });
  }, [products, categories, activeCategory, searchQuery, selectedFabric, maxPriceFilter, inStockOnly, sortOption]);

  return (
    <section id="catalog-section" className="py-16 bg-[#faf8f5] relative overflow-hidden">
      <JaaliWatermark className="top-12 right-6 text-[#d4af37]" />
      <JaaliWatermark className="bottom-12 left-6 text-[#d4af37]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e7dfd5]">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#9e7d23] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>The Atelier Collection · مجموعہ</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1917] mt-1">
              {activeCategory === 'all'
                ? 'All Haute Couture & Pret'
                : categories.find(c => c.slug === activeCategory)?.name || 'Collection'}
            </h2>
            <p className="text-xs text-[#78716c] mt-0.5">
              Showing {filteredProducts.length} handcrafted masterwork pieces
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 sm:w-64">
              <input
                id="input-catalog-search"
                type="text"
                placeholder="Search raw silk, lehenga..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs border border-[#d1c7bc] rounded bg-white focus:outline-none focus:border-[#9e7d23] shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-[#78716c] absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#a8a29e] hover:text-black cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <select
              id="select-catalog-sort"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              className="py-2 px-3 text-xs border border-[#d1c7bc] rounded bg-white font-medium text-[#1c1917] focus:outline-none focus:border-[#9e7d23] shadow-2xs cursor-pointer"
            >
              <option value="featured">Featured Collection</option>
              <option value="best_sellers">Best Sellers</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
              <option value="newest">New Arrivals</option>
            </select>

            {/* Mobile Filter Toggle */}
            <button
              id="btn-mobile-filter-toggle"
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className="flex items-center gap-1.5 py-2 px-3 text-xs border border-[#d1c7bc] rounded bg-white text-[#1c1917] hover:bg-[#ede7df] cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#9e7d23]" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 py-4 border-b border-[#e7dfd5] text-xs">
          <span className="text-[#78716c] uppercase tracking-wider text-[10px] font-semibold mr-1">Fabric:</span>
          {fabricOptions.map(fab => (
            <button
              key={fab}
              id={`filter-fabric-${fab.toLowerCase()}`}
              onClick={() => setSelectedFabric(fab)}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                selectedFabric === fab
                  ? 'bg-[#1c1917] text-[#d4af37] font-semibold shadow-sm'
                  : 'bg-white border border-[#d1c7bc] text-[#44403c] hover:border-[#1c1917]'
              }`}
            >
              {fab === 'all' ? 'All Fabrics' : fab}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-4">
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-[#44403c]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#d1c7bc] text-[#9e7d23] focus:ring-0"
              />
              <span>In Stock Ready to Dispatch</span>
            </label>
          </div>
        </div>

        {/* Expanded Filters Drawer (When Toggled) */}
        {isFilterDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 my-4 bg-white border border-[#e7dfd5] rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-6 text-xs"
          >
            <div className="space-y-1.5 flex-1 min-w-[240px]">
              <div className="flex justify-between">
                <span className="font-semibold text-[#1c1917]">Max Price Filter:</span>
                <span className="font-bold text-[#9e7d23]">{formatPKR(maxPriceFilter)}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="120000"
                step="5000"
                value={maxPriceFilter}
                onChange={e => setMaxPriceFilter(Number(e.target.value))}
                className="w-full accent-[#d4af37]"
              />
              <div className="flex justify-between text-[10px] text-[#78716c]">
                <span>Rs. 10,000</span>
                <span>Rs. 120,000+</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedFabric('all');
                setMaxPriceFilter(120000);
                setInStockOnly(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 border border-[#d1c7bc] rounded text-xs font-semibold text-[#44403c] hover:bg-[#ede7df] cursor-pointer"
            >
              Reset All Filters
            </button>
          </motion.div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-xl text-[#1c1917] mb-2">No matching ensembles found</p>
            <p className="text-xs text-[#78716c] max-w-sm mx-auto mb-6">
              Try adjusting your search keywords, fabric filters, or price range.
            </p>
            <button
              onClick={() => {
                onSelectCategory('all');
                setSelectedFabric('all');
                setSearchQuery('');
                setMaxPriceFilter(120000);
              }}
              className="px-6 py-2.5 bg-[#1c1917] text-[#e7dfd5] text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#9e7d23] transition-colors cursor-pointer"
            >
              View Full Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 pt-6 sm:pt-8">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.7,
                  delay: (idx % 4) * 0.08,
                  ease: LUXURY_EASE,
                }}
              >
                <ProductCard
                  product={product}
                  onQuickView={onQuickView}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
