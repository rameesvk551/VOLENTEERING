import React, { useState, lazy, Suspense } from "react";
import { FaCrown, FaCalendarAlt, FaSyncAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";





const MembershipModal = () => {
  const { volenteerData } = useSelector((state: RootState) => state.volenteer);
  const paidDate = volenteerData.user.payments?.[0]?.createdAt;

  function getParsedDate(paidDate: string | Date):string{
    const date = new Date(paidDate);

    return  `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
  }

function getNextYearDate(paidDate: string | Date): string {
  const date = new Date(paidDate);
  if (isNaN(date.getTime())) throw new Error("Invalid date");

  date.setFullYear(date.getFullYear() + 1);
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

// Example usage:
console.log(getNextYearDate("2025-04-02T06:13:20.441Z")); 

    
    const membership = {
      plan: "Premium Volunteer",
      status: volenteerData?.user?.status,
      startDate: getParsedDate(paidDate),
      endDate: getNextYearDate(paidDate),
     
    };
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg w-96 relative"
        >
          <button
          
            className="absolute top-3 right-3 bg-white text-black rounded-full p-2 hover:bg-gray-200"
          >
            &times;
          </button>
          <div className="flex items-center mb-4">
            <FaCrown className="text-yellow-300 text-3xl mr-2" />
            <h2 className="text-2xl font-bold">Membership Details</h2>
          </div>
          <div className="space-y-3">
            <p className="flex items-center gap-2">
              <FaCrown className="text-yellow-300" /> <strong>Plan:</strong> {membership.plan}
            </p>
            <p className="flex items-center gap-2">
              <FaCalendarAlt className="text-yellow-300" /> <strong>Status:</strong> {membership.status}
            </p>
            <p className="flex items-center gap-2">
              <FaCalendarAlt className="text-yellow-300" /> <strong>Start Date:</strong> {membership.startDate}
            </p>
            <p className="flex items-center gap-2">
              <FaCalendarAlt className="text-yellow-300" /> <strong>End Date:</strong> {membership.endDate}
            </p>
           
          </div>
        </motion.div>
      </div>
    );
  };
  
  export default MembershipModal