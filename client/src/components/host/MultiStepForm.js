import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useSelector, useDispatch } from "react-redux";
import AddImage from "./AddImages";
import DescriptionAndHelps from "./DescriptionAndHelps";
import AddLanguage from "./AddLanguage";
import AllowedAccepted from "./AllowedAccepted";
import Address from "./Address";
import { useEffect } from "react";
const MultiStepForm = () => {
    const dispatch = useDispatch();
    const step = useSelector((state) => state.hostForm.step);
    useEffect(() => {
        console.log("Step changed:", step);
    }, [step]);
    const formData = useSelector((state) => state.hostForm.data);
    return (_jsxs(_Fragment, { children: [step === 1 && _jsx(DescriptionAndHelps, {}), step === 2 && _jsx(AddLanguage, {}), step === 3 && _jsx(AllowedAccepted, {}), step === 4 && _jsx(Address, {}), step === 5 && _jsx(AddImage, {})] }));
};
export default MultiStepForm;
