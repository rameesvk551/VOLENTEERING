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

const AddDetails4 = () => {
    type formValues={
        address:"[]"
        email:string
      
   
    
      
      }
     const form=useForm<formValues>()
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
              
    <h1 className='p-4'> Enter tout addre where you will ne hoting</h1>
    <Inputbox
                    label='your addres (including streeet/house/building number)'
                    type='email'
                    isRequired={true}
                    placeholder='email@example.com'
                    {...register("email",{required:"email is requeired"})}
                    className={`${errors.email? "border-red-500 ":"" }  pl-7 appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}          
                              />
                    {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
                  
<Divider/>
<h1 className='pt-4 pl-4'>Whant to be shown as a host intrested in language exchange</h1>


<h1 className='pt-4 pl-4 pb-2 font-thin'>
    More to Say About language exchange

</h1>


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
}

export default AddDetails4
