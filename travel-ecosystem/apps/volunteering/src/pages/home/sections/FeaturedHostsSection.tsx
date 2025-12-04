import React from 'react';
import { Badge, cn } from '@/design-system';
import { FallbackImage } from '@/components/FallbackImage';

/* ========================================
   FEATURED HOSTS SECTION
   Showcase of top-rated hosts
   ======================================== */

const featuredHosts = [
  {
    id: '1',
    name: 'Eco Farm Portugal',
    location: 'Sintra, Portugal',
    image: '/images/hosts/host-1.jpg',
    rating: 4.9,
    reviews: 127,
    tags: ['Organic Farming', 'Sustainable Living'],
    verified: true,
    superhost: true,
    description: 'Beautiful organic farm in the hills of Sintra. Help with permaculture, gardening, and enjoy authentic Portuguese hospitality.',
  },
  {
    id: '2',
    name: 'Beach Hostel Thailand',
    location: 'Koh Phangan, Thailand',
    image: '/images/hosts/host-2.jpg',
    rating: 4.8,
    reviews: 89,
    tags: ['Hospitality', 'Beach Life'],
    verified: true,
    superhost: true,
    description: 'Beachfront hostel looking for friendly volunteers to help with guest services, social media, and beach cleanups.',
  },
  {
    id: '3',
    name: 'Animal Sanctuary Costa Rica',
    location: 'Monteverde, Costa Rica',
    image: '/images/hosts/host-3.jpg',
    rating: 5.0,
    reviews: 64,
    tags: ['Animal Care', 'Conservation'],
    verified: true,
    superhost: false,
    description: 'Wildlife rescue center in the cloud forest. Help care for rescued animals and support conservation efforts.',
  },
  {
    id: '4',
    name: 'Language School Japan',
    location: 'Kyoto, Japan',
    image: '/images/hosts/host-4.jpg',
    rating: 4.7,
    reviews: 156,
    tags: ['Teaching', 'Cultural Exchange'],
    verified: true,
    superhost: true,
    description: 'Traditional language school seeking English conversation partners. Immerse yourself in Japanese culture.',
  },
];

export const FeaturedHostsSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
              Featured Hosts
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Popular this week
            </h2>
            <p className="text-gray-600 max-w-xl">
              Discover our highest-rated hosts with amazing reviews from volunteers worldwide.
            </p>
          </div>
          <a
            href="/explore"
            className="hidden md:inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors mt-4 md:mt-0"
          >
            View all hosts
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* Hosts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredHosts.map((host) => (
            <HostCard key={host.id} {...host} />
          ))}
        </div>

        {/* Mobile View All Link */}
        <div className="md:hidden text-center mt-8">
          <a
            href="/explore"
            className="inline-flex items-center gap-2 text-primary-600 font-semibold"
          >
            View all hosts
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

/* Host Card */
interface HostCardProps {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  tags: string[];
  verified: boolean;
  superhost: boolean;
  description: string;
}

const HostCard: React.FC<HostCardProps> = ({
  id,
  name,
  location,
  image,
  rating,
  reviews,
  tags,
  verified,
  superhost,
  description,
}) => {
  return (
    <a
      href={`/host/${id}`}
      className={cn(
        'group bg-white rounded-2xl overflow-hidden border border-gray-100',
        'hover:shadow-xl hover:border-transparent',
        'transition-all duration-300'
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <FallbackImage
          src={image}
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          figureClassName="absolute inset-0"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {superhost && (
            <Badge variant="default" className="bg-white/90 backdrop-blur-sm text-gray-800">
              ⭐ Superhost
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
          onClick={(e) => {
            e.preventDefault();
            // Handle wishlist
          }}
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="primary" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
          <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="font-semibold text-gray-900">{rating}</span>
          <span className="text-gray-500">({reviews} reviews)</span>
        </div>
      </div>
    </a>
  );
};

export default FeaturedHostsSection;
