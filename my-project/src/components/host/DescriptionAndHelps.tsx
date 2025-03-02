import React, { useEffect, useState } from "react";
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
import { AppDispatch, RootState } from "../../redux/store";
import {
  nextStep,
  toggleHelpType,
  updateDescription,
} from "../../redux/hostFormSlice";
import { BiLeaf } from "react-icons/bi";
const DescriptionAndHelps = () => {
  const dispatch = useDispatch<AppDispatch>();

  // getting all helptypes from redux store
  const selectedHelpTypes = useSelector(
    (state: RootState) => state.hostForm.data.selectedHelpTypes
  );

  //getting description
  const description = useSelector(
    (state: RootState) => state.hostForm.data.description
  );

  const helpOptions = [
    { label: "Cooking", icon: <PiCookingPot size={60} /> },
    { label: "Art", icon: <GiDrowning size={60} /> },
    { label: "Teaching", icon: <GiTeacher size={60} /> },
    { label: "Gardening", icon: <MdOutlineElderlyWoman size={60} /> },
    { label: "Animal Care", icon: <LuTrees size={60} /> },
    { label: "Help with Computer", icon: <LuTrees size={60} /> },
    { label: "Language Practice", icon: <FaLanguage size={60} /> },
    { label: "Help Around House", icon: <FaHammer size={60} /> },
    { label: "Babysitting and Creative play", icon: <FaLanguage size={60} /> },
    { label: "  DIV  Projects", icon: <FaHammer size={60} /> },
    { label: "  Eco  projects", icon: <BiLeaf size={60} /> },
  ];

  //for setting help type required
  const handleToggle = (helpType: string) => {
    dispatch(toggleHelpType(helpType));
  };

  type addDescription = {
    description: string;
  };
  const onSubmit = (data: addDescription) => {
    console.log("Form submitted with data:", data);
    if (selectedHelpTypes.length < 3) {
      toast.error(" pleae elect atleat 3 helps");
    } else {
      dispatch(nextStep());
    }
  };

  const form = useForm<addDescription>();
  const { register, handleSubmit, setValue, formState } = form;
  const { errors } = formState;

  // Sync Redux state with React Hook Form
  useEffect(() => {
    setValue("description", description);
  }, [description, setValue]);
  return (
    <div className="flex w-full h-[100vh]">
      {/* LEFT */}
      <div className="hidden md:flex flex-col gap-y-4 w-1/3 h-full bg-black items-center justify-center">
        <Logo />
        <span className="text-xl font-semibold text-white">Welcome!</span>
      </div>

      {/* RIGHT */}
      <div className="flex w-full md:w-2/3 h-full bg-white   md:px-20 ">
        <div className="w-full h-full flex flex-col items-center    sm:px-0 lg:px-8">
          <div className="block mb-10 md:hidden -ml-8">
            <Logo />
          </div>

          <div className=" w-full md:w-[80%] lg:w-[90%] xl:w-[95%]  flex flex-col">
            <form
              className=" w-full  space-y-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex flex-col rounded-md shadow-sm -space-y-px border border-black  mt-5">
                <h1 className="font-bold pt-2 pl-3">
                  Describe the kind of help you like{" "}
                </h1>
                <textarea
                  className="dark:bg-transparent block w-full md:w-[80%] lg:w-[90%] xl:w-[95%] ml-4 px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 
  placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none 
  focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base"
                  {...register("description", {
                    required: "Description is required",
                    minLength: {
                      value: 100,
                      message: "Description must be at least 100 characters",
                    },
                  })}
                  onChange={(e) => {
                    setValue("description", e.target.value, {
                      shouldValidate: true,
                    }); // Ensures validation runs on change
                    dispatch(updateDescription(e.target.value)); // Updates Redux store
                  }}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-3 pl-5">
                    {errors.description.message}
                  </p>
                )}

                <h1 className="font-bold pt-2 pl-3">Select Help Type </h1>
                <div className="flex flex-row flex-wrap  w-full p-3 pl-12 gap-2 text-black">
                  {helpOptions.map((option) => (
                    <div
                      key={option.label}
                      className={`p-4 border rounded flex flex-col items-center cursor-pointer transition-all duration-300 ${
                        selectedHelpTypes.includes(option.label)
                          ? "border-green-500 bg-green-100" // ✅ Highlight selected items
                          : "border-black hover:border-gray-500"
                      }`}
                      onClick={() => handleToggle(option.label)}
                    >
                      {option.icon}
                      <span className="mt-2">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                label="Continue"
                type="submit"
                styles="group relative w-full flex justify-center py-2.5 2xl:py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-black dark:bg-rose-800 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 "
              />
            </form>
          </div>
        </div>
      </div>

      <Toaster richColors />
    </div>
  );
};

export default DescriptionAndHelps;
