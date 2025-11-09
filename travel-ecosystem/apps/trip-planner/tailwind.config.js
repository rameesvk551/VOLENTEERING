/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // UX Check #51-60: Design System Foundation
      
      // #52-53: Brand Color Palette
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
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
          500: '#8b5cf6',
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
        // #68: Semantic colors
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

      // #54: Typography scale with fluid sizing
      fontSize: {
        xs: ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.5' }],
        sm: ['clamp(0.875rem, 0.8rem + 0.35vw, 1rem)', { lineHeight: '1.5' }],
        base: ['clamp(1rem, 0.95rem + 0.25vw, 1.125rem)', { lineHeight: '1.75' }],
        lg: ['clamp(1.125rem, 1rem + 0.5vw, 1.25rem)', { lineHeight: '1.75' }],
        xl: ['clamp(1.25rem, 1.1rem + 0.65vw, 1.5rem)', { lineHeight: '1.75' }],
        '2xl': ['clamp(1.5rem, 1.3rem + 1vw, 1.875rem)', { lineHeight: '1.5' }],
        '3xl': ['clamp(1.875rem, 1.6rem + 1.4vw, 2.25rem)', { lineHeight: '1.25' }],
        '4xl': ['clamp(2.25rem, 1.9rem + 1.75vw, 3rem)', { lineHeight: '1.25' }],
        '5xl': ['clamp(3rem, 2.5rem + 2.5vw, 3.75rem)', { lineHeight: '1' }],
      },

      // #56: Spacing scale (8px grid)
      spacing: {
        '4.5': '1.125rem', // 18px
        '13': '3.25rem',   // 52px
        '15': '3.75rem',   // 60px
        '18': '4.5rem',    // 72px
        '88': '22rem',     // 352px
        '112': '28rem',    // 448px
        '128': '32rem',    // 512px
      },

      // #57: Shadow scale with subtle depths
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'glow': '0 0 20px rgb(59 130 246 / 0.5)',
      },

      // #58: Border radius tokens
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      // #59: Animation durations
      transitionDuration: {
        '150': '150ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
      },

      // #102: Custom easing functions
      transitionTimingFunction: {
        'natural': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
      },

      // #86: Z-index scale
      zIndex: {
        'dropdown': '10',
        'sticky': '20',
        'overlay': '30',
        'modal': '40',
        'popover': '50',
        'toast': '60',
        'tooltip': '70',
      },

      // #74: Max width for readability
      maxWidth: {
        'prose': '65ch',
        'narrow': '45ch',
        'wide': '80ch',
      },

      // #81: Minimum touch targets
      minHeight: {
        'touch': '44px',
        'comfortable': '48px',
      },
      minWidth: {
        'touch': '44px',
        'comfortable': '48px',
      },

      // Custom animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [
    // #167: Focus-visible plugin
    function({ addUtilities }) {
      addUtilities({
        '.focus-ring': {
          '@apply outline-none ring-2 ring-primary-500 ring-offset-2': {},
        },
        '.focus-ring-inset': {
          '@apply outline-none ring-2 ring-inset ring-primary-500': {},
        },
      });
    },
  ],
}
