import React, { useEffect, useState } from "react";
import { IoLocationSharp, IoShareSocial } from "react-icons/io5";
import { MdEmail, MdOutlineElderlyWoman, MdRestore } from "react-icons/md";
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
const HostDetails = () => {

  const { id } = useParams<{ id: string }>(); // Get host ID from URL
  const [host, setHost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  console.log("hhhhhhhhhost ",host);
  
  return (
    <div className="flex flex-col bg-[#f5f5f5] ">
      <div className="bg-[#fff] ">
        <div className="px-[100px]">
          <div className="flex justify-between">
            <div className="flex space-x-1 text-yellow-400">
              <span className="text-2xl">&#9733;</span>
              <span className="text-2xl">&#9733;</span>
              <span className="text-2xl">&#9733;</span>
              <span className="text-2xl">&#9733;</span>
              <span className="text-2xl">&#9733;</span>
            </div>
            <button className="bg-green-400 rounded-full">updated</button>
          </div>
          <div>
            <h1 className="text-[#0a3f5f] text-[27px] font-bold my-[5px] mb-[15px]">
              Be part of our family, share, improve and leave an impact on us
              for generations to <br />
              come in Gerbstedt, Germany
            </h1>
          </div>
          <div className="flex flex-row">
            <div className="flex ">
              <IoLocationSharp size={25} />
              <span>Germanay</span>
            </div>

            <div className="flex ">
              <MdRestore size={25} />
              {"   "}
              <span>Last Activity:7 Mar 2025</span>
            </div>
          </div>
          <div className="flex w-[1000px] h-[500px] border gap-2">
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

        <div className="flex justify-between pl-[100px] pr-[249px] text-[#0a3f5f] text-[20px] p">
          <div className="flex flex-row space-x-6 ">
            <h1>Overview</h1>
            <h1>PHOTOS</h1>
            <h1>MAP</h1>
            <h1>FEEDBACK(29)</h1>
          </div>
          <div className="flex flex-row space-x-6 ">
            <button className="bg-slate-400 rounded-full ">
              <CiMenuKebab />
            </button>
            <button className="bg-slate-400 rounded-full ">
              <IoShareSocial />
            </button>
            <button className="flex flex-row bg-slate-400 rounded-full ">
              <FaHeartCircleCheck /> ADD TO MY HOSTLIST
            </button>
            <button className="flex flex-row  bg-slate-400 rounded-full p-2">
              <LuMessageSquareText /> CONTACT
            </button>{" "}
          </div>
        </div>
      </div>

      <div className="px-[100px] flex flex-row  mt-8 gap-7">
        <div className="w-2/3  ">
          {/**aviailability  */}
          <div className="w-80% p-6  bg-[#fff]">
            <div className="pt-10">
              <div className=" flex justify-between pb-4">
                <h1 className="text-[#666] text-[25px] font-bold">
                  Availability
                </h1>
                <div className="flex items-center">
                  <CiSquareChevLeft size={37} /> 2025{" "}
                  <CiSquareChevRight size={37} className="bg-green-500" />
                </div>
              </div>
              <span className="flex items-center ">
                <CiCalendar /> Min stay requested : atleast a week
              </span>
              <div className="flex flex-col gap-1 pt-7">
                <div className="flex flex-nowrap w-full gap-1">
                  <div className="w-[8.25%] bg-fuchsia-500 text-white  h-8 text-center">
                    Jan
                  </div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center">
                    Feb
                  </div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center">
                    Mar
                  </div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center">
                    Apr
                  </div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center">
                    May
                  </div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center">
                    Jun
                  </div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center">
                    Jul
                  </div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center">
                    Aug
                  </div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center">
                    Sep
                  </div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center">
                    Oct
                  </div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center">
                    Nov
                  </div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center">
                    Dec
                  </div>
                </div>
                <div className="flex flex-nowrap w-full gap-1">
                  <div className="w-[8.25%] bg-fuchsia-500 text-white  h-8 text-center"></div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center"></div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center"></div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center"></div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center"></div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center"></div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center"></div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center"></div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center"></div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center"></div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center"></div>
                  <div className="w-[8.25%] bg-fuchsia-500 text-white h-8 text-center"></div>
                </div>
                <div className="relative w-full  bg-gray-300">
                  <div className="absolute top-0 right-0 cursor-pointer">
                    What's this
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-80% p-6  bg-[#fff] mt-5">
            <h1 className="text-[#666] text-[25px] font-bold">Details</h1>
            <div className="w-full pl-4">
              <div className="flex items-center">
                <TbFileDescription />
                <h2 className=" text-[#b4cb3c] text-[1.1rem]">Description</h2>
              </div>
              <p>
               {host?.description}         </p>

              <Divider />

              <h2 className=" text-[#b4cb3c] text-[1.1rem]">
                {" "}
                Types of helps and learning oppertunities
              </h2>
              <div>
              {host?.selectedHelpTypes &&
  host?.selectedHelpTypes?.map((help: string, index: number) => (
    <span key={index} className="flex items-center gap-4 pl-4">
      {help}
    </span>
  ))}

              </div>

              <h1 className=" text-[#b4cb3c] text-[1.1rem]">
                Cultural exchange and learning opportunities
              </h1>
              <p>
                I speak Dutch, French, English, Spanish, and German and we can
                talk in any of these languages. I am an Advanced Photonic
                Therapy instructor and can teach you a course in that as I use
                it every day on the rescue animals. I live in beautiful
                surroundings where you can enjoy walks in nature for hours
                without meeting anyone. Alicante is close by where you can visit
                the Santa Bárbara Castle, an ancient fortress with panoramic
                views, the is an archaeological museum and a contemporary art
                museum, a beautiful casco Antiguo, the old part of Alicante
                which is like a village at the centre of the town, you have a
                beautiful basilic of Santa Maria, lots of beaches, boat trips,
                visit of the Island of Tabarca, beach sports, the is Elche
                Palmeral, the largest palm grove in Europe, etc. The beaches of
                El Campello and San Juan Playa are 15 minutes away by car, with
                lots of sports to do and nice bars for a drink and tapas too of
                course.
              </p>
              <Divider />

              <h1 className=" text-[#b4cb3c] text-[1.1rem]">Help</h1>
              <p>
                Responsibilities encompass a wide range of tasks such as
                building and repairing fences, installing flooring, tiling
                walls, thorough weeding, participating in carpentry projects,
                painting, aiding in hay-moving activities for the horses,
                cleaning paddocks, stone removal, acquiring new skills, wood
                collection, tree trimming, tree planting, and various other
                assignments.
              </p>

              <Divider />

              <h1 className=" text-[#b4cb3c] text-[1.1rem]">
                Languages spoken
              </h1>
              {host?.languageAndLevel &&
  host?.languageAndLevel.map((language: { language: string; level: string; _id: string }) => (
    <h1 key={language._id}>
      {language.language} : {language.level}
    </h1>
  ))}

              <Divider />
              <h1 className=" text-[#b4cb3c] text-[1.1rem]">Accomadation</h1>
              <p>
                I speak Dutch, French, English, Spanish, and German and we can
                talk in any of these languages. I am an Advanced Photonic
                Therapy instructor and can teach you a course in that as I use
                it every day on the rescue animals. I live in beautiful
                surroundings where you can enjoy walks in nature for hours
                without meeting anyone. Alicante is close by where you can visit
                the Santa Bárbara Castle, an ancient fortress with panoramic
                views, the is an archaeological museum and a contemporary art
                museum, a beautiful casco Antiguo, the old part of Alicante
                which is like a village at the centre of the town, you have a
                beautiful basilic of Santa Maria, lots of beaches, boat trips,
                visit of the Island of Tabarca, beach sports, the is Elche
                Palmeral, the largest palm grove in Europe, etc. The beaches of
                El Campello and San Juan Playa are 15 minutes away by car, with
                lots of sports to do and nice bars for a drink and tapas too of
                course.
              </p>
              <Divider />

              <h1 className=" text-[#b4cb3c] text-[1.1rem]">What else ...</h1>
              <p>
                What else ... Remote location from public transport so you need
                your own transport as I work fulltime I can't be driving you
                around in your free time. By car: 6 minutes to the village of
                Jijona, 15 minutes from the beaches of El Campello and San Juan
                Playa. 25 minutes from the center of Alicante with musea, art,
                festivals. 30 minutes to Benidorm. Lovely mountain villages
                surrounding Jijona like Torremanzanas, Sella, Relleu, el Castell
                de Guadalest...
              </p>
              <Divider />
              <h1 className=" text-[#b4cb3c] text-[1.1rem]">
                Can host digital nomads
              </h1>
              <span>Yes,WIFI 50/10 is available.</span>
   <Divider/>
              <h1 className=" text-[#b4cb3c] text-[1.1rem]">
                Space for parking camper vans
              </h1>
              <span>
                Any size Van can park on the premises, water is available, no
                extra electricity capacity as we have a solar-powered house with
                no extra elec capacity.
              </span>
              <Divider/>
              <h1 className=" text-[#b4cb3c] text-[1.1rem]">
              How many Workawayers can stay?
</h1>
<span>Two</span>


<div className="flex items-center justify-center text-[rgb(51 51 51 / 75%)] pb-56">
    Host ref number: 851331489494
</div>

            </div>
          </div>
        </div>
        
        <div className="w-1/4">
        {/**profile information */}
          <div className="bg-[#fff] w-70% flex">
            <div className="w-full h-full  p-10 rounded-md">
              <h1 className="text-xl font-semibold">Profile Information</h1>

              <div className="space-y-4 mt-4">
                {/* Host Rating */}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <FaRegStar className="text-yellow-500" />
                    Host rating
                  </span>
                  <span>80%</span>
                </div>
                <Divider />

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
                  <p> Usually responds within 2 days</p>
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
          <h1 className="text-[#666] text-[25px] font-bold pl-3">PersonalNote</h1>
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

export default HostDetails;
