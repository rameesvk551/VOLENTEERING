import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { MapPin, Star, Heart, Users } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import ContactHostButton from "./ContactHostButton";
const HostCard = ({ host }) => {
    const projectNames = host?.selectedHelpTypes?.slice(0, 2);
    const extractPlace = host?.address?.display_name
        ? host.address.display_name.split(",").map((part) => part.trim())
        : [];
    const country = extractPlace[extractPlace?.length - 1];
    const city = extractPlace[0];
    // Calculate average rating
    const avgRating = host?.reviews?.length > 0
        ? (host.reviews.reduce((sum, r) => sum + r.rating, 0) /
            host.reviews.length).toFixed(1)
        : null;
    return (_jsx("div", { className: "group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1", children: _jsxs("div", { className: "flex flex-col sm:flex-row", children: [_jsxs(Link, { to: `/host-details/${host._id}`, className: "relative w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto sm:h-auto overflow-hidden", children: [_jsx("img", { src: host?.images?.[0]?.url, alt: host?.title, className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105", loading: "lazy" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" }), _jsx("button", { className: "absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white hover:scale-110 transition-all duration-200", "aria-label": "Save to wishlist", children: _jsx(Heart, { className: "w-4 h-4 text-gray-600 hover:text-primary" }) }), projectNames?.[0] && (_jsx(Badge, { variant: "secondary", className: "absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-xs font-medium", children: projectNames[0] }))] }), _jsxs("div", { className: "flex-1 p-5 sm:p-6 flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground text-sm", children: [_jsx(MapPin, { className: "w-4 h-4" }), _jsxs("span", { className: "font-medium", children: [city && city !== country ? `${city}, ` : "", country] })] }), avgRating && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "w-4 h-4 fill-amber-400 text-amber-400" }), _jsx("span", { className: "text-sm font-semibold", children: avgRating }), _jsxs("span", { className: "text-xs text-muted-foreground", children: ["(", host?.reviews?.length, ")"] })] }))] }), _jsx(Link, { to: `/host-details/${host._id}`, children: _jsx("h3", { className: "text-lg font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors", children: host?.heading || "Volunteer in an off‑grid community" }) }), _jsxs("p", { className: "text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow", children: [host?.description?.replace(/[#*]/g, "").slice(0, 120), "..."] }), _jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [projectNames?.map((tag, index) => (_jsx(Badge, { variant: "muted", className: "text-xs", children: tag }, index))), host?.acceptedWorkawayersCount && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(Users, { className: "w-3 h-3 mr-1" }), host.acceptedWorkawayersCount, " volunteers"] }))] }), _jsxs("div", { className: "flex items-center justify-between gap-3 pt-3 border-t border-gray-100", children: [_jsx(ContactHostButton, { hostId: host?._id }), _jsx(Link, { to: `/host-details/${host._id}`, children: _jsx(Button, { variant: "ghost", size: "sm", className: "text-primary", children: "View Details \u2192" }) })] })] })] }) }));
};
export default HostCard;
