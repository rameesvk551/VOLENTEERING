import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
const Review = React.memo(({ rating, comment, reviewerProfile, reviewerName }) => {
    // Generate star elements dynamically based on the rating
    const renderStars = () => {
        const filledStars = new Array(rating).fill(true);
        const emptyStars = new Array(5 - rating).fill(false);
        return (_jsxs(_Fragment, { children: [filledStars.map((_, index) => (_jsx("svg", { className: "w-5 h-5 fill-current text-yellow-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" }) }, `filled-${index}`))), emptyStars.map((_, index) => (_jsx("svg", { className: "w-5 h-5 text-gray-300", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" }) }, `empty-${index}`)))] }));
    };
    // Format the date for when the review is left (you can change it to a dynamic value)
    const formattedDate = new Date().toLocaleDateString();
    return (_jsx("div", { className: "bg-white shadow-lg rounded-lg w-full p-6 mb-4", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("img", { src: reviewerProfile, alt: `${reviewerName}'s profile`, className: "rounded-full w-16 h-16 border-2 border-gray-300 shadow-md", loading: "lazy" }), _jsx("div", { className: "flex mt-2", children: renderStars() })] }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-sm font-medium text-gray-700", children: ["Left by ", reviewerName] }), _jsx("span", { className: "text-sm text-gray-500", children: formattedDate })] }), _jsx("p", { className: "mt-2 text-gray-600 text-base", children: comment })] })] }) }));
});
export default Review;
