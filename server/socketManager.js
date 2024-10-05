const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const address = require("address");

const app = express();
const server = http.createServer(app);

const localIp = address.ip();
const io = new Server(server, {
	cors: {
		origin: process.env.NODE_ENV === 'production' ? [process.env.FRONTEND_URL] : ["http://localhost:5173", `http://${localIp}:5173`],
		methods: ["GET", "POST"],
	},
});

const userSocketMap = {}; // {userId: socketId}

const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};	

io.on("connection", (socket) => {
	console.log("a user connected", socket.id);

	const userId = socket.handshake.query.userId;
	if (userId && userId !== "undefined") {
		userSocketMap[userId] = socket.id;
	}

	io.emit("getOnlineUsers", Object.keys(userSocketMap));

	socket.on("disconnect", () => {
		console.log("user disconnected", socket.id);
		delete userSocketMap[userId];
		io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});

	socket.on("error", (error) => {
		console.error("Socket error:", error);
	});
});

module.exports = { app, io, server, getReceiverSocketId };
