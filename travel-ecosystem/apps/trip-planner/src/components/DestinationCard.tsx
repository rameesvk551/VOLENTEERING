import React from 'react';
import { MapPin, Star } from 'lucide-react';
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
      className="relative rounded-2xl p-0 overflow-hidden cursor-pointer group animate-fade-in w-full"
      onClick={handleClick}
      style={{
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
        boxShadow: '0 8px 32px rgba(60,60,120,0.12)',
        maxWidth: '260px',
        margin: '0 auto'
      }}
    >
      {/* Glassmorphism card background */}
      <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg z-0" />

      <div className="relative z-10 flex flex-col">
        {/* Image - Fixed Height */}
        <div className="overflow-hidden rounded-t-2xl relative" style={{ width: '100%', height: '140px' }}>
          <img
            src={destination.image}
            alt={destination.name}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            style={{ width: '100%', height: '140px' }}
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

        {/* Content Section - Fixed Padding */}
        <div className="p-3 flex flex-col">
          {/* Title */}
          <h2 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight line-clamp-2 min-h-[40px]">
            {destination.name}
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 text-xs leading-relaxed min-h-[32px]">
            {destination.description}
          </p>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <MapPin className="w-3 h-3" />
            <span className="text-[10px]">{destination.country}</span>
          </div>

          {/* Price and Rating Row */}
          <div className="flex items-center justify-between pt-2 mt-auto border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">From</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {destination.estimatedCost === 'Varies' || destination.estimatedCost.includes('$') 
                  ? destination.estimatedCost 
                  : `₹${destination.estimatedCost}`}
              </span>
              <span className="text-[9px] text-gray-500 dark:text-gray-400">per person</span>
            </div>
            
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-900 dark:text-white">{destination.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default DestinationCard;
