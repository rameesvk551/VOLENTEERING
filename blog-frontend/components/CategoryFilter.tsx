import React from 'react';

interface CategoryFilterProps {
  selectedCategory?: string;
  onSelectCategory: (category?: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => {
  const categories = ['Travel', 'Food', 'Culture', 'Tips'];

  return (
    <div className="flex items-center overflow-x-auto space-x-2 py-2 scrollbar-hide">
      <button
        onClick={() => onSelectCategory(undefined)}
        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
          !selectedCategory
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
        }`}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            selectedCategory === cat
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
