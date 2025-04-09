import React, { useState } from 'react'
import User01 from "../../images/user/user-01.png";
import { CiLink, CiMenuKebab, CiMicrophoneOn, CiVideoOn } from 'react-icons/ci';
import { IoIosSend } from 'react-icons/io';
import { MdCall, MdEmojiEmotions } from 'react-icons/md';
import UserInfo from './UserInfo';
import { useDispatch } from 'react-redux';
import Attachment from '../../components/Attachment';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { sendMessage } from '@/redux/thunks/messageThunk';
import { AppDispatch, RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

const Inbox:React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);

const dispatch=useDispatch<AppDispatch>()

const selectedUser = useSelector((state: RootState) => state.chat.selectedUser);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;
  
    try {
      await dispatch(sendMessage({ content: message, receiverId: selectedUser?._id }));

      setMessage('');
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };
  

   const[userInfoOpen,setUserInfoOpen]=useState<boolean>(false)
  const handleTogleInfo=()=>{
    setUserInfoOpen((prev)=>!prev)

  }


  const handleMicClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  
  };
  return (
   <>
    <div className={ ` w-full bg-blue-400 h-screen flex flex-col border border-gray-300`}>
    
        {/**chat header */}
    <div className="sticky top-0 flex items-center flex-row justify-between border-b border-gray-300 p-4">
      <div className="flex items-center" onClick={handleTogleInfo}>
        <div className="mr-4.5 h-[70px] w-[70px] overflow-hidden rounded-full">
          <img src={selectedUser?.profileImage} alt="User profile" className="h-full w-full object-cover object-center" />
        </div>
        <div>
          <h5 className="font-medium text-black">{selectedUser?.firstName}</h5>
          <p className="text-sm">Reply to message</p>
        </div>
      </div>
      
      <div className='flex flex-row gap-3'>
      <MdCall size={24}  />
      <CiVideoOn size={24}  />
        <CiMenuKebab size={24}  />
      </div>
    </div>


  
    <div className="h-full max-h-[calc(100vh-100px)] space-y-3.5 px-6 py-7.5 grow scrollbar-container">
  {chatMessages.map((msg, index) => (
    <div key={index} className="max-w-[500px] ml-auto">
      <div className="mb-2.5 rounded-2xl rounded-tr-none px-5 py-3 bg-blue-500 text-white">
        <p>{msg}</p>
      </div>
      <p className="text-xs text-gray-500 text-right">Now</p>
    </div>
  ))}
</div>

  
    {/* footer*/}

    <div className=" w-full sticky bottom-0 border-t border-gray-300 bg-white px-6 py-5">
    <form onSubmit={handleSendMessage} className="flex items-center justify-between space-x-4">

    {/* Input Field */}
    <div className="relative w-full">
      <input  
        type="text" 
        placeholder="Type a message..." 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="h-[52px] w-full rounded-md border border-gray-300 bg-gray-100 pl-5 pr-16 text-black placeholder-gray-500 outline-none"
      />
    <div className="absolute right-5 top-1/2 -translate-y-1/2 items-center justify-end space-x-4">
    
    <button className="hover:text-blue-500" onClick={handleMicClick}>
      <CiMicrophoneOn size={24} />
    </button>
    <button className="hover:text-blue-500" onClick={(e)=>{
e.preventDefault()
    }}><Attachment/>
    </button>
   
    <button className="hover:text-blue-500"><MdEmojiEmotions size={24}  /></button>
    </div>
    </div>
    
    {/* Send Button */}
    <button 
      className="bg-blue-500 flex items-center justify-center h-[52px] w-[52px] rounded-md text-white hover:bg-blue-600"
    >
     <IoIosSend />
    </button>
  </form>

</div>

  </div>
  
  {
    userInfoOpen && (
      <div className="w-1/4">
        <UserInfo handleTogleInfo={handleTogleInfo}/>
      </div>
    )
  } </>
  
  )
}

export default Inbox
