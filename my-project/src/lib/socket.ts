// socket.ts
import { io, Socket } from "socket.io-client";
import { RootState, store } from "@/redux/store";
import { updateOnlineUsers } from "@/redux/Slices/userSlice";
import { addMessage } from "@/redux/Slices/messageSlice";
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_SERVER_URL;
let socket: Socket | null = null;
export const connectSocket = (userId: string) => {
  if (socket) return;

  socket = io(BASE_URL, {
    query: { userId },
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("🔌 Connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Disconnected");
    socket = null;
  });

  socket.on("getAllOnlineUsers", (userIds: string[]) => {
    console.log("📡 Online users:", userIds);
    store.dispatch(updateOnlineUsers(userIds));
  });

  socket.on("newMessage", (message) => {
    const currentUserId = store.getState().volenteer.volenteerData.user?._id;
    console.log("📩 New message received:", message);
    if(message.senderId ! == currentUserId)
      console.log("dddddddddddisp");
      
    store.dispatch(addMessage(message));
    console.log("dddddddddddispcccccccched");
  });
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;
