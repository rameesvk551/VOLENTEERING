import React from 'react'

const HostDetailsScelton = () => {
  return (
    <div className="flex flex-col bg-white animate-pulse">
  {/* Image Grid Skeleton */}
  <div className="px-4 md:px-10 lg:px-20 py-4">
    <div className="flex flex-col md:flex-row gap-4 h-[400px]">
      <div className="md:w-1/2 h-full bg-gray-200 rounded" />
      <div className="md:w-1/2 grid grid-cols-2 gap-2 h-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full h-full bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  </div>

  <div className="px-4 md:px-10 lg:px-20 mt-8 flex flex-col lg:flex-row gap-8">
    {/* LEFT PANEL */}
    <div className="lg:w-2/3 space-y-4">
      <div className="h-6 bg-gray-200 rounded w-3/4" />

      <div className="flex justify-between text-sm">
        <div className="flex gap-4">
          <div className="w-24 h-4 bg-gray-200 rounded" />
          <div className="w-32 h-4 bg-gray-200 rounded" />
        </div>
        <div className="w-24 h-4 bg-gray-200 rounded" />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 pt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 w-16 bg-gray-200 rounded" />
        ))}
      </div>

      {/* Placeholder for tab content */}
      <div className="space-y-4 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-full" />
        ))}
      </div>
    </div>

    {/* RIGHT PANEL */}
    <div className="lg:w-1/3 w-full space-y-4 border border-gray-200 rounded-md p-4">
      <div className="h-10 bg-gray-300 rounded w-full" />

      <div className="space-y-3">
        <div className="h-5 bg-gray-200 w-1/2 rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
  )
}

export default HostDetailsScelton
