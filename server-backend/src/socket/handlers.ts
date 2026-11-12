import type { Server as SocketIOServer, Socket } from "socket.io";
import { roomManager } from "../services/roomManager.js";

export function setupSocketHandlers(io: SocketIOServer) {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room - Accept both string and object format
    socket.on(
      "join-room",
      (
        roomCodeOrData:
          | string
          | { roomCode: string; playerId?: string; playerName?: string },
      ) => {
        let code: string;

        // Handle both formats: 'join-room', 'ABCD123' or 'join-room', { roomCode: 'ABCD123' }
        if (typeof roomCodeOrData === "string") {
          code = roomCodeOrData.toUpperCase();
        } else {
          code = roomCodeOrData.roomCode.toUpperCase();
        }

        const room = roomManager.getRoom(code);

        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        socket.join(code);
        console.log(`👤 Client ${socket.id} joined room ${code}`);

        // Send current room state to the joining player
        socket.emit("room-state", room.gameState);
      },
    );

    // Leave room
    socket.on(
      "leave-room",
      (roomCodeOrData: string | { roomCode: string; playerId?: string }) => {
        let code: string;

        if (typeof roomCodeOrData === "string") {
          code = roomCodeOrData.toUpperCase();
        } else {
          code = roomCodeOrData.roomCode.toUpperCase();
        }

        socket.leave(code);
        console.log(`👋 Client ${socket.id} left room ${code}`);
      },
    );

    // Broadcast game action (room-action from frontend)
    socket.on("room-action", ({ roomCode, action }) => {
      const code = roomCode.toUpperCase();

      try {
        const updatedState = roomManager.applyAction(code, action);

        // Broadcast to all clients in room (including sender)
        io.to(code).emit("room-state", updatedState);

        console.log(`🎮 Action ${action.type} applied in room ${code}`);
      } catch (error) {
        console.error("Game action error:", error);
        socket.emit("error", { message: "Failed to apply action" });
      }
    });

    // Get room state (request-state from frontend)
    socket.on("request-state", (roomCode: string) => {
      const code = roomCode.toUpperCase();
      const room = roomManager.getRoom(code);

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      socket.emit("room-state", room.gameState);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
}
