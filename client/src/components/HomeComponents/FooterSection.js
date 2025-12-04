import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, Facebook, Instagram, Twitter, Linkedin, Youtube, Globe, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
const FooterSection = () => {
    const [openModal, setOpenModal] = useState(null);
    const closeModal = () => setOpenModal(null);
    const footerLinks = {
        explore: [
            { label: "Volunteering", href: "/volunteering-oppertunities" },
            { label: "Hosts", href: "/hosts" },
            { label: "Destinations", href: "/destinations" },
            { label: "How It Works", href: "/how-it-works" },
        ],
        host: [
            { label: "Become a Host", href: "/host/signup" },
            { label: "Host Resources", href: "/host-resources" },
            { label: "Community Guidelines", href: "/guidelines" },
            { label: "Host FAQ", href: "/host-faq" },
        ],
        company: [
            { label: "About Us", action: () => setOpenModal("about") },
            { label: "Careers", href: "/careers" },
            { label: "Press", href: "/press" },
            { label: "Contact", action: () => setOpenModal("contact") },
        ],
        support: [
            { label: "Help Center", href: "/help" },
            { label: "Safety", href: "/safety" },
            { label: "Terms", action: () => setOpenModal("terms") },
            { label: "Privacy", action: () => setOpenModal("privacy") },
        ],
    };
    const socialLinks = [
        { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
        { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
        { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
        { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
        { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
    ];
    const renderModalContent = () => {
        switch (openModal) {
            case "about":
                return (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "About RAIH" }), _jsx("p", { className: "text-gray-600 mb-4", children: "RAIH is a global platform connecting travelers with hosts around the world through meaningful cultural exchanges." }), _jsx("p", { className: "text-gray-600", children: "Our mission is to make travel more accessible, sustainable, and enriching for everyone." })] }));
            case "contact":
                return (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Contact Us" }), _jsxs("div", { className: "space-y-4 text-gray-600", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Mail, { className: "w-5 h-5 text-primary" }), _jsx("a", { href: "mailto:support@raih.com", className: "text-primary hover:underline", children: "support@raih.com" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(MapPin, { className: "w-5 h-5 text-primary" }), _jsx("span", { children: "Global Operations" })] })] })] }));
            case "terms":
                return (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Terms of Service" }), _jsx("p", { className: "text-gray-600", children: "By using RAIH, you agree to our terms and conditions regarding service usage, community guidelines, and content policies. Our platform is designed to foster respectful cultural exchanges." })] }));
            case "privacy":
                return (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Privacy Policy" }), _jsx("p", { className: "text-gray-600", children: "We respect your privacy and are committed to protecting your personal data. We never sell your information to third parties and only collect data necessary for providing our services." })] }));
            default:
                return null;
        }
    };
    return (_jsxs(_Fragment, { children: [_jsxs("footer", { className: "bg-gray-900 text-white", children: [_jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16", children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-8", children: [_jsxs("div", { className: "col-span-2 md:col-span-1", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 mb-4", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-lg", children: "R" }) }), _jsx("span", { className: "text-xl font-bold", children: "RAIH" })] }), _jsx("p", { className: "text-gray-400 text-sm mb-4", children: "Connect. Travel. Experience. Make a difference around the world." }), _jsx("div", { className: "flex gap-3", children: socialLinks.map((social) => (_jsx("a", { href: social.href, target: "_blank", rel: "noopener noreferrer", className: "w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors", "aria-label": social.label, children: _jsx(social.icon, { className: "w-5 h-5" }) }, social.label))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-4", children: "Explore" }), _jsx("ul", { className: "space-y-3", children: footerLinks.explore.map((link) => (_jsx("li", { children: _jsx(Link, { to: link.href, className: "text-gray-400 hover:text-white text-sm transition-colors", children: link.label }) }, link.label))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-4", children: "Hosting" }), _jsx("ul", { className: "space-y-3", children: footerLinks.host.map((link) => (_jsx("li", { children: _jsx(Link, { to: link.href, className: "text-gray-400 hover:text-white text-sm transition-colors", children: link.label }) }, link.label))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-4", children: "Company" }), _jsx("ul", { className: "space-y-3", children: footerLinks.company.map((link) => (_jsx("li", { children: link.action ? (_jsx("button", { onClick: link.action, className: "text-gray-400 hover:text-white text-sm transition-colors", children: link.label })) : (_jsx(Link, { to: link.href, className: "text-gray-400 hover:text-white text-sm transition-colors", children: link.label })) }, link.label))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-4", children: "Support" }), _jsx("ul", { className: "space-y-3", children: footerLinks.support.map((link) => (_jsx("li", { children: link.action ? (_jsx("button", { onClick: link.action, className: "text-gray-400 hover:text-white text-sm transition-colors", children: link.label })) : (_jsx(Link, { to: link.href, className: "text-gray-400 hover:text-white text-sm transition-colors", children: link.label })) }, link.label))) })] })] }) }), _jsx("div", { className: "border-t border-gray-800", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center gap-4", children: [_jsxs("p", { className: "text-gray-400 text-sm", children: ["\u00A9 ", new Date().getFullYear(), " RAIH. All rights reserved."] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-400", children: [_jsx("button", { onClick: () => setOpenModal("privacy"), className: "hover:text-white transition-colors", children: "Privacy Policy" }), _jsx("span", { children: "\u2022" }), _jsx("button", { onClick: () => setOpenModal("terms"), className: "hover:text-white transition-colors", children: "Terms of Service" }), _jsx("span", { children: "\u2022" }), _jsxs("button", { className: "flex items-center gap-1 hover:text-white transition-colors", children: [_jsx(Globe, { className: "w-4 h-4" }), "English (US)"] })] })] }) }) })] }), _jsx(Dialog, { open: !!openModal, onClose: closeModal, className: "fixed z-50 inset-0 overflow-y-auto", children: _jsxs("div", { className: "flex items-center justify-center min-h-screen px-4", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm", onClick: closeModal }), _jsxs("div", { className: "relative bg-white rounded-2xl shadow-xl max-w-md w-full p-8 z-50 animate-scale-in", children: [_jsx("button", { onClick: closeModal, className: "absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors", children: _jsx(X, { className: "w-5 h-5 text-gray-500" }) }), renderModalContent()] })] }) })] }));
};
export default FooterSection;
