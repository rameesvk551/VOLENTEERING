import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useMap } from "react-leaflet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import server from "@/server/app";
import axios from "axios";
import HotelCardSkeleton from "./HotelCardSkeleton";
const HotelBookingPage = () => {
    const today = new Date().toISOString().split("T")[0];
    const location = useLocation();
    const hotels = location.state?.hotels || [];
    const initaialDetails = location.state?.initaialDetails || [];
    const coordinates = hotels.map((hotel) => ({
        latitude: parseFloat(hotel.latitude),
        longitude: parseFloat(hotel.longitude),
        name: hotel.name,
        price: hotel.price,
        rating: hotel.rating,
    }));
    const centerPosition = coordinates.length
        ? [coordinates[0].latitude, coordinates[0].longitude]
        : [40.7128, -74.006];
    if (!hotels)
        return _jsx("p", { children: "No hotels found. Please search again." });
    const [filters, setFilters] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterComponentOpen, setIsFilterComponentOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        console.log("Filters changed: ", filters);
    }, [filters]);
    const starOptions = [
        { label: "2 Star", value: "2" },
        { label: "3 Star", value: "3" },
        { label: "4 Star", value: "4" },
        { label: "5 Star", value: "5" },
    ];
    const sortOptions = [
        { label: "Latest", value: "latest" },
        { label: "Newest", value: "newest" },
        { label: "Price (lowest first)", value: "price_asc" },
        { label: "Price (highest first)", value: "price_desc" },
        { label: "Property Rating (highest first)", value: "rating_high" },
        { label: "Property Rating (lowest first)", value: "rating_low" },
        { label: "Top reviewed", value: "top_reviewed" },
    ];
    const ratingOptions = [
        { label: "5 stars", value: "5" },
        { label: "4 stars & up", value: "4+" },
        { label: "3 stars & up", value: "3+" },
    ];
    const filteredProperties = hotels
        .filter((property) => {
        if (filters.length === 0)
            return true;
        // ⭐ Star Filtering via "tags" field like ["5 STARS"]
        const starFilter = starOptions
            .map((opt) => opt.value)
            .filter((val) => filters.includes(val));
        if (starFilter.length > 0 &&
            !starFilter.some((star) => property.tags.includes(`${star} STARS`))) {
            return false;
        }
        // 🌟 Rating filter (e.g., "4+" means rating >= 4)
        const ratingFilter = ratingOptions.find((opt) => filters.includes(opt.value));
        if (ratingFilter) {
            const ratingValue = parseFloat(ratingFilter.value);
            if (property.rating < ratingValue)
                return false;
        }
        return true;
    })
        .sort((a, b) => {
        const sortBy = sortOptions.find((opt) => filters.includes(opt.value))?.value;
        switch (sortBy) {
            case "price_asc":
                return a.price - b.price;
            case "price_desc":
                return b.price - a.price;
            case "rating_high":
                return b.rating - a.rating;
            case "rating_low":
                return a.rating - b.rating;
            case "top_reviewed":
                return b.reviews - a.reviews;
            default:
                return 0; // No sort or unhandled sort type
        }
    });
    const totalPages = 5;
    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-b from-blue-50 to-white relative overflow-hidden", children: [_jsx(Header, { initaialDetails: initaialDetails, isFilterComponentOpen: isFilterComponentOpen, setIsFilterComponentOpen: setIsFilterComponentOpen, filters: filters, setFilters: setFilters, setIsLoading: setIsLoading }), _jsx("div", { className: "h-[calc(100vh-80px)] mt-[70px]", children: _jsxs("div", { className: "flex h-full w-full overflow-hidden", children: [isFilterComponentOpen && (_jsx(Filters, { filters: filters, setFilters: setFilters })), !isFilterComponentOpen && (_jsx("div", { className: "hidden md:block w-1/2 h-full sticky top-[60px]", children: _jsx(MapComponent, { coordinates: coordinates, centerPosition: centerPosition }) })), _jsx("div", { className: `${isFilterComponentOpen ? "md:w-3/4" : "md:w-1/2"} w-full h-full overflow-y-auto px-4 py-2`, children: isLoading ? ([...Array(3)].map((_, i) => _jsx(HotelCardSkeleton, {}, i))) : (_jsxs("div", { className: "flex flex-col gap-2", children: [filteredProperties &&
                                        filteredProperties.map((property) => (_jsx(HotelCard, { ...property }, property.id))), _jsx("div", { className: "w-full flex justify-center items-center py-4", children: _jsxs("div", { className: "inline-flex items-center space-x-1 text-sm font-medium text-gray-700", children: [_jsx("button", { onClick: handlePrev, disabled: currentPage === 1, className: `px-3 py-1.5 rounded-md border transition ${currentPage === 1
                                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                        : "bg-white hover:bg-gray-100"}`, children: "Previous" }), Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (_jsx("button", { onClick: () => setCurrentPage(page), className: `px-3 py-1.5 rounded-md border transition ${currentPage === page
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "bg-white hover:bg-gray-100"}`, children: page }, page))), _jsx("button", { onClick: handleNext, disabled: currentPage === totalPages, className: `px-3 py-1.5 rounded-md border transition ${currentPage === totalPages
                                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                        : "bg-white hover:bg-gray-100"}`, children: "Next" })] }) })] })) })] }) })] }));
};
export default HotelBookingPage;
const Header = ({ initaialDetails, setIsFilterComponentOpen, setFilters, setIsLoading, filters, }) => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [hotels, setHotels] = useState([]);
    const [input, setInput] = useState("");
    const [guests, setGuests] = useState(1);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const navigate = useNavigate();
    const today = new Date().toISOString().split("T")[0];
    useEffect(() => {
        setFromDate(initaialDetails.fromDate);
        setToDate(initaialDetails.toDate);
        setSelectedPlace(initaialDetails.selectedPlace);
    }, [initaialDetails.fromDate, initaialDetails.toDate, initaialDetails.selectedPlace]);
    useEffect(() => {
        if (input.length < 3) {
            setSuggestions([]);
            return;
        }
        const fetchSuggestions = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${server}/host/places?input=${input}`);
                setSuggestions(response.data || []);
                setIsLoading(false);
            }
            catch (error) {
                setIsLoading(false);
                console.error("Error fetching suggestions:", error);
            }
        };
        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [input]);
    const handleSelect = (place) => {
        setInput(place.display_name);
        setSelectedPlace(place);
        setSuggestions([]);
    };
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
                navigate("/search-hotels", {
                    state: { hotels: response.data.hotels, initaialDetails },
                });
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
    const inputStyles = "bg-white border border-gray-300 rounded-2xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200 text-sm w-full";
    const buttonStyles = "bg-white border border-gray-300 rounded-2xl px-5 py-2 font-medium text-sm shadow-sm hover:bg-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200";
    const starOptions = [
        { label: "2 Star", value: "2" },
        { label: "3 Star", value: "3" },
        { label: "4 Star", value: "4" },
        { label: "5 Star", value: "5" },
    ];
    const sortOptions = [
        { label: "Latest", value: "latest" },
        { label: "Newest", value: "newest" },
        { label: "Price (lowest first)", value: "price_asc" },
        { label: "Price (highest first)", value: "price_desc" },
        { label: "Property Rating (highest first)", value: "rating_high" },
        { label: "Property Rating (lowest first)", value: "rating_low" },
        { label: "Top reviewed", value: "top_reviewed" },
    ];
    const ratingOptions = [
        { label: "5 stars", value: "5" },
        { label: "4 stars & up", value: "4+" },
        { label: "3 stars & up", value: "3+" },
    ];
    return (_jsx("div", { className: "w-full px-4 md:px-6 py-4 fixed top-0 left-0 bg-white z-50 shadow-sm", children: _jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center justify-between flex-wrap", children: [_jsxs("div", { className: "flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto items-start sm:items-center", children: [_jsx("button", { className: buttonStyles, onClick: () => setIsFilterComponentOpen((prev) => !prev), children: "Filter" }), _jsxs("div", { className: "relative w-full sm:w-64 md:w-72", children: [_jsx("input", { value: input, type: "text", onChange: (e) => setInput(e.target.value), placeholder: initaialDetails.selectedPlace.display_name, defaultValue: initaialDetails.selectedPlace.display_name, className: inputStyles }), _jsx(AiOutlineSearch, { className: "absolute right-3 top-1/2 -translate-y-1/2 text-blue-500  text-lg cursor-pointer", onClick: FetchHotels }), suggestions.length > 0 && (_jsx("ul", { className: "absolute z-50 left-0 right-0 bg-white border mt-1 rounded-md shadow max-h-60 overflow-auto text-sm", children: suggestions.map((place) => (_jsx("li", { className: "cursor-pointer px-3 py-2 hover:bg-gray-100", onClick: () => handleSelect(place), children: place.display_name }, place.place_id))) }))] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto", children: [_jsx("input", { type: "date", className: inputStyles, defaultValue: initaialDetails.fromDate, value: fromDate, min: today, onChange: (e) => {
                                        setFromDate(e.target.value);
                                        if (toDate && e.target.value >= toDate) {
                                            setToDate("");
                                        }
                                    } }), _jsx("span", { className: "text-gray-500 text-sm font-semibold self-center", children: "to" }), _jsx("input", { type: "date", className: inputStyles, defaultValue: initaialDetails.toDate, value: toDate, min: fromDate
                                        ? new Date(new Date(fromDate).getTime() + 86400000).toISOString().split("T")[0]
                                        : today, onChange: (e) => setToDate(e.target.value), disabled: !fromDate })] })] }), _jsxs("div", { className: "flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end", children: [_jsx(MyDropdown, { dropdownItems: starOptions, name: "Star", onSelect: (item) => {
                                setFilters((prev) => {
                                    const updated = prev.filter((f) => !["2", "3", "4", "5"].includes(f));
                                    return [...updated, item.value];
                                });
                            } }), _jsx(MyDropdown, { dropdownItems: ratingOptions, name: "Rating", onSelect: (item) => {
                                setFilters((prev) => {
                                    const updated = prev.filter((f) => !["3+", "4+", "5+"].includes(f));
                                    return [...updated, item.value];
                                });
                            } }), _jsx(MyDropdown, { dropdownItems: sortOptions, name: "Sort", onSelect: (item) => {
                                setFilters((prev) => {
                                    const updated = prev.filter((f) => ![
                                        "latest",
                                        "newest",
                                        "price_asc",
                                        "price_desc",
                                        "rating_high",
                                        "rating_low",
                                        "top_reviewed",
                                    ].includes(f));
                                    return [...updated, item.value];
                                });
                            } })] })] }) }));
};
const MyDropdown = ({ dropdownItems, name, onSelect, }) => {
    const [selectedItem, setSelectedItem] = useState(name);
    const handleSelect = (item) => {
        setSelectedItem(item.label); // show the label in the button
        onSelect?.(item); // pass the whole item back to parent
    };
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "outline", children: selectedItem }) }), _jsx(DropdownMenuContent, { children: dropdownItems.map((item) => (_jsx(DropdownMenuItem, { onClick: () => handleSelect(item), children: item.label }, item.value))) })] }));
};
const Filters = ({ filters, setFilters, }) => {
    const propertyTypes = [
        "Homestays",
        "Hostels",
        "Hotels",
        "Resorts",
        "Villas",
        "Farmstay",
        "Lodges",
        "Tent",
        "GustHouses",
    ];
    const propertyCounts = {
        Homestays: 12,
        Hostels: 8,
        Hotels: 23,
        villa: 29,
        Resorts: 5,
        Villas: 10,
        Farmstay: 7,
        Lodges: 3,
        GustHouses: 6,
        Tent: 7,
    };
    const facilities = [
        "Parking",
        "Wifi",
        "Spa",
        "AC",
        "Pool",
        " Restaurent",
        "Family room",
        ,
        "Room Service",
        "Kitchenette",
    ];
    const addToFilters = (type) => {
        setFilters((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
    };
    return (_jsxs("div", { className: "w-1/4 h-[90vh] px-3 pt-3 my-1 mx-1 border border-white bg-gradient-to-b from-blue-50 to-white rounded-lg shadow-md", children: [_jsx("h4", { className: "text-lg font-bold mb-2", children: "Property Type" }), _jsx("div", { className: "flex flex-wrap gap-2", children: propertyTypes.map((type, index) => (_jsxs("div", { className: `p-2 flex items-center justify-between border rounded-2xl text-[13px] bg-white ${filters.includes(type)
                        ? "ring-2 focus:ring-blue-400 focus:outline-none transition"
                        : ""} cursor-pointer hover:bg-gray-100`, onClick: () => addToFilters(type), children: [_jsx("span", { children: type }), _jsxs("span", { className: "text-gray-500 text-xs", children: ["(", propertyCounts[type] || 0, ")"] })] }, index))) }), _jsx("div", { className: "my-2", children: _jsx(PriceRangeSlider, {}) }), _jsxs("div", { className: "mt-2 mb-2 ", children: [_jsx("h4", { className: "font-bold mb-2", children: "Facilities:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: facilities.map((type, index) => (_jsxs("div", { className: `p-2 flex items-center justify-between border rounded-2xl text-[13px] bg-white ${filters.includes(type)
                                ? "ring-2 focus:ring-blue-400 focus:outline-none transition"
                                : ""} cursor-pointer hover:bg-gray-100`, onClick: () => addToFilters(type), children: [_jsx("span", { children: type }), _jsxs("span", { className: "text-gray-500 text-xs", children: ["(", propertyCounts[type] || 0, ")"] })] }, index))) })] }), _jsx("div", { className: "flex justify-center items-center py-1 px-4", children: _jsx("button", { className: "w-full max-w-sm bg-blue-600 text-white font-semibold tracking-wide py-1 rounded-xl shadow-md hover:bg-blue-700 transition duration-200 ease-in-out", children: "Apply Filters" }) })] }));
};
const PriceRangeSlider = () => {
    const [value, setValue] = useState(1000);
    return (_jsxs("div", { className: "flex flex-col items-center gap-4 w-full max-w-md mx-auto p-4", children: [_jsxs("div", { className: "text-lg font-semibold text-gray-700", children: ["Price Range: ", _jsxs("span", { className: "text-blue-500", children: ["\u20B9", value, " and up"] })] }), _jsx("input", { type: "range", min: "500", max: "10000", step: "100", value: value, onChange: (e) => setValue(Number(e.target.value)), className: "w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-400", style: {
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - 500) / 9500) * 100}%, #e5e7eb ${((value - 500) / 9500) * 100}%, #e5e7eb 100%)`,
                } }), _jsx("div", { className: "relative w-full", children: _jsxs("div", { className: "absolute top-[-10px] text-sm font-medium text-white bg-blue-500 px-3 py-1 rounded-md", style: {
                        left: `calc(${((value - 500) / 9500) * 100}% - 20px)`,
                        transition: "left 0.2s ease-in-out",
                    }, children: ["\u20B9", value] }) })] }));
};
const MapComponent = ({ coordinates, centerPosition, }) => {
    const ChangeMapView = ({ center }) => {
        const map = useMap();
        map.setView(center, 12);
        return null;
    };
    return (_jsx("div", { className: `w-1/2 h-[87vh] p-3 fixed left-0 top-[13vh] overflow-hidden z-10  `, children: _jsxs(MapContainer, { center: centerPosition, zoom: 3, style: { height: "100%", width: "100%" }, children: [_jsx(ChangeMapView, { center: centerPosition }), _jsx(TileLayer, { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), coordinates.map((loc, index) => (_jsx(Marker, { position: [loc.latitude, loc.longitude], children: _jsx(Popup, { children: _jsxs("div", { className: "text-sm text-gray-800", children: [_jsx("h3", { className: "font-semibold text-base mb-1", children: loc.name }), _jsxs("div", { className: "flex items-center gap-1 text-yellow-500 mb-1", children: ["★".repeat(Math.floor(loc.rating)), _jsxs("span", { className: "text-xs text-gray-500 ml-1", children: ["(", loc.rating, ")"] })] }), _jsxs("p", { className: "text-sm font-semibold text-blue-600", children: ["\u20B9", loc.price] })] }) }) }, index)))] }) }));
};
const HotelCard = ({ name, location, distance, rating, reviews, tags, highlights, price, images, perNightLabel = "per night for 2 guests", ctaLink, }) => {
    return (_jsx("div", { className: "flex flex-row bg-white rounded-2xl shadow-md m-4 overflow-hidden border border-gray-100 transition hover:shadow-lg duration-300", children: _jsxs("div", { className: "flex w-full", children: [_jsxs("div", { className: "w-3/4 flex gap-4 p-4", children: [_jsxs("div", { className: "w-1/3 flex flex-col gap-2", children: [_jsx("img", { src: "", alt: name, className: "w-full h-[120px] object-cover rounded-xl shadow-sm", loading: "lazy" }), _jsx("div", { className: "grid grid-cols-4 gap-1", children: images.slice(1, 4).map((img, index) => (_jsx("img", { src: img, alt: `Thumb ${index + 1}`, className: "w-full h-8 object-cover rounded-md hover:scale-105 transition-transform duration-200 border", loading: "lazy" }, index))) })] }), _jsx("div", { className: "flex flex-col justify-between text-sm", children: _jsxs("div", { children: [_jsx("h2", { className: "text-base font-semibold text-gray-800 mb-1", children: name }), _jsxs("div", { className: "flex items-center gap-1 text-yellow-500 text-sm mb-1", children: ["★".repeat(Math.floor(rating)), _jsxs("span", { className: "text-xs text-gray-500 ml-1", children: ["(", reviews, " reviews)"] })] }), _jsxs("p", { className: "text-xs text-gray-500", children: [location, " ", _jsx("span", { className: "text-gray-300", children: "|" }), " ", distance, " ", "to beach"] }), _jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: tags.map((tag, i) => (_jsx("span", { className: "text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full", children: tag }, i))) }), _jsx("ul", { className: "list-disc list-inside text-xs text-gray-600 mt-2 space-y-0.5", children: highlights.map((h, i) => (_jsx("li", { children: h }, i))) })] }) })] }), _jsxs("div", { className: "w-1/4 p-4 border-l border-gray-100 flex flex-col justify-between text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Starting from" }), _jsxs("h3", { className: "text-2xl font-bold text-gray-800", children: ["\u20B9", price] }), _jsx("p", { className: "text-xs text-gray-500", children: perNightLabel }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: "\u2714 No prepayment needed" })] }), _jsx("a", { href: ctaLink, className: "mt-4 block text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded-lg transition duration-200", children: "Go to Site" })] })] }) }));
};
