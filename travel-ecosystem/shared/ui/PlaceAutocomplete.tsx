import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import axios from 'axios';

interface AddressValues {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
  class: string;
  type: string;
  importance: number;
  name: string;
}

interface PlaceAutocompleteProps {
  value?: string;
  placeholder?: string;
  onSelect: (place: AddressValues) => void;
  className?: string;
  error?: string;
}

export const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({
  value = '',
  placeholder = 'Search location...',
  onSelect,
  className = '',
  error
}) => {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressValues[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions from OpenStreetMap Nominatim
  useEffect(() => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=5`,
          {
            headers: {
              'User-Agent': 'TravelEcosystem/1.0'
            }
          }
        );
        setSuggestions(response.data || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Error fetching places:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [input]);

  const handleSelect = (place: AddressValues) => {
    setInput(place.display_name);
    setSuggestions([]);
    setIsOpen(false);
    onSelect(place);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm sm:text-base
            border-2 rounded-lg
            bg-white text-slate-900
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
            ${error ? 'border-red-500' : 'border-slate-200'}
            placeholder:text-slate-400
          `}
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 animate-spin" />
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((place) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="px-3 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors flex items-start gap-2 border-b border-slate-100 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-slate-700 line-clamp-2">{place.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
