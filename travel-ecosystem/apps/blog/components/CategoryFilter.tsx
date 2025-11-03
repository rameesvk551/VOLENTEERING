import React from 'react';
import type { CategoryMeta } from '../services/api';

interface CategoryFilterProps {
  categories: CategoryMeta[];
  selectedCategory?: string;
  loading?: boolean;
  error?: string | null;
  onSelectCategory: (category?: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  loading = false,
  error,
  onSelectCategory,
}) => {
  if (error) {
    return (
      <div className="w-full text-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-xl py-3">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center items-center py-6 px-4 bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow border border-blue-100 dark:border-gray-700">
      <button
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
          !selectedCategory
            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
        } ${loading ? 'opacity-70 pointer-events-none' : ''}`}
        onClick={() => onSelectCategory(undefined)}
        disabled={loading}
      >
        All
      </button>

      {loading && (
        <span className="text-xs text-gray-500 dark:text-gray-400">Loading categories…</span>
      )}

      {!loading && categories.map(({ name, count }) => (
        <button
          key={name}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border flex items-center gap-2 ${
            selectedCategory === name
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
          }`}
          aria-pressed={selectedCategory === name}
          aria-label={`Filter by ${name}`}
          onClick={() => onSelectCategory(selectedCategory === name ? undefined : name)}
        >
          <span>{name}</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            {count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
