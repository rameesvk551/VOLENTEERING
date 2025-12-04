import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Menu, X, MessageCircle, ChevronDown, Compass, Home, Map, LogOut, User, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loadHost } from "@/redux/thunks/hostTunk";
import axios from "axios";
import server from "@/server/app";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
const Navbar = () => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { hostData } = useSelector((state) => state.host);
    const { volenteerData, isAuthenticated } = useSelector((state) => state.volenteer);
    const menuItems = [
        {
            id: 1,
            icon: _jsx(Home, { className: "w-5 h-5" }),
            text: "Stay",
            route: "/hotels",
            description: "Find accommodations"
        },
        {
            id: 2,
            icon: _jsx(Compass, { className: "w-5 h-5" }),
            text: "Volunteering",
            route: "/volunteering-oppertunities",
            description: "Discover opportunities"
        },
        {
            id: 3,
            icon: _jsx(Map, { className: "w-5 h-5" }),
            text: "Plan Your Trip",
            route: "/trip-planning",
            description: "Create itineraries"
        },
    ];
    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    useEffect(() => {
        if (!hostData?.host) {
            dispatch(loadHost());
        }
    }, [dispatch, hostData?.host]);
    const handleSigninbtn = () => {
        navigate("user/login");
    };
    const goToTheMessage = () => {
        navigate(`/message`);
    };
    const goToProfile = () => {
        setShowProfileMenu(false);
        if (hostData?.host?._id) {
            navigate(`/host/profile/${hostData.host._id}`);
        }
        else if (volenteerData?.user?.role === "volunteer") {
            navigate(`/volenteer/profile/${volenteerData.user._id}`);
        }
        else {
            navigate(`/user/profile/${volenteerData?.user?._id}`);
        }
    };
    const logOutHandler = async () => {
        setShowProfileMenu(false);
        try {
            let url = "";
            if (hostData?.host?._id) {
                url = `${server}/host/logout`;
            }
            else if (volenteerData?.user) {
                url = `${server}/user/logout`;
            }
            else {
                toast.error("User type not identified");
                return;
            }
            const res = await axios.post(url, {}, { withCredentials: true });
            if (res.data.success) {
                location.reload();
                toast.success("Logged out successfully");
            }
            else {
                toast.error("Something went wrong during logout");
            }
        }
        catch {
            toast.error("Logout failed");
        }
    };
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                setShowProfileMenu(false);
            }
        };
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const userName = hostData?.host?.firstName
        ? `${hostData.host.firstName}`
        : volenteerData?.user?.firstName || "Guest";
    const userImage = hostData?.host?.profileImage || volenteerData?.user?.profileImage;
    return (_jsxs(_Fragment, { children: [_jsx("nav", { className: `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
                    : "bg-white"}`, children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex items-center justify-between h-16 lg:h-20", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => setIsOpen(true), className: "lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors", "aria-label": "Open menu", children: _jsx(Menu, { className: "w-6 h-6 text-gray-700" }) }), _jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-lg", children: "R" }) }), _jsx("span", { className: "hidden sm:block text-xl font-bold text-gradient", children: "RAIH" })] }), _jsx("nav", { className: "hidden lg:flex items-center ml-8 gap-1", children: menuItems.map((item) => (_jsxs(Link, { to: item.route, className: "flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary transition-all duration-200", children: [item.icon, _jsx("span", { className: "font-medium", children: item.text })] }, item.id))) })] }), _jsx("div", { className: "flex items-center gap-3", children: isAuthenticated || hostData ? (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: goToTheMessage, className: "relative p-2.5 rounded-full border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200", "aria-label": "Messages", children: [_jsx(MessageCircle, { className: "w-5 h-5 text-gray-600" }), _jsx("span", { className: "absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center", children: "2" })] }), _jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("button", { onClick: () => setShowProfileMenu((prev) => !prev), className: "flex items-center gap-2 p-1.5 pr-3 rounded-full border border-gray-200 hover:shadow-md transition-all duration-200", children: [_jsx("img", { src: userImage || `https://ui-avatars.com/api/?name=${userName}&background=random`, alt: userName, className: "w-8 h-8 rounded-full object-cover" }), _jsx(ChevronDown, { className: `w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}` })] }), showProfileMenu && (_jsxs("div", { className: "absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-down", children: [_jsxs("div", { className: "px-4 py-3 bg-gray-50 border-b border-gray-100", children: [_jsx("p", { className: "font-semibold text-gray-900", children: userName }), _jsx("p", { className: "text-sm text-gray-500", children: hostData?.host ? "Host Account" : "Volunteer" })] }), _jsxs("div", { className: "py-2", children: [_jsxs("button", { onClick: goToProfile, className: "w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors", children: [_jsx(User, { className: "w-5 h-5" }), _jsx("span", { children: "My Profile" })] }), _jsxs("button", { className: "w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors", children: [_jsx(Settings, { className: "w-5 h-5" }), _jsx("span", { children: "Settings" })] })] }), _jsx("div", { className: "border-t border-gray-100 py-2", children: _jsxs("button", { onClick: logOutHandler, className: "w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors", children: [_jsx(LogOut, { className: "w-5 h-5" }), _jsx("span", { children: "Log out" })] }) })] }))] })] })) : (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { variant: "ghost", onClick: () => navigate("host/login"), className: "hidden sm:flex", children: "Become a Host" }), _jsx(Button, { onClick: handleSigninbtn, children: "Sign In" })] })) })] }) }) }), _jsxs("div", { className: `fixed inset-0 z-50 lg:hidden ${isOpen ? "visible" : "invisible"}`, children: [_jsx("div", { className: `absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`, onClick: () => setIsOpen(false) }), _jsxs("div", { className: `absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`, children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-100", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2", onClick: () => setIsOpen(false), children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-lg", children: "R" }) }), _jsx("span", { className: "text-xl font-bold text-gradient", children: "RAIH" })] }), _jsx("button", { onClick: () => setIsOpen(false), className: "p-2 rounded-lg hover:bg-gray-100 transition-colors", children: _jsx(X, { className: "w-6 h-6 text-gray-500" }) })] }), _jsx("nav", { className: "p-4", children: _jsx("div", { className: "space-y-1", children: menuItems.map((item) => (_jsxs(Link, { to: item.route, onClick: () => setIsOpen(false), className: "flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary", children: item.icon }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: item.text }), _jsx("p", { className: "text-sm text-gray-500", children: item.description })] })] }, item.id))) }) }), !isAuthenticated && !hostData && (_jsx("div", { className: "absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100", children: _jsx(Button, { onClick: () => {
                                        setIsOpen(false);
                                        handleSigninbtn();
                                    }, className: "w-full", children: "Sign In" }) }))] })] }), _jsx("div", { className: "h-16 lg:h-20" })] }));
};
export default Navbar;
