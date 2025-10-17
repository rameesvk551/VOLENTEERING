
import React, { useState } from 'react'
import PlaceToVisit from '../../components/travelPlanning/PlaceToVisitCard'
import { MapPin } from 'lucide-react'
import SearchWithFilter from '../../components/travelPlanning/SearchWithFilter'
import SuggestedPlace from '@/components/travelPlanning/SuggestedPlace';
import 'leaflet/dist/leaflet.css';
import TripMap from '@/components/travelPlanning/TripMap';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';



const PlanYourTrip = () => {
 
  const { searchedPlace, selectedPlace } = useSelector((state: RootState) => state.attractions);
 
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
    <div className="py-10 px-6 sm:px-10">
      <div className="mx-auto">
        <div className="md:flex-row gap-8">
       


 {(!searchedPlace || searchedPlace.length === 0) &&
         (!selectedPlace || selectedPlace.length === 0) && (
          <SearchWithFilter />
        )}

        {searchedPlace && searchedPlace.length > 0 && (
          <SuggestedPlace />
        )}

        {selectedPlace && selectedPlace.length > 0 && (
          <TripMap />
        )}

          
          
        </div>
      </div>
    </div>
  </div>
  
  )
}

export default PlanYourTrip


