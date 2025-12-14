import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Logo from "../Logo";
import { Toaster } from "sonner";
import Divider from "../Divider";
import { useDispatch } from "react-redux";
import { nextStep, prevStep, updateAddress } from "../../redux/Slices/hostFormSlice";
import PlacesAutocompleteForHost from "../placeAutoCompleteAndMap/PlaeAutocompleteForHost";
const Address = () => {
    const dispatch = useDispatch();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const handleAddressSelect = (place) => {
        console.log("Selected place in parent:", place);
        setSelectedAddress(place);
        dispatch(updateAddress(place));
    };
    return (_jsxs("div", { className: "flex w-full h-[100vh]", children: [_jsxs("div", { className: 'hidden md:flex flex-col gap-y-5 w-1/3 h-full bg-black items-center justify-center px-8 text-center', children: [_jsx("h5", { className: "text-3xl font-bold tracking-wide text-gray-900 uppercase", children: _jsx("span", { className: "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text", children: "RAIH" }) }), _jsxs("p", { className: 'text-lg font-medium text-white', children: ["Ready to share your space?", _jsx("br", {}), "Become a ", _jsx("span", { className: "text-yellow-400 font-semibold", children: "Raih Host" }), " and welcome travelers with open arms \uD83E\uDD1D\uD83C\uDFE1"] })] }), _jsx("div", { className: "flex w-full md:w-2/3 h-full bg-white   md:px-20 ", children: _jsxs("div", { className: "w-full h-full flex flex-col items-center    sm:px-0 lg:px-8", children: [_jsx("div", { className: "block mb-10 md:hidden -ml-8", children: _jsx(Logo, {}) }), _jsx("div", { className: " w-full md:w-[80%] lg:w-[90%] xl:w-[95%]  flex flex-col", children: _jsx("form", { className: " w-full  space-y-6", children: _jsxs("div", { className: "flex flex-col rounded-md shadow-sm -space-y-px border border-black  mt-5", children: [_jsxs("h1", { className: "ml-5 pb-4", children: [" ", "Enter your addre where you will ne hoting"] }), _jsx("span", { className: "ml-5 mb-2", children: "your addres (including streeet/house/building number)" }), " ", _jsx(PlacesAutocompleteForHost, { onSelectAddress: handleAddressSelect }), _jsx(Divider, {}), _jsxs("div", { className: "flex w-full justify-between py-3 px-4 ", children: [_jsx("button", { className: "px-4  rounded bg-slate-400", onClick: () => dispatch(prevStep()), children: "Back" }), _jsx("button", { className: "px-4  rounded bg-slate-400", onClick: () => dispatch(nextStep()), children: "Contine" })] })] }) }) })] }) }), _jsx(Toaster, { richColors: true })] }));
};
export default Address;
