import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Logo from "../Logo";
import { Toaster } from "sonner";
import Divider from "../Divider";
import { useForm } from "react-hook-form";
import { MdFamilyRestroom, MdPets, MdSignalWifiStatusbarConnectedNoInternet1, MdSmokingRooms, } from "react-icons/md";
import { FaLaptopFile, FaWifi } from "react-icons/fa6";
import { TbCamper } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { addAccepted, addAllowed, nextStep, prevStep, updateOrganisation, updatePrivateComment, } from "../../redux/Slices/hostFormSlice";
const AllowedAccepted = () => {
    const dispatch = useDispatch();
    const allowedThings = useSelector((state) => state.hostForm.data.allowed);
    const acceptedThings = useSelector((state) => state.hostForm.data.accepted);
    const form = useForm();
    const { register, handleSubmit, formState } = form;
    const { errors } = formState;
    const handleAccepted = (acceptedThing) => {
        dispatch(addAccepted(acceptedThing));
    };
    const handleAllowed = (allowedThing) => {
        dispatch(addAllowed(allowedThing));
    };
    const handlePrivateComment = (privateComment) => {
        dispatch(updatePrivateComment(privateComment));
    };
    const handleOrganisationName = (privateComment) => {
        dispatch(updateOrganisation(privateComment));
    };
    const allowed = [
        { id: 1, icon: _jsx(FaLaptopFile, { size: 60 }), label: "Digital Nomad" },
        { id: 2, icon: _jsx(MdFamilyRestroom, { size: 60 }), label: "Families" },
        { id: 3, icon: _jsx(TbCamper, { size: 60 }), label: "Campers" },
        { id: 4, icon: _jsx(MdPets, { size: 60 }), label: "Travelling with pet" },
    ];
    const accepted = [
        { id: 1, icon: _jsx(FaWifi, { size: 60 }), label: "Internet Access" },
        { id: 2, icon: _jsx(MdPets, { size: 60 }), label: "Pets at Home" },
        { id: 3, icon: _jsx(MdSmokingRooms, { size: 60 }), label: "Smokers" },
        {
            id: 3,
            icon: _jsx(MdSignalWifiStatusbarConnectedNoInternet1, { size: 60 }),
            label: "Limited Internet",
        },
    ];
    return (_jsxs("div", { className: "flex w-full h-[100vh]", children: [_jsxs("div", { className: 'hidden md:flex flex-col gap-y-5 w-1/3 h-full bg-black items-center justify-center px-8 text-center', children: [_jsx("h5", { className: "text-3xl font-bold tracking-wide text-gray-900 uppercase", children: _jsx("span", { className: "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text", children: "RAIH" }) }), _jsxs("p", { className: 'text-lg font-medium text-white', children: ["Ready to share your space?", _jsx("br", {}), "Become a ", _jsx("span", { className: "text-yellow-400 font-semibold", children: "Raih Host" }), " and welcome travelers with open arms \uD83E\uDD1D\uD83C\uDFE1"] })] }), _jsx("div", { className: "flex w-full md:w-2/3 h-full bg-white   md:px-20 ", children: _jsxs("div", { className: "w-full h-full flex flex-col items-center    sm:px-0 lg:px-8", children: [_jsx("div", { className: "block mb-10 md:hidden -ml-8", children: _jsx(Logo, {}) }), _jsx("div", { className: " w-full md:w-[80%] lg:w-[90%] xl:w-[95%]  flex flex-col", children: _jsx("form", { className: " w-full  space-y-6", children: _jsxs("div", { className: "flex flex-col rounded-md shadow-sm -space-y-px  mt-8", children: [_jsx("h1", { className: "p-4", children: "Select those that apply to you and your place" }), _jsx("div", { className: "flex gap-9 pb-10", children: accepted &&
                                                accepted.map((option) => (_jsxs("div", { className: `flex flex-col border  border-black px-5  items-center  cursor-pointer ${acceptedThings.includes(option.label)
                                                        ? "border-green-500 bg-green-100" // ✅ Highlight selected items
                                                        : "border-black hover:border-gray-500"}`, onClick: () => handleAccepted(option.label), children: [option.icon, " ", option.label] }, option.label))) }), _jsx(Divider, {}), _jsx("h1", { className: "p-4", children: "Are you able to accept those type of travellers" }), _jsx("div", { className: "flex gap-8 pb-10", children: allowed.map((option) => (_jsxs("div", { className: `flex flex-col border  border-black px-5  items-center  cursor-pointer  ${allowedThings.includes(option.label)
                                                    ? "border-green-500 bg-green-100"
                                                    : "border-black hover:border-gray-500"}`, onClick: () => handleAllowed(option.label), children: [option.icon, _jsx("span", { className: "mt-2", children: option.label })] }, option.label))) }), _jsx(Divider, {}), _jsxs("div", { className: " pt-5", children: [_jsx("h1", { children: "Optional private comment for workaway team" }), _jsx("input", { type: "text", name: "privateComment", placeholder: ".....", className: `dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`, onChange: (e) => handlePrivateComment(e.target.value) }), _jsx("h1", { className: "pt-3", children: " Organisation/business/project-name" }), _jsx("input", { name: "organisation", type: "", placeholder: "please enter your organiation/bussiness/project-name", className: `dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`, onChange: (e) => handleOrganisationName(e.target.value) })] }), _jsxs("div", { className: "flex w-full justify-between py-3 px-4 ", children: [_jsx("button", { className: "px-4  rounded bg-slate-400", onClick: () => dispatch(prevStep()), children: "Back" }), _jsx("button", { className: "px-4  rounded bg-green-500", onClick: () => dispatch(nextStep()), children: "Contine" })] })] }) }) })] }) }), _jsx(Toaster, { richColors: true })] }));
};
export default AllowedAccepted;
