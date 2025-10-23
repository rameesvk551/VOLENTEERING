import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MapComponent from './MapComponent';
import server from '@server/app';
import { Address } from '@redux/Slices/hostFormSlice';

interface PlacesAutocompleteProps {
  onSelectAddress: (address: Address) => void;
  initialValue?: Address | null;
}

const PlacesAutocompleteForHost: React.FC<PlacesAutocompleteProps> = ({ onSelectAddress, initialValue = null }) => {
  const [input, setInput] = useState(initialValue?.display_name ?? '');
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Address | null>(initialValue);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Address[]>(`${server}/host/places`, {
          params: { input },
          withCredentials: true,
        });
        setSuggestions(response.data || []);
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [input]);

  useEffect(() => {
    if (initialValue) {
      setSelectedPlace(initialValue);
      setInput(initialValue.display_name);
    }
  }, [initialValue]);

  const handleSelect = (place: Address) => {
    setInput(place.display_name);
    setSelectedPlace(place);
    setSuggestions([]);
    onSelectAddress(place);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto mt-10">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search location..."
        className="mr-10 block mb-3 px-3 py-2.5 border w-full border-gray-300 rounded-md focus:outline-none"
      />

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}

      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border mt-2 p-2 shadow-md z-10 max-h-64 overflow-y-auto">
          {suggestions.map((place) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="cursor-pointer p-2 hover:bg-gray-200"
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}

      {selectedPlace && (
        <>
          <p className="mt-4 text-green-600 font-bold">Selected: {selectedPlace.display_name}</p>

          <h1 className="pt-4">Your exact location on OpenStreetMap</h1>
          <MapComponent lat={parseFloat(selectedPlace.lat)} lon={parseFloat(selectedPlace.lon)} />
        </>
      )}
    </div>
  );
};

export default PlacesAutocompleteForHost;
