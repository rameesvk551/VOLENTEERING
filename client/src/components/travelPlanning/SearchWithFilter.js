import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import server from '@/server/app';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setAttractions, setSearchedPlace } from '@/redux/Slices/attraction';
const SearchPage = () => {
    const dispatch = useDispatch();
    const [suggestions, setSuggestions] = useState();
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState('');
    const [notFound, setNotFound] = useState(false);
    const handleSearch = () => {
        const extractPlace = input?.split(',').map(part => part.trim());
        const place = extractPlace[0];
        axios.get(`${server}/trip-planning/get-attractions/${place}`, {})
            .then((res) => {
            if (res.data && res.data.attractions && res.data.attractions.length > 0) {
                console.log("Attractions found:", res.data.attractions);
                dispatch(setSearchedPlace(place));
                dispatch(setAttractions(res.data.attractions));
            }
            else {
                console.log("No attractions found for the searched place.");
            }
        })
            .catch((err) => {
            // Error handling if the API request fails
            console.error("Error fetching attractions:", err);
            setNotFound(true);
        });
    };
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
                setNotFound(true);
            }
        };
        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [input]);
    const handleSelect = (place) => {
        setInput(place.display_name);
        setSuggestions([]);
    };
    return (_jsxs("div", { className: "flex flex-col-reverse md:flex-row h-[40vh] min-h-[300px] w-full overflow-hidden", children: [_jsx("div", { className: "w-full md:w-1/2 flex justify-center items-center p-5 md:p-9", children: _jsxs("div", { className: "w-full max-w-xl space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-extrabold text-yellow-500", children: "Plan Your Perfect Trip" }), _jsx("p", { className: "text-blue-600 mt-2 text-sm font-medium", children: "Search destinations, explore top attractions, and create your personalized travel experience." })] }), _jsxs("div", { className: "relative", children: [_jsxs("div", { className: "flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition", children: [_jsx(Search, { className: "w-5 h-5 text-gray-400" }), _jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), placeholder: "Where do you want to explore?", className: "w-full text-sm bg-transparent focus:outline-none placeholder:text-gray-400" })] }), suggestions?.length > 0 && (_jsx("ul", { className: "absolute z-10 mt-2 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto", children: suggestions.map((place) => (_jsx("li", { className: "px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer transition", onClick: () => handleSelect(place), children: place.display_name }, place.place_id))) }))] }), _jsx("div", { className: "flex items-end", children: _jsx("button", { disabled: loading, onClick: handleSearch, className: `w-full flex items-center justify-center gap-2 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl py-2 text-sm font-semibold transition duration-200 shadow hover:shadow-md`, children: loading ? (_jsxs("svg", { className: "animate-spin h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" })] })) : (_jsx(_Fragment, { children: "\uD83D\uDD0D Search" })) }) })] }) }), _jsx("div", { className: "w-full md:w-1/2 hidden md:flex items-center justify-center p-10", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsx("p", { className: "text-3xl font-bold text-yellow-600 mb-4 leading-snug", children: "\u201CTravel isn\u2019t always about the destination\u2014it's about the stories you create.\u201D" }), _jsx("p", { className: "text-sm text-blue-700 font-medium", children: "Whether it\u2019s a serene escape or an adventurous getaway, let us help you plan every step." })] }) }), notFound && (_jsx("div", { className: "absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 px-4 py-2 rounded-xl shadow", children: _jsx("h1", { className: "text-sm font-semibold", children: "No attractions found for the selected place." }) }))] }));
};
export default SearchPage;
