import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { CiMenuKebab } from 'react-icons/ci';
const DropDown = () => {
    const [dropDownOpen, setDropDownOpen] = useState();
    const trigger = useRef(null);
    const DropDown = useRef(null);
    useEffect(() => {
        const clickHandler = (event) => {
            if (!DropDown.current || !trigger.current)
                return;
            if (DropDown.current.contains(event.target) ||
                trigger.current.contains(event.target)) {
                return;
            }
            setDropDownOpen(false);
        };
        document.addEventListener("click", clickHandler);
        return () => document.removeEventListener("click", clickHandler);
    }, []);
    useEffect(() => {
        const keyHandler = (event) => {
            if (!dropDownOpen || event.key !== "Escape")
                return;
            setDropDownOpen(false);
        };
        document.addEventListener("keydown", keyHandler);
        return () => document.removeEventListener("keydown", keyHandler);
    }, [dropDownOpen]);
    return (_jsxs("div", { className: 'relative flex', children: [_jsx("button", { className: 'text-[#98A6AD] hover:text-gray-200', ref: trigger, onClick: () => setDropDownOpen((prev) => !prev), children: _jsx(CiMenuKebab, { size: 24 }) }), _jsxs("div", { className: `absolute right-0 top-full z-40 w-40 space-y-1 rounded-sm border-gray-600 bg-white p-1.5 shadow-default ${dropDownOpen === true ? "block" : "hidden"}`, ref: DropDown, onFocus: () => setDropDownOpen(true), onBlur: () => setDropDownOpen(false), children: [_jsx("button", { className: "flex  w-full items-center gap-2 rounded-sm px-4 py-1.5 text-left text-sm hover:bg-gray-100", children: "Archived Messages" }), _jsx("button", { className: "flex  w-full items-center gap-2 rounded-sm px-4 py-1.5 text-left text-sm hover:bg-gray-100", children: "UnAnswered" })] })] }));
};
export default DropDown;
