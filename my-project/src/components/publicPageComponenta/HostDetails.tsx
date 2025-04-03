import React, { useEffect, useState } from "react";
import { IoLocationSharp, IoShareSocial } from "react-icons/io5";
import { MdEmail, MdOutlineElderlyWoman, MdOutlineVerifiedUser, MdRestore } from "react-icons/md";
import Divider from "../Divider";
import { FaHeartCircleCheck, FaRegStar } from "react-icons/fa6";
import { LuMessageSquareText, LuNotebookPen, LuTrees } from "react-icons/lu";
import {
  CiCalendar,
  CiMenuKebab,
  CiSquareChevLeft,
  CiSquareChevRight,
} from "react-icons/ci";
import { RiFeedbackFill } from "react-icons/ri";
import { SiAmazonsimpleemailservice } from "react-icons/si";
import { TbFileDescription } from "react-icons/tb";
import { GiDrowning, GiTeacher } from "react-icons/gi";
import { PiCookingPot } from "react-icons/pi";
import { useParams } from "react-router-dom";
import { fetchHostById } from "../../api";
import Review from "../hostDetailsPageComponents/Review";
import OverviewSection from "../hostDetailsPageComponents/OverviewSection";
import PhotosSection from "../hostDetailsPageComponents/PhotosSection";
const HostDetails = () => {
  const tabs=[
    { id: 1, label: "OVERVIEW" },
    { id: 2, label: "PHOTOS" },
    { id: 3, label: "MAP" },
    { id: 4, label: "FEEDBACK(2)" },
  ]

  const formatDate =  (isoDate: string | Date): string  => {
    const date = new Date(isoDate);
    
    const day = date.getDate(); 
    const month = date.getMonth() + 1; 
    const year = date.getFullYear(); 
  
    return `${day}-${month}-${year}`;
  };

 
  const { id } = useParams<{ id: string }>(); // Get host ID from URL
  const [host, setHost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [active,setActive]=useState<number>(1)
const lastActive = host?.lastActive
const images=host?.images
  interface Image {
    url: string;
    description: string;
    _id: string;
  }


  useEffect(() => {
    if (id) {
      fetchHostById(id)
        .then((data) => {
          setHost(data.host);
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to fetch host details");
          setLoading(false);
        });
    }
  }, [id]);


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
    <div className="flex flex-col bg-[#fff] ">
      <div className="bg-[#fff] ">
        <div className="px-[100px]">
        
        
          <div className="flex w-full h-[500px] border gap-2">
  {/* Left side (Main Image) */}
  <div className="w-1/2 h-full bg-black">
    <img
      src={host?.images?.[0]?.url}
      alt={host?.images?.[0]?.description}
      className="w-full h-full object-cover"
    />
  </div>

  {/* Right side (4 smaller images in a grid) */}
  <div className="w-1/2 h-full grid grid-cols-2 grid-rows-2 gap-3">
    {host?.images?.slice(1, 5).map((img:Image, index:number) => (
      <div key={index} className="relative w-full h-full">
        <img
          src={img.url}
          alt={img.description}
          className="w-full h-full object-cover rounded"
        />
        <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 p-1 text-sm rounded">
          {img.description}
        </p>
      </div>
    ))}
  </div>
</div>

        </div>

        <Divider />

    
      </div>

     

      <div className="px-[100px] flex flex-row  mt-8 gap-7  bg-[#fff]">
        <div className="w-2/3  ">

        <div className=" ">
        <div>
            <h1 className="text-[#0a3f5f] text-md font-bold my-[5px] mb-[15px] pt-3">
              Be part of our family, share, improve and leave an impact on us
              for generations to <br />
              come in Gerbstedt, Germany
            </h1>
          </div>
          <div className="flex justify-between ">
          <div className="flex flex-row gap-3">
            <div className="flex items-center ">
              <IoLocationSharp size={15} />
              <span>Germanay</span>
            </div>

            <div className="flex items-center gap-2 ">
              <MdRestore size={15} />
              {"   "}
              <span>Last Activity:{formatDate(lastActive)}</span>
            </div>
            </div>
            <div className="flex items-center gap-2 ">
              <span>4.5(247 reviews)</span>
              <span className="flex flex-row items-center"><MdOutlineVerifiedUser/> Verified Host</span>
            </div>
          </div>
          </div>


<div className="flex space-x-10    items-center mt-3 justify-around w-full border border-black ">
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

{active === 1 && <OverviewSection host={host} />}
{active === 2 && <PhotosSection images={images} />}
{active === 3 && <div className="flex flex-col items-center gap-3 mt-4"><Review />
  <Review />
  <Review />
  <Review /></div>
}




        </div>
        
        <div className="w-1/4  flex flex-col  border h-full border-black">
        <div className="flex items-center justify-between  p-2">
          <button className="border border-black px-6 py-1 text-black rounded font-bold">Follow</button>
          <button className="bg-black px-6 py-1 rounded text-[#fff] font-bold">Message</button>
        </div>
        {/**profile information */}
          <div className="bg-[#fff] w-70% flex">
            <div className="w-full h-full  p-10 rounded-md">
              <h1 className="text-xl font-semibold">Profile Information</h1>

              <div className="space-y-4 mt-4">
             

                {/* Last Replied */}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <SiAmazonsimpleemailservice className="text-blue-500" />
                    Last replied
                  </span>
                  <span>7 March 2025</span>
                </div>
                <Divider />

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <RiFeedbackFill className="text-green-500" />
                    Feedback
                  </span>
                  <span>40</span>
                </div>
                <Divider />
                <div className="flex justify-between">
                  <span className="flex  items-center gap-2">
                    <MdEmail className="text-purple-500" />
                    Replay rate
                  </span>
                  <span>80%</span>
                </div>
                <div className=" justify-center">
                  <p className="text-sm"> Usually responds within 2 days</p>
                </div>
                <Divider />

               
              </div>
            </div>
          </div>

 
        </div>
      </div>
    </div>
  );
};

export default HostDetails;






interface Image {
  url: string;
  description: string;
  _id: string;
}


