import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { CoutureHero3D } from './CoutureHero3D';
import { LUXURY_EASE, isReducedMotionPreferred } from '../utils/motion';
import { JaaliWatermark } from './OldLahoreAccents';

interface HeroSectionProps {
  onExploreClick: () => void;
  onOpenStylist: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onOpenStylist }) => {
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(isReducedMotionPreferred());
    const handleScroll = () => {
      // Normalize scroll for 3D parallax
      setScrollY(window.scrollY / 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.9,
        delay: custom * 0.15,
        ease: LUXURY_EASE,
      },
    }),
  };

  return (
    <div className="relative bg-[#141210] text-[#faf8f5] overflow-hidden min-h-[620px] lg:min-h-[700px] flex items-center">
      {/* 3D Couture Scene Canvas (Flowing Silk Drape, Zardozi Tilla Thread & Mughal Mehrab) */}
      <CoutureHero3D scrollProgress={scrollY} />

      {/* Atmospheric Vignette & Soft Gradient Falloff */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#141210] via-[#141210]/85 to-transparent z-[2]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#141210] via-transparent to-[#141210]/40 z-[2]" />

      {/* Background Architectural Jaali Watermarks */}
      <JaaliWatermark className="top-10 right-16 text-[#d4af37]" />
      <JaaliWatermark className="bottom-12 right-1/3 text-[#d4af37]" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7">
            {/* Royal Tagline Pill */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#241f1c]/90 border border-[#d4af37]/40 text-[#e9d69e] text-xs uppercase tracking-[0.25em] font-medium backdrop-blur-md mb-6 shadow-sm shadow-black/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
              <span>The Festive Collection ’26 · شیخ اقبال</span>
            </motion.div>

            {/* Main Editorial Headline */}
            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.15] mb-5 sm:mb-6"
            >
              Handcrafted Heritage, <br />
              <span className="italic text-[#e9d69e] font-serif font-light">
                Contemporary Grace.
              </span>
            </motion.h1>

            {/* Couture Description */}
            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className="text-xs sm:text-sm md:text-base text-[#d1c7bc] font-light leading-relaxed max-w-xl mb-6 sm:mb-8"
            >
              Immerse yourself in authentic Pakistani haute couture: pure Rawaan silks, featherlight chiffons, and intricate Old Lahore zardozi work. Delivered to your doorstep with nationwide Cash on Delivery.
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className="flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <button
                id="btn-hero-explore"
                onClick={onExploreClick}
                className="group relative px-6 sm:px-8 py-3 sm:py-3.5 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded shadow-lg hover:bg-[#e4c256] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 overflow-hidden cursor-pointer"
              >
                {/* Subtle gold shimmer line */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                id="btn-hero-stylist-consult"
                onClick={onOpenStylist}
                className="px-5 sm:px-6 py-3 sm:py-3.5 bg-[#241f1c]/90 text-[#faf8f5] border border-[#d4af37]/50 font-medium text-xs uppercase tracking-[0.15em] rounded hover:bg-[#342c27] hover:text-[#e9d69e] transition-all flex items-center gap-2 backdrop-blur-md cursor-pointer hover:border-[#d4af37]"
              >
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <span>Consult AI Stylist</span>
              </button>
            </motion.div>
          </div>

          {/* Right Column: Layered Haute Couture Mehrab Arch Lookbook (Desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.3, ease: LUXURY_EASE }}
            className="hidden lg:flex lg:col-span-5 justify-center relative select-none"
          >
            {/* Ambient Golden Glow behind Arch */}
            <div className="absolute -inset-6 bg-gradient-to-tr from-[#d4af37]/25 via-transparent to-[#d4af37]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Architectural Mehrab Arch Frame */}
            <div className="relative w-full max-w-[340px] aspect-[3/4.4] rounded-t-[140px] rounded-b-xl border border-[#d4af37]/50 shadow-2xl bg-[#1c1917]/85 backdrop-blur-md overflow-hidden p-2 group">
              <div className="w-full h-full rounded-t-[132px] rounded-b-lg overflow-hidden relative">
                {/* Campaign Image with top-center focal positioning */}
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80"
                  alt="Haute Couture Campaign Ensemble"
                  className="w-full h-full object-cover object-[center_top] group-hover:scale-105 transition-transform duration-1000 ease-out"
                />

                {/* Subtle Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Gilded Heritage Tag (Top) */}
                <div className="absolute top-6 inset-x-0 flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#d4af37]/40 text-[10px] uppercase tracking-[0.2em] text-[#e9d69e] font-medium font-urdu">
                    خالص راوان سلک · شاہکار
                  </span>
                </div>

                {/* Floating Atelier Badge (Bottom) */}
                <div className="absolute bottom-4 inset-x-3 p-3 rounded-lg bg-black/75 backdrop-blur-md border border-[#d4af37]/40 text-left">
                  <div className="flex items-center justify-between text-[10px] text-[#d4af37] font-semibold uppercase tracking-wider mb-0.5">
                    <span>Gul-e-Noor Peshwas</span>
                    <span>Rs. 68,500</span>
                  </div>
                  <p className="text-[10px] text-[#d1c7bc] font-light leading-snug">
                    Hand-stitched 80g pure Pakistani raw silk with antique gold zardozi &amp; tilla work.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Highlights Bar with Subtle Stagger */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-white/10 text-xs text-[#d1c7bc]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#241f1c] flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30 flex-shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Express Nationwide</p>
              <p className="text-[11px] text-[#a8a29e]">Free dispatch &gt; Rs. 5,000</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#241f1c] flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30 flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Cash on Delivery</p>
              <p className="text-[11px] text-[#a8a29e]">Pay upon parcel arrival</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#241f1c] flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30 flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">100% Pure Fabrics</p>
              <p className="text-[11px] text-[#a8a29e]">Raw silk, lawn & chiffon</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#241f1c] flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30 flex-shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Easy 7-Day Exchange</p>
              <p className="text-[11px] text-[#a8a29e]">Hassle-free doorstep pickup</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
