import React from 'react';
import { useAppSelector } from '@redux/hooks';
import { RootState } from '@redux/store';
import DescriptionAndHelps from './DescriptionAndHelps';
import AddLanguage from './AddLanguage';
import AllowedAccepted from './AllowedAccepted';
import Address from './Address';
import AddImages from './AddImages';

const MultiStepForm: React.FC = () => {
  const step = useAppSelector((state: RootState) => state.hostForm.step);

  return (
    <>
      {step === 1 && <DescriptionAndHelps />}
      {step === 2 && <AddLanguage />}
      {step === 3 && <AllowedAccepted />}
      {step === 4 && <Address />}
      {step === 5 && <AddImages />}
    </>
  );
};

export default MultiStepForm;
