import React from 'react';
import { cn } from '@/design-system';

/* ========================================
   CATEGORIES SECTION
   Opportunity categories grid
   ======================================== */

const categories = [
  {
    id: 'farming',
    title: 'Farming & Gardening',
    description: 'Work with organic farms and sustainable projects',
    icon: '🌱',
    color: 'from-emerald-500 to-green-600',
    count: 2840,
  },
  {
    id: 'teaching',
    title: 'Teaching & Education',
    description: 'Share knowledge with communities worldwide',
    icon: '📚',
    color: 'from-blue-500 to-indigo-600',
    count: 1920,
  },
  {
    id: 'hospitality',
    title: 'Hospitality',
    description: 'Help at hostels, B&Bs and eco-lodges',
    icon: '🏨',
    color: 'from-orange-500 to-red-500',
    count: 3150,
  },
  {
    id: 'construction',
    title: 'Construction & Building',
    description: 'Build homes and community structures',
    icon: '🔨',
    color: 'from-amber-500 to-orange-600',
    count: 890,
  },
  {
    id: 'animals',
    title: 'Animal Care',
    description: 'Work with wildlife and animal sanctuaries',
    icon: '🐾',
    color: 'from-pink-500 to-rose-600',
    count: 1240,
  },
  {
    id: 'art',
    title: 'Art & Culture',
    description: 'Creative projects and cultural exchange',
    icon: '🎨',
    color: 'from-purple-500 to-violet-600',
    count: 760,
  },
  {
    id: 'tech',
    title: 'Technology & Digital',
    description: 'Help with websites, marketing and IT',
    icon: '💻',
    color: 'from-cyan-500 to-blue-600',
    count: 580,
  },
  {
    id: 'community',
    title: 'Community Work',
    description: 'Social projects and NGO support',
    icon: '🤝',
    color: 'from-teal-500 to-emerald-600',
    count: 1680,
  },
];

export const CategoriesSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
            Explore by Category
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find your perfect opportunity
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from a variety of volunteering experiences that match your skills 
            and interests. Every opportunity is a chance to grow and make an impact.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} {...category} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <a
            href="/categories"
            className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            View all categories
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

/* Category Card */
interface CategoryCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  count: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  title,
  description,
  icon,
  color,
  count,
}) => {
  return (
    <a
      href={`/explore?category=${id}`}
      className={cn(
        'group relative bg-white rounded-2xl p-6 border border-gray-100',
        'hover:shadow-lg hover:border-transparent hover:-translate-y-1',
        'transition-all duration-300 overflow-hidden'
      )}
    >
      {/* Background Gradient on Hover */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5',
          'transition-opacity duration-300',
          color
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4',
          'text-2xl shadow-lg',
          color
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
        {description}
      </p>

      {/* Count */}
      <span className="text-xs font-medium text-gray-400">
        {count.toLocaleString()} opportunities
      </span>

      {/* Arrow */}
      <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
};

export default CategoriesSection;
