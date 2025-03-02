import React, { useState } from 'react'
import Logo from '../Logo';
import { Toaster } from 'sonner';
import { IoIosAddCircleOutline } from "react-icons/io";
import Button from '../Button';
import Divider from '../Divider';
import TextArea from '../TextArea';
import { boolean } from 'yup';
import Inputbox from '../Inputbox';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { nextStep, prevStep } from '../../redux/hostFormSlice';

const AddLanguage = () => {
  const dispatch=useDispatch<AppDispatch>()

    type formValues={
        language:"string"
        languageLevel:"string"
   
    
      
      }
     const form=useForm<formValues>()
     const {register,handleSubmit,formState}=form
     const {errors}=formState
    // for adding speaking or learning language
const [openLanugaeAndLevel,setOpenLanguageAndLevel]=useState <boolean>(false)


 return (
    <div className='flex w-full h-[100vh]'>
    {/* LEFT */}
    <div className='hidden md:flex flex-col gap-y-4 w-1/3 h-full bg-black items-center justify-center'>
      
      <Logo  />
      <span className='text-xl font-semibold text-white'>Welcome!</span>
    </div>

    {/* RIGHT */}
    <div className='flex w-full md:w-2/3 h-full bg-white   md:px-20 '>
      <div className='w-full h-full flex flex-col items-center    sm:px-0 lg:px-8'>
        <div className='block mb-10 md:hidden -ml-8'>
          <Logo />
        </div>

        <div className=' w-full md:w-[80%] lg:w-[90%] xl:w-[95%]  flex flex-col'>
            <form
              className=' w-full  space-y-6'
         >
              <div className='flex flex-col rounded-md shadow-sm -space-y-px border border-black  mt-5'>
              
    <h1 className='p-4'> Tell volenteers about the languages you speak or learning</h1>
{
    openLanugaeAndLevel ?(
        <div className="w-full p-7 flex gap-4">
        {/* First Name Field */}
        <div className="flex flex-col w-full">
          <Inputbox
            label="language"
            type="number"
            isRequired={true}
            placeholder="language"
            {...register("language", { required: "pleae select one language" })}
            className={`${
              errors.language ? "border-red-500" : ""
            } dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}
          />
          {errors.language && (
            <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>
          )}
        </div>
      
        {/* Last Name Field */}
        <div className="flex flex-col w-full">
          <Inputbox
            label="Level"
            type="text"
            isRequired={true}
            placeholder="Level"
            {...register("languageLevel", { required: "Last Name is required" })}
            className={`${
              errors.languageLevel ? "border-red-500" : ""
            } dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}
          />
          {errors.languageLevel && (
            <p className="text-red-500 text-sm mt-1">{errors.languageLevel.message}</p>
          )}
        </div>
      </div>

    ):(
        <button className="bg-green-500  rounded-full pb-[15px]  inline-flex items-center w-[180px] gap-2 px-4 py-2 rounded text-white"
        onClick={()=>setOpenLanguageAndLevel(true)}>
      <IoIosAddCircleOutline size={30}  />
      Add Language
    </button> 
    )
}
<Divider/>
<h1 className='pt-4 pl-4'>Whant to be shown as a host intrested in language exchange</h1>
<div className="flex items-center space-x-4 pl-4">
  {/* Yes Option */}
  <label className="flex items-center space-x-2 cursor-pointer">
    <input type="radio" name="choice" value="yes" className="hidden peer" />
    <div className="w-5 h-5 border-2 border-green-500 rounded-full flex items-center justify-center peer-checked:bg-green-500"></div>
    <span className="text-green-600">Yes</span>
  </label>

  {/* No Option */}
  <label className="flex items-center space-x-2 cursor-pointer">
    <input type="radio" name="choice" value="no" className="hidden peer" />
    <div className="w-5 h-5 border-2 border-red-500 rounded-full flex items-center justify-center peer-checked:bg-red-500"></div>
    <span className="text-red-600">No</span>
  </label>
</div>

<h1 className='pt-4 pl-4 pb-2 font-thin'>
    More to Say About language exchange (optional)

</h1>
<textarea 
  className="h-[200px] block w-full md:w-[80%] lg:w-[90%] xl:w-[95%] ml-4 mb-5 px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 
  placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none 
  focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base "
/>

<div className="flex w-full justify-between py-3 px-4 " >
    <button className='px-4  rounded bg-slate-400' onClick={() => dispatch(prevStep())} >Back</button>
    <button className='px-4  rounded bg-slate-400' onClick={() => dispatch(nextStep())}>Contine</button>
</div>
              </div>
  
             
            </form>
         

        </div>
      </div>
    </div>

    <Toaster richColors />
  </div>
  );
}

export default AddLanguage
