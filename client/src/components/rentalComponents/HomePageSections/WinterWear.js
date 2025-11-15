import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ItemCard from "@/components/rentalComponents/ItemCard";
import { gearList } from "@/utils/dummyData";
const WinterWear = () => {
    return (_jsxs("section", { className: " py-3 bg-gray-100 text-center", children: [_jsx("h2", { className: "text-3xl font-semibold mb-6", children: "Witer Wears" }), _jsx(ItemCard, { gearList: gearList })] }));
};
export default WinterWear;
