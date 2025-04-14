import React from 'react';

type AttractionProps = {
  attraction: {
    id: string;
    name: string;
    categories: string[];
    geocodes: {
      latitude: number;
      longitude: number;
    };
    location: {
      address?: string;
      country?: string;
      cross_street?: string;
      formatted_address?: string;
      locality?: string;
      postcode?: string;
      region?: string;
    };
  };
};

const PlaceToVisit = ({ attraction }: AttractionProps) => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-row w-full max-w-2xl">
      <img
        src="/banner.png.jpg"
        alt={attraction.name}
        className="h-full w-40 object-cover rounded-l-2xl"
      />

      <div className="p-4 flex flex-col justify-between space-y-2 w-full">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{attraction.name}</h2>
          <p className="text-sm text-gray-600">
            {attraction.location?.formatted_address || "Location info not available"}
          </p>
          <p className="text-xs text-gray-500 italic">
            {attraction.categories?.[0] || "Category not specified"}
          </p>
        </div>

       
      </div>
    </div>
  );
};

export default PlaceToVisit;
