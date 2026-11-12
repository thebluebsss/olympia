import express from 'express';
import http from 'http';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import {
  createInitialRoomState,
  applyClientAction,
  mergeRoomStates,
} from './src/utils/olympiaEngine.ts';
import {
  initServerClusterSync,
  publishRoomStateToCluster,
  loadRoomsFromDisk,
  saveRoomsToDisk,
  waitForClusterSync,
} from './src/utils/clusterSync.ts';
import type {
  OlympiaRoomState,
  ClientAction,
  QuestionDeckMode,
} from './src/types/olympia.ts';
import { csvQuestionBank } from './src/utils/csvQuestionBank.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the 21,649+ CSV Question Bank on startup
csvQuestionBank.init();

// ==================== ADMIN / BAN TỔ CHỨC AUTHENTICATION ====================
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'olympia2026').trim();
const AUTH_SECRET =
  process.env.ADMIN_AUTH_SECRET || 'olympia-arena-btc-secret-key-2026';

interface AdminSessionPayload {
  username: string;
  role: 'ADMIN';
  displayName: string;
  iat: number;
}

function createSignedAdminToken(username: string): string {
  const payload: AdminSessionPayload = {
    username,
    role: 'ADMIN',
    displayName: 'Ban Tổ Chức Olympia',
    iat: Date.now(),
  };
  const base64Payload = Buffer.from(JSON.stringify(payload), 'utf8').toString(
    'base64url'
  );
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

function verifySignedAdminToken(token?: string | null): AdminSessionPayload | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [base64Payload, signature] = token.split('.');
  if (!base64Payload || !signature) return null;
  const expectedSig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(base64Payload)
    .digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(base64Payload, 'base64url').toString('utf8')
    ) as AdminSessionPayload;
    if (parsed && parsed.role === 'ADMIN') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function extractTokenFromReq(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const customHeader = req.headers['x-admin-token'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }
  if (typeof req.query.token === 'string' && req.query.token.trim()) {
    return req.query.token.trim();
  }
  return null;
}

function requireAdminAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = extractTokenFromReq(req);
  const session = verifySignedAdminToken(token);
  if (!session) {
    res.status(401).json({
      error:
        'Bạn cần đăng nhập tài khoản Ban Tổ Chức / Quản Trị Đề Thi để sử dụng chức năng này.',
      requireAuth: true,
    });
    return;
  }
  next();
}

const rooms = loadRoomsFromDisk();
const roomSockets = new Map<string, Set<WebSocket>>();

function generateRandomRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function updateConnectedCount(code: string, state: OlympiaRoomState) {
  const activeSockets = roomSockets.get(code);
  const localWsCount = activeSockets ? activeSockets.size : 0;
  const occupiedCount = state.seats.filter((s) =>
    Boolean(s.claimedByClientId)
  ).length;
  state.connectedClientsCount = Math.max(
    localWsCount,
    occupiedCount,
    state.connectedClientsCount || 0
  );
}

function ensureValidRoomDeck(code: string, room: OlympiaRoomState) {
  const ttQs = room.questionDeck?.tangTocQuestions;
  const hasLegacyUnshuffledTt =
    ttQs &&
    ttQs.length === 40 &&
    ttQs[0]?.id === 'tt-1' &&
    ttQs[1]?.id === 'tt-2' &&
    ttQs[2]?.id === 'tt-3' &&
    ttQs[3]?.id === 'tt-4';

  if (
    !room.questionDeck ||
    !ttQs ||
    ttQs.length < 4 ||
    hasLegacyUnshuffledTt
  ) {
    room.questionDeck = csvQuestionBank.buildRoomQuestionDeck({
      roomCode: code,
      deckSeed: `v-${room.version || 1}`,
      mode: room.questionDeck?.mode || 'CSV_RANDOM',
      season: room.questionDeck?.season,
      match: room.questionDeck?.match,
      subjectFilter: room.questionDeck?.subjectFilter,
    });
  }
}

function getOrCreateRoom(rawCode: string): OlympiaRoomState {
  const code = (rawCode || 'OLYMPIA').trim().toUpperCase();
  let room = rooms.get(code);
  if (!room) {
    room = createInitialRoomState(code);
    ensureValidRoomDeck(code, room);
    rooms.set(code, room);
  } else {
    ensureValidRoomDeck(code, room);
  }
  updateConnectedCount(code, room);
  return room;
}

function broadcastRoomState(
  roomCode: string,
  state: OlympiaRoomState,
  syncToCluster = true
) {
  const code = roomCode.trim().toUpperCase();
  ensureValidRoomDeck(code, state);
  updateConnectedCount(code, state);
  rooms.set(code, state);
  saveRoomsToDisk(rooms);

  if (syncToCluster) {
    publishRoomStateToCluster(code, state);
  }

  const clients = roomSockets.get(code);
  if (!clients) return;
  const payload = JSON.stringify({ type: 'ROOM_STATE', state });
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

// Initialize cross-instance cluster synchronization
initServerClusterSync({
  onRemoteState: (code, remoteState) => {
    const existing = rooms.get(code);
    const merged = existing
      ? mergeRoomStates(existing, remoteState)
      : remoteState;
    broadcastRoomState(code, merged, false);
  },
  onRemoteAction: (code, remoteAction) => {
    const current = getOrCreateRoom(code);
    const nextState = applyClientAction(current, remoteAction);
    const merged = mergeRoomStates(current, nextState);
    broadcastRoomState(code, merged, false);
  },
});

// Server-authoritative timer tick: tracks elapsed time on the server's own clock
// for each deadline token so client-server clock skew never cuts timers short at 3s.
const deadlineFirstSeenAt = new Map<string, number>();

setInterval(() => {
  const nowMs = Date.now();
  for (const [code, room] of rooms.entries()) {
    const activeSockets = roomSockets.get(code);
    if (!activeSockets || activeSockets.size === 0) continue;
    if (room.stage === 'LOBBY' || room.stage === 'GAME_OVER') continue;

    let deadlineToken: number | null = null;
    let durationMs = 0;

    if (room.stage === 'ROUND_1_KHOI_DONG' && room.round1.deadlineEpochMs) {
      deadlineToken = room.round1.deadlineEpochMs;
      durationMs = room.round1.subPhase === 'COMMON_BUZZ_OPEN' ? 10000 : 12000;
    } else if (
      room.stage === 'ROUND_2_VCNV' &&
      room.round2.deadlineEpochMs &&
      (room.round2.subPhase === 'ANSWERING_ROW' ||
        room.round2.subPhase === 'ANSWERING_CENTER')
    ) {
      deadlineToken = room.round2.deadlineEpochMs;
      durationMs = 15000;
    } else if (
      room.stage === 'ROUND_3_TANG_TOC' &&
      room.round3.deadlineEpochMs &&
      room.round3.subPhase === 'QUESTION_ACTIVE'
    ) {
      deadlineToken = room.round3.deadlineEpochMs;
      const r3Limits = [15000, 20000, 25000, 30000];
      durationMs = r3Limits[room.round3.qIndex] || 20000;
    } else if (room.stage === 'ROUND_4_VE_DICH' && room.round4.deadlineEpochMs) {
      deadlineToken = room.round4.deadlineEpochMs;
      if (room.round4.subPhase === 'STEAL_WINDOW') {
        durationMs = 5000;
      } else if (room.round4.subPhase === 'STEAL_ANSWERING') {
        durationMs = 12000;
      } else if (room.round4.subPhase === 'MAIN_ANSWERING') {
        const pts = room.round4.packagePoints[room.round4.qIndex] || 20;
        durationMs = pts === 20 ? 15000 : 20000;
      }
    }

    if (deadlineToken && durationMs > 0) {
      const tokenKey = `${code}:${room.stage}:${deadlineToken}`;
      let firstSeen = deadlineFirstSeenAt.get(tokenKey);
      if (!firstSeen) {
        firstSeen = nowMs;
        deadlineFirstSeenAt.set(tokenKey, firstSeen);
      }
      // Give a 1200ms grace buffer after full duration so the active client's local countdown reaches 0s smoothly
      if (nowMs - firstSeen >= durationMs + 1200) {
        deadlineFirstSeenAt.delete(tokenKey);
        const updated = applyClientAction(room, {
          type: 'SERVER_TIMER_EXPIRED',
          expectedDeadline: deadlineToken,
        });
        if (updated !== room) {
          broadcastRoomState(code, updated, true);
        }
      }
    }
  }
}, 400);

async function startServer() {
  const app = express();
  // Support large CSV uploads up to 60MB
  app.use(express.json({ limit: '60mb' }));
  app.use(
    express.text({
      type: ['text/csv', 'text/plain', 'application/csv'],
      limit: '60mb',
    })
  );

  // ==================== ADMIN / BAN TỔ CHỨC AUTH API ====================
  app.post('/api/auth/login', (req, res) => {
    const rawUser = String(req.body?.username || '')
      .trim()
      .toLowerCase();
    const rawPass = String(req.body?.password || '').trim();

    const isValidUser = rawUser === ADMIN_USERNAME || rawUser === 'btc';
    const isValidPass = rawPass === ADMIN_PASSWORD;

    if (!isValidUser || !isValidPass) {
      res.status(401).json({
        ok: false,
        error:
          'Tên đăng nhập hoặc mật khẩu Ban Tổ Chức không chính xác. Vui lòng kiểm tra lại!',
      });
      return;
    }

    const token = createSignedAdminToken(rawUser);
    res.json({
      ok: true,
      token,
      user: {
        username: rawUser,
        role: 'ADMIN',
        displayName: 'Ban Tổ Chức Olympia',
      },
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const token = extractTokenFromReq(req);
    const session = verifySignedAdminToken(token);
    if (!session) {
      res.json({ authenticated: false, user: null });
      return;
    }
    res.json({
      authenticated: true,
      user: {
        username: session.username,
        role: session.role,
        displayName: session.displayName,
      },
    });
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.json({ ok: true });
  });

  // ==================== CSV QUESTION BANK & CONVERTER BACKEND API ====================

  // 1. Get Question Bank Statistics (public summary count for header badge)
  app.get('/api/questions/stats', (_req, res) => {
    const stats = csvQuestionBank.getStats();
    res.json(stats);
  });

  // 2. Search, Filter & Paginate Converted Questions (Protected: Admin Only)
  app.get('/api/questions/search', requireAdminAuth, (req, res) => {
    const { q, season, match, round, subject, page, limit } = req.query;
    const result = csvQuestionBank.searchQuestions({
      q: typeof q === 'string' ? q : undefined,
      season: typeof season === 'string' ? season : undefined,
      match: typeof match === 'string' ? match : undefined,
      round: typeof round === 'string' ? round : undefined,
      subject: typeof subject === 'string' ? subject : undefined,
      page: Number(page) || 1,
      limit: Number(limit) || 25,
    });
    res.json(result);
  });

  // 3. Upload & Convert a Large CSV File into Olympia Question Data (Protected: Admin Only)
  app.post('/api/questions/upload-csv', requireAdminAuth, (req, res) => {
    try {
      let csvText = '';
      let fileName = 'uploaded_questions.csv';
      let mode: 'merge' | 'replace' = 'merge';

      if (typeof req.body === 'string') {
        csvText = req.body;
        fileName =
          (req.query.fileName as string) || 'uploaded_questions.csv';
        mode = req.query.mode === 'replace' ? 'replace' : 'merge';
      } else if (req.body && typeof req.body === 'object') {
        csvText = req.body.csvText || '';
        fileName = req.body.fileName || 'uploaded_questions.csv';
        mode = req.body.mode === 'replace' ? 'replace' : 'merge';
      }

      if (!csvText || !csvText.trim()) {
        res.status(400).json({
          error: 'Không tìm thấy nội dung CSV để chuyển đổi.',
        });
        return;
      }

      const report = csvQuestionBank.ingestCsvContent(
        csvText,
        fileName,
        mode,
        true
      );
      res.json({
        success: true,
        report,
        stats: csvQuestionBank.getStats(),
      });
    } catch (err) {
      res.status(400).json({
        error:
          err instanceof Error
            ? err.message
            : 'Lỗi khi phân tích và chuyển đổi file CSV.',
      });
    }
  });

  // 4. Reset Question Bank to Default 21,649 CSV Questions (Protected: Admin Only)
  app.post('/api/questions/reset-default', requireAdminAuth, (_req, res) => {
    const report = csvQuestionBank.resetToDefault();
    res.json({
      success: true,
      report,
      stats: csvQuestionBank.getStats(),
    });
  });

  // 5. Export Converted Questions as Structured JSON (Protected: Admin Only)
  app.get('/api/questions/export-json', requireAdminAuth, (req, res) => {
    const { season, match, round, limit } = req.query;
    const items = csvQuestionBank.exportQuestions({
      season: typeof season === 'string' ? season : undefined,
      match: typeof match === 'string' ? match : undefined,
      round: typeof round === 'string' ? round : undefined,
      limit: Number(limit) || 5000,
    });
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="olympia-questions-converted.json"'
    );
    res.send(JSON.stringify(items, null, 2));
  });

  // 5b. Export Questions in Standard 7-Column CSV Format (qid,season,match,round,subject,question,answer)
  app.get('/api/questions/export-csv', requireAdminAuth, (req, res) => {
    const { season, match, round, onlyNew } = req.query;
    const isOnlyNew = onlyNew === '1' || onlyNew === 'true';
    const csvContent = csvQuestionBank.exportQuestionsAsCsv({
      season: typeof season === 'string' ? season : undefined,
      match: typeof match === 'string' ? match : undefined,
      round: typeof round === 'string' ? round : undefined,
      onlyNew: isOnlyNew,
    });
    const filename = isOnlyNew
      ? 'olympia_new_questions.csv'
      : round
      ? `olympia_questions_${round}.csv`
      : 'olympia_questions_full_export.csv';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );
    res.send(csvContent);
  });

  // 6. Preview or Generate a Playable 4-Round Question Deck from the CSV Bank (Protected: Admin Only)
  app.post('/api/questions/build-deck', requireAdminAuth, (req, res) => {
    const { mode, season, match, subjectFilter } = req.body || {};
    const deck = csvQuestionBank.buildRoomQuestionDeck({
      mode: (mode as QuestionDeckMode) || 'CSV_RANDOM',
      season,
      match,
      subjectFilter,
    });
    res.json({ deck });
  });

  // ==================== REAL-TIME ROOMS API ====================

  // Create a brand new room with a random 6-char code and a fresh CSV question deck
  app.post('/api/rooms/create', async (req, res) => {
    await waitForClusterSync(300);
    let code = generateRandomRoomCode();
    while (rooms.has(code)) {
      code = generateRandomRoomCode();
    }
    const {
      name,
      school,
      clientId,
      deckMode,
      season,
      match,
      subjectFilter,
    } = req.body || {};
    const isAdmin = Boolean(verifySignedAdminToken(extractTokenFromReq(req)));
    let state = createInitialRoomState(code);
    state.questionDeck = csvQuestionBank.buildRoomQuestionDeck({
      roomCode: code,
      mode: isAdmin ? (deckMode as QuestionDeckMode) || 'CSV_RANDOM' : 'CSV_RANDOM',
      season: isAdmin ? season : undefined,
      match: isAdmin ? match : undefined,
      subjectFilter: isAdmin ? subjectFilter : undefined,
    });
    if (clientId) {
      state = applyClientAction(state, {
        type: 'JOIN_OR_CLAIM_SEAT',
        preferredPosition: 1,
        name: name || 'Nhà Leo Núi 1',
        school: school || 'THPT Chuyên',
        clientId,
        isCreatingRoom: true,
      });
    }
    broadcastRoomState(code, state, true);
    res.json({ roomCode: code, state });
  });

  // Create a 1-click Live Demo Match room with Seat 1 (User) + Seats 2, 3, 4 (Simulated Climbers)
  app.post('/api/rooms/create-demo', async (req, res) => {
    let code = generateRandomRoomCode();
    while (rooms.has(code)) {
      code = generateRandomRoomCode();
    }
    const {
      name,
      school,
      clientId,
      deckMode,
      season,
      match,
      subjectFilter,
    } = req.body || {};
    const isAdmin = Boolean(verifySignedAdminToken(extractTokenFromReq(req)));
    let state = createInitialRoomState(code);
    state.questionDeck = csvQuestionBank.buildRoomQuestionDeck({
      roomCode: code,
      mode: isAdmin ? (deckMode as QuestionDeckMode) || 'CSV_RANDOM' : 'CSV_RANDOM',
      season: isAdmin ? season : undefined,
      match: isAdmin ? match : undefined,
      subjectFilter: isAdmin ? subjectFilter : undefined,
    });
    state = applyClientAction(state, {
      type: 'START_DEMO_MATCH',
      name: name || 'Nguyễn Minh Quân',
      school: school || 'THPT Chuyên KHTN',
      clientId: clientId || 'demo-host',
    });
    broadcastRoomState(code, state, true);
    res.json({ roomCode: code, state });
  });

  // Select / Re-roll a new Question Deck for an existing room from the CSV Bank (Protected: Admin Only)
  app.post(
    '/api/rooms/:roomCode/select-deck',
    requireAdminAuth,
    async (req, res) => {
      const code = (req.params.roomCode || 'OLYMPIA').trim().toUpperCase();
      const current = getOrCreateRoom(code);
      const { mode, season, match, subjectFilter, clientId } = req.body || {};
      const deck = csvQuestionBank.buildRoomQuestionDeck({
        roomCode: code,
        deckSeed: `reroll-${Date.now()}`,
        mode: (mode as QuestionDeckMode) || 'CSV_RANDOM',
        season,
        match,
        subjectFilter,
      });
      const applied = applyClientAction(current, {
        type: 'SET_QUESTION_DECK',
        deck,
        clientId,
      });
      const nextState = mergeRoomStates(current, applied);
      broadcastRoomState(code, nextState, true);
      res.json({ state: nextState, deck });
    }
  );

  // Public endpoint for Solo Practice Mode (1 player, auto-graded, no MC required)
  app.post('/api/questions/practice-deck', (req, res) => {
    const { mode, season, match, subjectFilter } = req.body || {};
    const deck = csvQuestionBank.buildRoomQuestionDeck({
      roomCode: 'SOLO',
      deckSeed: `solo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      mode: (mode as QuestionDeckMode) || 'CSV_RANDOM',
      season: season || undefined,
      match: match || undefined,
      subjectFilter: subjectFilter || undefined,
    });
    res.json({ deck });
  });

  // Get room state
  app.get('/api/rooms/:roomCode', async (req, res) => {
    const code = (req.params.roomCode || 'OLYMPIA').trim().toUpperCase();
    if (!rooms.has(code)) {
      await waitForClusterSync(500);
    }
    const state = getOrCreateRoom(code);
    res.json({ state });
  });

  // Sync a full state snapshot from a client
  app.post('/api/rooms/:roomCode/sync', async (req, res) => {
    const code = (req.params.roomCode || 'OLYMPIA').trim().toUpperCase();
    const clientState = req.body?.state as OlympiaRoomState | undefined;
    if (!clientState || !clientState.roomCode) {
      res.status(400).json({ error: 'Invalid state' });
      return;
    }
    const existing = rooms.get(code);
    const merged = existing
      ? mergeRoomStates(existing, clientState)
      : clientState;
    broadcastRoomState(code, merged, true);
    res.json({ state: merged });
  });

  // Dispatch action via HTTP & broadcast over WS + Cluster
  app.post('/api/rooms/:roomCode/action', async (req, res) => {
    const code = (req.params.roomCode || 'OLYMPIA').trim().toUpperCase();
    if (!rooms.has(code)) {
      await waitForClusterSync(600);
    }
    const current = getOrCreateRoom(code);
    const action = req.body?.action as ClientAction;
    if (!action || !action.type) {
      res.status(400).json({ error: 'Invalid action' });
      return;
    }
    const applied = applyClientAction(current, action);
    if (applied !== current) {
      if (action.type === 'RESET_ROOM') {
        applied.questionDeck = csvQuestionBank.buildRoomQuestionDeck({
          roomCode: code,
          deckSeed: `reset-${applied.version}`,
          mode: current.questionDeck?.mode || 'CSV_RANDOM',
          season: current.questionDeck?.season,
          match: current.questionDeck?.match,
          subjectFilter: current.questionDeck?.subjectFilter,
        });
        broadcastRoomState(code, applied, true);
        res.json({ state: applied });
        return;
      }
      const nextState = mergeRoomStates(current, applied);
      broadcastRoomState(code, nextState, true);
      res.json({ state: nextState });
    } else {
      res.json({ state: current });
    }
  });

  const server = http.createServer(app);

  // Attach WebSocketServer at /ws-olympia
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const urlObj = new URL(request.url || '/', `http://${request.headers.host}`);
    if (urlObj.pathname === '/ws-olympia') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws, req) => {
    const urlObj = new URL(req.url || '/', `http://${req.headers.host}`);
    const currentRoomCode = (urlObj.searchParams.get('room') || 'OLYMPIA')
      .trim()
      .toUpperCase();

    if (!roomSockets.has(currentRoomCode)) {
      roomSockets.set(currentRoomCode, new Set());
    }
    roomSockets.get(currentRoomCode)!.add(ws);

    const existing = rooms.get(currentRoomCode);
    if (existing) {
      broadcastRoomState(currentRoomCode, existing, false);
    } else {
      waitForClusterSync(500).then(() => {
        const st = getOrCreateRoom(currentRoomCode);
        broadcastRoomState(currentRoomCode, st, false);
      });
    }

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(String(raw));
        if (msg.type === 'ACTION' && msg.action) {
          const targetCode = (msg.roomCode || currentRoomCode)
            .trim()
            .toUpperCase();
          const cur = getOrCreateRoom(targetCode);
          const actionObj = msg.action as ClientAction;
          const applied = applyClientAction(cur, actionObj);
          if (applied !== cur) {
            if (actionObj.type === 'RESET_ROOM') {
              applied.questionDeck = csvQuestionBank.buildRoomQuestionDeck({
                roomCode: targetCode,
                deckSeed: `reset-${applied.version}`,
                mode: cur.questionDeck?.mode || 'CSV_RANDOM',
                season: cur.questionDeck?.season,
                match: cur.questionDeck?.match,
                subjectFilter: cur.questionDeck?.subjectFilter,
              });
              broadcastRoomState(targetCode, applied, true);
            } else {
              const updated = mergeRoomStates(cur, applied);
              broadcastRoomState(targetCode, updated, true);
            }
          }
        } else if (msg.type === 'SYNC_STATE' && msg.state) {
          const targetCode = (msg.roomCode || currentRoomCode)
            .trim()
            .toUpperCase();
          const cur = rooms.get(targetCode);
          if (!cur || cur.stage === 'LOBBY') {
            const merged = cur
              ? mergeRoomStates(cur, msg.state as OlympiaRoomState)
              : (msg.state as OlympiaRoomState);
            broadcastRoomState(targetCode, merged, true);
          } else {
            broadcastRoomState(targetCode, cur, false);
          }
        }
      } catch {
        // ignore malformed ws message
      }
    });

    ws.on('close', () => {
      const set = roomSockets.get(currentRoomCode);
      if (set) {
        set.delete(ws);
      }
      const st = rooms.get(currentRoomCode);
      if (st) {
        broadcastRoomState(currentRoomCode, st, false);
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use('/src/assets', (req, res, next) => {
      if (req.url.includes('import')) {
        next();
        return;
      }
      express.static(path.join(__dirname, 'src/assets'))(req, res, next);
    });
    app.use(vite.middlewares);
  } else {
    app.use('/src/assets', express.static(path.join(__dirname, 'src/assets')));
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Olympia Real-time Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
