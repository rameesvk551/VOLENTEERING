import { io, Socket } from "socket.io-client";
import { store } from "@/redux/store";
import { updateOnlineUsers } from "@/redux/Slices/userSlice";
import { addMessage } from "@/redux/Slices/messageSlice";

const BASE_URL = import.meta.env.VITE_SERVER_URL;
let socket: Socket | null = null;
let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let ringtone: HTMLAudioElement | null = null;

const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

/**
 * Connects the client to the Socket.IO server
 */
export const connectSocket = (userId: string) => {
  if (socket) return;

  socket = io(BASE_URL, {
    auth: { userId },
    withCredentials: true,
  });

  socket.on("connect", () => console.log("🔌 Connected to socket.io", socket?.id));
  socket.on("disconnect", () => { console.log("❌ Disconnected"); socket = null; });

  socket.on("getAllOnlineUsers", (userIds: string[]) => {
    store.dispatch(updateOnlineUsers(userIds));
  });

  socket.on("newMessage", (message) => {
    const currentUserId = store.getState().volenteer.volenteerData.user?._id;
    if (message.senderId !== currentUserId) {
      store.dispatch(addMessage(message));
    }
  });
};

/**
 * Registers WebRTC signaling listeners to drive React state
 */
export const registerWebRTCListeners = (
  setCallerId: (id: string) => void,
  setModalVisible: (v: boolean) => void,
  incomingOfferRef: React.MutableRefObject<RTCSessionDescriptionInit | null>,
  setCallType: (type: 'audio' | 'video') => void
) => {
  if (!socket) return;

  socket.on("webrtc-offer", ({ offer, from, type }) => {
    console.log("aaaaaaaaaaaaanssswe");
    
    incomingOfferRef.current = offer;
    setCallerId(from);
    setCallType(type);

    setModalVisible(true);

  });

  socket.on("webrtc-answer", async ({ answer }) => {
    await peerConnection?.setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.on("webrtc-candidate", ({ candidate }) => {
    peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
  });

  socket.on("webrtc-reject", () => {
    if (ringtone) {
      ringtone.pause(); ringtone.currentTime = 0;
    }
    setModalVisible(false);
    cleanupCall();
  });
};

/** Accepts an incoming call offer */
export async function acceptCall(offer: RTCSessionDescriptionInit, from: string) {
  // Stop ringtone
  if (ringtone) { ringtone.pause(); ringtone.currentTime = 0; }

  
  await initializeMedia();
  createPeerConnection(from);
  await peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection!.createAnswer();
 
  await peerConnection!.setLocalDescription(answer);
  console.log("aaaaaaaanswer emitting");
  
  socket?.emit("webrtc-answer", { answer, to: from });
}

/** Rejects an incoming call offer */
export function rejectCall(from: string) {
  if (ringtone) { ringtone.pause(); ringtone.currentTime = 0; }
  socket?.emit("webrtc-reject", { to: from });
  cleanupCall();
}

/** Stops and resets the ringtone */
function cleanupCall() {
  peerConnection?.close();
  peerConnection = null;
  localStream?.getTracks().forEach(track => track.stop());
  localStream = null;
}

/** Initializes local audio media */
const initializeMedia = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const localAudio = document.getElementById("localAudio") as HTMLAudioElement;
  if (localAudio) {
    localAudio.srcObject = localStream;
    localAudio.play().catch(console.error);
  }
};

/** Creates a new RTCPeerConnection and hooks events */
const createPeerConnection = (remoteUserId: string) => {
  peerConnection = new RTCPeerConnection(rtcConfig);
  localStream?.getTracks().forEach(track => peerConnection!.addTrack(track, localStream!));

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket?.emit("webrtc-candidate", { candidate: event.candidate, to: remoteUserId });
    }
  };

  peerConnection.ontrack = event => {
    const remoteAudio = document.getElementById("remoteAudio") as HTMLAudioElement;
    if (remoteAudio) {
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play().catch(console.error);
    }
  };
};

/** Starts an outgoing call */
export const startCall = async (remoteUserId: string, localUserId: string) => {
  await initializeMedia();
  createPeerConnection(remoteUserId);

  const offer = await peerConnection!.createOffer();
  await peerConnection!.setLocalDescription(offer);

  socket?.emit("webrtc-offer", { offer, to: remoteUserId, from: localUserId, type: 'audio' });
};

/** Disconnects the socket */
export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;