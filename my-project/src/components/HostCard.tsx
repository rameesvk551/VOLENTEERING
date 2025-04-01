import Markdown from "markdown-to-jsx";
import React from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Link } from "react-router-dom";
import Button from "./Button";
import { GrContact } from "react-icons/gr";
import { CiLocationOn } from "react-icons/ci";
// Define the TypeScript interface for the post object

interface HostCardProps {
  host: Host;
}


const HostCard: React.FC<HostCardProps> = ({ host }) => {
  return (
    <div
      key={host?._id}
      className={`w-full flex flex-col gap-8 items-center rounded md:flex-row border border-black`}
    >
      <Link to={`/host-details/${host._id}`} className='w-full h-auto md:h-64 md:w-2/4 '>
      <img src={host?.images?.[0]?.url} alt={host?.title} className='object-cover w-full h-full rounded' />

      </Link>

      <div className='w-full md:w-2/4 flex flex-col gap-3'>
        <div className='flex gap-2 mt-2'>
          <span className='text-sm text-gray-600 flex gap-1 items-center justify-center' ><CiLocationOn />Nadapuram</span>
          <span className='text-sm text-rose-600 font-semibold'>Eco Project</span>
        </div>

        <h6 className='text-xl 2xl:text-3xl font-semibold text-black dark:text-white'>
         volenteer in a off grid cplot doei fg4iv
        </h6>

        <div className='flex-1 overflow-hidden text-gray-600 dark:text-slate-500 text-sm text-justify'>
          <Markdown options={{ wrapper: "article" }}>{host?.description?.slice(0, 250) + "..."}</Markdown>
        </div>

        <Link to={`/`} className='flex items-center  text-black dark:text-white'>
        <Button
                    label='Contact'
                    icon={<GrContact size={15} />}
                    styles=' flex flex-row-reverse gap-1 bg-blue-400  dark:border text-white px-2 py-1 mb-2 rounded-full'
                  />
        </Link>
      </div>
    </div>
  );
};

export default HostCard;