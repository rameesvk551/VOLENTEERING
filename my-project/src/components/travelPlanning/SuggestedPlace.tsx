import React, { useState } from 'react';
import PlaceToVisit from './PlaceToVisitCard';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

type SelectedPlace = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
} | null;
type Attraction = {
    id: string;
    name: string;
    categories: string[];
    location: {
      address: string;
      country: string;
      cross_street?: string;
      formatted_address: string;
      locality: string;
      postcode: string;
      region: string;
    };
    geocodes: {
      latitude: number;
      longitude: number;
    };
  };

const SuggestedPlace = () => {
    const { searchedPlace, selectedPlace, attractions } = useSelector<RootState>((state) => state.attractions);


  return (
    <div className=" flex flex-row gap-4">
      {/* Suggested Places */}
      <div className=" w-2/3  ">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">📍 Suggested Places</h2>
      <div className='grid grid-cols-2 gap-1'>
        {attractions&& attractions.map((attraction)=>(
      <PlaceToVisit attraction={attraction}  />
        ))}

    
      </div>
      </div>

      {/* Selected Place */}
      <div className="bg-white h-full rounded-2xl w-1/3 shadow-md p-6 border mt-16">
        <h2 className="text-2xl font-bold text-green-600 mb-4">✅ Selected Place</h2>
        {selectedPlace ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">{selectedPlace}</h3>
          </div>
        ) : (
          <div className="text-gray-500 italic">No place selected yet.</div>
        )}
      </div>
    </div>
  );
};

export default SuggestedPlace;
