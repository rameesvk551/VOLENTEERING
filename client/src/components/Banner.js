import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Markdown from "markdown-to-jsx";
import { Link } from "react-router-dom";
const Banner = ({ post }) => {
    return (_jsx("div", { className: 'w-full mb-10', children: _jsxs("div", { className: 'relative w-full h-[500px] 2xl:h-[600px] flex  px-0 lg:px-20', children: [_jsx(Link, { to: `/${post.slug}/${post._id}`, className: 'w-full ', children: _jsx("img", { src: post.img, alt: 'Banner', className: 'w-full md:w-3/4 h-64 md:h-[420px] 2xl:h-[560px] rounded' }) }), _jsxs("div", { className: 'absolute flex flex-col md:right-10 bottom-10 md:bottom-2 w-full md:w-2/4 lg:w-1/3 2xl:w-[480px] bg-white dark:bg-[#05132b] shadow-2xl p-5 rounded-lg gap-3', children: [_jsx(Link, { to: `/${post.slug}/${post._id}`, children: _jsx("h1", { className: 'font-semibold text-2xl text-black dark:text-white', children: post.title.slice(0, 60) + "..." }) }), _jsx("div", { className: 'flex-1 overflow-hidden text-gray-600 dark:text-slate-500 text-sm text-justify', children: _jsx(Markdown, { options: { wrapper: "article" }, children: post.desc.slice(0, 160) + "..." }) }), _jsx(Link, { to: `/${post.slug}/${post._id}`, className: 'w-fit bg-rose-600 bg-opacity-20 text-rose-700 px-4 py-1 rounded-full text-sm cursor-pointer ', children: "Read more..." })] })] }) }));
};
export default Banner;
