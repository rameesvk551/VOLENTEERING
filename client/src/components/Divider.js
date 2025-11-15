import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Divider = ({ label }) => {
    return (_jsxs("div", { className: "flex items-center mt-4", children: [_jsx("div", { className: "flex-1 border-t border-gray-300 dark:border-gray-500" }), label && _jsx("div", { className: "mx-4 text-gray-400 text-sm", children: label }), _jsx("div", { className: "flex-1 border-t border-gray-300 dark:border-gray-500" })] }));
};
export default Divider;
