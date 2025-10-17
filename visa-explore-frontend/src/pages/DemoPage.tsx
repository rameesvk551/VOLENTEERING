import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Globe, Plane } from 'lucide-react';
import VisaCard from '../components/molecules/VisaCard';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import { dummyVisas, getVisasByType, searchVisas } from '../data/dummyVisas';
import { VisaInfo } from '../types/visa.types';
import { cn } from '../lib/utils';

const DemoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [savedVisas, setSavedVisas] = useState<Set<string>>(new Set());
  const [comparingVisas, setComparingVisas] = useState<Set<string>>(new Set());

  // Filter visas
  const getFilteredVisas = (): VisaInfo[] => {
    let visas = dummyVisas;

    // Apply search
    if (searchQuery) {
      visas = searchVisas(searchQuery);
    }

    // Apply filter
    if (selectedFilter !== 'all') {
      visas = getVisasByType(selectedFilter);
    }

    return visas;
  };

  const filteredVisas = getFilteredVisas();

  // Handle save
  const handleSave = (visaId: string) => {
    const newSaved = new Set(savedVisas);
    if (newSaved.has(visaId)) {
      newSaved.delete(visaId);
    } else {
      newSaved.add(visaId);
    }
    setSavedVisas(newSaved);
  };

  // Handle compare
  const handleCompare = (visaId: string) => {
    const newComparing = new Set(comparingVisas);
    if (newComparing.has(visaId)) {
      newComparing.delete(visaId);
    } else {
      if (newComparing.size < 3) {
        newComparing.add(visaId);
      }
    }
    setComparingVisas(newComparing);
  };

  const filters = [
    { id: 'all', label: 'All Visas', count: dummyVisas.length },
    { id: 'visa-free', label: '🟢 Visa-Free', count: getVisasByType('visa-free').length },
    { id: 'voa', label: '🟡 Visa on Arrival', count: getVisasByType('voa').length },
    { id: 'evisa', label: '🔵 eVisa', count: getVisasByType('evisa').length },
    { id: 'visa-required', label: '🔴 Visa Required', count: getVisasByType('visa-required').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <Plane className="h-12 w-12" />
              <h1 className="text-5xl font-display font-bold">Visa Explore</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Discover visa requirements for your next adventure. Smart, fast, and comprehensive.
            </p>
            <div className="mt-8 flex gap-4 justify-center">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Globe className="h-5 w-5" />
                <span className="font-medium">195+ Countries</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Filter className="h-5 w-5" />
                <span className="font-medium">Real-time Data</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <Input
              type="text"
              placeholder="Search by country name..."
              leftIcon={<Search className="h-5 w-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-3 justify-center">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={cn(
                  'px-4 py-2 rounded-full border-2 transition-all',
                  'hover:scale-105 active:scale-95',
                  selectedFilter === filter.id
                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-primary-400'
                )}
              >
                {filter.label}
                <span className={cn(
                  'ml-2 px-2 py-0.5 rounded-full text-xs',
                  selectedFilter === filter.id
                    ? 'bg-white/20'
                    : 'bg-gray-100'
                )}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Bar */}
        {(savedVisas.size > 0 || comparingVisas.size > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-wrap gap-6 justify-center text-sm">
              {savedVisas.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Saved:</span>
                  <span className="font-semibold text-primary-600">{savedVisas.size}</span>
                </div>
              )}
              {comparingVisas.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Comparing:</span>
                  <span className="font-semibold text-purple-600">{comparingVisas.size}/3</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSavedVisas(new Set());
                  setComparingVisas(new Set());
                }}
              >
                Clear All
              </Button>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="mb-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredVisas.length}</span> {filteredVisas.length === 1 ? 'visa' : 'visas'}
            {searchQuery && <span> for "<span className="font-semibold">{searchQuery}</span>"</span>}
          </p>
        </div>

        {/* Visa Cards Grid */}
        {filteredVisas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVisas.map((visa, index) => (
              <motion.div
                key={visa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <VisaCard
                  visa={visa}
                  onViewDetails={() => alert(`Viewing details for ${visa.destination.name}`)}
                  onSave={() => handleSave(visa.id)}
                  onCompare={() => handleCompare(visa.id)}
                  isSaved={savedVisas.has(visa.id)}
                  isComparing={comparingVisas.has(visa.id)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No visas found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search or filters
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            Built with ❤️ using React, TypeScript, Tailwind CSS, and Framer Motion
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Data is for demonstration purposes only. Always verify visa requirements with official sources.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DemoPage;
