import React from 'react'
import Logo from '../Logo';
import { Toaster } from 'sonner';
import { Link } from 'react-router-dom';
import Inputbox from '../Inputbox';
import { useForm } from 'react-hook-form';
import Button from '../Button';
import { FaLanguage } from "react-icons/fa6";
import { MdOutlineElderlyWoman } from "react-icons/md";
import { GiDrowning } from "react-icons/gi";
import { GiTeacher } from "react-icons/gi";
import { LuTrees } from "react-icons/lu";
import { PiCookingPot } from "react-icons/pi";
import Divider from '../Divider';
const AddDetais = () => {
     type addDetailsValues={
        description:string,
        lastName:string,
        email:string,
        password:string,
    
      
      }
     const form=useForm<addDetailsValues>()
     const {register,handleSubmit,formState}=form
     const {errors}=formState
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
              <h1 className='font-bold pt-2 pl-3'>Describe  </h1>
               <textarea 
  className="dark:bg-transparent block w-full md:w-[80%] lg:w-[90%] xl:w-[95%] ml-4 px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 
  placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none 
  focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base "
/>

<h1 className='font-bold pt-2 pl-3'>Select Help Type </h1>
              <div className="flex flex-row flex-wrap  w-full p-3 pl-12 gap-2 text-black">
              

  <div className="p-4 rounded  border border-black flex flex-col items-center">
    <PiCookingPot size={60} color='black'/>
    Cooking</div>
  <div className="p-4 border border-black   rounded flex flex-col items-center">
    <GiDrowning size={60}/>
    art</div>
  <div className="p-4 rounded border border-black    flex flex-col items-center">
    <GiTeacher size={60}/>
    Teaching</div>
  <div className="p-4 rounded border border-black flex flex-col items-center">
    <MdOutlineElderlyWoman size={60}/>
    Gardening</div>
  <div className="p-4 rounded border border-black flex flex-col items-center">
    <LuTrees size={60}/>
    Animal Care</div>
    <div className="p-4 rounded border border-black flex flex-col items-center">
    <LuTrees size={60}/>
    Help with computer</div>
    <div className="p-4 rounded border border-black flex flex-col items-center">
    <LuTrees size={60}/>
    Help with computer</div>
    <div className="p-4 rounded border border-black flex flex-col items-center">
    <LuTrees size={60}/>
    Help with computer</div>
    <div className="p-4 border border-black rounded flex flex-col items-center justify-center text-black text-center">
  <FaLanguage size={60} className="mb-2" />
  <span>Language Practice</span>
</div>
<div className="p-4 border border-black rounded flex flex-col items-center justify-center text-black text-center">
  <FaLanguage size={60} className="mb-2" />
  <span>Help Around House</span>
</div>
<div className="p-4 border border-black rounded flex flex-col items-center justify-center text-black text-center">
  <FaLanguage size={60} className="mb-2" />
  <span>General Maintanence</span>
</div>
 
</div>

              </div>
  <Button
                  label='Continue'
                  type='submit'
                  styles='group relative w-full flex justify-center py-2.5 2xl:py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-black dark:bg-rose-800 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 '
                />
             
            </form>
         

        </div>
      </div>
    </div>

    <Toaster richColors />
  </div>
  );
}

export default AddDetais
