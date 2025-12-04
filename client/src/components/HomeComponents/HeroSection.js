"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
const HeroSection = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("volunteering");
    const handleSearch = () => {
        if (searchQuery) {
            navigate(`/volunteering-oppertunities?search=${encodeURIComponent(searchQuery)}`);
        }
        else {
            navigate("/volunteering-oppertunities");
        }
    };
    const stats = [
        { value: "10K+", label: "Active Hosts" },
        { value: "50+", label: "Countries" },
        { value: "100K+", label: "Volunteers" },
        { value: "4.9", label: "Avg Rating" },
    ];
    return (_jsxs("section", { className: "relative min-h-[90vh] flex items-center overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0", children: [_jsx("img", { src: "/banner.png.jpg", alt: "Travel volunteering background", className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" })] }), _jsxs("div", { className: "relative z-10 container-modern w-full py-20", children: [_jsxs("div", { className: "max-w-3xl", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-6", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-green-400 animate-pulse" }), "Discover your next adventure"] }), _jsxs(motion.h1, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.1 }, className: "text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6", children: ["Travel the World.", _jsx("br", {}), _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300", children: "Make a Difference." })] }), _jsx(motion.p, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.2 }, className: "text-lg sm:text-xl text-white/80 mb-10 max-w-2xl", children: "Connect with hosts worldwide, exchange skills for accommodation, and create meaningful experiences while exploring new cultures." }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.3 }, className: "bg-white rounded-2xl p-2 shadow-2xl max-w-2xl", children: [_jsx("div", { className: "flex gap-1 mb-3 px-2 pt-2", children: [
                                            { id: "volunteering", label: "Volunteering", icon: Users },
                                            { id: "stay", label: "Stay", icon: MapPin },
                                            { id: "trip", label: "Plan Trip", icon: Calendar },
                                        ].map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                                ? "bg-primary/10 text-primary"
                                                : "text-gray-600 hover:bg-gray-100"}`, children: [_jsx(tab.icon, { className: "w-4 h-4" }), tab.label] }, tab.id))) }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 p-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(MapPin, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Where do you want to go?", className: "w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all", onKeyDown: (e) => e.key === "Enter" && handleSearch() })] }), _jsxs(Button, { onClick: handleSearch, size: "lg", className: "h-12 px-8 rounded-xl", children: [_jsx(Search, { className: "w-5 h-5 mr-2" }), "Search"] })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.4 }, className: "mt-6 flex flex-wrap items-center gap-3", children: [_jsx("span", { className: "text-white/60 text-sm", children: "Popular:" }), ["Bali", "Portugal", "Costa Rica", "Thailand", "Spain"].map((place) => (_jsx("button", { onClick: () => setSearchQuery(place), className: "px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm hover:bg-white/20 transition-colors", children: place }, place)))] })] }), _jsx(motion.div, { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.5 }, className: "absolute bottom-8 left-0 right-0 hidden lg:block", children: _jsx("div", { className: "container-modern", children: _jsx("div", { className: "bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-3xl", children: _jsx("div", { className: "grid grid-cols-4 gap-8", children: stats.map((stat, index) => (_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-3xl font-bold text-white mb-1", children: stat.value }), _jsx("p", { className: "text-white/70 text-sm", children: stat.label })] }, index))) }) }) }) })] }), _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1, delay: 1 }, className: "absolute bottom-8 left-1/2 -translate-x-1/2 lg:hidden", children: _jsx("div", { className: "w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2", children: _jsx(motion.div, { animate: { y: [0, 8, 0] }, transition: { duration: 1.5, repeat: Infinity }, className: "w-1.5 h-1.5 rounded-full bg-white" }) }) })] }));
};
export default HeroSection;
