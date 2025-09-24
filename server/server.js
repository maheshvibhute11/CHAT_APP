import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

// Create Express App
const app = express();

// Create HTTP Server
const server = http.createServer(app);

// Socket.IO setup with CORS
export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"], // Add your frontend URLs here
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Map to track connected users
export const userSocketMap = {};

// Socket.IO connection handler
// Socket.IO connection handler
io.on("connection", (socket) => {
  // ✅ Read userId from auth instead of query
  const userId = socket.handshake.auth.userId;
  console.log("User Connected:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected:", userId);
    if (userId) {
      delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});


// Middleware
app.use(express.json({ limit: "4mb" }));

// Apply CORS for Express routes
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));

// Test route
app.use("/api/status", (req, res) => res.send("Server is live"));

// Routes
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on PORT: ${PORT}`));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
