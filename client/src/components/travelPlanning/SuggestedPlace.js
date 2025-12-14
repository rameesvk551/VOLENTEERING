import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import PlaceToVisit from './PlaceToVisitCard';
import { useSelector, useDispatch } from 'react-redux';
import { Search } from 'lucide-react';
import { removeSelectedPlace, setAttractions, setSearchedPlace, setSelectedPlace, } from '@/redux/Slices/attraction';
import server from '@/server/app';
import axios from 'axios';
import { optimizeRoute } from '@/redux/thunks/routeOptimizerThunk';
const SuggestedPlace = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState('');
    const dispatch = useDispatch();
    const [notFound, setNotFound] = useState(false);
    const { selectedPlace, attractions, searchedPlace } = useSelector((state) => state.attractions);
    const routeStatus = useSelector((state) => state.routeOptimizer.status);
    const travelMode = useSelector((state) => state.routeOptimizer.travelMode);
    const totalPages = Math.ceil((attractions?.length || 0) / itemsPerPage);
    const paginatedAttractions = attractions?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const handleRemovePlace = (place, latitude, longitude) => {
        dispatch(removeSelectedPlace({ place, latitude, longitude }));
    };
    const handleSelectPlace = (place, latitude, longitude) => {
        dispatch(setSelectedPlace({ place, latitude, longitude }));
    };
    const handleOptimizeRoute = () => {
        if (selectedPlace.length < 2 || routeStatus === 'loading')
            return;
        dispatch(optimizeRoute({ travelMode, places: selectedPlace }));
    };
    useEffect(() => {
        setCurrentPage(1);
    }, [attractions]);
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
                console.error('Error fetching suggestions:', error);
            }
        };
        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [input]);
    const handleSelect = (place) => {
        setInput(place.display_name);
        setSuggestions([]);
    };
    const handleSearch = () => {
        const extractPlace = input?.split(',').map(part => part.trim());
        const place = extractPlace[0];
        setLoading(true);
        axios
            .get(`${server}/trip-planning/get-attractions/${place}`)
            .then(res => {
            const attractions = res.data?.attractions;
            if (attractions?.length > 0) {
                dispatch(setSearchedPlace(place));
                dispatch(setAttractions(attractions));
                setNotFound(false);
            }
            else {
                dispatch(setAttractions([]));
                setNotFound(true);
            }
            setLoading(false);
        })
            .catch(err => {
            console.error('Error fetching attractions:', err);
            dispatch(setAttractions([]));
            setNotFound(true);
            setLoading(false);
        });
    };
    return (_jsxs("div", { className: "flex flex-col lg:flex-row gap-6 px-4 md:px-10 py-8 min-h-screen", children: [_jsxs("div", { className: "w-full lg:w-2/3 space-y-6", children: [_jsxs("div", { className: "relative w-full max-w-xl mx-auto", children: [_jsxs("div", { className: "flex items-center rounded-xl shadow-md bg-white px-4 py-3 border focus-within:ring-2 focus-within:ring-blue-300", children: [_jsx(Search, { className: "w-5 h-5 text-gray-500 mr-2" }), _jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), placeholder: "Search for a place", className: "w-full bg-transparent text-sm focus:outline-none" }), _jsx("button", { disabled: loading, onClick: handleSearch, className: `ml-4 px-4 py-2 text-sm font-medium rounded-xl text-white transition ${loading
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'}`, children: loading ? (_jsxs("svg", { className: "animate-spin h-4 w-4 mx-auto", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" })] })) : (_jsx(_Fragment, { children: "Search" })) })] }), suggestions.length > 0 && (_jsx("ul", { className: "absolute z-10 mt-2 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto", children: suggestions.map((place) => (_jsx("li", { className: "px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition", onClick: () => handleSelect(place), children: place.display_name }, place.place_id))) }))] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-blue-800 mb-4", children: "\uD83D\uDCCD Suggested Places" }), _jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: notFound ? (_jsxs("div", { className: "w-full bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl shadow-sm flex items-center gap-3", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDE15" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "No attractions found" }), _jsx("p", { className: "text-sm", children: "Try searching a different place or spelling it differently." })] })] })) : paginatedAttractions?.length > 0 ? (paginatedAttractions.map((attraction) => {
                                    const isSelected = selectedPlace.some((place) => place.place === attraction.name);
                                    return (_jsx("div", { onClick: () => handleSelectPlace(attraction.name, attraction.geocodes.latitude, attraction.geocodes.longitude), className: `rounded-xl transition-shadow cursor-pointer ${isSelected
                                            ? 'border-2 border-blue-500 shadow-lg'
                                            : 'border border-gray-200 hover:shadow-md hover:border-blue-300'}`, children: _jsx(PlaceToVisit, { attraction: attraction }) }, attraction.id));
                                })) : (_jsx("div", { className: "text-gray-500 italic", children: "No attractions found." })) }), totalPages > 1 && (_jsxs("div", { className: "flex justify-center items-center gap-2 mt-6", children: [_jsx("button", { onClick: () => setCurrentPage((prev) => Math.max(prev - 1, 1)), disabled: currentPage === 1, className: "px-3 py-1 bg-gray-200 rounded disabled:opacity-50", children: "Prev" }), Array.from({ length: totalPages }, (_, idx) => (_jsx("button", { onClick: () => setCurrentPage(idx + 1), className: `px-3 py-1 rounded ${currentPage === idx + 1
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 hover:bg-blue-100'}`, children: idx + 1 }, idx))), _jsx("button", { onClick: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)), disabled: currentPage === totalPages, className: "px-3 py-1 bg-gray-200 rounded disabled:opacity-50", children: "Next" })] }))] })] }), selectedPlace.length > 0 && (_jsxs("div", { className: "w-full lg:w-1/3 h-full bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mt-4 lg:mt-16", children: [_jsx("h2", { className: "font-bold text-green-600 mb-4", children: "\u2705 Selected Places" }), selectedPlace?.length > 0 ? (_jsx("div", { className: "space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar", children: selectedPlace.map((place, idx) => (_jsxs("div", { className: "p-3 rounded-lg bg-gray-50 border flex justify-between items-center", children: [_jsx("h3", { className: "font-semibold text-gray-800", children: place.place }), _jsx("button", { onClick: () => handleRemovePlace(place.place, place.latitude, place.longitude), className: "text-red-500 text-sm hover:underline ml-4", children: "Remove" })] }, idx))) })) : (_jsx("div", { className: "text-gray-500 italic", children: "No place selected yet." })), _jsxs("div", { className: "mt-6 space-y-2", children: [_jsx("button", { disabled: selectedPlace.length < 2 || routeStatus === 'loading', onClick: handleOptimizeRoute, className: `w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition ${selectedPlace.length < 2
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : routeStatus === 'loading'
                                        ? 'bg-blue-400 animate-pulse'
                                        : 'bg-blue-600 hover:bg-blue-700'}`, children: routeStatus === 'loading' ? 'Optimizing…' : 'Optimize Route' }), selectedPlace.length < 2 && (_jsx("p", { className: "text-xs text-gray-500 text-center", children: "Select at least two places to generate a route." }))] })] }))] }));
};
export default SuggestedPlace;
