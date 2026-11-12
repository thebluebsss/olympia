import type { VercelRequest, VercelResponse } from "@vercel/node";
import Pusher from "pusher";
import { getRoom, saveRoom, type Room } from "../../shared/roomStorage.js";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "ap1",
  useTLS: true,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { code } = req.query;
  const roomCode = typeof code === "string" ? code.toUpperCase() : "";

  if (!roomCode) {
    return res.status(400).json({ error: "Room code is required" });
  }

  // GET: Fetch room state
  if (req.method === "GET") {
    try {
      const room = await getRoom(roomCode);

      if (!room) {
        // Return 404 but don't crash - room might be expired from cache
        return res.status(404).json({
          error: "Room not found",
          message: "Room may have expired. Please recreate the room.",
        });
      }

      return res.status(200).json({
        success: true,
        state: room.gameState,
        room,
      });
    } catch (error) {
      console.error("GET room error:", error);
      return res.status(500).json({ error: "Failed to get room state" });
    }
  }

  // POST: Apply action to room
  if (req.method === "POST") {
    try {
      const { action } = req.body;

      if (!action) {
        return res.status(400).json({ error: "Action is required" });
      }

      let room = await getRoom(roomCode);

      // If room doesn't exist, create it
      if (!room) {
        const { createInitialRoomState } =
          await import("../../../src/utils/olympiaEngine.js");
        const gameState = createInitialRoomState("OLYMPIA");

        room = {
          roomCode,
          hostName: action.name || "Host",
          players: [],
          status: "waiting",
          createdAt: Date.now(),
          gameState,
        };
      }

      // Apply action to game state
      if (room.gameState) {
        const { applyClientAction } =
          await import("../../../src/utils/olympiaEngine.js");
        room.gameState = applyClientAction(room.gameState, action);
      }

      // Handle JOIN_OR_CLAIM_SEAT action
      if (action.type === "JOIN_OR_CLAIM_SEAT") {
        const existingPlayer = room.players.find(
          (p) => p.id === action.clientId,
        );
        if (!existingPlayer && room.players.length < 4) {
          room.players.push({
            id: action.clientId,
            name: action.name,
            ready: false,
          });
        }
      }

      await saveRoom(room);

      // Broadcast state change to all players via Pusher
      await pusher.trigger(`room-${roomCode}`, "state-updated", {
        gameState: room.gameState,
        action,
        room,
      });

      return res.status(200).json({
        success: true,
        state: room.gameState,
        room,
      });
    } catch (error) {
      console.error("Action handler error:", error);
      return res.status(500).json({ error: "Failed to process action" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
