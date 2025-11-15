"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
const HeroSection = () => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState("");
    return (_jsxs("div", { className: "relative h-screen", children: [_jsx("img", { src: "../../../public/banner.png.jpg", className: "object-cover object-center h-screen w-full" }), _jsx("div", { className: "absolute inset-0 bg-black bg-opacity-60" }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, className: "absolute top-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center w-full", children: _jsxs("div", { className: "max-w-4xl mx-auto px-16 sm:px-12", children: [_jsx("h1", { className: "text-5xl font-bold text-white mb-4", children: "Start your journey to finding the perfect place to call home" }), _jsx("p", { className: "text-xl text-white mb-8", children: "Discover and book accommodations, cultural experiences, and travel gear rentals\u2014all in one place" }), _jsx("div", { className: "flex justify-center", children: _jsxs("div", { className: "relative w-full max-w-lg flex", children: [_jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search by city, neighborhood, or address", className: "w-full h-12 pl-5 pr-16 rounded-l-full border-none bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" }), _jsx("button", { className: "flex items-center justify-center h-12 w-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-r-full hover:opacity-90 transition-all", children: "\uD83D\uDD0E" })] }) })] }) })] }));
};
export default HeroSection;
