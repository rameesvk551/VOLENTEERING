import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { MdEmail } from "react-icons/md";
import { FaRegStar } from "react-icons/fa6";
import { CiCalendar, CiEdit, CiSquareChevLeft, CiSquareChevRight } from "react-icons/ci";
import { TbFileDescription } from "react-icons/tb";
import Divider from "../Divider";
import { SiAmazonsimpleemailservice } from "react-icons/si";
import { RiFeedbackFill } from "react-icons/ri";
import axios from "axios";
import server from "@/server/app";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
const HostProfileEdit = () => {
    const [host, setHost] = useState(null);
    const [isEditing, setIsEditing] = useState({});
    const [editValues, setEditValues] = useState({});
    const { hostData, loading, error } = useSelector((state) => state.host);
    useEffect(() => {
        if (hostData?.host) {
            setHost(hostData.host);
        }
    }, [hostData]);
    const updateProfileField = async (field, value) => {
        try {
            const response = await axios.put(`${server}/host/profile-update/${host?._id}`, {
                [field]: value,
            });
            console.log("Update success:", response.data);
            toast.success("feild updated successfully");
        }
        catch (error) {
            console.error("Update failed:", error.response?.data || error.message);
        }
    };
    useEffect(() => {
        setEditValues({
            heading: host?.heading || "heading",
            description: host?.description,
            accommodation: "I speak Dutch, French, English...",
            whatElse: "Remote location from public transport...",
        });
    }, []);
    const toggleEdit = (field) => {
        setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
    };
    const handleChange = (field, value) => {
        setEditValues((prev) => ({ ...prev, [field]: value }));
    };
    const saveField = async (field) => {
        const value = editValues[field];
        await updateProfileField(field, value); // Call API
        setHost((prev) => ({ ...prev, [field]: value })); // Update local state
        toggleEdit(field); // Close edit mode
    };
    if (!host)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { className: "px-4 md:px-12 mt-8 flex flex-col lg:flex-row gap-8", children: [_jsxs("div", { className: "lg:w-2/3 space-y-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-md shadow-md", children: [_jsxs("div", { className: "flex justify-between items-center pb-4", children: [_jsx("h1", { className: "text-xl font-bold text-gray-700", children: "Availability" }), _jsxs("div", { className: "flex items-center gap-2 text-gray-500", children: [_jsx(CiSquareChevLeft, { size: 28 }), _jsx("span", { className: "font-medium", children: host.availability }), _jsx(CiSquareChevRight, { size: 28 })] })] }), _jsxs("span", { className: "flex items-center text-sm text-gray-500", children: [_jsx(CiCalendar, { className: "mr-2" }), " Min stay requested: ", host.minimumStay] }), _jsx("div", { className: "mt-6", children: _jsx("div", { className: "grid grid-cols-12 gap-1 text-white text-sm", children: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => (_jsx("div", { className: "bg-fuchsia-500 h-8 flex items-center justify-center rounded-md", children: month }, month))) }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-md shadow-md space-y-6", children: [[
                                { label: "Headding", field: "heading" },
                                { label: "Description", field: "description" },
                                { label: "Accommodation", field: "accommodation" },
                                { label: "What else ...", field: "whatElse" },
                            ].map(({ label, field }) => (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TbFileDescription, {}), _jsx("h2", { className: "text-lg text-[#b4cb3c] font-semibold", children: label })] }), _jsxs("button", { className: "bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1", onClick: () => (isEditing[field] ? saveField(field) : toggleEdit(field)), children: [_jsx(CiEdit, {}), " ", isEditing[field] ? "Save" : "Edit"] })] }), isEditing[field] ? (_jsx("textarea", { className: "w-full mt-2 border p-2 rounded", value: editValues[field], onChange: (e) => handleChange(field, e.target.value) })) : (_jsx("p", { className: "text-gray-700 text-sm leading-relaxed", children: editValues[field] })), _jsx(Divider, {})] }, field))), _jsx("div", { className: "flex justify-between items-center", children: _jsx("h2", { className: "text-lg text-[#b4cb3c] font-semibold", children: "Types of help & learning opportunities" }) }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", children: host.selectedHelpTypes.map((help, index) => (_jsx("div", { className: "bg-white p-3 text-center rounded-md border border-gray-200 shadow hover:shadow-md transition", children: help }, index))) }), _jsx(Divider, {}), _jsx("div", { className: "flex justify-between items-center", children: _jsx("h2", { className: "text-lg text-[#b4cb3c] font-semibold", children: "Languages spoken" }) }), _jsx("div", { className: "space-y-1", children: host.languageAndLevel.map((lang, index) => (_jsxs("p", { className: "text-sm text-gray-700", children: [lang.language, ": ", lang.level] }, index))) })] })] }), _jsxs("div", { className: "w-1/3", children: [_jsx("div", { className: "bg-[#fff] w-full flex", children: _jsx("div", { className: "w-full h-full p-10 rounded-md", children: _jsxs("div", { className: "space-y-4 mt-4", children: [_jsx("div", { className: "flex items-center", children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(FaRegStar, { className: "text-yellow-500" }), " Edit Profile"] }) }), _jsx(Divider, {}), _jsx("div", { className: "flex items-center", children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(SiAmazonsimpleemailservice, { className: "text-blue-500" }), " Verify via Facebook"] }) }), _jsx(Divider, {}), _jsx("div", { className: "flex justify-between", children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(MdEmail, { className: "text-purple-500" }), " Last minute"] }) })] }) }) }), _jsx("div", { className: "bg-[#fff] w-full flex mt-5", children: _jsxs("div", { className: "w-full h-full p-10 rounded-md", children: [_jsx("h1", { className: "text-xl font-semibold", children: "Profile Information" }), _jsxs("div", { className: "space-y-4 mt-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(RiFeedbackFill, { className: "text-green-500" }), " Feedback"] }), _jsx("span", { children: "40" })] }), _jsx(Divider, {}), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(MdEmail, { className: "text-purple-500" }), " Email verified"] }), _jsx("span", { children: "80%" })] })] })] }) })] })] }));
};
export default HostProfileEdit;
