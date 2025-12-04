import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Search, SlidersHorizontal, Map as MapIcon, Grid, X } from 'lucide-react';
import { fetchHosts } from '../../api';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axios from 'axios';
import server from '@/server/app';
import HostCard from '../../components/HostCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
const HostListPage = () => {
    const [filters, setFilters] = useState({
        hostTypes: [],
        hostWelcomes: [],
        numberOfWorkawayers: "any",
    });
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [searchedPlace, setSearchedPlace] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [showNextDestination, setShowNextDestination] = useState(false);
    const [nextDestination, setNextDestination] = useState("");
    const [viewMode, setViewMode] = useState('split');
    const { volenteerData } = useSelector((state) => state.volenteer);
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
            }
            catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        };
        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [input]);
    // Handle place selection
    const handleSelect = (placeItem) => {
        setInput(placeItem.display_name);
        setSelectedPlace(placeItem);
        setShowNextDestination(false);
        setNextDestination("");
        setSuggestions([]);
    };
    // Query to fetch filtered hosts
    const { data, isLoading, error } = useQuery({
        queryKey: ["fetchHosts", filters, place, page],
        queryFn: fetchHosts,
        staleTime: 5 * 60 * 1000,
    });
    // Transform host data for map
    const hostsForMap = useMemo(() => data?.hosts.map((host) => ({
        id: host._id,
        desc: host.description,
        lat: host.address?.lat,
        lng: host.address?.lon,
    })) || [], [data]);
    // Count active filters
    const activeFilterCount = filters.hostTypes.length + filters.hostWelcomes.length + (filters.numberOfWorkawayers !== "any" ? 1 : 0);
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "sticky top-16 lg:top-20 z-40 bg-white border-b border-gray-200", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: [_jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center gap-4", children: [_jsxs("div", { className: "relative flex-1 max-w-xl", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { value: input, type: "text", placeholder: "Search destinations...", onChange: (e) => setInput(e.target.value), className: "w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm" }), suggestions.length > 0 && (_jsx("div", { className: "absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-64 overflow-auto z-50", children: suggestions.map((suggestion) => (_jsxs("button", { className: "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left", onClick: () => handleSelect(suggestion), children: [_jsx(MapIcon, { className: "w-4 h-4 text-gray-400 shrink-0" }), _jsx("span", { className: "text-sm truncate", children: suggestion.display_name })] }, suggestion.place_id))) }))] }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsxs(Button, { variant: showFilters ? "default" : "outline", onClick: () => setShowFilters(!showFilters), className: "relative", children: [_jsx(SlidersHorizontal, { className: "w-4 h-4 mr-2" }), "Filters", activeFilterCount > 0 && (_jsx(Badge, { variant: "secondary", className: "ml-2 bg-primary text-white", children: activeFilterCount }))] }), volenteerData?.user?.nextDestination?.destination && (_jsx(Button, { variant: showNextDestination ? "default" : "outline", onClick: hostInMyNextDestination, children: "\uD83C\uDF0D My Destination" })), _jsxs("div", { className: "hidden lg:flex items-center gap-1 p-1 bg-gray-100 rounded-lg", children: [_jsx("button", { onClick: () => setViewMode('list'), className: `p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`, title: "List view", children: _jsx(Grid, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setViewMode('split'), className: `p-2 rounded-md transition-colors ${viewMode === 'split' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`, title: "Split view", children: _jsxs("div", { className: "flex gap-0.5", children: [_jsx("div", { className: "w-2 h-4 bg-current rounded-sm" }), _jsx("div", { className: "w-2 h-4 bg-current rounded-sm" })] }) }), _jsx("button", { onClick: () => setViewMode('map'), className: `p-2 rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`, title: "Map view", children: _jsx(MapIcon, { className: "w-4 h-4" }) })] }), _jsxs(Button, { variant: "outline", onClick: () => setViewMode(viewMode === 'map' ? 'list' : 'map'), className: "lg:hidden", children: [_jsx(MapIcon, { className: "w-4 h-4 mr-2" }), viewMode === 'map' ? 'List' : 'Map'] })] })] }), (filters.hostTypes.length > 0 || filters.hostWelcomes.length > 0) && (_jsxs("div", { className: "flex flex-wrap gap-2 mt-4", children: [filters.hostTypes.map((type) => (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1 pr-1", children: [type, _jsx("button", { onClick: () => setFilters({ ...filters, hostTypes: filters.hostTypes.filter(t => t !== type) }), className: "p-0.5 hover:bg-gray-200 rounded-full", children: _jsx(X, { className: "w-3 h-3" }) })] }, type))), filters.hostWelcomes.map((type) => (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1 pr-1", children: [type, _jsx("button", { onClick: () => setFilters({ ...filters, hostWelcomes: filters.hostWelcomes.filter(t => t !== type) }), className: "p-0.5 hover:bg-gray-200 rounded-full", children: _jsx(X, { className: "w-3 h-3" }) })] }, type))), _jsx("button", { onClick: () => setFilters({ hostTypes: [], hostWelcomes: [], numberOfWorkawayers: "any" }), className: "text-sm text-primary hover:underline", children: "Clear all" })] }))] }) }), _jsxs("div", { className: "flex", children: [showFilters && (_jsx("aside", { className: "hidden lg:block w-80 shrink-0 border-r border-gray-200 bg-white h-[calc(100vh-8rem)] sticky top-32 overflow-y-auto", children: _jsx(Filters, { filters: filters, setFilters: setFilters, onClose: () => setShowFilters(false) }) })), showFilters && (_jsxs("div", { className: "lg:hidden fixed inset-0 z-50", children: [_jsx("div", { className: "absolute inset-0 bg-black/50", onClick: () => setShowFilters(false) }), _jsx("div", { className: "absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto", children: _jsx(Filters, { filters: filters, setFilters: setFilters, onClose: () => setShowFilters(false) }) })] })), (viewMode === 'split' || viewMode === 'map') && (_jsx("div", { className: `${viewMode === 'map' ? 'flex-1' : 'hidden lg:block w-1/2'} h-[calc(100vh-8rem)] sticky top-32`, children: _jsx(MapComponent, { locations: hostsForMap }) })), (viewMode === 'split' || viewMode === 'list') && (_jsx("div", { className: `flex-1 ${viewMode === 'list' ? 'max-w-5xl mx-auto' : ''}`, children: _jsxs("div", { className: "p-6", children: [data && (_jsxs("p", { className: "text-sm text-muted-foreground mb-4", children: [data.totalHosts, " ", data.totalHosts === 1 ? 'host' : 'hosts', " found", place && ` in ${place}`] })), isLoading && (_jsx("div", { className: "grid gap-6", children: [...Array(4)].map((_, i) => (_jsx("div", { className: "bg-white rounded-2xl p-4 border border-gray-100", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx(Skeleton, { className: "w-full sm:w-2/5 aspect-[4/3] rounded-xl" }), _jsxs("div", { className: "flex-1 space-y-3", children: [_jsx(Skeleton, { className: "h-4 w-1/3" }), _jsx(Skeleton, { className: "h-6 w-3/4" }), _jsx(Skeleton, { className: "h-4 w-full" }), _jsx(Skeleton, { className: "h-4 w-2/3" })] })] }) }, i))) })), error && (_jsxs("div", { className: "text-center py-16", children: [_jsx("div", { className: "w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center", children: _jsx(X, { className: "w-8 h-8 text-red-500" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "We couldn't load the hosts. Please try again." }), _jsx(Button, { onClick: () => window.location.reload(), children: "Try Again" })] })), !isLoading && !error && data?.hosts.length === 0 && (_jsxs("div", { className: "text-center py-16", children: [_jsx("div", { className: "w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center", children: _jsx(Search, { className: "w-8 h-8 text-gray-400" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No hosts found" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Try adjusting your filters or search in a different location." }), _jsx(Button, { variant: "outline", onClick: () => {
                                                setFilters({ hostTypes: [], hostWelcomes: [], numberOfWorkawayers: "any" });
                                                setInput("");
                                                setSearchedPlace("");
                                            }, children: "Clear filters" })] })), !isLoading && !error && data && data.hosts.length > 0 && (_jsx("div", { className: "grid gap-6", children: data.hosts.map((host) => (_jsx(HostCard, { host: host }, host._id))) })), data && data.totalPages > 1 && (_jsxs("div", { className: "flex justify-center items-center gap-2 mt-8 pt-8 border-t border-gray-200", children: [_jsx(Button, { variant: "outline", size: "sm", disabled: page === 1, onClick: () => setPage(page - 1), children: "Previous" }), _jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (data.totalPages <= 5) {
                                                    pageNum = i + 1;
                                                }
                                                else if (page <= 3) {
                                                    pageNum = i + 1;
                                                }
                                                else if (page >= data.totalPages - 2) {
                                                    pageNum = data.totalPages - 4 + i;
                                                }
                                                else {
                                                    pageNum = page - 2 + i;
                                                }
                                                return (_jsx("button", { onClick: () => setPage(pageNum), className: `w-10 h-10 rounded-lg text-sm font-medium transition-colors ${pageNum === page
                                                        ? "bg-primary text-white"
                                                        : "hover:bg-gray-100"}`, children: pageNum }, pageNum));
                                            }) }), _jsx(Button, { variant: "outline", size: "sm", disabled: page === data.totalPages, onClick: () => setPage(page + 1), children: "Next" })] }))] }) }))] })] }));
};
export default HostListPage;
const HELP_TYPES = [
    "Cooking", "Art", "Teaching", "Gardening",
    "Help with Computer", "Language Practice", "Animal Care", "Others"
];
const HOST_WELCOMES = ["Families", "Digital Nomad", "Campers"];
const WORKAWAYERS_OPTIONS = ["any", "1", "2", "more"];
const Filters = ({ filters, setFilters, onClose }) => {
    const toggleSelection = (list, value) => {
        return list.includes(value)
            ? list.filter(item => item !== value)
            : [...list, value];
    };
    const handleHostTypeClick = (type) => {
        const updated = toggleSelection(filters.hostTypes, type);
        setFilters({ ...filters, hostTypes: updated });
    };
    const handleWelcomeClick = (type) => {
        const updated = toggleSelection(filters.hostWelcomes, type);
        setFilters({ ...filters, hostWelcomes: updated });
    };
    const handleRadioChange = (value) => {
        setFilters({ ...filters, numberOfWorkawayers: value });
    };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6 lg:hidden", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Filters" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-lg", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-4", children: "Type of Help" }), _jsx("div", { className: "flex flex-wrap gap-2", children: HELP_TYPES.map(type => (_jsx("button", { onClick: () => handleHostTypeClick(type), className: `px-3 py-2 text-sm rounded-lg border transition-all ${filters.hostTypes.includes(type)
                                ? "bg-primary text-white border-primary"
                                : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`, children: type }, type))) })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-4", children: "Host Welcomes" }), _jsx("div", { className: "flex flex-wrap gap-2", children: HOST_WELCOMES.map(type => (_jsx("button", { onClick: () => handleWelcomeClick(type), className: `px-3 py-2 text-sm rounded-lg border transition-all ${filters.hostWelcomes.includes(type)
                                ? "bg-primary text-white border-primary"
                                : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`, children: type }, type))) })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-4", children: "Number of Volunteers Accepted" }), _jsx("div", { className: "space-y-3", children: WORKAWAYERS_OPTIONS.map(value => (_jsxs("label", { className: "flex items-center gap-3 cursor-pointer group", children: [_jsx("div", { className: `w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${filters.numberOfWorkawayers === value
                                        ? "border-primary bg-primary"
                                        : "border-gray-300 group-hover:border-gray-400"}`, children: filters.numberOfWorkawayers === value && (_jsx("div", { className: "w-2 h-2 rounded-full bg-white" })) }), _jsx("span", { className: "text-sm text-gray-700", children: value === "any"
                                        ? "Any number"
                                        : value === "more"
                                            ? "More than two"
                                            : `${value} volunteer${value === "1" ? "" : "s"}` })] }, value))) })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-4", children: "Quick Filters" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center gap-3 cursor-pointer group", children: [_jsx("input", { type: "checkbox", name: "newHost", className: "w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" }), _jsx("span", { className: "text-sm text-gray-700", children: "New hosts" })] }), _jsxs("label", { className: "flex items-center gap-3 cursor-pointer group", children: [_jsx("input", { type: "checkbox", name: "recentlyUpdated", className: "w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" }), _jsx("span", { className: "text-sm text-gray-700", children: "Recently updated" })] })] })] }), _jsx("div", { className: "lg:hidden pt-4 border-t border-gray-200", children: _jsx(Button, { onClick: onClose, className: "w-full", children: "Apply Filters" }) })] }));
};
const MapComponent = ({ locations }) => {
    const defaultLat = 40.7128;
    const defaultLng = -74.006;
    return (_jsx("div", { className: "w-full h-full", children: _jsxs(MapContainer, { center: [defaultLat, defaultLng], zoom: 3, style: { height: "100%", width: "100%" }, className: "z-0", children: [_jsx(TileLayer, { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), locations.map((loc) => (_jsx(Marker, { position: [loc.lat ?? defaultLat, loc.lng ?? defaultLng], children: _jsx(Popup, { children: _jsx("div", { className: "max-w-xs", children: _jsx("p", { className: "text-sm line-clamp-2", children: loc.desc }) }) }) }, loc.id)))] }) }));
};
