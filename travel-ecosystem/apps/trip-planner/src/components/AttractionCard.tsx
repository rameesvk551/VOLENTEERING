/**
 * AttractionCard Component
 * Mobile-first card for attraction selection with large touch targets
 * Follows accessibility guidelines (WCAG 2.1 AA)
 */

import React from 'react';
import { Check } from 'lucide-react';
import type { AttractionCardProps } from '../types/trip-planner.types';

export const AttractionCard: React.FC<AttractionCardProps> = ({
  attraction,
  isSelected,
  onToggle,
  disabled = false
}) => {
  const handleClick = () => {
    if (!disabled) {
      onToggle(attraction.id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={`
        relative w-full bg-white rounded-xl shadow-sm overflow-hidden
        transition-all duration-200 ease-out cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-600 ring-offset-2' : 'hover:shadow-md'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}
      `}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      aria-label={`${attraction.name}. ${isSelected ? 'Selected' : 'Not selected'}. Press to toggle.`}
    >
      {/* Image */}
      <div className="relative w-full aspect-[3/2] bg-slate-200">
        {attraction.imageUrl ? (
          <img
            src={attraction.imageUrl}
            alt={attraction.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Checkbox overlay - 44px touch target */}
        <button
          type="button"
          className={`
            absolute top-2 right-2 w-11 h-11 
            flex items-center justify-center rounded-full
            transition-all duration-200
            ${isSelected 
              ? 'bg-blue-600 text-white shadow-lg scale-110' 
              : 'bg-white/90 text-slate-600 shadow-md hover:bg-white'
            }
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
          `}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          aria-label={`${isSelected ? 'Deselect' : 'Select'} ${attraction.name}`}
          disabled={disabled}
        >
          {isSelected && <Check className="w-5 h-5" strokeWidth={3} />}
        </button>

        {/* Rating badge */}
        {attraction.rating && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-sm font-medium rounded-md flex items-center gap-1">
            <span>⭐</span>
            <span>{attraction.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-1 line-clamp-2">
          {attraction.name}
        </h3>
        
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {attraction.description}
        </p>

        {/* Metadata row */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          {attraction.visitDurationMinutes && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {attraction.visitDurationMinutes} min
            </span>
          )}
          
          {attraction.priceLevel && (
            <span className="flex items-center gap-1">
              {'$'.repeat(attraction.priceLevel)}
            </span>
          )}

          {attraction.category && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full capitalize">
              {attraction.category}
            </span>
          )}
        </div>
      </div>

      {/* Selection indicator pulse animation */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
        </div>
      )}
    </article>
  );
};

// Skeleton loader for loading states
export const AttractionCardSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="w-full aspect-[3/2] bg-slate-200" />
      <div className="p-4">
        <div className="h-5 bg-slate-200 rounded mb-2 w-3/4" />
        <div className="h-4 bg-slate-200 rounded mb-1 w-full" />
        <div className="h-4 bg-slate-200 rounded mb-3 w-5/6" />
        <div className="flex gap-2">
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
};
