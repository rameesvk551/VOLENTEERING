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

 

  if (allResults.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="results-grid-container mt-6 sm:mt-8"
    >

      {/* Results Grid */}
      <motion.div
        layout
        className= 'grid grid-cols-4 gap-4'
        style={viewMode === 'grid' ? { maxWidth: '1232px', margin: '0 auto', gridTemplateColumns: 'repeat(4, 1fr)' } : {}}
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
