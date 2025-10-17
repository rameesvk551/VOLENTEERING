import React, { useEffect, useState } from "react";
import { MdEmail } from "react-icons/md";
import { FaRegStar } from "react-icons/fa6";
import { CiCalendar, CiEdit, CiSquareChevLeft, CiSquareChevRight } from "react-icons/ci";
import { TbFileDescription } from "react-icons/tb";
import Divider from "../Divider";
import { SiAmazonsimpleemailservice } from "react-icons/si";
import { RiFeedbackFill } from "react-icons/ri";
import axios from "axios";
import server from "@/server/app";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";



const HostProfileEdit = () => {
  const [host, setHost] = useState(null);
  const [isEditing, setIsEditing] = useState({});
  const [editValues, setEditValues] = useState({});
  const { hostData, loading, error } = useSelector((state: RootState) => state.host);

    useEffect(() => {
      if (hostData?.host) {
        setHost(hostData.host);
      }
    }, [hostData]);
  
  const updateProfileField = async (field, value) => {
    try {
      const response = await axios.put(`${server}/host/profile-update/${host?._id}`, {
        [field]: value,
      });
  
      console.log("Update success:", response.data);
      toast.success("feild updated successfully")
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
   
    setEditValues({
      heading: host?.heading || "heading",
      description: host?.description,
      accommodation: "I speak Dutch, French, English...",
      whatElse: "Remote location from public transport...",
    });
  }, []);

  const toggleEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const saveField = async (field) => {
    const value = editValues[field];
    await updateProfileField(field, value); // Call API
    setHost((prev) => ({ ...prev, [field]: value })); // Update local state
    toggleEdit(field); // Close edit mode
  };
  

  if (!host) return <div>Loading...</div>;

  return (
    <div className="px-4 md:px-12 mt-8 flex flex-col lg:flex-row gap-8">
      <div className="lg:w-2/3 space-y-6">
        <div className="bg-white p-6 rounded-md shadow-md">
          <div className="flex justify-between items-center pb-4">
            <h1 className="text-xl font-bold text-gray-700">Availability</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <CiSquareChevLeft size={28} />
              <span className="font-medium">{host.availability}</span>
              <CiSquareChevRight size={28} />
            </div>
          </div>
          <span className="flex items-center text-sm text-gray-500">
            <CiCalendar className="mr-2" /> Min stay requested: {host.minimumStay}
          </span>
          <div className="mt-6">
            <div className="grid grid-cols-12 gap-1 text-white text-sm">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => (
                <div key={month} className="bg-fuchsia-500 h-8 flex items-center justify-center rounded-md">
                  {month}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-md space-y-6">
          {[
            { label: "Headding", field: "heading" },
            { label: "Description", field: "description" },
            { label: "Accommodation", field: "accommodation" },
            { label: "What else ...", field: "whatElse" },
          ].map(({ label, field }) => (
            <div key={field}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TbFileDescription />
                  <h2 className="text-lg text-[#b4cb3c] font-semibold">{label}</h2>
                </div>
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1"
                  onClick={() => (isEditing[field] ? saveField(field) : toggleEdit(field))}
                >
                  <CiEdit /> {isEditing[field] ? "Save" : "Edit"}
                </button>
              </div>
              {isEditing[field] ? (
                <textarea
                  className="w-full mt-2 border p-2 rounded"
                  value={editValues[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">{editValues[field]}</p>
              )}
              <Divider />
            </div>
          ))}

          <div className="flex justify-between items-center">
            <h2 className="text-lg text-[#b4cb3c] font-semibold">Types of help & learning opportunities</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {host.selectedHelpTypes.map((help, index) => (
              <div
                key={index}
                className="bg-white p-3 text-center rounded-md border border-gray-200 shadow hover:shadow-md transition"
              >
                {help}
              </div>
            ))}
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <h2 className="text-lg text-[#b4cb3c] font-semibold">Languages spoken</h2>
          </div>
          <div className="space-y-1">
            {host.languageAndLevel.map((lang, index) => (
              <p key={index} className="text-sm text-gray-700">
                {lang.language}: {lang.level}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="w-1/3">
        <div className="bg-[#fff] w-full flex">
          <div className="w-full h-full p-10 rounded-md">
            <div className="space-y-4 mt-4">
              <div className="flex items-center">
                <span className="flex items-center gap-2">
                  <FaRegStar className="text-yellow-500" /> Edit Profile
                </span>
              </div>
              <Divider />
              <div className="flex items-center">
                <span className="flex items-center gap-2">
                  <SiAmazonsimpleemailservice className="text-blue-500" /> Verify via Facebook
                </span>
              </div>
              <Divider />
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <MdEmail className="text-purple-500" /> Last minute
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#fff] w-full flex mt-5">
          <div className="w-full h-full p-10 rounded-md">
            <h1 className="text-xl font-semibold">Profile Information</h1>
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <RiFeedbackFill className="text-green-500" /> Feedback
                </span>
                <span>40</span>
              </div>
              <Divider />
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <MdEmail className="text-purple-500" /> Email verified
                </span>
                <span>80%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostProfileEdit;