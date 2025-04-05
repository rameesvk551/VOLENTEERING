import {  Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
const HotelBookingPage = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isFilterComponentOpen, setIsFilterComponentOpen] = useState<boolean>(false);
const totalPages = 5; 

const handleNext = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
    // fetch data for the next page
  }
};

const handlePrev = () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
    // fetch data for the previous page
  }
};

  
  return (
<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
  {/* Header */}
  <Header
    isFilterComponentOpen={isFilterComponentOpen}
    setIsFilterComponentOpen={setIsFilterComponentOpen}
  />

  {/* Content */}
  <div className="h-[calc(100vh-80px)] mt-[70px]">

    <div className="flex h-full w-full overflow-hidden">
   

      {/* Mobile Filters */}
      {isFilterComponentOpen && (
       
          <Filters />
      
      )}

      {/* Map */}
      {!isFilterComponentOpen && (
        <div className="hidden md:block w-1/2 h-full sticky top-[60px]">
          <MapComponent isFilterComponentOpen={isFilterComponentOpen} />
        </div>
      )}

      {/* Hotel Cards */}
      <div
        className={`${
          isFilterComponentOpen ? 'md:w-3/4' : 'md:w-1/2'
        } w-full h-full overflow-y-auto px-4 py-2`}
      >
        <div className="flex flex-col gap-2">
          <HotelCard />
          <HotelCard />
          <HotelCard />

          {/* Pagination */}
          <div className="w-full flex justify-center items-center py-4">
  <div className="inline-flex items-center space-x-1 text-sm font-medium text-gray-700">
    
    {/* Previous Button */}
    <button
      onClick={handlePrev}
      disabled={currentPage === 1}
      className={`px-3 py-1.5 rounded-md border transition ${
        currentPage === 1
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-white hover:bg-gray-100'
      }`}
    >
      Previous
    </button>

    {/* Page Numbers */}
    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
      <button
        key={page}
        onClick={() => setCurrentPage(page)}
        className={`px-3 py-1.5 rounded-md border transition ${
          currentPage === page
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white hover:bg-gray-100'
        }`}
      >
        {page}
      </button>
    ))}

    {/* Next Button */}
    <button
      onClick={handleNext}
      disabled={currentPage === totalPages}
      className={`px-3 py-1.5 rounded-md border transition ${
        currentPage === totalPages
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-white hover:bg-gray-100'
      }`}
    >
      Next
    </button>
  </div>
</div>

        </div>
      </div>
    </div>
  </div>
</div>



  );
};

export default HotelBookingPage;



const Header =  ({
    isFilterComponentOpen,
    setIsFilterComponentOpen,
  }: {
    isFilterComponentOpen: boolean;
    setIsFilterComponentOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
  const inputStyles =
    "bg-white border border-gray-300 rounded-2xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200 text-sm";
  const buttonStyles =
    "bg-white border border-gray-300 rounded-2xl px-5 py-2 font-medium text-sm shadow-sm hover:bg-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200";
    
  return (
    <div className="w-full px-6 py-4 fixed top-0 left-0  z-50">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Button */}
          <button className={buttonStyles} onClick={() => setIsFilterComponentOpen(prev => !prev)}
          >Filter</button>

          {/* Location Input with Icon */}
          <div className="relative">
            <input
              type="text"
              placeholder="New Delhi"
              className={inputStyles}
            />
            <AiOutlineSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input type="date" className={inputStyles} />
            <span className="text-gray-500 text-sm font-semibold">to</span>
            <input type="date" className={inputStyles} />
          </div>

        

          {/* Nearest to Me */}
          <button className={buttonStyles}>Nearest to me</button>
        </div>

        {/* Right Actions (Dropdowns) */}
        <div className="flex flex-wrap items-center gap-1">
        <MyDropdown
            name="Stars"
            dropdownItems={["2 Star", "3 Star", " 4 Star", "5 Star"]}
          />
          <MyDropdown
            name="Rating"
            dropdownItems={[
              "5 stars",
              "4 stars & up",
              "3 stars & up",
              "2 stars & up",
              "1 star & up",
            ]}
          />

          <MyDropdown
            name="Sort"
            dropdownItems={[
              "Latest",
              "Newest",
              "Price (lowest first)",
              "Price (highest first)",
              "Property Rating (highest first)",
              "Property Rating (lowest first)",
              "Top reviewed",
            ]}
          />
        </div>
      </div>
    </div>
  );
};

const MyDropdown = ({
  dropdownItems,
  name,
}: {
  dropdownItems: string[];
  name: string;
}) => {
  const [selectedItem, setSelectedItem] = useState<string>(name);
  useEffect(() => {}, [selectedItem]);
  const handleSelect = (item: string) => {
    setSelectedItem(item);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{selectedItem}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {dropdownItems.map((item) => (
          <DropdownMenuItem key={item} onClick={() => handleSelect(item)}>
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Filters = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const propertyTypes = [
    "Homestays",
    "Hostels",
    "Hotels",
    "Resorts",
    "Villas",
    "Farmstay",
    "Lodges",
"Tent",
    "GustHouses",
  ];

  const propertyCounts: { [key: string]: number } = {
    Homestays: 12,
    Hostels: 8,
    Hotels: 23,
    villa: 29,
    Resorts: 5,
    Villas: 10,
    Farmstay: 7,
    Lodges: 3,
    GustHouses: 6,
    Tent:7
  };

  const facilities = [
    "Parking",
    "Wifi",
    "Spa",
    "AC",
    "Pool",
    " Restaurent",
    "Family room",,
    "Room Service",
    "Kitchenette",
  ];
 

  const addToSelectedHelpType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="w-1/4 h-[90vh] px-3 pt-3 my-1 mx-1 border border-white bg-gradient-to-b from-blue-50 to-white rounded-lg shadow-md">
      {/* Property Type */}
      <h4 className="text-lg font-bold mb-2">Property Type</h4>
      <div className="flex flex-wrap gap-2">
        {propertyTypes.map((type, index) => (
          <div
            key={index}
            className={`p-2 flex items-center justify-between border rounded-2xl text-[13px] bg-white ${
              selectedTypes.includes(type) ? "ring-2 focus:ring-blue-400 focus:outline-none transition" : ""
            } cursor-pointer hover:bg-gray-100`}
            onClick={() => addToSelectedHelpType(type)}
          >
            <span>{type}</span>
            <span className="text-gray-500 text-xs">
              ({propertyCounts[type] || 0})
            </span>
          </div>
        ))}
      </div>

      {/* Range Slider */}
      <div className="my-2">
        <PriceRangeSlider />
      </div>

      {/* Host Welcomes */}
      <div className="mt-2 mb-2 ">
    
        <h4 className="font-bold mb-2">Facilities:</h4>
        <div className="flex flex-wrap gap-2">
          {facilities.map((type, index) => (
            <div
              key={index}
              className={`p-2 flex items-center justify-between border rounded-2xl text-[13px] bg-white ${
                selectedTypes.includes(type) ? "ring-2 focus:ring-blue-400 focus:outline-none transition" : ""
              } cursor-pointer hover:bg-gray-100`}
              onClick={() => addToSelectedHelpType(type)}
            >
              <span>{type}</span>
              <span className="text-gray-500 text-xs">
                ({propertyCounts[type] || 0})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Property Type */}

      {/* Apply Button */}
      <div className="flex justify-center items-center py-1 px-4">
  <button className="w-full max-w-sm bg-blue-600 text-white font-semibold tracking-wide py-1 rounded-xl shadow-md hover:bg-blue-700 transition duration-200 ease-in-out">
    Apply Filters
  </button>
</div>

    </div>
  );
};


const PriceRangeSlider = () => {
  const [value, setValue] = useState(1000);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto p-4">
      {/* Label with value */}
      <div className="text-lg font-semibold text-gray-700">
        Price Range: <span className="text-blue-500">₹{value} and up</span>
      </div>

      {/* Range Slider */}
      <input
        type="range"
        min="500"
        max="10000"
        step="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - 500) / 9500) * 100}%, #e5e7eb ${((value - 500) / 9500) * 100}%, #e5e7eb 100%)`,
        }}
      />

      {/* Indicator below the slider */}
      <div className="relative w-full">
        <div
          className="absolute top-[-10px] text-sm font-medium text-white bg-blue-500 px-3 py-1 rounded-md"
          style={{
            left: `calc(${((value - 500) / 9500) * 100}% - 20px)`,
            transition: "left 0.2s ease-in-out",
          }}
        >
          ₹{value}
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
const MapComponent = ({
  isFilterComponentOpen,
}: {
  isFilterComponentOpen: boolean;
}) => {
  return (
    <div className={`w-1/2 h-[87vh] p-3 fixed left-0 top-[13vh] overflow-hidden z-10  `}>
      <MapContainer
        center={[40.7128, -74.006]}
        zoom={3}
        style={{ height: "100%", width: "100%" }}
      >
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

const HotelCard = () => {
  return (
    <div className="flex flex-row bg-white rounded-2xl shadow-md m-4 overflow-hidden border border-gray-100 transition hover:shadow-lg duration-300">
    <div className="flex w-full">
      {/* Left: Images & Info */}
      <div className="w-3/4 flex gap-4 p-4">
        {/* Image Section */}
        <div className="w-1/3 flex flex-col gap-2">
          <img
            src="/landing-i5.png"
            alt="Retreat"
            className="w-full h-[120px] object-cover rounded-xl shadow-sm"
            loading="lazy"
          />
  
          <div className="grid grid-cols-4 gap-1">
            {[...Array(3)].map((_, index) => (
              <img
                key={index}
                src="/landing-i5.png"
                alt={`Thumb ${index + 1}`}
                className="w-full h-8 object-cover rounded-md hover:scale-105 transition-transform duration-200 border"
                loading="lazy"
              />
            ))}
          </div>
        </div>
  
        {/* Info Section */}
        <div className="flex flex-col justify-between text-sm">
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-1">
              Valentines Retreat – Near Candolim Beach
            </h2>
  
            <div className="flex items-center gap-1 text-yellow-500 text-sm mb-1">
              ★★★★★
              <span className="text-xs text-gray-500 ml-1">(120 reviews)</span>
            </div>
  
            <p className="text-xs text-gray-500">
              Varkala <span className="text-gray-300">|</span> 9 min to beach
            </p>
  
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                Couple friendly
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                Breakfast Included
              </span>
            </div>
  
            <ul className="list-disc list-inside text-xs text-gray-600 mt-2 space-y-0.5">
              <li>Free cancellation</li>
              <li>1+1 Happy Hours</li>
              <li>Breakfast included</li>
            </ul>
          </div>
        </div>
      </div>
  
      {/* Right: Pricing & CTA */}
      <div className="w-1/4 p-4 border-l border-gray-100 flex flex-col justify-between text-sm">
        <div>
          <p className="text-xs text-gray-500">Starting from</p>
          <h3 className="text-2xl font-bold text-gray-800">₹1,899</h3>
          <p className="text-xs text-gray-500">per night for 2 guests</p>
          <p className="text-xs text-green-600 mt-1">✔ No prepayment needed</p>
        </div>
  
        <a
          href="#"
          className="mt-4 block text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded-lg transition duration-200"
        >
          Go to Site
        </a>
      </div>
    </div>
  </div>
  
  );
};
