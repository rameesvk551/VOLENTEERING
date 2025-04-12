import React, { useEffect, useRef, useState } from 'react'
import HostList from '../../components/HostList'

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import { CiBoxes, CiBoxList } from 'react-icons/ci'
import { boolean } from 'yup'
import HostCard from '../../components/HostCard';
import { fetchHosts } from '../../api';
import { useQuery } from '@tanstack/react-query';
import { AiOutlineSearch } from 'react-icons/ai';
import { BiChevronDown } from 'react-icons/bi';
import server from '@/server/app';
import axios from 'axios';
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

const HostListPage = () => {
  const [filters, setFilters] = useState<FiltersType>({
    hostTypes: [],
    hostWelcomes: [],
    numberOfWorkawayers: "any",
  });
  const [hosts, setHosts] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState<AddressValues[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<AddressValues | null>(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
      const fetchFilteredHosts = async () => {
       
        try {
          const response = await axios.post(`${server}/filtered-hosts`, filters);
          console.log("fffffffffiterd res",response);
          
          setHosts(response.data);
        } catch (error) {
          console.error("Error fetching filtered hosts:", error);
        }
      };
    
      fetchFilteredHosts();
    }, [filters]);
    useEffect(() => {
      if (input.length < 3) {
        setSuggestions([]); 
        return;
      }
 
  
      const fetchSuggestions = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${server}/host/places?input=${input}`);
          setSuggestions(response.data || []);
        } catch (error) {
          console.error("Error fetching places:", error);
        } finally {
          setLoading(false);
        }
      };
  
      const timeoutId = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(timeoutId);
    }, [input]);
  const [showFilters,setShowFilters]=useState <boolean>(false)
   const [page, setPage] = useState(1); 
    const { data, isLoading, error } = useQuery({
      queryKey: ["hosts", page], 
      queryFn: () => fetchHosts(page),
      staleTime: 300000, 
    });

    const handleSelect = (place: AddressValues) => {
      setInput(place.display_name);
      setSelectedPlace(place);
      setSuggestions([]);
    };
    if (isLoading) return <p>Loading hosts...</p>;
    if (error) return <p>Error fetching hosts!</p>;
  
  return (
    <div>
     {/**header */}
     <div className="w-full flex items-center justify-between gap-4 px-4 py-2 bg-white border rounded-lg shadow-sm">

{/* Left Side - Filters & Search */}
<div className="flex items-center gap-3 flex-grow">
  
  {/* Filter Button */}
  <button
    onClick={() => setShowFilters(prev => !prev)}
    className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition text-sm"
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
      className="w-full pl-4 pr-10 py-1.5 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 text-sm"
    />
    <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    
    {loading && <p className="text-gray-500 text-xs mt-1">Loading...</p>}

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

  {/* More Filter Tags */}
  <button className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 text-sm">
  Host In My Destinations
  </button>

  <SortDropdown />


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
{showFilters ? <Filters setFilters={setFilters}/> : <></> }
<MapComponent isFilterComponentOpen={showFilters}/> 
    {showFilters ? <></> :<div className={` ${showFilters  ? "w-1/4": "w-1/2"}  flex flex-col gap-y-22  gap-2 px-2 pt-3`}>
            {data.hosts.map((host:Host) => (
        <HostCard key={host._id} host={host} />
      ))}
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


const Filters = ({ setFilters }: { setFilters: (filters: FiltersType) => void }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRadio, setSelectedRadio] = useState("any");
  const [hostWelcome, setHostWelcome] = useState<string[]>([]);
  const hostTypes = [
    "Family", "Hostel", "Individual", "Community", 
    "School", "Farmstay", "Sustainable Project", "Others"
  ];
  const hostWelcomes = ["Families", "Nomads", "Camper Van"];
  const hostDetails = ["Internet Access", "Have Pets", "Smoker", "No Fees"];

  const addToSelectedHelpType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };
  const addToHostWelcomes = (type: string) => {
    setHostWelcome(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };
  const handleApply = () => {
    const filters: FiltersType = {
      hostTypes: selectedTypes,
      numberOfWorkawayers: selectedRadio,
      hostWelcomes:hostWelcome

    };
    console.log("ffffffffffffffil",filters);
    
    setFilters(filters);
  };


  return (
    <div className="w-1/4 h-full px-4 py-5 my-4 mx-2 border border-gray-300 rounded-lg shadow-sm bg-white overflow-y-auto">
      <h3 className="text-xl font-semibold mb-3">Filter Hosts</h3>

      {/* Host Type */}
      <div className="mb-5">
        <h4 className="text-md font-bold mb-2">Host Type</h4>
        <div className="grid grid-cols-2 gap-2">
          {hostTypes.map((type, index) => (
            <div
              key={index}
              className={`px-3 py-2 text-sm text-center rounded-md border transition cursor-pointer ${
                selectedTypes.includes(type)
                  ? "bg-black text-white border-black"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => addToSelectedHelpType(type)}
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
          {hostWelcomes.map((type, index) => (
            <div
              key={index}
              className={`px-3 py-2 text-xs text-center rounded-md border transition cursor-pointer ${
                hostWelcome.includes(type)
                  ? "bg-black text-white border-black"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => addToHostWelcomes(type)}
            >
              {type}
            </div>
          ))}
        </div>
      </div>

      {/* Number of Workawayers */}
      <div className="mb-5">
        <h4 className="text-md font-bold mb-2">Number of Workawayers Accepted</h4>
        <div className="flex flex-row gap-2">
          {["any", "1", "2", "more"].map((value, index) => (
            <label key={index} className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-600">
              <input
                type="radio"
                name="quantity"
                value={value}
                checked={selectedRadio === value}
                onChange={() => setSelectedRadio(value)}
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

      {/* Checkboxes */}
      <div className="mb-5 flex flex-row  gap-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" name="newHost" />
          New Host
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" name="recentlyUpdated" />
          Recently Updated
        </label>
      </div>

      {/* Apply Button */}
      <div className="pt-2">
        <button className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition" onClick={handleApply}>
          Apply
        </button>
      </div>
    </div>
  );
};





const locations = [
  { id: 1, name: "New York", lat: 40.7128, lng: -74.006 },
  { id: 2, name: "London", lat: 51.5074, lng: -0.1278 },
  { id: 3, name: "Tokyo", lat: 35.6895, lng: 139.6917 },
];


   const MapComponent = ({ isFilterComponentOpen }: { isFilterComponentOpen: boolean }) => {
  return (
    <div className={`${isFilterComponentOpen ? "w-3/4" : "w-1/2"} h-[90vh] pt-3`}>
      <MapContainer center={[40.7128, -74.006]} zoom={3} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>{loc.name}</Popup>
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


