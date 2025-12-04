import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};
const DiscoverSection = () => {
    const cards = [
        {
            imageSrc: "/rent.jpg",
            title: "🎭 Cultural Immersion",
            description: "Engage in authentic local activities, workshops, and guided tours designed to offer a deeper connection to the destination.",
        },
        {
            imageSrc: "rent.jpg", // Add thi
            title: "🗺️ Tailored Adventures",
            description: "Find customized tours and off-the-beaten-path experiences curated to match your travel style.",
        },
        {
            imageSrc: "../../../public/rent.jpg", // Add this
            title: "🎒 Smart Gear Rentals",
            description: "Travel light by renting high-quality travel gear, outdoor equipment, and essentials at your destination.",
        },
    ];
    return (_jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, amount: 0.8 }, variants: containerVariants, className: "py-12 bg-white mb-16", children: _jsxs("div", { className: "max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16", children: [_jsxs(motion.div, { variants: itemVariants, className: "my-12 text-center", children: [_jsx("h2", { className: "text-3xl font-semibold leading-tight text-gray-800", children: "Mission" }), _jsx("p", { className: "mt-4 text-lg text-gray-600", children: "Discover, plan, and embark on unforgettable journeys." }), _jsx("p", { className: "mt-2 text-gray-500 max-w-3xl mx-auto", children: "Our goal is to make travel seamless, meaningful, and accessible for everyone. Whether you\u2019re searching for adventure, cultural immersion, or a way to give back, we\u2019ve got you covered." })] }), _jsx("div", { className: "w-full grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16 text-center", children: cards.map((card, index) => {
                        console.log(`Rendering card ${index + 1}:`, card); // Debugging
                        return (_jsx(motion.div, { variants: itemVariants, className: "w-full block", children: _jsx(DiscoverCard, { ...card }) }, index));
                    }) })] }) }));
};
const DiscoverCard = ({ imageSrc, title, description, }) => (_jsxs("div", { className: " shadow-lg rounded-lg bg-primary-50 md:h-83 ", children: [_jsx("img", { src: imageSrc, width: 30, height: 30, className: "w-full h-58", alt: title }), _jsx("div", { className: "bg-primary-700 p-[0.6rem] rounded-full mb-4 h-10 w-10 mx-auto" }), _jsx("h3", { className: "mt-4 text-xl font-medium text-gray-800", children: title }), _jsx("p", { className: "mt-2 text-base text-gray-500", children: description })] }));
export default DiscoverSection;
