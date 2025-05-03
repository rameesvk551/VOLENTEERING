// server.js
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {};

 const getReceiverSocketId = (userId) => userSocketMap[userId];

io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);
  const userId = socket.handshake.auth.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getAllOnlineUsers", Object.keys(userSocketMap));

  socket.on("webrtc-offer", ({ offer, receiverId, callerId, type }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
   
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("webrtc-offer", {
        offer,
        callerId,
        type,
      });
    }
  });

  socket.on("webrtc-answer", ({ answer, callerId }) => {
    const callerSocketId = getReceiverSocketId(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit("webrtc-answer", { answer });
    }
  });

  socket.on("webrtc-candidate", ({ candidate, receiverId, callerId }) => {
    const targetId = getReceiverSocketId(receiverId || callerId);
    if (targetId) {
      io.to(targetId).emit("webrtc-candidate", { candidate });
    }
  });

  socket.on("webrtc-reject", ({ to }) => {
    const targetId = getReceiverSocketId(to);
    if (targetId) {
      io.to(targetId).emit("webrtc-reject"); // consistent naming
    }
  });
  
  socket.on("webrtc-end", ({ to }) => {
    const targetId = getReceiverSocketId(to);
    if (targetId) {
      io.to(targetId).emit("webrtc-end"); // consistent naming
    }
  });
  

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    if (userId) delete userSocketMap[userId];
    io.emit("getAllOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { io, app, server,getReceiverSocketId };
