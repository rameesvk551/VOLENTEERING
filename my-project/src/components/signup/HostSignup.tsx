import  { useState } from 'react'
import Button from "../Button"
import Divider from "../Divider"
import Logo from "../Logo"
import Inputbox from "../Inputbox"
import { FcGoogle } from "react-icons/fc";
import { Toaster, toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from 'axios'
import server from '../../server/app'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../redux/store'
import { nextStep, updateEmail } from '../../redux/Slices/hostFormSlice'


const HostSignup = () => {
  const navigate=useNavigate()
const dispatch=useDispatch<AppDispatch>()

  type formValues={
    firstName:string,
    lastName:string,
    email:string,
    password:string,
    confirmPassword:string,
    phone:number

  
  }
 const form=useForm<formValues>()
 const {register,handleSubmit,watch,formState}=form
 const {errors}=formState
  const [showForm, setShowForm] = useState(false);
  const passwordValue = watch("password");



  const googleLogin = async () => {};
  const onSubmit = async (formData: formValues) => {
    if (!formData.firstName || !formData.lastName || !formData.email ||
       !formData.password  || !formData.confirmPassword || !formData.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
  
    try {
      const response = await axios.post(`${server}/host/signup`, formData, { withCredentials: true });
      const data = response.data; 
      dispatch(updateEmail(data.host.email));
      console.log("Host created successfully ", data.host.email);
navigate(`/host/add-details/${data.host._id}`)
    
      
    } catch (error) {
      console.log("An error occurred", error);
      toast.error("Signup failed. Please try again.");
    }
  };
  


 
  return (
    <div className='flex w-full h-[100vh]'>
      {/* LEFT */}
      <div className='hidden md:flex flex-col gap-y-4 w-1/3 h-full bg-black items-center justify-center'>
        
        <Logo  />
        <span className='text-xl font-semibold text-white'>Welcome!</span>
      </div>

      {/* RIGHT */}
      <div className='flex w-full md:w-2/3 h-full bg-white dark:bg-gradient-to-b md:dark:bg-gradient-to-r from-black via-[#071b3e] to-black items-center px-4 md:px-20 lg:px-40'>
        <div className='w-full h-full flex flex-col items-center justify-center py-12 px-4 sm:px-0 lg:px-8'>
          <div className='block mb-10 md:hidden -ml-8'>
            <Logo />
          </div>

          <div className='w-full space-y-6 flex flex-col justify-start'>
            <div className='max-w-md w-full flex gap-3 md:gap-4 items-center justify-center mb-12'>
        
              
            </div>
            {showForm ? (
              <form
                className='max-w-md w-full  space-y-5 '
              onSubmit={handleSubmit(onSubmit)}
              >
                <div className='flex flex-col rounded-md shadow-sm -space-y-px gap-4 mb-5'>
                <div className="w-full flex gap-4">
  {/* First Name Field */}
  <div className="flex flex-col w-full">
    <Inputbox
      label="First Name"
      type="text"
      isRequired={true}
      placeholder="First Name"
      {...register("firstName", { required: "First Name is required" })}
      className={`${
        errors.firstName ? "border-red-500" : ""
      } dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}
    />
    {errors.firstName && (
      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
    )}
  </div>

  {/* Last Name Field */}
  <div className="flex flex-col w-full">
    <Inputbox
      label="Last Name"
      type="text"
      isRequired={true}
      placeholder="Last Name"
      {...register("lastName", { required: "Last Name is required" })}
      className={`${
        errors.lastName ? "border-red-500" : ""
      } dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}
    />
    {errors.lastName && (
      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
    )}
  </div>
</div>

                  <Inputbox
                    label='Email Address'
                    type='email'
                    isRequired={true}
                    placeholder='email@example.com'
                    {...register("email",{required:"email is requeired"})}
                    className={`${errors.email? "border-red-500 ":"" }dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}          
                     
                       />
                    {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
                    
                    <div className="w-full flex gap-4">
    {/* Password */}
    <div className="flex flex-col w-full">
      <Inputbox
        label="Password"
        type="password"
        isRequired={true}
        placeholder="Password"
        {...register("password", {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        })}
        className={`${
          errors.password ? "border-red-500" : ""
        } dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}
      />
      {errors.password && (
        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
      )}
    </div>

    {/* Confirm Password */}
    <div className="flex flex-col w-full">
      <Inputbox
        label="Confirm Password"
        type="password"
        isRequired={true}
        placeholder="Confirm Password"
        {...register("confirmPassword", {
          required: "Confirm Password is required",
          validate: (value) =>
            value === passwordValue || "Passwords do not match",
        })}
        className={`${
          errors.confirmPassword ? "border-red-500" : ""
        } dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}
      />
      {errors.confirmPassword && (
        <p className="text-red-500 text-sm mt-1">
          {errors.confirmPassword.message}
        </p>
      )}
    </div>
    </div>              
                  <Inputbox
                    label='Phone'
                    type='phone'
                    isRequired={true}
                    placeholder='Enter your phone number'
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Invalid phone number, must be 10 digits"
                      }
                    })}
                    className={`${errors.phone? "border-red-500 ":""} "dark:bg-transparent appearance-none block w-full px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base`}          
                              />
                    {errors.phone&& <p className='text-red-500 text-sm mt-1'>{errors.phone.message}</p>}
                  

            
                </div>

                <Button
                  label='Continue'
                  type='submit'
                 
                  styles='group relative w-full flex justify-center py-2.5 2xl:py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-black dark:bg-rose-800 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 '
                />
              </form>
            ) : (
              <>
                <div className='max-w-md w-full space-y-8'>
                  <Button
                    onClick={() => googleLogin()}
                    label='Sign up with Google'
                    icon={<FcGoogle size={20} />}
                    styles='w-full flex flex-row-reverse gap-4 bg-black dark:bg-transparent dark:border text-white px-5 py-2.5 rounded-full'
                  />
                  <Divider label='OR' />

                  <Button
                    onClick={() => setShowForm(true)}
                    label='Continue with email'
                    styles='w-full gap-4 bg-white text-black dark:bg-rose-800 dark:text-white px-5 py-2.5 rounded-full border dark:border-none border-gray-300'
                  />
                </div>
              </>
            )}

            <p className='max-w-md w-full text-center text-gray-600 dark:text-gray-300'>
              Already has an account?{" "}
              <Link to='/user/login' className='text-rose-800 font-medium'>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Toaster richColors />
    </div>
  )
}

export default HostSignup
