import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faTwitter, faLinkedin, faYoutube, } from "@fortawesome/free-brands-svg-icons";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
const FooterSection = () => {
    const [openModal, setOpenModal] = useState(null);
    const closeModal = () => setOpenModal(null);
    const renderModalContent = () => {
        switch (openModal) {
            case "about":
                return (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "About Us" }), _jsx("p", { className: "text-gray-700", children: "RAIH is a platform focused on connecting travelers and hosts across the globe through meaningful experiences." })] }));
            case "contact":
                return (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Contact Us" }), _jsxs("p", { className: "text-gray-700", children: ["You can reach us at ", _jsx("a", { href: "mailto:support@raih.com", className: "text-blue-600", children: "support@raih.com" })] })] }));
            case "terms":
                return (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Terms of Service" }), _jsx("p", { className: "text-gray-700", children: "By using our platform, you agree to our terms and conditions regarding service, content, and community behavior." })] }));
            case "privacy":
                return (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Privacy Policy" }), _jsx("p", { className: "text-gray-700", children: "We respect your privacy and protect your data. We never sell your personal info." })] }));
            default:
                return null;
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx("footer", { className: "border-t border-gray-200 py-20", children: _jsxs("div", { className: "max-w-4xl mx-auto px-6 sm:px-8", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center", children: [_jsx("div", { className: "mb-4", children: _jsx("span", { className: "text-xl font-bold", children: "RAIH" }) }), _jsx("nav", { className: "mb-4", children: _jsxs("ul", { className: "flex space-x-6 text-gray-600", children: [_jsx("li", { children: _jsx("button", { onClick: () => setOpenModal("about"), className: "hover:text-black", children: "About Us" }) }), _jsx("li", { children: _jsx("button", { onClick: () => setOpenModal("contact"), className: "hover:text-black", children: "Contact Us" }) }), _jsx("li", { children: _jsx("button", { onClick: () => setOpenModal("terms"), className: "hover:text-black", children: "Terms" }) }), _jsx("li", { children: _jsx("button", { onClick: () => setOpenModal("privacy"), className: "hover:text-black", children: "Privacy" }) })] }) }), _jsx("div", { className: "flex space-x-4 mb-4", children: [
                                        { icon: faFacebook, url: "https://facebook.com/yourpage" },
                                        { icon: faInstagram, url: "https://instagram.com/yourpage" },
                                        { icon: faTwitter, url: "https://twitter.com/yourpage" },
                                        { icon: faLinkedin, url: "https://linkedin.com/in/yourpage" },
                                        { icon: faYoutube, url: "https://youtube.com/yourchannel" },
                                    ].map((item, idx) => (_jsx("a", { href: item.url, target: "_blank", rel: "noopener noreferrer", className: "hover:text-primary-600 transition-transform hover:scale-110", children: _jsx(FontAwesomeIcon, { icon: item.icon, className: "h-6 w-6" }) }, idx))) })] }), _jsxs("div", { className: "mt-8 text-center text-sm text-gray-500 flex justify-center space-x-4", children: [_jsx("span", { children: "\u00A9 Raih. All rights reserved." }), _jsx("button", { onClick: () => setOpenModal("privacy"), className: "hover:text-black", children: "Privacy Policy" }), _jsx("button", { onClick: () => setOpenModal("terms"), className: "hover:text-black", children: "Terms of Service" })] })] }) }), _jsx(Dialog, { open: !!openModal, onClose: closeModal, className: "fixed z-50 inset-0 overflow-y-auto", children: _jsxs("div", { className: "flex items-center justify-center min-h-screen px-4", children: [_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-30", onClick: closeModal }), _jsxs("div", { className: "relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-50", children: [_jsx("button", { onClick: closeModal, className: "absolute top-2 right-2 text-gray-500 hover:text-gray-800", children: _jsx(X, { size: 20 }) }), renderModalContent()] })] }) })] }));
};
export default FooterSection;
