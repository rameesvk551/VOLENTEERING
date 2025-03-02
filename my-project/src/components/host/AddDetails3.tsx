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

const AddDetails3 = () => {
  type formValues = {
    address: string[];
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
              <div className="flex flex-col rounded-md shadow-sm -space-y-px  mt-8">
                <h1 className="p-4">
                  Select those that apply to you and your place
                </h1>
                <div className="flex gap-9 pb-10">
                  <div className="flex flex-col border  border-black px-6  items-center">
                    <FaWifi size={60} className="" />
                    Internet Access
                  </div>
                  <div className="flex flex-col border border-black  px-6  items-center ">
                    <MdPets size={60} />
                    Pets at Home
                  </div>
                  <div className="flex flex-col border border-black  px-6  items-center ">
                    <MdSmokingRooms size={60} />
                    Smokers
                  </div>
                  <div className="flex flex-col  border border-black  px-2 items-center">
                    <MdSignalWifiStatusbarConnectedNoInternet1 size={60} />{" "}
                    Limited Internet
                  </div>
                </div>
                <Divider />
                <h1 className="p-4">
                  Are you able to accept those type of travellers
                </h1>
                <div className="flex gap-9 pb-10">
                  <div className="flex flex-col border  border-black px-6  items-center">
                    <FaLaptopFile size={60} className="" />
                    Digital Nomad
                  </div>
                  <div className="flex flex-col border border-black  px-6  items-center ">
                    <MdFamilyRestroom size={60} />
                    Families
                  </div>
                  <div className="flex flex-col border border-black  px-6  items-center ">
                    <TbCamper size={60} />
                    Campers
                  </div>
                  <div className="flex flex-col  border border-black  px-4 items-center">
                    <MdPets size={60} /> Travelling with pet
                  </div>
                </div>
                <Divider />
                <div className=" pt-5">
                  <h1>Optional private comment for workaway team</h1>
                  <Inputbox
                    name="privateComment"
                    label=""
                    type=""
                    placeholder="....."
                    className={`dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}
                  />
                  <h1 className="pt-3"> Organisation/business/project-name</h1>
                  <Inputbox
                    name="organisation"
                    label=""
                    type=""
                   
                    placeholder="....."
                    className={`dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}
                  />
                </div>
                <div className="flex w-full justify-between py-3 px-4 ">
    <button className='px-4  rounded bg-slate-400' >Back</button>
    <button className='px-4  rounded bg-slate-400'>Contine</button>
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

export default AddDetails3;
