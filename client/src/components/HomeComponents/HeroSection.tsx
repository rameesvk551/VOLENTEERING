"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"volunteering" | "stay" | "trip">("volunteering");

  const handleSearch = () => {
    if (searchQuery) {
      navigate(`/volunteering-oppertunities?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/volunteering-oppertunities");
    }
  };

  const stats = [
    { value: "10K+", label: "Active Hosts" },
    { value: "50+", label: "Countries" },
    { value: "100K+", label: "Volunteers" },
    { value: "4.9", label: "Avg Rating" },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="/banner.png.jpg"
          alt="Travel volunteering background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-modern w-full py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Discover your next adventure
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
          >
            Travel the World.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300">
              Make a Difference.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl"
          >
            Connect with hosts worldwide, exchange skills for accommodation, and create meaningful experiences while exploring new cultures.
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl"
          >
            {/* Tab Buttons */}
            <div className="flex gap-1 mb-3 px-2 pt-2">
              {[
                { id: "volunteering", label: "Volunteering", icon: Users },
                { id: "stay", label: "Stay", icon: MapPin },
                { id: "trip", label: "Plan Trip", icon: Calendar },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "volunteering" | "stay" | "trip")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex flex-col sm:flex-row gap-3 p-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where do you want to go?"
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                size="lg"
                className="h-12 px-8 rounded-xl"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </motion.div>

          {/* Popular Searches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <span className="text-white/60 text-sm">Popular:</span>
            {["Bali", "Portugal", "Costa Rica", "Thailand", "Spain"].map((place) => (
              <button
                key={place}
                onClick={() => setSearchQuery(place)}
                className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
              >
                {place}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute bottom-8 left-0 right-0 hidden lg:block"
        >
          <div className="container-modern">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-3xl">
              <div className="grid grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-white/70 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:hidden"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
