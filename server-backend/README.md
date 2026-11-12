# Olympia Backend Server

Express + Socket.IO backend for Olympia multiplayer quiz game.

## Features

- ✅ **Express REST API** - Room management endpoints
- ✅ **Socket.IO** - Real-time game state synchronization
- ✅ **No message size limit** - Send full game state (unlike Pusher 10KB limit)
- ✅ **Self-hosted** - Full control over infrastructure
- ✅ **Railway/Render ready** - Easy deployment

## Development

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://olympia-44d9.vercel.app
```

## API Endpoints

### REST API

- `POST /api/rooms/create` - Create new room
- `GET /api/rooms/:roomCode` - Get room state
- `POST /api/rooms/:roomCode/action` - Apply game action
- `GET /health` - Health check

### Socket.IO Events

**Client → Server:**
- `join-room` - Join a game room
- `leave-room` - Leave a game room
- `game-action` - Apply game action (triggers broadcast)
- `get-room-state` - Request current room state

**Server → Client:**
- `room-state` - Full room state (on join)
- `state-updated` - Game state update
- `player-joined` - New player joined
- `player-left` - Player left
- `error` - Error message

## Deployment

### Railway (Recommended)

1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repo
3. Add environment variables
4. Deploy!

```bash
# Railway will automatically:
# - Detect Node.js project
# - Run `npm run build`
# - Run `npm start`
```

### Render

1. Create account at [render.com](https://render.com)
2. New → Web Service
3. Connect repo
4. Build: `npm run build`
5. Start: `npm start`

## Architecture

```
┌─────────────────────────────────────────┐
│ Frontend (Vercel)                       │
│ https://olympia-44d9.vercel.app         │
└──────────────┬──────────────────────────┘
               │
               │ Socket.IO + REST API
               ▼
┌─────────────────────────────────────────┐
│ Backend (Railway/Render)                │
│ - Express REST API                      │
│ - Socket.IO WebSocket                   │
│ - Room Manager (in-memory)              │
│ - Question Selector (36 random Q's)     │
└─────────────────────────────────────────┘
```

## Benefits vs Pusher

| Feature | Pusher | Self-hosted |
|---------|--------|-------------|
| Message size | 10 KB limit ❌ | Unlimited ✅ |
| Cost | $49/month | Free ✅ |
| Control | Limited | Full ✅ |
| Latency | Good | Better ✅ |
| Setup | Easy | Medium |

## Next Steps

1. Copy actual `olympiaEngine.ts` from main project
2. Copy `olympiaQuestionsFromCsv.ts` for real questions
3. Deploy to Railway
4. Update frontend to connect to backend URL
5. Test multiplayer!
