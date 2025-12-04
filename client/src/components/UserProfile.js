import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import server from '@/server/app';
import axios from 'axios';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
const UserProfile = () => {
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();
    const { volenteerData } = useSelector((state) => state.volenteer);
    const userId = volenteerData?.user?._id;
    const addVolenteerDetails = () => {
        console.log("aaading details", userId);
        navigate(`/volenteer/add-details/${userId}`);
    };
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setIsImageUploading(true);
            const formData = new FormData();
            formData.append("profileImage", file);
            try {
                const response = await axios.put(`${server}/user/update-profile`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                });
                console.log("Uploaded Image URL:", response.data.imageUrl);
            }
            catch (error) {
                console.error("Upload failed:", error);
            }
            finally {
                setIsImageUploading(false);
            }
        }
    };
    const validatePassword = (pwd) => {
        const minLength = 6;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasNumber = /\d/.test(pwd);
        return pwd.length >= minLength && hasUpper && hasNumber;
    };
    const handlePasswordChange = () => {
        if (!validatePassword(password)) {
            setPasswordError("Password must be at least 6 characters, contain one uppercase letter and one number.");
            return;
        }
        setPasswordError("");
        // Submit password logic here
        console.log("Password changed:", password);
    };
    const addHotDetails = () => {
        navigate(`/host/add-details/${volenteerData?.user._id}`);
    };
    return (_jsx("div", { className: "min-h-[calc(96vh-62px)] bg-blue-50 flex items-center justify-center px-4 py-8", children: _jsxs("div", { className: "bg-white shadow-2xl rounded-2xl max-w-4xl w-full p-8 md:p-12 grid md:grid-cols-2 gap-8", children: [_jsxs("div", { className: "flex flex-col items-center md:items-start text-center md:text-left space-y-4", children: [_jsxs("div", { className: "relative w-32 h-32", children: [_jsx("img", { src: volenteerData?.user?.profileImage, alt: "Profile", className: `w-32 h-32 rounded-full border-4 border-gray-300 object-cover shadow-md transition-all duration-300 ${isImageUploading && "opacity-50"}` }), isImageUploading && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full", children: _jsxs("svg", { className: "animate-spin h-6 w-6 text-white", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v8z" })] }) }))] }), _jsx("label", { htmlFor: "profileUpload", className: "text-sm text-indigo-600 font-semibold cursor-pointer hover:underline", children: isImageUploading ? "Uploading..." : "Change Image" }), _jsx("input", { type: "file", id: "profileUpload", accept: "image/*", className: "hidden", onChange: handleImageChange }), _jsxs("h2", { className: "text-xl font-bold text-gray-800", children: [volenteerData?.user?.firstName, " ", volenteerData?.user?.lastName] }), _jsxs("div", { className: "flex flex-wrap gap-3 mt-2", children: [_jsx("button", { onClick: addVolenteerDetails, className: "bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow", children: "Become a Volunteer" }), _jsx("button", { className: "bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow", onClick: addHotDetails, children: "Become a Host" })] })] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "First Name" }), _jsx("input", { type: "text", defaultValue: volenteerData?.user?.firstName, className: "mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Last Name" }), _jsx("input", { type: "text", defaultValue: volenteerData?.user?.lastName, className: "mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Email" }), _jsx("input", { type: "email", defaultValue: volenteerData?.user?.email, className: "mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "New Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? "text" : "password", placeholder: "********", value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1 w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" }), _jsx("span", { onClick: () => setShowPassword(!showPassword), className: "absolute top-3 right-4 cursor-pointer text-sm text-gray-500", children: showPassword ? "Hide" : "Show" })] }), passwordError && _jsx("p", { className: "text-red-500 text-sm mt-1", children: passwordError })] }), _jsx("button", { onClick: handlePasswordChange, className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition duration-200", children: "Change Password" })] })] }) }));
};
export default UserProfile;
