import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
const HotelBookingHomePage = () => {
    return (_jsx(_Fragment, { children: _jsx(HotelSearchWithoutFilter, {}) }));
};
export default HotelBookingHomePage;
const HotelSearchWithoutFilter = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [guests, setGuests] = useState({ adults: 1, children: 0 });
    const [hotels, setHotels] = useState([]);
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [loading, setLoading] = useState(false);
    const today = new Date().toISOString().split("T")[0];
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
        setSuggestions([]);
    };
    const initaialDetails = {
        selectedPlace,
        fromDate,
        toDate,
        guests
    };
    const navigate = useNavigate();
    const FetchHotels = async () => {
        if (!selectedPlace || !fromDate || !toDate) {
            alert("Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${server}/hotel/get-hotels`, {
                destination: selectedPlace,
                checkin: fromDate,
                checkout: toDate,
                guests,
            });
            setLoading(false);
            if (response.data.success) {
                setHotels(response.data.hotels);
                console.log("hotelsssss", hotels);
                navigate("/search-hotels", { state: { hotels: response.data.hotels, initaialDetails } });
            }
            else {
                toast.error(response.data.message);
            }
        }
        catch (err) {
            setLoading(false);
            console.error("FetchHotels error:", err);
            alert("Failed to fetch hotels.");
        }
    };
    return (_jsxs("div", { className: ' rounded-xl  bg-gradient-to-br from-blue-50 via-yellow-50 to-blue-50', children: [_jsxs("div", { className: "flex flex-col-reverse md:flex-row h-[40vh] min-h-[300px] w-full overflow-hidden", children: [_jsx("div", { className: "w-full md:w-1/2 flex justify-center items-center p-5 md:p-10", children: _jsxs("div", { className: "w-full max-w-xl space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl md:text-3xl font-bold text-yellow-500 leading-snug", children: "Find the right hotel today" }), _jsx("p", { className: "text-blue-600 text-sm md:text-base font-medium mt-1", children: "We compare hotel prices from over 100 sites" })] }), _jsxs("form", { onSubmit: (e) => { e.preventDefault(); FetchHotels(); }, children: [_jsxs("div", { className: "flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-md", children: [_jsx(Search, { className: "w-5 h-5 text-gray-500" }), _jsx("input", { value: input, type: "text", placeholder: "Search for a place", onChange: (e) => setInput(e.target.value), className: "w-full pl-4 pr-10 py-1.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 text-sm" }), suggestions.length > 0 && (_jsx("ul", { className: "absolute z-50 left-0 right-0 bg-white border mt-40 ml-[89px] rounded-md shadow max-h-60  overflow-auto w-[500px]", children: suggestions.map((place) => (_jsx("li", { className: "cursor-pointer px-3 py-2 hover:bg-gray-100 text-sm", onClick: () => handleSelect(place), children: place.display_name }, place.place_id))) }))] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "text-xs text-gray-500 mb-1", children: "Check-in" }), _jsx("input", { type: "date", value: fromDate, min: today, onChange: (e) => {
                                                                setFromDate(e.target.value);
                                                                if (toDate && e.target.value >= toDate) {
                                                                    setToDate(""); // reset invalid toDate
                                                                }
                                                            }, className: "bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "text-xs text-gray-500 mb-1", children: "Check-out" }), _jsx("input", { type: "date", value: toDate, min: fromDate ? new Date(new Date(fromDate).getTime() + 86400000).toISOString().split("T")[0] : today, onChange: (e) => setToDate(e.target.value), disabled: !fromDate, className: "bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50" })] }), _jsxs("div", { className: "flex flex-col col-span-1", children: [_jsx("label", { className: "text-xs text-gray-500 mb-1", children: "Guests" }), _jsx("input", { type: "number", min: "1", value: guests.adults, onChange: (e) => setGuests({ ...guests, adults: Number(e.target.value) }), className: "bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" })] }), _jsx("div", { className: "flex items-end", children: _jsx("button", { type: "submit", disabled: loading, className: `w-full flex items-center justify-center gap-2 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl py-2 text-sm font-semibold transition duration-200 shadow hover:shadow-lg`, children: loading ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "animate-spin h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" })] }), "Loading..."] })) : (_jsx(_Fragment, { children: "\uD83D\uDD0D Search" })) }) })] })] })] }) }), _jsx("div", { className: "w-full md:w-1/2 hidden md:flex items-center justify-center p-10 rounded-l-3xl", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsx("p", { className: "text-2xl md:text-3xl font-bold text-yellow-500 leading-snug mb-4", children: "\u201CTravel is the only thing you buy that makes you richer.\u201D" }), _jsx("p", { className: "text-sm md:text-base text-blue-600 font-medium", children: "Find the best deals, relax, and make memories that last forever." })] }) })] }), _jsx("div", { className: "w-full px-4 md:px-12 py-10 ", children: _jsx("div", { className: "max-w-7xl mx-auto", children: _jsx("div", { className: "relative", children: _jsx(PopularPlaces, {}) }) }) })] }));
};
const PopularPlaces = () => {
    return (_jsxs("div", { className: ' flex  flex-col  items-center justify-center', children: [_jsx(CustomCarousel, {}), _jsxs("div", { className: "w-[90%]", children: [_jsx(OurService, {}), _jsx(BlogSection, {})] })] }));
};
import { Card, CardContent } from "@/components/ui/card";
import BlogSection from '@/components/HomeComponents/BlogSection';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import server from '@/server/app';
import toast from 'react-hot-toast';
const popularPlaces = [
    { name: "Taj Mahal, Agra", minDays: 1, img: "/agra.webp" },
    { name: "Jaipur", minDays: 2, img: "/jaipur.jpeg" },
    { name: "Goa", minDays: 3, img: "goa.jpeg" },
    { name: "Munnar ", minDays: 4, img: "munnar.jpg" },
    { name: "Leh-Ladakh", minDays: 5, img: "/ladarkh.jpeg" },
    { name: "Varanasi", minDays: 2, img: "varnasi.jpeg" },
    { name: "Kasol", minDays: 3, img: "kasol.jpeg" },
    { name: "Mumbai", minDays: 2, img: "mumbai.jpeg" },
    { name: "Hampi", minDays: 2, img: "hampi.jpeg" },
];
function CustomCarousel() {
    return (_jsxs("div", { className: "w-[90%] mx-auto px-4 py-10", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-800 mb-6 text-center", children: "\uD83C\uDF0D Popular Places in India" }), _jsxs(Carousel, { children: [_jsx(CarouselContent, { className: "-ml-2 md:-ml-4", children: popularPlaces.map((place, index) => (_jsx(CarouselItem, { className: "pl-2 md:pl-4", style: { flex: "0 0 20%" }, children: _jsxs(Card, { className: "overflow-hidden rounded-2xl shadow-lg group hover:shadow-xl transition-shadow duration-300", children: [_jsx("div", { className: "h-40 w-full overflow-hidden", children: _jsx("img", { src: place.img, alt: place.name, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" }) }), _jsxs(CardContent, { className: "p-4 text-center bg-white", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: place.name }), _jsxs("p", { className: "text-sm text-gray-500", children: ["\u23F3 ", place.minDays, " day", place.minDays > 1 ? "s" : "", " needed"] })] })] }) }, index))) }), _jsx(CarouselPrevious, {}), _jsx(CarouselNext, {})] })] }));
}
const OurService = () => {
    const services = [
        {
            h1: "Plan Your Trip",
            p: "Craft personalized travel itineraries effortlessly with smart suggestions, best deals, and insider tips.",
            img: "/planning.avif",
        },
        {
            h1: "Meta Search Engine",
            p: "Find the best flights, stays, and experiences by comparing top travel sites in one place.",
            img: "meta.avif",
        },
        {
            h1: "Volunteer Travel",
            p: "Give back while you explore. Discover meaningful volunteer opportunities across the globe.",
            img: "/volenteer (2).jpg",
        },
        {
            h1: "Connect with Travelers",
            p: "Join a community of like-minded wanderers. Share experiences, tips, and make travel buddies.",
            img: "connect.avif",
        },
    ];
    return (_jsxs("div", { className: "w-full py-7 px-4", children: [_jsx("div", { className: "max-w-6xl mx-auto text-center mb-12", children: _jsx("p", { className: "text-gray-600 text-sm md:text-base", children: "Explore services designed to make your travel unforgettable." }) }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4", children: services.map((service, index) => (_jsxs("div", { className: "bg-white shadow-md hover:shadow-xl rounded-2xl overflow-hidden transition-all duration-300 border border-gray-100", children: [_jsxs("div", { className: "relative h-40 overflow-hidden", children: [_jsx("img", { src: service.img, alt: service.h1, className: "object-cover w-full h-full transform hover:scale-105 transition-transform duration-300" }), _jsx("div", { className: "absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent text-white px-4 py-2", children: _jsx("h3", { className: "text-lg font-semibold", children: service.h1 }) })] }), _jsx("div", { className: "p-4", children: _jsx("p", { className: "text-gray-600 text-sm", children: service.p }) })] }, index))) })] }));
};
