import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import axios from "axios";
import MapComponent from "./MapComponent"; // Import the map component
import server from "../../server/app";
const PlacesAutocompleteForHost = ({ onSelectAddress }) => {
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (input.length < 3) {
            setSuggestions([]);
            return;
        }
        const fetchSuggestions = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${server}/host/places?input=${input}`);
                setSuggestions(response.data || []);
            }
            catch (error) {
                console.error("Error fetching places:", error);
            }
            finally {
                setLoading(false);
            }
        };
        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [input]);
    const handleSelect = (place) => {
        setInput(place.display_name);
        setSelectedPlace(place);
        setSuggestions([]);
        onSelectAddress(place);
    };
    return (_jsxs("div", { className: "relative w-full max-w-lg mx-auto mt-10", children: [_jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), placeholder: "Search location...", className: "mr-10 block mb-3 px-3 py-2.5 border w-full border-gray-300 rounded-md focus:outline-none" }), loading && _jsx("p", { className: "text-gray-500 text-sm", children: "Loading..." }), suggestions.length > 0 && (_jsx("ul", { className: "absolute left-0 right-0 bg-white border mt-2 p-2 shadow-md z-10", children: suggestions.map((place) => (_jsx("li", { onClick: () => handleSelect(place), className: "cursor-pointer p-2 hover:bg-gray-200", children: place.display_name }, place.place_id))) })), selectedPlace && (_jsxs(_Fragment, { children: [_jsxs("p", { className: "mt-4 text-green-600 font-bold", children: ["Selected: ", selectedPlace.display_name] }), _jsx("h1", { className: "pt-4", children: "Your exact location on OpenStreetMap" }), _jsx(MapComponent, { lat: parseFloat(selectedPlace.lat), lon: parseFloat(selectedPlace.lon) })] }))] }));
};
export default PlacesAutocompleteForHost;
