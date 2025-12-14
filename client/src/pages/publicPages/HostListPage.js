import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import HostCard from '../../components/HostCard';
import { fetchHosts } from '../../api';
import { useQuery } from '@tanstack/react-query';
import { AiOutlineSearch } from 'react-icons/ai';
import { BiChevronDown } from 'react-icons/bi';
import server from '@/server/app';
import axios from 'axios';
import { useSelector } from 'react-redux';
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
    const [loading, setLoading] = useState(null);
    const { volenteerData } = useSelector((state) => state.volenteer);
    const [showMap, setShowMap] = useState(true);
    const toggleMapView = () => {
        setShowFilters(!showFilters);
        setShowMap(!showMap);
    };
    // Extract place when selectedPlace changes
    useEffect(() => {
        if (selectedPlace?.display_name) {
            const place = selectedPlace.display_name.split(",")[0].trim();
            setSearchedPlace(place);
            setShowNextDestination(false);
        }
    }, [selectedPlace]);
    // Handler to show hosts in user's next destination
    const hostInMyNextDestination = () => {
        const destination = volenteerData?.user?.nextDestination.destination;
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
    const handleSelect = (place) => {
        setInput(place.display_name);
        setSelectedPlace(place);
        setShowNextDestination(false);
        setNextDestination("");
        setSuggestions([]);
    };
    const toggleFilter = () => {
        setShowMap(!showMap);
        setShowFilters(prev => !prev);
    };
    // Query to fetch filtered hosts
    const { data, isLoading, error, } = useQuery({
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
    ;
    return (_jsxs("div", { children: [_jsx("div", { className: "w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-3 bg-white border rounded-lg shadow-sm", children: _jsxs("div", { className: "flex flex-col sm:flex-row flex-grow items-stretch md:items-center gap-3 w-full", children: [_jsx("button", { onClick: toggleFilter, className: `px-4 py-2 rounded-lg text-sm font-medium transition duration-200 border shadow-sm w-full sm:w-auto ${showFilters
                                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`, children: "Filter" }), _jsxs("div", { className: "relative w-full max-w-sm", children: [_jsx("input", { value: input, type: "text", placeholder: "Search for a place", onChange: (e) => setInput(e.target.value), className: "w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 text-sm" }), _jsx(AiOutlineSearch, { className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" }), suggestions.length > 0 && (_jsx("ul", { className: "absolute z-50 left-0 right-0 bg-white border mt-2 rounded-md shadow max-h-60 overflow-auto", children: suggestions.map((place) => (_jsx("li", { className: "cursor-pointer px-3 py-2 hover:bg-gray-100 text-sm", onClick: () => handleSelect(place), children: place.display_name }, place.place_id))) }))] }), _jsx("button", { onClick: hostInMyNextDestination, className: `px-4 py-2 rounded-lg text-sm font-medium transition duration-200 border shadow-sm w-full sm:w-auto ${showNextDestination
                                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`, children: "\uD83C\uDF0D Host In My Destination" }), _jsx("button", { onClick: toggleMapView, className: `px-4 py-2 rounded-lg text-sm font-medium transition duration-200 border shadow-sm w-full sm:w-auto ${showMap
                                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`, children: "\uD83D\uDDFA\uFE0F Map View" })] }) }), _jsxs("div", { className: "flex flex-col md:flex-row w-full", children: [showFilters ? _jsx(Filters, { filters: filters, setFilters: setFilters }) : null, showMap ? _jsx(MapComponent, { isFilterComponentOpen: showFilters, locations: hostsForMap }) : _jsx(_Fragment, {}), _jsxs("div", { className: `w-full ${showMap ? "md:w-1/2" : "w-full"} flex flex-col gap-y-4 gap-2 px-2 pt-3`, children: [error ? (_jsxs("div", { className: "space-y-4 animate-pulse", children: [Array.from({ length: 2 }).map((_, i) => (_jsxs("div", { className: "flex items-center space-x-4 p-4 bg-white rounded-xl shadow", children: [_jsx("div", { className: "w-16 h-16 bg-red-200 rounded-full" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "w-1/3 h-4 bg-red-300 rounded" }), _jsx("div", { className: "w-1/2 h-4 bg-red-200 rounded" })] })] }, i))), _jsx("p", { className: "text-red-500 font-semibold text-center", children: "\u26A0\uFE0F Error fetching hosts!" })] })) : isLoading ? (_jsx("div", { className: "space-y-4 animate-pulse", children: Array.from({ length: 4 }).map((_, i) => (_jsxs("div", { className: "flex items-center space-x-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm", children: [_jsx("div", { className: "w-16 h-16 bg-gray-300 rounded-full" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "w-1/3 h-4 bg-gray-300 rounded" }), _jsx("div", { className: "w-1/2 h-4 bg-gray-200 rounded" }), _jsx("div", { className: "w-1/4 h-3 bg-gray-200 rounded" })] })] }, i))) })) : data?.hosts.length < 1 ? (_jsxs("div", { className: "text-center py-10", children: [_jsx("h1", { className: "text-xl font-medium text-gray-600", children: "No hosts found \uD83D\uDD75\uFE0F" }), _jsx("p", { className: "text-sm text-gray-400", children: "Try adjusting your filters or check back later." })] })) : (data?.hosts.map((host) => (_jsx(HostCard, { host: host }, host._id)))), data?.totalPages > 1 && (_jsxs("div", { className: "flex justify-center mt-6 items-center gap-2", children: [_jsx("button", { disabled: page === 1, onClick: () => setPage(page - 1), className: `px-4 py-2 rounded ${page === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`, children: "Previous" }), Array.from({ length: data.totalPages }, (_, i) => i + 1).map((pageNum) => (_jsx("button", { onClick: () => setPage(pageNum), className: `px-4 py-2 rounded font-medium ${pageNum === page
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 hover:bg-gray-200"}`, children: pageNum }, pageNum))), _jsx("button", { disabled: page === data.totalPages, onClick: () => setPage(page + 1), className: `px-4 py-2 rounded ${page === data.totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`, children: "Next" })] }))] })] })] }));
};
export default HostListPage;
const HELP_TYPES = [
    "Cooking", "Art", "Teaching", "Gardening",
    "Help with Computer", "Language Practice", "Animal Care", "Others"
];
const HOST_WELCOMES = ["Families", "DIgital Nomad", "Campers"];
const WORKAWAYERS_OPTIONS = ["any", "1", "2", "more"];
const Filters = ({ filters, setFilters }) => {
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
    return (_jsxs("div", { className: "\r\n    w-full md:w-1/3 lg:w-1/4 \r\n    h-full max-h-[90vh] \r\n    px-4 py-5 my-4 mx-2 \r\n    border border-gray-300 \r\n    rounded-lg shadow-sm \r\n    bg-white overflow-y-auto \r\n    transition-all duration-300\r\n    sticky top-[0px]\r\n  ", children: [_jsx("h3", { className: "text-xl font-semibold mb-3", children: "Filter Hosts" }), _jsxs("div", { className: "mb-5", children: [_jsx("h4", { className: "text-md font-bold mb-2", children: "Host Type" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: HELP_TYPES.map(type => (_jsx("div", { className: `px-3 py-2 text-sm text-center rounded-md border transition cursor-pointer ${filters.hostTypes.includes(type)
                                ? "bg-black text-white border-black"
                                : "bg-gray-100 hover:bg-gray-200"}`, onClick: () => handleHostTypeClick(type), children: type }, type))) })] }), _jsxs("div", { className: "mb-5", children: [_jsx("h4", { className: "text-md font-bold mb-2", children: "Host Welcomes" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: HOST_WELCOMES.map(type => (_jsx("div", { className: `px-3 py-2 text-xs text-center rounded-md border transition cursor-pointer ${filters.hostWelcomes.includes(type)
                                ? "bg-black text-white border-black"
                                : "bg-gray-100 hover:bg-gray-200"}`, onClick: () => handleWelcomeClick(type), children: type }, type))) })] }), _jsxs("div", { className: "mb-5", children: [_jsx("h4", { className: "text-md font-bold mb-2", children: "Number of Workawayers Accepted" }), _jsx("div", { className: "flex flex-col gap-2", children: WORKAWAYERS_OPTIONS.map(value => (_jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer hover:text-blue-600", children: [_jsx("input", { type: "radio", name: "quantity", value: value, checked: filters.numberOfWorkawayers === value, onChange: () => handleRadioChange(value) }), value === "any"
                                    ? "Any"
                                    : value === "more"
                                        ? "More than two"
                                        : value] }, value))) })] }), _jsxs("div", { className: "mb-5 flex flex-col sm:flex-row gap-2", children: [_jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [_jsx("input", { type: "checkbox", name: "newHost" }), "New Host"] }), _jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [_jsx("input", { type: "checkbox", name: "recentlyUpdated" }), "Recently Updated"] })] })] }));
};
const locations = [
    { id: 1, name: "New York", lat: 40.7128, lng: -74.006 },
    { id: 2, name: "London", lat: 51.5074, lng: -0.1278 },
    { id: 3, name: "Tokyo", lat: 35.6895, lng: 139.6917 },
];
const MapComponent = ({ isFilterComponentOpen, locations, }) => {
    const defaultLat = 40.7128; // Default latitude (New York)
    const defaultLng = -74.006;
    return (_jsx("div", { className: `
      ${isFilterComponentOpen ? "w-full md:w-3/4" : "w-full md:w-1/2   sticky top-[0px]"} 
      h-[90vh] pt-3 transition-all duration-300
    `, children: _jsxs(MapContainer, { center: [defaultLat, defaultLng], zoom: 3, style: { height: "100%", width: "100%" }, children: [_jsx(TileLayer, { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), locations.map((loc) => (_jsx(Marker, { position: [loc.lat ?? defaultLat, loc.lng ?? defaultLng], children: _jsx(Popup, { children: loc.desc }) }, loc.id)))] }) }));
};
const SortDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("Newest First");
    const dropdownRef = useRef(null);
    const options = [
        "Newest First",
        "Oldest First",
        "Most Popular",
        "Highest Rated",
    ];
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (_jsxs("div", { className: "relative inline-block", ref: dropdownRef, children: [_jsxs("button", { className: "border border-black rounded-full px-4 flex items-center gap-2", onClick: () => setIsOpen(!isOpen), children: [selected, " ", _jsx(BiChevronDown, { size: 18 })] }), isOpen && (_jsx("div", { className: "absolute top-full left-0 mt-2 w-48 bg-white shadow-lg border rounded-lg z-10", children: options.map((option, index) => (_jsx("div", { className: `p-3 cursor-pointer hover:bg-gray-100 ${selected === option ? "bg-gray-200 font-semibold" : ""}`, onClick: () => {
                        setSelected(option);
                        setIsOpen(false);
                    }, children: option }, index))) }))] }));
};
