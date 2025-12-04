import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import Button from "../Button";
import Divider from "../Divider";
import Logo from "../Logo";
import Inputbox from "../Inputbox";
import { useForm } from "react-hook-form";
import server from "../../server/app.js";
import axios from "axios";
import toast from "react-hot-toast";
const UserLogin = () => {
    const navigate = useNavigate();
    const form = useForm();
    const { register, handleSubmit, formState } = form;
    const { errors } = formState;
    const googleLogin = async () => { };
    const onSubmit = (loginData) => {
        console.log("server");
        console.log("login form submitted", loginData);
        axios.post(`${server}/user/login`, loginData, { withCredentials: true }).then((res) => {
            toast.success("Logged in Successfully");
            navigate(`/`);
            location.reload();
        }).catch((error) => {
            console.log("an error occured", error);
            toast.error("Something went wrong");
        });
    };
    return (_jsxs("div", { className: 'flex w-full  h-[100vh]', children: [_jsxs("div", { className: 'hidden md:flex flex-col gap-y-4 w-1/3 h-full bg-black items-center justify-center', children: [_jsx("h5", { className: "text-3xl font-bold tracking-widest text-gray-900 uppercase", children: _jsx("span", { className: "bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text", children: "RAIH" }) }), _jsx("span", { className: 'text-xl font-semibold text-white', children: "Welcome Back" })] }), _jsx("div", { className: 'flex w-full md:w-2/3 h-full bg-white dark:bg-gradient-to-b md:dark:bg-gradient-to-r from-black via-[#071b3e] to-black items-center px-10 md:px-20 lg:px-40', children: _jsxs("div", { className: 'h-full flex flex-col items-center justify-center  py-12 px-4 sm:px-6 lg:px-8', children: [_jsx("div", { className: 'block mb-10 md:hidden', children: _jsx(Logo, {}) }), _jsxs("div", { className: 'max-w-md w-full space-y-8', children: [_jsx("div", { children: _jsx("h2", { className: 'mt-6 text-center text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white', children: "Sign in to your account" }) }), _jsx(Button, { onClick: () => googleLogin(), label: 'Sign in with Google', icon: _jsx(FcGoogle, { className: '' }), styles: 'w-full flex flex-row-reverse gap-4 bg-white dark:bg-transparent text-black dark:text-white px-5 py-2.5 rounded-full border border-gray-300' }), _jsx(Divider, { label: 'or sign in with email' }), _jsxs("form", { className: 'mt-8 space-y-6', onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { className: 'flex flex-col rounded-md shadow-sm -space-y-px gap-5', children: [_jsx(Inputbox, { label: 'Email Address', type: 'email', isRequired: true, placeholder: 'email@example.com', ...register("email", { required: "please enter a valid email address" }), className: `${errors.email ? "border-red-500 " : ""} "dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base` }), errors.email && _jsx("p", { className: 'text-red-500 text-sm mt-1', children: errors.email.message }), _jsx(Inputbox, { label: 'Password', type: 'password', isRequired: true, placeholder: 'Password', ...register("password", {
                                                        required: "Password is required",
                                                        minLength: { value: 8, message: "Password must be at least 8 characters long" },
                                                        pattern: {
                                                            value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                                                            message: "Password must contain at least one letter and one number"
                                                        }
                                                    }), className: `${errors.password ? "border-red-500 " : ""} "dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base` }), errors.password && _jsx("p", { className: 'text-red-500 text-sm mt-1', children: errors.password.message })] }), _jsx(Button, { label: ' Sign In', type: 'submit', styles: 'group relative w-full flex justify-center py-2.5 2xl:py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-black dark:bg-rose-800 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 mt-8' })] }), _jsx("div", { className: 'flex items-center justify-center text-gray-600 dark:text-gray-300', children: _jsxs("p", { children: ["Dont't have an account?", " ", _jsx(Link, { to: '/user/signup', className: 'text-rose-800 font-medium', children: "Sign up" })] }) })] })] }) })] }));
};
export default UserLogin;
