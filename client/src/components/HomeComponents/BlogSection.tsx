import React from "react";
import { motion } from "framer-motion";

const blogData = [
  {
    title: "Explore the Nomadic Life",
    description: "Discover how to travel as a digital nomad while making an impact.",
    image: "/rent.jpg",
  },
  {
    title: "Top Volunteering Destinations",
    description: "Find the best places to volunteer and explore different cultures.",
    image: "/banner.png.jpg",
  },
  {
    title: "Eco-Friendly Travel Hacks",
    description: "Learn how to travel sustainably and reduce your carbon footprint.",
    image: "/search.jpg",
  },
  {
    title: "Cultural Immersion Tips",
    description: "Engage with locals and make your travel experience unforgettable.",
    image: "/volenteer (2).jpg",
  },
  {
    title: "Best Travel Gear for Backpackers",
    description: "A guide to must-have travel essentials for any trip.",
    image: "/host.jpg",
  },
];

const BlogSection = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gray-800 mb-8"
      >
       
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Featured Blog */}
        <motion.div
          className="relative rounded-lg overflow-hidden group"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={blogData[0].image}
            alt={blogData[0].title}
            className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-6">
            <h3 className="text-2xl font-semibold text-white">{blogData[0].title}</h3>
            <p className="text-gray-300">{blogData[0].description}</p>
          </div>
        </motion.div>
        
        {/* Smaller Blogs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {blogData.slice(1).map((blog, index) => (
            <motion.div
              key={index}
              className="relative rounded-lg overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index, duration: 0.5 }}
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-4">
                <h3 className="text-lg font-semibold text-white">{blog.title}</h3>
                <p className="text-gray-300 text-sm">{blog.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSection;
