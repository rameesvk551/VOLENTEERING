import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
const TravelFeed = () => {
    const posts = [
        {
            id: 1,
            image: "/travel1.jpg",
            title: "Exploring the Alps",
            description: "A breathtaking experience in the Swiss Alps.",
            user: "Alice Johnson",
            userImage: "/user1.jpg",
        },
        {
            id: 2,
            image: "/travel2.jpg",
            title: "Beachside Bliss",
            description: "Relaxing by the shores of Bali.",
            user: "David Smith",
            userImage: "/user2.jpg",
        },
        {
            id: 3,
            image: "/travel3.jpg",
            title: "Desert Adventure",
            description: "Riding camels under the Moroccan sun.",
            user: "Sarah Lee",
            userImage: "/user3.jpg",
        },
        {
            id: 4,
            image: "/travel4.jpg",
            title: "Night Lights in Tokyo",
            description: "Experiencing the vibrant city life of Japan.",
            user: "James Carter",
            userImage: "/user4.jpg",
        },
        {
            id: 5,
            image: "/travel5.jpg",
            title: "Jungle Trekking",
            description: "Wild adventures in the Amazon rainforest.",
            user: "Emily Brown",
            userImage: "/user5.jpg",
        },
    ];
    return (_jsxs("div", { className: "max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "col-span-1 md:col-span-1 relative rounded-lg overflow-hidden shadow-lg", children: [_jsx("img", { src: posts[0].image, alt: posts[0].title, className: "w-full h-[500px] object-cover" }), _jsxs("div", { className: "absolute bottom-0 bg-black/50 text-white p-6 w-full", children: [_jsx("h2", { className: "text-2xl font-bold", children: posts[0].title }), _jsx("p", { className: "text-sm", children: posts[0].description }), _jsxs("div", { className: "flex items-center mt-4", children: [_jsx("img", { src: posts[0].userImage, alt: posts[0].user, className: "w-10 h-10 rounded-full mr-3" }), _jsx("span", { className: "text-sm", children: posts[0].user })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: posts.slice(1).map((post) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: post.id * 0.1 }, className: "relative rounded-lg overflow-hidden shadow-lg", children: [_jsx("img", { src: post.image, alt: post.title, className: "w-full h-64 object-cover" }), _jsxs("div", { className: "absolute bottom-0 bg-black/50 text-white p-4 w-full", children: [_jsx("h3", { className: "text-lg font-semibold", children: post.title }), _jsx("p", { className: "text-sm", children: post.description }), _jsxs("div", { className: "flex items-center mt-2", children: [_jsx("img", { src: post.userImage, alt: post.user, className: "w-8 h-8 rounded-full mr-2" }), _jsx("span", { className: "text-sm", children: post.user })] })] })] }, post.id))) })] }));
};
export default TravelFeed;
