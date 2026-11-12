import type { VercelRequest, VercelResponse } from "@vercel/node";
import Pusher from "pusher";
import { getRoom, saveRoom, type Room } from "../shared/roomStorage.js";

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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { roomCode, playerName } = req.body;

    if (!roomCode || !playerName) {
      return res
        .status(400)
        .json({ error: "roomCode and playerName are required" });
    }

    const room = await getRoom(roomCode.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.status !== "waiting") {
      return res.status(400).json({ error: "Room is not accepting players" });
    }

    if (room.players.length >= 4) {
      return res.status(400).json({ error: "Room is full (max 4 players)" });
    }

    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add player to game state
    if (room.gameState) {
      const { applyClientAction } =
        await import("../../src/utils/olympiaEngine.js");
      const joinAction = {
        type: "JOIN_OR_CLAIM_SEAT",
        name: playerName,
        school: "THPT Chuyên",
        clientId: playerId,
        isCreatingRoom: false,
      };
      room.gameState = applyClientAction(room.gameState, joinAction as any);
    }

    room.players.push({
      id: playerId,
      name: playerName,
      ready: false,
    });

    await saveRoom(room);

    // Notify all players in room about new player
    await pusher.trigger(`room-${roomCode}`, "player-joined", {
      playerId,
      playerName,
      room,
      gameState: room.gameState,
    });

    res.status(200).json({
      success: true,
      playerId,
      room,
      state: room.gameState,
    });
  } catch (error) {
    console.error("Join room error:", error);
    res.status(500).json({ error: "Failed to join room" });
  }
}
