/**
 * SelectionFAB - Floating Action Button
 * Appears when 1+ attractions selected, triggers optimization modal
 * 56px circular button with badge, smooth animations
 */

import React from 'react';
import { Map } from 'lucide-react';
import type { SelectionFABProps } from '../types/trip-planner.types';

export const SelectionFAB: React.FC<SelectionFABProps> = ({
  count,
  onClick,
  disabled = false
}) => {
  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        fixed bottom-4 right-4 z-50
        w-14 h-14 rounded-full
        bg-blue-600 hover:bg-blue-700 active:bg-blue-800
        text-white shadow-xl hover:shadow-2xl
        flex items-center justify-center
        transition-all duration-300 ease-out
        transform hover:scale-110 active:scale-95
        focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        animate-[slideInUp_0.3s_ease-out]
      `}
      aria-label={`Plan trip for ${count} selected attraction${count > 1 ? 's' : ''}`}
    >
      {/* Icon */}
      <Map className="w-6 h-6" strokeWidth={2.5} />

      {/* Badge - count indicator */}
      <span
        className={`
          absolute -top-1 -right-1
          w-6 h-6 rounded-full
          bg-red-500 text-white
          text-xs font-bold
          flex items-center justify-center
          border-2 border-white
          animate-[pulse_2s_ease-in-out_infinite]
        `}
        aria-label={`${count} attractions`}
      >
        {count}
      </span>

      {/* Ripple effect on click */}
      <span className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-300" />
    </button>
  );
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
