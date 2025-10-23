import React from 'react';
import { Calendar, Clock, DollarSign, MapPin } from 'lucide-react';
import type { TripPlan } from '../data/dummyData';

interface TripPlanCardProps {
  tripPlan: TripPlan;
  onClick?: (id: string) => void;
}

const TripPlanCard: React.FC<TripPlanCardProps> = ({ tripPlan, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(tripPlan.id);
    }
  };

  return (
    <article
      className="relative rounded-3xl p-0 overflow-hidden cursor-pointer group animate-fade-in"
      onClick={handleClick}
      style={{
        minHeight: 320,
        background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%)',
        boxShadow: '0 8px 32px rgba(120,60,60,0.12)'
      }}
    >
      {/* Glassmorphism card background */}
      <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg z-0" />

      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <div className="inline-block px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-100 to-pink-100 dark:from-amber-900/40 dark:to-pink-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm mb-3">
            Trip Plan
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight drop-shadow-sm">
            {tripPlan.title}
          </h2>
        </div>

        {/* Destinations */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Destinations</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tripPlan.destinations.map((dest, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                {dest}
              </span>
            ))}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Duration</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{tripPlan.duration}</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Budget</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{tripPlan.budget}</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Start</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {new Date(tripPlan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Activities */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Activities</div>
          <div className="flex flex-wrap gap-2">
            {tripPlan.activities.slice(0, 4).map((activity, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-600 dark:text-blue-300"
              >
                {activity}
              </span>
            ))}
          </div>
        </div>

        {/* View Details */}
        <div className="mt-auto pt-4 flex justify-end border-t border-gray-200/50 dark:border-gray-700/50">
          <span className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold group-hover:translate-x-1 transition-transform duration-200">
            View Itinerary
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
};

export default TripPlanCard;
