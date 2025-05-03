import React, { useState, useEffect, useRef, useMemo } from "react";
import { MdCall } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import { CiVideoOn } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { loadMessages, sendMessage } from "@/redux/thunks/messageThunk";
import { connectSocket, startCall, acceptCall } from "@/lib/socket";

const Inbox: React.FC = () => {
  const [message, setMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [callerId, setCallerId] = useState("");
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [callAccepted, setCallAccepted] = useState(false);
  const incomingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, selectedUser } = useSelector((state: RootState) => state.message);
  const user = useSelector((state: RootState) => state.volenteer.volenteerData);
  const senderId = useMemo(() => user?.user?._id, [user]);

  useEffect(() => {
    if (senderId) {
      connectSocket(senderId, setCallerId, setModalVisible, incomingOfferRef, setCallType);
    }
  }, [senderId]);

  useEffect(() => {
    if (selectedUser?._id && senderId) {
      dispatch(loadMessages({ userId: senderId, receiverId: selectedUser._id }));
    }
  }, [selectedUser?._id, senderId, dispatch]);

  useEffect(() => {
    if (modalVisible || callAccepted) {
      const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
      navigator.mediaDevices
        .getUserMedia({ video: callType === "video", audio: true })
        .then((stream) => {
          if (localVideo) {
            localVideo.srcObject = stream;
            localVideo.classList.remove("hidden");
          }
        })
        .catch((err) => console.error("Failed to get local stream:", err));
    }
  }, [modalVisible, callAccepted, callType]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      dispatch(sendMessage({ content: message, receiverId: selectedUser?._id }));
      setMessage("");
    }
  };

  const makeCall = (type: "audio" | "video") => {
    if (!selectedUser?._id || !senderId) return;
    setCallType(type);
    setCallAccepted(true);
    startCall(selectedUser._id, senderId, type);
  };

  const acceptIncomingCall = () => {
    if (incomingOfferRef.current) {
      acceptCall(incomingOfferRef.current, callerId,callType);
      setModalVisible(false);
      setCallAccepted(true);
    }
  };

  return (





    <div className="relative w-full h-[87vh] p-2">

      {
        callAccepted ?(
          <>
          
      {callAccepted && callType === "video" && (
  <div className=" w-full h-full rounded-lg shadow-xl border bg-black overflow-hidden">
    <video
      id="remoteVideo"
      autoPlay
      playsInline
      className="w-full h-full object-cover rounded"
    />
    <video
      id="localVideo"
      autoPlay
      muted
      playsInline
      className="w-24 h-24 object-cover rounded absolute bottom-2 right-2 border-2 border-white"
    />
  </div>
)}
{callAccepted && callType === "audio" && (
  <div className="fixed bottom-5 right-5 z-50 px-4 py-2 rounded-lg shadow-xl border bg-white text-black">
    <p className="font-semibold">🔊 In an audio call...</p>
  </div>
)}</>
        ):(
<>
 {modalVisible && (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-white rounded-xl shadow-2xl p-6 text-center max-w-sm w-full">
      <p className="text-xl font-bold text-gray-700 mb-3">
        Incoming {callType} call...
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={acceptIncomingCall}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition"
        >
          Accept
        </button>
        <button
          onClick={() => setModalVisible(false)}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition"
        >
          Reject
        </button>
      </div>
    </div>
  </div>
)}

{/* Chat UI */}
<div className="flex flex-col h-full border rounded-xl shadow bg-white overflow-hidden">
  {/* Header */}
  <div className="flex justify-between items-center px-5 py-3 border-b bg-gray-50">
    <div className="flex items-center gap-3">
      <img
        src={selectedUser?.profileImage}
        alt="profile"
        className="w-10 h-10 rounded-full object-cover shadow-sm"
      />
      <h2 className="font-semibold text-gray-800">{selectedUser?.firstName}</h2>
    </div>
    <div className="flex items-center gap-4 text-2xl text-blue-500">
      <MdCall onClick={() => makeCall("audio")} className="cursor-pointer" />
      <CiVideoOn onClick={() => makeCall("video")} className="cursor-pointer" />
    </div>
  </div>

  {/* Messages */}
  <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
    {messages.map((msg, i) => {
      const isSender = msg.senderId === senderId;
      return (
        <div key={i} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
          <div className={`px-4 py-2 max-w-xs text-sm rounded-xl shadow-sm ${
            isSender ? "bg-blue-600 text-white" : "bg-white text-gray-800 border"
          }`}>
            {msg.content}
          </div>
        </div>
      );
    })}
    <div ref={messagesEndRef} />
  </div>

  {/* Input */}
  <form
    onSubmit={handleSendMessage}
    className="flex items-center gap-3 border-t px-4 py-3 bg-white"
  >
    <input
      type="text"
      className="flex-1 border border-gray-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="Type a message..."
      value={message}
      onChange={(e) => setMessage(e.target.value)}
    />
    <button type="submit" className="text-blue-600 text-3xl">
      <IoIosSend />
    </button>
  </form>
</div>
        )
      
     

        </>)}
    </div>
    
      )
};

export default Inbox;
