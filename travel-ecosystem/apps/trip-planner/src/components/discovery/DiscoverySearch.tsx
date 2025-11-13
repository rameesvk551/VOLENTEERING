import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Loader2, Search, TrendingUp } from 'lucide-react';
import { useDiscovery } from '../../hooks/useDiscovery';
import { ResultsGrid } from './ResultsGrid';
import { RecommendationCarousel } from './RecommendationCarousel';
import { ProgressBar } from './ProgressBar';
import type { DiscoveryEntity } from '../../hooks/useDiscovery';
import type { DiscoveryFilters } from '../../types/discovery';

interface DiscoverySearchProps {
  onResultSelect?: (result: DiscoveryEntity) => void;
}

const sanitizeFilters = (filters: DiscoveryFilters): DiscoveryFilters | undefined => {
  const normalized: DiscoveryFilters = {};

  if (filters.month) {
    normalized.month = filters.month;
  }

  if (filters.duration) {
    normalized.duration = filters.duration;
  }

  if (filters.interests && filters.interests.length > 0) {
    normalized.interests = [...filters.interests];
  }

  if (filters.fromCountryCode) {
    normalized.fromCountryCode = filters.fromCountryCode.toUpperCase();
  }

  return Object.keys(normalized).length ? normalized : undefined;
};

export const DiscoverySearch: React.FC<DiscoverySearchProps> = ({ onResultSelect }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [draftFilters, setDraftFilters] = useState<DiscoveryFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<DiscoveryFilters | undefined>();
  const {
    results,
    summary,
    recommendations,
    isLoading,
    error,
    search,
    clearResults
  } = useDiscovery();

  const handleSearch = async () => {
    if (!query.trim()) return;
    const sanitizedFilters = sanitizeFilters(draftFilters);
    await search(query, sanitizedFilters);
    setAppliedFilters(sanitizedFilters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (draftFilters.month) count += 1;
    if (draftFilters.duration) count += 1;
    if (draftFilters.fromCountryCode) count += 1;
    if (draftFilters.interests?.length) count += draftFilters.interests.length;
    return count;
  }, [draftFilters]);

  const monthOptions = useMemo(
    () => [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
    []
  );

  const interestOptions = useMemo(
    () => [
      'Adventure',
      'Art & Culture',
      'Food & Drink',
      'History',
      'Nature',
      'Nightlife',
      'Relaxation',
      'Shopping'
    ],
    []
  );

  const toggleInterest = (interest: string) => {
    setDraftFilters((current) => {
      const currentInterests = new Set(current.interests ?? []);
      if (currentInterests.has(interest)) {
        currentInterests.delete(interest);
      } else {
        currentInterests.add(interest);
      }
      const updatedInterests = Array.from(currentInterests);
      return {
        ...current,
        interests: updatedInterests.length ? updatedInterests : undefined
      };
    });
  };

  const handleClearFilters = () => {
    setDraftFilters({});
    setAppliedFilters(undefined);
  };

  return (
    <div className="discovery-search-container max-w-7xl mx-auto">
      <ProgressBar scope="discovery-feed" />

      {/* Hero Search Section */}
      <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6 text-gray-500" />
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
            Discover destinations with one search
          </h1>
        </div>


        {/* Search Bar */}
        <div className="search-bar-container">
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
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg sm:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
        {/* <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-200"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white dark:bg-gray-100 dark:text-gray-900">
                {activeFilterCount}
              </span>
            )}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm font-medium text-gray-500 underline-offset-4 hover:underline dark:text-gray-400"
            >
              Clear filters
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 space-y-6">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200" htmlFor="month-select">
                Travel month
              </label>
              <select
                id="month-select"
                value={draftFilters.month ?? ''}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    month: event.target.value || undefined
                  }))
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Any month</option>
                {monthOptions.map((month) => (
                  <option key={month} value={month.toLowerCase()}>{month}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200" htmlFor="duration-input">
                Trip duration (days)
              </label>
              <input
                id="duration-input"
                type="number"
                min={1}
                max={30}
                inputMode="numeric"
                value={draftFilters.duration ?? ''}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    duration: event.target.value ? Number(event.target.value) : undefined
                  }))
                }
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="e.g. 5"
              />
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Interests</span>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => {
                  const isSelected = draftFilters.interests?.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                        isSelected
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                          : 'border border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200" htmlFor="origin-input">
                Home country (ISO code)
              </label>
              <input
                id="origin-input"
                type="text"
                maxLength={2}
                value={draftFilters.fromCountryCode ?? ''}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    fromCountryCode: event.target.value ? event.target.value.toUpperCase() : undefined
                  }))
                }
                className="w-full uppercase rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="e.g. US"
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Filters apply when you run a new search.
            </p>
          </div>
        )} */}
      </div>


      {/* Results Grid */}
      {results && (
        <ResultsGrid
          query={results.query}
          summary={summary}
          filters={appliedFilters}
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
