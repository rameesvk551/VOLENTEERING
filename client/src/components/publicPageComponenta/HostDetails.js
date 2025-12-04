import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { IoLocationSharp, } from "react-icons/io5";
import { MdOutlineVerifiedUser, MdRestore, } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { SiAmazonsimpleemailservice } from "react-icons/si";
import Divider from "../Divider";
import { useNavigate, useParams } from "react-router-dom";
import { fetchHostById } from "../../api";
import Review from "../hostDetailsPageComponents/Review";
import OverviewSection from "../hostDetailsPageComponents/OverviewSection";
import PhotosSection from "../hostDetailsPageComponents/PhotosSection";
import MapComponent from "../placeAutoCompleteAndMap/MapComponent";
import useAddReview from "@/hooks/UseAddReview";
import { useSelector } from "react-redux";
import HostDetailsScelton from "./HostDetailsScelton";
import HostDetailsErrorPage from "./HostDetailsErrorPage";
const HostDetails = () => {
    const { id } = useParams();
    const [host, setHost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(1);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const { volenteerData } = useSelector((state) => state.volenteer);
    const navigate = useNavigate();
    const calculateAverageRating = (reviews = []) => {
        if (reviews.length === 0)
            return "0.0";
        const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        return (total / reviews.length).toFixed(1);
    };
    const tabs = [
        { id: 1, label: "OVERVIEW" },
        { id: 2, label: "PHOTOS" },
        { id: 3, label: "MAP" },
        { id: 4, label: `FEEDBACK(${host?.reviews.length}) ` },
    ];
    const lastActive = host?.lastActive;
    console.log("hhhhost last active ", lastActive);
    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    };
    const goToMessage = () => {
        navigate(`/message/${id}`);
    };
    useEffect(() => {
        if (id) {
            fetchHostById(id)
                .then((data) => {
                setHost(data.host);
            })
                .catch(() => setError("Failed to fetch host details"))
                .finally(() => setLoading(false));
        }
    }, [id]);
    if (loading)
        return _jsx(HostDetailsScelton, {});
    if (error)
        return _jsx(HostDetailsErrorPage, { error: error });
    const latiitude = host.address.lat;
    const longitude = host.address.lon;
    const extractPlace = host.address.display_name.split(',').map(part => part.trim());
    const state = extractPlace[extractPlace.length - 3];
    const country = extractPlace[extractPlace.length - 1];
    return (_jsxs("div", { className: "flex flex-col bg-white", children: [_jsx("div", { className: "px-4 md:px-10 lg:px-20 py-4", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4 h-[400px]", children: [_jsx("div", { className: "md:w-1/2 h-full", children: _jsx("img", { src: host?.images?.[0]?.url, alt: host?.images?.[0]?.description, className: "w-full h-full object-cover rounded" }) }), _jsx("div", { className: "md:w-1/2 grid grid-cols-2 gap-2 h-full", children: host?.images?.slice(1, 5).map((img, i) => (_jsxs("div", { className: "relative w-full h-full", children: [_jsx("img", { src: img.url, alt: img.description, className: "w-full h-full object-cover rounded" }), _jsx("p", { className: "absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 text-xs rounded", children: img.description })] }, i))) })] }) }), _jsx(Divider, {}), _jsxs("div", { className: "px-4 md:px-10 lg:px-20 mt-8 flex flex-col lg:flex-row gap-8", children: [_jsxs("div", { className: "lg:w-2/3 space-y-4", children: [_jsxs("h1", { className: "text-lg font-bold text-[#0a3f5f] leading-relaxed", children: [host?.heading || "  Be part of our family, share, improve and leave an impact on us  for generations to come in Gerbstedt, Germany", "          "] }), _jsxs("div", { className: "flex flex-wrap justify-between text-sm text-gray-700", children: [_jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(IoLocationSharp, { size: 16 }), _jsxs("span", { children: [country, ",", state] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(MdRestore, { size: 16 }), _jsxs("span", { children: ["Last Activity: ", formatDate(host?.lastActive)] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { children: [calculateAverageRating(host?.reviews), " (", host?.reviews?.length || 0, ")"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(MdOutlineVerifiedUser, {}), "Verified Host"] })] })] }), _jsx("div", { className: "flex gap-6 border-b pt-4", children: tabs.map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab.id), className: `pb-2 text-sm font-medium ${activeTab === tab.id
                                        ? "text-crimson border-b-2 border-crimson"
                                        : "text-gray-600"}`, children: tab.label }, tab.id))) }), activeTab === 1 && _jsx(OverviewSection, { host: host }), activeTab === 2 && _jsx(PhotosSection, { images: host?.images }), activeTab === 4 && (_jsxs("div", { className: "flex flex-col items-center gap-3 mt-4", children: [host.reviews.map((review) => {
                                        return (_jsx(Review, { rating: review.rating, comment: review.comment, reviewerProfile: review.reviewerProfile, reviewerName: review.reviewerName }, review.id));
                                    }), _jsx("button", { onClick: () => setShowReviewModal(true), className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition", children: "Write a Review" })] })), activeTab === 3 && (_jsx("div", { className: "flex h-full flex-col items-center gap-3 mt-4", children: _jsx(MapComponent, { lat: latiitude, lon: longitude }) }))] }), _jsxs("div", { className: "lg:w-1/3 w-full h-full space-y-4 border border-gray-200 rounded-md p-4", children: [_jsx("button", { onClick: goToMessage, className: "w-full bg-black text-white font-semibold py-2 rounded", children: "Message" }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Profile Information" }), _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "flex items-center gap-2 text-blue-600", children: [_jsx(SiAmazonsimpleemailservice, {}), "Last replied"] }), _jsx("span", { children: "7 March 2025" })] }), _jsx(Divider, {})] })] })] })] }), showReviewModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50", children: _jsxs("div", { className: "bg-white p-6 rounded-lg w-full max-w-xl relative", children: [_jsx("button", { className: "absolute top-2 right-2 text-gray-500 hover:text-black text-lg", onClick: () => setShowReviewModal(false), children: "\u00D7" }), volenteerData?.user ? (_jsx(WriteReview, { hostId: host?._id })) : (_jsx(_Fragment, {}))] }) }))] }));
};
export default HostDetails;
const WriteReview = ({ hostId }) => {
    const addReview = useAddReview();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(null);
    const [review, setReview] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        addReview.mutate({ rating, comment: review, hostId });
    };
    return (_jsxs("div", { className: "max-w-xl w-full bg-white p-6 rounded-xl shadow-md border mt-6 mx-auto", children: [_jsx("h2", { className: "text-xl font-bold mb-4 text-gray-800", children: "Write a Review" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx("div", { className: "flex items-center gap-1", children: [1, 2, 3, 4, 5].map((star) => (_jsx(FaStar, { size: 24, className: `cursor-pointer transition-colors ${(hoveredRating ?? rating) >= star
                                ? "text-yellow-400"
                                : "text-gray-300"}`, onMouseEnter: () => setHoveredRating(star), onMouseLeave: () => setHoveredRating(null), onClick: () => setRating(star) }, star))) }), _jsx("textarea", { value: review, onChange: (e) => setReview(e.target.value), rows: 4, placeholder: "Share your experience...", className: "w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none", required: true }), _jsxs("button", { type: "submit", className: "flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition", children: [_jsx(IoMdSend, {}), "Submit Review"] })] })] }));
};
