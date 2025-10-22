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
      className="summary-section glass p-8 rounded-2xl mb-8 shadow-xl"
    >
      {/* Headline with gradient */}
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-purple-600
          dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent"
      >
        {summary.headline}
      </motion.h2>

      {/* Overview */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed"
      >
        {summary.overview}
      </motion.p>

      {/* Highlights */}
      {summary.highlights && summary.highlights.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="highlights mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg dark:text-white">Top Highlights</h3>
          </div>
          <ul className="space-y-3">
            {summary.highlights.map((highlight, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-start gap-3 group"
              >
                <div className="mt-1 flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-cyan-500 group-hover:text-purple-500 transition-colors duration-300" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
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
          className="best-time mb-4 p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-purple-50
            dark:from-cyan-900/20 dark:to-purple-900/20 border border-cyan-200 dark:border-cyan-800"
        >
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg dark:text-white">Pro Tips</h3>
          </div>
          <ul className="space-y-2">
            {summary.tips.map((tip, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + idx * 0.05 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="text-amber-500 mt-0.5">•</span>
                <span className="text-gray-600 dark:text-gray-400">{tip}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};
