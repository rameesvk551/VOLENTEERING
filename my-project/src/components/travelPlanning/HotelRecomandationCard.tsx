

const HotelRecomandationCard = () => {
    return (
      <div className="max-w-xs rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 cursor-pointer">
        <img
          src="/landing-i5.png"
          alt="The Venetian Resort"
          className="h-40 w-full rounded-t-2xl "
        />
        <div className="p-4 space-y-2">
          <h2 className="text-lg font-bold text-gray-800">
            The Venetian Resort, Las Vegas
          </h2>
          <p className="text-sm text-gray-600">Valayam, Kozhikode, Kerala</p>
          <div className="flex justify-between items-center text-sm text-gray-700">
            <span className="font-medium">$200–$250/night</span>
            <span className="text-yellow-500">⭐ 4.5</span>
          </div>
        </div>
      </div>
    )
  }
  
  export default HotelRecomandationCard
  
  