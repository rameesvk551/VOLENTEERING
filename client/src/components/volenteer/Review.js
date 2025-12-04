import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
const Review = React.memo(({ rating, comment, hostName, date }) => {
    // Generate star elements dynamically based on the rating
    const renderStars = () => {
        const filledStars = new Array(rating).fill(true);
        const emptyStars = new Array(5 - rating).fill(false);
        return (_jsxs(_Fragment, { children: [filledStars.map((_, index) => (_jsx("svg", { className: "w-5 h-5 fill-current text-yellow-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" }) }, `filled-${index}`))), emptyStars.map((_, index) => (_jsx("svg", { className: "w-5 h-5 text-gray-300", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" }) }, `empty-${index}`)))] }));
    };
    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    };
    return (_jsx("div", { className: "bg-white shadow-lg rounded-lg w-full p-6 mb-4", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "flex flex-col items-center", children: _jsx("div", { className: "flex mt-2", children: renderStars() }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-sm font-medium text-gray-700", children: ["Left To ", hostName] }), _jsx("span", { className: "text-sm text-gray-500", children: formatDate(date) })] }), _jsx("p", { className: "mt-2 text-gray-600 text-base", children: comment })] })] }) }));
});
export default Review;
