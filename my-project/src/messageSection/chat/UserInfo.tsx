import { Clock } from '@phosphor-icons/react';
import React from 'react'
import { CiMenuKebab } from 'react-icons/ci';
import { IoIosVideocam } from 'react-icons/io';
import { IoCloseSharp } from 'react-icons/io5';
import { TbDeviceMobileMessage } from 'react-icons/tb';

interface UserInfoProps {
    handleTogleInfo: () => void;
  }
  
  const UserInfo: React.FC<UserInfoProps> = ({ handleTogleInfo }) => {
  return (
    <div className='border-1 flex flex-col h-full border-gray-200'>
    <div className="sticky border-b border-gray-300  flex flex-row items-center justify-between w-full px-6 py-7.5">
        <div className=" text-black font-semibold text-lg">Profile</div>
        <button onClick={handleTogleInfo}><IoCloseSharp  /></button>
    </div>
    <div className='mx-auto  my-8'>
        <img src="https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt=""
        className='w-44 h-44 rounded-lg object-cover object-center' />
    </div>
    <div className="px-6 space-y-1">
        <div className="text-black text-xl font-medium">
            Mao Zedong
        </div>
        <span className='text-gray-500 text-md'>Traveller</span>
    </div>
    <div className="px-6 py-6">
        <div className=" flex flex-row items-center space-x-2">
            <Clock/>
            <div>7:15 PM Local Time</div>
        </div>
    </div> 
    <div className="px-6 flex flex-row space-x-2">
        <button className="w-full border-y-gray-200 p-2 rounded-md flex  flex-row items-center justify-center"><TbDeviceMobileMessage  className='mr-3' />Message</button>
        <button className="w-full border-y-gray-200 p-2 rounded-md flex  flex-row items-center justify-center"><IoIosVideocam className='mr-3' />HUddle</button>
        <button className=" border-y-gray-200 p-2 rounded-md flex  flex-row items-center justify-center"><CiMenuKebab />HUddle</button>
  
    </div>
    </div>
  )
}

export default UserInfo
