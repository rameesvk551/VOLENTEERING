import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
const Banner = () => {
    return (_jsx("section", { className: "relative h-screen flex items-center justify-center bg-cover bg-center", style: { backgroundImage: 'url(https://your-background-image.jpg)' }, children: _jsxs(motion.div, { className: "text-center text-white backdrop-blur-sm bg-black/30 p-8 rounded-xl", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1 }, children: [_jsx("h1", { className: "text-4xl md:text-6xl font-bold mb-4", children: "Rent Your Adventure Gear!" }), _jsx("p", { className: "text-xl md:text-2xl", children: "Travel Light. Explore More." })] }) }));
};
export default Banner;
