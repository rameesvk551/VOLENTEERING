import React from 'react';
import { MdCallEnd, MdMic, MdMicOff, MdVideocam, MdVideocamOff } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; image: string };
  type: 'audio' | 'video';
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, user, type, localStream, remoteStream }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center text-white relative">

            {/* Remote video or avatar */}
            {type === 'video' ? (
              <video
                className="absolute top-0 left-0 w-full h-full object-cover"
                ref={(video) => video && remoteStream && (video.srcObject = remoteStream)}
                autoPlay
                playsInline
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-gray-700 flex items-center justify-center">
                <img src={user.image} alt={user.name} className="w-full h-full object-cover rounded-full" />
              </div>
            )}

            {/* Local video preview for video calls */}
            {type === 'video' && (
              <video
                className="absolute bottom-4 right-4 w-32 h-32 rounded-lg border-2 border-white object-cover"
                ref={(video) => video && localStream && (video.srcObject = localStream)}
                autoPlay
                muted
                playsInline
              />
            )}

            {/* Info */}
            <div className="text-center mt-6">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-sm text-gray-300">Calling...</p>
            </div>

            {/* Controls */}
            <div className="absolute bottom-10 flex gap-6">
              <button className="bg-red-600 hover:bg-red-700 p-4 rounded-full" onClick={onClose}>
                <MdCallEnd size={24} />
              </button>
              {type === 'audio' ? (
                <>
                  <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-full">
                    <MdMic size={24} />
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-full">
                    <MdMicOff size={24} />
                  </button>
                </>
              ) : (
                <>
                  <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-full">
                    <MdVideocam size={24} />
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-full">
                    <MdVideocamOff size={24} />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CallModal;
