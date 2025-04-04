import React, { useState } from "react";
import Logo from "../Logo";
import { Toaster } from "sonner";
import Divider from "../Divider";
import { useForm } from "react-hook-form";
import PlacesAutocomplete from "../placeAutoCompleteAndMap/PlaceAutoComplete";
import { AppDispatch } from "../../redux/store";
import { useDispatch } from "react-redux";
import { nextStep, prevStep } from "../../redux/Slices/hostFormSlice";

const Address= () => {
  const dispatch=useDispatch<AppDispatch>()

  type formValues = {
    address: "[]";
    email: string;
  };
  const form = useForm<formValues>();
  const { register, handleSubmit, formState } = form;
  const { errors } = formState;

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
            <form className=" w-full  space-y-6">
              <div className="flex flex-col rounded-md shadow-sm -space-y-px border border-black  mt-5">
                <h1 className="ml-5 pb-4">
                  {" "}
                  Enter your addre where you will ne hoting
                </h1>
                <span className="ml-5 mb-2" >
                  your addres (including streeet/house/building number)
                </span>{" "}
                <PlacesAutocomplete/>
                <Divider />

                <div className="flex w-full justify-between py-3 px-4 ">
                  <button className="px-4  rounded bg-slate-400" onClick={() => dispatch(prevStep())}>Back</button>
                  <button className="px-4  rounded bg-slate-400" onClick={() => dispatch(nextStep())}>
                    Contine
                  </button>
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

export default Address;
