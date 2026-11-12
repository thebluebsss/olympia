import type { VercelRequest, VercelResponse } from '@vercel/node';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || 'ap1',
  useTLS: true,
});

interface Room {
  roomCode: string;
  hostName: string;
  players: Array<{
    id: string;
    name: string;
    ready: boolean;
  }>;
  status: 'waiting' | 'playing' | 'finished';
  gameState?: any;
  createdAt: number;
}

// Shared in-memory storage
const rooms = new Map<string, Room>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Get room state
    const { roomCode } = req.query;
    
    if (!roomCode || typeof roomCode !== 'string') {
      return res.status(400).json({ error: 'roomCode is required' });
    }

    const room = rooms.get(roomCode.toUpperCase());
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    return res.status(200).json({ success: true, room });
  }

  if (req.method === 'POST') {
    // Update room state
    const { roomCode, gameState, action } = req.body;

    if (!roomCode) {
      return res.status(400).json({ error: 'roomCode is required' });
    }

    const room = rooms.get(roomCode.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Update game state
    if (gameState) {
      room.gameState = gameState;
    }

    // Update room status based on action
    if (action === 'start') {
      room.status = 'playing';
    } else if (action === 'finish') {
      room.status = 'finished';
    }

    rooms.set(roomCode, room);

    // Broadcast state change to all players in room
    await pusher.trigger(`room-${roomCode}`, 'state-updated', {
      gameState,
      action,
      room,
    });

    return res.status(200).json({ success: true, room });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
