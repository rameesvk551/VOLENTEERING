

import React, { useRef, useEffect } from "react";
import { MdCallEnd } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";

interface CallModalProps {
  isOpen: boolean;
  onHangup: () => void;
  userName: string;
  userImage: string;
  type: "audio" | "video";
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  isAnswered: boolean;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onHangup,
  userName,
  userImage,
  type,
  localStream,
  remoteStream,
  isAnswered,
}) => {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
      localRef.current.play().catch(() => {});
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
      remoteRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        >
          {/* Background: remote video or avatar */}
          {type === "video" && isAnswered ? (
            <video
              ref={remoteRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <img
              src={userImage}
              alt={userName}
              className="w-40 h-40 rounded-full object-cover shadow-lg z-10"
            />
          )}

          {/* Local preview (for video only) */}
          {type === "video" && (
            <video
              ref={localRef}
              autoPlay
              muted
              playsInline
              className="w-32 h-32 rounded-xl border-4 border-white shadow-lg absolute bottom-6 right-6 z-20"
            />
          )}

          {/* Overlay content */}
          <div className="absolute top-6 left-6 text-white z-20">
            <h2 className="text-2xl font-bold">{userName}</h2>
            <p className="text-sm">{type === "video" ? "Video Call" : "Audio Call"}</p>
            {!isAnswered && <p className="text-xs text-gray-300 mt-1">Calling...</p>}
          </div>

          {/* Hangup */}
          <button
            onClick={onHangup}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 p-4 rounded-full shadow-lg text-white hover:bg-red-700 z-20 disabled:opacity-50"
            disabled={!localStream}
          >
            <MdCallEnd size={26} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
