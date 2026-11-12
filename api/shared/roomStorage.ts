// Shared room storage using Pusher as temporary database
// In production, use Upstash Redis or similar

import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "ap1",
  useTLS: true,
});

export interface Room {
  roomCode: string;
  hostName: string;
  players: Array<{
    id: string;
    name: string;
    ready: boolean;
  }>;
  status: "waiting" | "playing" | "finished";
  createdAt: number;
  gameState?: any;
}

// Simple in-memory cache (will be different per serverless instance)
// But we sync via Pusher
const localCache = new Map<string, { room: Room; timestamp: number }>();

const CACHE_TTL = 300000; // 5 minutes (increased from 1 minute)

export async function saveRoom(room: Room): Promise<void> {
  // Save to local cache
  localCache.set(room.roomCode, {
    room,
    timestamp: Date.now(),
  });

  // Broadcast to Pusher for cross-function sync (EXCLUDE questions to avoid 10KB limit)
  try {
    const roomForBroadcast = {
      ...room,
      gameState: room.gameState
        ? {
            ...room.gameState,
            questions: undefined, // Remove questions from broadcast (client will get from API)
          }
        : undefined,
    };

    await pusher.trigger(`room-storage-${room.roomCode}`, "room-updated", {
      room: roomForBroadcast,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Failed to broadcast room update:", error);
  }
}

export async function getRoom(roomCode: string): Promise<Room | null> {
  const code = roomCode.toUpperCase();

  // Check local cache first
  const cached = localCache.get(code);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.room;
  }

  // If not in cache or expired, return null
  // The client will need to create the room
  return null;
}

export async function deleteRoom(roomCode: string): Promise<void> {
  const code = roomCode.toUpperCase();
  localCache.delete(code);

  try {
    await pusher.trigger(`room-storage-${code}`, "room-deleted", {
      roomCode: code,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Failed to broadcast room deletion:", error);
  }
}

export function getAllRooms(): Room[] {
  const now = Date.now();
  const rooms: Room[] = [];

  for (const [, cached] of localCache.entries()) {
    if (now - cached.timestamp < CACHE_TTL) {
      rooms.push(cached.room);
    }
  }

  return rooms;
}
