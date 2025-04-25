import React from 'react';
import { Clock } from '@phosphor-icons/react';
import { IoCloseSharp, } from 'react-icons/io5';
import { TbDeviceMobileMessage } from 'react-icons/tb';
import { CiMenuKebab } from 'react-icons/ci';

interface User {
  _id: string;
  firstName: string;
  profileImage?: string;
}

interface UserInfoProps {
  handleTogleInfo: () => void;
  selectedUser: User;
}

const UserInfo: React.FC<UserInfoProps> = ({ handleTogleInfo, selectedUser }) => {
  return (
    <div className="border-l border-gray-200 h-[87vh] w-full max-w-xs bg-white flex flex-col shadow-md">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-300 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">Profile</h2>
        <button
          onClick={handleTogleInfo}
          className="text-gray-500 hover:text-red-500 transition duration-200"
        >
          <IoCloseSharp size={22} />
        </button>
      </div>

      {/* Profile Image */}
      <div className="flex flex-col items-center mt-6">
        <img
          src={selectedUser?.profileImage}
          className="w-36 h-36 rounded-xl object-cover border-4 border-blue-100 shadow-md"
          alt="Profile"
        />
        <div className="mt-4 text-xl font-semibold text-gray-900">{selectedUser?.firstName}</div>
        <span className="text-sm text-gray-500">Traveller</span>
      </div>

      {/* Local Time */}
      <div className="px-6 mt-8">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <Clock size={20} />
          <span>7:15 PM Local Time</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-8 px-6 space-y-3">
        <button className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-medium py-2 rounded-lg shadow hover:bg-blue-600 transition">
          <TbDeviceMobileMessage size={20} />
          Message
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-purple-500 text-white font-medium py-2 rounded-lg shadow hover:bg-purple-600 transition">
         
          Huddle
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg shadow hover:bg-gray-200 transition">
          <CiMenuKebab size={20} />
          More
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
