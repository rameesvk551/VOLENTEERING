import { Calendar, CalendarDays, Search, Users } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { AiOutlineSearch } from 'react-icons/ai';
import { BiChevronDown } from 'react-icons/bi';
import { CiBoxes, CiBoxList } from 'react-icons/ci';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
const HotelBookingPage = () => {
  return (
    <div>
            <div className=' h-full  bg-gradient-to-b from-blue-50 to-white'>

           
            <Header/>
</div>
   
    </div>
  )
}

export default HotelBookingPage


  const HotelSearchWithoutFilter=()=>{
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [guests, setGuests] = useState({ adults: 1, children: 0 });
  
    return(
        <div className="flex flex-col md:flex-row w-[96%]   overflow-hidden">
    
      {/* Search Section */}
      <div className="w-full md:w-1/2 flex justify-center py-10 px-6 md:px-12">

        <div className="flex flex-col w-full max-w-lg space-y-6">
        <div className="flex flex-col">      <h1 className='text-yellow-500 text-[32px] font-bold'>Find the right hotel today</h1>
        <p className='text-blue-500 font-sm font-semibold text-[17px]'>We compare hotel prices from over 100 sites</p></div>
          {/* Destination Search */}
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-md">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search for destinations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm focus:outline-none text-gray-800 placeholder-gray-400 bg-transparent"
            />
          </div>

         {/* Date and Guests */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
  <div className="flex flex-col">
    <label className="text-xs text-gray-500 mb-1">Check-in</label>
    <input
      type="date"
      className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
    />
  </div>
  
  <div className="flex flex-col">
    <label className="text-xs text-gray-500 mb-1">Check-out</label>
    <input
      type="date"
      className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
    />
  </div>
  
  <div className="flex flex-col">
    <label className="text-xs text-gray-500 mb-1">Guests</label>
    <input
      type="number"
      min="1"
      placeholder="1"
      className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
    />
  </div>

  {/* Search Button */}
  <div className="flex items-end">
    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 mb-1 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md">
      🔍 Search
    </button>
  </div>
</div>


        
        </div>
      </div>

      {/* Image Section */}
      {/* Image Section with gradient fade */}
      <div className="w-full hidden md:block  relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
  <img
    src="hotelbanner.jpg"
    alt="Hotel View"
    className="w-full h-[300px] object-cover rounded-2xl transform hover:scale-105 transition-transform duration-500"
  />
  
  {/* Soft fade from image to the left */}
  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/60 to-white pointer-events-none rounded-2xl" />
</div>



    </div>
    )
  }


  const Header=()=>{
    return(
           <div className='w-full  flex justify-between mt-3 h-full'>
                <div className=' flex items-center gap-4 p-1'>
                  <button className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200">Filter</button >
                  <div className="relative">
                <input
                  type="text"
               className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
                  placeholder="New Delhi"
                />
                <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
 
   <div className=' flex flex-row items-center gap-3'>
   <input
      type="date"
      className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
    />

 <span className='font-extrabold text-5 '>To</span>
   
    <input
      type="date"
      className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
    />
   </div>

                  <button className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"> Host Type</button>
                  <button className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200">Host In My Destinations</button>
              
                </div>
                <MyDropdown dropdownItems={["latest", "newest"]} />

                <div className='flex flex-row px-3 gap-2 '>
                <CiBoxList size={22} />
                <CiBoxes size={22} />
                </div>
          
               </div>
        
    )
  }

  
  

  const MyDropdown=({dropdownItems})=> {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
         {dropdownItems&&dropdownItems.map((item)=>(
          <DropdownMenuItem key={item}>{item}</DropdownMenuItem>

         ))}
       
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  