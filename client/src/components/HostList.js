import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHosts } from "../api";
import HostCard from "./HostCard";
import { CATEGORIES, posts } from "../utils/dummyData";
import { Link } from "react-router-dom";
import Divider from "./Divider";
const HostList = () => {
    const [page, setPage] = useState(1);
    const { data, isLoading, error } = useQuery({
        queryKey: ["hosts", page],
        queryFn: () => fetchHosts(page),
        staleTime: 300000,
    });
    if (isLoading)
        return _jsx("p", { children: "Loading hosts..." });
    if (error)
        return _jsx("p", { children: "Error fetching hosts!" });
    return (_jsxs("div", { className: "py-10 2xl:py-5", children: [_jsxs("div", { className: "px-4 sm:px-6 md:px-10 lg:pl-10 2xl:px-20", children: [_jsxs("div", { className: "bg-[#fafafa]", children: [_jsx(Divider, {}), _jsxs("div", { className: "mt-6 md:mt-0", children: [_jsx("p", { className: "text-2xl font-semibold text-gray-600 dark:text-white", children: "Popular Categories" }), _jsx("div", { className: "w-full flex flex-wrap py-10 gap-4 sm:gap-6 md:gap-8", children: CATEGORIES.map((cat) => (_jsxs(Link, { to: `/category?cat=${cat?.label}`, className: "flex items-center justify-center gap-3 bg-white text-black font-semibold text-base px-4 py-2 rounded cursor-pointer shadow-sm", children: [cat?.icon && _jsx(cat.icon, {}), _jsx("span", { children: cat.label })] }, cat.label))) })] })] }), _jsxs("div", { className: "w-full flex flex-col md:flex-row gap-10 2xl:gap-20 pt-5", children: [_jsx("div", { className: "w-full md:w-2/3 flex flex-col gap-10", children: data?.hosts.map((host) => (_jsx(HostCard, { host: host }, host._id))) }), _jsx("div", { className: "w-full md:w-1/3 flex flex-col gap-8", children: posts &&
                                    posts.map((post) => (_jsxs("div", { className: "flex flex-col sm:flex-row md:flex-col border border-black rounded overflow-hidden", children: [_jsx(Link, { to: `/${post?.slug}/${post._id}`, className: "w-full sm:w-1/2 md:w-full", children: _jsx("img", { src: post?.img, alt: post?.title, className: "w-full h-auto object-cover rounded" }) }), _jsx("div", { className: "p-4 flex flex-col justify-center w-full sm:w-1/2 md:w-full", children: _jsx("h6", { className: "text-xl 2xl:text-2xl font-semibold text-black dark:text-white", children: post?.title }) })] }, post._id))) })] })] }), _jsxs("div", { className: "flex justify-center mt-10 gap-3", children: [_jsx("button", { disabled: page === 1, onClick: () => setPage(page - 1), className: "px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed", children: "Previous" }), _jsx("button", { onClick: () => setPage(page + 1), className: "px-4 py-2 bg-gray-200 rounded", children: "Next" })] })] }));
};
export default HostList;
