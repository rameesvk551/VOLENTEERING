import React, { useEffect, useState } from 'react';
import PlaceToVisit from './PlaceToVisitCard';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { Search } from 'lucide-react';
import {
  removeSelectedPlace,
  setAttractions,
  setSearchedPlace,
  setSelectedPlace,
} from '@/redux/Slices/attraction';
import server from '@/server/app';
import axios from 'axios';
import { optimizeRoute } from '@/redux/thunks/routeOptimizerThunk';

type AddressValues = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
  class: string;
  type: string;
  importance: number;
  name: string;
  osm_id: number;
  osm_type: string;
  place_rank: number;
  addresstype: string;
  licence: string;
};

const SuggestedPlace = () => {
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 6;

  const [suggestions, setSuggestions] = useState<AddressValues[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const [notFound,setNotFound]=useState(false)
  const { selectedPlace, attractions, searchedPlace } = useSelector(
    (state: RootState) => state.attractions
  );
  const routeStatus = useSelector((state: RootState) => state.routeOptimizer.status);
  const travelMode = useSelector((state: RootState) => state.routeOptimizer.travelMode);

  const totalPages = Math.ceil((attractions?.length || 0) / itemsPerPage);

const paginatedAttractions = attractions?.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
const handleRemovePlace = (place: string, latitude: number, longitude: number) => {
  dispatch(removeSelectedPlace({ place, latitude, longitude }));
};

const handleSelectPlace = (place: string, latitude: number, longitude: number) => {
  dispatch(setSelectedPlace({ place, latitude, longitude }));
};

const handleOptimizeRoute = () => {
  if (selectedPlace.length < 2 || routeStatus === 'loading') return;
  dispatch(optimizeRoute({ travelMode, places: selectedPlace }));
};

useEffect(() => {
  setCurrentPage(1);
}, [attractions]);

  useEffect(() => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(`${server}/host/places?input=${input}`);
        setSuggestions(response.data || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [input]);

  const handleSelect = (place: AddressValues) => {
    setInput(place.display_name);
    setSuggestions([]);
  };

  const handleSearch = () => {
    const extractPlace = input?.split(',').map(part => part.trim());
    const place = extractPlace[0];
    setLoading(true);
  
    axios
      .get(`${server}/trip-planning/get-attractions/${place}`)
      .then(res => {
        const attractions = res.data?.attractions;
        
        if (attractions?.length > 0) {
          dispatch(setSearchedPlace(place));
          dispatch(setAttractions(attractions));
          setNotFound(false); 
        } else {
          dispatch(setAttractions([])); 
          setNotFound(true); 
        }
  
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching attractions:', err);
        dispatch(setAttractions([])); 
        setNotFound(true);
        setLoading(false);
      });
  };
  

 

  return (
<div className="w-full bg-gradient-to-b from-blue-50 to-white min-h-screen">
  {/* Hero Search Section - Full Width */}
  <div className="w-full bg-white shadow-sm border-b border-gray-100">
    <div className="w-full py-6">
      {/* Search Header */}
      <div className="text-center mb-6 px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          🔍 Discover destinations with one search
        </h1>
        <p className="text-gray-600 text-lg">
          Find and select your favorite attractions to plan the perfect trip
        </p>
      </div>

      {/* Search Box - Full Width */}
      <div className="relative w-full px-4">
        <div className="flex items-center rounded-2xl shadow-lg bg-white px-6 py-4 border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
          <Search className="w-6 h-6 text-gray-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Where do you want to go? (e.g., Paris, Tokyo, New York...)"
            className="w-full bg-transparent text-base sm:text-lg focus:outline-none placeholder:text-gray-400"
          />
          <button
            disabled={loading}
            onClick={handleSearch}
            className={`ml-4 px-6 sm:px-8 py-3 text-base font-semibold rounded-xl text-white transition-all flex items-center gap-2 flex-shrink-0 ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                  />
                </svg>
                <span className="hidden sm:inline">Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
            {suggestions.map((place) => (
              <li
                key={place.place_id}
                className="px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                onClick={() => handleSelect(place)}
              >
                <Search className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <span className="flex-1">{place.display_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>

  {/* Main Content Area - Full Width */}
  <div className="w-full py-8">
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Panel - Attractions Grid (Full Width on Mobile) */}
      <div className="flex-1">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {searchedPlace ? (
                <>
                  <span className="text-3xl">📍</span>
                  {attractions?.length || 0} attractions
                  <span className="text-blue-600 ml-2">in {searchedPlace}</span>
                </>
              ) : (
                <>
                  <span className="text-3xl">🎯</span>
                  Suggested Places
                </>
              )}
            </h2>
            {selectedPlace.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">
                  {selectedPlace.length}
                </span>
                {selectedPlace.length === 1 ? 'place' : 'places'} selected
              </p>
            )}
          </div>
        </div>

        {/* Attractions Grid - Modern Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notFound ? (
            <div className="col-span-full bg-yellow-50 border-2 border-yellow-300 text-yellow-800 px-6 py-8 rounded-2xl shadow-lg flex items-center gap-4 justify-center">
              <span className="text-5xl">😕</span>
              <div>
                <p className="font-bold text-xl mb-1">No attractions found</p>
                <p className="text-sm">Try searching a different location or check your spelling</p>
              </div>
            </div>
          ) : paginatedAttractions?.length > 0 ? (
            paginatedAttractions.map((attraction) => {
              const isSelected = selectedPlace.some(
                (place) => place.place === attraction.name
              );
              return (
                <div
                  key={attraction.id}
                  onClick={() =>
                    handleSelectPlace(
                      attraction.name,
                      attraction.geocodes.latitude,
                      attraction.geocodes.longitude
                    )
                  }
                  className={`group relative rounded-2xl transition-all cursor-pointer transform hover:scale-105 ${
                    isSelected
                      ? 'ring-4 ring-blue-500 shadow-2xl scale-105'
                      : 'shadow-md hover:shadow-2xl'
                  }`}
                >
                  <PlaceToVisit attraction={attraction} isSelected={isSelected} />
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 text-gray-500">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-xl font-medium">No attractions found</p>
              <p className="text-sm mt-2">Try searching for a destination above</p>
            </div>
          )}


        </div>

        {/* Pagination - Modern Style */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-5 py-2 bg-white border-2 border-gray-300 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-blue-400 transition-all"
            >
              ← Prev
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                    currentPage === idx + 1
                      ? 'bg-blue-600 text-white shadow-lg scale-110'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-5 py-2 bg-white border-2 border-gray-300 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-blue-400 transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Right Panel - Selected Places (Sticky Sidebar) */}
      {selectedPlace.length > 0 && (
        <div className="w-full lg:w-96 lg:sticky lg:top-6 h-fit">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Plan route</h2>
                    <p className="text-sm text-blue-100">{selectedPlace.length} {selectedPlace.length === 1 ? 'place' : 'places'} selected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Places List */}
            <div className="px-6 py-4">
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {selectedPlace.map((place, idx) => (
                  <div
                    key={idx}
                    className="group p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <h3 className="font-bold text-gray-900 text-sm leading-tight">{place.place}</h3>
                        </div>
                        <p className="text-xs text-gray-600 ml-8">
                          {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleRemovePlace(place.place, place.latitude, place.longitude)
                        }
                        className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Remove"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="px-6 pb-6">
              <button
                disabled={selectedPlace.length < 2 || routeStatus === 'loading'}
                onClick={handleOptimizeRoute}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                  selectedPlace.length < 2
                    ? 'bg-gray-300 cursor-not-allowed'
                    : routeStatus === 'loading'
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 hover:shadow-xl'
                }`}
              >
                {routeStatus === 'loading' ? (
                  <>
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
                    </svg>
                    Optimizing Route...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Optimize Route
                  </>
                )}
              </button>
              {selectedPlace.length < 2 && (
                <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Select at least 2 places to plan a route
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

  );
};

export default SuggestedPlace;
