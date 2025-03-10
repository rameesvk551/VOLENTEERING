import React, { useState } from "react";
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
  const [addIntrestedActivities, setAddIntrestedActivities] =useState<boolean>(false);
  const [editTravelStatus, setEditTravelStatus] = useState<boolean>(false);
  const [travelStatus, setTravelStatus] = useState<string>("Home");
  const [editSkills, setEditSkills] = useState<boolean>(false);
  const [editAge, setEditAge] = useState<boolean>(false);
  const [isSmoker, setIsSmoker] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [active,setActive]=useState<number>(1)
  const [age, setAge] = useState<number>(0);
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
      <div className="bg-[#fff] ">
        <div className="px-[100px]">
        
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
                    <h2>{travelStatus}</h2>
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
                <></>
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
                vero eos et accusamus et iusto odio dignissimos ducimus qui
                blanditiis praesentium voluptatum deleniti atque corrupti quos
                dolores et quas molestias excepturi sint occaecati cupiditate
                non provident, similique sunt in culpa qui officia deserunt
                mollitia animi, id est laborum et dolorum fuga. Et harum quidem
                rerum facilis est et expedita distinctio. Nam libero tempore,
                cum soluta nobis est eligendi optio cumque nihil impedit quo
                minus id quod maxime placeat facere possimus, omnis voluptas
                assumenda est, omnis dolor repellendus. Temporibus autem
                quibusdam et aut officiis debitis aut rerum necessitatibus saepe
                eveniet ut et voluptates repudiandae sint et molestiae non
                recusandae. Itaque earum rerum hic tenetur a sapiente delectus,
                ut aut reiciendis voluptatibus maiores alias consequatur aut
                perferendis doloribus asperiores repellat." 1914 translation by
                H. Rackham
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
                <h1>Web Developer</h1>
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
