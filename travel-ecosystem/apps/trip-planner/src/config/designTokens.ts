/**
 * Design Tokens - NomadicNook Design System
 * 
 * Centralized design tokens following 8px grid system
 * Implements UX checks #51-60 (Design System Foundation)
 */

export const designTokens = {
  // #51: 8px Grid System
  grid: {
    base: 8,
    unit: (multiplier: number) => `${multiplier * 8}px`,
  },

  // #52-53: Color Palette (3-4 primary colors with semantic tokens)
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main brand
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6', // Accent
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    accent: {
      cyan: '#06b6d4',
      purple: '#a855f7',
      emerald: '#10b981',
      amber: '#f59e0b',
    },
    
    // #68: Semantic Colors
    semantic: {
      success: {
        light: '#d1fae5',
        DEFAULT: '#10b981',
        dark: '#065f46',
      },
      warning: {
        light: '#fef3c7',
        DEFAULT: '#f59e0b',
        dark: '#92400e',
      },
      error: {
        light: '#fee2e2',
        DEFAULT: '#ef4444',
        dark: '#991b1b',
      },
      info: {
        light: '#dbeafe',
        DEFAULT: '#3b82f6',
        dark: '#1e40af',
      },
    },

    // Neutrals for readability
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },

  // #54: Typography Scale (fluid with clamp)
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      display: '"Inter", -apple-system, sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },
    
    // #72: Fluid typography with clamp()
    fontSize: {
      xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', // 12-14px
      sm: 'clamp(0.875rem, 0.8rem + 0.35vw, 1rem)',    // 14-16px
      base: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)', // 16-18px
      lg: 'clamp(1.125rem, 1rem + 0.5vw, 1.25rem)',    // 18-20px
      xl: 'clamp(1.25rem, 1.1rem + 0.65vw, 1.5rem)',   // 20-24px
      '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',  // 24-30px
      '3xl': 'clamp(1.875rem, 1.6rem + 1.4vw, 2.25rem)', // 30-36px
      '4xl': 'clamp(2.25rem, 1.9rem + 1.75vw, 3rem)',  // 36-48px
      '5xl': 'clamp(3rem, 2.5rem + 2.5vw, 3.75rem)',   // 48-60px
    },

    // #75: Optimal line heights
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
      loose: '2',
    },

    // Font weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900',
    },

    // #74: Limit line length
    maxWidth: {
      prose: '65ch', // 60-70 characters
      narrow: '45ch',
      wide: '80ch',
    },
  },

  // #56: Spacing tokens (8px grid)
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
    '4xl': '6rem',  // 96px
    '5xl': '8rem',  // 128px
  },

  // #57: Shadow scale
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },

  // #58: Border radius tokens
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // #59: Animation durations
  animation: {
    duration: {
      fast: '150ms',
      base: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    
    // #102: Easing functions
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      natural: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy
      smooth: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)', // Smooth
    },
  },

  // #81: Minimum touch targets
  touchTarget: {
    min: '44px',
    comfortable: '48px',
    large: '56px',
  },

  // #84: Responsive breakpoints
  breakpoints: {
    xs: '375px',  // Mobile small
    sm: '640px',  // Mobile large
    md: '768px',  // Tablet
    lg: '1024px', // Desktop
    xl: '1280px', // Desktop large
    '2xl': '1536px', // Desktop extra large
  },

  // #86: Z-index scale
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    popover: 50,
    toast: 60,
    tooltip: 70,
  },
} as const;

// Type helpers
export type ColorToken = keyof typeof designTokens.colors;
export type SpacingToken = keyof typeof designTokens.spacing;
export type ShadowToken = keyof typeof designTokens.shadows;
export type RadiusToken = keyof typeof designTokens.borderRadius;
export type BreakpointToken = keyof typeof designTokens.breakpoints;

// Helper functions
export const getColor = (color: string) => {
  const parts = color.split('.');
  let value: any = designTokens.colors;
  
  for (const part of parts) {
    value = value?.[part];
  }
  
  return value || color;
};

export const getSpacing = (key: SpacingToken) => designTokens.spacing[key];
export const getShadow = (key: ShadowToken) => designTokens.shadows[key];
export const getRadius = (key: RadiusToken) => designTokens.borderRadius[key];
