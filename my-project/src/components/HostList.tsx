
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
    icon?: any;
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
    <div className="py-10 2xl:py-5">
      <div className="px-4 sm:px-6 md:px-10 lg:pl-10 2xl:px-20">
        <div className="bg-[#fafafa]">
          <Divider />

          <div className="mt-6 md:mt-0">
            <p className="text-2xl font-semibold text-gray-600 dark:text-white">
              Popular Categories
            </p>
            <div className="w-full flex flex-wrap py-10 gap-4 sm:gap-6 md:gap-8">
              {CATEGORIES.map((cat: Category) => (
                <Link
                  to={`/category?cat=${cat?.label}`}
                  className="flex items-center justify-center gap-3 bg-white text-black font-semibold text-base px-4 py-2 rounded cursor-pointer shadow-sm"
                  key={cat.label}
                >
                  {cat?.icon && <cat.icon />}
                  <span>{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row gap-10 2xl:gap-20 pt-5">
          {/* Host Cards */}
          <div className="w-full md:w-2/3 flex flex-col gap-10">
            {data?.hosts.map((host: Host) => (
              <HostCard key={host._id} host={host} />
            ))}
          </div>

          {/* Posts Side */}
          <div className="w-full md:w-1/3 flex flex-col gap-8">
            {posts &&
              posts.map((post) => (
                <div
                  key={post._id}
                  className="flex flex-col sm:flex-row md:flex-col border border-black rounded overflow-hidden"
                >
                  <Link to={`/${post?.slug}/${post._id}`} className="w-full sm:w-1/2 md:w-full">
                    <img
                      src={post?.img}
                      alt={post?.title}
                      className="w-full h-auto object-cover rounded"
                    />
                  </Link>

                  <div className="p-4 flex flex-col justify-center w-full sm:w-1/2 md:w-full">
                    <h6 className="text-xl 2xl:text-2xl font-semibold text-black dark:text-white">
                      {post?.title}
                    </h6>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-10 gap-3">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
