
import React, { useState } from 'react'
import PlaceToVisit from '../../components/travelPlanning/PlaceToVisitCard'
import { MapPin } from 'lucide-react'
import SearchWithFilter from '../../components/travelPlanning/SearchWithFilter'
import SuggestedPlace from '@/components/travelPlanning/SuggestedPlace';
type Place = {
  id: number;
  name: string;
  category: string;
  image: string;
};


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
 
const PlanYourTrip = () => {
    const [searchedPlace,setSearchedPlace] = useState<string>(null);
    const[attractions,setAttractions]=useState<Attraction[]>([])
    const [selectedPlace,setSelectedPlace]=useState<string[]>([])
    console.log("aaaaaaaaa",attractions);
    
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
    <div className="py-10 px-6 sm:px-10">
      <div className="mx-auto">
        {/* Layout */}
        <div className=" md:flex-row gap-8">
   {attractions &&   <SuggestedPlace />}
   {selectedPlace && <></>}
  <SearchWithFilter />
        
        

      
        </div>
      </div>
    </div>

  
   
  </div>
  )
}

export default PlanYourTrip


