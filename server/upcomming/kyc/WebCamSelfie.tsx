import React, { useRef, useState } from "react";
type WebcamSelfieProps = {
    onCapture: (imageData: string) => void;
  };
  const WebcamSelfie: React.FC<WebcamSelfieProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (error) {
      console.error("Camera access error:", error);
    }
  };

  const captureSelfie = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/png");
        onCapture(imageDataUrl); // 🔥 Send image to parent
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {!streaming && (
        <button
          onClick={startCamera}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          📷 Start Camera
        </button>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-md rounded shadow"
        style={{ display: streaming ? "block" : "none" }}
      />

      {streaming && (
        <button
          onClick={captureSelfie}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          📸 Capture Selfie
        </button>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default WebcamSelfie;
