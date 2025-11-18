import React from 'react';
import { motion } from 'framer-motion';
import type { DiscoveryEntity } from '../../hooks/useDiscovery';

interface ResultCardProps {
  result: DiscoveryEntity;
  index: number;
  onSelect?: () => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  result, 
  index, 
  onSelect, 
  isSelected = false,
  onToggleSelect 
}) => {
  const handleToggleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Heart clicked for:', result.title, 'Current state:', isSelected);
    if (onToggleSelect) {
      onToggleSelect();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className="result-card group relative bg-white dark:bg-gray-800 
        rounded-xl overflow-hidden cursor-pointer w-full
        shadow-sm border border-gray-200 dark:border-gray-700"
    >
      {/* Image Container */}
      <div className="relative" style={{ width: '100%', height: '160px' }}>
        <img
          src={result.media.images[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
          alt={result.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
          }}
        />

        {/* Heart Button for Selection - Top Right */}
        <motion.button
          onClick={handleToggleSelection}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-lg z-10
            transition-all duration-200
            ${isSelected
              ? 'bg-red-500'
              : 'bg-white/90 backdrop-blur-sm'
            }`}
          aria-label={isSelected ? 'Remove from route' : 'Add to route'}
        >
          <svg 
            className={`w-5 h-5 transition-colors ${isSelected ? 'text-white' : 'text-red-500'}`}
            fill={isSelected ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        </motion.button>
      </div>

      {/* Content - Direct padding on card background */}
      <div className="px-3 py-2">
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
          {result.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {result.description}
        </p>

        {/* Bottom Row - Price and Rating */}
        <div className="flex items-center justify-between">
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-gray-500">From</span>
            {result.metadata.cost ? (
              <span className="text-base font-bold text-gray-900 dark:text-white">
                {result.metadata.cost}
              </span>
            ) : (
              <span className="text-base font-bold text-gray-900 dark:text-white">
                Free
              </span>
            )}
          </div>

          {/* Rating */}
          {result.metadata.popularity && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="font-semibold text-gray-900 dark:text-white text-xs">
                {(result.metadata.popularity * 5).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
