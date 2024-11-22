const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const address = require("address");

const app = express();
const server = http.createServer(app);

const localIp = address.ip();
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL]
        : ["http://localhost:5173", `http://${localIp}:5173`],
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {}; // { userId: socketId }

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", async (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;

    // Emit the list of online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Fetch and send unread notifications dynamically
    try {
      const mongoose = require("mongoose"); // Dynamically require mongoose
      const Notification = mongoose.model("Notification"); // Dynamically load Notification model
      const unreadNotifications = await Notification.find({
        recipientIds: userId,
        read: false,
      });
      unreadNotifications.forEach((notification) => {
        socket.emit("newAnnouncement", notification);
      });
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  }

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

  // Mark notifications as read when acknowledged by the user
  socket.on("markNotificationAsRead", async (notificationId) => {
    try {
      const mongoose = require("mongoose"); // Dynamically require mongoose
      const Notification = mongoose.model("Notification"); // Dynamically load Notification model
      await Notification.findByIdAndUpdate(notificationId, { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  });

  // Handle other potential custom events here
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

module.exports = { app, io, server, getReceiverSocketId };
