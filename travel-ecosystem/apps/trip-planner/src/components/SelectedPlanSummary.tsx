/**
 * SelectedPlanSummary Component
 * Sticky footer showing total duration, cost, and PDF generation CTA
 */

import React from 'react';
import { FileText, Loader } from 'lucide-react';
import type { SelectedPlanSummaryProps } from '../types/trip-planner.types';

export const SelectedPlanSummary: React.FC<SelectedPlanSummaryProps> = ({
  totalDurationMinutes,
  totalCost,
  currency = 'USD',
  onGeneratePDF,
  isGenerating = false
}) => {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const currencySymbol = currency === 'USD' ? '$' : currency;

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 shadow-2xl z-30">
      <div className="p-4 space-y-3">
        {/* Summary stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Time</p>
              <p className="text-lg font-bold text-slate-900">{formatDuration(totalDurationMinutes)}</p>
            </div>
            <div className="w-px h-10 bg-slate-200" aria-hidden="true" />
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Cost</p>
              <p className="text-lg font-bold text-blue-600">{currencySymbol}{totalCost.toFixed(2)}</p>
            </div>
          </div>

          {/* Small generate button for mobile */}
          <button
            type="button"
            onClick={onGeneratePDF}
            disabled={isGenerating}
            className="sm:hidden w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg transition-all duration-200"
            aria-label="Generate PDF itinerary"
          >
            {isGenerating ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Full CTA button */}
        <button
          type="button"
          onClick={onGeneratePDF}
          disabled={isGenerating}
          className={`
            hidden sm:flex w-full py-4 rounded-xl font-semibold text-base
            items-center justify-center gap-2
            transition-all duration-200
            focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300
            ${isGenerating
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl active:scale-[0.98]'
            }
          `}
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Generate PDF Itinerary
            </>
          )}
        </button>

        {/* Mobile full-width button */}
        <button
          type="button"
          onClick={onGeneratePDF}
          disabled={isGenerating}
          className={`
            sm:hidden w-full py-4 rounded-xl font-semibold text-base
            flex items-center justify-center gap-2
            transition-all duration-200
            focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300
            ${isGenerating
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg active:scale-[0.98]'
            }
          `}
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Generate Itinerary
            </>
          )}
        </button>
      </div>
    </div>
  );
};
