import React from "react";
import { FaUser, FaGift, FaHeart } from "react-icons/fa";
import axios from "axios";
import server from "../../server/app";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// ✅ Extend Window interface for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

// ✅ Razorpay Key from Vite Environment Variable
const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID as string;

const MembershipPlans = () => {
  const navigate=useNavigate()
    const { volenteerData, isAuthenticated } = useSelector((state: RootState) => state.volenteer);
    const  userId=volenteerData?.user?._id

interface OrderResponse {
  amount: number;
  currency: string;
  id: string;
}

const handlePayment = async (amount: number) => {
  if (!window.Razorpay) {
    alert("Razorpay SDK is not loaded. Please check your internet connection.");
    return;
  }

  try {
    // ✅ Step 1: Create an order from the backend
    const { data } = await axios.post<OrderResponse>(
      `${server}/payment/create-order`,
      { amount, currency: "INR" }
    );
  
    console.log("🛠️ Created Order:", data);
  
    const options = {
      key: razorpayKey,
      amount: data.amount,
      currency: data.currency,
      order_id: data.id,
      name: "NomadicNook Travel",
      description: "Volunteer Travel Booking",
  
      handler: async (response: any) => { 
        console.log("🛠️ Full Payment Response:", response);
        
        try {
          // ✅ Step 5: Send payment response for verification
          const verification = await axios.post(
            `${server}/payment/verify-payment`,
            response,
            { withCredentials: true }
          );
  
          console.log("✅ Verification Response:", verification.data);
          
          if (verification.data.success) {
          toast.success(" Payment successful!");
          navigate(`/volenteer/profile/${userId}`)
          } else {
            toast.error(" Payment verification failed.");
          }
        } catch (error) {
          console.error(" Payment verification error:", error);
          toast.error(" Payment verification failed.");
        }
      },
  
      prefill: {
        name: "Muhammed Ramees",
        email: "ramees@example.com",
        contact: "9876543210",
      },
      theme: { color: "#F37254" },
    };
  
    // ✅ Step 4: Open Razorpay Payment Gateway
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  } catch (error) {
    console.error("❌ Error while initiating payment:", error);
    alert("❌ Failed to initiate payment.");
  }
}  

  
  // ✅ Membership Plans Data
  const plans = [
    { name: "Solo Explorer", icon: <FaUser size={30} className="text-blue-500" />, description: "Ideal for solo travelers.", benefits: ["Verified hosts", "Community support"], price: 500 },
    { name: "Couple Adventure", icon: <FaHeart size={30} className="text-red-500" />, description: "Perfect for couples.", benefits: ["Shared accommodation", "Partner volunteering"], price: 700 },
    { name: "Gift a Journey", icon: <FaGift size={30} className="text-green-500" />, description: "Gift travel & volunteering.", benefits: ["Fully transferable", "Valid for 12 months"], price: 1000 },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-[88vh] bg-gray-100 p-6">
      <h2 className="text-4xl font-bold text-gray-800 mb-8">🌍 Volunteer Membership Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg p-6 w-80 text-center border border-gray-300">
            <div className="flex justify-center mb-4">{plan.icon}</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">{plan.name}</h3>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <ul className="text-gray-700 text-sm mb-4 space-y-2">{plan.benefits.map((benefit, i) => <li key={i}>✅ {benefit}</li>)}</ul>
            <p className="text-lg font-bold text-gray-900 mb-4">₹{plan.price}</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition" onClick={() => handlePayment(plan.price)}>
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipPlans;
