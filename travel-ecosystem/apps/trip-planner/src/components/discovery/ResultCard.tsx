import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTripStore } from '../../store/tripStore';
import type { DiscoveryEntity } from '../../hooks/useDiscovery';

interface ResultCardProps {
  result: DiscoveryEntity;
  index: number;
  onSelect?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, index, onSelect }) => {
  const addDestination = useTripStore((state) => state.addDestination);
  const destinations = useTripStore((state) => state.destinations);
  const [isAdded, setIsAdded] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const isAlreadyAdded = destinations.some(d => d.name === result.title);

  const handleAddToTrip = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isAlreadyAdded) return;

    addDestination({
      name: result.title,
      country: result.location.country || '',
      coordinates: result.location.coordinates,
      startDate: result.dates?.start || new Date().toISOString(),
      endDate: result.dates?.end || new Date().toISOString(),
      activities: [],
      notes: result.description,
      estimatedCost: 0
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = !isSelected;
    setIsSelected(newSelected);
    
    if (newSelected && onSelect) {
      onSelect();
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
        rounded-2xl overflow-visible cursor-pointer w-full
        shadow-md border border-gray-100 dark:border-gray-700"
      style={{ maxWidth: '300px', margin: '0 auto' }}
    >
      {/* Image Container - Fixed Height with visible overflow for buttons */}
      <div className="relative rounded-t-2xl" style={{ width: '100%', height: '140px' }}>
        {/* Image wrapper with overflow hidden */}
        <div className="absolute inset-0 overflow-hidden rounded-t-2xl">
          <img
            src={result.media.images[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
            alt={result.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
            }}
          />
        </div>

        {/* Selection Checkbox - Top Left */}
        <motion.button
          onClick={handleCheckboxChange}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`absolute top-2 left-2 w-8 h-8 rounded-lg shadow-2xl z-50
            transition-all duration-200 border-2 flex items-center justify-center
            ${isSelected
              ? 'bg-blue-500 border-blue-600'
              : 'bg-white border-white hover:bg-blue-50 hover:border-blue-200'
            }`}
          style={{ 
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
          aria-label={isSelected ? 'Selected' : 'Select attraction'}
        >
          {isSelected ? (
            <svg 
              className="w-5 h-5 text-white" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <div className="w-5 h-5 rounded border-2 border-gray-400"></div>
          )}
        </motion.button>

        {/* Favorite Button - Top Right */}
        <motion.button
          onClick={handleAddToTrip}
          disabled={isAlreadyAdded}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-2xl z-50
            transition-all duration-200 border-2
            ${isAlreadyAdded
              ? 'bg-red-500 border-red-600 cursor-default'
              : 'bg-white border-white hover:bg-red-50 hover:border-red-200'
            }`}
          style={{ 
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
          aria-label={isAlreadyAdded ? 'Added to favorites' : 'Add to favorites'}
        >
          <svg 
            className={`w-6 h-6 transition-colors ${isAlreadyAdded ? 'text-white' : 'text-red-500'}`}
            fill={isAlreadyAdded ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2.5}
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

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">
          {result.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2 min-h-[2.5rem]">
          {result.description}
        </p>

        {/* Location - if available */}
        {result.location.city && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
            {result.location.city}
            {result.location.country && `, ${result.location.country}`}
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
          {/* Bottom Row - Price and Rating */}
          <div className="flex items-center justify-between">
            {/* Price */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">From</span>
                {result.metadata.cost ? (
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {result.metadata.cost}
                  </span>
                ) : (
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹6,149
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">per person</span>
            </div>

            {/* Rating */}
            {result.metadata.popularity && (
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-lg">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {(result.metadata.popularity * 5).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Added Toast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isAdded ? 1 : 0, y: isAdded ? 0 : 20 }}
        className={`absolute inset-x-0 bottom-0 p-3 bg-green-500 text-white text-center
          font-medium text-sm ${isAdded ? 'pointer-events-none' : ''}`}
      >
        ✓ Added to your trip!
      </motion.div>
    </motion.div>
  );
};
