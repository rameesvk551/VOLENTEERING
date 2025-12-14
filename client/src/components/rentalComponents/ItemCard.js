import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import RentalModal from "./RentalModal";
const ItemCard = ({ gearList }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGear, setSelectedGear] = useState(null);
    const handleRentClick = (gear) => {
        setSelectedGear(gear);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedGear(null);
    };
    // Define rental durations
    const rentalOptions = [1, 3, 7, 10, 15];
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 px-8 py-5", children: gearList.map((gear) => (_jsxs("div", { className: "flex flex-col items-center bg-gray-50 border rounded-lg shadow-sm hover:shadow-md transition p-4", children: [_jsx("img", { src: gear.image, alt: gear.name, className: "w-32 h-32 object-cover mb-4 rounded-md" }), _jsx("h3", { className: "text-base font-medium text-gray-800 mb-2", children: gear.name }), _jsx("button", { onClick: () => handleRentClick(gear), className: "mt-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition", children: "Rent" })] }, gear.id))) }), _jsx(RentalModal, { isModalOpen: isModalOpen, selectedGear: selectedGear, closeModal: closeModal })] }));
};
export default ItemCard;
