import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Search, SlidersHorizontal, Map as MapIcon, Grid, X } from 'lucide-react'
import { fetchHosts } from '../../api';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import server from '@/server/app';
import HostCard from '../../components/HostCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type AddressValues = {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
};

export type FiltersType = {
  hostTypes: string[];
  numberOfWorkawayers: string;
  hostWelcomes: string[];
};

type FilteredHostsResponse = {
  hosts: Host[];
  currentPage: number;
  totalPages: number;
  totalHosts: number;
};

const HostListPage = () => {
  const [filters, setFilters] = useState<FiltersType>({
    hostTypes: [],
    hostWelcomes: [],
    numberOfWorkawayers: "any",
  });

  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<AddressValues[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<AddressValues | null>(null);
  const [searchedPlace, setSearchedPlace] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [showNextDestination, setShowNextDestination] = useState(false);
  const [nextDestination, setNextDestination] = useState("");
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  
  const { volenteerData } = useSelector((state: RootState) => state.volenteer);

  // Extract place when selectedPlace changes
  useEffect(() => {
    if (selectedPlace?.display_name) {
      const placeName = selectedPlace.display_name.split(",")[0].trim();
      setSearchedPlace(placeName);
      setShowNextDestination(false);
    }
  }, [selectedPlace]);

  // Handler to show hosts in user's next destination
  const hostInMyNextDestination = () => {
    const destination = volenteerData?.user?.nextDestination?.destination;
    if (destination) {
      setNextDestination(destination);
      setShowNextDestination(true);
      setInput(destination);
      setSelectedPlace(null);
    }
  };

  // Decide final place based on user's action
  const place = useMemo(() => {
    return showNextDestination ? nextDestination : searchedPlace;
  }, [searchedPlace, nextDestination, showNextDestination]);

  // Fetch suggestions based on user input
  useEffect(() => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(`${server}/host/places?input=${input}`);
        setSuggestions(response.data || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [input]);

  // Handle place selection
  const handleSelect = (placeItem: AddressValues) => {
    setInput(placeItem.display_name);
    setSelectedPlace(placeItem);
    setShowNextDestination(false);
    setNextDestination("");
    setSuggestions([]);
  };

  // Query to fetch filtered hosts
  const { data, isLoading, error } = useQuery<FilteredHostsResponse, Error, FilteredHostsResponse, [string, FiltersType, string, number]>({
    queryKey: ["fetchHosts", filters, place, page],
    queryFn: fetchHosts,
    staleTime: 5 * 60 * 1000,
  });

  // Transform host data for map
  const hostsForMap = useMemo(
    () =>
      data?.hosts.map((host) => ({
        id: host._id,
        desc: host.description,
        lat: host.address?.lat,
        lng: host.address?.lon,
      })) || [],
    [data]
  );

  // Count active filters
  const activeFilterCount = filters.hostTypes.length + filters.hostWelcomes.length + (filters.numberOfWorkawayers !== "any" ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="sticky top-16 lg:top-20 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={input}
                type="text"
                placeholder="Search destinations..."
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
              
              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-64 overflow-auto z-50">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      onClick={() => handleSelect(suggestion)}
                    >
                      <MapIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm truncate">{suggestion.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter Toggle */}
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary text-white">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {/* Next Destination Button */}
              {volenteerData?.user?.nextDestination?.destination && (
                <Button
                  variant={showNextDestination ? "default" : "outline"}
                  onClick={hostInMyNextDestination}
                >
                  🌍 My Destination
                </Button>
              )}

              {/* View Mode Toggle */}
              <div className="hidden lg:flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  title="List view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'split' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  title="Split view"
                >
                  <div className="flex gap-0.5">
                    <div className="w-2 h-4 bg-current rounded-sm" />
                    <div className="w-2 h-4 bg-current rounded-sm" />
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  title="Map view"
                >
                  <MapIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Map Toggle */}
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                className="lg:hidden"
              >
                <MapIcon className="w-4 h-4 mr-2" />
                {viewMode === 'map' ? 'List' : 'Map'}
              </Button>
            </div>
          </div>

          {/* Active Filters Pills */}
          {(filters.hostTypes.length > 0 || filters.hostWelcomes.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.hostTypes.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {type}
                  <button
                    onClick={() => setFilters({ ...filters, hostTypes: filters.hostTypes.filter(t => t !== type) })}
                    className="p-0.5 hover:bg-gray-200 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.hostWelcomes.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {type}
                  <button
                    onClick={() => setFilters({ ...filters, hostWelcomes: filters.hostWelcomes.filter(t => t !== type) })}
                    className="p-0.5 hover:bg-gray-200 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <button
                onClick={() => setFilters({ hostTypes: [], hostWelcomes: [], numberOfWorkawayers: "any" })}
                className="text-sm text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Filters Sidebar */}
        {showFilters && (
          <aside className="hidden lg:block w-80 shrink-0 border-r border-gray-200 bg-white h-[calc(100vh-8rem)] sticky top-32 overflow-y-auto">
            <Filters filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} />
          </aside>
        )}

        {/* Mobile Filters Modal */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
              <Filters filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} />
            </div>
          </div>
        )}

        {/* Map Section */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div className={`${viewMode === 'map' ? 'flex-1' : 'hidden lg:block w-1/2'} h-[calc(100vh-8rem)] sticky top-32`}>
            <MapComponent locations={hostsForMap} />
          </div>
        )}

        {/* Host Cards */}
        {(viewMode === 'split' || viewMode === 'list') && (
          <div className={`flex-1 ${viewMode === 'list' ? 'max-w-5xl mx-auto' : ''}`}>
            <div className="p-6">
              {/* Results Count */}
              {data && (
                <p className="text-sm text-muted-foreground mb-4">
                  {data.totalHosts} {data.totalHosts === 1 ? 'host' : 'hosts'} found
                  {place && ` in ${place}`}
                </p>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="grid gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Skeleton className="w-full sm:w-2/5 aspect-[4/3] rounded-xl" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
                  <p className="text-muted-foreground mb-4">We couldn't load the hosts. Please try again.</p>
                  <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && data?.hosts.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hosts found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your filters or search in a different location.</p>
                  <Button variant="outline" onClick={() => {
                    setFilters({ hostTypes: [], hostWelcomes: [], numberOfWorkawayers: "any" });
                    setInput("");
                    setSearchedPlace("");
                  }}>
                    Clear filters
                  </Button>
                </div>
              )}

              {/* Host Cards Grid */}
              {!isLoading && !error && data && data.hosts.length > 0 && (
                <div className="grid gap-6">
                  {data.hosts.map((host: Host) => (
                    <HostCard key={host._id} host={host} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pt-8 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                      let pageNum;
                      if (data.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= data.totalPages - 2) {
                        pageNum = data.totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            pageNum === page
                              ? "bg-primary text-white"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === data.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostListPage;

// Filter Component
interface FiltersProps {
  filters: FiltersType;
  setFilters: (filters: FiltersType) => void;
  onClose: () => void;
}

const HELP_TYPES = [
  "Cooking", "Art", "Teaching", "Gardening",
  "Help with Computer", "Language Practice", "Animal Care", "Others"
];

const HOST_WELCOMES = ["Families", "Digital Nomad", "Campers"];
const WORKAWAYERS_OPTIONS = ["any", "1", "2", "more"];

const Filters = ({ filters, setFilters, onClose }: FiltersProps) => {
  const toggleSelection = (list: string[], value: string): string[] => {
    return list.includes(value)
      ? list.filter(item => item !== value)
      : [...list, value];
  };

  const handleHostTypeClick = (type: string) => {
    const updated = toggleSelection(filters.hostTypes, type);
    setFilters({ ...filters, hostTypes: updated });
  };

  const handleWelcomeClick = (type: string) => {
    const updated = toggleSelection(filters.hostWelcomes, type);
    setFilters({ ...filters, hostWelcomes: updated });
  };

  const handleRadioChange = (value: string) => {
    setFilters({ ...filters, numberOfWorkawayers: value });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Host Type */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Type of Help</h3>
        <div className="flex flex-wrap gap-2">
          {HELP_TYPES.map(type => (
            <button
              key={type}
              onClick={() => handleHostTypeClick(type)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                filters.hostTypes.includes(type)
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Host Welcomes */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Host Welcomes</h3>
        <div className="flex flex-wrap gap-2">
          {HOST_WELCOMES.map(type => (
            <button
              key={type}
              onClick={() => handleWelcomeClick(type)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                filters.hostWelcomes.includes(type)
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Number of Volunteers */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Number of Volunteers Accepted</h3>
        <div className="space-y-3">
          {WORKAWAYERS_OPTIONS.map(value => (
            <label
              key={value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                filters.numberOfWorkawayers === value
                  ? "border-primary bg-primary"
                  : "border-gray-300 group-hover:border-gray-400"
              }`}>
                {filters.numberOfWorkawayers === value && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span className="text-sm text-gray-700">
                {value === "any"
                  ? "Any number"
                  : value === "more"
                  ? "More than two"
                  : `${value} volunteer${value === "1" ? "" : "s"}`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Filters</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" name="newHost" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-sm text-gray-700">New hosts</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" name="recentlyUpdated" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-sm text-gray-700">Recently updated</span>
          </label>
        </div>
      </div>

      {/* Mobile Apply Button */}
      <div className="lg:hidden pt-4 border-t border-gray-200">
        <Button onClick={onClose} className="w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

// Map Component
interface MapLocation {
  id: string;
  desc: string;
  lat: number | null;
  lng: number | null;
}

const MapComponent = ({ locations }: { locations: MapLocation[] }) => {
  const defaultLat = 40.7128;
  const defaultLng = -74.006;

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[defaultLat, defaultLng]}
        zoom={3}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.lat ?? defaultLat, loc.lng ?? defaultLng]}
          >
            <Popup>
              <div className="max-w-xs">
                <p className="text-sm line-clamp-2">{loc.desc}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
