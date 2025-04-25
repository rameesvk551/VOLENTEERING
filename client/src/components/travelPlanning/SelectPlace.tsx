import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import PlaceToVisit from "./PlaceToVisitCard";
import HotelRecomandationCard from "./HotelRecomandationCard";
import SearchWithFilter from "./SearchWithFilter";

type Place = {
  id: number;
  name: string;
  category: string;
  image: string;
};

export default function TripPlanner() {
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      <div className="py-10 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          {/* Layout */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left - Search and Places */}
            <SearchWithFilter />

            {/* Right - Selected Places */}
            <div className="md:w-1/3">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Selected Places
                </h3>
                {selectedPlaces.length > 0 ? (
                  <>
                    <ul className="space-y-3">
                      {selectedPlaces.map((place) => (
                        <li
                          key={place.id}
                          className="flex items-center text-gray-700 text-sm gap-2"
                        >
                          <MapPin className="w-4 h-4 text-green-500" />
                          {place.name}
                        </li>
                      ))}
                    </ul>
                    <button className="mt-6 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm transition">
                      Generate Route
                    </button>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    No places selected yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="  px-6 sm:px-10">
        <div className="max-w-7xl mx-auto space-y-14">
          {/* Places */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Places to Visit
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <PlaceToVisit />
              <PlaceToVisit />
              <PlaceToVisit />
              <PlaceToVisit />
              <PlaceToVisit />
              <PlaceToVisit />
            </div>
          </section>
        </div>
      </div>
      <div className="flex justify-center items-center gap-4 mt-3 pb-3">
        <button className="flex items-center gap-2 px-2 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md transition-all duration-200 text-sm font-medium">
          <span className="text-lg">←</span>Previous
        </button>

        <button className="flex items-center gap-2 px-2 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md transition-all duration-200 text-sm font-medium">
          Next <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  );
}
{
  /* Hotels */
}
<section>
  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
    Hotel Recommendations
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <HotelRecomandationCard />
    <HotelRecomandationCard />
    <HotelRecomandationCard />
    <HotelRecomandationCard />
  </div>
</section>;
