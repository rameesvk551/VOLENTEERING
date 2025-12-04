import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import Button from "../Button";
import Divider from "../Divider";
import Inputbox from "../Inputbox";
import { FcGoogle } from "react-icons/fc";
import toast from 'react-hot-toast';
import { Link, useNavigate } from "react-router-dom";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useForm } from "react-hook-form";
import axios from 'axios';
import server from '../../server/app';
const UserSignup = () => {
    const navigate = useNavigate();
    const form = useForm();
    const { register, handleSubmit, formState } = form;
    const { errors } = formState;
    const [showForm, setShowForm] = useState(false);
    const googleLogin = async () => { };
    const onSubmit = async (formData) => {
        console.log("fffform values", formData);
        const data = await axios.post(`${server}/user/signup`, formData, { withCredentials: true }).then((res) => {
            toast.success('Signup successful!');
            navigate('/user/login');
        }).catch((error) => {
            console.log("an error ococred", error);
            toast.error("omething went wrong");
        });
    };
    return (_jsxs("div", { className: 'flex w-full h-[100vh]', children: [_jsxs("div", { className: 'hidden md:flex flex-col gap-y-4 w-1/3 h-full bg-black items-center justify-center', children: [_jsx("h5", { className: "text-3xl font-bold tracking-widest justify-center items-center text-gray-900 uppercase", children: _jsx("span", { className: "bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text", children: "RAIH" }) }), _jsx("span", { className: 'text-xl font-semibold items-center text-white', children: "Welcome to Raih \u2014 where your journey begins " }), _jsx("span", { children: "\u2728" })] }), _jsx("div", { className: 'flex w-full md:w-2/3 h-full bg-white dark:bg-gradient-to-b md:dark:bg-gradient-to-r from-black via-[#071b3e] to-black items-center px-4 md:px-20 lg:px-40', children: _jsxs("div", { className: 'w-full h-full flex flex-col items-center justify-center py-12 px-4 sm:px-0 lg:px-8', children: [_jsx("div", { className: 'block mb-10 md:hidden -ml-8', children: _jsx("h5", { className: "text-3xl font-bold tracking-widest text-gray-900 uppercase", children: _jsx("span", { className: "bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text", children: "RAIH" }) }) }), _jsxs("div", { className: 'w-full space-y-6 flex flex-col justify-start', children: [_jsxs("div", { className: 'max-w-md w-full flex gap-3 md:gap-4 items-center justify-center mb-12', children: [showForm && (_jsx(IoArrowBackCircleSharp, { className: "text-2xl lg:text-3xl cursor-pointer text-gray-800 dark:text-gray-400", onClick: () => setShowForm(false), ...IoArrowBackCircleSharp })), _jsx("h2", { className: 'text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white', children: "Sign up for an account" })] }), showForm ? (_jsxs("form", { className: 'max-w-md w-full mt-8 space-y-6 ', onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { className: 'flex flex-col rounded-md shadow-sm -space-y-px gap-6 mb-8', children: [_jsxs("div", { className: "w-full flex gap-4", children: [_jsxs("div", { className: "flex flex-col w-full", children: [_jsx(Inputbox, { label: "First Name", type: "text", isRequired: true, placeholder: "First Name", ...register("firstName", { required: "First Name is required" }), className: `${errors.firstName ? "border-red-500" : ""} dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base` }), errors.firstName && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.firstName.message }))] }), _jsxs("div", { className: "flex flex-col w-full", children: [_jsx(Inputbox, { label: "Last Name", type: "text", isRequired: true, placeholder: "Last Name", ...register("lastName", { required: "Last Name is required" }), className: `${errors.lastName ? "border-red-500" : ""} dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base` }), errors.lastName && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.lastName.message }))] })] }), _jsx(Inputbox, { label: 'Email Address', type: 'email', isRequired: true, placeholder: 'email@example.com', ...register("email", { required: "email is requeired" }), className: `${errors.email ? "border-red-500 " : ""}dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base` }), errors.email && _jsx("p", { className: 'text-red-500 text-sm mt-1', children: errors.email.message }), _jsx(Inputbox, { label: 'Password', type: 'password', isRequired: true, placeholder: 'Password', ...register("password", {
                                                        required: "Password is required",
                                                        minLength: { value: 8, message: "Password must be at least 8 characters long" },
                                                        pattern: {
                                                            value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                                                            message: "Password must contain at least one letter and one number"
                                                        }
                                                    }), className: `${errors.password ? "border-red-500 " : ""} "dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base` }), errors.password && _jsx("p", { className: 'text-red-500 text-sm mt-1', children: errors.password.message }), _jsx("div", { className: 'flex items-center justify-between py-4' })] }), _jsx(Button, { label: 'Create Account', type: 'submit', styles: 'group relative w-full flex justify-center py-2.5 2xl:py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-black dark:bg-rose-800 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 ' })] })) : (_jsx(_Fragment, { children: _jsxs("div", { className: 'max-w-md w-full space-y-8', children: [_jsx(Button, { onClick: () => googleLogin(), label: 'Sign up with Google', icon: _jsx(FcGoogle, { size: 20 }), styles: 'w-full flex flex-row-reverse gap-4 bg-black dark:bg-transparent dark:border text-white px-5 py-2.5 rounded-full' }), _jsx(Divider, { label: 'OR' }), _jsx(Button, { onClick: () => setShowForm(true), label: 'Continue with email', styles: 'w-full gap-4 bg-white text-black dark:bg-rose-800 dark:text-white px-5 py-2.5 rounded-full border dark:border-none border-gray-300' })] }) })), _jsxs("p", { className: 'max-w-md w-full text-center text-gray-600 dark:text-gray-300', children: ["Already has an account?", " ", _jsx(Link, { to: '/user/login', className: 'text-rose-800 font-medium', children: "Sign in" })] })] })] }) })] }));
};
export default UserSignup;
