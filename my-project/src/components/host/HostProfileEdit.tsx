import React, { useEffect, useCallback, useState } from "react";
import { MdEmail,} from "react-icons/md";
import { FaRegStar } from "react-icons/fa6";
import { CiCalendar, CiEdit, CiSquareChevLeft, CiSquareChevRight } from "react-icons/ci";
import { TbFileDescription } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { loadHost } from "../../redux/thunks/hostTunk";
import { setHostFormData, toggleHelpType, updateField } from "../../redux/Slices/hostFormSlice";
import Divider from "../Divider";
import { SiAmazonsimpleemailservice } from "react-icons/si";
import { RiFeedbackFill } from "react-icons/ri";
import { Button } from "@/components/ui/button";
type HostType = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    boundingbox: string[];
    [key: string]: any;
  };
  description: string;
  selectedHelpTypes: string[];
  allowed: string[];
  accepted: string[];
  languageDescription: string;
  languageAndLevel: {
    language: string;
    level: string;
  }[];
  showIntreastInLanguageExchange: boolean;
  privateComment: string;
  organisation: string;
  images: {
    url: string;
    description: string;
  }[];
  availability: string;
  minimumStay: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};


 

const HostProfileEdit: React.FC = () => {

  const [host, setHost] = useState<HostType | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const { hostData, loading } = useSelector((state: RootState) => state.host);
  const { data } = useSelector((state: RootState) => state.hostForm);

  useEffect(() => {
    dispatch(loadHost());
  }, [dispatch]);
  
  useEffect(() => {
    if (hostData?.host) {
      setHost(hostData.host);
    }
  }, [hostData]);





  if (loading) {
    return <div>Loading...</div>;
  }


  return (
  
    <div className="px-4 md:px-12 mt-8 flex flex-col lg:flex-row gap-8">
      {/* Left section */}
      <div className="lg:w-2/3 space-y-6">
        {/* Availability */}
        <div className="bg-white p-6 rounded-md shadow-md">
          <div className="flex justify-between items-center pb-4">
            <h1 className="text-xl font-bold text-gray-700">Availability</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <CiSquareChevLeft size={28} />
              <span className="font-medium">2025</span>
              <CiSquareChevRight size={28} />
            </div>
          </div>

          <span className="flex items-center text-sm text-gray-500">
            <CiCalendar className="mr-2" /> Min stay requested: at least a week
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

        {/* Details */}
        <div className="bg-white p-6 rounded-md shadow-md space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TbFileDescription />
              <h2 className="text-lg text-[#b4cb3c] font-semibold">Description</h2>
            </div>
            <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1">
              <CiEdit /> Edit
            </button>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{host?.description}</p>

          <Divider />

          <div className="flex justify-between items-center">
            <h2 className="text-lg text-[#b4cb3c] font-semibold">Types of help & learning opportunities</h2>
            <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1">
              <CiEdit /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {host?.selectedHelpTypes?.map((help, index) => (
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
            <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1">
              <CiEdit /> Edit
            </button>
          </div>
          <div className="space-y-1">
            {host?.languageAndLevel?.map((lang, index) => (
              <p key={index} className="text-sm text-gray-700">{lang.language}: {lang.level}</p>
            ))}
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <h2 className="text-lg text-[#b4cb3c] font-semibold">Accommodation</h2>
            <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1">
              <CiEdit /> Edit
            </button>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {/* Sample text about accommodation, replace with host.accommodation if exists */}
            I speak Dutch, French, English, Spanish, and German and we can talk in any of these languages...
          </p>

          <Divider />

          <div className="flex justify-between items-center">
            <h2 className="text-lg text-[#b4cb3c] font-semibold">What else ...</h2>
            <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1">
              <CiEdit /> Edit
            </button>
          </div>
          <p className="text-sm text-gray-700">What else ... Remote location from public transport so you need</p>

          <Divider />

          <div className="flex justify-between items-center">
            <h2 className="text-lg text-[#b4cb3c] font-semibold">Can host digital nomads</h2>
            <button className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1">
              <CiEdit /> Edit
            </button>
          </div>
          <p className="text-sm text-gray-700">Yes</p>
        </div>
      </div>
      <div className="w-1/3">
      
      <div className="bg-[#fff] w-70% flex">
        <div className="w-full h-full  p-10 rounded-md">
       

          <div className="space-y-4 mt-4">
            <div className="flex  items-center">
              <span className="flex items-center gap-2">
                <FaRegStar className="text-yellow-500" />
                Edit Profile
              </span>
            </div>
            <Divider />

   
            <div className="flex  items-center">
              <span className="flex items-center gap-2">
                <SiAmazonsimpleemailservice className="text-blue-500" />
               Verify via Facebook
              </span>
             
            </div>
      
            <Divider />
            <div className="flex justify-between">
              <span className="flex  items-center gap-2">
                <MdEmail className="text-purple-500" />
               Last minute
              </span>
            
            </div>
            
         


          </div>
        </div>
      </div>
      

{/**profile information */}
       <div className="bg-[#fff] w-70% flex mt-5" >
                  <div className="w-full h-full  p-10 rounded-md">
                    <h1 className="text-xl font-semibold">Profile Information</h1>
      
                    <div className="space-y-4 mt-4">
              
      
                
      
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <RiFeedbackFill className="text-green-500" />
                          Feedback
                        </span>
                        <span>40</span>
                      </div>
                      <Divider />
                 
      
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <MdEmail className="text-purple-500" />
                          Email verified
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




 // If using shadcn or replace with a Tailwind btn

const EditableSection = ({ title, icon: Icon, value, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value);

  const handleSave = () => {
    onSave(input);
    setEditing(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {Icon && <Icon />}
          <h2 className="text-lg text-[#b4cb3c] font-semibold">{title}</h2>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1"
          >
            <CiEdit /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <Button className="bg-blue-500 text-white px-3 py-1" onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        )}
      </div>

      {editing ? (
        <textarea
          className="w-full border border-gray-300 p-2 rounded-md text-sm"
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      ) : (
        <p className="text-gray-700 text-sm leading-relaxed">{value}</p>
      )}
    </div>
  );
};
