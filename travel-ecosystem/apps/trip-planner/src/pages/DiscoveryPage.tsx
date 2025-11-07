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
    <div className="discovery-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100
      dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 glass-border backdrop-blur-xl shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('..', { replace: false, relative: 'path' })}
              className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50
                transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600
                dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
                AI Travel Discovery
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Powered by LangChain & LangGraph
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('..', { replace: false, relative: 'path' })}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500
              text-white font-medium hover:shadow-lg transition-all duration-300"
          >
            View My Trip
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-8 pb-16">
        <DiscoverySearch onResultSelect={handleResultSelect} />
      </main>

      {/* Footer */}
      <footer className="glass-border py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Powered by OpenAI, LangChain, LangGraph, and Weaviate
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Semantic search • Knowledge graphs • Real-time recommendations
          </p>
        </div>
      </footer>
    </div>
  );
};
