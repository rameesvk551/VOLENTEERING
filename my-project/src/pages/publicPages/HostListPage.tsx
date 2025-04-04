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

const HostListPage = () => {
  const [showFilters,setShowFilters]=useState <boolean>(false)
   const [page, setPage] = useState(1); 
    const { data, isLoading, error } = useQuery({
      queryKey: ["hosts", page], 
      queryFn: () => fetchHosts(page),
      staleTime: 300000, 
    });
  
    if (isLoading) return <p>Loading hosts...</p>;
    if (error) return <p>Error fetching hosts!</p>;
  
  return (
    <div>
     {/**header */}
     <div className='w-full  flex justify-between mt-3 h-full'>
      <div className=' flex items-center gap-4 p-1'>
        <button className='border border-black rounded-full px-3 ' onClick={() => setShowFilters(prev => !prev)}>Filter</button >
        <div className="relative">
      <input
        type="text"
        className="border border-black rounded-full pl-3 pr-10"
        placeholder="New Delhi"
      />
      <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
    </div>
        <button className='border border-black rounded-full px-3'>Aviailability</button>
        <button className='border border-black rounded-full px-3'> Host Type</button>
        <button className='border border-black rounded-full px-3'>Host In My Destinations</button>
      <SortDropdown/>
      </div>
      <div className='flex flex-row px-3 gap-2 '>
      <CiBoxList size={22} />
      <CiBoxes size={22} />
      </div>

     </div>
<div className="flex flex-row">
{showFilters ? <Filters/> : <></> }
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


const Filters =()=>{
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRadio, setSelectedRadio] = useState("any");


  const hostTypes = [
    "Family",
    "Hostel",
    "Individual",
    "Community",
    "School",
    "Farmstay",
    "Sustainable Project",
    "Others",
  ];
  const hostWelcomes = [
    "Families",
    " nomads",
    "camperVan",
    
  ];
  const hostDetails = [
    "Internet Access",
    "Have Pets",
    "smoker",
    "no fees",
    
  ];

  const addToSelectedHelpType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };
  console.log("sele",selectedTypes);
  
return(
  <div className='w-1/4 h-[90vh] px-3 pt-3 my-3 mx-2   border border-black'>
  <h4 className="text-lg font-bold">Host Type</h4>
  <div className='grid grid-cols-2 gap-2   '>
  {hostTypes.map((type, index) => (
        <div key={index} className={`p-2  flex border rounded-md  justify-center bg-gray-100 ${selectedTypes.includes(type)? "border border-black":""} cursor-pointer`} onClick={()=>{addToSelectedHelpType(type)}}>
          {type}
        </div>
      ))}
  </div>

  <div>
    <RangeSlider/>
  </div>

  <div>
    <h4 className='font-bold'>Host welcomes:</h4>
  <div className='grid grid-cols-3 gap-2 pt-2  '>
  {hostWelcomes.map((type, index) => (
        <div key={index} className={`p-2  flex border rounded-md  text-sm justify-center bg-gray-100 ${selectedTypes.includes(type)? "border border-black":""} cursor-pointer`} onClick={()=>{addToSelectedHelpType(type)}}>
          {type}
        </div>
      ))}
  </div>
  </div>


  <div className='ml-6'>
  <div className="flex flex-col  pt-4">
<h4 className='font-bold'>Number of Workawayers accepted:</h4>
<div className='flex flex-row  gap-2 px-2'>
<label className="flex items-center gap-2 cursor-pointer hover:text-blue-500">
    <input type="radio" name="quantity" value="any" checked={selectedRadio === "any"} onChange={() => setSelectedRadio("any")} />
    Any
  </label>
  <label className="flex items-center gap-2 cursor-pointer hover:text-blue-500">
    <input type="radio" name="quantity" value="1" checked={selectedRadio === "1"} onChange={() => setSelectedRadio("1")} />
    1
  </label>
  <label className="flex items-center gap-2 cursor-pointer hover:text-blue-500">
    <input type="radio" name="quantity" value="2" checked={selectedRadio === "2"} onChange={() => setSelectedRadio("2")} />
    2
  </label>
  <label className="flex items-center gap-2 cursor-pointer hover:text-blue-500">
    <input type="radio" name="quantity" value="more" checked={selectedRadio === "more"} onChange={() => setSelectedRadio("more")} />
    More than two
  </label>
</div>
</div>

<div className="flex gap-4 pt-4 px-2 items-center">
  <label>
    <input type="checkbox" name="newHost" /> New Host
  </label>
  <label>
    <input type="checkbox" name="recentlyUpdated" /> Recently Updated
  </label>
</div>

  </div>

<div className="flex justify-center items-center pt-3 ">
<button className='bg-black text-white px-10 py-1 w-4/5 rounded-md  '>APPLAY</button>

</div>
</div>
)
}

const RangeSlider = () => {
  const [value, setValue] = useState(50);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto p-4">
      {/* Label with value */}
      <div className="text-lg font-semibold text-gray-700">
       Host Score: <span className="text-blue-500">{value}% and up</span>
      </div>

      {/* Range Slider */}
      <input
        type="range"
        min="0"
        max="90"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`,
        }}
      />

      {/* Indicator below the slider */}
      <div className="relative w-full">
        <div
          className="absolute top-[-10px] text-sm font-medium text-white bg-blue-500 px-3 py-1 rounded-md"
          style={{
            left: `calc(${value}% - 15px)`,
            transition: "left 0.2s ease-in-out",
          }}
        >
          {value}
        </div>
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


