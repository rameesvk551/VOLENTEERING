import React, { useState } from 'react';
import { Search, TrendingUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buildTripPlannerPath } from '../../utils/navigation';
import { useDiscovery } from '../../hooks/useDiscovery';

import { ResultsGrid } from './ResultsGrid';

import { RecommendationCarousel } from './RecommendationCarousel';
import type { DiscoveryEntity } from '../../hooks/useDiscovery';

interface DiscoverySearchProps {
  onResultSelect?: (result: DiscoveryEntity) => void;
}

export const DiscoverySearch: React.FC<DiscoverySearchProps> = ({ onResultSelect }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const {
    results,
    recommendations,
    isLoading,
    error,
    search,
    clearResults
  } = useDiscovery();

  const handleSearch = async () => {
    if (!query.trim()) return;
    // Navigate to search results page with query parameter
    navigate(buildTripPlannerPath(`search?q=${encodeURIComponent(query)}`));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="discovery-search-container w-full">
      {/* Hero Search Section */}
      <div
        className="hero-section bg-white dark:bg-gray-900 py-6 mb-6 sm:mb-8 border-b border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4 px-4">
          <Search className="w-6 h-6 text-gray-500" />
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
            Discover destinations with one search
          </h1>
        </div>


        {/* Search Bar */}
        <div className="search-bar-container px-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Where do you want to go?"
              disabled={isLoading}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 md:py-5 pr-14 sm:pr-16
                rounded-xl sm:rounded-2xl text-sm sm:text-base md:text-lg
                bg-white dark:bg-gray-800
                border border-gray-300 dark:border-gray-700
                focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
                text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />

            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2
                px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-900 dark:bg-white
                text-white dark:text-gray-900 rounded-lg sm:rounded-xl
                disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Search"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              ) : (
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>


      {/* Results Grid */}
      {results && (
        <ResultsGrid
          results={results.results}
          onResultSelect={onResultSelect}
        />
      )}

      {/* Recommendations Carousel */}
      {recommendations && recommendations.length > 0 && (
        <div className="recommendations-section mt-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-gray-500" />
            <h3 className="text-2xl font-semibold dark:text-white">
              You might also like
            </h3>
          </div>
          <RecommendationCarousel
            recommendations={recommendations}
            onSelect={onResultSelect}
          />
        </div>
      )}

      {/* No Results */}
      {results && results.metadata.totalResults === 0 && (
        <div className="text-center py-16">
          <div className="inline-block p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold mb-2 dark:text-white">
            No results found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or explore nearby cities
          </p>
          <button
            onClick={clearResults}
            className="px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium"
          >
            Try new search
          </button>
        </div>
      )}
    </div>
  );
};
