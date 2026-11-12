import type { Room, CreateRoomResult } from "../types/room.js";
import { selectRandomQuestions } from "./questionSelector.js";
import {
  createInitialRoomStateWithQuestions,
  applyClientAction,
} from "./olympiaEngine.js";

class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private readonly ROOM_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Cleanup expired rooms every 5 minutes
    setInterval(() => this.cleanupExpiredRooms(), 5 * 60 * 1000);
  }

  generateRoomCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Ensure uniqueness
    if (this.rooms.has(code)) {
      return this.generateRoomCode();
    }

    return code;
  }

  async createRoom(hostName: string): Promise<CreateRoomResult> {
    const roomCode = this.generateRoomCode();
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Select random questions server-side
    const { personalQuestions, commonQuestions, tangTocQuestions } =
      selectRandomQuestions();

    // Create initial game state with questions
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

    const room: Room = {
      roomCode,
      hostName,
      hostPlayerId: playerId,
      players: [
        {
          id: playerId,
          name: hostName,
          ready: false,
        },
      ],
      status: "waiting",
      createdAt: Date.now(),
      lastActivity: Date.now(),
      gameState,
    };

    this.rooms.set(roomCode, room);

    console.log(`✅ Room created: ${roomCode} by ${hostName}`);

    return room;
  }

  getRoom(roomCode: string): Room | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (room) {
      room.lastActivity = Date.now();
    }
    return room || null;
  }

  updateRoom(roomCode: string, updates: Partial<Room>): Room | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;

    Object.assign(room, updates, { lastActivity: Date.now() });
    this.rooms.set(roomCode.toUpperCase(), room);

    return room;
  }

  applyAction(roomCode: string, action: any): any {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) {
      throw new Error("Room not found");
    }

    // Apply action to game state
    const updatedState = applyClientAction(room.gameState, action);
    room.gameState = updatedState;
    room.lastActivity = Date.now();

    this.rooms.set(roomCode.toUpperCase(), room);

    return updatedState;
  }

  deleteRoom(roomCode: string): boolean {
    const deleted = this.rooms.delete(roomCode.toUpperCase());
    if (deleted) {
      console.log(`🗑️  Room deleted: ${roomCode}`);
    }
    return deleted;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  private cleanupExpiredRooms(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [code, room] of this.rooms.entries()) {
      if (now - room.lastActivity > this.ROOM_TIMEOUT) {
        this.rooms.delete(code);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired rooms`);
    }
  }
}

export const roomManager = new RoomManager();
