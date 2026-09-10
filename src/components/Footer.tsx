import React, { useState } from 'react';
import { Phone, Mail, MapPin, Truck, ShieldCheck, Heart, Sparkles, Check } from 'lucide-react';
import { MughalArchDivider, JaaliWatermark } from './OldLahoreAccents';

interface FooterProps {
  onSelectCategory: (slug: string) => void;
  onOpenStylist: () => void;
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenStylist,
  onNavigateAdmin,
}) => {
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setNewsletterSubscribed(true);
      setEmailInput('');
    }
  };
  return (
    <footer className="bg-[#141210] text-[#faf8f5] border-t border-[#d4af37]/30 relative overflow-hidden">
      <JaaliWatermark className="top-8 right-8 text-[#d4af37]" />
      <JaaliWatermark className="bottom-8 left-8 text-[#d4af37]" />

      {/* Upper Newsletter & VIP Club */}
      <div className="border-b border-white/10 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-[0.25em] text-[#d4af37] font-semibold">
              Privileged Patronage · شاہی حلقہ
            </span>
            <h3 className="font-serif text-2xl font-bold text-white">
              Join the Sheikh Iqbal Boutique Circle
            </h3>
            <p className="text-xs text-[#a8a29e]">
              Be the first to receive preview invites for bridal couture trunk shows and limited festive drops.
            </p>
          </div>

          {newsletterSubscribed ? (
            <div className="flex items-center gap-2.5 px-5 py-3 rounded bg-[#241f1c] border border-[#d4af37]/60 text-[#e9d69e] text-xs">
              <Check className="w-4 h-4 text-[#d4af37]" />
              <span>Shukriya! You have been enrolled in the Sheikh Iqbal Boutique Circle.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex w-full md:w-auto max-w-md gap-2"
            >
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-2.5 rounded bg-white/10 border border-white/20 text-xs text-white placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d4af37]"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-[#e4c256] transition-colors whitespace-nowrap cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-xs text-[#a8a29e] relative z-10">
        {/* Atelier Bio */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-white">
              Sheikh Iqbal
            </span>
            <span className="font-urdu text-lg sm:text-xl text-[#d4af37]">
              شیخ اقبال
            </span>
          </div>
          <p className="text-[11px] tracking-widest text-[#d4af37] font-medium uppercase">
            Cloth &amp; Boutique Centre
          </p>
          <p className="leading-relaxed text-[#d1c7bc] text-xs">
            Sheikh Iqbal Cloth &amp; Boutique Centre stands at the crossroads of authentic heritage fabrics, unstitched collections, and bespoke boutique tailoring. Every weave is selected with intention, offering pure natural raw silks, organzas, velvets, and chiffons.
          </p>
          <div className="space-y-2 pt-2 text-[#e7dfd5]">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
              <span>Boutique Address: [ADDRESS]</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
              <span>Contact: [PHONE NUMBER]</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
              <span>WhatsApp: [WHATSAPP NUMBER]</span>
            </p>
          </div>
          <div className="pt-2 flex items-center gap-3 text-xs">
            <span className="text-white font-medium">Social:</span>
            <span className="text-[#d4af37]">[INSTAGRAM]</span>
            <span className="text-[#78716c]">|</span>
            <span className="text-[#d4af37]">[FACEBOOK]</span>
          </div>
        </div>

        {/* Collections Links */}
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-white">
            Collections
          </h4>
          <ul className="space-y-2">
            {['Luxury Pret', 'Festive Formals', 'Festive Unstitched', 'Bridal Couture', 'Men’s Sartorial', 'Heirloom Shawls'].map(item => (
              <li key={item}>
                <button
                  onClick={() => onSelectCategory(item.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  className="hover:text-[#d4af37] transition-colors cursor-pointer"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Client Care & Policies */}
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-white">
            Client Services
          </h4>
          <ul className="space-y-2">
            <li><span>Cash on Delivery (COD) Policy</span></li>
            <li><span>Nationwide Courier Tracking (TCS)</span></li>
            <li><span>7-Day Doorstep Exchange Guarantee</span></li>
            <li><span>Custom Made-to-Measure Sizing</span></li>
            <li>
              <button onClick={onOpenStylist} className="text-[#d4af37] hover:underline flex items-center gap-1 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Royal Stylist Consultation</span>
              </button>
            </li>
            <li>
              <button onClick={onNavigateAdmin} className="text-[#a8a29e] hover:text-white underline cursor-pointer">
                Atelier Director Portal
              </button>
            </li>
          </ul>
        </div>

        {/* Logistics & Payment Badges */}
        <div className="space-y-4">
          <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-white">
            Secure Logistics
          </h4>
          <p className="text-[11px] leading-relaxed">
            Parcels are sealed and delivered via verified Pakistani courier networks with real-time SMS dispatch updates.
          </p>
          <div className="p-3 bg-white/5 rounded border border-white/10 space-y-2 text-[11px]">
            <p className="font-semibold text-white">Accepted in Pakistan:</p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-[#d4af37]">
              <span className="px-2 py-0.5 bg-black/50 rounded border border-white/10">Cash on Delivery</span>
              <span className="px-2 py-0.5 bg-black/50 rounded border border-white/10">JazzCash</span>
              <span className="px-2 py-0.5 bg-black/50 rounded border border-white/10">Easypaisa</span>
              <span className="px-2 py-0.5 bg-black/50 rounded border border-white/10">Raast SBP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10 py-6 text-center text-[11px] text-[#78716c] relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Sheikh Iqbal Cloth &amp; Boutique Centre. All rights reserved.</span>
          <span className="text-[#d4af37]">Crafted with Handcrafted Precision & Haute Couture Aesthetics</span>
        </div>
      </div>
    </footer>
  );
};
