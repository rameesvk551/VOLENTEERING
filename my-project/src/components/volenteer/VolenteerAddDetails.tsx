import { useForm } from "react-hook-form";
import { Toaster } from "sonner";
import { useState } from "react";
import axios from "axios";
import server from "../../server/app";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

interface VolunteerFormData {
  travelStatus: string;
  description: string;
  birthDate: string;
  skills?: string[];
  activities?: string[];
}

const AddVolunteerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VolunteerFormData>();

  const [travelStatus, setTravelStatus] = useState("Home");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const handleAddItem = (type: "skill" | "interest") => {
    const value = type === "skill" ? skillInput : interestInput;
    if (value.trim()) {
      if (type === "skill") setSkills([...skills, value.trim()]);
      else setInterests([...interests, value.trim()]);
      type === "skill" ? setSkillInput("") : setInterestInput("");
    }
  };

  const handleRemoveItem = (type: "skill" | "interest", index: number) => {
    const updated = type === "skill" ? [...skills] : [...interests];
    updated.splice(index, 1);
    type === "skill" ? setSkills(updated) : setInterests(updated);
  };

  const onSubmit = async (data: VolunteerFormData) => {
    const fullData = {
      ...data,
      skills,
      activities: interests,
    };
    try {
      const res = await axios.post(`${server}/user/add-details/${id}`, fullData, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success("details added succesfully")
        navigate(`/user/membership`);
      }
    } catch (err) {
      console.error("Error submitting form", err);
    }
  };

  return (
    <div className="flex w-full  bg-gradient-to-br from-gray-900 to-black text-white">
 
      {/* Sidebar */}
      <div className="hidden md:flex fixed left-0 flex-col gap-y-6 w-1/3 h-[88.5vh]  bg-black items-center justify-center px-6 z-10">
        <h5 className="text-4xl font-bold tracking-widest text-gray-900 uppercase">
          <span className="bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text">RAIH</span>
        </h5>
        <p className="text-lg text-gray-300 text-center">
          Welcome to Raih — where your journey begins ✨
        </p>
      </div>
      <div className="flex w-full md:w-2/3 md:ml-[33.33%] h-[88.5vh] px-6 md:px-12 lg:px-20 py-10 overflow-y-auto">

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full space-y-10"
        >
          {/* Traveling Info */}
          <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
            <h2 className="text-[#b4cb3c] text-2xl font-semibold">Traveling Information</h2>

            <div className="mt-6">
              <label className="block font-medium text-gray-300 mb-2">I'm currently</label>
              <select
                value={travelStatus}
                {...register("travelStatus", { required: "This field is required" })}
                onChange={(e) => setTravelStatus(e.target.value)}
                className="w-full p-3 border border-gray-600 bg-gray-700 rounded-lg focus:ring-2 focus:ring-[#b4cb3c]"
              >
                <option value="Home">Home</option>
                <option value="Travelling">Travelling</option>
              </select>
              {errors.travelStatus && <p className="text-red-500 text-sm">{errors.travelStatus.message}</p>}
            </div>

            <div className="mt-6">
              <label className="block font-medium text-gray-300 mb-2">Activities You’re Interested In</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  className="flex-1 p-3 border border-gray-600 bg-gray-700 rounded-lg focus:ring-2 focus:ring-[#b4cb3c]"
                  placeholder="e.g., Hiking, Yoga"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem("interest")}
                  className="bg-[#b4cb3c] text-black px-4 py-2 rounded-lg hover:bg-green-500"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="bg-[#b4cb3c] text-black px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {interest}
                    <button onClick={() => handleRemoveItem("interest", idx)} type="button">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
            <h2 className="text-[#b4cb3c] text-2xl font-semibold">Profile Information</h2>

            <div className="mt-6">
              <label className="block font-medium text-gray-300 mb-2">Description</label>
              <textarea
                {...register("description", { required: "Please enter a description" })}
                className="w-full p-3 border border-gray-600 bg-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-[#b4cb3c]"
                rows={3}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>

            <div className="mt-6">
              <label className="block font-medium text-gray-300 mb-2">Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-1 p-3 border border-gray-600 bg-gray-700 rounded-lg focus:ring-2 focus:ring-[#b4cb3c]"
                  placeholder="e.g., Cooking, Gardening"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem("skill")}
                  className="bg-[#b4cb3c] text-black px-4 py-2 rounded-lg hover:bg-green-500"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-[#b4cb3c] text-black px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {skill}
                    <button onClick={() => handleRemoveItem("skill", idx)} type="button">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block font-medium text-gray-300 mb-2">Date of Birth</label>
              <input
                type="date"
                value={birthDate}
                {...register("birthDate", { required: "Please select your birth date" })}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-3 border border-gray-600 bg-gray-700 rounded-lg focus:ring-2 focus:ring-[#b4cb3c]"
              />
              {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full bg-[#b4cb3c] text-black font-semibold py-3 rounded-lg hover:bg-green-500 transition"
              >
                Submit Details
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVolunteerDetail;
