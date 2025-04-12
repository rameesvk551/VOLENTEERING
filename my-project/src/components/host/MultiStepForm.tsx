import { useSelector, useDispatch } from "react-redux";
import HostSignup from "../signup/HostSignup";
import { RootState } from "../../redux/store";
import AddImage from "./AddImages";
import DescriptionAndHelps from "./DescriptionAndHelps";
import AddLanguage from "./AddLanguage";
import AllowedAccepted from "./AllowedAccepted";
import Address from "./Address"
import { useEffect } from "react";



const MultiStepForm = () => {
  const dispatch = useDispatch();
  const step = useSelector((state: RootState) => state.hostForm.step);
  useEffect(() => {
    console.log("Step changed:", step);
  }, [step]); 
  
  const formData = useSelector((state: RootState) => state.hostForm.data);

  return (
    <>

      {step === 1 && <DescriptionAndHelps/>}
      {step === 2 && <AddLanguage />}
      {step === 3 && <AllowedAccepted />}
      {step === 4 && <Address />}
      {step === 5 && <AddImage />}
  
 </>
  );
};



export default MultiStepForm;
