
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHosts } from "../api";
import HostCard from "./HostCard";
import { CATEGORIES, posts } from "../utils/dummyData";
import { Link } from "react-router-dom";
import Divider from "./Divider";

const HostList = () => {
  interface Category {
    label: string;
    color: string;
    icon?:IconType
   
  }

  const [page, setPage] = useState(1); 
  const { data, isLoading, error } = useQuery({
    queryKey: ["hosts", page], 
    queryFn: () => fetchHosts(page),
    staleTime: 300000, 
  });

  if (isLoading) return <p>Loading hosts...</p>;
  if (error) return <p>Error fetching hosts!</p>;

  return (
    <div className='py-10 2xl:py-5'>
     
    
    <div className='px-0 lg:pl-10 pr-5 2xl:px-20'>
      <div className="bg-[#fafafa]">
      <Divider/>
     
      <div className='mt-6 md:mt-0'>
        <p className='text-2xl font-semibold text-gray-600 dark:text-white'>Popular Categories</p>
        <div className='w-full flex flex-wrap py-10 gap-8 pl-10'>
          {CATEGORIES.map((cat: Category) => (
            <Link
            to={`/category?cat=${cat?.label}`}
            className={`flex items-center justify-center gap-3 bg-white  text-black font-semibold text-base px-4 py-2 rounded cursor-pointer`}
            key={cat.label}
          >
            {cat?.icon && <cat.icon/>}
            <span>{cat.label}</span>
          </Link>
          ))}
        </div>
      </div>
      </div>

     
      <div className='w-full flex flex-col md:flex-row gap-10 2xl:gap-20 pt-5'>
        
        <div className='w-full md:w-2/3 flex flex-col gap-y-22 md:gap-y-14'>
            {data?.hosts.map((host:Host) => (
        <HostCard key={host._id} host={host} />
      ))}

         
        </div>

       
        <div className='w-full md:w-1/4 flex flex-col  gap-y-12 pl-[30px]'>
      {posts && posts.map((post)=>(
             <div className="  md:1/4 flex flex-row md:flex-col border border-black" >
             <Link to={`/${post?.slug}/${post._id}`} className=' h-auto '>
          <img src={post?.img} alt={post?.title}  className=' w-[300px]  rounded' />
        </Link>
  
        <div className='w-full md:w-2/4 flex flex-col gap-3'>
          <h6 className='text-xl 2xl:text-3xl font-semibold text-black dark:text-white'>
            {post?.title}
          </h6>
        </div>
  
             
             </div>
      )) }
        </div>
      </div>
    </div>
       Pagination Controls 
      <div className="flex justify-center mt-5 gap-3">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        Previous
      </button>
      <button
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        Next
      </button>
    </div>
  </div>
  );
};

export default HostList;

