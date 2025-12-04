"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
const CallToActionSection = () => {
    return (_jsxs("div", { className: "relative py-24", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-60" }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, transition: { duration: 0.5 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, className: "relative max-w-4xl xl:max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-12", children: _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center", children: [_jsx("div", { className: "mb-6 md:mb-0 md:mr-10", children: _jsx("h2", { className: "text-2xl font-bold text-white", children: "Explore the World Like Never Before" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white mb-3", children: "Discover unique travel experiences, connect with locals, and find the perfect place to stay." }), _jsxs("div", { className: "flex justify-center md:justify-start gap-4", children: [_jsx("button", { onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }), className: "inline-block text-primary-700 bg-white rounded-lg px-6 py-3 font-semibold hover:bg-primary-500 hover:text-primary-50", children: "Start Your Journey" }), _jsx(Link, { to: "user/signup", className: "inline-block text-white bg-secondary-500 rounded-lg px-6 py-3 font-semibold hover:bg-secondary-600", children: "Join Us Now" })] })] })] }) })] }));
};
export default CallToActionSection;
