import React, { useState, useEffect, useRef } from 'react';
import { CiLink, CiMenuKebab, CiMicrophoneOn, CiVideoOn } from 'react-icons/ci';
import { IoIosSend } from 'react-icons/io';
import { MdCall, MdEmojiEmotions } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { loadMessages, sendMessage } from '@/redux/thunks/messageThunk';
import UserInfo from './UserInfo';
import Attachment from '../../components/Attachment';

const Inbox: React.FC = () => {
  const [message, setMessage] = useState('');
  const [userInfoOpen, setUserInfoOpen] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();
  const messagesState = useSelector((state: RootState) => state.message);
  const user= useSelector((state: RootState) => state.volenteer.volenteerData);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(messagesEndRef.current)
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesState.messages]);
//user and elected user getting
   const selectedUser=messagesState.selectedUser
  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(loadMessages({ userId:user._id, receiverId: selectedUser._id }));
      console.log("message loaded");
      

    }
  }, [selectedUser])
  

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

  const handleTogleInfo = () => {
    setUserInfoOpen((prev) => !prev);
  };

  const handleMicClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Implement voice logic if needed
  };

  return (
    <>
      <div className="w-full bg-blue-400 h-screen flex flex-col border border-gray-300">

        {/* Chat Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-300 p-4">
          <div className="flex items-center" onClick={handleTogleInfo}>
            <div className="mr-4.5 h-[70px] w-[70px] overflow-hidden rounded-full">
              <img src={selectedUser?.profileImage} alt="User profile" className="h-full w-full object-cover" />
            </div>
            <div>
              <h5 className="font-medium text-black">{selectedUser?.firstName}</h5>
              <p className="text-sm">Reply to message</p>
            </div>
          </div>

          <div className="flex flex-row gap-3">
            <MdCall size={24} />
            <CiVideoOn size={24} />
            <CiMenuKebab size={24} />
          </div>
        </div>

        {/* Chat Messages */}
        <div

  className="h-full max-h-[calc(100vh-100px)] space-y-3.5 px-6 py-7.5 grow overflow-y-auto scroll-smooth"
>
   {
    messagesState.messages.map((msg,index)=>(
      <div
      ref={messagesEndRef}
      key={index}
      className={`max-w-[500px] ${msg.senderId === user.user._id ? "ml-auto" : "mr-auto"} text-${msg.senderId === user.user._id ? "right" : "left"}`}
    >
      <div
        className={`mb-2.5 px-5 py-3 rounded-2xl ${
          msg.senderId === user.user._id
            ? "rounded-tr-none bg-blue-500 text-white"
            : "rounded-tl-none bg-gray-200 text-black"
        }`}
      >
        <p>{msg.content}</p>
      </div>
      <p className="text-xs text-gray-500">{msg.senderId === user.user._id ? "You" : selectedUser?.firstName}</p>
    </div>
    ))
   }

        </div>

        {/* Chat Footer */}
        <div className="w-full sticky bottom-0 border-t border-gray-300 bg-white px-6 py-5">
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
              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center space-x-4">
                <button type="button" className="hover:text-blue-500" onClick={handleMicClick}>
                  <CiMicrophoneOn size={24} />
                </button>
                <button type="button" className="hover:text-blue-500">
                  <Attachment />
                </button>
                <button type="button" className="hover:text-blue-500">
                  <MdEmojiEmotions size={24} />
                </button>
              </div>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              className="bg-blue-500 flex items-center justify-center h-[52px] w-[52px] rounded-md text-white hover:bg-blue-600"
            >
              <IoIosSend />
            </button>
          </form>
        </div>
      </div>

      {/* User Info Sidebar */}
      {userInfoOpen && (
        <div className="w-1/4">
          <UserInfo handleTogleInfo={handleTogleInfo} selectedUser={selectedUser} />
        </div>
      )}
    </>
  );
};

export default Inbox;
