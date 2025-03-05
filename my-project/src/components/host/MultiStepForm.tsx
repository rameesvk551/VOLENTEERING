import { useSelector, useDispatch } from "react-redux";
import HostSignup from "../signup/HostSignup";
import { RootState } from "../../redux/store";
import AddImage from "./AddImages";
import DescriptionAndHelps from "./DescriptionAndHelps";
import AddLanguage from "./AddLanguage";
import AllowedAccepted from "./AllowedAccepted";
import Address from "./Address";



const MultiStepForm = () => {
  const dispatch = useDispatch();
  const step = useSelector((state: RootState) => state.hostForm.step);
  const formData = useSelector((state: RootState) => state.hostForm.data);

  return (
    <>
      {step === 1 && <HostSignup/>}
      {step === 2 && <DescriptionAndHelps/>}
      {step === 3 && <AddLanguage />}
      {step === 4 && <AllowedAccepted />}
      {step === 5 && <Address />}
      {step === 6 && <AddImage />}
  
 </>
  );
};



export default MultiStepForm;
