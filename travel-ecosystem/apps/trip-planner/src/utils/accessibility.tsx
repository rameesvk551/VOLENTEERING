/**
 * Accessibility Utilities - NomadicNook
 * 
 * Comprehensive accessibility helpers and hooks
 * Implements UX checks #151-200 (Accessibility & Inclusion)
 */

import { useEffect, useRef, RefObject } from 'react';

// #166-180: Keyboard Navigation Constants
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

// #169: Skip to content link
export const SkipLink: React.FC<{ targetId: string }> = ({ targetId }) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
               focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white 
               focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 
               focus:ring-primary-400 focus:ring-offset-2"
  >
    Skip to main content
  </a>
);

// #189: Visually hidden utility component
export const VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// #170: Focus trap hook for modals
export const useFocusTrap = (isActive: boolean): RefObject<HTMLElement> => {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the element that had focus before the trap
    previousFocusRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== KeyboardKeys.TAB) return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Cleanup: restore focus
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isActive]);

  return containerRef as RefObject<HTMLElement>;
};

// #167: Focus visible polyfill
export const useFocusVisible = () => {
  useEffect(() => {
    let hadKeyboardEvent = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KeyboardKeys.TAB) {
        hadKeyboardEvent = true;
      }
    };

    const handleMouseDown = () => {
      hadKeyboardEvent = false;
    };

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (hadKeyboardEvent && target) {
        target.classList.add('focus-visible');
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      target?.classList.remove('focus-visible');
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
    };
  }, []);
};

// #154: Announce to screen readers
export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcer = document.getElementById('a11y-announcer');
  if (announcer) {
    announcer.textContent = message;
    announcer.setAttribute('aria-live', priority);
  }
};

// Live region component for dynamic announcements
export const LiveRegion: React.FC = () => (
  <div
    id="a11y-announcer"
    role="status"
    aria-live="polite"
    aria-atomic="true"
    className="sr-only"
  />
);

// #171: Roving tabindex hook for grids/lists
export const useRovingTabIndex = (itemsLength: number) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case KeyboardKeys.ARROW_DOWN:
      case KeyboardKeys.ARROW_RIGHT:
        e.preventDefault();
        setActiveIndex((index + 1) % itemsLength);
        break;
      case KeyboardKeys.ARROW_UP:
      case KeyboardKeys.ARROW_LEFT:
        e.preventDefault();
        setActiveIndex((index - 1 + itemsLength) % itemsLength);
        break;
      case KeyboardKeys.HOME:
        e.preventDefault();
        setActiveIndex(0);
        break;
      case KeyboardKeys.END:
        e.preventDefault();
        setActiveIndex(itemsLength - 1);
        break;
    }
  };

  return { activeIndex, handleKeyDown, setActiveIndex };
};

// #185: Generate accessible image props
export const getImageProps = (alt: string, decorative = false) => {
  if (decorative) {
    return {
      alt: '',
      role: 'presentation',
      'aria-hidden': true,
    };
  }

  return {
    alt,
    loading: 'lazy' as const,
  };
};

// #186-187: Generate accessible link props
export const getLinkProps = (text: string, href: string, opensNewTab = false) => {
  const props: React.AnchorHTMLAttributes<HTMLAnchorElement> = {
    href,
    'aria-label': text,
  };

  if (opensNewTab) {
    props.target = '_blank';
    props.rel = 'noopener noreferrer';
    props['aria-label'] = `${text} (opens in new tab)`;
  }

  return props;
};

// #188: Icon button accessible wrapper
interface IconButtonProps {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  label,
  onClick,
  icon,
  disabled = false,
  className = '',
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={`p-2 rounded-lg transition-colors focus-visible:outline-none 
                focus-visible:ring-2 focus-visible:ring-primary-500 
                focus-visible:ring-offset-2 disabled:opacity-50 
                disabled:cursor-not-allowed ${className}`}
  >
    {icon}
    <VisuallyHidden>{label}</VisuallyHidden>
  </button>
);

// #191: Check if user prefers reduced motion
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// #196: Check if user prefers high contrast
export const usePrefersHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
};

// #199: Check if document direction is RTL
export const useIsRTL = () => {
  const [isRTL, setIsRTL] = React.useState(false);

  useEffect(() => {
    const checkDirection = () => {
      setIsRTL(document.documentElement.dir === 'rtl');
    };

    checkDirection();

    const observer = new MutationObserver(checkDirection);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });

    return () => observer.disconnect();
  }, []);

  return isRTL;
};

// #61-62: Contrast checker utility
export const meetsContrastRatio = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  // This is a simplified version - in production use a library like 'wcag-contrast'
  const ratio = calculateContrastRatio(foreground, background);
  const required = level === 'AAA' ? 7 : 4.5;
  return ratio >= required;
};

const calculateContrastRatio = (_color1: string, _color2: string): number => {
  // Simplified - implement full WCAG contrast calculation
  // Use a library like 'wcag-contrast' in production
  return 4.5; // Placeholder
};

// #192: Ensure information is not conveyed by color alone
export const ColorIndependentStatus: React.FC<{
  status: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}> = ({ status, children }) => {
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div className={`status-${status}`} role="status">
      <span aria-hidden="true">{icons[status]}</span>
      {children}
    </div>
  );
};

// Export React namespace for hooks
import React from 'react';
