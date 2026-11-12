import type { VercelRequest, VercelResponse } from "@vercel/node";
import Pusher from "pusher";
import { saveRoom, getRoom } from "../shared/roomStorage.js";
import { selectRandomQuestions } from "../shared/questionSelector.js";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "ap1",
  useTLS: true,
});

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
    const { hostName } = req.body;

    if (!hostName || typeof hostName !== "string") {
      return res.status(400).json({ error: "hostName is required" });
    }

    const roomCode = generateRoomCode();
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ========== SERVER-SIDE RANDOM QUESTION SELECTION ==========
    // Shuffle and select questions on server to reduce client bundle size
    const { personalQuestions, commonQuestions, tangTocQuestions } =
      selectRandomQuestions();

    // Create initial Olympia game state with pre-selected questions
    const { createInitialRoomStateWithQuestions, applyClientAction } =
      await import("../../src/utils/olympiaEngine.js");

    let gameState = createInitialRoomStateWithQuestions(
      roomCode,
      personalQuestions,
      commonQuestions,
      tangTocQuestions,
    );

    // Add host as first player
    const joinAction = {
      type: "JOIN_OR_CLAIM_SEAT",
      name: hostName,
      school: "THPT Chuyên",
      clientId: playerId,
      isCreatingRoom: true,
    };
    gameState = applyClientAction(gameState, joinAction as any);

    const room = {
      roomCode,
      hostName,
      players: [
        {
          id: playerId,
          name: hostName,
          ready: false,
        },
      ],
      status: "waiting" as const,
      createdAt: Date.now(),
      gameState,
    };

    await saveRoom(room);

    // Trigger Pusher event to notify about new room (exclude questions to avoid 10KB limit)
    const roomForBroadcast = {
      roomCode,
      hostName,
      players: room.players,
      status: room.status,
      createdAt: room.createdAt,
      gameState: {
        ...gameState,
        questions: undefined, // Exclude questions from Pusher broadcast
      },
    };

    try {
      await pusher.trigger(`room-${roomCode}`, "room-created", {
        room: roomForBroadcast,
      });
    } catch (pusherError) {
      console.error("Pusher broadcast error:", pusherError);
      // Continue - room is created, just broadcast failed
    }

    res.status(200).json({
      success: true,
      roomCode,
      playerId,
      room,
      state: gameState,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
}
