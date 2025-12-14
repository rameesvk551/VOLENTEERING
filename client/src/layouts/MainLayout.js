import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import FooterSection from '@/components/HomeComponents/FooterSection';
const MainLayout = () => {
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsxs("main", { children: [_jsx(Outlet, {}), " ", _jsx(FooterSection, {})] })] }));
};
export default MainLayout;
