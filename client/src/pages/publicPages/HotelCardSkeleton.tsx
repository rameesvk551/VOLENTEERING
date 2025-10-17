import React from "react";

const HotelCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-row bg-white rounded-2xl shadow-md m-4 overflow-hidden border border-gray-100">
      <div className="flex w-full animate-pulse">
        {/* Left: Images & Info */}
        <div className="w-3/4 flex gap-4 p-4">
          {/* Image Section */}
          <div className="w-1/3 flex flex-col gap-2">
            <div className="w-full h-[120px] bg-gray-200 rounded-xl" />
            <div className="grid grid-cols-4 gap-1">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-8 bg-gray-200 rounded-md" />
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col justify-between text-sm flex-grow">
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="flex flex-wrap gap-2 mt-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-10 h-4 bg-gray-200 rounded-full" />
                ))}
              </div>
              <div className="space-y-1 mt-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-3 bg-gray-200 rounded w-5/6" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pricing & CTA */}
        <div className="w-1/4 p-4 border-l border-gray-100 flex flex-col justify-between text-sm">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-300 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-green-200 rounded" />
          </div>
          <div className="h-8 bg-blue-300 rounded-lg mt-4" />
        </div>
      </div>
    </div>
  );
};

export default HotelCardSkeleton;
