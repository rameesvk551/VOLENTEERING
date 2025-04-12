import React, { useEffect, useState } from "react";
import Logo from "../Logo";
import { Toaster } from "sonner";
import { IoIosAddCircleOutline } from "react-icons/io";
import Button from "../Button";
import Divider from "../Divider";
import TextArea from "../TextArea";
import { boolean } from "yup";
import Inputbox from "../Inputbox";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  deleteLanguageAndLevel,
  nextStep,
  prevStep,
  updateIntrestInLanguageExchange,
  updateLanguageAndLevel,
  updateLanguageDescription,
} from "../../redux/Slices/hostFormSlice";
import { data } from "react-router-dom";

const AddLanguage = () => {
  const [canContinue,setCnContinue] = 
  useState<boolean>(false)
  const [openLanguageAndLevel, setOpenLanguageAndLevel] =
  useState<boolean>(false);
  type formValues = {
    language: string;
    languageLevel: string;
    languageDescription: string;
  };
  
 
  const dispatch = useDispatch<AppDispatch>();
  const showIntreastInLanguageExchange = useSelector(
    (state: RootState) => state.hostForm.data.showIntreastInLanguageExchange
  );

  const handleChoiceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateIntrestInLanguageExchange(event.target.value));
  };
  // getting all languages and level from redux store
  const languageAndLevel = useSelector(
    (state: RootState) => state.hostForm.data.languageAndLevel
  );

  //getting  language description
  const languageDescription = useSelector(
    (state: RootState) => state.hostForm.data.languageDescription
  );
 
  const form = useForm<formValues>();
  const { register, handleSubmit, formState,setValue, watch } = form;
  const { errors } = formState;
  const languageInput = watch("language", undefined);
  useEffect(() => {
    setValue("languageDescription", languageDescription || "");
  }, [languageDescription, setValue]);
  
  const onSubmit = (data: formValues) => {
      dispatch(
        updateLanguageAndLevel({
          language: data.language,
          level: data.languageLevel,
        })
      );
    
  };


  

  //deletting a language
  const handleDelete = (index: number, event?: React.MouseEvent) => {
    if (event) event.preventDefault(); 
    dispatch(deleteLanguageAndLevel(index));
  };
  
  // for adding speaking or learning language


  return (
    <div className="flex w-full h-[87vh]">
      {/* LEFT */}
          {/* LEFT */}
          <div className='hidden md:flex flex-col gap-y-5 w-1/3 h-full bg-black items-center justify-center px-8 text-center'>
  <h5 className="text-3xl font-bold tracking-wide text-gray-900 uppercase">
    <span className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text">RAIH</span>
  </h5>
  <p className='text-lg font-medium text-white'>
    Ready to share your space?<br />
    Become a <span className="text-yellow-400 font-semibold">Raih Host</span> and welcome travelers with open arms 🤝🏡
  </p>
</div>

      {/* RIGHT */}
      <div className="flex w-full md:w-2/3 h-full bg-white   md:px-20 ">
        <div className="w-full h-full flex flex-col items-center    sm:px-0 lg:px-8">
          <div className="block mb-10 md:hidden -ml-8">
            <Logo />
          </div>

          <div className=" w-full md:w-[80%] lg:w-[90%] xl:w-[95%] items-center justify-center flex flex-col">
            <form className=" w-full  space-y-6" >
              <div className="flex flex-col rounded-md shadow-sm -space-y-px border border-black  mt-5">
                <h1 className="p-4">
                  {" "}
                  Tell volenteers about the languages you speak or learning
                </h1>
                {openLanguageAndLevel ? (
                  <>
                    <div className="w-full p-7 flex gap-4">
                      {/* Language Input */}
                      <div className="flex flex-col w-full">
                        <Inputbox
                          label="Language"
                          type="text"
                          isRequired={true}
                          placeholder="Enter language"
                          {...register("language", {
                            required: "Please enter a language",
                          })}
                          className={`${
                            errors.language ? "border-red-500" : ""
                          } dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}
                        />
                        {errors.language && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.language.message}
                          </p>
                        )}
                      </div>

                      {/* Language Level Dropdown */}
                      <div className="flex flex-col w-full">
                        <label className="text-gray-700 dark:text-white text-sm font-medium mb-1">
                          Level
                        </label>
                        <select
                          {...register("languageLevel", {
                            required: "Please select a level",
                          })}
                          className={`${
                            errors.languageLevel ? "border-red-500" : ""
                          } dark:bg-transparent block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="expert">Expert</option>
                        </select>
                        {errors.languageLevel && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.languageLevel.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {languageInput && (
                      <button
                        onClick={handleSubmit(onSubmit)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                      >
                        Add Language
                      </button>
                    )}

                    {/* Display Selected Languages */}
                    {languageAndLevel && languageAndLevel.length > 0 && (
                      <div className="mt-5 space-y-4">
                        {languageAndLevel.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md"
                          >
                            {/* Language & Level */}
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {item.language}
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Level: {item.level}
                                </p>
                              </div>
                            </div>

                            {/* Delete Button */}
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 shadow"
                              onClick={() => handleDelete(index)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
          <div className="pb-2">        <button
          className="bg-green-500 rounded-full mb-[21px] ml-[36px] flex items-center w-[180px] gap-2 px-4 py-2 text-white"
          onClick={(event) => {
            event.preventDefault();
            setOpenLanguageAndLevel(true);
          }}
        >
          <IoIosAddCircleOutline size={30} />
          Add Language
        </button></div>
                )}

                <Divider />
                <h1 className="pt-4 pl-4">
                  Whant to be shown as a host intrested in language exchange
                </h1>
                <div className="flex items-center space-x-4 pl-4">
                  {/* Yes Option */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="choice"
                      value="yes"
                      className="hidden peer"
                      checked={showIntreastInLanguageExchange === "yes"}
                      onChange={(event) => handleChoiceChange(event)}

                    />
                    <div className="w-5 h-5 border-2 border-green-500 rounded-full flex items-center justify-center peer-checked:bg-green-500"></div>
                    <span className="text-green-600">Yes</span>
                  </label>

                  {/* No Option */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="choice"
                      value="no"
                      className="hidden peer"
                      checked={showIntreastInLanguageExchange === "no"}
                      onChange={(event) => handleChoiceChange(event)}

                    />
                    <div className="w-5 h-5 border-2 border-red-500 rounded-full flex items-center justify-center peer-checked:bg-red-500"></div>
                    <span className="text-red-600">No</span>
                  </label>
                </div>

                <h1 className="pt-4 pl-4 pb-2 font-thin">
                  More to Say About language exchange (optional)
                </h1>
                <textarea
  className="h-[200px] block w-full md:w-[80%] lg:w-[90%] xl:w-[95%] ml-4 mb-5 px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 
  placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none 
  focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base"
  {...register("languageDescription")}
  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value: string = e.target.value;
    setValue("languageDescription", value, { shouldValidate: true }); 
    dispatch(updateLanguageDescription(value));
  }}
/>


                <div className="flex w-full justify-between py-3 px-4 ">
          
                  <button
                    className="px-4  rounded bg-slate-400"
                    onClick={() => dispatch(prevStep())}
                  >
                    Back
                  </button>
                  {languageAndLevel.length > 0 ? (
                   <button
                   className="px-4  rounded bg-green-500"
                   onClick={() => dispatch(nextStep())}
                 >
                   Contine
                 </button>
                 ): <button
                 disabled
                 className="px-4  rounded bg-slate-400"
                 onClick={() => dispatch(nextStep())}
               >
                 Contine
               </button>

                  }
                 
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toaster richColors />
    </div>
  );
};

export default AddLanguage;
