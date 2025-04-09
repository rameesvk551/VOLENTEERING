import React, { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useMap } from "react-leaflet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useLocation } from "react-router-dom";
const HotelBookingPage = () => {
  const location = useLocation();
  const hotels = location.state?.hotels || [];
  const initaialDetails=location.state?.initaialDetails || [];
  const coordinates = hotels.map((hotel) => ({
    latitude: parseFloat(hotel.latitude),
    longitude: parseFloat(hotel.longitude),
    name: hotel.name,
    price: hotel.price,
    rating: hotel.rating,
  }));
  const centerPosition: [number, number] = coordinates.length
    ? [coordinates[0].latitude, coordinates[0].longitude]
    : [40.7128, -74.006]; 

  if (!hotels) return <p>No hotels found. Please search again.</p>;

  const [filters, setFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterComponentOpen, setIsFilterComponentOpen] =useState<boolean>(false);
  useEffect(() => {
    console.log("Filters changed: ", filters);
  }, [filters]);
  


type Hotel = {
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  tags: string[];
  price: number;
  ctaLink: string;
  // other fields...
};
const starOptions = [
  { label: "2 Star", value: "2" },
  { label: "3 Star", value: "3" },
  { label: "4 Star", value: "4" },
  { label: "5 Star", value: "5" },
];
const sortOptions = [
  { label: "Latest", value: "latest" },
  { label: "Newest", value: "newest" },
  { label: "Price (lowest first)", value: "price_asc" },
  { label: "Price (highest first)", value: "price_desc" },
  { label: "Property Rating (highest first)", value: "rating_high" },
  { label: "Property Rating (lowest first)", value: "rating_low" },
  { label: "Top reviewed", value: "top_reviewed" },
];
const ratingOptions = [
  { label: "5 stars", value: "5" },
  { label: "4 stars & up", value: "4+" },
  { label: "3 stars & up", value: "3+" },
];

const filteredProperties = hotels
  .filter((property) => {
    if (filters.length === 0) return true;

    // ⭐ Star Filtering via "tags" field like ["5 STARS"]
    const starFilter = starOptions
      .map((opt) => opt.value)
      .filter((val) => filters.includes(val));
    if (
      starFilter.length > 0 &&
      !starFilter.some((star) => property.tags.includes(`${star} STARS`))
    ) {
      return false;
    }

    // 🌟 Rating filter (e.g., "4+" means rating >= 4)
    const ratingFilter = ratingOptions.find((opt) =>
      filters.includes(opt.value)
    );
    if (ratingFilter) {
      const ratingValue = parseFloat(ratingFilter.value);
      if (property.rating < ratingValue) return false;
    }

    return true;
  })
  .sort((a, b) => {
    const sortBy = sortOptions.find((opt) => filters.includes(opt.value))?.value;

    switch (sortBy) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "rating_high":
        return b.rating - a.rating;
      case "rating_low":
        return a.rating - b.rating;
      case "top_reviewed":
        return b.reviews - a.reviews;
      default:
        return 0; // No sort or unhandled sort type
    }
  });

  const totalPages = 5;

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      <Header
      initaialDetails={initaialDetails}
        isFilterComponentOpen={isFilterComponentOpen}
        setIsFilterComponentOpen={setIsFilterComponentOpen}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Content */}
      <div className="h-[calc(100vh-80px)] mt-[70px]">
        <div className="flex h-full w-full overflow-hidden">
          {isFilterComponentOpen && (
            <Filters filters={filters} setFilters={setFilters} />
          )}

          {/* Map */}
          {!isFilterComponentOpen && (
            <div className="hidden md:block w-1/2 h-full sticky top-[60px]">
              <MapComponent
                coordinates={coordinates}
                centerPosition={centerPosition}
              />
            </div>
          )}

          {/* Hotel Cards */}
          <div
            className={`${
              isFilterComponentOpen ? "md:w-3/4" : "md:w-1/2"
            } w-full h-full overflow-y-auto px-4 py-2`}
          >
            <div className="flex flex-col gap-2">
              {filteredProperties &&
                filteredProperties.map((property) => (
                  <HotelCard key={property.id} {...property} />
                ))}

              {/* Pagination */}
              <div className="w-full flex justify-center items-center py-4">
                <div className="inline-flex items-center space-x-1 text-sm font-medium text-gray-700">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-md border transition ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-md border transition ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white hover:bg-gray-100"
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
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-gray-100"
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
type initaialDetails = {
  search: string;
  fromDate: string;
  toDate: string;
  guests: number
};
const Header = ({
  initaialDetails,
  setIsFilterComponentOpen,
  setFilters,
  filters,
}: {
  initaialDetails:initaialDetails
  isFilterComponentOpen: boolean;
  setIsFilterComponentOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filters: string[];
  setFilters: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const inputStyles =
    "bg-white border border-gray-300 rounded-2xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200 text-sm";
  const buttonStyles =
    "bg-white border border-gray-300 rounded-2xl px-5 py-2 font-medium text-sm shadow-sm hover:bg-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200";
  useEffect(() => {
    console.log("Filters updated:", filters);
  }, [filters]);

  const starOptions = [
    { label: "2 Star", value: "2" },
    { label: "3 Star", value: "3" },
    { label: "4 Star", value: "4" },
    { label: "5 Star", value: "5" },
  ];
  const sortOptions = [
    { label: "Latest", value: "latest" },
    { label: "Newest", value: "newest" },
    { label: "Price (lowest first)", value: "price_asc" },
    { label: "Price (highest first)", value: "price_desc" },
    { label: "Property Rating (highest first)", value: "rating_high" },
    { label: "Property Rating (lowest first)", value: "rating_low" },
    { label: "Top reviewed", value: "top_reviewed" },
  ];
  const ratingOptions = [
    { label: "5 stars", value: "5" },
    { label: "4 stars & up", value: "4+" },
    { label: "3 stars & up", value: "3+" },
  ];
  
  
  
  return (
    <div className="w-full px-6 py-4 fixed top-0 left-0  z-50">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Button */}
          <button
            className={buttonStyles}
            onClick={() => setIsFilterComponentOpen((prev) => !prev)}
          >
            Filter
          </button>

          {/* Location Input with Icon */}
          <div className="relative">
            <input
              type="text"
              placeholder={initaialDetails.search}
              defaultValue={initaialDetails.search}
              className={inputStyles}
            />
            <AiOutlineSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input type="date" className={inputStyles}  placeholder={initaialDetails.fromDate}
              defaultValue={initaialDetails.fromDate}/>
            <span className="text-gray-500 text-sm font-semibold">to</span>
            <input type="date" className={inputStyles} placeholder={initaialDetails.toDate}
              defaultValue={initaialDetails.toDate} />
          </div>

          <button
            className={buttonStyles}
            onClick={() =>
              setFilters((prev) =>
                prev.includes("Nearest")
                  ? prev.filter((f) => f !== "Nearest")
                  : [...prev, "Nearest"]
              )
            }
          >
            Nearest to me
          </button>
        </div>

        {/* Right Actions (Dropdowns) */}
        <div className="flex flex-wrap items-center gap-1">
        <MyDropdown
  dropdownItems={starOptions}
  name="Star"
  onSelect={(item) => {
    setFilters((prev) => {
      const updated = prev.filter((f) => !["2", "3", "4", "5"].includes(f));
      return [...updated, item.value];
    });
  }}
/>

<MyDropdown
  dropdownItems={ratingOptions}
  name="Rating"
  onSelect={(item) => {
    setFilters((prev) => {
      const updated = prev.filter((f) => !["3+", "4+", "5+"].includes(f));
      return [...updated, item.value];
    });
  }}
/>

<MyDropdown
  dropdownItems={sortOptions}
  name="Sort"
  onSelect={(item) => {
    setFilters((prev) => {
      const updated = prev.filter((f) =>
        ![
          "latest",
          "newest",
          "price_asc",
          "price_desc",
          "rating_high",
          "rating_low",
          "top_reviewed",
        ].includes(f)
      );
      return [...updated, item.value];
    });
  }}
/>


        </div>
      </div>
    </div>
  );
};

type DropdownItem = { label: string; value: string };

const MyDropdown = ({
  dropdownItems,
  name,
  onSelect,
}: {
  dropdownItems: DropdownItem[];
  name: string;
  onSelect?: (item: DropdownItem) => void;
}) => {
  const [selectedItem, setSelectedItem] = useState<string>(name);

  const handleSelect = (item: DropdownItem) => {
    setSelectedItem(item.label); // show the label in the button
    onSelect?.(item); // pass the whole item back to parent
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{selectedItem}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {dropdownItems.map((item) => (
          <DropdownMenuItem key={item.value} onClick={() => handleSelect(item)}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


const Filters = ({
  filters,
  setFilters,
}: {
  filters: string[];
  setFilters: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
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
    Tent: 7,
  };

  const facilities = [
    "Parking",
    "Wifi",
    "Spa",
    "AC",
    "Pool",
    " Restaurent",
    "Family room",
    ,
    "Room Service",
    "Kitchenette",
  ];

  const addToFilters = (type: string) => {
    setFilters((prev) =>
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
              filters.includes(type)
                ? "ring-2 focus:ring-blue-400 focus:outline-none transition"
                : ""
            } cursor-pointer hover:bg-gray-100`}
            onClick={() => addToFilters(type)}
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
                filters.includes(type)
                  ? "ring-2 focus:ring-blue-400 focus:outline-none transition"
                  : ""
              } cursor-pointer hover:bg-gray-100`}
              onClick={() => addToFilters(type)}
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
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
            ((value - 500) / 9500) * 100
          }%, #e5e7eb ${((value - 500) / 9500) * 100}%, #e5e7eb 100%)`,
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

type HotelCoordinate = {
  latitude: number;
  longitude: number;
  name: string;
  rating: number;
  price: number;
};
const MapComponent = ({
  coordinates,
  centerPosition,
}: {
  coordinates: {
    latitude: number;
    longitude: number;
    name: string;
    rating: number;
    price: number;
  }[];
  centerPosition: [number, number]; // 👈 new prop for centering
}) => {
  const ChangeMapView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    map.setView(center, 12);
    return null;
  };

  return (
    <div
      className={`w-1/2 h-[87vh] p-3 fixed left-0 top-[13vh] overflow-hidden z-10  `}
    >
      <MapContainer
        center={centerPosition}
        zoom={3}
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeMapView center={centerPosition} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coordinates.map((loc, index) => (
          <Marker key={index} position={[loc.latitude, loc.longitude]}>
            <Popup>
              <div className="text-sm text-gray-800">
                <h3 className="font-semibold text-base mb-1">{loc.name}</h3>
                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                  {"★".repeat(Math.floor(loc.rating))}
                  <span className="text-xs text-gray-500 ml-1">
                    ({loc.rating})
                  </span>
                </div>
                <p className="text-sm font-semibold text-blue-600">
                  €{loc.price}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

interface HotelCardProps {
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  tags: string[];
  highlights: string[];
  price: number;
  images: string[]; // first image is the main, rest are thumbnails
  perNightLabel?: string;
  ctaLink: string;
}

const HotelCard: React.FC<HotelCardProps> = ({
  name,
  location,
  distance,
  rating,
  reviews,
  tags,
  highlights,
  price,
  images,
  perNightLabel = "per night for 2 guests",
  ctaLink,
}) => {
  return (
    <div className="flex flex-row bg-white rounded-2xl shadow-md m-4 overflow-hidden border border-gray-100 transition hover:shadow-lg duration-300">
      <div className="flex w-full">
        {/* Left: Images & Info */}
        <div className="w-3/4 flex gap-4 p-4">
          {/* Image Section */}
          <div className="w-1/3 flex flex-col gap-2">
            <img
              src=""
              alt={name}
              className="w-full h-[120px] object-cover rounded-xl shadow-sm"
              loading="lazy"
            />

            <div className="grid grid-cols-4 gap-1">
              {images.slice(1, 4).map((img, index) => (
                <img
                  key={index}
                  src={img}
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
                {name}
              </h2>

              <div className="flex items-center gap-1 text-yellow-500 text-sm mb-1">
                {"★".repeat(Math.floor(rating))}
                <span className="text-xs text-gray-500 ml-1">
                  ({reviews} reviews)
                </span>
              </div>

              <p className="text-xs text-gray-500">
                {location} <span className="text-gray-300">|</span> {distance}{" "}
                to beach
              </p>

              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <ul className="list-disc list-inside text-xs text-gray-600 mt-2 space-y-0.5">
                {highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Pricing & CTA */}
        <div className="w-1/4 p-4 border-l border-gray-100 flex flex-col justify-between text-sm">
          <div>
            <p className="text-xs text-gray-500">Starting from</p>
            <h3 className="text-2xl font-bold text-gray-800">₹{price}</h3>
            <p className="text-xs text-gray-500">{perNightLabel}</p>
            <p className="text-xs text-green-600 mt-1">
              ✔ No prepayment needed
            </p>
          </div>

          <a
            href={ctaLink}
            className="mt-4 block text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded-lg transition duration-200"
          >
            Go to Site
          </a>
        </div>
      </div>
    </div>
  );
};
