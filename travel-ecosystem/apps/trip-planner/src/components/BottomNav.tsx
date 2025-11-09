import React from 'react';
import { motion } from 'framer-motion';
import { Map, Calendar, FileText, Users, Compass } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTripStore } from '../store/tripStore';

type TabItem = {
  id: string;
  label: string;
  icon: typeof Map;
  isRoute?: boolean;
  route?: string;
};

const BottomNav: React.FC = () => {
  const { currentView, setCurrentView } = useTripStore();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: TabItem[] = [
    { id: 'plan', label: 'Plan', icon: Compass, isRoute: true, route: '/trip-planner/discover' },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'collaborate', label: 'Share', icon: Users },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-2xl"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.isRoute 
              ? location.pathname.includes(tab.route!) 
              : currentView === tab.id;

            const handleClick = () => {
              if (tab.isRoute && tab.route) {
                navigate(tab.route);
              } else {
                setCurrentView(tab.id as 'map' | 'calendar' | 'summary' | 'collaborate');
              }
            };

            return (
              <button
                key={tab.id}
                onClick={handleClick}
                className={`
                  relative flex flex-col items-center justify-center w-full h-full
                  transition-colors duration-200
                  ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500 dark:text-gray-400'}
                  hover:text-cyan-500 dark:hover:text-cyan-300
                  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-inset
                  active:scale-95 transition-transform
                `}
                aria-label={`Go to ${tab.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-cyan-50 dark:bg-cyan-900/20"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? 'stroke-2' : 'stroke-1.5'
                    }`}
                  />
                </motion.div>

                {/* Label */}
                <motion.span
                  className={`
                    relative z-10 text-xs font-medium mt-1
                    ${isActive ? 'font-semibold' : 'font-normal'}
                  `}
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {tab.label}
                </motion.span>

                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    className="absolute -top-0.5 w-8 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    layoutId="activeDot"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
