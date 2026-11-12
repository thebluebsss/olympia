export interface Player {
  id: string;
  name: string;
  ready: boolean;
}

export interface Room {
  roomCode: string;
  hostName: string;
  hostPlayerId: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  gameState: any; // OlympiaRoomState from client
  lastActivity: number;
}

export interface CreateRoomResult {
  roomCode: string;
  hostPlayerId: string;
  hostName: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  gameState: any;
}
