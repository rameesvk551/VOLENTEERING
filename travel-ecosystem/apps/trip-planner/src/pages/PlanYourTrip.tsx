import React, { useState, useMemo } from 'react';
import { MapPin, Compass } from 'lucide-react';
import DestinationCard from '../components/DestinationCard';
import TripPlanCard from '../components/TripPlanCard';
import SearchFilter from '../components/SearchFilter';
import { destinations, sampleTripPlans, categories } from '../data/dummyData';

const PlanYourTrip: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'destinations' | 'plans'>('destinations');

  // Filter destinations
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchesSearch =
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || dest.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleDestinationClick = (id: string) => {
    console.log('Destination clicked:', id);
    // Navigate to destination details
  };

  const handleTripPlanClick = (id: string) => {
    console.log('Trip plan clicked:', id);
    // Navigate to trip plan details
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="py-10 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <Compass className="w-5 h-5" />
              <span className="text-sm font-semibold">Plan Your Adventure</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
              Discover Your Next
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Dream Destination
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore curated destinations and plan your perfect trip with our intelligent trip planner
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-2xl p-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('destinations')}
                className={`
                  px-6 py-3 rounded-xl font-semibold transition-all duration-200
                  ${
                    activeTab === 'destinations'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <MapPin className="w-5 h-5 inline-block mr-2" />
                Destinations
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`
                  px-6 py-3 rounded-xl font-semibold transition-all duration-200
                  ${
                    activeTab === 'plans'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <Compass className="w-5 h-5 inline-block mr-2" />
                Trip Plans
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          {activeTab === 'destinations' && (
            <SearchFilter
              onSearch={setSearchQuery}
              onFilterChange={setSelectedCategory}
              categories={categories}
              selectedCategory={selectedCategory}
            />
          )}

          {/* Content */}
          {activeTab === 'destinations' ? (
            <>
              {/* Results Count */}
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Found <span className="font-bold text-gray-900 dark:text-white">{filteredDestinations.length}</span> destinations
                </p>
              </div>

              {/* Destinations Grid */}
              {filteredDestinations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredDestinations.map((destination) => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
                      onClick={handleDestinationClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    No destinations found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Trip Plans Header */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Sample Trip Plans
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Get inspired by our curated travel itineraries
                </p>
              </div>

              {/* Trip Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sampleTripPlans.map((tripPlan) => (
                  <TripPlanCard
                    key={tripPlan.id}
                    tripPlan={tripPlan}
                    onClick={handleTripPlanClick}
                  />
                ))}
              </div>
            </>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div
              className="relative rounded-3xl p-12 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)'
              }}
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-0" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                  Create your custom trip plan and get personalized recommendations
                </p>
                <button className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl hover:scale-105 transform duration-200">
                  Create Your Trip Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanYourTrip;
