import React, { useState } from 'react';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchFilters } from '../components/SearchFilters';
import { TourCard } from '../components/TourCard';
import { TourDetailsModal } from '../components/TourDetailsModal';
import { useTourSearch } from '../hooks/useTourSearch';
import { Tour } from '../types/tour.types';

export const ToursPage: React.FC = () => {
  const {
    tours,
    total,
    loading,
    error,
    currentPage,
    totalPages,
    filters,
    updateFilters,
    clearFilters,
    changePage,
  } = useTourSearch();

  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  const handleViewDetails = (tour: Tour) => {
    setSelectedTour(tour);
  };

  const handleCloseDetails = () => {
    setSelectedTour(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Discover Amazing Tours & Activities</h1>
          <p className="text-xl opacity-90">
            Search tours from GetYourGuide, Viator, Klook and more
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Filters */}
        <SearchFilters
          filters={filters}
          onFilterChange={updateFilters}
          onClearFilters={clearFilters}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <span className="ml-3 text-lg text-gray-600">Searching tours...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Error</h3>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tours.length === 0 && filters.location && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No tours found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search filters or search for a different location
            </p>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Initial State */}
        {!loading && !error && tours.length === 0 && !filters.location && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Start Your Adventure</h3>
            <p className="text-gray-500">
              Enter a destination above to discover amazing tours and activities
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && tours.length > 0 && (
          <>
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Found <span className="font-bold text-gray-900">{total}</span> tours
                {filters.location && (
                  <span> in <span className="font-semibold">{filters.location}</span></span>
                )}
              </p>
              
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            </div>

            {/* Tour Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => changePage(pageNumber)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tour Details Modal */}
      {selectedTour && (
        <TourDetailsModal tour={selectedTour} onClose={handleCloseDetails} />
      )}
    </div>
  );
};
