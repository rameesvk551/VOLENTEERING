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
    <div className="w-full max-w-sm h-48 rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex">
      <img
        src="/banner.png.jpg"
        alt={attraction.name}
        className="h-full w-32 object-cover"
      />

      <div className="flex flex-col justify-between p-4 w-full">
        <div>
          <h2 className="text-base font-bold text-gray-800 line-clamp-1">{attraction.name}</h2>
          <p className="text-sm text-gray-600 line-clamp-2">
            {attraction.location?.formatted_address || "Location info not available"}
          </p>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          {attraction.categories?.[0] || "Category not specified"}
        </p>
      </div>
    </div>
  );
};

export default PlaceToVisit;

