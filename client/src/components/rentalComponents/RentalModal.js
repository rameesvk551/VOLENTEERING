import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import "react-datepicker/dist/react-datepicker.css";
export default function RentalModal({ isModalOpen, selectedGear, closeModal }) {
    const rentalOptions = [1, 3, 5, 10, 15];
    return (_jsx(_Fragment, { children: isModalOpen && selectedGear && (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 h-screen", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative overflow-auto h-full", children: [_jsx("button", { onClick: closeModal, className: "absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition", children: "\u2716" }), _jsx("h2", { className: "text-2xl font-bold text-center text-gray-800 mb-6", children: selectedGear.name }), _jsx("div", { className: "space-y-4 mb-6", children: rentalOptions.map((days) => {
                            const totalPrice = days * selectedGear?.basePrice;
                            return (_jsxs("div", { className: "flex justify-between items-center border p-4 rounded-md shadow-sm hover:shadow-md transition", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-lg", children: [days, " Day", days > 1 ? "s" : "", " Rent"] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["\u20B9", selectedGear?.basePrice, " /day"] })] }), _jsxs("p", { className: "font-semibold text-blue-600 text-lg", children: ["\u20B9", totalPrice] })] }, days));
                        }) }), _jsx("div", { className: "flex justify-center", children: _jsx("button", { className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition", children: "View" }) })] }) })) }));
}
