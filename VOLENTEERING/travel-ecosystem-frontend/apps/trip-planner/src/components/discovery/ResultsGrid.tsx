import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid3x3, List } from 'lucide-react';
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
      className="results-grid-container"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white mb-1">
            Discover {filteredResults.length} Amazing {activeFilter === 'all' ? 'Experiences' : activeFilter}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Curated recommendations just for you
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 glass px-2 py-2 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters mb-6 flex gap-3 flex-wrap">
        {filterOptions.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => setActiveFilter(option.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm
              ${activeFilter === option.id
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                : 'glass hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
              }`}
          >
            {option.label}
            {option.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs
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
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'flex flex-col gap-4'
        }
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
