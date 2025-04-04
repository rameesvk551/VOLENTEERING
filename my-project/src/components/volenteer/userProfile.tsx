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
const HostPreview = () => {
 
  const navigate=useNavigate()
  const dispatch = useDispatch<AppDispatch>();
const {id}=useParams()
  useEffect(() => {
    dispatch(loadVolenteer());
    console.log("loaded");
    
  }, []);

  const { volenteerData } = useSelector((state: RootState) => state.volenteer);

  const showMembership=()=>{
    navigate(`/volenteer/membership/${id}`)
    
  }
  const MembershipModal = lazy(() => import("./MemberShipModal"));
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
  const [image, setImage] = useState("/default-avatar.png"); // Default profile image

  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);

      const formData = new FormData();
      formData.append("profileImage", file); // Name should match backend

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
      }
    }
  };

  const tabs=[
    { id: 1, label: "OVERVIEW" },
    { id: 2, label: "PHOTOS" },
    { id: 3, label: "MAP" },
    { id: 4, label: "FEEDBACK(2)" },
  ]


  const calculateAge = () => {
    console.log(birthDate);

    if (!birthDate) return; // Prevent calculation if no date is selected

    const birth = new Date(birthDate); // Convert string to Date object
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    // Adjust age if the birth date hasn't occurred yet this year
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate())
    ) {
      age--;
    }

    setAge(age);
  };
  const languageSpoken = [
    {
      language: "germen",
      level: "beginer",
    },
    {
      language: "germen",
      level: "beginer",
    },
    {
      language: "germen",
      level: "beginer",
    },
    {
      language: "germen",
      level: "beginer",
    },
  ];

  const helpOptions = [
    { label: "Cooking", icon: <PiCookingPot size={30} /> },
    { label: "Art", icon: <GiDrowning size={30} /> },
    { label: "Teaching", icon: <GiTeacher size={30} /> },
    { label: "Gardening", icon: <MdOutlineElderlyWoman size={30} /> },
    {
      label: "Animal Care",
      icon: <LuTrees size={30} className="bg-green-500" />,
    },
  ];
  return (
    <div className="flex flex-col bg-[#f5f5f5] ">
      <div className="bg-[#fff]   ">
   <div className="flex flex-row pl-10 pt-4 gap-3">
   <div className="relative w-32 h-32 ">
      {/* Profile Image */}
      <label htmlFor="profileUpload" className="cursor-pointer">
        <img
          src={volenteerData?.user?.profileImage} 
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover shadow-md"
        />
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
              WELCOME RAMEES
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
              <span>Last login: 7 Mar 2025 05:29 CST</span>
            </div>

            <div className="flex ">
              <MdRestore size={25} />
              {"   "}
              <span>Last activity : 7 Mar 2025</span>
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
          <div className="flex flex-row space-x-6 ">
            <button className="flex flex-row  bg-[#f5f5f5] rounded-full p-2 items-center px-6">
              <FaEye /> View Online
            </button>{" "}
          </div>
        </div>
      </div>

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
                    {" "}
                    Let other travellers know the activities you’re interested
                    in:
                  </h1>
                </div>
                <button
                  className="bg-green-400 rounded-md  flex items-center px-3 h-5"
                  onClick={() => {
                    setAddIntrestedActivities(!addIntrestedActivities);
                  }}
                >
                  {" "}
                  <CiEdit />
                  Edit
                </button>
              </div>

              {addIntrestedActivities ? (
                <input type="text" className="border border-black w-2/3 pt-1" />
              ) : (
                <>{volenteerData?.user?.activities}</>
              )}

              <div className="flex justify-between items-center pt-4">
                <div className="flex flex-col">
                  <h1 className="font-bold">My next destonations</h1>
                  <h1>china -from october 2025 until Nov 2025</h1>
                </div>
                <button
                  className="bg-green-400 rounded-md flex items-center px-3 h-5"
                  onClick={() => setEditTravelStatus(!editTravelStatus)}
                >
                  <CiEdit />
                  Edit
                </button>
              </div>
              <Divider />
            </div>
          </div>

          <div className="w-80% p-6  bg-[#fff] mt-5">
            <h1 className="text-[#666] text-[25px] font-bold">
              Profile Information
            </h1>

            <div className="flex justify-between pt-3">
              <h1 className=" text-[#b4cb3c] text-[1.1rem]">
                Individual Account
              </h1>
              <button
                className="bg-green-200 rounded-md  flex items-center px-3"
                onClick={() => {
                  setEditSkills(!editSkills);
                }}
              >
                {" "}
                Upgrade to a couple account
              </button>
            </div>

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

            <div className="flex justify-between pt-3">
              <h1 className=" text-[#b4cb3c] text-[1.1rem]">
                What Skills do you have
              </h1>
              <button
                className="bg-green-400 rounded-md  flex items-center px-3"
                onClick={() => {
                  setEditSkills(!editSkills);
                }}
              >
                {" "}
                <CiEdit />
                Edit
              </button>
            </div>

            {editSkills ? (
              <textarea className="border border-black w-full mt-1" />
            ) : (
              <>
                <h1>{volenteerData?.user?.skills}</h1>
              </>
            )}
            <Divider />

            <div className="flex flex-col gap-2">
              {/* Age Section */}
              <div className="flex justify-between pt-3">
                <h1 className="text-[#b4cb3c] text-[1.1rem]">Date of Birth</h1>
                <button
                  className="bg-green-400 rounded-md flex items-center px-3"
                  onClick={() => setEditAge(!editAge)}
                >
                  <CiEdit />
                  Edit
                </button>
              </div>

              {/* Editable Input / Display Mode */}
              {editAge ? (
                <input
                  type="date"
                  className="border border-black w-full mt-1 p-1"
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                    calculateAge();
                  }}
                />
              ) : (
                <h1>{age}</h1>
              )}
            </div>

            <Divider />

            <div className="flex justify-between items-center pt-4">
              <div className="flex flex-col">
                <h1 className="font-bold"> Are you allergic to anything?</h1>
              </div>
              <button
                className="bg-green-400 rounded-md  flex items-center px-3 h-5"
                onClick={() => {
                  setAddIntrestedActivities(!addIntrestedActivities);
                }}
              >
                {" "}
                <CiEdit />
                Edit
              </button>
            </div>

            {addIntrestedActivities ? (
              <input type="text" className="border border-black w-2/3 pt-1" />
            ) : (
              <></>

            )}

            <Divider />

            <div className="flex justify-between items-center pt-4">
              <div className="flex flex-col">
                <h1 className="font-bold">
                  {" "}
                  Do you have special dietary requirements?
                </h1>
              </div>
              <button
                className="bg-green-400 rounded-md  flex items-center px-3 h-5"
                onClick={() => {
                  setAddIntrestedActivities(!addIntrestedActivities);
                }}
              >
                {" "}
                <CiEdit />
                Edit
              </button>
            </div>

            {addIntrestedActivities ? (
              <input type="text" className="border border-black w-2/3 pt-1" />
            ) : (
              <></>
            )}
            <Divider />

            <div className="flex justify-between items-center pt-4">
              <div className="flex flex-col">
                <h1 className="font-bold"> What else....?</h1>
              </div>
              <button
                className="bg-green-400 rounded-md  flex items-center px-3 h-5"
                onClick={() => {
                  setAddIntrestedActivities(!addIntrestedActivities);
                }}
              >
                {" "}
                <CiEdit />
                Edit
              </button>
            </div>

            {addIntrestedActivities ? (
              <input type="text" className="border border-black w-2/3 pt-1" />
            ) : (
              <></>
            )}

            <div className="flex items-center justify-center text-[rgb(51 51 51 / 75%)] pb-56">
              Host ref number: 851331489494
            </div>
          </div>
        </div>

           <div className="w-1/3">
                  <div className="bg-[#fff] w-70% flex">
                    <div className="w-full h-full  p-10 rounded-md">
                      <div className="space-y-4 mt-4">
                        <div className="flex  items-center">
                          <span className="flex items-center gap-2">
                            <FaRegStar className="text-yellow-500" />
                            My Settings
                          </span>
                        </div>
                        <Divider />
                        
                        <div className="flex  items-center">
                          <span className="flex items-center gap-2">
                            <FaRegStar className="text-yellow-500" />
                            Upgrade to couple account
                          </span>
                        </div>
                        <Divider />
                        
                        <div className="flex  items-center">
                          <span className="flex items-center gap-2">
                            < FaCrown className="text-yellow-300"  onClick={()=>setIsMembershipOpen(true)}/>
                            My Membership
                          </span>

                        </div>
                        {isMembershipOpen && (
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <MembershipModal />
        </Suspense>
      )}
                    
                        <Divider />
        
                        <div className="flex  items-center">
                          <span className="flex items-center gap-2">
                            <SiAmazonsimpleemailservice className="text-blue-500" />
                            Verify via Facebook
                          </span>
                        </div>
                        <Divider />
        
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <RiFeedbackFill className="text-green-500" />
                            Favarated Host
                          </span>
                        </div>
                        <Divider />
                        <div className="flex justify-between">
                          <span className="flex  items-center gap-2">
                            <MdEmail className="text-purple-500" />
                            Last minute
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
        
                  {/**profile information */}
                  <div className="bg-[#fff] w-70% flex mt-5">
                    <div className="w-full h-full  p-10 rounded-md">
                      <h1 className="text-xl font-semibold">Profile Information</h1>
        
                      <div className="space-y-4 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <RiFeedbackFill className="text-green-500" />
                            Feedback
                          </span>
                          <span>40</span>
                        </div>
                        <Divider />
        
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <MdEmail className="text-purple-500" />
                            Email verified
                          </span>
                          <span>80%</span>
                        </div>
                      </div>
                    </div>
                  </div>
        
                  {/**personal note */}
                  <div className="bg-[#fff] w-80% flex mt-5 flex-col pb-10">
                    <h1 className="text-[#666] text-[25px] font-bold pl-3">
                      PersonalNote
                    </h1>
                    <div className="flex items-center justify-center pt-5">
                      <button className="flex items-center bg-[#f5f5f5] text-[22px] rounded-full w-fit px-[80px]">
                        <LuNotebookPen size={22} /> Add note
                      </button>
                    </div>
                  </div>
                </div>
      </div>
    </div>
  );
};

export default HostPreview;
