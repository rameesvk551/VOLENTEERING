import React, { useState } from "react";
import Logo from "../Logo";
import { Toaster } from "sonner";
import { IoIosAddCircleOutline } from "react-icons/io";
import Button from "../Button";
import Divider from "../Divider";
import TextArea from "../TextArea";
import { boolean } from "yup";
import Inputbox from "../Inputbox";
import { useForm } from "react-hook-form";
import {
  MdFamilyRestroom,
  MdPets,
  MdSignalWifiStatusbarConnectedNoInternet1,
  MdSmokingRooms,
} from "react-icons/md";
import { FaLaptopFile, FaWifi } from "react-icons/fa6";
import { TbCamper } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  addAccepted,
  addAllowed,
  nextStep,
  prevStep,
  updateOrganisation,
  updatePrivateComment,
} from "../../redux/Slices/hostFormSlice";

const AllowedAccepted = () => {
  const dispatch = useDispatch<AppDispatch>();
  const allowedThings = useSelector(
    (state: RootState) => state.hostForm.data.allowed
  );
  const acceptedThings = useSelector(
    (state: RootState) => state.hostForm.data.accepted
  );
  type formValues = {
    address: string[];
  };
  const form = useForm<formValues>();
  const { register, handleSubmit, formState } = form;
  const { errors } = formState;

  const handleAccepted = (acceptedThing: string) => {
    dispatch(addAccepted(acceptedThing));
  };
  const handleAllowed = (allowedThing: string) => {
    dispatch(addAllowed(allowedThing));
  };
  const handlePrivateComment=(privateComment:string)=>{
    dispatch(updatePrivateComment(privateComment))

  }
  const handleOrganisationName=(privateComment:string)=>{
    dispatch(updateOrganisation(privateComment))

  }
  const allowed = [
    { id: 1, icon: <FaLaptopFile size={60} />, label: "Digital Nomad" },
    { id: 2, icon: <MdFamilyRestroom size={60} />, label: "Families" },
    { id: 3, icon: <TbCamper size={60} />, label: "Campers" },
    { id: 4, icon: <MdPets size={60} />, label: "Travelling with pet" },
  ];
  const accepted = [
    { id: 1, icon: <FaWifi size={60} />, label: "Internet Access" },
    { id: 2, icon: <MdPets size={60} />, label: "Pets at Home" },
    { id: 3, icon: <MdSmokingRooms size={60} />, label: "Smokers" },
    {
      id: 3,
      icon: <MdSignalWifiStatusbarConnectedNoInternet1 size={60} />,
      label: "Limited Internet",
    },
  ];

  return (
    <div className="flex w-full h-[100vh]">
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

          <div className=" w-full md:w-[80%] lg:w-[90%] xl:w-[95%]  flex flex-col">
            <form className=" w-full  space-y-6">
              <div className="flex flex-col rounded-md shadow-sm -space-y-px  mt-8">
                <h1 className="p-4">
                  Select those that apply to you and your place
                </h1>
                <div className="flex gap-9 pb-10">
                  {accepted &&
                    accepted.map((option) => (
                      <div
                        key={option.label}
                        className={`flex flex-col border  border-black px-5  items-center  cursor-pointer ${
                          acceptedThings.includes(option.label)
                            ? "border-green-500 bg-green-100" // ✅ Highlight selected items
                            : "border-black hover:border-gray-500"
                        }`}
                        onClick={() => handleAccepted(option.label)}
                      >
                        {option.icon} {option.label}
                      </div>
                    ))}
                </div>
                <Divider />
                <h1 className="p-4">
                  Are you able to accept those type of travellers
                </h1>
                <div className="flex gap-8 pb-10">
                  {allowed.map((option) => (
                    <div
                      key={option.label}
                      className={`flex flex-col border  border-black px-5  items-center  cursor-pointer  ${
                        allowedThings.includes(option.label)
                          ? "border-green-500 bg-green-100"
                          : "border-black hover:border-gray-500"
                      }`}
                      onClick={() => handleAllowed(option.label)}
                    >
                      {option.icon}
                      <span className="mt-2">{option.label}</span>
                    </div>
                  ))}
                </div>
                <Divider />
                <div className=" pt-5">
                  <h1>Optional private comment for workaway team</h1>

                  <input
                    type="text"
                    name="privateComment"
                    placeholder="....."
                    className={`dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}
                 onChange={(e)=>handlePrivateComment(e.target.value)}
                 />
                  <h1 className="pt-3"> Organisation/business/project-name</h1>
                  <input
                    name="organisation"
                    type=""
                    placeholder="please enter your organiation/bussiness/project-name"
                    className={`dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}
                    onChange={(e)=>handleOrganisationName(e.target.value)}
                  />
                </div>
                <div className="flex w-full justify-between py-3 px-4 ">
                  <button
                    className="px-4  rounded bg-slate-400"
                    onClick={() => dispatch(prevStep())}
                  >
                    Back
                  </button>

                  <button
                    className="px-4  rounded bg-green-500"
                    onClick={() => dispatch(nextStep())}
                  >
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

export default AllowedAccepted;
