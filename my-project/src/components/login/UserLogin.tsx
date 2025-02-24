
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Toaster, toast } from "sonner";
import { Link } from "react-router-dom";
import Button from "../Button"
import Divider from "../Divider"
import Logo from "../Logo"
import Inputbox from "../Inputbox"
import {useForm} from "react-hook-form"
import server from "../../server/app.js"
import axios from "axios";
const UserLogin = () => {
 type formData = {
    email:string,
    password:string
  }
const  form=useForm<formData>()
const {register,handleSubmit,formState}=form
const {errors}=formState


  const googleLogin = async () => {};
const onSubmit=(loginData:formData)=>{
    console.log("server");
    
console.log("login form submitted",loginData);
axios.post(`${server}/user/login`,loginData).then((res)=>{
    console.log("user Loged in succesfully",res);
    
}).catch((error)=>{
    console.log("an error occured",error);
    
})

}


  
  return (
    <div className='flex w-full  h-[100vh]'>
      <div className='hidden md:flex flex-col gap-y-4 w-1/3 min-h-screen bg-black items-center justify-center'>
        <Logo  />
        <span className='text-xl font-semibold text-white'>Welcome, back!</span>
      </div>

      <div className='flex w-full md:w-2/3 h-full bg-white dark:bg-gradient-to-b md:dark:bg-gradient-to-r from-black via-[#071b3e] to-black items-center px-10 md:px-20 lg:px-40'>
        <div className='h-full flex flex-col items-center justify-center  py-12 px-4 sm:px-6 lg:px-8'>
          <div className='block mb-10 md:hidden'>
            <Logo />
          </div>
          <div className='max-w-md w-full space-y-8'>
            <div>
              <h2 className='mt-6 text-center text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white'>
                Sign in to your account
              </h2>
            </div>

            <Button
              onClick={() => googleLogin()}
              label='Sign in with Google'
              icon={<FcGoogle className='' />}
              styles='w-full flex flex-row-reverse gap-4 bg-white dark:bg-transparent text-black dark:text-white px-5 py-2.5 rounded-full border border-gray-300'
            />

            <Divider label='or sign in with email' />

            <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
              <div className='flex flex-col rounded-md shadow-sm -space-y-px gap-5'>
                <Inputbox
                  label='Email Address'
                  type='email'
                  isRequired={true}
                  placeholder='email@example.com'
                 {...register("email",{required:"please enter a valid email address"})}
                 className={`${errors.email? "border-red-500 ":""} "dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}          
                 />
       {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
     
                

                <Inputbox
                  label='Password'      
                  type='password'
                  isRequired={true}
                  placeholder='Password'
                  
                  {...register("password", { 
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters long" },
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                      message: "Password must contain at least one letter and one number"
                    }
                  })}
                  className={`${errors.password? "border-red-500 ":""} "dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}          
                            />
                  {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
                
              </div>

              <Button
                label=' Sign In'
                type='submit'
                styles='group relative w-full flex justify-center py-2.5 2xl:py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-black dark:bg-rose-800 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 mt-8'
              />
            </form>

            <div className='flex items-center justify-center text-gray-600 dark:text-gray-300'>
              <p>
                Dont't have an account?{" "}
                <Link to='/sign-up' className='text-rose-800 font-medium'>
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toaster richColors />
    </div>
  );
};

export default UserLogin;
