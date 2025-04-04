import React from 'react'

const PlaceToVisit = () => {
  return (
      <div className=" rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-row">
   <img
     src="/banner.png.jpg"
     alt="The Venetian Resort"
     className="h-full w-40 object-cover rounded-t-2xl"
   />
   <div className="p-4 space-y-2">
     <h2 className="text-lg font-bold text-gray-800">
       High Roller Canvays
     </h2>
     <p className="text-sm text-gray-600">  sheets containing Lorem Ipsum passages, and more recently with desktop s of Lorem Ipsum.</p>
     <div className="flex  items-center text-sm text-gray-700">
       <span className="font-medium">₹200 per person</span>
       
     </div>
   </div>
 </div>
  )
}

export default PlaceToVisit