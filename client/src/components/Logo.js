import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
const Logo = ({ type }) => {
    return (_jsx("div", { children: _jsxs(Link, { to: "/", className: `text-2xl font-semibold dark:text-white ${type ? "text-white text-4xl" : ""}`, children: ["Blog", _jsx("span", { className: `text-3xl text-rose-500 ${type ? "text-5xl font-bold" : ""}`, children: "Wave" })] }) }));
};
export default Logo;
