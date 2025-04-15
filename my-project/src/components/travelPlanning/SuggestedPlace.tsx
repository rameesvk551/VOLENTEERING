import React, { useEffect, useState } from 'react';
import PlaceToVisit from './PlaceToVisitCard';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { Search } from 'lucide-react';
import {
  removeSelectedPlace,
  setAttractions,
  setSearchedPlace,
  setSelectedPlace,
} from '@/redux/Slices/attraction';
import server from '@/server/app';
import axios from 'axios';

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

  const [suggestions, setSuggestions] = useState<AddressValues[]>();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const [notFound,setNotFound]=useState(false)
  const { selectedPlace, attractions, searchedPlace } = useSelector(
    (state: RootState) => state.attractions
  );

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
<div className="flex flex-col lg:flex-row gap-6 px-4 md:px-10 py-8 min-h-screen">
  {/* Left Panel - Search & Suggested */}
  <div className="w-full lg:w-2/3 space-y-6">
    {/* Search Box */}
    <div className="relative w-full max-w-xl mx-auto">
      <div className="flex items-center rounded-xl shadow-md bg-white px-4 py-3 border focus-within:ring-2 focus-within:ring-blue-300">
        <Search className="w-5 h-5 text-gray-500 mr-2" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search for a place"
          className="w-full bg-transparent text-sm focus:outline-none"
        />
        <button
          disabled={loading}
          onClick={handleSearch}
          className={`ml-4 px-4 py-2 text-sm font-medium rounded-xl text-white transition ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <svg
              className="animate-spin h-4 w-4 mx-auto"
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
          ) : (
            <>Search</>
          )}
        </button>
      </div>

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((place) => (
            <li
              key={place.place_id}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition"
              onClick={() => handleSelect(place)}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* Suggested Places */}
    <div>
      <h2 className="text-xl font-bold text-blue-800 mb-4">📍 Suggested Places</h2>
      <div className="grid sm:grid-cols-2 gap-4">
      {notFound ? (
  <div className="w-full bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl shadow-sm flex items-center gap-3">
    <span className="text-2xl">😕</span>
    <div>
      <p className="font-semibold">No attractions found</p>
      <p className="text-sm">Try searching a different place or spelling it differently.</p>
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
        className={`rounded-xl transition-shadow cursor-pointer ${
          isSelected
            ? 'border-2 border-blue-500 shadow-lg'
            : 'border border-gray-200 hover:shadow-md hover:border-blue-300'
        }`}
      >
        <PlaceToVisit attraction={attraction} />
      </div>
    );
  })
) : (
  <div className="text-gray-500 italic">No attractions found.</div>
)}


       
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === idx + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-blue-100'
              }`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  </div>

  {/* Right Panel - Selected Places */}
 {selectedPlace.length > 0 &&(
   <div className="w-full lg:w-1/3 h-full bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mt-4 lg:mt-16">
   <h2 className="font-bold text-green-600 mb-4">✅ Selected Places</h2>

   {selectedPlace?.length > 0 ? (
     <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
       {selectedPlace.map((place, idx) => (
         <div
           key={idx}
           className="p-3 rounded-lg bg-gray-50 border flex justify-between items-center"
         >
           <h3 className="font-semibold text-gray-800">{place.place}</h3>
           <button
             onClick={() =>
               handleRemovePlace(place.place, place.latitude, place.longitude)
             }
             className="text-red-500 text-sm hover:underline ml-4"
           >
             Remove
           </button>
         </div>
       ))}
     </div>
   ) : (
     <div className="text-gray-500 italic">No place selected yet.</div>
   )}
 </div>
 )}
</div>

  );
};

export default SuggestedPlace;
