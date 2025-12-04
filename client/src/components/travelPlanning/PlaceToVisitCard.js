import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const PlaceToVisit = ({ attraction }) => {
    return (_jsxs("div", { className: "w-full max-w-sm h-48 rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex", children: [_jsx("img", { src: "/banner.png.jpg", alt: attraction.name, className: "h-full w-32 object-cover" }), _jsxs("div", { className: "flex flex-col justify-between p-4 w-full", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-base font-bold text-gray-800 line-clamp-1", children: attraction.name }), _jsx("p", { className: "text-sm text-gray-600 line-clamp-2", children: attraction.location?.formatted_address || "Location info not available" })] }), _jsx("p", { className: "text-xs text-blue-600 mt-2", children: attraction.categories?.[0] || "Category not specified" })] })] }));
};
export default PlaceToVisit;
