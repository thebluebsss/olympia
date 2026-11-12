import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { roomManager } from "./services/roomManager.js";
import { setupSocketHandlers } from "./socket/handlers.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration - Allow all origins for Vercel deployment
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://olympia-44d9.vercel.app",
];

app.use(
  cors({
    origin: "*", // Allow all origins temporarily for debugging
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "50mb" }));

// Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*", // Allow all origins temporarily
    methods: ["GET", "POST"],
    credentials: false,
  },
  // No message size limit! 🎉
  maxHttpBufferSize: 1e8, // 100 MB
});

// Setup socket event handlers
setupSocketHandlers(io);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    activeRooms: roomManager.getAllRooms().length,
  });
});

// REST API endpoints
app.post("/api/rooms/create", async (req, res) => {
  try {
    const { hostName } = req.body;

    if (!hostName || typeof hostName !== "string") {
      return res.status(400).json({ error: "hostName is required" });
    }

    const room = await roomManager.createRoom(hostName);

    res.json({
      success: true,
      roomCode: room.roomCode,
      playerId: room.hostPlayerId,
      room: {
        roomCode: room.roomCode,
        hostName: room.hostName,
        players: room.players,
        status: room.status,
        createdAt: room.createdAt,
      },
      state: room.gameState,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
});

app.get("/api/rooms/:roomCode", async (req, res) => {
  try {
    const { roomCode } = req.params;
    const room = roomManager.getRoom(roomCode.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      success: true,
      room: {
        roomCode: room.roomCode,
        hostName: room.hostName,
        players: room.players,
        status: room.status,
        createdAt: room.createdAt,
      },
      state: room.gameState,
    });
  } catch (error) {
    console.error("Get room error:", error);
    res.status(500).json({ error: "Failed to get room" });
  }
});

app.post("/api/rooms/:roomCode/action", async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { action } = req.body;

    const room = roomManager.getRoom(roomCode.toUpperCase());
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const updatedState = roomManager.applyAction(
      roomCode.toUpperCase(),
      action,
    );

    // Broadcast to all clients in the room via Socket.IO
    io.to(roomCode.toUpperCase()).emit("state-updated", {
      gameState: updatedState,
      action,
    });

    res.json({
      success: true,
      state: updatedState,
    });
  } catch (error) {
    console.error("Action error:", error);
    res.status(500).json({ error: "Failed to apply action" });
  }
});

// Start server
const PORT = parseInt(process.env.PORT || "3001", 10);
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Olympia Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(", ")}`);
  console.log(`✅ Ready to accept connections`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  httpServer.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

export { app, httpServer, io };
