// socket.ts
import { io, Socket } from "socket.io-client";
import { store } from "@/redux/store";
import { updateOnlineUsers } from "@/redux/Slices/userSlice";
import { addMessage } from "@/redux/Slices/messageSlice";

const BASE_URL = import.meta.env.VITE_SERVER_URL;
let socket: Socket;
let isSubscribed = false; // 🛡 Prevent duplicate subscriptions

export const connectSocket = (userId: string) => {
  if (!socket || !socket.connected) {
    socket = io(BASE_URL, {
      query: { userId },
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("🔌 Connected to socket:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Disconnected from socket");
    });

    socket.on("getAllOnlineUsers", (userIds: string[]) => {
      console.log("📡 Online users:", userIds);
      store.dispatch(updateOnlineUsers(userIds));
    });

    // Subscribe only once after connection
    if (!isSubscribed) {
      subscribeToMessages();
      isSubscribed = true;
    }
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    isSubscribed = false;
  }
};

export const subscribeToMessages = () => {
  socket.on("newMessage", (message) => {
    console.log("📩 New message received:", message);
    store.dispatch(addMessage(message));
  });
};
