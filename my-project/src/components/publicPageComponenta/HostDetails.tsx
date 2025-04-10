import React, { useEffect, useState } from "react";
import {
  IoLocationSharp,
  IoShareSocial,
} from "react-icons/io5";
import {
  MdEmail,
  MdOutlineVerifiedUser,
  MdRestore,
} from "react-icons/md";

import { FaStar } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";

import { SiAmazonsimpleemailservice } from "react-icons/si";
import { RiFeedbackFill } from "react-icons/ri";
import Divider from "../Divider";
import { useNavigate, useParams } from "react-router-dom";
import { fetchHostById } from "../../api";
import Review from "../hostDetailsPageComponents/Review";
import OverviewSection from "../hostDetailsPageComponents/OverviewSection";
import PhotosSection from "../hostDetailsPageComponents/PhotosSection";
import MapComponent from "../placeAutoCompleteAndMap/MapComponent";

const HostDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [host, setHost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const navigate = useNavigate();

  const tabs = [
    { id: 1, label: "OVERVIEW" },
    { id: 2, label: "PHOTOS" },
    { id: 3, label: "MAP" },
    { id: 4, label: "FEEDBACK (2)" },
  ];

  const formatDate = (isoDate: string | Date): string => {
    const date = new Date(isoDate);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  const goToMessage = () => {
    navigate(`/message/${id}`);
  };


  useEffect(() => {
    if (id) {
      fetchHostById(id)
        .then((data) => {
          setHost(data.host);
        })
        .catch(() => setError("Failed to fetch host details"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col bg-white">
      {/* IMAGE GRID */}
      <div className="px-4 md:px-10 lg:px-20 py-4">
        <div className="flex flex-col md:flex-row gap-4 h-[400px]">
          <div className="md:w-1/2 h-full">
            <img
              src={host?.images?.[0]?.url}
              alt={host?.images?.[0]?.description}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-2 h-full">
            {host?.images?.slice(1, 5).map((img: any, i: number) => (
              <div key={i} className="relative w-full h-full">
                <img
                  src={img.url}
                  alt={img.description}
                  className="w-full h-full object-cover rounded"
                />
                <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 text-xs rounded">
                  {img.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Divider />

      {/* MAIN CONTENT */}
      <div className="px-4 md:px-10 lg:px-20 mt-8 flex flex-col lg:flex-row gap-8">
        {/* LEFT */}
        <div className="lg:w-2/3 space-y-4">
          <h1 className="text-lg font-bold text-[#0a3f5f] leading-relaxed">
            Be part of our family, share, improve and leave an impact on us
            for generations to come in Gerbstedt, Germany
          </h1>

          <div className="flex flex-wrap justify-between text-sm text-gray-700">
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <IoLocationSharp size={16} />
                <span>Germany</span>
              </div>
              <div className="flex items-center gap-1">
                <MdRestore size={16} />
                <span>Last Activity: {formatDate(host?.lastActive)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>4.5 (247 reviews)</span>
              <span className="flex items-center gap-1">
                <MdOutlineVerifiedUser />
                Verified Host
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? "text-crimson border-b-2 border-crimson"
                    : "text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 1 && <OverviewSection host={host} />}
          {activeTab === 2 && <PhotosSection images={host?.images} />}
          {activeTab === 4 && (
  <div className="flex flex-col items-center gap-3 mt-4">
    <Review />
    <Review />
    <button
      onClick={() => setShowReviewModal(true)}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Write a Review
    </button>
  </div>
)}

          {activeTab === 3 && (
            <div className="flex h-full flex-col items-center gap-3 mt-4">
             <MapComponent lat={100} lon={200}/>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:w-1/3 w-full h-full space-y-4 border border-gray-200 rounded-md p-4">
          <button
            onClick={goToMessage}
            className="w-full bg-black text-white font-semibold py-2 rounded"
          >
            Message
          </button>

          <div>
            <h2 className="text-lg font-semibold mb-4">
              Profile Information
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-blue-600">
                  <SiAmazonsimpleemailservice />
                  Last replied
                </span>
                <span>7 March 2025</span>
              </div>
              <Divider />

              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-green-600">
                  <RiFeedbackFill />
                  Feedback
                </span>
                <span>40</span>
              </div>
              <Divider />

           
            </div>
          </div>
        </div>
      </div>
      {showReviewModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-xl relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-black text-lg"
        onClick={() => setShowReviewModal(false)}
      >
        &times;
      </button>
      <WriteReview />
    </div>
  </div>
)}

    </div>
  );
};

export default HostDetails;

const WriteReview = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [review, setReview] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ rating, review });
   
    setRating(0);
    setReview("");
  };

  return (
    <div className="max-w-xl w-full bg-white p-6 rounded-xl shadow-md border mt-6 mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Write a Review</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={24}
              className={`cursor-pointer transition-colors ${
                (hoveredRating ?? rating) >= star
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(null)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>

        {/* Review Textarea */}
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          placeholder="Share your experience..."
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <IoMdSend />
          Submit Review
        </button>
      </form>
    </div>
  );
};

