import type { SyntheticEvent } from 'react';

/**
 * Image Utilities and Luxury Fallbacks for Sheikh Iqbal Cloth & Boutique Centre
 * Prevents broken images, blank placeholders, and aspect-ratio distortion.
 */

// Elegant SVG fallback with antique gold geometric embroidery border & luxury boutique branding
export const SHEIKH_IQBAL_FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1066" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1c1917"/>
      <stop offset="50%" stop-color="#141210"/>
      <stop offset="100%" stop-color="#0c0a09"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e9d69e"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#9e7d23"/>
    </linearGradient>
    <pattern id="jaaliGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 40 20 L 20 40 L 0 20 Z" fill="none" stroke="rgba(212,175,55,0.06)" stroke-width="1"/>
      <circle cx="20" cy="20" r="3" fill="none" stroke="rgba(212,175,55,0.08)" stroke-width="0.75"/>
    </pattern>
  </defs>
  
  <!-- Canvas Base -->
  <rect width="800" height="1066" fill="url(#bgGrad)"/>
  <rect width="800" height="1066" fill="url(#jaaliGrid)"/>
  
  <!-- Ornate Outer Border -->
  <rect x="36" y="36" width="728" height="994" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-opacity="0.5"/>
  <rect x="46" y="46" width="708" height="974" fill="none" stroke="#d4af37" stroke-width="0.75" stroke-opacity="0.25"/>
  
  <!-- Corner Mehrab Accents -->
  <path d="M 36 66 L 66 36 M 764 66 L 734 36 M 36 1000 L 66 1030 M 764 1000 L 734 1030" stroke="#d4af37" stroke-width="1.5" stroke-opacity="0.7"/>
  
  <!-- Central Emblem & Arch Motif -->
  <g transform="translate(400, 480)" text-anchor="middle">
    <!-- Traditional Arch Outline -->
    <path d="M -90 60 C -90 -40, -50 -100, 0 -130 C 50 -100, 90 -40, 90 60 Z" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-opacity="0.6"/>
    <circle cx="0" cy="-60" r="14" fill="none" stroke="#d4af37" stroke-width="1" stroke-opacity="0.5"/>
    <circle cx="0" cy="-60" r="4" fill="#d4af37" fill-opacity="0.7"/>

    <!-- Urdu Monogram -->
    <text y="-5" font-family="'Noto Nastaliq Urdu', serif" font-size="34" fill="#e9d69e" opacity="0.95">شیخ اقبال</text>
    
    <!-- English Center Title -->
    <text y="38" font-family="'Cormorant Garamond', Georgia, serif" font-size="22" font-weight="600" letter-spacing="4" fill="#ffffff" opacity="0.95">SHEIKH IQBAL</text>
    <text y="62" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" letter-spacing="3" fill="#d4af37" opacity="0.85">CLOTH &amp; BOUTIQUE CENTRE</text>
    <text y="82" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" letter-spacing="2" fill="#a8a29e" opacity="0.75">HAUTE COUTURE &amp; BESPOKE PREI</text>
  </g>
</svg>
`)}`;

/**
 * Validates and safely retrieves a product or category image URL.
 * Never returns empty string or null.
 */
export function getSafeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return SHEIKH_IQBAL_FALLBACK_IMAGE;
  }
  return url.trim();
}

/**
 * Graceful error handler to attach to any <img> element onError prop.
 * Swaps to the high-res luxury fallback without infinite loops.
 */
export function handleImageError(e: SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  if (target.src !== SHEIKH_IQBAL_FALLBACK_IMAGE) {
    target.src = SHEIKH_IQBAL_FALLBACK_IMAGE;
  }
}
