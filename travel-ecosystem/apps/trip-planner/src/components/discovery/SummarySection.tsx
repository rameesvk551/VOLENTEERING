import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Lightbulb } from 'lucide-react';
import type { Summary } from '../../hooks/useDiscovery';

interface SummarySectionProps {
  summary: Summary;
}

export const SummarySection: React.FC<SummarySectionProps> = ({ summary }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="summary-section bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg 
        p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 shadow-xl
        border border-gray-200 dark:border-gray-700"
    >
      {/* Headline with gradient */}
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 
          bg-gradient-to-r from-cyan-600 to-purple-600
          dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent"
      >
        {summary.headline}
      </motion.h2>

      {/* Overview */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base 
          md:text-lg leading-relaxed"
      >
        {summary.overview}
      </motion.p>

      {/* Highlights */}
      {summary.highlights && summary.highlights.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="highlights mb-4 sm:mb-6"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
              Top Highlights
            </h3>
          </div>
          <ul className="space-y-2 sm:space-y-3">
            {summary.highlights.map((highlight, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-start gap-2 sm:gap-3 group"
              >
                <div className="mt-0.5 sm:mt-1 flex-shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 
                    group-hover:text-purple-500 transition-colors duration-300" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm 
                  md:text-base leading-relaxed">
                  {highlight}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Best Time */}
      {summary.bestTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="best-time mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg sm:rounded-xl 
            bg-gradient-to-r from-cyan-50 to-purple-50
            dark:from-cyan-900/20 dark:to-purple-900/20 
            border border-cyan-200 dark:border-cyan-800"
        >
          <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="font-bold text-cyan-600 dark:text-cyan-400">Best Time:</span>{' '}
            {summary.bestTime}
          </p>
        </motion.div>
      )}

      {/* Tips */}
      {summary.tips && summary.tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="tips"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
              Pro Tips
            </h3>
          </div>
          <ul className="space-y-1.5 sm:space-y-2">
            {summary.tips.map((tip, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + idx * 0.05 }}
                className="flex items-start gap-2 text-xs sm:text-sm"
              >
                <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                <span className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {tip}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};
