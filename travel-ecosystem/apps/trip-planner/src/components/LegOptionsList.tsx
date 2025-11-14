/**
 * LegOptionsList Component
 * Displays transport options for a single leg horizontally scrollable
 * Shows loading skeletons while fetching
 */

import React from 'react';
import { TransportOptionCard, TransportOptionCardSkeleton } from './TransportOptionCard';
import type { LegOptionsListProps } from '../types/trip-planner.types';
import { AlertCircle } from 'lucide-react';

export const LegOptionsList: React.FC<LegOptionsListProps> = ({
  leg,
  onSelectOption,
  isLoading = false
}) => {
  const selectedOption = leg.options.find(opt => 
    leg.selectedOptionId && opt.mode === leg.selectedOptionId
  );

  const handleSelect = (optionMode: string) => {
    onSelectOption(leg.legId, optionMode);
  };

  return (
    <section 
      className="space-y-3"
      aria-label={`Transport options from ${leg.fromName} to ${leg.toName}`}
    >
      {/* Leg header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900">
            {leg.fromName} → {leg.toName}
          </h3>
          {selectedOption && (
            <p className="text-sm text-slate-600 mt-1">
              Selected: {selectedOption.mode.replace('_', ' ')} • {selectedOption.durationMinutes}min • ${selectedOption.cost.toFixed(2)}
            </p>
          )}
        </div>
        
        {selectedOption && (
          <span className="flex-shrink-0 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
            Selected
          </span>
        )}
      </div>

      {/* Options horizontal scroll */}
      {isLoading ? (
        <div 
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
          role="status"
          aria-label="Loading transport options"
        >
          {[1, 2, 3, 4].map(i => (
            <TransportOptionCardSkeleton key={i} />
          ))}
        </div>
      ) : leg.options.length > 0 ? (
        <div 
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
          role="group"
          aria-label="Transport options"
        >
          {leg.options.map((option, idx) => (
            <TransportOptionCard
              key={`${leg.legId}-${option.mode}-${idx}`}
              option={option}
              isSelected={leg.selectedOptionId === option.mode}
              onSelect={() => handleSelect(option.mode)}
              badge={option.badge}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-900">No transport options available</p>
            <p className="text-yellow-700">Try adjusting your preferences or check back later.</p>
          </div>
        </div>
      )}

      {/* Detailed info for selected option */}
      {selectedOption && selectedOption.steps && selectedOption.steps.length > 0 && (
        <details className="mt-3 p-3 bg-slate-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
            View detailed steps
          </summary>
          <ol className="mt-3 space-y-2">
            {selectedOption.steps.map((step, idx) => (
              <li key={idx} className="text-sm text-slate-600 flex gap-2">
                <span className="font-semibold text-slate-900">{idx + 1}.</span>
                <div className="flex-1">
                  <span className="font-medium capitalize">{step.type}</span>
                  {step.route && (
                    <span className="ml-2 text-slate-500">
                      {step.route.routeName} {step.route.headsign ? `→ ${step.route.headsign}` : ''}
                    </span>
                  )}
                  {step.instructions && (
                    <p className="mt-1 text-xs text-slate-500">{step.instructions}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </details>
      )}

      {/* Realtime delay warning */}
      {selectedOption?.realtime?.expectedDelaySeconds && selectedOption.realtime.expectedDelaySeconds > 120 && (
        <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-900">
            <span className="font-semibold">Delay alert:</span> Expected delay of {Math.round(selectedOption.realtime.expectedDelaySeconds / 60)} minutes
          </p>
        </div>
      )}
    </section>
  );
};
