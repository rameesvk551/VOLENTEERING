import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Calendar, DollarSign, Cloud, TrendingUp, Users, Clock, Heart, Share2 } from 'lucide-react';
import { useDiscovery } from '../hooks/useDiscovery';
import { ResultsGrid } from '../components/discovery/ResultsGrid';
import { buildTripPlannerPath } from '../utils/navigation';
import type { DiscoveryEntity } from '../hooks/useDiscovery';

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const {
    results,
    isLoading,
    error,
    search,
  } = useDiscovery();

  const [selectedTab, setSelectedTab] = useState<'all' | 'attractions' | 'hotels' | 'experiences'>('all');

  useEffect(() => {
    if (query) {
      search(query);
    }
  }, [query]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleResultSelect = (result: DiscoveryEntity) => {
    console.log('Selected:', result);
    // Add to trip or show details
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No search query</h2>
          <button
            onClick={() => navigate(buildTripPlannerPath('discover'))}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium"
          >
            Go to Discovery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Back Button */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackClick}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {query}
              </h1>
              {results && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {results.metadata.totalResults} results found
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <Heart className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <Share2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Discovering {query}...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Results Content */}
      {results && !isLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {results.summary.headline}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {results.summary.overview}
            </p>
            
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {results.summary.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                    {index === 0 && <MapPin className="w-5 h-5 text-blue-600" />}
                    {index === 1 && <Star className="w-5 h-5 text-yellow-600" />}
                    {index === 2 && <Cloud className="w-5 h-5 text-gray-600" />}
                    {index === 3 && <Calendar className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {highlight}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Best Time to Visit */}
            {results.summary.bestTime && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Best Time to Visit</h3>
                </div>
                <p className="text-blue-800 dark:text-blue-200">{results.summary.bestTime}</p>
              </div>
            )}

            {/* Tips */}
            {results.summary.tips && results.summary.tips.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Travel Tips</h3>
                </div>
                <ul className="space-y-2">
                  {results.summary.tips.slice(0, 3).map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedTab === 'all'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              All Results ({results.metadata.totalResults})
            </button>
            <button
              onClick={() => setSelectedTab('attractions')}
              className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedTab === 'attractions'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Attractions ({results.results.attractions.length})
            </button>
            <button
              onClick={() => setSelectedTab('hotels')}
              className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedTab === 'hotels'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Hotels ({results.results.places.length})
            </button>
            <button
              onClick={() => setSelectedTab('experiences')}
              className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedTab === 'experiences'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Experiences ({results.results.festivals.length + results.results.events.length})
            </button>
          </div>

          {/* Results Grid */}
          <div className="space-y-8">
            {selectedTab === 'all' && (
              <ResultsGrid
                results={results.results}
                onResultSelect={handleResultSelect}
              />
            )}

            {selectedTab === 'attractions' && results.results.attractions.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Top Attractions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.results.attractions.map((attraction) => (
                    <AttractionCard key={attraction.id} attraction={attraction} onSelect={handleResultSelect} />
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'hotels' && results.results.places.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Recommended Hotels
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.results.places.map((place) => (
                    <AttractionCard key={place.id} attraction={place} onSelect={handleResultSelect} />
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'experiences' && (results.results.festivals.length > 0 || results.results.events.length > 0) && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Festivals & Events
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...results.results.festivals, ...results.results.events].map((experience) => (
                    <AttractionCard key={experience.id} attraction={experience} onSelect={handleResultSelect} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Metadata Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {results.metadata.processingTime}ms
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {results.metadata.sources.join(', ')}
                </span>
              </div>
              <span className="text-xs">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Attraction Card Component
const AttractionCard: React.FC<{
  attraction: DiscoveryEntity;
  onSelect: (attraction: DiscoveryEntity) => void;
}> = ({ attraction, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(attraction)}
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
        {attraction.media.images.length > 0 ? (
          <img
            src={attraction.media.images[0]}
            alt={attraction.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-lg">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {attraction.metadata.popularity.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
            {attraction.title}
          </h3>
          {attraction.metadata.cost && (
            <span className="text-green-600 dark:text-green-400 font-semibold whitespace-nowrap">
              {attraction.metadata.cost}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {attraction.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{attraction.location.city}</span>
        </div>

        {/* Tags */}
        {attraction.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attraction.metadata.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
