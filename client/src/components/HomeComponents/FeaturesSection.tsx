"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const FeaturesSection = () => {
  const featureData = [
    {
      imageSrc: "/host.jpg",
      title: "🔥 Host Extraordinary Stays & Experiences",
      description:
        "Welcome travelers, volunteers into your home or community. Become a host and create unforgettable moments for guests from around the world.",
      linkText: "Start Hosting",
      linkHref: "/host/signup",
    },
    
    {
      imageSrc: "/search.jpg",
      title: " Effortless Travel Planning in One Place",
      description:
        "Find everything you need for a seamless journey—hotels, flights, volunteering opportunities, cab rentals, and more—all in one platform.",
      linkText: "Explore Now",
      linkHref: "/trip-planning",
    }
,    
    {
      imageSrc: "/volenteer (2).jpg",
      title: "Live the Experience, Make an Impact",
      description:
        "Contribute to sustainable projects, learn new skills, and create unforgettable travel memories while making a real difference.",
      linkText: "Start Volunteering",
      linkHref: "/user/signup",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="py-24 px-6 sm:px-8 lg:px-12 xl:px-16 bg-white"
    >
      <div className="max-w-4xl xl:max-w-6xl mx-auto">
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-center mb-12 w-full sm:w-2/3 mx-auto"
        >
           Compare options, book with ease, and experience stress-free travel like never before
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">
          {featureData.map((card, index) => (
            <motion.div key={index} variants={itemVariants}>
              <FeatureCard {...card} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({
  imageSrc,
  title,
  description,
  linkText,
  linkHref,
}: {
  imageSrc: string;
  title: string;
  description: string;
  linkText?: string;
  linkHref?: string;
}) => (
  <div className="relative bg-white shadow-lg rounded-2xl overflow-hidden transform transition duration-300 hover:scale-105">
    {/* Image Section with Overlay */}
    <div className="relative w-full h-56">
      <img
        src={imageSrc}
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex justify-center items-center">
        <h3 className="text-white text-xl font-semibold px-4 text-center">{title}</h3>
      </div>
    </div>

    {/* Content Section */}
    <div className="p-6 text-center">
      <p className="text-gray-600 text-base">{description}</p>

      {/* Button */}
      {linkText && linkHref && (
        <Link
          to={linkHref}
          className="mt-4 inline-block bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-700 transition duration-300"
        >
          {linkText}
        </Link>
      )}
    </div>
  </div>
);


export default FeaturesSection;
