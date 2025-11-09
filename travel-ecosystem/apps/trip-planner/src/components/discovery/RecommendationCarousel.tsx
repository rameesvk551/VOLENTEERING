import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      {/* Scroll Buttons - Hidden on mobile */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 
          p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl
          transition-all duration-300 hover:scale-110 -ml-4"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 
          p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl
          transition-all duration-300 hover:scale-110 -mr-4"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 px-1 sm:px-2
          snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.entity.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect?.(recommendation.entity)}
            className="flex-shrink-0 w-72 sm:w-80 bg-white/80 dark:bg-gray-800/80 
              backdrop-blur-lg rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer
              hover:shadow-2xl transition-all duration-300 group snap-start
              border border-gray-200 dark:border-gray-700"
          >
            {/* Image */}
            <div className="relative h-40 sm:h-44 overflow-hidden bg-gray-200 dark:bg-gray-800">
              <img
                src={recommendation.entity.media.images[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
                alt={recommendation.entity.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
                }}
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Rating Badge */}
              {recommendation.entity.metadata.popularity && (
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 
                  backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-lg">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold text-gray-800 dark:text-white text-xs">
                    {(recommendation.entity.metadata.popularity * 5).toFixed(1)}
                  </span>
                </div>
              )}

              {/* Match Score Badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full 
                bg-gradient-to-r from-amber-500 to-orange-500 text-white 
                text-xs font-semibold shadow-lg">
                {(recommendation.score * 100).toFixed(0)}% Match
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h4 className="font-bold text-lg mb-1 line-clamp-2 
                text-gray-800 dark:text-white
                group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {recommendation.entity.title}
              </h4>

              <p className="text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1 text-sm">
                <span>📍</span> {recommendation.entity.location.city}
              </p>

              {/* Reason */}
              <div className="mb-3 px-3 py-2 rounded-lg 
                bg-gradient-to-r from-cyan-50 to-purple-50
                dark:from-cyan-900/20 dark:to-purple-900/20 
                border border-cyan-200 dark:border-cyan-800">
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  <span className="font-semibold">Why: </span>
                  {recommendation.reason}
                  {recommendation.distance && ` • ${recommendation.distance}`}
                </p>
              </div>

              {/* Tags */}
              <div className="flex gap-1.5 flex-wrap mb-3">
                {recommendation.entity.metadata.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700/50
                      text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Explore Button */}
              <button 
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 
                  text-white rounded-xl font-semibold hover:shadow-lg transition-all 
                  hover:scale-105 text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(recommendation.entity);
                }}
              >
                Explore Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
