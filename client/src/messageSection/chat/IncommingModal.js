import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
const IncomingCallModal = ({ callerId, callType, isVisible, onAccept, onReject }) => {
    const audioRef = useRef(null);
    // Play ringtone when modal becomes visible, and stop when hidden/unmounted
    useEffect(() => {
        if (isVisible) {
            audioRef.current = new Audio('/sounds/jhol-66804.mp3');
            audioRef.current.loop = true;
            audioRef.current.play().catch(() => console.warn('🔕 Ringtone autoplay blocked'));
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
        };
    }, [isVisible]);
    if (!isVisible)
        return null;
    return (_jsx("div", { className: "fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-75 z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 shadow-lg max-w-sm w-full", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Incoming Call" }), _jsxs("p", { className: "mb-4", children: ["Caller: ", callerId] }), _jsxs("p", { className: "mb-6", children: ["Call Type: ", callType === 'audio' ? 'Audio Call' : 'Video Call'] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("button", { className: "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700", onClick: () => {
                                // stop ringtone immediately
                                if (audioRef.current) {
                                    audioRef.current.pause();
                                    audioRef.current.currentTime = 0;
                                }
                                onReject();
                            }, children: "Reject" }), _jsx("button", { className: "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700", onClick: () => {
                                if (audioRef.current) {
                                    audioRef.current.pause();
                                    audioRef.current.currentTime = 0;
                                }
                                onAccept();
                            }, children: "Accept" })] })] }) }));
};
export default IncomingCallModal;
