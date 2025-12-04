import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { MapPin, Share2, Calendar, Clock, Users, CheckCircle, Star, Heart, MessageCircle, } from "lucide-react";
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
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
const HostDetails = () => {
    const { id } = useParams();
    const [host, setHost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(1);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { volenteerData } = useSelector((state) => state.volenteer);
    const navigate = useNavigate();
    const calculateAverageRating = (reviews = []) => {
        if (reviews.length === 0)
            return "0.0";
        const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        return (total / reviews.length).toFixed(1);
    };
    const tabs = [
        { id: 1, label: "Overview" },
        { id: 2, label: "Photos" },
        { id: 3, label: "Location" },
        { id: 4, label: `Reviews (${host?.reviews?.length || 0})` },
    ];
    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
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
    if (error || !host)
        return _jsx(HostDetailsErrorPage, { error: error || "Host not found" });
    const latitude = host.address?.lat;
    const longitude = host.address?.lon;
    const extractPlace = host.address?.display_name?.split(",").map((part) => part.trim()) || [];
    const state = extractPlace[extractPlace.length - 3];
    const country = extractPlace[extractPlace.length - 1];
    const avgRating = calculateAverageRating(host.reviews);
    const nextImage = () => {
        if (host.images && host.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % host.images.length);
        }
    };
    const prevImage = () => {
        if (host.images && host.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + host.images.length) % host.images.length);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsx("section", { className: "relative", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[400px] md:h-[500px]", children: [_jsxs("div", { className: "md:col-span-2 md:row-span-2 relative group", children: [_jsx("img", { src: host.images?.[0]?.url, alt: host.images?.[0]?.description || "Host location", className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" })] }), host.images?.slice(1, 5).map((img, i) => (_jsxs("div", { className: "relative hidden md:block group", children: [_jsx("img", { src: img.url, alt: img.description || `Image ${i + 2}`, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" })] }, i))), host.images && host.images.length > 5 && (_jsxs("button", { onClick: () => setActiveTab(2), className: "absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm hover:bg-gray-50 transition-colors", children: ["Show all ", host.images.length, " photos"] }))] }), _jsx("div", { className: "md:hidden relative mt-4", children: _jsx("div", { className: "flex overflow-x-auto gap-2 snap-x snap-mandatory hide-scrollbar", children: host.images?.map((img, i) => (_jsx("div", { className: "shrink-0 w-3/4 snap-center", children: _jsx("img", { src: img.url, alt: img.description || `Image ${i + 1}`, className: "w-full h-48 object-cover rounded-xl" }) }, i))) }) })] }) }), _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs("div", { className: "grid lg:grid-cols-3 gap-12", children: [_jsxs("div", { className: "lg:col-span-2", children: [_jsxs("div", { className: "mb-8", children: [_jsx("div", { className: "flex flex-wrap gap-2 mb-4", children: host.selectedHelpTypes?.slice(0, 3).map((type, i) => (_jsx(Badge, { variant: "secondary", children: type }, i))) }), _jsx("h1", { className: "text-2xl md:text-3xl font-bold text-gray-900 mb-4", children: host.heading || "Volunteer with us and create lasting memories" }), _jsxs("div", { className: "flex flex-wrap items-center gap-4 text-gray-600", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(MapPin, { className: "w-4 h-4" }), _jsxs("span", { children: [country, state && `, ${state}`] })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(Star, { className: "w-4 h-4 fill-amber-400 text-amber-400" }), _jsx("span", { className: "font-medium", children: avgRating }), _jsxs("span", { className: "text-gray-400", children: ["(", host.reviews?.length || 0, " reviews)"] })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(Clock, { className: "w-4 h-4" }), _jsxs("span", { children: ["Last active: ", formatDate(host.lastActive)] })] }), _jsxs(Badge, { variant: "success", className: "flex items-center gap-1", children: [_jsx(CheckCircle, { className: "w-3 h-3" }), "Verified Host"] })] })] }), _jsx("div", { className: "border-b border-gray-200 mb-8", children: _jsx("nav", { className: "flex gap-8", children: tabs.map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `relative py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                                ? "text-primary"
                                                : "text-gray-500 hover:text-gray-700"}`, children: [tab.label, activeTab === tab.id && (_jsx("span", { className: "absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" }))] }, tab.id))) }) }), _jsxs("div", { className: "min-h-[400px]", children: [activeTab === 1 && _jsx(OverviewSection, { host: host }), activeTab === 2 && _jsx(PhotosSection, { images: host.images }), activeTab === 3 && (_jsx("div", { className: "h-[400px] rounded-xl overflow-hidden", children: _jsx(MapComponent, { lat: latitude, lon: longitude }) })), activeTab === 4 && (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-gray-50 rounded-2xl p-6 mb-8", children: _jsx("div", { className: "flex items-center gap-4", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-4xl font-bold text-gray-900", children: avgRating }), _jsx("div", { className: "flex gap-0.5 mt-1", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: `w-4 h-4 ${star <= Math.round(parseFloat(avgRating))
                                                                            ? "fill-amber-400 text-amber-400"
                                                                            : "text-gray-300"}` }, star))) }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [host.reviews?.length || 0, " reviews"] })] }) }) }), host.reviews?.map((review) => (_jsx(Review, { rating: review.rating, comment: review.comment, reviewerProfile: review.reviewerProfile, reviewerName: review.reviewerName }, review.id))), volenteerData?.user && (_jsx(Button, { onClick: () => setShowReviewModal(true), className: "mt-6", children: "Write a Review" }))] }))] })] }), _jsx("div", { className: "lg:col-span-1", children: _jsx("div", { className: "sticky top-24", children: _jsxs("div", { className: "bg-white rounded-2xl border border-gray-200 shadow-card p-6", children: [_jsxs("div", { className: "flex items-center gap-4 mb-6 pb-6 border-b border-gray-100", children: [_jsx("img", { src: host.profileImage || `https://ui-avatars.com/api/?name=${host.firstName || "Host"}&background=random`, alt: host.firstName, className: "w-16 h-16 rounded-full object-cover" }), _jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-gray-900", children: [host.firstName, " ", host.lastName] }), _jsx("p", { className: "text-sm text-gray-500", children: "Host since 2023" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { className: "text-center p-3 bg-gray-50 rounded-xl", children: [_jsx(Users, { className: "w-5 h-5 mx-auto mb-1 text-gray-600" }), _jsx("p", { className: "text-sm font-medium text-gray-900", children: host.acceptedWorkawayersCount || "1-2" }), _jsx("p", { className: "text-xs text-gray-500", children: "Volunteers" })] }), _jsxs("div", { className: "text-center p-3 bg-gray-50 rounded-xl", children: [_jsx(Calendar, { className: "w-5 h-5 mx-auto mb-1 text-gray-600" }), _jsx("p", { className: "text-sm font-medium text-gray-900", children: host.minimumStay || "2 weeks" }), _jsx("p", { className: "text-xs text-gray-500", children: "Min. Stay" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs(Button, { onClick: goToMessage, className: "w-full", size: "lg", children: [_jsx(MessageCircle, { className: "w-4 h-4 mr-2" }), "Contact Host"] }), _jsxs(Button, { variant: "outline", className: "w-full", size: "lg", children: [_jsx(Heart, { className: "w-4 h-4 mr-2" }), "Save to Wishlist"] }), _jsxs(Button, { variant: "ghost", className: "w-full", size: "lg", children: [_jsx(Share2, { className: "w-4 h-4 mr-2" }), "Share"] })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-gray-100", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Response rate" }), _jsx("span", { className: "font-medium text-gray-900", children: "95%" })] }), _jsxs("div", { className: "flex items-center justify-between text-sm mt-2", children: [_jsx("span", { className: "text-gray-600", children: "Response time" }), _jsx("span", { className: "font-medium text-gray-900", children: "Within a day" })] })] })] }) }) })] }) }), _jsx("div", { className: "lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Contact" }), _jsx("p", { className: "font-semibold text-gray-900", children: host.firstName })] }), _jsxs(Button, { onClick: goToMessage, size: "lg", children: [_jsx(MessageCircle, { className: "w-4 h-4 mr-2" }), "Message"] })] }) }), showReviewModal && (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/50", onClick: () => setShowReviewModal(false) }), _jsxs("div", { className: "relative bg-white rounded-2xl w-full max-w-xl p-6 animate-scale-in", children: [_jsx("button", { className: "absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors", onClick: () => setShowReviewModal(false), children: "\u2715" }), volenteerData?.user ? (_jsx(WriteReview, { hostId: host._id, onClose: () => setShowReviewModal(false) })) : (_jsx("p", { className: "text-center text-gray-600 py-8", children: "Please log in to write a review." }))] })] }))] }));
};
export default HostDetails;
const WriteReview = ({ hostId, onClose }) => {
    const addReview = useAddReview();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(null);
    const [review, setReview] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        addReview.mutate({ rating, comment: review, hostId });
        onClose();
    };
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Write a Review" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Your Rating" }), _jsx("div", { className: "flex items-center gap-1", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", className: "p-1 transition-transform hover:scale-110", onMouseEnter: () => setHoveredRating(star), onMouseLeave: () => setHoveredRating(null), onClick: () => setRating(star), children: _jsx(Star, { className: `w-8 h-8 transition-colors ${(hoveredRating ?? rating) >= star
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-gray-300"}` }) }, star))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Your Experience" }), _jsx("textarea", { value: review, onChange: (e) => setReview(e.target.value), rows: 4, placeholder: "Share your experience with this host...", className: "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none", required: true })] }), _jsx(Button, { type: "submit", className: "w-full", size: "lg", loading: addReview.isPending, children: "Submit Review" })] })] }));
};
