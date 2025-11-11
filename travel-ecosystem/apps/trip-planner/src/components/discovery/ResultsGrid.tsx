import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, List } from 'lucide-react';
import { ResultCard } from './ResultCard';
import type { DiscoveryEntity } from '../../hooks/useDiscovery';

interface ResultsGridProps {
  results: {
    festivals: DiscoveryEntity[];
    attractions: DiscoveryEntity[];
    places: DiscoveryEntity[];
    events: DiscoveryEntity[];
  };
  onResultSelect?: (result: DiscoveryEntity) => void;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ results, onResultSelect }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Flatten and combine all results
  const allResults = [
    ...results.festivals,
    ...results.attractions,
    ...results.places,
    ...results.events
  ];

  // Filter results based on active filter
  const filteredResults = activeFilter === 'all'
    ? allResults
    : results[activeFilter as keyof typeof results] || [];

  const filterOptions = [
    { id: 'all', label: 'All', count: allResults.length },
    { id: 'festivals', label: 'Festivals', count: results.festivals.length },
    { id: 'attractions', label: 'Attractions', count: results.attractions.length },
    { id: 'places', label: 'Places', count: results.places.length },
    { id: 'events', label: 'Events', count: results.events.length }
  ];

  if (allResults.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="results-grid-container mt-6 sm:mt-8"
    >
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 
        flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 
            dark:text-white mb-1">
            {filteredResults.length} Amazing {activeFilter === 'all' ? 'Experiences' : activeFilter}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            Curated recommendations just for you
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 
          backdrop-blur-sm px-2 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-label="Grid view"
          >
            <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-label="List view"
          >
            <List className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters mb-4 sm:mb-6 flex gap-2 sm:gap-3 flex-wrap overflow-x-auto 
        scrollbar-hide pb-2">
        {filterOptions.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => setActiveFilter(option.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-medium 
              text-xs sm:text-sm transition-all duration-300 shadow-sm whitespace-nowrap
              ${activeFilter === option.id
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
          >
            {option.label}
            {option.count > 0 && (
              <span className={`ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs
                ${activeFilter === option.id
                  ? 'bg-white/30'
                  : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                {option.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Results Grid */}
      <motion.div
        layout
        className={viewMode === 'grid'
          ? 'grid grid-cols-4 gap-3'
          : 'flex flex-col gap-3 sm:gap-4'
        }
        style={viewMode === 'grid' ? { maxWidth: '1056px', margin: '0 auto', gridTemplateColumns: 'repeat(4, 1fr)' } : {}}
      >
        {filteredResults.map((result, index) => (
          <ResultCard
            key={result.id}
            result={result}
            index={index}
            onSelect={() => onResultSelect?.(result)}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};
