import { useForm } from "react-hook-form";
import { Toaster } from "sonner";
import { useState } from "react";
import axios from "axios";
import server from "../../server/app";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate, useParams } from "react-router-dom";


const AddVolunteerDetail = () => {
  const navigate=useNavigate()
  const { id } = useParams()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const [travelStatus, setTravelStatus] = useState("Home");
  const [birthDate, setBirthDate] = useState("");

  const onSubmit = async(data:{}) => {
    console.log("dddddata ",);
    
    const res= await axios.post(`${server}/user/add-details/${id}`,data,{withCredentials:true})
    console.log(res);
    if (res.data.success === true) {
      navigate(`/volenteer/profile/${id}`)
       

      
    }
    
  }

  return (
    <div className="flex w-full h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-1/3 min-h-screen bg-black items-center justify-center shadow-lg border-r border-gray-700 p-6">
        <div className="text-4xl font-extrabold text-[#b4cb3c] tracking-wide">NomadicNook</div>
        <span className="text-lg font-medium mt-3 text-gray-400">Welcome back, traveler!</span>
      </div>

      {/* Main Content */}
      <div className="flex w-full md:w-2/3 h-full px-10 md:px-20 lg:px-32 py-12 bg-gray-900 overflow-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
          {/* Traveling Information */}
          <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
            <h2 className="text-[#b4cb3c] text-2xl font-semibold">Traveling Information</h2>
            <div className="mt-6">
              <label className="block font-medium text-gray-300">I'm currently</label>
              <select
                className="w-full mt-2 p-3 border border-gray-600 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b4cb3c]"
                value={travelStatus}
                {...register("travelStatus", { required: "This field is required" })}
                onChange={(e) => setTravelStatus(e.target.value)}
              >
                <option value="Home">Home</option>
                <option value="Travelling">Travelling</option>
              </select>
              {errors.travelStatus && <p className="text-red-500 text-sm">{errors.travelStatus.message}</p>}
            </div>

            <div className="mt-6">
              <label className="block font-medium text-gray-300">Activities you’re interested in</label>
              <input
                type="text"
                className="w-full mt-2 p-3 border border-gray-600 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b4cb3c]"
                placeholder="e.g., Hiking, Surfing, Yoga"
                {...register("activities", { required: "Please enter activities" })}
              />
              {errors.activities && <p className="text-red-500 text-sm">{errors.activities.message}</p>}
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
            <h2 className="text-[#b4cb3c] text-2xl font-semibold">Profile Information</h2>
            <div className="mt-6">
              <label className="block font-medium text-gray-300">Description</label>
              <textarea
                className="w-full mt-2 p-3 border border-gray-600 bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#b4cb3c]"
                rows={3}
                {...register("description", { required: "Please enter a description" })}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>

            <div className="mt-6">
              <label className="block font-medium text-gray-300">Skills</label>
              <textarea
                className="w-full mt-2 p-3 border border-gray-600 bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#b4cb3c]"
                rows={2}
                {...register("skills", { required: "Please enter skills" })}
              />
              {errors.skills && <p className="text-red-500 text-sm">{errors.skills.message}</p>}
            </div>

            <div className="mt-6">
              <label className="block font-medium text-gray-300">Date of Birth</label>
              <input
                type="date"
                className="w-full mt-2 p-3 border border-gray-600 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b4cb3c]"
                value={birthDate}
                {...register("birthDate", { required: "Please select your birth date" })}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}
            </div>

            <div className="mt-6">
              <button type="submit" className="w-full bg-[#b4cb3c] text-black font-semibold py-3 rounded-lg hover:bg-green-500">
                Submit Details
              </button>
            </div>
          </div>
        </form>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default AddVolunteerDetail;