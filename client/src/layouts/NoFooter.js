import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Navbar from '@/components/Navbar';
import { Outlet } from 'react-router-dom';
const NoFooter = () => {
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsxs("main", { children: [_jsx(Outlet, {}), " "] })] }));
};
export default NoFooter;
