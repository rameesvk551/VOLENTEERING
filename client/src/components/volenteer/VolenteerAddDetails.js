import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import server from "../../server/app";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
const AddVolunteerDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { register, handleSubmit, formState: { errors }, } = useForm();
    const [travelStatus, setTravelStatus] = useState("Home");
    const [skills, setSkills] = useState([]);
    const [interests, setInterests] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [interestInput, setInterestInput] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [loading, setLoading] = useState(false);
    const handleAddItem = (type) => {
        const value = type === "skill" ? skillInput : interestInput;
        if (value.trim()) {
            if (type === "skill")
                setSkills([...skills, value.trim()]);
            else
                setInterests([...interests, value.trim()]);
            type === "skill" ? setSkillInput("") : setInterestInput("");
        }
    };
    const handleRemoveItem = (type, index) => {
        const updated = type === "skill" ? [...skills] : [...interests];
        updated.splice(index, 1);
        type === "skill" ? setSkills(updated) : setInterests(updated);
    };
    const onSubmit = async (data) => {
        setLoading(true);
        const fullData = {
            ...data,
            skills,
            activities: interests,
        };
        try {
            const res = await axios.post(`${server}/user/add-details/${id}`, fullData, {
                withCredentials: true,
            });
            if (res.data.success) {
                toast.success("details added succesfully");
                setLoading(false);
                navigate(`/user/membership`);
                location.reload();
            }
        }
        catch (err) {
            setLoading(false);
            toast.error("something went wrong");
        }
    };
    return (_jsxs("div", { className: "flex w-full h-[100vh] bg-gradient-to-br from-gray-900 to-black text-white", children: [_jsxs("div", { className: "hidden md:flex fixed left-0 flex-col gap-y-6 w-1/3 h-[100vh]  bg-black items-center justify-center px-6 z-10", children: [_jsx("h5", { className: "text-4xl font-bold tracking-widest text-gray-900 uppercase", children: _jsx("span", { className: "bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text", children: "RAIH" }) }), _jsx("p", { className: "text-lg text-gray-300 text-center", children: "Welcome to Raih \u2014 where your journey begins \u2728" })] }), _jsx("div", { className: "flex w-full md:w-2/3 md:ml-[33.33%] h-[100vh] px-6 md:px-12 lg:px-20 py-10 overflow-y-auto", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "w-full space-y-10", children: [_jsxs("div", { className: "bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700", children: [_jsx("h2", { className: "text-[#b4cb3c] text-2xl font-semibold", children: "Traveling Information" }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block font-medium text-gray-300 mb-2", children: "I'm currently" }), _jsxs("select", { value: travelStatus, ...register("travelStatus", { required: "This field is required" }), onChange: (e) => setTravelStatus(e.target.value), className: "w-full p-3 border border-gray-600 bg-gray-700 rounded-lg focus:ring-2 focus:ring-[#b4cb3c]", children: [_jsx("option", { value: "Home", children: "Home" }), _jsx("option", { value: "Travelling", children: "Travelling" })] }), errors.travelStatus && _jsx("p", { className: "text-red-500 text-sm", children: errors.travelStatus.message })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block font-medium text-gray-300 mb-2", children: "Activities You\u2019re Interested In" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: interestInput, onChange: (e) => setInterestInput(e.target.value), className: "flex-1 p-3 border border-gray-600 bg-gray-700 rounded-lg focus:ring-2 focus:ring-[#b4cb3c]", placeholder: "e.g., Hiking, Yoga" }), _jsx("button", { type: "button", onClick: () => handleAddItem("interest"), className: "bg-[#b4cb3c] text-black px-4 py-2 rounded-lg hover:bg-green-500", children: "Add" })] }), _jsx("div", { className: "flex flex-wrap gap-2 mt-3", children: interests.map((interest, idx) => (_jsxs("span", { className: "bg-[#b4cb3c] text-black px-3 py-1 rounded-full text-sm flex items-center gap-1", children: [interest, _jsx("button", { onClick: () => handleRemoveItem("interest", idx), type: "button", children: "\u00D7" })] }, idx))) })] })] }), _jsxs("div", { className: "bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700", children: [_jsx("h2", { className: "text-[#b4cb3c] text-2xl font-semibold", children: "Profile Information" }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block font-medium text-gray-300 mb-2", children: "Description" }), _jsx("textarea", { ...register("description", { required: "Please enter a description" }), className: "w-full p-3 border border-gray-600 bg-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-[#b4cb3c]", rows: 3 }), errors.description && _jsx("p", { className: "text-red-500 text-sm", children: errors.description.message })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block font-medium text-gray-300 mb-2", children: "Skills" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: skillInput, onChange: (e) => setSkillInput(e.target.value), className: "flex-1 p-3 border border-gray-600 bg-gray-700 rounded-lg focus:ring-2 focus:ring-[#b4cb3c]", placeholder: "e.g., Cooking, Gardening" }), _jsx("button", { type: "button", onClick: () => handleAddItem("skill"), className: "bg-[#b4cb3c] text-black px-4 py-2 rounded-lg hover:bg-green-500", children: "Add" })] }), _jsx("div", { className: "flex flex-wrap gap-2 mt-3", children: skills.map((skill, idx) => (_jsxs("span", { className: "bg-[#b4cb3c] text-black px-3 py-1 rounded-full text-sm flex items-center gap-1", children: [skill, _jsx("button", { onClick: () => handleRemoveItem("skill", idx), type: "button", children: "\u00D7" })] }, idx))) })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block font-medium text-gray-300 mb-2", children: "Date of Birth" }), _jsx("input", { type: "date", value: birthDate, ...register("birthDate", { required: "Please select your birth date" }), onChange: (e) => setBirthDate(e.target.value), className: "w-full p-3 border border-gray-600 bg-gray-700 rounded-lg focus:ring-2 focus:ring-[#b4cb3c]" }), errors.birthDate && _jsx("p", { className: "text-red-500 text-sm", children: errors.birthDate.message })] }), _jsx("div", { className: "mt-8", children: _jsx("button", { type: "submit", className: `w-full text-black font-semibold py-3 rounded-lg transition flex items-center justify-center ${loading ? "bg-green-400 cursor-not-allowed" : "bg-[#b4cb3c] hover:bg-green-500"}`, disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "animate-spin h-5 w-5 mr-3 text-black", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v8z" })] }), "Submitting..."] })) : ("Submit Details") }) })] })] }) })] }));
};
export default AddVolunteerDetail;
