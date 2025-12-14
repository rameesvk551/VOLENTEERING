import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import Button from "../Button";
import Divider from "../Divider";
import Logo from "../Logo";
import Inputbox from "../Inputbox";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from 'axios';
import server from '../../server/app';
import { useDispatch } from 'react-redux';
import { updateEmail } from '../../redux/Slices/hostFormSlice';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
const HostSignup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const form = useForm();
    const { register, handleSubmit, watch, formState } = form;
    const { errors } = formState;
    const [showForm, setShowForm] = useState(false);
    const passwordValue = watch("password");
    const googleLogin = async () => { };
    const onSubmit = async (formData) => {
        if (!formData.firstName || !formData.lastName || !formData.email ||
            !formData.password || !formData.confirmPassword || !formData.phone) {
            toast.error("Please fill in all required fields.");
            return;
        }
        try {
            const response = await axios.post(`${server}/host/signup`, formData, { withCredentials: true });
            const data = response.data;
            dispatch(updateEmail(data.host.email));
            toast.error("Signup completed");
            navigate(`/host/add-details/${data.host._id}`);
        }
        catch (error) {
            console.log("An error occurred", error);
            toast.error("Signup failed. Please try again.");
        }
    };
    return (_jsxs("div", { className: 'flex w-full h-[100vh]', children: [_jsxs("div", { className: 'hidden md:flex flex-col gap-y-5 w-1/3 h-full bg-black items-center justify-center px-8 text-center', children: [_jsx("h5", { className: "text-3xl font-bold tracking-wide text-gray-900 uppercase", children: _jsx("span", { className: "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text", children: "RAIH" }) }), _jsxs("p", { className: 'text-lg font-medium text-white', children: ["Ready to share your space?", _jsx("br", {}), "Become a ", _jsx("span", { className: "text-yellow-400 font-semibold", children: "Raih Host" }), " and welcome travelers with open arms \uD83E\uDD1D\uD83C\uDFE1"] })] }), _jsx("div", { className: 'flex w-full md:w-2/3 h-full bg-white dark:bg-gradient-to-b md:dark:bg-gradient-to-r from-black via-[#071b3e] to-black items-center px-4 md:px-20 lg:px-40', children: _jsxs("div", { className: 'w-full h-full flex flex-col items-center justify-center py-12 px-4 sm:px-0 lg:px-8', children: [_jsx("div", { className: 'block mb-10 md:hidden -ml-8', children: _jsx(Logo, {}) }), _jsxs("div", { className: 'w-full space-y-6 flex flex-col justify-start', children: [_jsx("div", { className: 'max-w-md w-full flex gap-3 md:gap-4 items-center justify-center mb-12' }), showForm ? (_jsxs("form", { className: 'max-w-md w-full  space-y-5 ', onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { className: 'flex flex-col rounded-md shadow-sm -space-y-px gap-4 mb-5', children: [_jsxs("div", { className: "w-full flex gap-4", children: [_jsxs("div", { className: "flex flex-col w-full", children: [_jsx(Inputbox, { label: "First Name", type: "text", isRequired: true, placeholder: "First Name", ...register("firstName", { required: "First Name is required" }), className: `${errors.firstName ? "border-red-500" : ""} dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base` }), errors.firstName && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.firstName.message }))] }), _jsxs("div", { className: "flex flex-col w-full", children: [_jsx(Inputbox, { label: "Last Name", type: "text", isRequired: true, placeholder: "Last Name", ...register("lastName", { required: "Last Name is required" }), className: `${errors.lastName ? "border-red-500" : ""} dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base` }), errors.lastName && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.lastName.message }))] })] }), _jsx(Inputbox, { label: 'Email Address', type: 'email', isRequired: true, placeholder: 'email@example.com', ...register("email", { required: "email is requeired" }), className: `${errors.email ? "border-red-500 " : ""}dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base` }), errors.email && _jsx("p", { className: 'text-red-500 text-sm mt-1', children: errors.email.message }), _jsxs("div", { className: "w-full flex gap-4", children: [_jsxs("div", { className: "flex flex-col w-full", children: [_jsx(Inputbox, { label: "Password", type: "password", isRequired: true, placeholder: "Password", ...register("password", {
                                                                        required: "Password is required",
                                                                        minLength: {
                                                                            value: 6,
                                                                            message: "Password must be at least 6 characters",
                                                                        },
                                                                    }), className: `${errors.password ? "border-red-500" : ""} dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base` }), errors.password && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.password.message }))] }), _jsxs("div", { className: "flex flex-col w-full", children: [_jsx(Inputbox, { label: "Confirm Password", type: "password", isRequired: true, placeholder: "Confirm Password", ...register("confirmPassword", {
                                                                        required: "Confirm Password is required",
                                                                        validate: (value) => value === passwordValue || "Passwords do not match",
                                                                    }), className: `${errors.confirmPassword ? "border-red-500" : ""} dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base` }), errors.confirmPassword && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.confirmPassword.message }))] })] }), _jsx(Inputbox, { label: 'Phone', type: 'phone', isRequired: true, placeholder: 'Enter your phone number', ...register("phone", {
                                                        required: "Phone number is required",
                                                        pattern: {
                                                            value: /^[0-9]{10}$/,
                                                            message: "Invalid phone number, must be 10 digits"
                                                        }
                                                    }), className: `${errors.phone ? "border-red-500 " : ""} "dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base` }), errors.phone && _jsx("p", { className: 'text-red-500 text-sm mt-1', children: errors.phone.message })] }), _jsx(Button, { label: 'Continue', type: 'submit', styles: 'group relative w-full flex justify-center py-2.5 2xl:py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-black dark:bg-rose-800 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 ' })] })) : (_jsx(_Fragment, { children: _jsxs("div", { className: 'max-w-md w-full space-y-8', children: [_jsx(Button, { onClick: () => googleLogin(), label: 'Sign up with Google', icon: _jsx(FcGoogle, { size: 20 }), styles: 'w-full flex flex-row-reverse gap-4 bg-black dark:bg-transparent dark:border text-white px-5 py-2.5 rounded-full' }), _jsx(Divider, { label: 'OR' }), _jsx(Button, { onClick: () => setShowForm(true), label: 'Continue with email', styles: 'w-full gap-4 bg-white text-black dark:bg-rose-800 dark:text-white px-5 py-2.5 rounded-full border dark:border-none border-gray-300' })] }) })), _jsxs("p", { className: 'max-w-md w-full text-center text-gray-600 dark:text-gray-300', children: ["Already has an account?", " ", _jsx(Link, { to: '/user/login', className: 'text-rose-800 font-medium', children: "Sign in" })] })] })] }) })] }));
};
export default HostSignup;
