import { useState } from "react";
import { Link } from "react-router-dom";
import Banner from "../../components/Banner";
import Card from "../../components/Card";

import { CATEGORIES, posts } from "../../utils/dummyData";

// Importing missing components (if they exist)

// Define a TypeScript interface for category items
interface Category {
  label: string;
  color: string;
 
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

const Home: React.FC = () => {
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
      <Banner post={posts[randomIndex]} />

      <div className='px-0 lg:pl-20 2xl:px-20'>
        {/* Categories */}
        <div className='mt-6 md:mt-0'>
          <p className='text-2xl font-semibold text-gray-600 dark:text-white'>Popular Categories</p>
          <div className='w-full flex flex-wrap py-10 gap-8'>
            {CATEGORIES.map((cat: Category) => (
              <Link
                to={`/category?cat=${cat?.label}`}
                className={`flex items-center justify-center gap-3 ${cat.color} text-white font-semibold text-base px-4 py-2 rounded cursor-pointer`}
                key={cat.label}
              >
              
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Blog Post */}
        <div className='w-full flex flex-col md:flex-row gap-10 2xl:gap-20'>
          {/* LEFT */}
          <div className='w-full md:w-2/3 flex flex-col gap-y-28 md:gap-y-14'>
            {posts?.map((post: Post, index: number) => (
              <Card key={post?._id} post={post} index={index} />
            ))}

           
          </div>

          {/* RIGHT */}
          <div className='w-full md:w-1/4 flex flex-col gap-y-12'>
 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
