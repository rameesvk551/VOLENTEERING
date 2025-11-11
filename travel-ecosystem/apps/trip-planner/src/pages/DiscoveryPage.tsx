import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DiscoverySearch } from '../components/discovery/DiscoverySearch';
import { ArrowLeft } from 'lucide-react';
import type { DiscoveryEntity } from '../hooks/useDiscovery';

export const DiscoveryPage: React.FC = () => {
  const navigate = useNavigate();

  const handleResultSelect = (result: DiscoveryEntity) => {
    // Result is already added to trip store by ResultCard
    // Optionally navigate to trip planner or show detail modal
    console.log('Result selected:', result);
  };

  return (
    <div className="discovery-page min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50
      dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl 
          shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={() => navigate('..', { replace: false, relative: 'path' })}
                className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 
                  transition-all duration-300 flex-shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
              </button>
         
            </div>

            <button
              onClick={() => navigate('..', { replace: false, relative: 'path' })}
              className="px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r 
                from-cyan-500 to-purple-500 text-white font-medium text-sm sm:text-base
                hover:shadow-lg hover:scale-105 transition-all duration-300 flex-shrink-0"
            >
              <span className="hidden sm:inline">View My Trip</span>
              <span className="sm:hidden">My Trip</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-4 sm:pt-6 md:pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <DiscoverySearch onResultSelect={handleResultSelect} />
      </main>

    </div>
  );
};
