import { useState } from "react";
import {
  PlaneTakeoff,
  PlaneLanding,
  CalendarDays,
  Repeat,
} from "lucide-react";
import MyDropdown from "./DropDown";
import FlightFilters from "./FlightFilter";
import FlightCard from "./FlightCard";
import axios from "axios";
import server from "@/server/app";
type Flight = {
  id: string;
  airline: string;
  logoUrl: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departure: string;
  duration: string;
  stops: string;
  price: number;
  displayPrice: string;

  alliance: string;
  arrival:string
};

const Flights = () => {
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("roundtrip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [flights, setFlights] = useState<Flight[]>([]);

  const searchFlights = async () => {
    try {
      const res = await axios.get(`${server}/flight/get-flights`, {
        params: {
          origin,
          destination,
          tripType,
        }
      });
      console.log(res.data);
      setFlights(res.data.results)
    } catch (error) {
      console.error("Error fetching flights", error);
    }
  };
  console.log("ffffflights",flights);

  
  const swapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };


  

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 p-6">
      <div className="w-full max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Search Flights
        </h2>

        {/* Trip type toggle */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setTripType("oneway")}
            className={`px-4 py-1 rounded-full border ${
              tripType === "oneway"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            One-way
          </button>
          <button
            onClick={() => setTripType("roundtrip")}
            className={`px-4 py-1 rounded-full border ${
              tripType === "roundtrip"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Round-trip
          </button>
        </div>

        {/* Flight Search Form */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Origin */}
          <div className="flex flex-col relative w-full sm:w-[180px]">
            <label
              htmlFor="origin"
              className="text-sm font-medium text-gray-600 mb-1"
            >
              Origin
            </label>
            <PlaneTakeoff className="absolute left-3 top-[38px] text-gray-400 w-4 h-4" />
            <input
              id="origin"
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. New York"
              className="border border-gray-300 rounded-lg px-9 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Swap Button */}
          <div className="flex items-center">
            <button
              onClick={swapLocations}
              className="bg-gray-200 p-2 rounded-full hover:bg-gray-300"
              title="Swap"
            >
              <Repeat className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Destination */}
          <div className="flex flex-col relative w-full sm:w-[180px]">
            <label
              htmlFor="destination"
              className="text-sm font-medium text-gray-600 mb-1"
            >
              Destination
            </label>
            <PlaneLanding className="absolute left-3 top-[38px] text-gray-400 w-4 h-4" />
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. London"
              className="border border-gray-300 rounded-lg px-9 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* From Date */}
          <div className="flex flex-col relative w-full sm:w-[160px]">
            <label
              htmlFor="from"
              className="text-sm font-medium text-gray-600 mb-1"
            >
              From
            </label>
            <CalendarDays className="absolute left-3 top-[38px] text-gray-400 w-4 h-4" />
            <input
              id="from"
              type="date"
              className="border border-gray-300 rounded-lg px-9 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Till Date */}
          {tripType === "roundtrip" && (
            <div className="flex flex-col relative w-full sm:w-[160px]">
              <label
                htmlFor="till"
                className="text-sm font-medium text-gray-600 mb-1"
              >
                Return
              </label>
              <CalendarDays className="absolute left-3 top-[38px] text-gray-400 w-4 h-4" />
              <input
                id="till"
                type="date"
                className="border border-gray-300 rounded-lg px-9 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          )}

          {/* Travel Class */}
          <div className="flex flex-col w-full sm:w-[180px]">
            <label
              htmlFor="travelClass"
              className="text-sm font-medium text-gray-600 mb-1"
            >
              Travel Class
            </label>
            <MyDropdown
              dropdownItems={["Economy", "Luxury", "Business"]}
              name="travelClass"
            />
          </div>

          {/* Search Button */}
          <div className="w-full sm:w-auto">
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300 w-full" onClick={searchFlights}>
              Search
            </button>
          </div>
        </div>

        {/* Layout for Filter + Results */}
        <div className="mt-10 flex flex-col lg:flex-row gap-6">
          {/* Filters */}
          <div className="lg:w-1/3 w-full">
            <FlightFilters />
          </div>

          {/* Results */}
          <div className="lg:w-2/3 w-full space-y-4">
            {flights.map((flight, index) => (
              <FlightCard key={index} {...flight} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flights;
