import React from 'react';
import { Category } from '../types';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { LUXURY_EASE } from '../utils/motion';
import { MughalArchDivider, JaaliWatermark } from './OldLahoreAccents';
import { getSafeImageUrl, handleImageError } from '../utils/imageFallback';

interface CategoryShowcaseProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <section className="py-20 bg-[#faf8f5] relative overflow-hidden">
      <JaaliWatermark className="top-4 left-4 text-[#d4af37]" />
      <JaaliWatermark className="bottom-4 right-4 text-[#d4af37]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: LUXURY_EASE }}
            className="text-xs uppercase tracking-[0.25em] text-[#9e7d23] font-semibold block mb-2"
          >
            Curated Collections · شاہکار انتخاب
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: LUXURY_EASE }}
            className="font-serif text-3xl sm:text-4xl font-normal text-[#1c1917] mb-2"
          >
            Shop by Silhouette & Craft
          </motion.h2>
          <MughalArchDivider className="my-3" />
        </div>

        {/* Categories Grid with Lookbook Stagger */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
          {categories.map((cat, idx) => {
            const isSelected = activeCategory === cat.slug;
            return (
              <motion.button
                key={cat.id}
                id={`cat-card-${cat.slug}`}
                onClick={() => onSelectCategory(cat.slug)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.85,
                  delay: idx * 0.08,
                  ease: LUXURY_EASE,
                }}
                className={`group relative overflow-hidden rounded-lg aspect-[3/4] text-left transition-all duration-500 focus:outline-none cursor-pointer shadow-sm ${
                  isSelected
                    ? 'ring-2 ring-[#d4af37] shadow-xl shadow-black/15 scale-[1.02]'
                    : 'hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                {/* Image with Haute Couture slow zoom */}
                <img
                  src={getSafeImageUrl(cat.image)}
                  alt={cat.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover object-[center_top] group-hover:scale-108 transition-transform duration-1000 ease-out"
                />

                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-500 group-hover:from-black/90" />

                {/* Card border accent */}
                <div
                  className={`absolute inset-0 border transition-colors duration-300 rounded-lg pointer-events-none ${
                    isSelected ? 'border-[#d4af37]' : 'border-white/10 group-hover:border-[#d4af37]/50'
                  }`}
                />

                {/* Category Titles */}
                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end text-white">
                  <h3 className="font-serif text-sm sm:text-base font-semibold tracking-wide leading-tight group-hover:text-[#e9d69e] transition-colors">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#d1c7bc] mt-1.5 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    <span className="uppercase tracking-widest text-[10px]">Explore</span>
                    <ArrowRight className="w-3 h-3 text-[#d4af37]" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
