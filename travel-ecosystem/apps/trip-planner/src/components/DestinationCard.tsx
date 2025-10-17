import React from 'react';
import { MapPin, Clock, DollarSign, Star } from 'lucide-react';
import type { Destination } from '../data/dummyData';

interface DestinationCardProps {
  destination: Destination;
  onClick?: (id: string) => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(destination.id);
    }
  };

  return (
    <article
      className="relative rounded-3xl p-0 overflow-hidden cursor-pointer group animate-fade-in"
      onClick={handleClick}
      style={{
        minHeight: 480,
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
        boxShadow: '0 8px 32px rgba(60,60,120,0.12)'
      }}
    >
      {/* Glassmorphism card background */}
      <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg z-0" />

      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Image */}
        <div className="mb-4 overflow-hidden rounded-2xl relative h-56 shadow-lg">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-90"
            loading="lazy"
            style={{ boxShadow: '0 8px 32px rgba(60,60,120,0.16)' }}
          />

          {/* Category Badge */}
          <div className="absolute top-3 left-3 bg-white/80 dark:bg-gray-800/80 px-4 py-1 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow backdrop-blur-md border border-gray-200 dark:border-gray-700">
            {destination.category}
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full flex items-center gap-1 shadow backdrop-blur-md">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">{destination.rating}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">{destination.country}</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight drop-shadow-sm">
          {destination.name}
        </h2>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 text-base leading-relaxed font-medium">
          {destination.description}
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-2 mb-4">
          {destination.highlights.slice(0, 3).map((highlight, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm"
            >
              {highlight}
            </span>
          ))}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
              <div className="font-semibold text-gray-900 dark:text-white">{destination.duration}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Budget</div>
              <div className="font-semibold text-gray-900 dark:text-white text-xs">{destination.estimatedCost}</div>
            </div>
          </div>
        </div>

        {/* Read More Arrow */}
        <div className="mt-4 flex justify-end">
          <span className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold group-hover:translate-x-1 transition-transform duration-200">
            View Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
};

export default DestinationCard;
