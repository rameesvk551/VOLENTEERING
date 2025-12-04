import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Markdown from "markdown-to-jsx";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Link } from "react-router-dom";
const Card = ({ post, index }) => {
    return (_jsxs("div", { className: `w-full flex flex-col gap-8 items-center rounded md:flex-row`, children: [_jsx(Link, { to: `/${post?.slug}/${post._id}`, className: 'w-full h-auto md:h-64 md:w-2/4 ', children: _jsx("img", { src: post?.img, alt: post?.title, className: 'object-cover w-full h-full rounded' }) }), _jsxs("div", { className: 'w-full md:w-2/4 flex flex-col gap-3', children: [_jsxs("div", { className: 'flex gap-2', children: [_jsx("span", { className: 'text-sm text-gray-600', children: new Date(post?.createdAt).toDateString() }), _jsx("span", { className: 'text-sm text-rose-600 font-semibold', children: post?.cat })] }), _jsx("h6", { className: 'text-xl 2xl:text-3xl font-semibold text-black dark:text-white', children: post?.title }), _jsx("div", { className: 'flex-1 overflow-hidden text-gray-600 dark:text-slate-500 text-sm text-justify', children: _jsx(Markdown, { options: { wrapper: "article" }, children: post?.desc?.slice(0, 250) + "..." }) }), _jsxs(Link, { to: `/${post?.slug}/${post._id}`, className: 'flex items-center gap-2 text-black dark:text-white', children: [_jsx("span", { className: 'underline', children: "Read More" }), " ", _jsx(AiOutlineArrowRight, {})] })] })] }, post?._id));
};
export default Card;
