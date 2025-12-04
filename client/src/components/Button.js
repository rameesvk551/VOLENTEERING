import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Button = ({ label, styles, icon, type = "button", onClick }) => {
    return (_jsxs("button", { onClick: onClick, type: type, className: `flex items-center justify-center text-base outline-none ${styles}`, children: [label, icon && _jsx("div", { className: "ml-2", children: icon })] }));
};
export default Button;
