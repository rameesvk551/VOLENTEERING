import React from "react";
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
const HostPreview = () => {
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

        <Divider />

        <div className="flex justify-between pl-[100px] pr-[160px] text-[#0a3f5f] text-[20px] pt-4 pb-5">
          <div className="flex flex-row space-x-6 ">
            <h1>Overview</h1>
            <h1>PHOTOS</h1>
            <h1>MAP</h1>
            <h1>FEEDBACK(29)</h1>
          </div>
          <div className="flex flex-row space-x-6 ">
     
        
            <button className="flex flex-row  bg-[#f5f5f5] rounded-full p-2 items-center px-6">
            <FaEye/> View Online
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
              <div className="flex justify-between">
                <div className="flex items-center">
                  <TbFileDescription />
                  <h2 className=" text-[#b4cb3c] text-[1.1rem]">Description</h2>
                </div>

                <button className="bg-green-400 rounded-md  flex items-center px-3">
                  {" "}
                  <CiEdit />
                  Edit
                </button>
              </div>
              <p>
                elf, who seeks after it and wants to have it, simply because it
                is pain..." What is Lorem Ipsum? Lorem Ipsum is simply dummy
                text of the printing and typesetting industry. Lorem Ipsum has
                been the industry's standard dummy text ever since the 1500s,
                when an unknown printer took a galley of type and scrambled it
                to make a type specimen book. It has survived not only five
                centuries, but also the leap into electronic typesetting,
                remaining essentially unchanged. It was popularised in the 1960s
                with the release of Letraset sheets containing Lorem Ipsum
                passages, and more recently with desktop publishing software
                like Aldus PageMaker including versions of Lorem Ipsum. Why do
                we use it? It is a long established fact that a reader will be
                distracted by the readable content of a page when looking at its
                layout. The point of using Lorem Ipsum is that it has a
                more-or-less normal distribution of letters, as opposed to using
                'Content here, content here', making it look like readable
                English. Many desktop publishing packages and web page editors
                now use Lorem Ipsum as their default model text, and a search
                for 'lorem ipsum' will uncover many web sites still in their
                infancy. Various versions have evolved over the years, sometimes
                by accident, sometimes on purpose (injected humour and the
                like). Where does it come from? Contrary to popular belief,
                Lorem Ipsum is not simply random text. It has roots in a piece
                of classical Latin literature from 45 BC, making it over 2000
                years old. Richard McClintock, a Latin professor at
                Hampden-Sydney College in Virginia, looked up one of the more
                obscure Latin words, consectetur, from a Lorem Ipsum passage,
                and going through the cites of the word in classical literature,
                discovered the undoubtable source. Lorem Ipsum comes from
                sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum"
                (The Extremes of Good and Evil) by Cicero, written in 45 BC.
                This book is a treatise on the theory of ethics, very popular
                during the Renaissance. The first line of Lorem Ipsum, "Lorem
                ipsum dolor sit amet..", comes from a line in section 1.10.32.
                The standard chunk of Lorem Ipsum used since the 1500s is
                reproduced below for those interested. Sections 1.10.32 and
                1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also
                reproduced in their exact original form, accompanied by English
                versions from the 1914 translation by H. Rackham. Where can I
                get some? There are many variations of passages of Lorem Ipsum
                available, but the majority have suffered alteration in some
                form, by injected humour, or randomised words which don't look
                even slightly believable. If you are going to use a passage of
                Lorem Ipsum, you need to be sure there isn't anything
                embarrassing hidden in the middle of text. All the Lorem Ipsum
                generators on the Internet tend to repeat predefined chunks as
                necessary, making this the first true generator on the Internet.
                It uses a dictionary of over 200 Latin words, combined with a
                handful of model sentence structures, to generate Lorem Ipsum
                which looks reasonable. The generated Lorem Ipsum is therefore
                always free from repetition, injected humour, or
                non-characteristic words etc. 5 paragraphs words bytes lists
                Start with 'Lorem ipsum dolor sit amet...'
              </p>

              <Divider />
              <div className="flex justify-between">
                <h2 className=" text-[#b4cb3c] text-[1.1rem]">
                  {" "}
                  Types of helps and learning oppertunities
                </h2>
                <button className="bg-green-400 rounded-md  flex items-center px-3">
                  {" "}
                  <CiEdit />
                  Edit
                </button>
              </div>

              <div>
                {helpOptions &&
                  helpOptions.map((help) => (
                    <span className="flex items-center gap-4 pl-4">
                      {help.icon} {help.label}
                    </span>
                  ))}
              </div>

              <div className="flex justify-between">
                <h1 className=" text-[#b4cb3c] text-[1.1rem]">
                  Cultural exchange and learning opportunities
                </h1>
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
              <div className="flex justify-between">
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

              <div className="flex justify-between">
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
              <div className="flex justify-between">
                <h1 className=" text-[#b4cb3c] text-[1.1rem]">What else ...</h1>
                <button className="bg-green-400 rounded-md  flex items-center px-3">
                  {" "}
                  <CiEdit />
                  Edit
                </button>
              </div>

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
