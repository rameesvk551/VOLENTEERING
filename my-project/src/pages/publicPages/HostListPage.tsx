import React, { useEffect, useMemo, useRef, useState } from 'react'
import HostList from '../../components/HostList'

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import { CiBoxes, CiBoxList } from 'react-icons/ci'
import { boolean } from 'yup'
import HostCard from '../../components/HostCard';
import {fetchHosts } from '../../api';
import { useQuery } from '@tanstack/react-query';
import { AiOutlineSearch } from 'react-icons/ai';
import { BiChevronDown } from 'react-icons/bi';
import server from '@/server/app';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
type AddressValues = {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
};
export type FiltersType = {
  hostTypes: string[];
  numberOfWorkawayers: string;
  hostWelcomes:string[]

};



type FilteredHostsResponse = {
  hosts: any[]; // replace `any` with your Host type if you have one
  currentPage: number;
  totalPages: number;
  totalHosts: number;
};
const HostListPage = () => {
  const [filters, setFilters] = useState<FiltersType>({
    hostTypes: [],
    hostWelcomes: [],
    numberOfWorkawayers: "any",
  });

  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<AddressValues[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<AddressValues | null>(null);
  const [searchedPlace, setSearchedPlace] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [showNextDestination, setShowNextDestination] = useState(false);
  const [nextDestination, setNextDestination] = useState("");
const [loading,setLoading]=useState(null)
  const { volenteerData } = useSelector((state: RootState) => state.volenteer);
  const [showMap,setShowMap]=useState<boolean>(true)
const toggleMapView=()=>{
  setShowFilters(!showFilters)
  setShowMap(!showMap);

}
  // Extract place when selectedPlace changes
  useEffect(() => {
    if (selectedPlace?.display_name) {
      const place = selectedPlace.display_name.split(",")[0].trim();
      setSearchedPlace(place);
      setShowNextDestination(false);
    }
  }, [selectedPlace]);

  // Handler to show hosts in user's next destination
  const hostInMyNextDestination = () => {
    const destination =volenteerData?.user?.nextDestination.destination
    if (destination) {
      setNextDestination(destination);
      setShowNextDestination(true);
      setInput("");
      setSelectedPlace(null);
    }
  };

  // Decide final place based on user's action
  const place = useMemo(() => {
    return showNextDestination ? nextDestination : searchedPlace;
  }, [searchedPlace, nextDestination, showNextDestination]);

  // Fetch suggestions based on user input
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
        console.error("Error fetching suggestions:", error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [input]);

  // Handle place selection
  const handleSelect = (place: AddressValues) => {
    setInput(place.display_name);
    setSelectedPlace(place);
    setShowNextDestination(false);
    setNextDestination("");
    setSuggestions([]);
  };
const toggleFilter=()=>{
  setShowMap(!showMap)
  setShowFilters(prev => !prev)
}
  // Query to fetch filtered hosts
  const {
    data,
    isLoading,
    error,
  } = useQuery<FilteredHostsResponse, Error, FilteredHostsResponse, [string, FiltersType, string, number]>({
    queryKey: ["fetchHosts", filters, place, page],
    queryFn: fetchHosts,
    staleTime: 5 * 60 * 1000, // 5 minutes
   
  });

  // Transform host data for map
  const hostsForMap = useMemo(
    () =>
      data?.hosts.map((host) => ({
        id: host._id,
        desc: host.description,
        lat: host.address?.lat,
        lng: host.address?.lon,
      })) || [],
    [data]
  );

  ;

   
  return (
    <div>
     {/**header */}
     <div className="w-full flex items-center justify-between gap-4 px-4 py-2 bg-white border rounded-lg shadow-sm">

{/* Left Side - Filters & Search */}
<div className="flex items-center gap-3 flex-grow">
  
  {/* Filter Button */}
  <button
    onClick={toggleFilter}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 border shadow-sm ${
      showFilters
        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
    }`}
  >
    Filter
  </button>

  {/* Search Input */}
  <div className="relative w-full max-w-sm">
    <input
      value={input}
      type="text"
      placeholder="Search for a place"
      onChange={(e) => setInput(e.target.value)}
      className="w-full pl-4 pr-10 py-1.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 text-sm"
    />
    <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    
   
    {suggestions.length > 0 && (
      <ul className="absolute z-50 left-0 right-0 bg-white border mt-2 rounded-md shadow max-h-60 overflow-auto">
        {suggestions.map((place) => (
          <li
            key={place.place_id}
            className="cursor-pointer px-3 py-2 hover:bg-gray-100 text-sm"
            onClick={() => handleSelect(place)}
          >
            {place.display_name}
          </li>
        ))}
      </ul>
    )}
  </div>

  <button
  onClick={hostInMyNextDestination}
  className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 border shadow-sm ${
    showNextDestination
      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
  }`}
>
  🌍 Host In My Destination
</button>
<button
  onClick={toggleMapView}
  className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 border shadow-sm ${
    showMap
      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
  }`}
>
 Map View
</button>





</div>

{/* View Icons */}
<div className="flex items-center gap-2">
  <button className="p-2 hover:bg-gray-100 rounded-md transition">
    <CiBoxList size={22} />
  </button>
  <button className="p-2 hover:bg-gray-100 rounded-md transition">
    <CiBoxes size={22} />
  </button>
</div>
</div>

<div className="flex flex-row">
{showFilters ? <Filters filters={filters} setFilters={setFilters} /> : null}
{showMap ? <MapComponent isFilterComponentOpen={showFilters} locations={hostsForMap}/>:<></> }

    {<div className={` ${showMap  ? "w-1/2": "w-full"}  flex flex-col gap-y-22  gap-2 px-2 pt-3`}>
    {error ? (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow">
        <div className="w-16 h-16 bg-red-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="w-1/3 h-4 bg-red-300 rounded" />
          <div className="w-1/2 h-4 bg-red-200 rounded" />
        </div>
      </div>
    ))}
    <p className="text-red-500 font-semibold text-center">⚠️ Error fetching hosts!</p>
  </div>
) : isLoading ? (
    
<div className="space-y-4 animate-pulse">
  {Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm">
      <div className="w-16 h-16 bg-gray-300 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="w-1/3 h-4 bg-gray-300 rounded" />
        <div className="w-1/2 h-4 bg-gray-200 rounded" />
        <div className="w-1/4 h-3 bg-gray-200 rounded" />
      </div>
    </div>
  ))}
</div>

    ):(
      data?.hosts.map((host:Host) => (
        <HostCard key={host._id} host={host} />
      ))
    )}
       
<div className="flex justify-center mt-5 gap-3">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        Previous
      </button>
      <button
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        Next
      </button>
    </div>
         
        </div>}
</div>

    </div>
  )
}

export default HostListPage



interface Props {
  filters: FiltersType;
  setFilters: (filters: FiltersType) => void;
}

const HOST_TYPES = [
  "Family", "Hostel", "Individual", "Community", 
  "School", "Farmstay", "Sustainable Project", "Others"
];

const HOST_WELCOMES = ["Families", "Nomads", "Camper Van"];
const WORKAWAYERS_OPTIONS = ["any", "1", "2", "more"];

const Filters = ({ filters, setFilters }: Props) => {
  const toggleSelection = (list: string[], value: string): string[] => {
    return list.includes(value)
      ? list.filter(item => item !== value)
      : [...list, value];
  };

  const handleHostTypeClick = (type: string) => {
    const updated = toggleSelection(filters.hostTypes, type);
    setFilters({ ...filters, hostTypes: updated });
  };

  const handleWelcomeClick = (type: string) => {
    const updated = toggleSelection(filters.hostWelcomes, type);
    setFilters({ ...filters, hostWelcomes: updated });
  };

  const handleRadioChange = (value: string) => {
    setFilters({ ...filters, numberOfWorkawayers: value });
  };

  return (
    <div className="w-1/4 h-full px-4 py-5 my-4 mx-2 border border-gray-300 rounded-lg shadow-sm bg-white overflow-y-auto">
      <h3 className="text-xl font-semibold mb-3">Filter Hosts</h3>

      {/* Host Type */}
      <div className="mb-5">
        <h4 className="text-md font-bold mb-2">Host Type</h4>
        <div className="grid grid-cols-2 gap-2">
          {HOST_TYPES.map(type => (
            <div
              key={type}
              className={`px-3 py-2 text-sm text-center rounded-md border transition cursor-pointer ${
                filters.hostTypes.includes(type)
                  ? "bg-black text-white border-black"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => handleHostTypeClick(type)}
            >
              {type}
            </div>
          ))}
        </div>
      </div>

      {/* Host Welcomes */}
      <div className="mb-5">
        <h4 className="text-md font-bold mb-2">Host Welcomes</h4>
        <div className="grid grid-cols-3 gap-2">
          {HOST_WELCOMES.map(type => (
            <div
              key={type}
              className={`px-3 py-2 text-xs text-center rounded-md border transition cursor-pointer ${
                filters.hostWelcomes.includes(type)
                  ? "bg-black text-white border-black"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => handleWelcomeClick(type)}
            >
              {type}
            </div>
          ))}
        </div>
      </div>

      {/* Number of Workawayers Accepted */}
      <div className="mb-5">
        <h4 className="text-md font-bold mb-2">Number of Workawayers Accepted</h4>
        <div className="flex flex-col gap-2">
          {WORKAWAYERS_OPTIONS.map(value => (
            <label
              key={value}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-600"
            >
              <input
                type="radio"
                name="quantity"
                value={value}
                checked={filters.numberOfWorkawayers === value}
                onChange={() => handleRadioChange(value)}
              />
              {value === "any"
                ? "Any"
                : value === "more"
                ? "More than two"
                : value}
            </label>
          ))}
        </div>
      </div>

      {/* Checkboxes (Optional UI only) */}
      <div className="mb-5 flex flex-row gap-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" name="newHost" />
          New Host
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" name="recentlyUpdated" />
          Recently Updated
        </label>
      </div>
    </div>
  );
};





const locations = [
  { id: 1, name: "New York", lat: 40.7128, lng: -74.006 },
  { id: 2, name: "London", lat: 51.5074, lng: -0.1278 },
  { id: 3, name: "Tokyo", lat: 35.6895, lng: 139.6917 },
];


const MapComponent = ({
  isFilterComponentOpen,
  locations,
}: {
  isFilterComponentOpen: boolean;
  locations: { id: string; desc: string; lat: number | null; lng: number | null }[]; // Update types for lat/lng to include null
}) => {
  const defaultLat = 40.7128; // Default latitude (New York)
  const defaultLng = -74.006; 
console.log("lllllllllllllllllloac",locations);

  return (
    <div className={`${isFilterComponentOpen ? "w-3/4" : "w-1/2"} h-[90vh] pt-3`}>
      <MapContainer center={[defaultLat, defaultLng]} zoom={3} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.lat ?? defaultLat, loc.lng ?? defaultLng]} // Fallback to defaultLat and defaultLng
          >
            <Popup>{loc.desc}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

 















const SortDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Newest First");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    "Newest First",
    "Oldest First",
    "Most Popular",
    "Highest Rated",
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className="border border-black rounded-full px-4 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected} <BiChevronDown size={18} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg border rounded-lg z-10">
          {options.map((option, index) => (
            <div
              key={index}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${
                selected === option ? "bg-gray-200 font-semibold" : ""
              }`}
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


