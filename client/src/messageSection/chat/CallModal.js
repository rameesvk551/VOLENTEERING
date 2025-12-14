import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from "react";
import { MdCallEnd } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
export const CallModal = ({ isOpen, onHangup, userName, userImage, type, localStream, remoteStream, isAnswered, }) => {
    const localRef = useRef(null);
    const remoteRef = useRef(null);
    useEffect(() => {
        if (localRef.current && localStream) {
            localRef.current.srcObject = localStream;
            localRef.current.play().catch(() => { });
        }
    }, [localStream]);
    useEffect(() => {
        if (remoteRef.current && remoteStream) {
            remoteRef.current.srcObject = remoteStream;
            remoteRef.current.play().catch(() => { });
        }
    }, [remoteStream]);
    return (_jsx(AnimatePresence, { children: isOpen && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50", children: [type === "video" && isAnswered ? (_jsx("video", { ref: remoteRef, autoPlay: true, playsInline: true, className: "absolute inset-0 w-full h-full object-cover" })) : (_jsx("img", { src: userImage, alt: userName, className: "w-40 h-40 rounded-full object-cover shadow-lg z-10" })), type === "video" && (_jsx("video", { ref: localRef, autoPlay: true, muted: true, playsInline: true, className: "w-32 h-32 rounded-xl border-4 border-white shadow-lg absolute bottom-6 right-6 z-20" })), _jsxs("div", { className: "absolute top-6 left-6 text-white z-20", children: [_jsx("h2", { className: "text-2xl font-bold", children: userName }), _jsx("p", { className: "text-sm", children: type === "video" ? "Video Call" : "Audio Call" }), !isAnswered && _jsx("p", { className: "text-xs text-gray-300 mt-1", children: "Calling..." })] }), _jsx("button", { onClick: onHangup, className: "absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 p-4 rounded-full shadow-lg text-white hover:bg-red-700 z-20 disabled:opacity-50", disabled: !localStream, children: _jsx(MdCallEnd, { size: 26 }) })] })) }));
};
