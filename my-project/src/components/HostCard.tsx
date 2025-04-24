import Markdown from "markdown-to-jsx";
import React from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Link } from "react-router-dom";
import Button from "./Button";
import { GrContact } from "react-icons/gr";
import { CiLocationOn } from "react-icons/ci";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ContactHostButton from "./ContactHostButton";
// Define the TypeScript interface for the post object

interface HostCardProps {
  host: Host;
}


const HostCard: React.FC<HostCardProps> = ({ host }) => {
  
 
  const projectNames = host?.selectedHelpTypes?.slice(0, 2)
  const extractPlace = host?.address?.display_name
  ? host.address.display_name.split(',').map(part => part.trim())
  : [];

  const country = extractPlace[extractPlace?.length - 1]; 
  return (
    <div
    key={host?._id}
    className="w-full flex flex-col sm:flex-row gap-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
  >
    {/* Image */}
    <Link
      to={`/host-details/${host._id}`}
      className="w-full sm:w-1/2 h-[200px] sm:h-[200px] overflow-hidden rounded-lg"
    >
      <img
        src={host?.images?.[0]?.url}
        alt={host?.title}
        className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
      />
    </Link>
  
    {/* Content */}
    <div className="w-full sm:w-1/2 flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-gray-600">
          <CiLocationOn className="text-gray-400" />
          <span>{country}</span>
          <span className="ml-auto sm:ml-0 text-rose-600 font-semibold">
            {projectNames[0]}
          </span>
        </div>
  
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
        {host?.heading || " Volunteer in an off‑grid community"} 
        </h2>
  
        <div className="text-gray-600 text-sm text-justify line-clamp-3 sm:line-clamp-4 mb-4">
          <Markdown options={{ wrapper: 'article' }}>
            {host?.description}
          </Markdown>
        </div>
      </div>
  
 <ContactHostButton  hostId={host?._id}/>

    </div>
  </div>
  
  );
};

export default HostCard;