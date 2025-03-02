import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import Banner from "../components/Banner";
import Card from "./BlogCard";

import { CATEGORIES, posts } from "../utils/dummyData";
import Divider from "./Divider";
import Markdown from "markdown-to-jsx";
import { AiOutlineArrowRight } from "react-icons/ai";
import HostCard from "./HostCard";
import { IconType } from "react-icons/lib";

// Importing missing components (if they exist)

// Define a TypeScript interface for category items
interface Category {
  label: string;
  color: string;
  icon?:IconType
 
}

// Define a TypeScript interface for post items
interface Post {
  _id: string;
  slug: string;
  img: string;
  title: string;
  desc: string;
  createdAt: string;
  cat: string;
}

// Define a TypeScript interface for the popular posts and writers
interface PopularData {
  posts: Post[];
  writers: { name: string; avatar: string }[];
}

const HostList: React.FC = () => {
  const numOfPages = 4;
  const [page, setPage] = useState<number>(0);

  const randomIndex = Math.floor(Math.random() * posts.length);

  const handlePageChange = (val: number) => {
    setPage(val);
    console.log(val);
  };

  if (posts?.length < 1)
    return (
      <div className='w-full h-full py-8 flex items-center justify-center'>
        <span className='text-lg text-slate-500'>No Post Available</span>
      </div>
    );

  return (
    <div className='py-10 2xl:py-5'>
    
      <div className='px-0 lg:pl-10 pr-5 2xl:px-20'>
        <div className="bg-[#fafafa]">
        <Divider/>
        {/* Categories */}
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

        {/* Blog Post */}
        <div className='w-full flex flex-col md:flex-row gap-10 2xl:gap-20 pt-5'>
          {/* LEFT */}
          <div className='w-full md:w-2/3 flex flex-col gap-y-22 md:gap-y-14'>
            {posts?.map((post: Post, index: number) => (
              <HostCard key={post?._id} post={post} index={index} />
            ))}

           
          </div>

          {/* RIGHT */}
          <div className='w-full md:w-1/4 flex flex-col  gap-y-12 pl-[30px]'>
        {posts && posts.map((post)=>(
               <div className="  md:1/4 flex flex-row md:flex-col" >
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
    </div>
  );
};

export default HostList;
