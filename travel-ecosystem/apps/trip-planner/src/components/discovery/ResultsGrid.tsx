import React from 'react';
import { motion } from 'framer-motion';
import type { DiscoveryEntity } from '../../hooks/useDiscovery';
import { VirtualizedAttractionFeed } from './VirtualizedAttractionFeed';

interface ResultsGridProps {
  results: {
    festivals: DiscoveryEntity[];
    attractions: DiscoveryEntity[];
    places: DiscoveryEntity[];
    events: DiscoveryEntity[];
  };
  onResultSelect?: (result: DiscoveryEntity) => void;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  results,
  onResultSelect
}) => {
  // Combine all results into a single array
  const allItems = [
    ...results.attractions,
    ...results.festivals,
    ...results.places,
    ...results.events
  ];
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="results-grid-container relative mt-6 sm:mt-8"
    >
      <div className="rounded-3xl border border-gray-100 bg-white/70 shadow-sm dark:border-gray-800 dark:bg-gray-900/70 overflow-visible">
        <VirtualizedAttractionFeed
          items={allItems}
          onSelect={onResultSelect}
        />
      </div>
    </motion.section>
  );
};
