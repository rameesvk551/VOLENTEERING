import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, StickyNote, X } from 'lucide-react';

interface FloatingActionButtonProps {
  onAddDestination: () => void;
  onAddNote: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onAddDestination,
  onAddNote,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'destination',
      label: 'Add Destination',
      icon: MapPin,
      color: 'from-cyan-500 to-blue-500',
      onClick: () => {
        onAddDestination();
        setIsOpen(false);
      },
    },
    {
      id: 'note',
      label: 'Add Note',
      icon: StickyNote,
      color: 'from-amber-500 to-orange-500',
      onClick: () => {
        onAddNote();
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col gap-3 mb-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  onClick={action.onClick}
                  className={`
                    flex items-center gap-3 bg-gradient-to-r ${action.color}
                    text-white px-4 py-3 rounded-full shadow-lg
                    hover:shadow-xl transition-shadow
                    focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                  `}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={action.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium whitespace-nowrap text-sm">
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-2xl
          flex items-center justify-center
          bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500
          text-white
          hover:shadow-cyan-500/50 transition-shadow
          focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800
        `}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.div>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActionButton;
