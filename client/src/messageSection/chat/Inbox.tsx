import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MdCall,} from 'react-icons/md';
import { IoIosSend } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { loadMessages, sendMessage } from '@/redux/thunks/messageThunk';
import { acceptCall, connectSocket, registerWebRTCListeners, rejectCall, startCall } from '@/lib/socket';
import IncomingCallModal from './IncommingModal';

const Inbox: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [callerId, setCallerId] = useState('');
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const incomingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, selectedUser } = useSelector((state: RootState) => state.message);
  const user = useSelector((state: RootState) => state.volenteer.volenteerData);

  const senderId = useMemo(() => user?.user?._id, [user]);

  useEffect(() => {
    connectSocket(senderId);
    registerWebRTCListeners(setCallerId, setModalVisible, incomingOfferRef, setCallType);
  }, [senderId]);

  const handleAccept = async () => {
    if (incomingOfferRef.current && callerId) {
      await acceptCall(incomingOfferRef.current, callerId);
      setModalVisible(false);
    }
  };

  const handleReject = () => {
   
  };

  useEffect(() => {
    if (selectedUser?._id && senderId) {
      dispatch(loadMessages({ userId: senderId, receiverId: selectedUser._id }));
    }
  }, [selectedUser?._id, senderId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      dispatch(sendMessage({ content: message, receiverId: selectedUser?._id }));
      setMessage('');
    }
  };

  const makeAudioCall = () => {
    const remoteUserId = selectedUser?._id;
    if (!remoteUserId || !senderId) return;
    setCallType('audio');
    setIsCallOpen(true);
    startCall(remoteUserId, senderId);
  };

  return (
    <>
      <div className="w-full bg-gradient-to-br from-blue-100 to-blue-300 h-[87vh] flex flex-col border border-gray-200 shadow-md">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200 shadow-sm">
          <div className="flex items-center cursor-pointer">
            <div className="mr-4 h-14 w-14 rounded-full overflow-hidden border-4 border-blue-300">
              <img src={selectedUser?.profileImage} alt="User" className="h-full w-full object-cover" />
            </div>
            <div>
              <h5 className="font-semibold text-gray-800 text-lg">{selectedUser?.firstName}</h5>
              <p className="text-sm text-gray-500">Tap to view profile</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-700">
            <MdCall size={24} className="hover:text-blue-500 cursor-pointer" onClick={makeAudioCall} />
      
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg, index) => {
            const isSender = msg.senderId === senderId;
            return (
              <div key={index} className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} text-sm`}>
                <div className={`px-5 py-3 rounded-2xl shadow-sm ${isSender ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'}`}>
                  {msg.content}
                </div>
                <span className="text-xs text-gray-500 mt-1">{isSender ? 'You' : selectedUser?.firstName}</span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="w-full bg-white sticky bottom-0 px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-t border-gray-200 z-10">
          <form onSubmit={handleSendMessage} className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 md:gap-4">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-11 sm:h-12 md:h-[52px] pl-4 pr-20 bg-gray-100 rounded-full border border-gray-300 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="h-11 w-11 sm:h-12 sm:w-12 md:h-[52px] md:w-[52px] bg-blue-600 text-white rounded-full flex items-center justify-center">
              <IoIosSend size={18} />
            </button>
          </form>
        </div>
      </div>

      <IncomingCallModal
        callerId={callerId}
        callType={callType}
        isVisible={modalVisible}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </>
  );
};

export default Inbox;
