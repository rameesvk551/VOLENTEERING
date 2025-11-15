import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import Logo from "../Logo";
import { Toaster } from "sonner";
import { IoIosAddCircleOutline } from "react-icons/io";
import Divider from "../Divider";
import Inputbox from "../Inputbox";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { deleteLanguageAndLevel, nextStep, prevStep, updateIntrestInLanguageExchange, updateLanguageAndLevel, updateLanguageDescription, } from "../../redux/Slices/hostFormSlice";
const AddLanguage = () => {
    const [canContinue, setCnContinue] = useState(false);
    const [openLanguageAndLevel, setOpenLanguageAndLevel] = useState(false);
    const dispatch = useDispatch();
    const showIntreastInLanguageExchange = useSelector((state) => state.hostForm.data.showIntreastInLanguageExchange);
    const handleChoiceChange = (event) => {
        dispatch(updateIntrestInLanguageExchange(event.target.value));
    };
    // getting all languages and level from redux store
    const languageAndLevel = useSelector((state) => state.hostForm.data.languageAndLevel);
    //getting  language description
    const languageDescription = useSelector((state) => state.hostForm.data.languageDescription);
    const form = useForm();
    const { register, handleSubmit, formState, setValue, watch } = form;
    const { errors } = formState;
    const languageInput = watch("language", undefined);
    useEffect(() => {
        setValue("languageDescription", languageDescription || "");
    }, [languageDescription, setValue]);
    const onSubmit = (data) => {
        dispatch(updateLanguageAndLevel({
            language: data.language,
            level: data.languageLevel,
        }));
    };
    //deletting a language
    const handleDelete = (index, event) => {
        if (event)
            event.preventDefault();
        dispatch(deleteLanguageAndLevel(index));
    };
    // for adding speaking or learning language
    return (_jsxs("div", { className: "flex w-full h-[87vh]", children: [_jsxs("div", { className: 'hidden md:flex flex-col gap-y-5 w-1/3 h-full bg-black items-center justify-center px-8 text-center', children: [_jsx("h5", { className: "text-3xl font-bold tracking-wide text-gray-900 uppercase", children: _jsx("span", { className: "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text", children: "RAIH" }) }), _jsxs("p", { className: 'text-lg font-medium text-white', children: ["Ready to share your space?", _jsx("br", {}), "Become a ", _jsx("span", { className: "text-yellow-400 font-semibold", children: "Raih Host" }), " and welcome travelers with open arms \uD83E\uDD1D\uD83C\uDFE1"] })] }), _jsx("div", { className: "flex w-full md:w-2/3 h-full bg-white   md:px-20 ", children: _jsxs("div", { className: "w-full h-full flex flex-col items-center    sm:px-0 lg:px-8", children: [_jsx("div", { className: "block mb-10 md:hidden -ml-8", children: _jsx(Logo, {}) }), _jsx("div", { className: " w-full md:w-[80%] lg:w-[90%] xl:w-[95%] items-center justify-center flex flex-col", children: _jsx("form", { className: " w-full  space-y-6", children: _jsxs("div", { className: "flex flex-col rounded-md shadow-sm -space-y-px border border-black  mt-5", children: [_jsxs("h1", { className: "p-4", children: [" ", "Tell volenteers about the languages you speak or learning"] }), openLanguageAndLevel ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "w-full p-7 flex gap-4", children: [_jsxs("div", { className: "flex flex-col w-full", children: [_jsx(Inputbox, { label: "Language", type: "text", isRequired: true, placeholder: "Enter language", ...register("language", {
                                                                        required: "Please enter a language",
                                                                    }), className: `${errors.language ? "border-red-500" : ""} dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base` }), errors.language && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.language.message }))] }), _jsxs("div", { className: "flex flex-col w-full", children: [_jsx("label", { className: "text-gray-700 dark:text-white text-sm font-medium mb-1", children: "Level" }), _jsxs("select", { ...register("languageLevel", {
                                                                        required: "Please select a level",
                                                                    }), className: `${errors.languageLevel ? "border-red-500" : ""} dark:bg-transparent block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`, children: [_jsx("option", { value: "beginner", children: "Beginner" }), _jsx("option", { value: "intermediate", children: "Intermediate" }), _jsx("option", { value: "expert", children: "Expert" })] }), errors.languageLevel && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.languageLevel.message }))] })] }), languageInput && (_jsx("button", { onClick: handleSubmit(onSubmit), className: "bg-blue-500 text-white px-4 py-2 rounded-md", children: "Add Language" })), languageAndLevel && languageAndLevel.length > 0 && (_jsx("div", { className: "mt-5 space-y-4", children: languageAndLevel.map((item, index) => (_jsxs("div", { className: "flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md", children: [_jsx("div", { className: "flex items-center gap-4", children: _jsxs("div", { className: "flex flex-col", children: [_jsx("h1", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: item.language }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Level: ", item.level] })] }) }), _jsx("button", { className: "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 shadow", onClick: () => handleDelete(index), type: "button", children: "Delete" })] }, index))) }))] })) : (_jsxs("div", { className: "pb-2", children: ["        ", _jsxs("button", { className: "bg-green-500 rounded-full mb-[21px] ml-[36px] flex items-center w-[180px] gap-2 px-4 py-2 text-white", onClick: (event) => {
                                                        event.preventDefault();
                                                        setOpenLanguageAndLevel(true);
                                                    }, children: [_jsx(IoIosAddCircleOutline, { size: 30 }), "Add Language"] })] })), _jsx(Divider, {}), _jsx("h1", { className: "pt-4 pl-4", children: "Whant to be shown as a host intrested in language exchange" }), _jsxs("div", { className: "flex items-center space-x-4 pl-4", children: [_jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "choice", value: "yes", className: "hidden peer", checked: showIntreastInLanguageExchange === "yes", onChange: (event) => handleChoiceChange(event) }), _jsx("div", { className: "w-5 h-5 border-2 border-green-500 rounded-full flex items-center justify-center peer-checked:bg-green-500" }), _jsx("span", { className: "text-green-600", children: "Yes" })] }), _jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "choice", value: "no", className: "hidden peer", checked: showIntreastInLanguageExchange === "no", onChange: (event) => handleChoiceChange(event) }), _jsx("div", { className: "w-5 h-5 border-2 border-red-500 rounded-full flex items-center justify-center peer-checked:bg-red-500" }), _jsx("span", { className: "text-red-600", children: "No" })] })] }), _jsx("h1", { className: "pt-4 pl-4 pb-2 font-thin", children: "More to Say About language exchange (optional)" }), _jsx("textarea", { className: "h-[200px] block w-full md:w-[80%] lg:w-[90%] xl:w-[95%] ml-4 mb-5 px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 \r\n  placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none \r\n  focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base", ...register("languageDescription"), onChange: (e) => {
                                                const value = e.target.value;
                                                setValue("languageDescription", value, { shouldValidate: true });
                                                dispatch(updateLanguageDescription(value));
                                            } }), _jsxs("div", { className: "flex w-full justify-between py-3 px-4 ", children: [_jsx("button", { className: "px-4  rounded bg-slate-400", onClick: () => dispatch(prevStep()), children: "Back" }), languageAndLevel.length > 0 ? (_jsx("button", { className: "px-4  rounded bg-green-500", onClick: () => dispatch(nextStep()), children: "Contine" })) : _jsx("button", { disabled: true, className: "px-4  rounded bg-slate-400", onClick: () => dispatch(nextStep()), children: "Contine" })] })] }) }) })] }) }), _jsx(Toaster, { richColors: true })] }));
};
export default AddLanguage;
