import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Star, Plus, ExternalLink, Check } from 'lucide-react';
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
      className="result-card glass rounded-2xl overflow-hidden cursor-pointer
        hover:shadow-2xl transition-all duration-300 group"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-200 dark:bg-gray-800">
        <img
          src={result.media.images[0] || '/placeholder.jpg'}
          alt={result.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.jpg';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Type Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full
          bg-gradient-to-r ${config.gradient} text-white text-sm font-medium
          shadow-lg backdrop-blur-sm`}>
          <span className="mr-1">{config.emoji}</span>
          {result.type}
        </div>

        {/* Popularity Score */}
        {result.metadata.popularity && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5
            rounded-full bg-black/50 backdrop-blur-md text-white text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">
              {(result.metadata.popularity * 5).toFixed(1)}
            </span>
          </div>
        )}

        {/* Add to Trip Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          onClick={handleAddToTrip}
          disabled={isAlreadyAdded}
          className={`absolute bottom-3 right-3 p-3 rounded-full shadow-xl
            transition-all duration-300 ${
              isAlreadyAdded
                ? 'bg-green-500 cursor-not-allowed'
                : 'bg-white hover:scale-110'
            }`}
        >
          {isAlreadyAdded ? (
            <Check className="w-5 h-5 text-white" />
          ) : (
            <Plus className="w-5 h-5 text-cyan-600" />
          )}
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 line-clamp-2 dark:text-white
          group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          {result.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
          {result.description}
        </p>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-cyan-500 flex-shrink-0" />
            <span className="line-clamp-1">
              {result.location.city}
              {result.location.country && `, ${result.location.country}`}
            </span>
          </div>

          {/* Dates */}
          {result.dates && (
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span className="line-clamp-1">
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
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-green-600 dark:text-green-400">
                {result.metadata.cost}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {result.metadata.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800
                text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
          {result.metadata.tags.length > 3 && (
            <span className="px-2.5 py-1 text-xs text-gray-500">
              +{result.metadata.tags.length - 3} more
            </span>
          )}
        </div>
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
