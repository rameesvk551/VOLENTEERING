import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { TourSearchFilters } from '../types/tour.types';

interface SearchFiltersProps {
  filters: TourSearchFilters;
  onFilterChange: (filters: Partial<TourSearchFilters>) => void;
  onClearFilters: () => void;
}

const categories = [
  'All',
  'Cultural',
  'Adventure',
  'Food & Drink',
  'Sightseeing',
  'Nature',
  'Historical',
  'Entertainment',
];

const sortOptions = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'duration', label: 'Duration' },
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ location: e.target.value });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({ category: category === 'All' ? undefined : category });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ sortBy: e.target.value as any });
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    if (type === 'min') {
      onFilterChange({ priceMin: numValue });
    } else {
      onFilterChange({ priceMax: numValue });
    }
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    onFilterChange({ minRating: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Main Search */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Where do you want to go? (e.g., Paris, Tokyo, New York)"
            value={filters.location || ''}
            onChange={handleLocationChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              (!filters.category && category === 'All') ||
              filters.category === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (USD)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.minRating || ''}
                onChange={handleRatingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ ⭐</option>
                <option value="4.0">4.0+ ⭐</option>
                <option value="3.5">3.5+ ⭐</option>
                <option value="3.0">3.0+ ⭐</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'popularity'}
                onChange={handleSortChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
