import { TbFileDescription } from "react-icons/tb";
import Divider from "../Divider";
import Review from "./Review";
import { CiCalendar, CiSquareChevLeft, CiSquareChevRight } from "react-icons/ci";

const OverviewSection=({host})=>{
    const highlights = [
      "secure transactions",
      "24/7 customer support",
      "Seamless experience",
      "AI recommendations",
      "Affordable pricing plans",
      "Multi-language support",
      "Parking For Campervan",
      "Internent Access",
      "Smoke Free"
    ];
    return(
    
  <div className="w-80%">
           
              <div className="pt-4">
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
          
  
            <div className="w-80% p-6   mt-5">
              <h1 className="text-[#666] text-[25px] font-bold">Details</h1>
              <div className="w-full pl-4">
                <div className="flex items-center">
                  <TbFileDescription />
                  <h2 className=" text-[#b4cb3c] text-[1.1rem]">Description</h2>
                </div>
                <p style={{ wordBreak: "break-word" }}>
  {host?.description}
</p>

  
                <Divider />
  
                <h2 className=" text-[#b4cb3c] text-[1.1rem]">
                  {" "}
                  Types of helps and learning oppertunities
                </h2>
                <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mt-2">
    {host?.selectedHelpTypes &&
      host?.selectedHelpTypes.map((help: string, index: number) => (
        <div
          key={index}
          className="bg-white p-4 text-center rounded-lg border border-gray-300 shadow-lg shadow-white transition duration-300 ease-in-out hover:shadow-xl"
        >
          {help}
        </div>
      ))}
  </div>
  
  
                
  
  
                <h1 className=" text-[#b4cb3c] text-[1.1rem]">Help</h1>
                <p>
                <p style={{ wordBreak: "break-word" }}>
  {host?.description}
</p>

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
  
         
   
  <div className="flex flex-col pt-5" >
    <h3 className="text-[26px]">Highlights</h3>
  <ul className="grid grid-cols-3 gap-2 max-w-3xl mx-auto list-disc list-inside text-gray-800 pt-5 font-medium text-md">
    {highlights.map((highlight, index) => (
      <li key={index} className="text-lg">{highlight}</li>
    ))}
  </ul>
  
  </div>
  <Divider/>
  <div className="flex items-center justify-center text-[rgb(51 51 51 / 75%)] pb-56">
      Host ref number: {host._id}
    
  </div>
  
  
  
              </div>
            </div>
          </div>
    )
  }

  export default OverviewSection