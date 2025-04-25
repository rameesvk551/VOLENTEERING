import { useState } from "react";

const airlinesList = ["IndiGo", "Air India", "Vistara", "Emirates", "Qatar Airways"];
const stopsOptions = ["Non-stop", "1 Stop", "2+ Stops"];
const timeOptions = ["Morning", "Afternoon", "Evening", "Night"];
const cabinClasses = ["Economy", "Premium Economy", "Business", "First"];
const alliances = ["Star Alliance", "OneWorld", "SkyTeam"];
const aircraftTypes = ["Airbus A320", "Boeing 737", "Airbus A380", "Boeing 777"];
const amenities = ["Wi-Fi", "Meal", "Extra Legroom", "In-seat Power"];
const baggageOptions = ["Carry-on Included", "Checked Baggage Included"];
const bookingSources = ["Official Airline", "Travel Agent", "Online Platform"];

const FlightFilters = () => {
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedStop, setSelectedStop] = useState<string>("");
  const [price, setPrice] = useState<[number, number]>([1000, 30000]);
  const [departureTime, setDepartureTime] = useState<[number, number]>([0, 24]);
  const [duration, setDuration] = useState<[number, number]>([1, 20]);
  const [layover, setLayover] = useState<[number, number]>([0, 12]);
  const [cabinClass, setCabinClass] = useState("");
  const [selectedAlliance, setSelectedAlliance] = useState("");
  const [refundableOnly, setRefundableOnly] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedBaggage, setSelectedBaggage] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<string[]>([]);

  const toggleCheckbox = (value: string, selectedList: string[], setter: (val: string[]) => void) => {
    setter(
      selectedList.includes(value)
        ? selectedList.filter((item) => item !== value)
        : [...selectedList, value]
    );
  };

  const toggleAirline = (airline: string) => {
    toggleCheckbox(airline, selectedAirlines, setSelectedAirlines);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full max-w-md overflow-y-auto max-h-screen">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Filters</h3>

      {/* Airlines */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Airlines</label>
        <div className="flex flex-wrap gap-3">
          {airlinesList.map((airline) => (
            <label key={airline} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedAirlines.includes(airline)}
                onChange={() => toggleAirline(airline)}
                className="accent-blue-500"
              />
              <span className="text-sm text-gray-700">{airline}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stops */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Stops</label>
        {stopsOptions.map((stop) => (
          <label key={stop} className="flex items-center gap-2 mb-1">
            <input
              type="radio"
              name="stops"
              value={stop}
              checked={selectedStop === stop}
              onChange={() => setSelectedStop(stop)}
              className="accent-blue-500"
            />
            <span className="text-sm text-gray-700">{stop}</span>
          </label>
        ))}
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹)</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={price[0]}
            onChange={(e) => setPrice([+e.target.value, price[1]])}
            className="w-1/2 border border-gray-300 rounded px-2 py-1"
          />
          <input
            type="number"
            value={price[1]}
            onChange={(e) => setPrice([price[0], +e.target.value])}
            className="w-1/2 border border-gray-300 rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Departure Time */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time (Hours)</label>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            max={23}
            value={departureTime[0]}
            onChange={(e) => setDepartureTime([+e.target.value, departureTime[1]])}
            className="w-1/2 border border-gray-300 rounded px-2 py-1"
          />
          <input
            type="number"
            min={0}
            max={23}
            value={departureTime[1]}
            onChange={(e) => setDepartureTime([departureTime[0], +e.target.value])}
            className="w-1/2 border border-gray-300 rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Flight Duration */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Flight Duration (hrs)</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={duration[0]}
            onChange={(e) => setDuration([+e.target.value, duration[1]])}
            className="w-1/2 border border-gray-300 rounded px-2 py-1"
          />
          <input
            type="number"
            value={duration[1]}
            onChange={(e) => setDuration([duration[0], +e.target.value])}
            className="w-1/2 border border-gray-300 rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Layover Duration */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Max Layover (hrs)</label>
        <input
          type="number"
          min={0}
          max={24}
          value={layover[1]}
          onChange={(e) => setLayover([layover[0], +e.target.value])}
          className="w-full border border-gray-300 rounded px-2 py-1"
        />
      </div>

      {/* Cabin Class */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Cabin Class</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={cabinClass}
          onChange={(e) => setCabinClass(e.target.value)}
        >
          <option value="">Select</option>
          {cabinClasses.map((cabin) => (
            <option key={cabin} value={cabin}>
              {cabin}
            </option>
          ))}
        </select>
      </div>

      {/* Airline Alliance */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Airline Alliance</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={selectedAlliance}
          onChange={(e) => setSelectedAlliance(e.target.value)}
        >
          <option value="">All</option>
          {alliances.map((alliance) => (
            <option key={alliance}>{alliance}</option>
          ))}
        </select>
      </div>

      {/* Aircraft Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Aircraft Type</label>
        <div className="flex flex-wrap gap-3">
          {aircraftTypes.map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedAircraft.includes(type)}
                onChange={() => toggleCheckbox(type, selectedAircraft, setSelectedAircraft)}
                className="accent-blue-500"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">In-flight Amenities</label>
        <div className="flex flex-wrap gap-3">
          {amenities.map((item) => (
            <label key={item} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(item)}
                onChange={() => toggleCheckbox(item, selectedAmenities, setSelectedAmenities)}
                className="accent-blue-500"
              />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Baggage Options */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Baggage Options</label>
        <div className="flex flex-wrap gap-3">
          {baggageOptions.map((item) => (
            <label key={item} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedBaggage.includes(item)}
                onChange={() => toggleCheckbox(item, selectedBaggage, setSelectedBaggage)}
                className="accent-blue-500"
              />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Booking Source */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Booking Source</label>
        <div className="flex flex-wrap gap-3">
          {bookingSources.map((src) => (
            <label key={src} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSource.includes(src)}
                onChange={() => toggleCheckbox(src, selectedSource, setSelectedSource)}
                className="accent-blue-500"
              />
              <span className="text-sm text-gray-700">{src}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Refundable Option */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={refundableOnly}
          onChange={() => setRefundableOnly(!refundableOnly)}
          className="accent-blue-500"
        />
        <label className="text-sm text-gray-700">Refundable Only</label>
      </div>

      {/* Filter Button */}
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700 transition">
        Apply Filters
      </button>
    </div>
  );
};

export default FlightFilters;
