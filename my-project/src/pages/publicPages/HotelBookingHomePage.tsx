import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react'

const HotelBookingHomePage = () => {
  return (
    <>
      <HotelSearchWithoutFilter/>
    </>
  )
}

export default HotelBookingHomePage

const HotelSearchWithoutFilter = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [guests, setGuests] = useState({ adults: 1, children: 0 });
  const [hotels, setHotels] = useState([]);
   const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState<AddressValues[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<AddressValues | null>(null);
    const [loading, setLoading] = useState(false);
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
const today = new Date().toISOString().split("T")[0];

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
  setSelectedPlace(place)

  setSuggestions([]);
};
const initaialDetails={
  selectedPlace,
  fromDate,
  toDate,
  guests


}



  const navigate = useNavigate();

  const FetchHotels = async () => {
    if (!selectedPlace || !fromDate || !toDate) {
      alert("Please fill in all fields");
      return;
    }
setLoading(true)
    try {
      const response = await axios.post(`${server}/hotel/get-hotels`, {
        destination: selectedPlace,
        checkin: fromDate,
        checkout: toDate,
        guests,
      });
      setLoading(false) 
      if (response.data.success) {
        
              setHotels(response.data.hotels);
        console.log("hotelsssss",hotels);
        
        navigate("/search-hotels", { state: { hotels: response.data.hotels,initaialDetails } });

      } else {
        toast.error(response.data.message)
      }
    } catch (err) {
      setLoading(false)
      console.error("FetchHotels error:", err);
      alert("Failed to fetch hotels.");
    }
  };
  return (
<div className=' rounded-xl  bg-gradient-to-br from-blue-50 via-yellow-50 to-blue-50'>
<div className="flex flex-col-reverse md:flex-row h-[40vh] min-h-[300px] w-full overflow-hidden">
      {/* Left Panel - Search */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-5 md:p-10">
        <div className="w-full max-w-xl space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-500 leading-snug">
              Find the right hotel today
            </h1>
            <p className="text-blue-600 text-sm md:text-base font-medium mt-1">
              We compare hotel prices from over 100 sites
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); FetchHotels(); }}>
            {/* Destination Input */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-md">
              <Search className="w-5 h-5 text-gray-500" />
              <input
      value={input}
      type="text"
      placeholder="Search for a place"
      onChange={(e) => setInput(e.target.value)}
      className="w-full pl-4 pr-10 py-1.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 text-sm"
    />


{suggestions.length > 0 && (
  <ul className="absolute z-50 left-0 right-0 bg-white border mt-40 ml-[89px] rounded-md shadow max-h-60  overflow-auto w-[500px]">
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

            {/* Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        

            <div className="flex flex-col">
  <label className="text-xs text-gray-500 mb-1">Check-in</label>
  <input
    type="date"
    value={fromDate}
    min={today}
    onChange={(e) => {
      setFromDate(e.target.value);
      if (toDate && e.target.value >= toDate) {
        setToDate(""); // reset invalid toDate
      }
    }}
    className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
  />
</div>

<div className="flex flex-col">
  <label className="text-xs text-gray-500 mb-1">Check-out</label>
  <input
    type="date"
    value={toDate}
    min={fromDate ? new Date(new Date(fromDate).getTime() + 86400000).toISOString().split("T")[0] : today}
    onChange={(e) => setToDate(e.target.value)}
    disabled={!fromDate}
    className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50"
  />
</div>


              <div className="flex flex-col col-span-1">
                <label className="text-xs text-gray-500 mb-1">Guests</label>
                <input
                  type="number"
                  min="1"
                  value={guests.adults}
                  onChange={(e) =>
                    setGuests({ ...guests, adults: Number(e.target.value) })
                  }
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div className="flex items-end">
              <button
  type="submit"
  disabled={loading}
  className={`w-full flex items-center justify-center gap-2 ${
    loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
  } text-white rounded-xl py-2 text-sm font-semibold transition duration-200 shadow hover:shadow-lg`}
>
  {loading ? (
    <>
      <svg
        className="animate-spin h-4 w-4 text-white"
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
      Loading...
    </>
  ) : (
    <>
      🔍 Search
    </>
  )}
</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel - Quote */}
      <div className="w-full md:w-1/2 hidden md:flex items-center justify-center p-10 rounded-l-3xl">
        <div className="text-center max-w-md">
          <p className="text-2xl md:text-3xl font-bold text-yellow-500 leading-snug mb-4">
            “Travel is the only thing you buy that makes you richer.”
          </p>
          <p className="text-sm md:text-base text-blue-600 font-medium">
            Find the best deals, relax, and make memories that last forever.
          </p>
        </div>
      </div>
    </div>
<div className="w-full px-4 md:px-12 py-10 ">
  <div className="max-w-7xl mx-auto">
    <div className="relative">
      <PopularPlaces />
    </div>
  </div>
</div>

</div>

  );
};


const PopularPlaces=()=>{
    return(
        <div className=' flex  flex-col  items-center justify-center'>
<CustomCarousel/>
<div className="w-[90%]">
    <OurService/>
 
<BlogSection/>
  
</div>
        </div>
    )
}

  import { Card, CardContent } from "@/components/ui/card";
import BlogSection from '@/components/HomeComponents/BlogSection';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import server from '@/server/app';
import toast from 'react-hot-toast';
  
  const popularPlaces = [
    { name: "Taj Mahal, Agra", minDays: 1 ,img:"/agra.webp"},
    { name: "Jaipur", minDays: 2, img:"/jaipur.jpeg" },
    { name: "Goa", minDays: 3,img:"goa.jpeg" },
    { name: "Munnar ", minDays: 4 ,img:"munnar.jpg"},
    { name: "Leh-Ladakh", minDays: 5 ,img:"/ladarkh.jpeg" },
    { name: "Varanasi", minDays: 2 ,img:"varnasi.jpeg"},
    { name: "Kasol", minDays: 3,img:"kasol.jpeg" },
    { name: "Mumbai", minDays: 2 , img:"mumbai.jpeg"},
    { name: "Hampi", minDays: 2, img:"hampi.jpeg" },
  ];
  

  function CustomCarousel() {
    return (
      <div className="w-[90%] mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🌍 Popular Places in India
        </h2>
        <Carousel>
          <CarouselContent className="-ml-2 md:-ml-4">
            {popularPlaces.map((place, index) => (
              <CarouselItem
                key={index}
                className="pl-2 md:pl-4"
                style={{ flex: "0 0 20%" }}
              >
                <Card className="overflow-hidden rounded-2xl shadow-lg group hover:shadow-xl transition-shadow duration-300">
                  <div className="h-40 w-full overflow-hidden">
                    <img
                      src={place.img}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 text-center bg-white">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {place.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ⏳ {place.minDays} day{place.minDays > 1 ? "s" : ""} needed
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    );
  }


  const OurService = () => {
    const services = [
      {
        h1: "Plan Your Trip",
        p: "Craft personalized travel itineraries effortlessly with smart suggestions, best deals, and insider tips.",
        img: "/planning.avif",
      },
      {
        h1: "Meta Search Engine",
        p: "Find the best flights, stays, and experiences by comparing top travel sites in one place.",
        img: "meta.avif",
      },
      {
        h1: "Volunteer Travel",
        p: "Give back while you explore. Discover meaningful volunteer opportunities across the globe.",
        img: "/volenteer (2).jpg",
      },
      {
        h1: "Connect with Travelers",
        p: "Join a community of like-minded wanderers. Share experiences, tips, and make travel buddies.",
        img: "connect.avif",
      },
    ];
  
    return (
      <div className="w-full py-7 px-4">
        <div className="max-w-6xl mx-auto text-center mb-12">
      
          <p className="text-gray-600 text-sm md:text-base">
            Explore services designed to make your travel unforgettable.
          </p>
        </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white shadow-md hover:shadow-xl rounded-2xl overflow-hidden transition-all duration-300 border border-gray-100"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={service.img}
                  alt={service.h1}
                  className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent text-white px-4 py-2">
                  <h3 className="text-lg font-semibold">{service.h1}</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm">{service.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  