/**
 * SelectionFAB - Floating Action Button
 * Appears when 2+ attractions selected, triggers optimization modal
 * 56px circular button with badge, smooth animations
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart } from 'lucide-react';
import type { SelectionFABProps } from '../types/trip-planner.types';

export const SelectionFAB: React.FC<SelectionFABProps> = ({
  count,
  onClick,
  disabled = false
}) => {
  const hasMinimumSelection = count >= 2;
  const isDisabled = disabled || !hasMinimumSelection;
  const [isMounted, setIsMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const node = document.createElement('div');
    portalRef.current = node;
    document.body.appendChild(node);
    setIsMounted(true);

    return () => {
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
        portalRef.current = null;
      }
      setIsMounted(false);
    };
  }, []);

  // Don't render FAB if less than 2 attractions selected
  if (count < 2) {
    return null;
  }

  const content = (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={`
          group relative flex items-center gap-3 rounded-full
          pl-5 pr-3 py-2 text-white shadow-2xl
          bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400
          transition-all duration-300 ease-out
          hover:translate-y-0.5 hover:shadow-[0px_12px_30px_rgba(244,63,94,0.45)]
          focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-200
          ${isDisabled ? 'opacity-60 cursor-not-allowed translate-y-0 hover:translate-y-0' : ''}
        `}
        aria-label={`Plan trip for ${count} selected attraction${count === 1 ? '' : 's'}`}
        title={isDisabled ? 'Select at least 2 attractions to enable route planning' : 'Optimize route with selected attractions'}
      >
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
          <Heart className="h-5 w-5" strokeWidth={2.5} />
          {count >= 2 && (
            <span
              className="
                absolute -top-1 -right-1
                flex h-5 w-5 items-center justify-center
                rounded-full bg-white text-rose-600 text-xs font-bold
                shadow-md border border-white/60
              "
              aria-label={`${count} attractions selected`}
            >
              {count}
            </span>
          )}
        </span>
        <span className="flex flex-col text-left">
          <span className="text-[11px] uppercase tracking-wide opacity-80">Trip</span>
          <span className="text-sm font-semibold leading-tight">Plan route</span>
        </span>
      </button>
    </div>
  );

  if (!isMounted || !portalRef.current) {
    return null;
  }

  return createPortal(content, portalRef.current);
};

// Custom keyframes for animations (add to Tailwind config)
/*
module.exports = {
  theme: {
    extend: {
      keyframes: {
        slideInUp: {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  }
}
*/
