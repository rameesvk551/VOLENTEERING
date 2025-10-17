import React, { useState, useEffect, useRef, useMemo } from "react";
import { MdCall } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import { CiVideoOn } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { loadMessages, sendMessage } from "@/redux/thunks/messageThunk";
import { connectSocket, startCall, acceptCall, endCall, rejectCall } from "@/lib/socket";

const Inbox: React.FC = () => {
  const [message, setMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [callerId, setCallerId] = useState("");
  const [calling, setCalling] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [callAccepted, setCallAccepted] = useState(false);
  const [inCall, setInCall] = useState(false);
  const incomingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, selectedUser } = useSelector((state: RootState) => state.message);
  const user = useSelector((state: RootState) => state.volenteer.volenteerData);
  const senderId = useMemo(() => user?.user?._id, [user]);

  useEffect(() => {
    if (senderId) {
      connectSocket(senderId, setCallerId, setModalVisible, setCallAccepted, incomingOfferRef, setCallType);
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
    setInCall(true);
    startCall(selectedUser._id, senderId, type);
  };

  const acceptIncomingCall = () => {
    if (incomingOfferRef.current) {
      acceptCall(incomingOfferRef.current, callerId, callType);
      setModalVisible(false);
      setCallAccepted(true);
      setInCall(true);
    }
  };

  const rejectCallInCommingCall = () => {
    rejectCall(callerId);
    setModalVisible(false);
    setCallAccepted(false);
    setInCall(false);
  };

  const endCallHandler = () => {
    endCall(callerId);
    setCallAccepted(false);
    setInCall(false);
  };

  return (
    <div className="relative w-full h-[87vh] p-4 bg-gray-100">
      {callAccepted && inCall ? (
        <div className="w-full h-full bg-black flex items-center justify-center relative">
          <video id="remoteVideo" autoPlay playsInline className="w-full h-full object-cover" />
          <video
            id="localVideo"
            autoPlay
            muted
            playsInline
            className="absolute bottom-6 right-6 w-28 h-28 rounded-lg border-2 border-white shadow-lg"
          />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-6 bg-black/60 p-4 rounded-full shadow-lg">
            <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full text-white" title="Mute">🎙️</button>
            <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full text-white" title="Switch Camera">🎥</button>
            <button className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-full text-white" title="Switch Audio">🔊</button>
            <button
              onClick={endCallHandler}
              className="bg-red-600 hover:bg-red-700 p-3 rounded-full text-white"
              title="End Call"
            >❌</button>
          </div>
        </div>
      ) : (
        <>
          {modalVisible && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-white rounded-xl shadow-2xl p-6 text-center max-w-sm w-full">
                <p className="text-xl font-bold text-gray-700 mb-3">Incoming {callType} call...</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={acceptIncomingCall}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
                  >Accept</button>
                  <button
                    onClick={rejectCallInCommingCall}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
                  >Reject</button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col h-full border rounded-xl shadow bg-white overflow-hidden">
            <div className="flex justify-between items-center px-5 py-3 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser?.profileImage}
                  alt="profile"
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                />
                <h2 className="font-semibold text-gray-800">{selectedUser?.firstName}</h2>
              </div>
              <div className="flex items-center gap-4 text-2xl text-blue-500">
                <MdCall onClick={() => makeCall("audio")} className="cursor-pointer hover:text-blue-600" />
                <CiVideoOn onClick={() => makeCall("video")} className="cursor-pointer hover:text-blue-600" />
              </div>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
            {messages.map((msg, i) => {
  const isSender = msg.senderId === senderId;
  const messageTime = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div key={i} className={`flex flex-col ${isSender ? "items-end" : "items-start"}`}>
      <div
        className={`px-4 py-2 max-w-xs text-sm rounded-lg shadow-sm ${
          isSender ? "bg-blue-600 text-white" : "bg-white text-gray-800 border"
        }`}
      >
        {msg.content}
      </div>
      <span className="text-xs text-gray-500 mt-1">{messageTime}</span>
    </div>
  );
})}

              <div ref={messagesEndRef} />
            </div>

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
        </>
      )}
    </div>
  );
};

export default Inbox;
