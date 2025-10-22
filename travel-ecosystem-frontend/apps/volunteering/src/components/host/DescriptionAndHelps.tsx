import React, { useEffect } from 'react';
import Logo from '../Logo';
import { Toaster, toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { RootState } from '@redux/store';
import { nextStep, toggleHelpType, updateDescription } from '@redux/Slices/hostFormSlice';
import { GiDrowning, GiTeacher } from 'react-icons/gi';
import { MdOutlineElderlyWoman } from 'react-icons/md';
import { LuTrees } from 'react-icons/lu';
import { PiCookingPot } from 'react-icons/pi';
import { FaHammer, FaLanguage } from 'react-icons/fa6';
import { BiLeaf } from 'react-icons/bi';

const helpOptions = [
  { label: 'Cooking', icon: <PiCookingPot size={60} /> },
  { label: 'Art', icon: <GiDrowning size={60} /> },
  { label: 'Teaching', icon: <GiTeacher size={60} /> },
  { label: 'Gardening', icon: <MdOutlineElderlyWoman size={60} /> },
  { label: 'Animal Care', icon: <LuTrees size={60} /> },
  { label: 'Help with Computer', icon: <LuTrees size={60} /> },
  { label: 'Language Practice', icon: <FaLanguage size={60} /> },
  { label: 'Help Around House', icon: <FaHammer size={60} /> },
  { label: 'Babysitting and Creative play', icon: <FaLanguage size={60} /> },
  { label: 'DIV Projects', icon: <FaHammer size={60} /> },
  { label: 'Eco projects', icon: <BiLeaf size={60} /> },
];

type DescriptionForm = {
  description: string;
};

const DescriptionAndHelps: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedHelpTypes = useAppSelector((state: RootState) => state.hostForm.data.selectedHelpTypes) as string[];
  const description = useAppSelector((state: RootState) => state.hostForm.data.description) as string;

  const form = useForm<DescriptionForm>();
  const { register, handleSubmit, setValue, formState } = form;
  const { errors } = formState;

  useEffect(() => {
    setValue('description', description);
  }, [description, setValue]);

  const handleToggle = (helpType: string) => {
    dispatch(toggleHelpType(helpType));
  };

  const onSubmit = (data: DescriptionForm) => {
    if (selectedHelpTypes.length < 3) {
      toast.error('Please select at least 3 help types');
    } else {
      dispatch(nextStep());
    }
  };

  return (
    <div className="flex w-full h-[100vh]">
      <div className="hidden md:flex flex-col gap-y-5 w-1/3 h-full bg-black items-center justify-center px-8 text-center">
        <h5 className="text-3xl font-bold tracking-wide text-gray-900 uppercase">
          <span className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text">RAIH</span>
        </h5>
        <p className="text-lg font-medium text-white">
          Ready to share your space?
          <br />
          Become a <span className="text-yellow-400 font-semibold">Raih Host</span> and welcome travelers with open arms 🤝🏡
        </p>
      </div>

      <div className="flex w-full md:w-2/3 h-full bg-white md:px-20">
        <div className="w-full h-full flex flex-col items-center sm:px-0 lg:px-8">
          <div className="block mb-10 md:hidden -ml-8">
            <Logo />
          </div>

          <div className="w-full md:w-[80%] lg:w-[90%] xl:w-[95%] flex flex-col">
            <form className="w-full space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col rounded-md shadow-sm -space-y-px border border-black mt-5">
                <h1 className="font-bold pt-2 pl-3">Describe the kind of help you like</h1>
                <textarea
                  className="dark:bg-transparent block w-full md:w-[80%] lg:w-[90%] xl:w-[95%] ml-4 px-3 py-2.5 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base"
                  {...register('description', {
                    required: 'Description is required',
                    minLength: {
                      value: 100,
                      message: 'Description must be at least 100 characters',
                    },
                  })}
                  onChange={(e) => {
                    setValue('description', e.target.value, {
                      shouldValidate: true,
                    });
                    dispatch(updateDescription(e.target.value));
                  }}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-3 pl-5">{errors.description.message}</p>
                )}

                <h1 className="font-bold pt-2 pl-3">Select Help Type</h1>
                <div className="flex flex-row flex-wrap w-full p-3 pl-12 gap-2 text-black">
                  {helpOptions.map((option) => (
                    <div
                      key={option.label}
                      className={`p-4 border rounded flex flex-col items-center cursor-pointer transition-all duration-300 ${
                        selectedHelpTypes.includes(option.label)
                          ? 'border-green-500 bg-green-100'
                          : 'border-black hover:border-gray-500'
                      }`}
                      onClick={() => handleToggle(option.label)}
                    >
                      {option.icon}
                      <span className="mt-2">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>

      <Toaster richColors />
    </div>
  );
};

export default DescriptionAndHelps;
