/**
 * Luxury Motion & Device Capabilities Utility for Sheikh Iqbal Cloth & Boutique Centre
 * Curated easing curves, spring configs, and device capability detectors.
 */

// Haute Couture Easing Curves (Quintic and Expo curves for slow, intentional, regal motion)
export const LUXURY_EASE = [0.22, 1, 0.36, 1] as const; // Smooth luxury deceleration
export const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as const; // Editorial campaign reveal
export const SILK_DRAPE_EASE = [0.25, 0.1, 0.25, 1] as const; // Organic heavy textile glide

// Spring Configurations for Physical Interactions
export const LUXURY_SPRING = {
  stiffness: 120,
  damping: 24,
  mass: 0.8,
};

export const GENTLE_SPRING = {
  stiffness: 80,
  damping: 20,
  mass: 1.2,
};

/**
 * Checks if the user prefers reduced motion
 */
export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detects if WebGL (1 or 2) is supported and not hardware-disabled
 */
export function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!(gl && gl instanceof WebGLRenderingContext || (window.WebGL2RenderingContext && gl instanceof WebGL2RenderingContext));
  } catch (e) {
    return false;
  }
}

/**
 * Detects if the device is a touch/mobile device
 */
export function isMobileOrTouch(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth < 768
  );
}

/**
 * Clamps a number between min and max
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}
