import { useSelector, useDispatch } from "react-redux";
import HostSignup from "../signup/HostSignup";
import { RootState } from "../../redux/store";
import AddDetails2 from "./AddLanguage";
import AddDetails from "./DescriptionAndHelps";
import AddDetails3 from "./AddDetails3";
import AddDetails4 from "./AddDetails4";
import AddImage from "./AddImage";
import DescriptionAndHelps from "./DescriptionAndHelps";



const MultiStepForm = () => {
  const dispatch = useDispatch();
  const step = useSelector((state: RootState) => state.hostForm.step);
  const formData = useSelector((state: RootState) => state.hostForm.data);

  return (
    <>
      {step === 2 && <HostSignup/>}
      {step === 3 && <DescriptionAndHelps/>}
      {step === 1 && <AddDetails2 />}
      {step === 4 && <AddDetails3 />}
      {step === 5 && <AddDetails4 />}
      {step === 6 && <AddImage />}
  
 </>
  );
};



export default MultiStepForm;
