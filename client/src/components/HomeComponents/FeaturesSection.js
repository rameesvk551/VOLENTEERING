"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            staggerChildren: 0.2,
        },
    },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};
const FeaturesSection = () => {
    const featureData = [
        {
            imageSrc: "/host.jpg",
            title: "🔥 Host Extraordinary Stays & Experiences",
            description: "Welcome travelers, volunteers into your home or community. Become a host and create unforgettable moments for guests from around the world.",
            linkText: "Start Hosting",
            linkHref: "/host/signup",
        },
        {
            imageSrc: "/search.jpg",
            title: " Effortless Travel Planning in One Place",
            description: "Find everything you need for a seamless journey—hotels, flights, volunteering opportunities, cab rentals, and more—all in one platform.",
            linkText: "Explore Now",
            linkHref: "/trip-planning",
        },
        {
            imageSrc: "/volenteer (2).jpg",
            title: "Live the Experience, Make an Impact",
            description: "Contribute to sustainable projects, learn new skills, and create unforgettable travel memories while making a real difference.",
            linkText: "Start Volunteering",
            linkHref: "/user/signup",
        },
    ];
    return (_jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: containerVariants, className: "py-24 px-6 sm:px-8 lg:px-12 xl:px-16 bg-white", children: _jsxs("div", { className: "max-w-4xl xl:max-w-6xl mx-auto", children: [_jsx(motion.h2, { variants: itemVariants, className: "text-3xl font-bold text-center mb-12 w-full sm:w-2/3 mx-auto", children: "Compare options, book with ease, and experience stress-free travel like never before" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16", children: featureData.map((card, index) => (_jsx(motion.div, { variants: itemVariants, children: _jsx(FeatureCard, { ...card }) }, index))) })] }) }));
};
const FeatureCard = ({ imageSrc, title, description, linkText, linkHref, }) => (_jsxs("div", { className: "relative bg-white shadow-lg rounded-2xl overflow-hidden transform transition duration-300 hover:scale-105", children: [_jsxs("div", { className: "relative w-full h-56", children: [_jsx("img", { src: imageSrc, alt: title, className: "w-full h-full object-cover", loading: "lazy" }), _jsx("div", { className: "absolute inset-0 bg-black bg-opacity-40 flex justify-center items-center", children: _jsx("h3", { className: "text-white text-xl font-semibold px-4 text-center", children: title }) })] }), _jsxs("div", { className: "p-6 text-center", children: [_jsx("p", { className: "text-gray-600 text-base", children: description }), linkText && linkHref && (_jsx(Link, { to: linkHref, className: "mt-4 inline-block bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-700 transition duration-300", children: linkText }))] })] }));
export default FeaturesSection;
