import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, selectedUser } = useSelector((state: RootState) => state.message);
  const user = useSelector((state: RootState) => state.volenteer.volenteerData);
  const hostData = useSelector((state: RootState) => state.host.hostData);
  
  const senderId = useMemo(() => user?.user?._id || hostData?.host?._id, [user, hostData]);

  useEffect(() => {
    if (selectedUser?._id && senderId) {
      dispatch(loadMessages({ userId: senderId, receiverId: selectedUser._id }));
    }
  }, [selectedUser?._id, senderId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        await dispatch(sendMessage({ content: message, receiverId: selectedUser?._id }));
        setMessage('');
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  }, [dispatch, message, selectedUser]);

  const toggleUserInfo = useCallback(() => {
    setUserInfoOpen(prev => !prev);
  }, []);

  const handleMicClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  }, []);

  return (
    <>
      <div className="w-full bg-gradient-to-br from-blue-100 to-blue-300 h-[87vh] flex flex-col border border-gray-200 shadow-md">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200 shadow-sm">
          <div className="flex items-center cursor-pointer" onClick={toggleUserInfo}>
            <div className="mr-4 h-14 w-14 rounded-full overflow-hidden border-4 border-blue-300">
              <img src={selectedUser?.profileImage} alt="User" className="h-full w-full object-cover" />
            </div>
            <div>
              <h5 className="font-semibold text-gray-800 text-lg">{selectedUser?.firstName}</h5>
              <p className="text-sm text-gray-500">Tap to view profile</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-700">
            <MdCall size={24} className="hover:text-blue-500 cursor-pointer" />
            <CiVideoOn size={24} className="hover:text-blue-500 cursor-pointer" />
            <CiMenuKebab size={22} className="hover:text-blue-500 cursor-pointer" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg, index) => {
            const isSender = msg.senderId === senderId;
            return (
              <div
                ref={index === messages.length - 1 ? messagesEndRef : null}
                key={index}
                className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} text-sm`}
              >
                <div
                  className={`px-5 py-3 rounded-2xl shadow-sm ${
                    isSender
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {isSender ? 'You' : selectedUser?.firstName}
                </span>
              </div>
            );
          })}
        </div>

{/* Footer */}
<div className="w-full bg-white sticky bottom-0 px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-t border-gray-200 z-10">
  <form
    onSubmit={handleSendMessage}
    className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 md:gap-4"
  >
    {/* Message Input Section */}
    <div className="relative flex-1 w-full">
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full h-11 sm:h-12 md:h-[52px] pl-4 pr-20 bg-gray-100 rounded-full border border-gray-300 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />

      {/* Action Icons */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 sm:gap-3 items-center text-gray-600">
        <button
          type="button"
          onClick={handleMicClick}
          className="hover:text-blue-500 transition"
        >
          <CiMicrophoneOn size={18} className="sm:size-[22px]" />
        </button>
        <Attachment />
        <MdEmojiEmotions
          size={18}
          className="sm:size-[22px] hover:text-yellow-500 transition"
        />
      </div>
    </div>

    {/* Send Button */}
    <button
      type="submit"
      className="h-11 w-11 sm:h-12 sm:w-12 md:h-[52px] md:w-[52px] bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-transform duration-200 active:scale-90 shadow-md"
    >
      <IoIosSend size={18} className="sm:size-[20px]" />
    </button>
  </form>
</div>


      </div>

      {/* Optional Side Panel */}
      {userInfoOpen && (
        <div className="hidden md:block w-[320px] border-l border-gray-200 bg-white shadow-lg">
          <UserInfo handleTogleInfo={toggleUserInfo} selectedUser={selectedUser} />
        </div>
      )}
    </>
  );
};

export default Inbox;
