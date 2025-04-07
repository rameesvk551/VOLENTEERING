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

const Flights = () => {
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("roundtrip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const swapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const flightResults = [
    {
      airline: "IndiGo",
      logoUrl:
        "https://seeklogo.com/images/I/indigo-airlines-logo-B6E6D3A7AD-seeklogo.com.png",
      from: "Delhi",
      to: "Mumbai",
      departure: "08:00 AM",
      arrival: "10:10 AM",
      duration: "2h 10m",
      stops: "Non-stop",
      price: 3499,
      returnFlight: {
        departure: "06:00 PM",
        arrival: "08:10 PM",
        duration: "2h 10m",
        stops: "Non-stop",
      },
    },
    {
      airline: "Vistara",
      logoUrl:
        "https://1000logos.net/wp-content/uploads/2020/04/Vistara-logo.png",
      from: "Kochi",
      to: "Bangalore",
      departure: "06:45 AM",
      arrival: "08:00 AM",
      duration: "1h 15m",
      stops: "Non-stop",
      price: 2999,
      returnFlight: {
        departure: "07:15 PM",
        arrival: "08:30 PM",
        duration: "1h 15m",
        stops: "Non-stop",
      },
    },
    {
      airline: "Air India",
      logoUrl:
        "https://seeklogo.com/images/A/air-india-logo-8A541B9730-seeklogo.com.png",
      from: "Hyderabad",
      to: "Chennai",
      departure: "09:30 AM",
      arrival: "11:00 AM",
      duration: "1h 30m",
      stops: "Non-stop",
      price: 2799,
      // No returnFlight for one-way option
    },
  ];
  

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
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300 w-full">
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
            {flightResults.map((flight, index) => (
              <FlightCard key={index} {...flight} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flights;
