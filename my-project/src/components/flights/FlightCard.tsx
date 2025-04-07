import React from "react";
import { FaPlaneDeparture, FaPlaneArrival, FaArrowDown } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

type FlightCardProps = {
  airline: string;
  logoUrl: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: string;
  price: number;
  returnFlight?: {
    departure: string;
    arrival: string;
    duration: string;
    stops: string;
  };
  rating?: number;
  travelClass?: "Economy" | "Business" | "First";
};

const getClassColor = (travelClass: string) => {
  switch (travelClass) {
    case "Business":
      return "bg-purple-100 text-purple-600";
    case "First":
      return "bg-yellow-100 text-yellow-600";
    default:
      return "bg-blue-100 text-blue-600";
  }
};

const FlightCard = ({
  airline,
  logoUrl,
  from,
  to,
  departure,
  arrival,
  duration,
  stops,
  price,
  returnFlight,
  rating = 4.2,
  travelClass = "Economy",
}: FlightCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-5 hover:shadow-lg transition duration-300">
      {/* Top Flight Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Airline Info */}
        <div className="flex items-center gap-4 min-w-[180px]">
          <img src={logoUrl} alt={airline} className="w-14 h-14 object-contain rounded-full border" />
          <div>
            <h4 className="font-semibold text-lg">{airline}</h4>
            <p className="text-sm text-gray-500">
              {from} → {to}
            </p>
            <div className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getClassColor(travelClass)}`}>
              {travelClass}
            </div>
          </div>
        </div>

        {/* Departure Info */}
        <div className="text-center sm:text-left text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FaPlaneDeparture className="text-blue-500" />
            <span>{departure}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaPlaneArrival className="text-green-500" />
            <span>{arrival}</span>
          </div>
          <p className="text-xs text-gray-400">{duration}</p>
          <span className="text-xs underline cursor-pointer" data-tooltip-id={`stops-${from}-${to}`}>
            {stops}
          </span>
          <Tooltip id={`stops-${from}-${to}`} content="Departure flight details" />
        </div>

        {/* Price + CTA */}
        <div className="text-right min-w-[120px]">
          <p className="text-xl font-bold text-blue-600">₹{price.toLocaleString()}</p>
          <p className="text-xs text-yellow-500 mt-1">⭐ {rating} Rating</p>
          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Book Now
          </button>
        </div>
      </div>

      {/* Return Flight Info */}
      {returnFlight && (
        <div className="border-t pt-4 mt-2 text-sm text-gray-700">
          <div className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
            <FaArrowDown className="text-blue-500 animate-bounce" />
            Return Flight: {to} → {from}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-3 items-center text-gray-600">
              <FaPlaneDeparture className="text-blue-500" />
              <span>{returnFlight.departure}</span>
              <FaPlaneArrival className="text-green-500 ml-4" />
              <span>{returnFlight.arrival}</span>
            </div>
            <div className="text-xs text-gray-500">
              {returnFlight.duration} |{" "}
              <span
                className="underline cursor-pointer"
                data-tooltip-id={`return-stops-${to}-${from}`}
              >
                {returnFlight.stops}
              </span>
              <Tooltip id={`return-stops-${to}-${from}`} content="Return flight details" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightCard;
