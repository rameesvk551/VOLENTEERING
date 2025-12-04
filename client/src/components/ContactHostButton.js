import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { GrContact } from "react-icons/gr";
import { Button } from "@/components/ui/button"; // Make sure your Button component is imported correctly
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
const ContactHostButton = ({ hostId, }) => {
    const navigate = useNavigate();
    const { volenteerData, isAuthenticated } = useSelector((state) => state.volenteer);
    const userId = volenteerData?.user?._id;
    const handleContact = () => {
        if (volenteerData.user?.role === "volunteer") {
            // allowed—go to message/host-details
            navigate(`/message/${hostId}`);
        }
        else {
            // not a volunteer—show alert
            toast.error("You must register as a volunteer first. Please update your profile.");
        }
    };
    return (_jsx("div", { className: "flex justify-end mt-6", children: _jsxs(Button, { onClick: handleContact, className: `
          w-full sm:w-auto
          inline-flex items-center justify-center gap-2
          bg-gradient-to-r from-blue-500 to-indigo-500
          hover:from-blue-600 hover:to-indigo-600
          text-white font-semibold
          py-3 px-6
          rounded-full
          shadow-lg hover:shadow-xl
          transform hover:-translate-y-1
          transition-all duration-300
          focus:outline-none focus:ring-4 focus:ring-blue-300
        `, children: [_jsx(GrContact, { size: 16 }), "Contact Host"] }) }));
};
export default ContactHostButton;
