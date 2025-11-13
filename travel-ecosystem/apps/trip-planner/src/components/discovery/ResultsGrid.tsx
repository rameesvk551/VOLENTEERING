import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, List } from 'lucide-react';
import { ResultCard } from './ResultCard';
import { BlogCard } from './BlogCard';
import type { DiscoveryEntity } from '../../hooks/useDiscovery';

interface ResultsGridProps {
  results: {
    festivals: DiscoveryEntity[];
    attractions: DiscoveryEntity[];
    places: DiscoveryEntity[];
    events: DiscoveryEntity[];
  };
  onResultSelect?: (result: DiscoveryEntity) => void;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ results, onResultSelect }) => {
  const [activeFilter, _setActiveFilter] = useState<string>('all');
  const [viewMode, _setViewMode] = useState<'grid' | 'list'>('grid');

  const featuredBlogs = [
    {
      title: 'Fun facts about Paris: 10 things to know about the City of Lights',
      description:
        'Ever wonder why Paris is called the City of Light? We explore the myths, history, and the fascinating stories that make this iconic city shine.',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      href: '#'
    },
    {
      title: 'How to plan the perfect European summer getaway',
      description:
        'From picking the right cities to packing smart, here is a handy checklist to make your next Euro trip effortless and memorable.',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
      href: '#'
    },
    {
      title: 'Top foodie experiences to book this season',
      description:
        'Savor the world through curated culinary adventures, chefs’ tables, and local market walks, perfect for gastronomes on the go.',
      imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
      href: '#'
    }
  ];

  // Flatten and combine all results
  const allResults = [
    ...results.festivals,
    ...results.attractions,
    ...results.places,
    ...results.events
  ];

  // Filter results based on active filter
  const filteredResults = activeFilter === 'all'
    ? allResults
    : results[activeFilter as keyof typeof results] || [];

 

  if (allResults.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="results-grid-container mt-6 sm:mt-8"
    >
      {/* two-column layout: left 75% (results), right 25% (sidebar) */}
      <motion.div
        layout
        style={{
          maxWidth: '1232px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '75% 25%',
          gap: '1rem'
        }}
      >
        {/* Left: results area (uses an inner grid or list depending on viewMode) */}
        <div>
          <div
            className={viewMode === 'grid' ? 'grid gap-4' : ''}
            style={viewMode === 'grid' ? { gridTemplateColumns: 'repeat(3, 1fr)' } : {}}
          >
            {filteredResults.map((result, index) => (
              <ResultCard
                key={result.id}
                result={result}
                index={index}
                onSelect={() => onResultSelect?.(result)}
              />
            ))}
          </div>
        </div>

        {/* Right: sidebar (25%) - place filters, info or anything you need here */}
        <aside className="pl-4">
          <div className="flex flex-col gap-4">
            {featuredBlogs.map((blog) => (
              <BlogCard
                key={blog.title}
                title={blog.title}
                description={blog.description}
                imageUrl={blog.imageUrl}
                href={blog.href}
              />
            ))}
          </div>
        </aside>
      </motion.div>
    </motion.div>
  );
};
