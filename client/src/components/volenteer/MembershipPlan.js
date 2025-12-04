import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Check, Sparkles, Heart, Gift, ArrowRight } from "lucide-react";
import axios from "axios";
import server from "../../server/app";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
// Razorpay Key from Vite Environment Variable
const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
const MembershipPlans = () => {
    const navigate = useNavigate();
    const { volenteerData } = useSelector((state) => state.volenteer);
    const userId = volenteerData?.user?._id;
    const handlePayment = async (amount) => {
        if (!window.Razorpay) {
            alert("Razorpay SDK is not loaded. Please check your internet connection.");
            return;
        }
        try {
            const { data } = await axios.post(`${server}/payment/create-order`, { amount, currency: "INR" });
            const options = {
                key: razorpayKey,
                amount: data.amount,
                currency: data.currency,
                order_id: data.id,
                name: "RAIH Travel",
                description: "Volunteer Travel Membership",
                handler: async (response) => {
                    try {
                        const verification = await axios.post(`${server}/payment/verify-payment`, response, { withCredentials: true });
                        if (verification.data.success) {
                            toast.success("🎉 Payment successful!");
                            navigate(`/volenteer/profile/${userId}`);
                        }
                        else {
                            toast.error("Payment verification failed.");
                        }
                    }
                    catch {
                        toast.error("Payment verification failed.");
                    }
                },
                prefill: {
                    name: volenteerData?.user?.firstName || "Guest",
                    email: volenteerData?.user?.email || "",
                    contact: "",
                },
                theme: { color: "#FF5A5F" },
            };
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        }
        catch {
            toast.error("Failed to initiate payment.");
        }
    };
    const plans = [
        {
            id: "solo",
            name: "Solo Explorer",
            icon: Sparkles,
            iconColor: "text-primary",
            description: "Perfect for independent travelers seeking unique experiences",
            price: 500,
            period: "year",
            popular: false,
            features: [
                "Access to verified hosts worldwide",
                "Community support & forums",
                "Host reviews & ratings",
                "Basic trip planning tools",
                "Email support",
            ],
        },
        {
            id: "couple",
            name: "Couple Adventure",
            icon: Heart,
            iconColor: "text-rose-500",
            description: "Ideal for couples traveling together on meaningful journeys",
            price: 700,
            period: "year",
            popular: true,
            features: [
                "Everything in Solo Explorer",
                "Shared accommodation preferences",
                "Partner volunteering matching",
                "Priority host responses",
                "Advanced filtering options",
                "Priority email support",
            ],
        },
        {
            id: "gift",
            name: "Gift a Journey",
            icon: Gift,
            iconColor: "text-emerald-500",
            description: "Give the gift of adventure and meaningful travel experiences",
            price: 1000,
            period: "year",
            popular: false,
            features: [
                "Everything in Couple Adventure",
                "Fully transferable membership",
                "Valid for 12 months",
                "Personalized gift message",
                "Priority support 24/7",
                "Exclusive host experiences",
            ],
        },
    ];
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx(Badge, { variant: "primary", className: "mb-4", children: "Membership Plans" }), _jsx("h1", { className: "text-4xl md:text-5xl font-bold text-gray-900 mb-4", children: "Choose Your Journey" }), _jsx("p", { className: "text-xl text-gray-600 max-w-2xl mx-auto", children: "Join thousands of travelers exchanging skills for experiences around the world" })] }), _jsx("div", { className: "grid md:grid-cols-3 gap-8", children: plans.map((plan) => {
                        const IconComponent = plan.icon;
                        return (_jsxs("div", { className: `relative bg-white rounded-3xl p-8 transition-all duration-300 hover:shadow-card-hover ${plan.popular
                                ? "ring-2 ring-primary shadow-card-hover scale-105"
                                : "shadow-card hover:-translate-y-1"}`, children: [plan.popular && (_jsx("div", { className: "absolute -top-4 left-1/2 -translate-x-1/2", children: _jsx(Badge, { className: "bg-primary text-white px-4 py-1", children: "Most Popular" }) })), _jsx("div", { className: `inline-flex p-3 rounded-2xl ${plan.iconColor} bg-gray-100 mb-6`, children: _jsx(IconComponent, { className: "w-8 h-8" }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2", children: plan.name }), _jsx("p", { className: "text-gray-600 mb-6", children: plan.description }), _jsxs("div", { className: "flex items-baseline mb-8", children: [_jsxs("span", { className: "text-4xl font-bold text-gray-900", children: ["\u20B9", plan.price] }), _jsxs("span", { className: "text-gray-500 ml-2", children: ["/", plan.period] })] }), _jsx("ul", { className: "space-y-4 mb-8", children: plan.features.map((feature, index) => (_jsxs("li", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5", children: _jsx(Check, { className: "w-3 h-3 text-green-600" }) }), _jsx("span", { className: "text-gray-600", children: feature })] }, index))) }), _jsxs(Button, { onClick: () => handlePayment(plan.price), className: `w-full group ${plan.popular ? "" : "bg-gray-900 hover:bg-gray-800"}`, size: "lg", children: ["Get Started", _jsx(ArrowRight, { className: "w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" })] })] }, plan.id));
                    }) }), _jsxs("div", { className: "mt-16 text-center", children: [_jsx("p", { className: "text-gray-500 mb-4", children: "Trusted by travelers worldwide" }), _jsxs("div", { className: "flex flex-wrap justify-center gap-8 items-center opacity-60", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 bg-gray-200 rounded" }), _jsx("span", { className: "font-medium text-gray-600", children: "10,000+ Hosts" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 bg-gray-200 rounded" }), _jsx("span", { className: "font-medium text-gray-600", children: "50+ Countries" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 bg-gray-200 rounded" }), _jsx("span", { className: "font-medium text-gray-600", children: "100K+ Reviews" })] })] })] }), _jsx("div", { className: "mt-12 text-center p-6 bg-gray-50 rounded-2xl max-w-xl mx-auto", children: _jsxs("p", { className: "text-gray-600", children: [_jsx("span", { className: "font-semibold", children: "30-day money-back guarantee." }), " ", "Not satisfied? Get a full refund, no questions asked."] }) })] }) }));
};
export default MembershipPlans;
