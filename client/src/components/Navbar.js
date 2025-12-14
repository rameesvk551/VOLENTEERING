import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaTimes, FaEnvelope } from "react-icons/fa";
import { MdHotel } from "react-icons/md";
import { FaTaxi } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BiMessageMinus } from "react-icons/bi";
import { loadHost } from "@/redux/thunks/hostTunk";
import { useDispatch } from "react-redux";
import axios from "axios";
import server from "@/server/app";
import toast from "react-hot-toast";
const Navbar = () => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const menuItems = [
        { id: 2, icon: _jsx(MdHotel, { size: 22, className: "text-black" }), text: "Stay", route: "/hotels" },
        { id: 3, icon: _jsx(FaEnvelope, { size: 22, className: "text-black" }), text: "Volunteering", route: "/volunteering-oppertunities" },
        { id: 4, icon: _jsx(FaTaxi, { size: 22, className: "text-black" }), text: "Plan Your Trip", route: "/trip-planning" },
    ];
    const dispatch = useDispatch();
    const { hostData, loading, error } = useSelector((state) => state.host);
    useEffect(() => {
        if (!hostData?.host) {
            dispatch(loadHost());
            console.log("host data fetching...");
        }
    }, [dispatch, hostData?.host]);
    const handleSigninbtn = () => {
        navigate("user/login");
    };
    const { volenteerData, isAuthenticated } = useSelector((state) => state.volenteer);
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
            let url = '';
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
        catch (error) {
            toast.error("Logout failed");
        }
    };
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                setShowFavorites(false);
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
    return (_jsxs("div", { children: [_jsxs("div", { className: "h-20 w-full bg-gradient-to-b from-blue-100 to-blue-50 shadow-md py-3 px-6 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(GiHamburgerMenu, { size: 30, className: "cursor-pointer text-gray-700 hover:text-gray-900 transition", onClick: () => setIsOpen(true) }), _jsx(Link, { to: "/", children: _jsx("h5", { className: "text-3xl font-bold tracking-widest text-gray-900 uppercase cursor-default", children: _jsx("span", { className: "bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text", children: "RAIH" }) }) })] }), _jsx("div", { className: "flex items-center gap-4 relative", children: isAuthenticated || hostData ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: goToTheMessage, className: "flex items-center justify-center p-2 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-md", children: _jsx(BiMessageMinus, { size: 20 }) }), _jsxs("div", { className: "relative", children: [_jsx("img", { src: hostData?.host?.profileImage
                                                ? `${hostData.host.profileImage} (Host)`
                                                : volenteerData?.user?.profileImage, alt: "Profile", className: "w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition-all", onClick: () => setShowProfileMenu((prev) => !prev) }), showProfileMenu && (_jsxs("div", { ref: dropdownRef, className: "absolute right-0 top-12 w-60 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden transition-all duration-300 transform scale-100 opacity-100", children: [_jsx("div", { className: "px-5 py-4 text-gray-800 font-semibold text-center bg-gray-100", children: hostData?.host?.firstName
                                                        ? `${hostData.host.firstName} (Host)`
                                                        : volenteerData?.user?.firstName || "Guest" }), _jsx("hr", {}), _jsx("button", { className: "w-full text-left px-5 py-3 text-gray-700 hover:bg-gray-100 transition-all", onClick: goToProfile, children: "Profile" }), _jsx("button", { className: "w-full text-left px-5 py-3 text-red-500 hover:bg-gray-100 transition-all", onClick: logOutHandler, children: "Logout" })] }))] })] })) : (_jsx("button", { className: "px-6 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-md ", onClick: handleSigninbtn, children: "Sign In" })) })] }), _jsxs("div", { className: `fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-100 to-blue-50 shadow-lg rounded-r-2xl transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out z-50`, children: [_jsx("div", { className: "p-4 flex justify-end", children: _jsx(FaTimes, { size: 24, className: "cursor-pointer text-gray-600 hover:text-gray-900", onClick: () => setIsOpen(false) }) }), _jsx("ul", { className: "px-6 py-4 text-gray-700 space-y-4", children: menuItems.map((item) => (_jsx("li", { className: "flex items-center gap-3 cursor-pointer px-4 py-2 rounded-md hover:bg-gray-100 transition", onClick: () => setIsOpen(false), children: _jsxs(Link, { to: item.route, className: "flex items-center gap-3 w-full", children: [_jsx("span", { className: "text-black font-bold", children: item.icon }), item.text] }) }, item.id))) })] })] }));
};
export default Navbar;
