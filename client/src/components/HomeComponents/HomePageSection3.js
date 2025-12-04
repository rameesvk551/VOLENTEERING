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
const HomePageSection1 = () => {
    const featureData = [
        {
            imageSrc: "/landing-icon-search.png",
            title: "Find Unique Stays & Volunteer Roles",
            description: "Browse a curated list of volunteer opportunities and accommodations that let you immerse in local cultures while giving back.",
            linkText: "Explore Now",
            linkHref: "/search",
        },
        {
            imageSrc: "/banner.png.jpg",
            title: "Connect with Hosts & Organizations",
            description: "Easily connect with trusted hosts, NGOs, and eco-friendly stays that align with your values and skills.",
            linkText: "Find Hosts",
            linkHref: "/hosts",
        },
        {
            imageSrc: "/landing-icon-experience.png",
            title: "Live the Experience, Make an Impact",
            description: "Contribute to sustainable projects, learn new skills, and create unforgettable travel memories while making a real difference.",
            linkText: "Start Volunteering",
            linkHref: "/volunteer",
        },
    ];
    return (_jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: containerVariants, className: "py-24 px-6 sm:px-8 lg:px-12 xl:px-16 bg-white", children: _jsxs("div", { className: "max-w-4xl xl:max-w-6xl mx-auto", children: [_jsx(motion.h2, { variants: itemVariants, className: "text-3xl font-bold text-center mb-12 w-full sm:w-2/3 mx-auto", children: "Quickly find the experience you want using our powerful search filters!" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16", children: featureData.map((card, index) => (_jsx(motion.div, { variants: itemVariants, children: _jsx(FeatureCard, { ...card }) }, index))) })] }) }));
};
const FeatureCard = ({ imageSrc, title, description, linkText, linkHref, }) => (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "p-4 rounded-lg mb-4 flex items-center justify-center h-32 w-32 mx-auto", children: _jsx("img", { src: imageSrc, alt: title, className: "w-32 h-32 object-contain" }) }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: title }), _jsx("p", { className: "mb-4", children: description }), linkText && linkHref && (_jsx(Link, { to: linkHref, className: "inline-block border border-gray-300 rounded px-4 py-2 hover:bg-gray-100", children: linkText }))] }));
export default HomePageSection1;
