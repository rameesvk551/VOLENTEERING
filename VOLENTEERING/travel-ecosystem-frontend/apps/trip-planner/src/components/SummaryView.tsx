import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, MapPin, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useTripStore } from '../store/tripStore';

const SummaryView: React.FC = () => {
  const { destinations, tripName, getTotalDays, getTotalCost, totalBudget } = useTripStore();

  const sortedDestinations = [...destinations].sort((a, b) => a.order - b.order);
  const totalDays = getTotalDays();
  const totalCost = getTotalCost();
  const budgetPercentage = (totalCost / totalBudget) * 100;

  const totalActivities = destinations.reduce((sum, dest) => sum + dest.activities.length, 0);
  const completedActivities = destinations.reduce(
    (sum, dest) => sum + dest.activities.filter((a) => a.completed).length,
    0
  );

  const stats = [
    {
      label: 'Total Days',
      value: totalDays,
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Destinations',
      value: destinations.length,
      icon: MapPin,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Activities',
      value: `${completedActivities}/${totalActivities}`,
      icon: CheckCircle,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Total Cost',
      value: `$${totalCost.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  return (
    <div className="h-full overflow-y-auto pb-24 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {tripName}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Trip Summary & Overview
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative rounded-2xl p-6 overflow-hidden
                  ${stat.bgColor}
                  border-2 border-gray-200 dark:border-gray-700
                `}
              >
                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Budget Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 p-6 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
              Budget Overview
            </h3>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {budgetPercentage.toFixed(0)}%
            </span>
          </div>

          <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-full rounded-full ${
                budgetPercentage > 100
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Spent: <span className="font-bold text-gray-900 dark:text-white">${totalCost.toLocaleString()}</span>
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Budget: <span className="font-bold text-gray-900 dark:text-white">${totalBudget.toLocaleString()}</span>
            </span>
          </div>

          {budgetPercentage > 90 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-3 p-3 rounded-lg ${
                budgetPercentage > 100
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
              }`}
            >
              <p className="text-sm font-medium">
                {budgetPercentage > 100
                  ? '⚠️ You are over budget!'
                  : '⚠️ You are nearing your budget limit'}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Destinations Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Trip Timeline
          </h3>

          <div className="space-y-4">
            {sortedDestinations.map((dest, index) => {
              const days = differenceInDays(new Date(dest.endDate), new Date(dest.startDate)) + 1;
              const completedCount = dest.activities.filter((a) => a.completed).length;

              return (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="relative pl-8 pb-8 border-l-4 border-cyan-500 dark:border-cyan-400"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {dest.name}, {dest.country}
                    </h4>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(dest.startDate), 'MMM d')} - {format(new Date(dest.endDate), 'MMM d')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{days} day{days !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>{completedCount}/{dest.activities.length} activities</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>${dest.estimatedCost.toLocaleString()}</span>
                      </div>
                    </div>

                    {dest.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        "{dest.notes}"
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Empty State */}
        {destinations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No trip data yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start adding destinations to see your trip summary
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SummaryView;
