import React, { useEffect, useRef } from 'react';

interface IncomingCallModalProps {
  callerId: string;
  callType: 'audio' | 'video';
  isVisible: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ callerId, callType, isVisible, onAccept, onReject }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-75 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Incoming Call</h2>
        <p className="mb-4">Caller: {callerId}</p>
        <p className="mb-6">Call Type: {callType === 'audio' ? 'Audio Call' : 'Video Call'}</p>
        <div className="flex justify-between">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => {
              // stop ringtone immediately
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              onReject();
            }}
          >
            Reject
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              onAccept();
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
