import React from 'react';

const LoadingFallback: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading application...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
