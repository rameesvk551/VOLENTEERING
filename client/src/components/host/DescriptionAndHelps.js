import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import Logo from "../Logo";
import { Toaster, toast } from "sonner";
import { useForm } from "react-hook-form";
import Button from "../Button";
import { FaHammer, FaLanguage } from "react-icons/fa6";
import { MdOutlineElderlyWoman } from "react-icons/md";
import { GiDrowning } from "react-icons/gi";
import { GiTeacher } from "react-icons/gi";
import { LuTrees } from "react-icons/lu";
import { PiCookingPot } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { nextStep, toggleHelpType, updateDescription, } from "../../redux/Slices/hostFormSlice";
import { BiLeaf } from "react-icons/bi";
const DescriptionAndHelps = () => {
    const dispatch = useDispatch();
    // getting all helptypes from redux store
    const selectedHelpTypes = useSelector((state) => state.hostForm.data.selectedHelpTypes);
    //getting description
    const description = useSelector((state) => state.hostForm.data.description);
    const helpOptions = [
        { label: "Cooking", icon: _jsx(PiCookingPot, { size: 60 }) },
        { label: "Art", icon: _jsx(GiDrowning, { size: 60 }) },
        { label: "Teaching", icon: _jsx(GiTeacher, { size: 60 }) },
        { label: "Gardening", icon: _jsx(MdOutlineElderlyWoman, { size: 60 }) },
        { label: "Animal Care", icon: _jsx(LuTrees, { size: 60 }) },
        { label: "Help with Computer", icon: _jsx(LuTrees, { size: 60 }) },
        { label: "Language Practice", icon: _jsx(FaLanguage, { size: 60 }) },
        { label: "Help Around House", icon: _jsx(FaHammer, { size: 60 }) },
        { label: "Babysitting and Creative play", icon: _jsx(FaLanguage, { size: 60 }) },
        { label: "  DIV  Projects", icon: _jsx(FaHammer, { size: 60 }) },
        { label: "  Eco  projects", icon: _jsx(BiLeaf, { size: 60 }) },
    ];
    //for setting help type required
    const handleToggle = (helpType) => {
        dispatch(toggleHelpType(helpType));
    };
    const onSubmit = (data) => {
        console.log("Form submitted with data:", data);
        if (selectedHelpTypes.length < 3) {
            toast.error(" pleae elect atleat 3 helps");
        }
        else {
            dispatch(nextStep());
        }
    };
    const form = useForm();
    const { register, handleSubmit, setValue, formState } = form;
    const { errors } = formState;
    // Sync Redux state with React Hook Form
    useEffect(() => {
        setValue("description", description);
    }, [description, setValue]);
    return (_jsxs("div", { className: "flex w-full h-[100vh]", children: [_jsxs("div", { className: 'hidden md:flex flex-col gap-y-5 w-1/3 h-full bg-black items-center justify-center px-8 text-center', children: [_jsx("h5", { className: "text-3xl font-bold tracking-wide text-gray-900 uppercase", children: _jsx("span", { className: "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text", children: "RAIH" }) }), _jsxs("p", { className: 'text-lg font-medium text-white', children: ["Ready to share your space?", _jsx("br", {}), "Become a ", _jsx("span", { className: "text-yellow-400 font-semibold", children: "Raih Host" }), " and welcome travelers with open arms \uD83E\uDD1D\uD83C\uDFE1"] })] }), _jsx("div", { className: "flex w-full md:w-2/3 h-full bg-white   md:px-20 ", children: _jsxs("div", { className: "w-full h-full flex flex-col items-center    sm:px-0 lg:px-8", children: [_jsx("div", { className: "block mb-10 md:hidden -ml-8", children: _jsx(Logo, {}) }), _jsx("div", { className: " w-full md:w-[80%] lg:w-[90%] xl:w-[95%]  flex flex-col", children: _jsxs("form", { className: " w-full  space-y-6", onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { className: "flex flex-col rounded-md shadow-sm -space-y-px border border-black  mt-5", children: [_jsxs("h1", { className: "font-bold pt-2 pl-3", children: ["Describe the kind of help you like", " "] }), _jsx("textarea", { className: "dark:bg-transparent block w-full md:w-[80%] lg:w-[90%] xl:w-[95%] ml-4 px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 \r\n  placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none \r\n  focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base", ...register("description", {
                                                    required: "Description is required",
                                                    minLength: {
                                                        value: 100,
                                                        message: "Description must be at least 100 characters",
                                                    },
                                                }), onChange: (e) => {
                                                    setValue("description", e.target.value, {
                                                        shouldValidate: true,
                                                    }); // Ensures validation runs on change
                                                    dispatch(updateDescription(e.target.value)); // Updates Redux store
                                                } }), errors.description && (_jsx("p", { className: "text-red-500 text-sm mt-3 pl-5", children: errors.description.message })), _jsx("h1", { className: "font-bold pt-2 pl-3", children: "Select Help Type " }), _jsx("div", { className: "flex flex-row flex-wrap  w-full p-3 pl-12 gap-2 text-black", children: helpOptions.map((option) => (_jsxs("div", { className: `p-4 border rounded flex flex-col items-center cursor-pointer transition-all duration-300 ${selectedHelpTypes.includes(option.label)
                                                        ? "border-green-500 bg-green-100" // ✅ Highlight selected items
                                                        : "border-black hover:border-gray-500"}`, onClick: () => handleToggle(option.label), children: [option.icon, _jsx("span", { className: "mt-2", children: option.label })] }, option.label))) })] }), _jsx(Button, { label: "Continue", type: "submit", styles: "group relative w-full flex justify-center py-2.5 2xl:py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-black dark:bg-rose-800 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 " })] }) })] }) }), _jsx(Toaster, { richColors: true })] }));
};
export default DescriptionAndHelps;
