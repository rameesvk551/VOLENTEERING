// socketSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { io, Socket } from "socket.io-client";

const BASE_URL = "http://localhost:2222";

const initialState = {
  socket: null as Socket | null,
  onlineUsers: [] as string[],
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setSocket(state, action) {
      state.socket = action.payload;
    },
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
    disconnectSocket(state) {
      state.socket?.disconnect();
      state.socket = null;
    },
  },
});

export const { setSocket, setOnlineUsers, disconnectSocket } = socketSlice.actions;

export default socketSlice.reducer;
