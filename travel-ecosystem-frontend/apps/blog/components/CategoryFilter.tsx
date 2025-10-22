import React from 'react';

interface CategoryFilterProps {
  selectedCategory?: string;
  onSelectCategory: (category?: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => {
  const categories = ['Travel', 'Food', 'Culture', 'Tips'];

  return (
    <div className="flex flex-wrap gap-5 justify-center items-center py-8 px-6 bg-gradient-to-r from-blue-50 via-white to-blue-50 rounded-2xl shadow-lg border border-blue-100">
      {categories.map((category) => (
        <button
          key={category}
          className={`px-7 py-3 mx-2 my-2 rounded-full font-semibold text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 shadow-md border-2 border-gray-200 hover:bg-blue-200 hover:text-blue-800 ${selectedCategory === category ? 'bg-blue-600 text-white border-blue-600 scale-105' : 'bg-white text-gray-700'}`}
          aria-pressed={selectedCategory === category}
          aria-label={`Filter by ${category}`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
