import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Sparkles, Route } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTripStore } from '../store/tripStore';
import BottomNav from '../components/BottomNav';
import FloatingActionButton from '../components/FloatingActionButton';
import TripMap from '../components/TripMap';
import CalendarView from '../components/CalendarView';
import SummaryView from '../components/SummaryView';
import CollaborateView from '../components/CollaborateView';
import AddDestinationModal from '../components/AddDestinationModal';

const AdvancedTripPlanner: React.FC = () => {
  const { currentView, isOffline, setIsOffline } = useTripStore();
  const navigate = useNavigate();
  const [showAddDestinationModal, setShowAddDestinationModal] = useState(false);
  const [, setShowAddNoteModal] = useState(false);

  // Handle offline/online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOffline]);

  // Offline indicator
  const OfflineIndicator = () => (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2"
        >
          <WifiOff className="w-5 h-5" />
          <span className="font-semibold">You're offline</span>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // View component renderer
  const renderView = () => {
    switch (currentView) {
      case 'map':
        return (
          <div className="h-full p-4 relative z-0">
            <TripMap />
          </div>
        );
      case 'calendar':
        return <CalendarView />;
      case 'summary':
        return <SummaryView />;
      case 'collaborate':
        return <CollaborateView />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Navigation Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl 
        border-b border-gray-200 dark:border-gray-700 shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 
              dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
              Trip Planner
            </h1>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('discover')}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg 
                  bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs sm:text-sm 
                  font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">AI Discovery</span>
                <span className="sm:hidden">Discover</span>
              </button>
              
              <button
                onClick={() => navigate('route-optimizer')}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg 
                  bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
                  text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium
                  hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 
                  transition-all duration-300"
              >
                <Route className="w-4 h-4" />
                <span className="hidden sm:inline">Route Optimizer</span>
                <span className="sm:hidden">Route</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative z-0 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton
        onAddDestination={() => setShowAddDestinationModal(true)}
        onAddNote={() => setShowAddNoteModal(true)}
      />

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Modals */}
      <AddDestinationModal
        isOpen={showAddDestinationModal}
        onClose={() => setShowAddDestinationModal(false)}
      />

      {/* PWA Install Prompt - Placeholder */}
      {/* Could add PWA install prompt here */}
    </div>
  );
};

export default AdvancedTripPlanner;
