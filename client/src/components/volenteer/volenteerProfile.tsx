import React, { lazy, Suspense, useEffect, useState } from "react";
import { MdEmail, MdOutlineElderlyWoman, MdRestore } from "react-icons/md";
import Divider from "../Divider";
import { FaCrown, FaEye,FaRegStar } from "react-icons/fa6";
import {  LuNotebookPen, LuTrees } from "react-icons/lu";
import { RiFeedbackFill } from "react-icons/ri";
import { SiAmazonsimpleemailservice } from "react-icons/si";
import { TbFileDescription } from "react-icons/tb";
import { GiDrowning, GiTeacher } from "react-icons/gi";
import { PiCookingPot } from "react-icons/pi";
import { IoMdHeart } from "react-icons/io";
import { AppDispatch, RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { CiEdit } from "react-icons/ci";
import { useDispatch } from "react-redux";
import { loadVolenteer } from "../../redux/thunks/volenteerThunk";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import server from "../../server/app";
import Review from "./Review";
const volenteerProfile= () => {

  const navigate=useNavigate()
  const {id}=useParams()
  const { volenteerData } = useSelector((state: RootState) => state.volenteer);


  const [isMembershipOpen,setIsMembershipOpen]=useState<boolean>()
  const [addIntrestedActivities, setAddIntrestedActivities] =useState<boolean>(false);
  const [editTravelStatus, setEditTravelStatus] = useState<boolean>(false);
  const [travelStatus, setTravelStatus] = useState<string>("Home");
  const [editSkills, setEditSkills] = useState<boolean>(false);
  const [editAge, setEditAge] = useState<boolean>(false);
  const [isSmoker, setIsSmoker] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [active,setActive]=useState<number>(1)
  const [age, setAge] = useState<number>(0);
  const [image, setImage] = useState("/default-avatar.png");
  const [activities, setActivities] = useState(volenteerData?.user?.activities || []);
  const [newActivity, setNewActivity] = useState("");
  const [skills, setSkills] = useState(volenteerData?.user?.kills || []);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [editnextDestination, setEditnextDestination] = useState<boolean>(false);
const [destination, setDestination] = useState("");
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const[addSkills,setAddSkills]=useState<boolean>(false);
const [isImageUploading, setIsImageUploading] = useState(false);
const [reviews, setReviews] = useState([]);
const [loadingReviews, setLoadingReviews] = useState(false);
const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    setIsImageUploading(true);

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const response = await axios.put(
        `${server}/user/update-profile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      console.log("Uploaded Image URL:", response.data.imageUrl);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsImageUploading(false);
    }
  }
};

  const handleUpdateNextDestination = async () => {
    try {
      setLoading(true);
      await axios.put(`${server}/user/update-details` , 
        {nextDestination: {
          destination:destination,
          fromDate:fromDate,
          toDate:toDate,
        }
    },{withCredentials:true});
      // optionally show a success toast
      setEditTravelStatus(false);
    } catch (err) {
      console.error(err);
      // optionally show an error toast
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const response = await axios.get(`${server}/user/get-reviews`, {
          withCredentials: true,
        });
        console.log("tttttttttrs active",response);
        
        setReviews(response.data.reviews);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };
  
    if (active === 2 && reviews.length === 0) {
      fetchReviews();
    }
  }, [active]);


  const handleAddItem = async (type, value, setState, state, setInput) => {
    const trimmed = value.trim();
    if (!trimmed) return;
  
    const updatedList = [...state, trimmed];
    setLoading(true);
  
    try {
      await axios.put(`${server}/user/update-details`, {
        [type]: updatedList,
      }, { withCredentials: true });
  
      setState(updatedList);
      setInput(""); // reset input field
    } catch (err) {
      console.error(`Failed to update ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveItem = async (type, indexToRemove, state, setState) => {
    const updatedList = state.filter((_, idx) => idx !== indexToRemove);
  
    try {
      await axios.put(`${server}/user/update-details`, {
        [type]: updatedList,
      }, { withCredentials: true });
  
      setState(updatedList);
    } catch (err) {
      console.error(`Failed to remove ${type}:`, err);
    }
  };
    const formatDate = (isoDate: string | Date): string => {
      const date = new Date(isoDate);
      return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    };


  const tabs=[
    { id: 1, label: "OVERVIEW" },
    { id: 2, label: `FEEDBACK(${volenteerData?.user?.reviews.length})` },
  ]


 
 const ishaveMembership=volenteerData?.user?.status ==="active"

console.log("activities",volenteerData?.user);

  return (
    <div className="flex flex-col bg-[#f5f5f5] ">
      <div className="bg-[#fff]   ">
   <div className="flex flex-row pl-10 pt-4 gap-3">
   <div className="relative w-32 h-32">
  {/* Profile Image */}
  <label htmlFor="profileUpload" className="cursor-pointer">
    <img
      src={volenteerData?.user?.profileImage}
      alt="Profile"
      className={`w-32 h-32 rounded-full border-4 border-gray-300 object-cover shadow-md ${isImageUploading && "opacity-50"}`}
    />
    {isImageUploading && (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full">
        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      </div>
    )}
  </label>

  {/* Hidden File Input */}
  <input
    type="file"
    id="profileUpload"
    accept="image/*"
    className="hidden"
    onChange={handleImageChange}
  />
</div>

        <div className="">
        
          <div>
            <h1 className="text-[#0a3f5f] text-[27px] font-bold my-[5px] mb-[15px] mt-6">
           {volenteerData?.user?.firstName}    {volenteerData?.user?.lastName}
            </h1>
          </div>
          <div className="flex flex-row gap-2 ">
            <div className="flex ">
              <IoMdHeart size={25} />
              <span>Favourited 0 times</span>
            </div>

            <div className="flex ">
              <MdRestore size={25} />
              {"   "}
              <span>Last login:{formatDate(volenteerData?.user?.lastLogin)} </span>
            </div>

         
          </div>
        </div>
   </div>

        <Divider />

        <div className="flex justify-between pl-[100px] pr-[160px] text-[#0a3f5f] text-[20px] pt-4 pb-5">
        <div className="flex justify-center space-x-10  pb-2  flex items-center ">
  {tabs&& tabs.map((tab) => (
    <div key={tab.id} className="relative cursor-pointer">
      <h5
        onClick={() => setActive(tab.id)}
        className={`pb-2 ${
          active === tab.id ? "font-bold text-crimson" : "text-gray-600"
        }`}
      >
        {tab.label}
      </h5>
    
    </div>
  ))}
</div>
        </div>
      </div>

      {active === 2 && 
        <div className="flex flex-col items-center gap-3 mt-4">
        {reviews&&reviews.map((review) => {
        return (
          <Review
            key={review.id}
            rating={review.rating}
            comment={review.comment}
            date={review.date}
           hostName={review.reviewerName} 
          />
        );
      })}
      </div>}

    {active === 1 &&
      <div className="px-[100px] flex flex-row  mt-8 gap-7">
      <div className="w-2/3  ">
        <div className="w-80% p-6  bg-[#fff] ">
          <h1 className="text-[#666] text-[25px] font-bold">My Status</h1>
          <div className="w-full pl-4">
            <TbFileDescription />
            <h2 className=" text-[#b4cb3c] text-[1.1rem]">
              Travelling Information
            </h2>

            <div className="flex justify-between items-center pt-4">
              <div className="flex flex-col">
                <h1 className="font-bold">I'm currently</h1>
                {editTravelStatus ? (
                  <select
                    className="border border-black w-[455px] h-8 pt-1"
                    value={travelStatus}
                    onChange={(e) => setTravelStatus(e.target.value)}
                  >
                    <option value="Home">Home</option>
                    <option value="Travelling">Travelling</option>
                  </select>
                ) : (
                  <h2>{volenteerData?.user?.travelStatus}</h2>
                )}
              </div>
              <button
                className="bg-green-400 rounded-md flex items-center px-3 h-5"
                onClick={() => setEditTravelStatus(!editTravelStatus)}
              >
                <CiEdit />
                Edit
              </button>
            </div>

            <div className="flex justify-between items-center pt-4">
<div className="flex flex-col">
  <h1 className="font-bold">
    Let other travellers know the activities you’re interested in:
  </h1>

  {!addIntrestedActivities && (
    <div className="flex gap-2 flex-wrap mt-2">
      {volenteerData?.user?.activities?.length > 0 ? (
        volenteerData.user.activities.map((activity, index) => (
          <span
            key={index}
            className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
          >
            {activity}
          </span>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No activities added yet.</p>
      )}
    </div>
  )}
</div>

<button
  className="bg-green-400 rounded-md flex items-center px-3 h-5"
  onClick={() => setAddIntrestedActivities(!addIntrestedActivities)}
>
  <CiEdit />
  <span className="ml-1 text-sm">
    {addIntrestedActivities ? "Close" : "Edit"}
  </span>
</button>
</div>

{addIntrestedActivities && (
<>
  {/* Add New Activity */}
  <div className="mt-3 flex gap-2">
    <input
      type="text"
      value={newActivity}
      onChange={(e) => setNewActivity(e.target.value)}
      className="border border-black w-2/3 px-2 py-1"
      placeholder="Enter new activity"
      disabled={loading}
    />
    <button
   onClick={() =>
    handleAddItem("activities", newActivity, setActivities, activities, setNewActivity)
  }
      className="bg-green-500 text-white px-3 py-1 rounded"
      disabled={loading}
    >
      {loading ? "Adding..." : "Add"}
    </button>
  </div>

  {/* Editable Activities with Remove */}
  <div className="flex flex-wrap gap-2 mt-3">
    {volenteerData?.user?.activities?.map((interest, i) => (
      <span
        key={i}
        className="bg-[#b4cb3c] text-black px-3 py-1 rounded-full text-sm flex items-center gap-1"
      >
        {interest}
        <button
          type="button"
          onClick={() =>
            handleRemoveItem("activities", i, activities, setActivities)
          }
          className="ml-1 text-black hover:text-red-600"
        >
          ×
        </button>
      </span>
    ))}
  </div>
</>
)}


<div className="flex justify-between items-center pt-4">
<div className="flex flex-col">
  <h1 className="font-bold">My next destinations</h1>

  {!editnextDestination? (
    <>
      <h1>{destination} - from {fromDate} until {toDate}</h1>
    </>
  ) : (
    <>
      <input
        type="text"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="Enter destination"
        className="border px-2 py-1 mt-1 w-full"
      />
      <div className="flex gap-2 mt-2">
        <input
          type="month"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border px-2 py-1"
        />
        <input
          type="month"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border px-2 py-1"
        />
      </div>

      <button
        onClick={handleUpdateNextDestination}
        className="bg-green-600 text-white rounded mt-2 px-3 py-1 w-fit"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </>
  )}
</div>

<button
  className="bg-green-400 rounded-md flex items-center px-3 h-5"
  onClick={() => setEditnextDestination(!editnextDestination)}
>
  <CiEdit />
  <span className="ml-1 text-sm">
    {editnextDestination ? "Close" : "Edit"}
  </span>
</button>
</div>

            <Divider />
          </div>
        </div>

        <div className="w-80% p-6  bg-[#fff] mt-5">
          <h1 className="text-[#666] text-[25px] font-bold">
            Profile Information
          </h1>

       {ishaveMembership ?(
           <div className="flex justify-between pt-3">
          <button
             className="bg-green-200 rounded-md  flex items-center px-3"
             
           >
             {" "}
           Individual Account
           </button>
          
         </div>
       ):(
        <div className="flex justify-between pt-3">
        <h1 className=" text-[#b4cb3c] text-[1.1rem]">
         Not a Member of community
        </h1>
        <button
          className="bg-green-200 rounded-md  flex items-center px-3"
          onClick={() => {
            setEditSkills(!editSkills);
          }}
        >
          {" "}
         Become a member
        </button>
      </div>
       )}

          <Divider />

          <div>
            <div className="flex justify-between pt-3">
              <h1 className=" text-[#b4cb3c] text-[1.1rem]">Description</h1>
              <button
                className="bg-green-400 rounded-md flex items-center px-3 h-5"
                onClick={() => setEditTravelStatus(!editTravelStatus)}
              >
                <CiEdit />
                Edit
              </button>
            </div>
            <p>
             {volenteerData?.user?.description}
            </p>
          </div>
          <Divider />

          <div className="flex justify-between items-center pt-4">
<div className="flex flex-col">
  <h1 className="font-bold">
What skills you have
  </h1>

  {!addIntrestedActivities && (
    <div className="flex gap-2 flex-wrap mt-2">
      {volenteerData?.user?.user?.skills?.length > 0 ? (
        volenteerData.user.user.skills.map((skill, index) => (
          <span
            key={index}
            className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
          >
            {skill}
          </span>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No activities added yet.</p>
      )}
    </div>
  )}
</div>

<button
  className="bg-green-400 rounded-md flex items-center px-3 h-5"
  onClick={() => setAddSkills(!addSkills)}
>
  <CiEdit />
  <span className="ml-1 text-sm">
    {addSkills ? "Close" : "Edit"}
  </span>
</button>
</div>

{addSkills && (
<>
  {/* Add New Activity */}
  <div className="mt-3 flex gap-2">
    <input
      type="text"
      value={newActivity}
      onChange={(e) => setNewActivity(e.target.value)}
      className="border border-black w-2/3 px-2 py-1"
      placeholder="Enter new activity"
      disabled={loading}
    />
    <button
      onClick={() =>
        handleAddItem("skills", newSkill, setSkills, skills, setNewSkill)
      }
      className="bg-green-500 text-white px-3 py-1 rounded"
      disabled={loading}
    >
      {loading ? "Adding..." : "Add"}
    </button>
  </div>

  {/* Editable Activities with Remove */}
  <div className="flex flex-wrap gap-2 mt-3">
    {volenteerData?.user?.activities?.map((interest, i) => (
      <span
        key={i}
        className="bg-[#b4cb3c] text-black px-3 py-1 rounded-full text-sm flex items-center gap-1"
      >
        {interest}
        <button
          type="button"
          onClick={() =>
            handleRemoveItem("skills", i, skills, setSkills)
          }
          className="ml-1 text-black hover:text-red-600"
        >
          ×
        </button>
      </span>
    ))}
  </div>
</>
)}
          <Divider />

          <div className="flex flex-col gap-2">
            {/* Age Section */}
            <div className="flex justify-between pt-3">
              <h1 className="text-[#b4cb3c] text-[1.1rem]">Date of Birth</h1>
             
            </div>

         
              <h1>{volenteerData?.user?.birthDate}</h1>
          
          </div>


          <Divider />


        
        </div>
      </div>

       
    </div>}
    </div>
  );
};

export default volenteerProfile
