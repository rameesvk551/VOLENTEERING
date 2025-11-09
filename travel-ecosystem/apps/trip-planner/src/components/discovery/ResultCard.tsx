import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Check } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

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

  const typeConfig = {
    festival: {
      emoji: '🎉',
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    attraction: {
      emoji: '🏛️',
      gradient: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/30'
    },
    place: {
      emoji: '📍',
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    event: {
      emoji: '🎪',
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30'
    },
    experience: {
      emoji: '✨',
      gradient: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30'
    }
  };

  const config = typeConfig[result.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onSelect}
      className="result-card group relative bg-white dark:bg-gray-800 
        rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer
        shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative h-56 sm:h-64 overflow-hidden">
        <img
          src={result.media.images[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
          alt={result.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
          }}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Rating Badge */}
        {result.metadata.popularity && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 
            bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full 
            px-2.5 py-1 sm:px-3 sm:py-1 flex items-center gap-1 shadow-lg">
            <span className="text-yellow-500">⭐</span>
            <span className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm">
              {(result.metadata.popularity * 5).toFixed(1)}
            </span>
          </div>
        )}

        {/* Type Badge */}
        <div className={`absolute top-3 sm:top-4 left-3 sm:left-4 
          bg-gradient-to-r ${config.gradient} backdrop-blur-sm rounded-full 
          px-2.5 py-1 sm:px-3 sm:py-1 text-white text-xs sm:text-sm font-semibold shadow-lg`}>
          <span className="mr-1">{config.emoji}</span>
          <span className="hidden sm:inline">{result.type}</span>
        </div>

        {/* Add to Trip Button - Shows on hover */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            scale: isHovered ? 1 : 0.8 
          }}
          onClick={handleAddToTrip}
          disabled={isAlreadyAdded}
          className={`absolute bottom-3 sm:bottom-4 right-3 sm:right-4 
            p-2.5 sm:p-3 rounded-full shadow-xl transition-all duration-300 
            ${isAlreadyAdded
              ? 'bg-green-500 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800 hover:scale-110'
            }`}
          aria-label={isAlreadyAdded ? 'Already added' : 'Add to trip'}
        >
          {isAlreadyAdded ? (
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          ) : (
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
          )}
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-1 
          group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          {result.title}
        </h3>

        <p className="text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1 text-sm">
          <span>📍</span> {result.location.city}
          {result.location.country && `, ${result.location.country}`}
        </p>

        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 
          text-sm sm:text-base line-clamp-2 sm:line-clamp-3">
          {result.description}
        </p>

        {/* Date Information */}
        {result.dates && (
          <div className="flex items-center gap-1.5 mb-3 text-gray-600 dark:text-gray-400 text-sm">
            <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <span>
              {new Date(result.dates.start).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
              {' - '}
              {new Date(result.dates.end).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        )}

        {/* Cost */}
        {result.metadata.cost && (
          <div className="mb-4">
            <span className="font-semibold text-green-600 dark:text-green-400 text-sm">
              {result.metadata.cost}
            </span>
          </div>
        )}

        {/* Explore Button */}
        <button 
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 
            text-white rounded-xl font-semibold hover:shadow-lg transition-all 
            hover:scale-105 text-sm sm:text-base"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToTrip(e);
          }}
          disabled={isAlreadyAdded}
        >
          {isAlreadyAdded ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" /> Added to Trip
            </span>
          ) : (
            <span>Explore {result.title}</span>
          )}
        </button>
      </div>

      {/* Added Toast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isAdded ? 1 : 0, y: isAdded ? 0 : 20 }}
        className={`absolute inset-x-0 bottom-0 p-4 bg-green-500 text-white text-center
          font-medium ${isAdded ? 'pointer-events-none' : ''}`}
      >
        ✓ Added to your trip!
      </motion.div>
    </motion.div>
  );
};
