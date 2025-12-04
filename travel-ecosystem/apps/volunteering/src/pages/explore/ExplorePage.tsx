import React, { useState, useMemo } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Button, Badge, Checkbox, Radio, Select, Skeleton, SkeletonCard, cn } from '../../design-system';

/* ========================================
   EXPLORE/LISTING PAGE
   Browse all volunteering opportunities
   ======================================== */

const ExplorePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <MainLayout>
      {/* Search Header */}
      <SearchHeader />

      <div className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <FiltersSidebar />
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <ResultsHeader
              count={248}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
              activeFilters={activeFilters}
            />

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <ActiveFilters
                filters={activeFilters}
                onRemove={(filter) => setActiveFilters(activeFilters.filter(f => f !== filter))}
                onClearAll={() => setActiveFilters([])}
              />
            )}

            {/* Results Grid */}
            {isLoading ? (
              <LoadingGrid />
            ) : viewMode === 'grid' ? (
              <OpportunityGrid />
            ) : (
              <MapView />
            )}

            {/* Pagination */}
            <Pagination currentPage={1} totalPages={12} />
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </MainLayout>
  );
};

/* Search Header */
const SearchHeader: React.FC = () => {
  return (
    <div className="sticky top-[72px] z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="container py-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Location Search */}
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Where do you want to go?"
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>

          {/* Category */}
          <Select
            options={[
              { value: '', label: 'All categories' },
              { value: 'farming', label: 'Farming & Gardening' },
              { value: 'teaching', label: 'Teaching' },
              { value: 'hospitality', label: 'Hospitality' },
              { value: 'animals', label: 'Animal Care' },
              { value: 'construction', label: 'Construction' },
            ]}
            className="w-full md:w-48"
          />

          {/* Duration */}
          <Select
            options={[
              { value: '', label: 'Any duration' },
              { value: '1-2', label: '1-2 weeks' },
              { value: '2-4', label: '2-4 weeks' },
              { value: '1-3m', label: '1-3 months' },
              { value: '3m+', label: '3+ months' },
            ]}
            className="w-full md:w-44"
          />

          {/* Search Button */}
          <Button size="lg" className="shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

/* Filters Sidebar */
const FiltersSidebar: React.FC = () => {
  return (
    <div className="sticky top-[160px] space-y-6">
      {/* Host Type */}
      <FilterSection title="Host Type">
        <div className="space-y-3">
          <Checkbox label="Farm & Garden" />
          <Checkbox label="Hostel & Hotel" />
          <Checkbox label="NGO & Non-Profit" />
          <Checkbox label="Private Home" />
          <Checkbox label="Eco Project" />
          <Checkbox label="Animal Sanctuary" />
        </div>
      </FilterSection>

      {/* Skills */}
      <FilterSection title="Skills Required">
        <div className="space-y-3">
          <Checkbox label="No experience needed" />
          <Checkbox label="Gardening" />
          <Checkbox label="Cooking" />
          <Checkbox label="Teaching" />
          <Checkbox label="Construction" />
          <Checkbox label="Marketing & Social Media" />
          <Checkbox label="Languages" />
        </div>
      </FilterSection>

      {/* Accommodation */}
      <FilterSection title="Accommodation">
        <div className="space-y-3">
          <Checkbox label="Private Room" />
          <Checkbox label="Shared Room" />
          <Checkbox label="Camping / Tent" />
          <Checkbox label="Cabin / Cottage" />
        </div>
      </FilterSection>

      {/* Host Welcomes */}
      <FilterSection title="Host Welcomes">
        <div className="space-y-3">
          <Checkbox label="Solo Travelers" />
          <Checkbox label="Couples" />
          <Checkbox label="Families with Kids" />
          <Checkbox label="Digital Nomads" />
          <Checkbox label="Groups" />
        </div>
      </FilterSection>

      {/* Meals Included */}
      <FilterSection title="Meals Included">
        <div className="space-y-3">
          <Radio name="meals" label="All meals" />
          <Radio name="meals" label="Some meals" />
          <Radio name="meals" label="Kitchen access" />
          <Radio name="meals" label="Any" />
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        <div className="space-y-3">
          <Radio name="rating" label="4.5+ Excellent" />
          <Radio name="rating" label="4.0+ Very Good" />
          <Radio name="rating" label="3.5+ Good" />
          <Radio name="rating" label="Any rating" />
        </div>
      </FilterSection>

      {/* More Filters */}
      <FilterSection title="More Options">
        <div className="space-y-3">
          <Checkbox label="Superhost only" />
          <Checkbox label="Instant Book" />
          <Checkbox label="WiFi available" />
          <Checkbox label="Pet friendly" />
          <Checkbox label="New hosts" />
        </div>
      </FilterSection>

      {/* Apply Button */}
      <Button fullWidth variant="primary">
        Apply Filters
      </Button>
    </div>
  );
};

/* Filter Section */
const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

/* Results Header */
interface ResultsHeaderProps {
  count: number;
  viewMode: 'grid' | 'map';
  setViewMode: (mode: 'grid' | 'map') => void;
  onFilterToggle: () => void;
  activeFilters: string[];
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  count,
  viewMode,
  setViewMode,
  onFilterToggle,
  activeFilters,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {count.toLocaleString()} opportunities found
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Mobile Filter Button */}
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={onFilterToggle}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          }
        >
          Filters
          {activeFilters.length > 0 && (
            <Badge variant="primary" size="sm" className="ml-1">
              {activeFilters.length}
            </Badge>
          )}
        </Button>

        {/* Sort Dropdown */}
        <Select
          options={[
            { value: 'recommended', label: 'Recommended' },
            { value: 'newest', label: 'Newest First' },
            { value: 'rating', label: 'Highest Rated' },
            { value: 'reviews', label: 'Most Reviews' },
          ]}
          size="sm"
          className="w-40"
        />

        {/* View Toggle */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/* Active Filters */
interface ActiveFiltersProps {
  filters: string[];
  onRemove: (filter: string) => void;
  onClearAll: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ filters, onRemove, onClearAll }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {filters.map((filter) => (
        <Badge key={filter} variant="primary" removable onRemove={() => onRemove(filter)}>
          {filter}
        </Badge>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        Clear all
      </button>
    </div>
  );
};

/* Opportunity Grid */
const OpportunityGrid: React.FC = () => {
  const opportunities = Array.from({ length: 12 }, (_, i) => ({
    id: String(i + 1),
    title: `Eco Farm Experience ${i + 1}`,
    location: 'Sintra, Portugal',
    image: `/images/opportunities/opp-${(i % 4) + 1}.jpg`,
    rating: 4.8,
    reviews: 42 + i,
    duration: '2-4 weeks',
    tags: ['Farming', 'Sustainable'],
    superhost: i % 3 === 0,
  }));

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {opportunities.map((opp) => (
        <OpportunityCard key={opp.id} {...opp} />
      ))}
    </div>
  );
};

/* Opportunity Card */
interface OpportunityCardProps {
  id: string;
  title: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  duration: string;
  tags: string[];
  superhost: boolean;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  id,
  title,
  location,
  image,
  rating,
  reviews,
  duration,
  tags,
  superhost,
}) => {
  return (
    <a
      href={`/opportunity/${id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-transparent transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {superhost && (
          <Badge variant="default" className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm">
            ⭐ Superhost
          </Badge>
        )}

        <button
          className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
          onClick={(e) => e.preventDefault()}
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {location}
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-sm text-gray-400">({reviews})</span>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
          {title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-500">{duration}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="primary" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </a>
  );
};

/* Map View */
const MapView: React.FC = () => {
  return (
    <div className="h-[600px] bg-gray-100 rounded-2xl flex items-center justify-center">
      <p className="text-gray-500">Map View - Integrate with Leaflet/Mapbox</p>
    </div>
  );
};

/* Loading Grid */
const LoadingGrid: React.FC = () => {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

/* Pagination */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages }) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-gray-200">
      <Button variant="ghost" size="sm" disabled={currentPage === 1}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>

      {[1, 2, 3, '...', 11, 12].map((page, i) => (
        <button
          key={i}
          className={cn(
            'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
            page === currentPage
              ? 'bg-primary-500 text-white'
              : page === '...'
              ? 'text-gray-400 cursor-default'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          {page}
        </button>
      ))}

      <Button variant="ghost" size="sm" disabled={currentPage === totalPages}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
};

/* Mobile Filter Drawer */
interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl animate-slide-in-right">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          <FiltersSidebar />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <Button fullWidth onClick={onClose}>
            Show Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
