import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, Brain, ChevronDown, ChevronUp, ShoppingBag, Eye, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { formatPKR } from '../utils/format';
import { useCart } from '../context/CartContext';
import { LUXURY_EASE } from '../utils/motion';
import { MughalArchDivider, JaaliWatermark } from './OldLahoreAccents';
import { getSafeImageUrl, handleImageError } from '../utils/imageFallback';

interface AiStylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

// Bespoke Golden Tilla Thread Embroidery Waveform Loading Animation
const GoldenThreadLoading: React.FC = () => {
  const [statusIdx, setStatusIdx] = useState(0);
  const statusPhrases = [
    'Consulting the Old Lahore Royal Bridal Archives...',
    'Harmonizing pure silk weights with antique zardozi motifs...',
    'Curating bespoke haute couture silhouettes for your event...',
    'Refining palette harmony with pure raw silk and tilla work...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx(prev => (prev + 1) % statusPhrases.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [statusPhrases.length]);

  return (
    <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4 bg-[#141210] rounded-xl border border-[#d4af37]/40 shadow-inner relative overflow-hidden">
      <JaaliWatermark className="inset-0 text-[#d4af37]" />

      {/* Pulsing Royal Emblem */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-[#d4af37]/30 animate-ping opacity-35" />
        <div className="w-12 h-12 rounded-full bg-[#241f1c] border border-[#d4af37] flex items-center justify-center text-[#d4af37] shadow-lg shadow-black/50">
          <Sparkles className="w-5 h-5 text-[#d4af37] animate-pulse" />
        </div>
      </div>

      {/* Undulating Golden Thread SVG */}
      <div className="w-48 h-8 flex items-center justify-center">
        <svg viewBox="0 0 200 40" className="w-full h-full stroke-[#d4af37]">
          <path
            d="M 10 20 Q 35 5, 60 20 T 110 20 T 160 20 T 190 20"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-pulse"
          />
          <path
            d="M 10 20 Q 35 35, 60 20 T 110 20 T 160 20 T 190 20"
            fill="none"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.65"
          />
        </svg>
      </div>

      {/* Dynamic Status Callout */}
      <div className="space-y-1 z-10">
        <p className="font-serif text-sm font-semibold text-[#e9d69e] tracking-wide animate-fade">
          {statusPhrases[statusIdx]}
        </p>
        <p className="text-[11px] text-[#a8a29e] uppercase tracking-widest font-sans">
          Boutique Stylist · Gemini Sartorial Intelligence
        </p>
      </div>
    </div>
  );
};

export const AiStylistDrawer: React.FC<AiStylistDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const { addToCart } = useCart();
  const [query, setQuery] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budgetPKR, setBudgetPKR] = useState<string>('');
  const [city, setCity] = useState('Lahore');
  const [preferredFabric, setPreferredFabric] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    stylistAdvice: string;
    recommendedProductIds: string[];
    stylingTips: string[];
    suggestedColorPalette: string[];
    thoughtProcess?: string;
  } | null>(null);

  const [showThinking, setShowThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const quickPrompts = [
    { label: 'Mehndi / Mayun Outfit', q: 'I need a vibrant, festive ensemble for an upcoming Mehndi in Lahore. Something with rich mustard, lime, or rust and handcrafted zardozi.' },
    { label: 'Walima / Barat Guest', q: 'Looking for an elegant, formal luxury pret or unstitched ensemble for an evening Walima in Karachi. Prefer raw silk or embellished chiffon.' },
    { label: 'Summer Pret Kurti', q: 'Suggest a breathable yet chic pure fabric outfit for daytime high-tea and festive gatherings in warm weather.' },
    { label: 'Heirloom Shawl Pairing', q: 'Which outfit pairs best with a handcrafted Kashmiri or velvet shawl for an outdoor winter wedding?' },
    { label: 'Bespoke Men’s Kurta', q: 'Recommend a royal raw silk kurta pajama set with subtle resham hand embroidery for an Eid or Nikah ceremony.' },
  ];

  const handleConsult = async (customQuery?: string) => {
    const activeQuery = customQuery || query;
    if (!activeQuery.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: activeQuery,
          occasion: occasion || undefined,
          budgetPKR: budgetPKR ? Number(budgetPKR) : undefined,
          city,
          preferredFabric: preferredFabric || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to consult stylist');
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('The Royal Stylist is temporarily occupied. ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // Find products matching recommended IDs
  const recommendedProducts = result?.recommendedProductIds
    ?.map(id => products.find(p => p.id === id))
    .filter(Boolean) as Product[];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with Soft Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            {/* Drawer Container with Smooth Luxury Slide */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: LUXURY_EASE }}
              className="w-screen max-w-2xl bg-[#faf8f5] shadow-2xl flex flex-col border-l border-[#d4af37]/50 relative"
            >
              {/* Header with Royal Pakistani Crest */}
              <div className="p-6 bg-[#141210] text-[#faf8f5] flex items-center justify-between border-b border-[#d4af37]/40 relative overflow-hidden">
                <JaaliWatermark className="top-0 right-10 text-[#d4af37]" />

                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-[#241f1c] border border-[#d4af37] flex items-center justify-center text-[#d4af37] shadow-sm">
                    <Sparkles className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-lg font-bold text-white tracking-wide">
                        Boutique Stylist · مشیر شیخ اقبال
                      </h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37] text-black font-bold uppercase tracking-wider shadow-sm">
                        Haute Couturière
                      </span>
                    </div>
                    <p className="text-[11px] text-[#d1c7bc]">
                      Chief Stylist &amp; Sartorial Advisor · Sheikh Iqbal Boutique
                    </p>
                  </div>
                </div>

                <button
                  id="btn-close-ai-stylist-drawer"
                  onClick={onClose}
                  className="p-2 text-[#a8a29e] hover:text-white rounded-full hover:bg-white/10 transition-colors relative z-10 cursor-pointer"
                  aria-label="Close Stylist Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                {/* Introductory Greeting */}
                <div className="p-4 bg-white rounded-lg border border-[#e7dfd5] text-[#44403c] space-y-2 shadow-xs">
                  <p className="font-serif text-sm font-semibold text-[#1c1917] flex items-center gap-2">
                    <span className="text-[#9e7d23]">السلام علیکم!</span>
                    <span>Welcome to Sheikh Iqbal Cloth &amp; Boutique Centre.</span>
                  </p>
                  <p className="leading-relaxed">
                    Whether you are preparing for a lavish Lahore winter wedding, a seaside Karachi reception, or bespoke festive Eid attire, share your occasion, aesthetic taste, or silhouette ideas. I will curate an ensemble matched to your grace.
                  </p>
                </div>

                {/* Quick Inspiration Pills */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-widest block">
                    Popular Styling Consultations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(p.q);
                          handleConsult(p.q);
                        }}
                        className="px-3 py-1.5 bg-white border border-[#d1c7bc] hover:border-[#9e7d23] hover:bg-[#faf8f5] text-[#44403c] hover:text-[#1c1917] rounded-full text-[11px] font-medium transition-all cursor-pointer shadow-2xs"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Form */}
                <div className="bg-white p-4 rounded-lg border border-[#e7dfd5] space-y-3 shadow-xs">
                  <div>
                    <label className="block font-semibold text-[#1c1917] mb-1">
                      Your Query or Style Inspiration:
                    </label>
                    <textarea
                      id="textarea-ai-stylist-query"
                      rows={3}
                      placeholder="e.g. I am attending my brother's Mehndi in November. I want an opulent pure raw silk outfit with antique zari work under Rs. 40,000..."
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      className="w-full p-2.5 border border-[#d1c7bc] rounded bg-[#faf8f5] focus:outline-none focus:border-[#9e7d23] text-xs"
                    />
                  </div>

                  {/* Optional Refinements */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-[#78716c] mb-1">
                        Occasion
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Barat / Eid"
                        value={occasion}
                        onChange={e => setOccasion(e.target.value)}
                        className="w-full p-2 border border-[#d1c7bc] rounded text-xs bg-[#faf8f5]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-[#78716c] mb-1">
                        Max Budget (PKR)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 35000"
                        value={budgetPKR}
                        onChange={e => setBudgetPKR(e.target.value)}
                        className="w-full p-2 border border-[#d1c7bc] rounded text-xs bg-[#faf8f5]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-[#78716c] mb-1">
                        City (Weather)
                      </label>
                      <select
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full p-2 border border-[#d1c7bc] rounded text-xs bg-[#faf8f5]"
                      >
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Multan">Multan</option>
                        <option value="International / Overseas">Overseas</option>
                      </select>
                    </div>
                  </div>

                  <button
                    id="btn-consult-stylist-submit"
                    onClick={() => handleConsult()}
                    disabled={isLoading || !query.trim()}
                    className="w-full py-3 px-4 bg-[#141210] text-[#d4af37] border border-[#d4af37]/60 font-bold text-xs uppercase tracking-widest rounded hover:bg-[#241f1c] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-[#d4af37]" />
                    <span>Consult Boutique Stylist</span>
                  </button>
                </div>

                {/* Loading State: Bespoke Golden Thread Waveform */}
                {isLoading && <GoldenThreadLoading />}

                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* Results Display */}
                {result && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: LUXURY_EASE }}
                    className="space-y-6 pt-2"
                  >
                    {/* Reasoning Accordion */}
                    {result.thoughtProcess && (
                      <div className="bg-[#141210] text-[#faf8f5] rounded-lg border border-[#d4af37]/30 overflow-hidden shadow-sm">
                        <button
                          onClick={() => setShowThinking(!showThinking)}
                          className="w-full p-3 flex items-center justify-between text-xs font-semibold text-[#e9d69e] hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-[#d4af37]" />
                            <span>Sartorial Reasoning & Synthesis (Gemini 3.1 Pro)</span>
                          </div>
                          {showThinking ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {showThinking && (
                          <div className="p-4 border-t border-[#d4af37]/20 text-[11px] text-[#d1c7bc] space-y-2 whitespace-pre-wrap font-mono leading-relaxed bg-black/40">
                            {result.thoughtProcess}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stylist Recommendation Letter */}
                    <div className="p-5 bg-white rounded-lg border border-[#e7dfd5] shadow-sm space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-[#f0eae1] pb-2">
                        <h3 className="font-serif text-base font-bold text-[#1c1917]">
                          Curated Sartorial Advice
                        </h3>
                        <span className="font-urdu text-[#9e7d23] text-sm">مشورہ شیخ اقبال بوتیک</span>
                      </div>
                      <div className="text-[#44403c] leading-relaxed whitespace-pre-wrap">
                        {result.stylistAdvice}
                      </div>

                      {/* Color Palette */}
                      {result.suggestedColorPalette?.length > 0 && (
                        <div className="pt-3 border-t border-[#f0eae1]">
                          <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider block mb-1.5">
                            Harmonious Color Palette:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {result.suggestedColorPalette.map((color, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 bg-[#faf8f5] border border-[#d1c7bc] text-[#1c1917] rounded-full text-[11px] font-medium shadow-2xs"
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recommended Ensembles from Sheikh Iqbal Catalog */}
                    {recommendedProducts.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-serif text-sm font-bold text-[#1c1917] flex items-center justify-between">
                          <span>Matching Pieces in Sheikh Iqbal Boutique Catalog:</span>
                          <span className="text-xs text-[#9e7d23] font-sans font-semibold">
                            {recommendedProducts.length} Found
                          </span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {recommendedProducts.map(p => (
                            <div
                              key={p.id}
                              className="bg-white rounded-lg border border-[#e7dfd5] p-3 flex gap-3 shadow-xs hover:border-[#d4af37] transition-all hover:shadow-md"
                            >
                              <img
                                src={getSafeImageUrl(p.images[0])}
                                alt={p.title}
                                onError={handleImageError}
                                className="w-16 h-20 object-cover object-[center_top] rounded bg-[#faf8f5] flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <h5 className="font-semibold text-xs text-[#1c1917] truncate">{p.title}</h5>
                                  <p className="text-[10px] text-[#78716c] uppercase">{p.fabric}</p>
                                  <p className="text-xs font-bold text-[#9e7d23] mt-0.5">
                                    {formatPKR(p.salePrice || p.price)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => onSelectProduct(p)}
                                    className="px-2 py-1 bg-[#f5f0ea] hover:bg-[#ede7df] text-[#1c1917] rounded text-[10px] font-semibold uppercase cursor-pointer"
                                  >
                                    View Piece
                                  </button>
                                  <button
                                    onClick={() => {
                                      addToCart({
                                        productId: p.id,
                                        title: p.title,
                                        slug: p.slug,
                                        price: p.price,
                                        salePrice: p.salePrice,
                                        image: p.images[0],
                                        size: p.sizes[0] || 'M',
                                        color: p.colors[0] || 'Default',
                                        stitching: 'ready_to_wear',
                                        quantity: 1,
                                        stockAvailable: p.stock,
                                      });
                                    }}
                                    className="px-2 py-1 bg-[#141210] hover:bg-[#9e7d23] text-white rounded text-[10px] font-semibold uppercase cursor-pointer"
                                  >
                                    + Add to Bag
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Styling & Jewelry Tips */}
                    {result.stylingTips?.length > 0 && (
                      <div className="p-4 bg-[#f5f0ea] rounded-lg border border-[#e7dfd5] space-y-2">
                        <span className="font-serif text-xs font-bold text-[#1c1917] uppercase tracking-wider block">
                          Boutique Stylist’s Finishing Touches:
                        </span>
                        <ul className="space-y-1 text-[11px] text-[#44403c] list-disc pl-4 leading-relaxed">
                          {result.stylingTips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
