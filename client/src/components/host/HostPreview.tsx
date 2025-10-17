import React, { useEffect, useState } from "react";
import { IoLocationSharp, IoShareSocial } from "react-icons/io5";
import { MdEmail, MdOutlineElderlyWoman, MdRestore } from "react-icons/md";
import Divider from "../Divider";
import { FaEye, FaHeartCircleCheck, FaRegStar } from "react-icons/fa6";
import { LuMessageSquareText, LuNotebookPen, LuTrees } from "react-icons/lu";
import {
  CiCalendar,
  CiEdit,
  CiMenuKebab,
  CiSquareChevLeft,
  CiSquareChevRight,
} from "react-icons/ci";
import { RiFeedbackFill } from "react-icons/ri";
import { SiAmazonsimpleemailservice } from "react-icons/si";
import { TbFileDescription } from "react-icons/tb";
import { GiDrowning, GiTeacher } from "react-icons/gi";
import { PiCookingPot } from "react-icons/pi";
import { IoMdHeart } from "react-icons/io";
import { loadHost } from "../../redux/thunks/hostTunk";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import HostLogin from "../login/HostLogin";
import Review from "../hostDetailsPageComponents/Review";
import PhotosSection from "../hostDetailsPageComponents/PhotosSection";
import { useNavigate } from "react-router-dom";
type HostType = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    boundingbox: string[];
    [key: string]: any;
  };
  description: string;
  selectedHelpTypes: string[];
  allowed: string[];
  accepted: string[];
  languageDescription: string;
  languageAndLevel: {
    language: string;
    level: string;
  }[];
  showIntreastInLanguageExchange: boolean;
  privateComment: string;
  organisation: string;
  images: {
    url: string;
    description: string;
  }[];
  availability: string;
  minimumStay: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

const HostPreview = () => {

  const dispatch = useDispatch<AppDispatch>();
  const [activeTabId, setActiveTabId] = useState<number>(1);

  const [host, setHost] = useState<HostType | null>(null);
  const { hostData, loading, error } = useSelector((state: RootState) => state.host);

  useEffect(() => {
    dispatch(loadHost());
  }, [dispatch]);
  
  useEffect(() => {
    if (hostData?.host) {
      setHost(hostData.host);
    }
  }, [hostData]);


if(loading){
  return <div> loading</div>
}
  console.log("hhhhhhhhhhhost data", host);

  const tabs=[
    { id: 1, label: "OVERVIEW" },
    { id: 2, label: "PHOTOS" },
    { id: 3, label: "MAP" },
    { id: 4, label: "FEEDBACK(2)" },
  ]


  return (
    

   




    <div className="flex flex-col bg-[#f5f5f5] min-h-screen">
    <div className="bg-white w-full shadow-sm">
      <div className="px-4 md:px-12 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex space-x-1 text-yellow-400">
            {Array(5).fill("★").map((star, i) => (
              <span key={i} className="text-2xl">{star}</span>
            ))}
          </div>
          <button className="bg-green-500 text-white px-4 py-1 rounded-full mt-2 sm:mt-0">Updated</button>
        </div>

        <h1 className="text-[#0a3f5f] text-xl md:text-2xl font-bold my-4">
          WELCOME {host?.firstName} {host?.lastName}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <IoMdHeart size={20} />
            <span>Favourited 0 times</span>
          </div>

          <div className="flex items-center gap-1">
            <MdRestore size={20} />
            <span>Last login: 7 Mar 2025 05:29 CST</span>
          </div>

          <div className="flex items-center gap-1">
            <MdRestore size={20} />
            <span>Last activity : 7 Mar 2025</span>
          </div>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col lg:flex-row justify-between px-4 md:px-12 py-4 items-center">
        <div className="flex flex-wrap gap-6 text-[#0a3f5f] text-base font-medium">
          {tabs && tabs.map((tab) => (
            <h5
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`cursor-pointer pb-2 ${
                activeTabId === tab.id ? "font-bold text-crimson border-b-2 border-crimson" : "text-gray-600"
              }`}
            >
              {tab.label}
            </h5>
          ))}
        </div>

        <button className="flex items-center gap-2 mt-4 lg:mt-0 bg-gray-100 text-sm px-4 py-2 rounded-full shadow-sm">
          <FaEye /> View Online
        </button>
      </div>
    </div>

    {activeTabId === 1 && <HostOverview host={host} />}
{activeTabId === 2 && <PhotosSection images={host?.images} />}
{activeTabId === 4 && (
  <div className="flex flex-col items-center gap-3 mt-4">
    <Review />
    <Review />
  </div>
)}


  </div>
  );
};

export default HostPreview;
const HostOverview=({host})=>{
  const navigate=useNavigate()
  const editProfile=()=>{
    navigate(`/host/edit-profile/${host._id}`)
     }
  return(
    
   

    <div className="px-4 md:px-12 mt-8 flex flex-col lg:flex-row gap-8">
      {/* Left section */}
      <div className="lg:w-2/3 space-y-6">
        {/* Availability */}
        <div className="bg-white p-6 rounded-md shadow-md">
          <div className="flex justify-between items-center pb-4">
            <h1 className="text-xl font-bold text-gray-700">Availability</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <CiSquareChevLeft size={28} />
              <span className="font-medium">2025</span>
              <CiSquareChevRight size={28} />
            </div>
          </div>

          <span className="flex items-center text-sm text-gray-500">
            <CiCalendar className="mr-2" /> Min stay requested: at least a week
          </span>

          <div className="mt-6">
            <div className="grid grid-cols-12 gap-1 text-white text-sm">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => (
                <div key={month} className="bg-fuchsia-500 h-8 flex items-center justify-center rounded-md">
                  {month}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white p-6 rounded-md shadow-md space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TbFileDescription />
              <h2 className="text-lg text-[#b4cb3c] font-semibold">Description</h2>
            </div>
            <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1">
              <CiEdit /> Edit
            </button>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{host?.description}</p>

          <Divider />

          <div className="flex justify-between items-center">
            <h2 className="text-lg text-[#b4cb3c] font-semibold">Types of help & learning opportunities</h2>
            <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1">
              <CiEdit /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {host?.selectedHelpTypes?.map((help, index) => (
              <div
                key={index}
                className="bg-white p-3 text-center rounded-md border border-gray-200 shadow hover:shadow-md transition"
              >
                {help}
              </div>
            ))}
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <h2 className="text-lg text-[#b4cb3c] font-semibold">Languages spoken</h2>
            <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1">
              <CiEdit /> Edit
            </button>
          </div>
          <div className="space-y-1">
            {host?.languageAndLevel?.map((lang, index) => (
              <p key={index} className="text-sm text-gray-700">{lang.language}: {lang.level}</p>
            ))}
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <h2 className="text-lg text-[#b4cb3c] font-semibold">Accommodation</h2>
            <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1">
              <CiEdit /> Edit
            </button>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {/* Sample text about accommodation, replace with host.accommodation if exists */}
            I speak Dutch, French, English, Spanish, and German and we can talk in any of these languages...
          </p>

          <Divider />

          <div className="flex justify-between items-center">
            <h2 className="text-lg text-[#b4cb3c] font-semibold">What else ...</h2>
            <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1">
              <CiEdit /> Edit
            </button>
          </div>
          <p className="text-sm text-gray-700">What else ... Remote location from public transport so you need</p>

          <Divider />

          <div className="flex justify-between items-center">
            <h2 className="text-lg text-[#b4cb3c] font-semibold">Can host digital nomads</h2>
            <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1">
              <CiEdit /> Edit
            </button>
          </div>
          <p className="text-sm text-gray-700">Yes</p>
        </div>
      </div>
      <div className="w-1/3">
      
      <div className="bg-[#fff] w-70% flex">
        <div className="w-full h-full  p-10 rounded-md">
       

          <div className="space-y-4 mt-4">
            <div className="flex  items-center" onClick={editProfile}>
              <span className="flex items-center gap-2">
                <FaRegStar className="text-yellow-500" />
                Edit Profile
              </span>
            </div>
            <Divider />

   
            <div className="flex  items-center">
              <span className="flex items-center gap-2">
                <SiAmazonsimpleemailservice className="text-blue-500" />
               Verify via Facebook
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
       <div className="bg-[#fff] w-70% flex mt-5" >
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

 
    </div>
    </div>

  )
}