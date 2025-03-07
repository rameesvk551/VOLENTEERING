import React from "react";
import { IoLocationSharp, IoShareSocial } from "react-icons/io5";
import { MdEmail, MdOutlineElderlyWoman, MdRestore } from "react-icons/md";
import Divider from "../Divider";
import {
  FaEye,
  FaHammer,
  FaHeartCircleCheck,
  FaLanguage,
  FaRegStar,
} from "react-icons/fa6";
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
import { BiLeaf } from "react-icons/bi";
const HostProfileEdit = () => {
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
    { label: "Cooking", icon: <PiCookingPot size={60} /> },
    { label: "Art", icon: <GiDrowning size={60} /> },
    { label: "Teaching", icon: <GiTeacher size={60} /> },
    { label: "Gardening", icon: <MdOutlineElderlyWoman size={60} /> },
    { label: "Animal Care", icon: <LuTrees size={60} /> },
    { label: "Help with Computer", icon: <LuTrees size={60} /> },
    { label: "Language Practice", icon: <FaLanguage size={60} /> },
    { label: "Help Around House", icon: <FaHammer size={60} /> },
    { label: "Babysitting and Creative play", icon: <FaLanguage size={60} /> },
    { label: "  DIV  Projects", icon: <FaHammer size={60} /> },
    { label: "  Eco  projects", icon: <BiLeaf size={60} /> },
  ];
  return (
    <div className="flex flex-col bg-[#f5f5f5] ">
      <div className="px-[100px] flex flex-row  mt-8 gap-7">
        <div className="w-2/3  ">
          <div className="w-80% p-6  bg-[#fff] mt-5">
            <div className="w-full pl-4">
              <div className="flex items-center">
                <TbFileDescription />
                <h2 className=" text-[#b4cb3c] text-[1.1rem]">Description</h2>
              </div>

              <div className="w-full flex flex-col">
                <label htmlFor="">Title for your listing</label>
                <textarea
                  name=""
                  id=""
                  className="w-full flex border border-black "
                ></textarea>
                <span>0/120 charactors </span>{" "}
              </div>

              <div className="w-full flex flex-col">
                <label htmlFor="">
                  Tell Workawayers about yourself, your family, project or
                  organisation
                </label>
                <textarea
                  name=""
                  id=""
                  className="w-full flex  border border-black "
                ></textarea>
              </div>

              <Divider />

              {/**help types */}
              <div className="pt-5">
                <h2 className=" text-[#b4cb3c] text-[1.1rem]">
                  {" "}
                  Please tick which type(s) of help you need.
                </h2>

                <div className="grid grid-cols-4 gap-4 p-4">
                  {helpOptions &&
                    helpOptions.map((help) => (
                      <div className=" flex flex-col p-4 items-center border border-black">
                        {help.icon} {help.label}{" "}
                      </div>
                    ))}
                </div>
              </div>

              <Divider />

 <div className="pt-5">
 <h1 className=" text-[#b4cb3c] text-[1.1rem]">Helps</h1>

<div className="w-full flex flex-col pt-3">
  <label htmlFor="">
    You can provide details about the help requested from
    travellers here
  </label>
  <textarea
    name=""
    id=""
    className="w-full flex border border-black "
  ></textarea>
</div>
<div className="w-full flex flex-col pt-3">
  <label htmlFor="">
 Type of accomadation
  </label>
  <textarea
    name=""
    id=""
    className="w-full flex border border-black "
  ></textarea>
</div>

<div className="w-full flex flex-col pt-3">
  <label htmlFor="">
  How will travellers benefit from a cultural exchange and what could they learn?
  </label>
  <textarea
    name=""
    id=""
    className="w-full flex border border-black "
  ></textarea>
</div>

 </div>
              <Divider />


<div className="flex flex-col pt-5 pb-5">
<h1 className=" text-[#b4cb3c] text-[1.1rem]">
Phone number | This won't appear online</h1>
<div className="flex flex-row justify-between w-full gap-2">
<div className="flex flex-col w-1/2" >
        <label htmlFor="">Telephone Number</label>
        <input type="text"   className=" w-full border border-black" />
    </div>
    <div className="flex flex-col w-1/2" >
    <label htmlFor="">Phone Number</label>
    <input type="text"  className=" w-full border border-black"/>
    </div>
</div>
</div>

              
              <div className="flex justify-between ">
                <h1 className=" text-[#b4cb3c] text-[1.1rem]">
                  Languages spoken
                </h1>
                <button className="bg-green-400 rounded-md  flex items-center px-3">
                  {" "}
                  <CiEdit />
                  Edit
                </button>
              </div>

              {languageSpoken &&
                languageSpoken.map((language) => (
                  <h1>
                    {language.language} : {language.level}
                  </h1>
                ))}
              <Divider />

              <div className="flex justify-between ">
                <h1 className=" text-[#b4cb3c] text-[1.1rem]">Accomadation</h1>
                <button className="bg-green-400 rounded-md  flex items-center px-3">
                  {" "}
                  <CiEdit />
                  Edit
                </button>
              </div>

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
              
                <h1 className=" text-[#b4cb3c] text-[1.1rem] pt-2">What else ...</h1>
           
                <div className="w-full flex flex-col pt-3">
  <label htmlFor="">
  Please add anything else relevant that you would like to go online, such as what helpers can do with their time off, local sights and available transport etc.
  (We ask you not to add your website URL or email address to your host listing)</label>
  <input
    name=""
    id=""
    className="w-full flex border border-black h-[70px] "
  />
</div>
            
              <Divider />

              <div className="flex justify-between">
                <h1 className=" text-[#b4cb3c] text-[1.1rem]">
                  Can host digital nomads
                </h1>
                <button className="bg-green-400 rounded-md  flex items-center px-3">
                  {" "}
                  <CiEdit />
                  Edit
                </button>
              </div>

              <span>Yes,WIFI 50/10 is available.</span>
              <Divider />

              <div className="flex justify-between">
                <h1 className=" text-[#b4cb3c] text-[1.1rem]">
                  Space for parking camper vans
                </h1>
                <button className="bg-green-400 rounded-md  flex items-center px-3">
                  {" "}
                  <CiEdit />
                  Edit
                </button>
              </div>

              <span>
                Any size Van can park on the premises, water is available, no
                extra electricity capacity as we have a solar-powered house with
                no extra elec capacity.
              </span>
              <Divider />

              <div className="flex justify-between pt-5">
                <h1 className=" text-[#b4cb3c] text-[1.1rem]">
                  How many Workawayers can stay?
                </h1>
                <button className="bg-green-400 rounded-md  flex items-center px-3">
                  {" "}
                  <CiEdit />
                  Edit
                </button>
              </div>

              <span>Two</span>

              <div className="flex items-center justify-center text-[rgb(51 51 51 / 75%)] pb-56">
                Host ref number: 851331489494
              </div>
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

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <RiFeedbackFill className="text-green-500" />
                    Go to the Top of Host list
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

export default HostProfileEdit;
