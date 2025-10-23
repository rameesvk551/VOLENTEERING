// server.js
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const Call =require("../model/call")
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
const ongoingCalls = new Map(); 

 const getReceiverSocketId = (userId) => userSocketMap[userId];

io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);
  const userId = socket.handshake.auth.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getAllOnlineUsers", Object.keys(userSocketMap));

  socket.on("webrtc-offer", async ({ offer, receiverId, callerId, type }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
  
    // Create a new Call document
    const newCall = await Call.create({
      callerId,
      receiverId,
      startedAt: new Date(),
      status: "ongoing",
    });
  
    ongoingCalls.set(socket.id, newCall._id); // store in map ✅
console.log("ooooooooooooooongoing ",ongoingCalls);

    if (receiverSocketId) {
      ongoingCalls.set(receiverSocketId, newCall._id);
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

  socket.on("webrtc-reject", async ({ to }) => {
    const targetId = getReceiverSocketId(to);
    if (targetId) {
      io.to(targetId).emit("webrtc-reject");
    }

    const callId = ongoingCalls.get(socket.id);
    console.log("oooooooooongggg",ongoingCalls,"vvvvvvvvvv",callId);
  
    if (callId) {
      const call = await Call.findById(callId);
      if (call) {
        call.endedAt = new Date();
        call.duration = 0;
        call.status = "rejected";
        await call.save();
        console.log(call);
        
      }
      ongoingCalls.delete(socket.id);
    }
  });
  
  
  socket.on("webrtc-end", async ({ to }) => {
    const targetId = getReceiverSocketId(to);
    if (targetId) {
      io.to(targetId).emit("webrtc-end");
    }
  
    const callId = ongoingCalls.get(socket.id);
    if (callId) {
      const endedAt = new Date();
      const call = await Call.findById(callId);
      if (call) {
        call.endedAt = endedAt;
        call.duration = (endedAt - call.startedAt) / 1000;
        call.status = "completed";
        await call.save();
      }
      console.log("ccccccccal details",call);
      
      ongoingCalls.delete(socket.id);
    }
  });
  

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    if (userId) delete userSocketMap[userId];
    io.emit("getAllOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { io, app, server,getReceiverSocketId };
