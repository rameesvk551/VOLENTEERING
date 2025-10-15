import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
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
  const [showAddDestinationModal, setShowAddDestinationModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

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
          <div className="h-full p-4">
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

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
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
