import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';
import type { Recommendation, DiscoveryEntity } from '../../hooks/useDiscovery';

interface RecommendationCarouselProps {
  recommendations: Recommendation[];
  onSelect?: (result: DiscoveryEntity) => void;
}

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({
  recommendations,
  onSelect
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="recommendation-carousel relative">
      {/* Scroll Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full
          bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl
          transition-all duration-300 hover:scale-110 -ml-4"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full
          bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl
          transition-all duration-300 hover:scale-110 -mr-4"
      >
        <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.entity.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect?.(recommendation.entity)}
            className="flex-shrink-0 w-80 glass rounded-2xl overflow-hidden cursor-pointer
              hover:shadow-2xl transition-all duration-300 group"
          >
            {/* Image */}
            <div className="relative h-40 overflow-hidden bg-gray-200 dark:bg-gray-800">
              <img
                src={recommendation.entity.media.images[0] || '/placeholder.jpg'}
                alt={recommendation.entity.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Score Badge */}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full
                bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold
                shadow-lg">
                {(recommendation.score * 100).toFixed(0)}% Match
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h4 className="font-bold text-lg mb-2 line-clamp-2 dark:text-white
                group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {recommendation.entity.title}
              </h4>

              {/* Reason */}
              <div className="mb-3 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-50 to-purple-50
                dark:from-cyan-900/20 dark:to-purple-900/20 border border-cyan-200 dark:border-cyan-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Why: </span>
                  {recommendation.reason}
                  {recommendation.distance && ` • ${recommendation.distance}`}
                </p>
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-cyan-500" />
                  <span className="line-clamp-1">{recommendation.entity.location.city}</span>
                </div>

                {recommendation.entity.metadata.popularity && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {(recommendation.entity.metadata.popularity * 5).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap mt-3">
                {recommendation.entity.metadata.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800
                      text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
