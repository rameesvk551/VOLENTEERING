import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Markdown from "markdown-to-jsx";
import { Link } from "react-router-dom";
import { CiLocationOn } from "react-icons/ci";
import ContactHostButton from "./ContactHostButton";
const HostCard = ({ host }) => {
    const projectNames = host?.selectedHelpTypes?.slice(0, 2);
    const extractPlace = host?.address?.display_name
        ? host.address.display_name.split(',').map(part => part.trim())
        : [];
    const country = extractPlace[extractPlace?.length - 1];
    return (_jsxs("div", { className: "w-full flex flex-col sm:flex-row gap-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm", children: [_jsx(Link, { to: `/host-details/${host._id}`, className: "w-full sm:w-1/2 h-[200px] sm:h-[200px] overflow-hidden rounded-lg", children: _jsx("img", { src: host?.images?.[0]?.url, alt: host?.title, className: "w-full h-full object-cover transition-transform duration-200 hover:scale-105" }) }), _jsxs("div", { className: "w-full sm:w-1/2 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-2 text-sm text-gray-600", children: [_jsx(CiLocationOn, { className: "text-gray-400" }), _jsx("span", { children: country }), _jsx("span", { className: "ml-auto sm:ml-0 text-rose-600 font-semibold", children: projectNames[0] })] }), _jsx("h2", { className: "text-lg sm:text-xl font-bold text-gray-800 mb-2", children: host?.heading || " Volunteer in an off‑grid community" }), _jsx("div", { className: "text-gray-600 text-sm text-justify line-clamp-3 sm:line-clamp-4 mb-4", children: _jsx(Markdown, { options: { wrapper: 'article' }, children: host?.description }) })] }), _jsx(ContactHostButton, { hostId: host?._id })] })] }, host?._id));
};
export default HostCard;
