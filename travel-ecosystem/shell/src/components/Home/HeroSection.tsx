import React, { useState } from 'react';

const HeroSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'destination' | 'hotel' | 'flight'>('destination');

  const handleSearch = () => {
    console.log(`Searching for ${searchType}:`, searchQuery);
    // Add search logic here
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920"
          alt="Travel destination"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-purple-900/60 to-pink-900/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Explore the World
            <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mt-2">
              Your Way
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Plan trips, book hotels, find flights, discover destinations, and share your adventures through our blog
          </p>

          {/* Search section */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto">
            {/* Search type tabs */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              <button
                onClick={() => setSearchType('destination')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  searchType === 'destination'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🗺️ Destinations
              </button>
              <button
                onClick={() => setSearchType('hotel')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  searchType === 'hotel'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏨 Hotels
              </button>
              <button
                onClick={() => setSearchType('flight')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  searchType === 'flight'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✈️ Flights
              </button>
            </div>

            {/* Search bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${searchType === 'destination' ? 'destinations' : searchType === 'hotel' ? 'hotels' : 'flights'}...`}
                className="flex-1 px-6 py-4 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-800 text-lg"
              />
              <button
                onClick={handleSearch}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105"
              >
                Search
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-white/80 mt-1">Destinations</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-white/80 mt-1">Hotels</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-white">5K+</div>
              <div className="text-white/80 mt-1">Flights Daily</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-white/80 mt-1">Happy Travelers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
