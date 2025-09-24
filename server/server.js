import express from "express";
import "dotenv/config";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*" // Replace "*" with your frontend URL in production
  }
});

// Store online users
export const userSocketMap = {};

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // You need to get userId from socket handshake or client emit
  socket.on("user_connected", (userId) => {
    if (userId) {
      userSocketMap[userId] = socket.id;
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Remove user from map
    for (const [key, value] of Object.entries(userSocketMap)) {
      if (value === socket.id) {
        delete userSocketMap[key];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Routes
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to DB and start server
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () => console.log("Server running on port:", PORT));
  })
  .catch((err) => console.error("DB connection error:", err));

export default server;
