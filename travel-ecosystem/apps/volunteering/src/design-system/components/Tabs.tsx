import React from 'react';
import { cn } from '../utils/cn';

/* ========================================
   TABS COMPONENT
   Accessible tab navigation
   ======================================== */

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'enclosed';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  className,
}) => {
  const sizes = {
    sm: 'text-sm py-2 px-3',
    md: 'text-sm py-2.5 px-4',
    lg: 'text-base py-3 px-5',
  };

  const variants = {
    underline: {
      container: 'border-b border-gray-200',
      tab: cn(
        'relative border-b-2 border-transparent',
        'text-gray-500 hover:text-gray-700 hover:border-gray-300',
        'transition-colors duration-200'
      ),
      active: 'text-primary-600 border-primary-500',
    },
    pills: {
      container: 'bg-gray-100 p-1 rounded-lg',
      tab: cn(
        'rounded-md text-gray-600 hover:text-gray-900',
        'transition-all duration-200'
      ),
      active: 'bg-white text-gray-900 shadow-sm',
    },
    enclosed: {
      container: 'border-b border-gray-200',
      tab: cn(
        'border border-transparent rounded-t-lg -mb-px',
        'text-gray-500 hover:text-gray-700',
        'transition-colors duration-200'
      ),
      active: 'bg-white border-gray-200 border-b-white text-primary-600',
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      role="tablist"
      className={cn(
        'flex',
        fullWidth && 'w-full',
        currentVariant.container,
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          className={cn(
            'flex items-center justify-center gap-2 font-medium',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            sizes[size],
            currentVariant.tab,
            activeTab === tab.id && currentVariant.active,
            fullWidth && 'flex-1',
            tab.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
          {tab.label}
          {tab.badge !== undefined && (
            <span
              className={cn(
                'ml-1.5 px-2 py-0.5 text-xs font-medium rounded-full',
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-200 text-gray-600'
              )}
            >
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

/* Tab Panel */
interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tabId: string;
  activeTab: string;
}

const TabPanel: React.FC<TabPanelProps> = ({
  tabId,
  activeTab,
  children,
  className,
  ...props
}) => {
  if (tabId !== activeTab) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${tabId}`}
      aria-labelledby={tabId}
      className={cn('animate-fade-in', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabPanel };
