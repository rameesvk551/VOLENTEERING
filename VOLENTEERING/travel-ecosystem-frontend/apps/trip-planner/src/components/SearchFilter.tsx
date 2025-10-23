import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (category: string) => void;
  categories: string[];
  selectedCategory: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onFilterChange,
  categories,
  selectedCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search destinations..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 dark:focus:border-primary-400 transition-colors shadow-lg"
          style={{ boxShadow: '0 4px 20px rgba(60,60,120,0.08)' }}
        />
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onFilterChange(category)}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0
              ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }
            `}
            style={
              selectedCategory === category
                ? { boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }
                : {}
            }
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchFilter;
