/**
 * Hotel Search Results Page
 */

import React from 'react';
import { HotelSearch } from '../components/HotelSearch';
import { HotelCard } from '../components/HotelCard';
import { useHotelStore } from '../store/hotelStore';
import { Loader2, AlertCircle } from 'lucide-react';

export function SearchPage() {
  const { searchResults, isSearching, searchError, totalResults } = useHotelStore();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Hotel Search & Booking</h1>
        
        <HotelSearch />

        {/* Error State */}
        {searchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-3 text-gray-600">Searching hotels...</span>
          </div>
        )}

        {/* Results */}
        {!isSearching && searchResults.length > 0 && (
          <div>
            <div className="mb-4 text-gray-600">
              Found {totalResults} hotels
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && searchResults.length === 0 && !searchError && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Start your search to find amazing hotels</p>
          </div>
        )}
      </div>
    </div>
  );
}
