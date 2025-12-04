import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, useMemo } from "react";
import { MdCall } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import { CiVideoOn } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { loadMessages, sendMessage } from "@/redux/thunks/messageThunk";
import { connectSocket, startCall, acceptCall, endCall, rejectCall } from "@/lib/socket";
const Inbox = () => {
    const [message, setMessage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [callerId, setCallerId] = useState("");
    const [calling, setCalling] = useState(false);
    const [callType, setCallType] = useState("audio");
    const [callAccepted, setCallAccepted] = useState(false);
    const [inCall, setInCall] = useState(false);
    const incomingOfferRef = useRef(null);
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const { messages, selectedUser } = useSelector((state) => state.message);
    const user = useSelector((state) => state.volenteer.volenteerData);
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
            const localVideo = document.getElementById("localVideo");
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
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            dispatch(sendMessage({ content: message, receiverId: selectedUser?._id }));
            setMessage("");
        }
    };
    const makeCall = (type) => {
        if (!selectedUser?._id || !senderId)
            return;
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
    return (_jsx("div", { className: "relative w-full h-[87vh] p-4 bg-gray-100", children: callAccepted && inCall ? (_jsxs("div", { className: "w-full h-full bg-black flex items-center justify-center relative", children: [_jsx("video", { id: "remoteVideo", autoPlay: true, playsInline: true, className: "w-full h-full object-cover" }), _jsx("video", { id: "localVideo", autoPlay: true, muted: true, playsInline: true, className: "absolute bottom-6 right-6 w-28 h-28 rounded-lg border-2 border-white shadow-lg" }), _jsxs("div", { className: "absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-6 bg-black/60 p-4 rounded-full shadow-lg", children: [_jsx("button", { className: "bg-gray-700 hover:bg-gray-600 p-3 rounded-full text-white", title: "Mute", children: "\uD83C\uDF99\uFE0F" }), _jsx("button", { className: "bg-gray-700 hover:bg-gray-600 p-3 rounded-full text-white", title: "Switch Camera", children: "\uD83C\uDFA5" }), _jsx("button", { className: "bg-yellow-500 hover:bg-yellow-600 p-3 rounded-full text-white", title: "Switch Audio", children: "\uD83D\uDD0A" }), _jsx("button", { onClick: endCallHandler, className: "bg-red-600 hover:bg-red-700 p-3 rounded-full text-white", title: "End Call", children: "\u274C" })] })] })) : (_jsxs(_Fragment, { children: [modalVisible && (_jsx("div", { className: "absolute inset-0 z-50 flex items-center justify-center bg-black/60", children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl p-6 text-center max-w-sm w-full", children: [_jsxs("p", { className: "text-xl font-bold text-gray-700 mb-3", children: ["Incoming ", callType, " call..."] }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: acceptIncomingCall, className: "bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg", children: "Accept" }), _jsx("button", { onClick: rejectCallInCommingCall, className: "bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg", children: "Reject" })] })] }) })), _jsxs("div", { className: "flex flex-col h-full border rounded-xl shadow bg-white overflow-hidden", children: [_jsxs("div", { className: "flex justify-between items-center px-5 py-3 border-b bg-gray-50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: selectedUser?.profileImage, alt: "profile", className: "w-12 h-12 rounded-full object-cover shadow-sm" }), _jsx("h2", { className: "font-semibold text-gray-800", children: selectedUser?.firstName })] }), _jsxs("div", { className: "flex items-center gap-4 text-2xl text-blue-500", children: [_jsx(MdCall, { onClick: () => makeCall("audio"), className: "cursor-pointer hover:text-blue-600" }), _jsx(CiVideoOn, { onClick: () => makeCall("video"), className: "cursor-pointer hover:text-blue-600" })] })] }), _jsxs("div", { className: "flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50", children: [messages.map((msg, i) => {
                                    const isSender = msg.senderId === senderId;
                                    const messageTime = new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });
                                    return (_jsxs("div", { className: `flex flex-col ${isSender ? "items-end" : "items-start"}`, children: [_jsx("div", { className: `px-4 py-2 max-w-xs text-sm rounded-lg shadow-sm ${isSender ? "bg-blue-600 text-white" : "bg-white text-gray-800 border"}`, children: msg.content }), _jsx("span", { className: "text-xs text-gray-500 mt-1", children: messageTime })] }, i));
                                }), _jsx("div", { ref: messagesEndRef })] }), _jsxs("form", { onSubmit: handleSendMessage, className: "flex items-center gap-3 border-t px-4 py-3 bg-white", children: [_jsx("input", { type: "text", className: "flex-1 border border-gray-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400", placeholder: "Type a message...", value: message, onChange: (e) => setMessage(e.target.value) }), _jsx("button", { type: "submit", className: "text-blue-600 text-3xl", children: _jsx(IoIosSend, {}) })] })] })] })) }));
};
export default Inbox;
