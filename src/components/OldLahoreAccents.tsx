import React from 'react';

/**
 * Authentic Old Lahore architectural motifs and filigree for Sheikh Iqbal Cloth & Boutique Centre.
 * Inspired by Shahi Qila (Lahore Fort) Sheesh Mahal and Wazir Khan jaali stonework.
 */

// Elegant Cusped Mughal Arch Divider
export const MughalArchDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-3 my-6 ${className}`}>
    <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-[#d4af37]" />
    <svg
      width="24"
      height="14"
      viewBox="0 0 24 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#d4af37]"
    >
      <path
        d="M2 13C2 8 6 3 12 1C18 3 22 8 22 13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="5.5" r="1.2" fill="currentColor" />
    </svg>
    <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#d4af37]/50 to-[#d4af37]" />
  </div>
);

// Delicate Mughal Jaali Watermark Pattern for Backgrounds
export const JaaliWatermark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`absolute pointer-events-none opacity-[0.035] select-none ${className}`}
    aria-hidden="true"
  >
    <svg width="240" height="240" viewBox="0 0 80 80" fill="currentColor">
      <pattern id="jaali-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        {/* Octagonal jaali geometry */}
        <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#jaali-grid)" />
    </svg>
  </div>
);

// Zardozi Corner Floral Motif
export const ZardoziCorner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`text-[#d4af37]/60 pointer-events-none select-none ${className}`}
  >
    <path
      d="M2 30V12C2 6.47715 6.47715 2 12 2H30"
      stroke="currentColor"
      strokeWidth="1"
      strokeDasharray="2 2"
    />
    <path
      d="M6 30V14C6 9.58172 9.58172 6 14 6H30"
      stroke="currentColor"
      strokeWidth="0.75"
    />
    <circle cx="14" cy="14" r="2.5" stroke="currentColor" strokeWidth="0.75" />
  </svg>
);
