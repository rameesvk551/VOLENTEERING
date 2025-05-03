// socket.ts (WebRTC + Socket.io Logic)
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { store } from "@/redux/store";
import { updateOnlineUsers } from "@/redux/Slices/userSlice";
import { addMessage } from "@/redux/Slices/messageSlice";
import { setOnlineUsers } from "@/redux/Slices/socketlice";

let socket: Socket | null = null;
let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let ringtone: HTMLAudioElement | null = null;

const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const connectSocket = (
  userId: string,
  setCallerId: (id: string) => void,
  setModalVisible: (v: boolean) => void,
  setCallAccepted: (v: boolean) => void,
  incomingOfferRef: React.MutableRefObject<RTCSessionDescriptionInit | null>,
  setCallType: (type: "audio" | "video") => void
) => {
  if (socket) return;

  socket = io(import.meta.env.VITE_SERVER_URL, {
    auth: { userId },
    withCredentials: true,
  });

  socket.on("connect", () => console.log("Connected to socket.io", socket?.id));

  socket.on("disconnect", () => {
    console.log("Disconnected");
    socket = null;
  });

  socket.on("getAllOnlineUsers", (userIds: string[]) => {
    store.dispatch(setOnlineUsers(userIds));
  });

  socket.on("newMessage", (message) => {
    const currentUserId = store.getState().volenteer.volenteerData.user?._id;
    if (message.senderId !== currentUserId) {
      store.dispatch(addMessage(message));
    }
  });

  socket.on("webrtc-offer", ({ offer, callerId, type }) => {
    setCallerId(callerId);
    incomingOfferRef.current = offer;
    setCallType(type);
    setModalVisible(true);

    if (!ringtone) {
      ringtone = new Audio("/sounds/jhol-66804.mp3");
      ringtone.loop = true;
    }
    ringtone.play();
  });

  socket.on("webrtc-answer", ({ answer }) => {
    if (peerConnection) {
      peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  });

  socket.on("webrtc-candidate", ({ candidate }) => {
    if (peerConnection && candidate) {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  });

  socket.on("webrtc-end", () => {
    cleanupCall();
    toast.error("The call was ended");
    setCallAccepted(false);
  });

  socket.on("webrtc-reject", () => {
    cleanupCall();
    toast.error("The call was rejected.");
    setCallAccepted(false);
  });
};

export const startCall = (
  receiverId: string,
  senderId: string,
  callType: "audio" | "video"
) => {
  if (!socket) return;

  peerConnection = new RTCPeerConnection(rtcConfig);

  navigator.mediaDevices
    .getUserMedia({ video: callType === "video", audio: true })
    .then((stream) => {
      localStream = stream;

      const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = stream;
        localVideo.classList.remove("hidden");
      }

      stream.getTracks().forEach((track) => peerConnection?.addTrack(track, stream));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("webrtc-candidate", {
            candidate: event.candidate,
            receiverId,
            callerId: senderId,
          });
        }
      };

      peerConnection.ontrack = (event) => {
        const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
        if (remoteVideo && !remoteVideo.srcObject) {
          remoteVideo.srcObject = event.streams[0];
        }
      };

      return peerConnection.createOffer()
        .then((offer) => peerConnection?.setLocalDescription(offer))
        .then(() => {
          socket?.emit("webrtc-offer", {
            offer: peerConnection?.localDescription,
            receiverId,
            callerId: senderId,
            type: callType,
          });
        });
    })
    .catch(console.error);
};

export const acceptCall = (
  offer: RTCSessionDescriptionInit,
  callerId: string,
  callType: "audio" | "video"
) => {
  peerConnection = new RTCPeerConnection(rtcConfig);

  navigator.mediaDevices
    .getUserMedia({ video: callType === "video", audio: true })
    .then((stream) => {
      localStream = stream;

      const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = stream;
        localVideo.classList.remove("hidden");
      }

      stream.getTracks().forEach((track) => peerConnection?.addTrack(track, stream));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("webrtc-candidate", {
            candidate: event.candidate,
            receiverId: callerId,
            callerId,
          });
        }
      };

      peerConnection.ontrack = (event) => {
        const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
        if (remoteVideo && !remoteVideo.srcObject) {
          remoteVideo.srcObject = event.streams[0];
        }
      };

      peerConnection
        .setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => peerConnection.createAnswer())
        .then((answer) => peerConnection?.setLocalDescription(answer))
        .then(() => {
          socket?.emit("webrtc-answer", {
            answer: peerConnection?.localDescription,
            callerId,
          });
        });

      ringtone?.pause();
    })
    .catch(console.error);
};

export const cleanupCall = () => {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
  const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;

  if (localVideo) {
    localVideo.srcObject = null;
    localVideo.classList.add("hidden");
  }
  if (remoteVideo) {
    remoteVideo.srcObject = null;
  }
};

export const endCall = (to: string) => {
  socket?.emit("webrtc-end", { to });
  cleanupCall();
};

export const rejectCall = (to: string) => {
  socket?.emit("webrtc-reject", { to });
  ringtone?.pause();
  cleanupCall();
};
