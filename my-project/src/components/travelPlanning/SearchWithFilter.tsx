import { Search } from 'lucide-react';
import React, { useState } from 'react'

const SearchWithFilter = () => {
      const [search, setSearch] = useState<string>("");
      const [filter, setFilter] = useState<string>("");
  return (
  
      <div className="md:w-2/3 space-y-6">
                {/* Search */}
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                  <Search className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search for destinations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-sm focus:outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                  />
                </div>
  
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  {["Nature", "Historical", "Adventure"].map((category) => (
                    <button
                      key={category}
                      onClick={() =>
                        setFilter(filter === category ? "" : category)
                      }
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                        filter === category
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setFilter("");
                      setSearch("");
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition"
                  >
                    Reset
                  </button>
                </div>
  
                {/* Active Filters Info */}
                <div className="mt-2">
                  <p className="text-gray-600 text-sm mb-2">Las Vegas, NV, USA</p>
                  <div className="flex flex-wrap gap-2">
                    {["Adventure", "Moderate Budget", "Couple"].map(
                      (filter, idx) => (
                        <div
                          key={idx}
                          className="flex items-center bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-xs"
                        >
                          {filter}
                          <span className="ml-2 text-blue-600 hover:text-red-500 cursor-pointer font-bold">
                            &times;
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
  )
}

export default SearchWithFilter
