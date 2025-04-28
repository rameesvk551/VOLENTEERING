import { useState } from "react";
import DatePicker from "react-datepicker"; // ⬅️ You missed this!
import "react-datepicker/dist/react-datepicker.css";

export default function RentalModal({ isModalOpen, selectedGear, closeModal }: any) {

  const rentalOptions = [1, 3, 5, 10, 15];

 
  return (
    <>
      {/* Main Rental Modal */}
      {isModalOpen && selectedGear && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 h-screen">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative overflow-auto h-full">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
            >
              ✖
            </button>

            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              {selectedGear.name}
            </h2>

            {/* Rental Options */}
            <div className="space-y-4 mb-6">
              {rentalOptions.map((days) => {
                const totalPrice = days * selectedGear?.basePrice;
                return (
                  <div
                    key={days}
                    className="flex justify-between items-center border p-4 rounded-md shadow-sm hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-semibold text-lg">
                        {days} Day{days > 1 ? "s" : ""} Rent
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{selectedGear?.basePrice} /day
                      </p>
                    </div>
                    <p className="font-semibold text-blue-600 text-lg">₹{totalPrice}</p>
                  </div>
                );
              })}
            </div>

            {/* Select Date Button */}
            <div className="flex justify-center">
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
              
              >
                View
              </button>
            </div>
          </div>
        </div>
      )}

  
    </>
  );
}
