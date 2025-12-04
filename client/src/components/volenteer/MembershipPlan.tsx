import React from "react";
import { Check, Sparkles, Heart, Gift, ArrowRight } from "lucide-react";
import axios from "axios";
import server from "../../server/app";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Razorpay: unknown;
  }
}

// Razorpay Key from Vite Environment Variable
const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID as string;

interface OrderResponse {
  amount: number;
  currency: string;
  id: string;
}

const MembershipPlans = () => {
  const navigate = useNavigate();
  const { volenteerData } = useSelector((state: RootState) => state.volenteer);
  const userId = volenteerData?.user?._id;

  const handlePayment = async (amount: number) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK is not loaded. Please check your internet connection.");
      return;
    }

    try {
      const { data } = await axios.post<OrderResponse>(
        `${server}/payment/create-order`,
        { amount, currency: "INR" }
      );

      const options = {
        key: razorpayKey,
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,
        name: "RAIH Travel",
        description: "Volunteer Travel Membership",
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            const verification = await axios.post(
              `${server}/payment/verify-payment`,
              response,
              { withCredentials: true }
            );

            if (verification.data.success) {
              toast.success("🎉 Payment successful!");
              navigate(`/volenteer/profile/${userId}`);
            } else {
              toast.error("Payment verification failed.");
            }
          } catch {
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

      const paymentObject = new (window.Razorpay as new (options: object) => { open: () => void })(options);
      paymentObject.open();
    } catch {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="primary" className="mb-4">
            Membership Plans
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of travelers exchanging skills for experiences around the world
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-8 transition-all duration-300 hover:shadow-card-hover ${
                  plan.popular
                    ? "ring-2 ring-primary shadow-card-hover scale-105"
                    : "shadow-card hover:-translate-y-1"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex p-3 rounded-2xl ${plan.iconColor} bg-gray-100 mb-6`}>
                  <IconComponent className="w-8 h-8" />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handlePayment(plan.price)}
                  className={`w-full group ${
                    plan.popular ? "" : "bg-gray-900 hover:bg-gray-800"
                  }`}
                  size="lg"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-4">Trusted by travelers worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded" />
              <span className="font-medium text-gray-600">10,000+ Hosts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded" />
              <span className="font-medium text-gray-600">50+ Countries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded" />
              <span className="font-medium text-gray-600">100K+ Reviews</span>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-12 text-center p-6 bg-gray-50 rounded-2xl max-w-xl mx-auto">
          <p className="text-gray-600">
            <span className="font-semibold">30-day money-back guarantee.</span>{" "}
            Not satisfied? Get a full refund, no questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembershipPlans;
