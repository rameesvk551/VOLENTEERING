/**
 * TransportOptionCard Component
 * Individual transport option card with icon, timing, cost, and badge
 * Horizontally scrollable in a list, 120px × 140px size
 */

import React from 'react';
import { Car, Bus, Bike, Footprints, Zap, Clock, DollarSign, Repeat } from 'lucide-react';
import type { TransportOptionCardProps } from '../types/trip-planner.types';

const MODE_ICONS = {
  DRIVE: Car,
  PUBLIC_TRANSPORT: Bus,
  CYCLING: Bike,
  WALKING: Footprints,
  E_SCOOTER: Zap
};

const MODE_COLORS = {
  DRIVE: 'text-blue-600 bg-blue-50',
  PUBLIC_TRANSPORT: 'text-green-600 bg-green-50',
  CYCLING: 'text-yellow-600 bg-yellow-50',
  WALKING: 'text-purple-600 bg-purple-50',
  E_SCOOTER: 'text-orange-600 bg-orange-50'
};

const BADGE_COLORS = {
  Fastest: 'bg-blue-500',
  Cheapest: 'bg-green-500',
  'Least Walking': 'bg-purple-500',
  'Eco-Friendly': 'bg-emerald-500'
};

export const TransportOptionCard: React.FC<TransportOptionCardProps> = ({
  option,
  isSelected,
  onSelect,
  badge
}) => {
  const Icon = MODE_ICONS[option.mode as keyof typeof MODE_ICONS] || Car;
  const colorClass = MODE_COLORS[option.mode as keyof typeof MODE_COLORS] || 'text-slate-600 bg-slate-50';

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        relative flex-shrink-0 w-[120px] h-[140px]
        flex flex-col items-center justify-center gap-2
        p-3 rounded-xl transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
        ${isSelected
          ? 'bg-blue-600 text-white shadow-lg scale-105 border-2 border-blue-600'
          : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:shadow-md active:scale-95'
        }
      `}
      aria-pressed={isSelected}
      aria-label={`${option.mode} - ${formatDuration(option.durationMinutes)}, $${option.cost.toFixed(2)}${badge ? `, ${badge}` : ''}`}
    >
      {/* Badge */}
      {badge && (
        <span
          className={`
            absolute -top-2 -right-2 px-2 py-0.5 rounded-full
            text-[10px] font-bold text-white whitespace-nowrap
            shadow-md z-10
            ${BADGE_COLORS[badge as keyof typeof BADGE_COLORS] || 'bg-slate-500'}
          `}
        >
          {badge}
        </span>
      )}

      {/* Icon */}
      <div
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          transition-colors duration-200
          ${isSelected ? 'bg-white/20' : colorClass}
        `}
      >
        <Icon
          className={`w-6 h-6 ${isSelected ? 'text-white' : ''}`}
          strokeWidth={2}
        />
      </div>

      {/* Mode label */}
      <span className="text-xs font-semibold text-center line-clamp-1">
        {option.mode.replace('_', ' ')}
      </span>

      {/* Duration */}
      <div className={`flex items-center gap-1 text-xs ${isSelected ? 'text-white' : 'text-slate-600'}`}>
        <Clock className="w-3 h-3" />
        <span className="font-medium">{formatDuration(option.durationMinutes)}</span>
      </div>

      {/* Cost */}
      <div className={`flex items-center gap-1 text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
        <DollarSign className="w-3 h-3" />
        <span>{option.cost === 0 ? 'Free' : option.cost.toFixed(2)}</span>
      </div>

      {/* Transfers badge (for public transport) */}
      {option.transfers !== undefined && option.transfers > 0 && (
        <div className={`flex items-center gap-1 text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
          <Repeat className="w-3 h-3" />
          <span>{option.transfers} transfer{option.transfers > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Realtime indicator */}
      {option.realtime && (
        <div className="absolute bottom-1 left-1">
          <span
            className={`inline-block w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'} animate-pulse`}
            aria-label="Live data"
          />
        </div>
      )}

      {/* Selection checkmark */}
      {isSelected && (
        <div className="absolute top-2 left-2">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
};

// Skeleton loader
export const TransportOptionCardSkeleton: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-[120px] h-[140px] bg-slate-100 rounded-xl animate-pulse flex flex-col items-center justify-center gap-2 p-3">
      <div className="w-12 h-12 rounded-full bg-slate-200" />
      <div className="h-3 w-16 bg-slate-200 rounded" />
      <div className="h-3 w-12 bg-slate-200 rounded" />
      <div className="h-3 w-10 bg-slate-200 rounded" />
    </div>
  );
};
