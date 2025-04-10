const http = require("http");
const express = require("express");
const { Server } = require("socket.io"); // ✅ Import Server

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // ✅ Your frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});

 function getReceiverSocketId (userId) {
  return userSocketMap[userId];
};
//for storimg online users
const userSocketMap={}// userId=key ,socketId=value
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);
  const userId=socket.handshake.query.userId
  console.log("userIdddddddd",userId);
  
  if(userId)userSocketMap[userId]=socket.id
  console.log("Usercketmap",userSocketMap);
  

  //io.emiit is used  to send events to evey users connected
io.emit("getAllOnlineUsers",Object.keys(userSocketMap))
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    delete userSocketMap[userId]
    io.emit("getAllOnlineUsers",Object.keys(userSocketMap))
  });
});

module.exports = { io, app, server,getReceiverSocketId };
