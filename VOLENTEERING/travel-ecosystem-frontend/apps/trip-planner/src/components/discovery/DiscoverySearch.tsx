import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, MapPin, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { useDiscovery } from '../../hooks/useDiscovery';
import { EntityChips } from './EntityChips';
import { ResultsGrid } from './ResultsGrid';
import { SummarySection } from './SummarySection';
import { RecommendationCarousel } from './RecommendationCarousel';
import type { DiscoveryEntity } from '../../hooks/useDiscovery';

interface DiscoverySearchProps {
  onResultSelect?: (result: DiscoveryEntity) => void;
}

export const DiscoverySearch: React.FC<DiscoverySearchProps> = ({ onResultSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions] = useState([
    'Delhi in October',
    'Paris food tours',
    'Bali beaches',
    'Tokyo cherry blossoms',
    'New York museums'
  ]);

  const {
    results,
    entities,
    summary,
    recommendations,
    isLoading,
    error,
    search,
    clearResults
  } = useDiscovery();

  const handleSearch = async () => {
    if (!query.trim()) return;
    await search(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    search(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="discovery-search-container max-w-7xl mx-auto px-4 py-8">
      {/* Hero Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-section relative glass p-8 rounded-3xl mb-8 overflow-hidden"
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-amber-500/10 animate-pulse-slow" />

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            className="flex items-center gap-3 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
              Discover Your Next Adventure
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 dark:text-gray-300 mb-6 text-lg"
          >
            Ask anything like "Delhi in October" or "Best food festivals in Paris"
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="search-bar-container relative"
          >
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Where do you want to go?"
                disabled={isLoading}
                className="w-full px-6 py-5 pr-16 rounded-2xl glass-border text-lg
                  focus:ring-2 focus:ring-cyan-500 focus:outline-none
                  transition-all duration-300 shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                  dark:text-white dark:placeholder-gray-400"
              />

              <motion.button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-3 top-3 p-3 bg-gradient-to-r from-cyan-500 to-purple-500
                  rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Search className="w-6 h-6" />
                )}
              </motion.button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Quick Suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-2 mt-4 flex-wrap"
          >
            {suggestions.map((suggestion, idx) => (
              <motion.button
                key={suggestion}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className="px-4 py-2 rounded-full glass-border text-sm
                  hover:bg-white/30 dark:hover:bg-gray-700/30
                  transition-all duration-300 shadow-sm hover:shadow-md
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Entity Chips */}
      <AnimatePresence>
        {entities && <EntityChips entities={entities} />}
      </AnimatePresence>

      {/* Summary Section */}
      <AnimatePresence>
        {summary && <SummarySection summary={summary} />}
      </AnimatePresence>

      {/* Results Grid */}
      <AnimatePresence>
        {results && (
          <ResultsGrid
            results={results.results}
            onResultSelect={onResultSelect}
          />
        )}
      </AnimatePresence>

      {/* Recommendations Carousel */}
      <AnimatePresence>
        {recommendations && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="recommendations-section mt-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-purple-500" />
              <h3 className="text-2xl font-bold dark:text-white">
                You might also like
              </h3>
            </div>
            <RecommendationCarousel
              recommendations={recommendations}
              onSelect={onResultSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      <AnimatePresence>
        {results && results.metadata.totalResults === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-16"
          >
            <div className="inline-block p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 dark:text-white">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search or explore nearby cities
            </p>
            <button
              onClick={clearResults}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500
                text-white font-medium hover:shadow-lg transition-all duration-300"
            >
              Try new search
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
