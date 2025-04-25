// mainServer.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");
const dbConnect = require("./config/db");
const updateLastActive = require("./middleware/updateLastActive");

// Routes
const userRoutes = require("./routes/user");
const hostRoutes = require("./routes/host");
const paymentRoutes = require("./routes/payment");
const hotelRoutes = require("./routes/hotel");
const messageRoutes = require("./routes/message");
const tripPlaningRoutes = require("./routes/tripPlanning")
const publicRoutes = require("./routes/public");
const { app,server,io } = require("./lib/socket.io");


// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1", publicRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/host", hostRoutes);
app.use("/api/v1/message",messageRoutes);
app.use("/api/v1/hotel", hotelRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/trip-planning",tripPlaningRoutes);
app.use(errorHandler);

dbConnect();
// Start the server
const PORT = process.env.PORT || 2222;
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running at http://localhost:${PORT}`);
});