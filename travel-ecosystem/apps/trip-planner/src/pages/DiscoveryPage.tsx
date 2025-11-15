import React from 'react';
import { DiscoverySearch } from '../components/discovery/DiscoverySearch';
import type { DiscoveryEntity } from '../hooks/useDiscovery';

export const DiscoveryPage: React.FC = () => {
  const handleResultSelect = (result: DiscoveryEntity) => {
    // Result is already added to trip store by ResultCard
    // Optionally navigate to trip planner or show detail modal
    console.log('Result selected:', result);
  };

  return (
    <div className="discovery-page min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50
      dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">

      {/* Main Content */}
      <main className="pt-4 sm:pt-6 md:pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <DiscoverySearch onResultSelect={handleResultSelect} />
      </main>

    </div>
  );
};
