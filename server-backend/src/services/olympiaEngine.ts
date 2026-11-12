import type {
  OlympiaRoomState,
  ClientAction,
  ClimberSeat,
  RoomStage,
  Round2RowEvalItem,
} from "../types/olympia.js";
import {
  KHOI_DONG_PERSONAL_QUESTIONS,
  KHOI_DONG_COMMON_QUESTIONS,
  OBSTACLE_PUZZLES,
  TANG_TOC_QUESTIONS,
  VE_DICH_20_QUESTIONS,
  VE_DICH_30_QUESTIONS,
  TIE_BREAKER_QUESTIONS,
  isAnswerMatch,
} from "./olympiaQuestions.js";
import type { FinishQuestion } from "./olympiaQuestions.js";

/**
 * Shuffle array using Fisher-Yates algorithm for random question selection
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random questions from a pool
 */
function getRandomQuestions<T>(pool: T[], count: number): T[] {
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, Math.min(count, pool.length));
}

/**
 * Create initial room state with server-provided questions (reduces client bundle)
 * @param roomCode Room code
 * @param personalQuestions 24 personal questions (6 per player)
 * @param commonQuestions 12 common questions
 * @param tangTocQuestions 20 Tăng Tốc questions
 */
export function createInitialRoomStateWithQuestions(
  roomCode: string,
  personalQuestions: any[],
  commonQuestions: any[],
  tangTocQuestions: any[],
): OlympiaRoomState {
  const defaultSeats: [ClimberSeat, ClimberSeat, ClimberSeat, ClimberSeat] = [
    {
      position: 1,
      name: "Chưa có thí sinh",
      school: "Đang chờ vào vị trí 1...",
      claimedByClientId: null,
      isReady: false,
      score: 0,
      vcnvLocked: false,
      starUsed: false,
    },
    {
      position: 2,
      name: "Chưa có thí sinh",
      school: "Đang chờ vào vị trí 2...",
      claimedByClientId: null,
      isReady: false,
      score: 0,
      vcnvLocked: false,
      starUsed: false,
    },
    {
      position: 3,
      name: "Chưa có thí sinh",
      school: "Đang chờ vào vị trí 3...",
      claimedByClientId: null,
      isReady: false,
      score: 0,
      vcnvLocked: false,
      starUsed: false,
    },
    {
      position: 4,
      name: "Chưa có thí sinh",
      school: "Đang chờ vào vị trí 4...",
      claimedByClientId: null,
      isReady: false,
      score: 0,
      vcnvLocked: false,
      starUsed: false,
    },
  ];

  return {
    roomCode: roomCode.toUpperCase(),
    version: 1,
    updatedAt: Date.now(),
    creatorClientId: null,
    hostClientId: null,
    connectedClientsCount: 0,
    leftClientIds: {},
    seatUpdatedAt: {},
    stage: "LOBBY",
    allowSharedDeviceControl: false,
    seats: defaultSeats,
    logs: [],
    questions: {
      round1Personal: personalQuestions,
      round1Common: commonQuestions,
      round3: tangTocQuestions,
    },
    round1: {
      subPhase: "PERSONAL_READY",
      activePosition: 1,
      personalQIndex: 0,
      commonQIndex: 0,
      buzzedPosition: null,
      deadlineEpochMs: null,
      personalHistory: [],
      lastFeedback: null,
    },
    round2: {
      puzzleIndex: 0,
      subPhase: "SELECT_ROW",
      selectorPosition: 1,
      activeRowId: null,
      openedRowCount: 0,
      rowStatuses: {
        1: "UNOPENED",
        2: "UNOPENED",
        3: "UNOPENED",
        4: "UNOPENED",
      },
      centerStatus: "UNOPENED",
      rowSubmissions: {},
      cnvBuzzerPosition: null,
      deadlineEpochMs: null,
      lastFeedback: null,
      lastRowEvaluation: null,
      cnvWinner: null,
    },
    round3: {
      subPhase: "INTRO",
      qIndex: 0,
      questionStartEpochMs: 0,
      deadlineEpochMs: null,
      submissions: {},
      rankedResults: [],
    },
    round4: {
      subPhase: "SELECT_PACKAGE",
      turnOrder: [1, 2, 3, 4],
      turnIndex: 0,
      activePosition: 1,
      packagePoints: [20, 20, 30],
      questionIds: ["vd20-1", "vd20-2", "vd30-1"],
      qIndex: 0,
      starActiveThisQ: false,
      stealerPosition: null,
      deadlineEpochMs: null,
      mainSubmittedAnswer: null,
      stealSubmittedAnswer: null,
      lastResult: null,
      used20Ids: [],
      used30Ids: [],
    },
    tieBreaker: {
      tiedPositions: [],
      subPhase: "BUZZ_OPEN",
      buzzedPosition: null,
      deadlineEpochMs: null,
      lastFeedback: null,
    },
  };
}

/**
 * Legacy function for backward compatibility (uses client-side CSV import)
 * @deprecated Use createInitialRoomStateWithQuestions for better performance
 */

/**
 * Legacy function - creates empty room state without questions
 * @deprecated For production, use createInitialRoomStateWithQuestions() with server-provided questions
 * This version doesn't import CSV files (keeps bundle small) but also has no questions
 */
export function createInitialRoomState(roomCode: string): OlympiaRoomState {
  // Create empty room state without CSV imports (to keep bundle small)
  // Questions will be provided by server when room is created via API
  return createInitialRoomStateWithQuestions(
    roomCode,
    [], // Empty personal questions - will be filled by server
    [], // Empty common questions - will be filled by server
    [], // Empty Tăng Tốc questions - will be filled by server
  );
}

const STAGE_RANK: Record<RoomStage, number> = {
  LOBBY: 0,
  ROUND_1_KHOI_DONG: 1,
  ROUND_2_VCNV: 2,
  ROUND_3_TANG_TOC: 3,
  ROUND_4_VE_DICH: 4,
  TIE_BREAKER: 5,
  GAME_OVER: 6,
};

export function mergeRoomStates(
  local: OlympiaRoomState,
  incoming: OlympiaRoomState,
): OlympiaRoomState {
  if (!local) return JSON.parse(JSON.stringify(incoming));
  if (!incoming) return JSON.parse(JSON.stringify(local));

  // Preserve questions from either state (server provides questions, Pusher doesn't)
  const preservedQuestions = incoming.questions || local.questions;

  const resolvedCreator =
    local.creatorClientId ||
    incoming.creatorClientId ||
    local.seats?.[0]?.claimedByClientId ||
    incoming.seats?.[0]?.claimedByClientId ||
    null;

  const ensureHostIntegrity = (st: OlympiaRoomState): OlympiaRoomState => {
    const copy: OlympiaRoomState = JSON.parse(JSON.stringify(st));
    const creator =
      resolvedCreator ||
      copy.seats?.[0]?.claimedByClientId ||
      copy.hostClientId ||
      null;
    copy.creatorClientId = creator;
    copy.hostClientId = creator;
    // Preserve questions during merge
    if (preservedQuestions && !copy.questions) {
      copy.questions = preservedQuestions;
    }
    return copy;
  };

  const localRank = STAGE_RANK[local.stage] ?? 0;
  const incomingRank = STAGE_RANK[incoming.stage] ?? 0;

  if (incomingRank > localRank) {
    return ensureHostIntegrity(incoming);
  }
  if (localRank > incomingRank) {
    return ensureHostIntegrity(local);
  }

  // If already in an active competition round, take whichever snapshot has higher version or newer updatedAt
  if (local.stage !== "LOBBY") {
    const localVer = local.version || 0;
    const incomingVer = incoming.version || 0;
    if (incomingVer > localVer) {
      return ensureHostIntegrity(incoming);
    }
    if (
      incomingVer === localVer &&
      (incoming.updatedAt || 0) >= (local.updatedAt || 0)
    ) {
      return ensureHostIntegrity(incoming);
    }
    return ensureHostIntegrity(local);
  }

  // Both states are in LOBBY: merge all active players into seats 1..4 without dropping anyone
  const base: OlympiaRoomState = JSON.parse(
    JSON.stringify(
      (incoming.updatedAt || 0) >= (local.updatedAt || 0) ? incoming : local,
    ),
  );

  const mergedLeft: Record<string, number> = {
    ...(local.leftClientIds || {}),
  };
  for (const [cid, ts] of Object.entries(incoming.leftClientIds || {})) {
    mergedLeft[cid] = Math.max(mergedLeft[cid] || 0, ts);
  }

  // Preserve earliest join timestamp for each player so seat order never flips across nodes
  const mergedSeatUpdated: Record<string, number> = {
    ...(local.seatUpdatedAt || {}),
  };
  for (const [cid, ts] of Object.entries(incoming.seatUpdatedAt || {})) {
    if (!mergedSeatUpdated[cid]) {
      mergedSeatUpdated[cid] = ts;
    } else if (ts > 0) {
      mergedSeatUpdated[cid] = Math.min(mergedSeatUpdated[cid], ts);
    }
  }

  const creatorClientId = resolvedCreator;

  interface CandidatePlayer {
    clientId: string;
    name: string;
    school: string;
    desiredPosition: 1 | 2 | 3 | 4;
    updatedAt: number;
  }

  const playerMap = new Map<string, CandidatePlayer>();

  const inspectStateSeats = (st: OlympiaRoomState) => {
    const stSeatTs = st.seatUpdatedAt || {};
    for (const s of st.seats) {
      if (!s.claimedByClientId) continue;
      const cid = s.claimedByClientId;
      const claimTs =
        mergedSeatUpdated[cid] || stSeatTs[cid] || st.updatedAt || 1;
      const leftTs = mergedLeft[cid] || 0;
      if (leftTs > claimTs) {
        continue;
      }
      const existing = playerMap.get(cid);
      if (!existing || s.position >= existing.desiredPosition) {
        playerMap.set(cid, {
          clientId: cid,
          name: s.name,
          school: s.school,
          desiredPosition:
            cid === creatorClientId
              ? 1
              : s.position === 1 && creatorClientId && cid !== creatorClientId
                ? 2
                : s.position,
          updatedAt: claimTs,
        });
      }
    }
  };

  inspectStateSeats(local);
  inspectStateSeats(incoming);

  const orderedPlayers = Array.from(playerMap.values()).sort((a, b) => {
    const aIsCreator = a.clientId === creatorClientId ? 1 : 0;
    const bIsCreator = b.clientId === creatorClientId ? 1 : 0;
    if (aIsCreator !== bIsCreator) return bIsCreator - aIsCreator;
    if (a.updatedAt !== b.updatedAt) {
      return a.updatedAt - b.updatedAt;
    }
    return a.clientId.localeCompare(b.clientId);
  });

  const newSeats: [ClimberSeat, ClimberSeat, ClimberSeat, ClimberSeat] = [
    1, 2, 3, 4,
  ].map((pos) => ({
    position: pos as 1 | 2 | 3 | 4,
    name: "Chưa có thí sinh",
    school: `Đang chờ vào vị trí ${pos}...`,
    claimedByClientId: null,
    isReady: false,
    score: 0,
    vcnvLocked: false,
    starUsed: false,
  })) as [ClimberSeat, ClimberSeat, ClimberSeat, ClimberSeat];

  for (const p of orderedPlayers) {
    if (newSeats.every((s) => Boolean(s.claimedByClientId))) break;
    if (p.clientId === creatorClientId) {
      const s1 = newSeats[0];
      s1.claimedByClientId = p.clientId;
      s1.name = p.name;
      s1.school = p.school;
      s1.isReady = true;
      continue;
    }
    // Non-creator players go deterministically into Seats 2, 3, 4 in join order
    const target =
      newSeats.slice(1).find((s) => !s.claimedByClientId) ||
      newSeats.find((s) => !s.claimedByClientId);
    if (target) {
      target.claimedByClientId = p.clientId;
      target.name = p.name;
      target.school = p.school;
      target.isReady = true;
    }
  }

  const hostClientId =
    creatorClientId || newSeats[0]?.claimedByClientId || null;

  const seenLogs = new Set<string>();
  const mergedLogs = [...(incoming.logs || []), ...(local.logs || [])].filter(
    (item) => {
      const key = `${item.round}|${item.text}`;
      if (seenLogs.has(key)) return false;
      seenLogs.add(key);
      return true;
    },
  );
  mergedLogs.length = Math.min(mergedLogs.length, 80);

  const occupiedCount = newSeats.filter((s) =>
    Boolean(s.claimedByClientId),
  ).length;

  base.creatorClientId = hostClientId;
  base.hostClientId = hostClientId;
  base.leftClientIds = mergedLeft;
  base.seatUpdatedAt = mergedSeatUpdated;
  base.seats = newSeats;
  base.logs = mergedLogs;
  base.allowSharedDeviceControl = false;
  base.version = Math.max(local.version || 1, incoming.version || 1);
  base.updatedAt = Math.max(local.updatedAt || 0, incoming.updatedAt || 0);
  base.connectedClientsCount = Math.max(
    local.connectedClientsCount || 0,
    incoming.connectedClientsCount || 0,
    occupiedCount,
  );

  return base;
}

function addRoomLog(
  state: OlympiaRoomState,
  round: string,
  text: string,
  delta?: string,
) {
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);
  state.logs.unshift({
    id: `log-${Date.now()}-${Math.random()}`,
    timestamp: timeStr,
    round,
    text,
    delta,
  });
  if (state.logs.length > 80) {
    state.logs.length = 80;
  }
}

export function getFinishQuestionById(id: string): FinishQuestion {
  const found20 = VE_DICH_20_QUESTIONS.find((q) => q.id === id);
  if (found20) return found20;
  const found30 = VE_DICH_30_QUESTIONS.find((q) => q.id === id);
  if (found30) return found30;
  return VE_DICH_20_QUESTIONS[0];
}

export function getCnvRewardPoints(r2: OlympiaRoomState["round2"]): number {
  if (
    r2.subPhase === "ANSWERING_CENTER" ||
    r2.subPhase === "FINAL_15S" ||
    r2.centerStatus !== "UNOPENED"
  ) {
    return 20;
  }
  if (r2.openedRowCount <= 1) return 60;
  if (r2.openedRowCount === 2) return 50;
  if (r2.openedRowCount === 3) return 40;
  return 30;
}

/**
 * Strictly verifies that the client dispatching a seat-specific action actually owns that seat.
 */
function canClientControlSeat(
  state: OlympiaRoomState,
  pos: 1 | 2 | 3 | 4,
  clientId?: string,
): boolean {
  if (!clientId) return true; // server internal timer
  const seat = state.seats[pos - 1];
  if (!seat || !seat.claimedByClientId) return false;
  return seat.claimedByClientId === clientId;
}

/**
 * Strictly verifies that only the designated room Host (Position 1 / Room Creator) can trigger MC-coordination actions.
 */
function isHostClient(state: OlympiaRoomState, clientId?: string): boolean {
  if (!clientId) return true; // server internal timer
  const expectedHost =
    state.creatorClientId ||
    state.seats[0]?.claimedByClientId ||
    state.hostClientId;
  if (!expectedHost) return false;
  if (
    state.seats[0]?.claimedByClientId &&
    state.seats[0].claimedByClientId !== clientId
  ) {
    return false;
  }
  return clientId === expectedHost;
}

export function applyClientAction(
  currentState: OlympiaRoomState,
  action: ClientAction,
): OlympiaRoomState {
  // 1. Deduplicate repeated action deliveries by actionId
  if (
    action.actionId &&
    currentState.processedActionIds &&
    currentState.processedActionIds.includes(action.actionId)
  ) {
    return currentState;
  }

  const state: OlympiaRoomState = JSON.parse(JSON.stringify(currentState));
  const nowMs = Date.now();
  state.version = (currentState.version || 1) + 1;
  state.updatedAt = nowMs;
  if (!state.leftClientIds) state.leftClientIds = {};
  if (!state.seatUpdatedAt) state.seatUpdatedAt = {};
  if (!state.processedActionIds) state.processedActionIds = [];
  if (action.actionId) {
    state.processedActionIds.push(action.actionId);
    if (state.processedActionIds.length > 120) {
      state.processedActionIds = state.processedActionIds.slice(-120);
    }
  }
  if (state.round1 && !state.round1.personalHistory) {
    state.round1.personalHistory = [];
  }

  switch (action.type) {
    case "JOIN_OR_CLAIM_SEAT": {
      if (action.isCreatingRoom) {
        state.creatorClientId = action.clientId;
        state.hostClientId = action.clientId;
      }

      delete state.leftClientIds[action.clientId];
      if (!state.seatUpdatedAt[action.clientId]) {
        state.seatUpdatedAt[action.clientId] = nowMs;
      }

      const existingSeat = state.seats.find(
        (s) => s.claimedByClientId === action.clientId,
      );

      if (existingSeat && !action.preferredPosition) {
        existingSeat.name =
          action.name.trim() || `Nhà Leo Núi ${existingSeat.position}`;
        existingSeat.school = action.school.trim() || "THPT Chuyên";
        existingSeat.isReady = true;
        return state;
      }

      let targetSeat = action.preferredPosition
        ? state.seats[action.preferredPosition - 1]
        : undefined;

      if (action.isCreatingRoom) {
        targetSeat = state.seats[0];
      } else if (
        !targetSeat ||
        targetSeat.position === 1 ||
        (targetSeat.claimedByClientId &&
          targetSeat.claimedByClientId !== action.clientId)
      ) {
        // Reserve Seat 1 for the Room Creator; joining players take Seats 2, 3, or 4
        targetSeat =
          state.seats.slice(1).find((s) => !s.claimedByClientId) ||
          state.seats.find((s) => !s.claimedByClientId);
      }

      if (targetSeat) {
        if (existingSeat && existingSeat.position !== targetSeat.position) {
          existingSeat.claimedByClientId = null;
          existingSeat.isReady = false;
          existingSeat.name = "Chưa có thí sinh";
          existingSeat.school = `Đang chờ vào vị trí ${existingSeat.position}...`;
        }

        targetSeat.claimedByClientId = action.clientId;
        targetSeat.isReady = true;
        targetSeat.name =
          action.name.trim() || `Nhà Leo Núi ${targetSeat.position}`;
        targetSeat.school = action.school.trim() || "THPT Chuyên";

        if (targetSeat.position === 1 && !state.creatorClientId) {
          state.creatorClientId = action.clientId;
          state.hostClientId = action.clientId;
        }

        const count = state.seats.filter((s) =>
          Boolean(s.claimedByClientId),
        ).length;
        addRoomLog(
          state,
          "Phòng chờ",
          `${targetSeat.name} (${targetSeat.school}) đã vào Vị trí số ${targetSeat.position} (${count}/4 người).`,
        );
      }
      return state;
    }

    case "CLAIM_SEAT": {
      // Do not allow non-creator to claim Seat 1 (Host position)
      if (
        action.position === 1 &&
        state.creatorClientId &&
        action.clientId !== state.creatorClientId
      ) {
        return currentState;
      }

      const seat = state.seats[action.position - 1];
      if (!seat) return currentState;
      // Do not allow overwriting another player's occupied seat
      if (
        seat.claimedByClientId &&
        seat.claimedByClientId !== action.clientId
      ) {
        return currentState;
      }

      delete state.leftClientIds[action.clientId];
      if (!state.seatUpdatedAt[action.clientId]) {
        state.seatUpdatedAt[action.clientId] = nowMs;
      }

      // Free any previous seat held by this clientId (1 player = 1 seat)
      state.seats.forEach((s) => {
        if (
          s.claimedByClientId === action.clientId &&
          s.position !== action.position
        ) {
          s.claimedByClientId = null;
          s.isReady = false;
          s.name = "Chưa có thí sinh";
          s.school = `Đang chờ vào vị trí ${s.position}...`;
        }
      });

      seat.name = action.name.trim() || `Nhà Leo Núi ${action.position}`;
      seat.school = action.school.trim() || "THPT Chuyên";
      seat.claimedByClientId = action.clientId;
      seat.isReady = true;

      const count = state.seats.filter((s) =>
        Boolean(s.claimedByClientId),
      ).length;
      addRoomLog(
        state,
        "Phòng chờ",
        `${seat.name} (${seat.school}) đã nhận Vị trí số ${action.position} (${count}/4 người).`,
      );
      return state;
    }

    case "UPDATE_SEAT_INFO": {
      const seat = state.seats[action.position - 1];
      if (!seat) return currentState;
      if (
        action.clientId &&
        seat.claimedByClientId &&
        seat.claimedByClientId !== action.clientId
      ) {
        return currentState;
      }
      seat.name = action.name.trim() || `Nhà Leo Núi ${action.position}`;
      seat.school = action.school.trim() || "THPT Chuyên";
      return state;
    }

    case "LEAVE_SEAT": {
      const seat = state.seats[action.position - 1];
      if (!seat) return currentState;
      if (
        action.clientId &&
        seat.claimedByClientId &&
        seat.claimedByClientId !== action.clientId
      ) {
        return currentState;
      }
      const oldName = seat.name;
      const leavingClientId = seat.claimedByClientId || action.clientId;
      if (leavingClientId) {
        state.leftClientIds[leavingClientId] = nowMs;
      }
      seat.claimedByClientId = null;
      seat.isReady = false;
      seat.name = "Chưa có thí sinh";
      seat.school = `Đang chờ vào vị trí ${action.position}...`;

      if (state.hostClientId === action.clientId) {
        const nextOccupied = state.seats.find((s) =>
          Boolean(s.claimedByClientId),
        );
        state.hostClientId = nextOccupied
          ? nextOccupied.claimedByClientId
          : null;
        state.creatorClientId = state.hostClientId;
      }

      const count = state.seats.filter((s) =>
        Boolean(s.claimedByClientId),
      ).length;
      addRoomLog(
        state,
        "Phòng chờ",
        `${oldName} đã rời khỏi Vị trí số ${action.position} (${count}/4 người).`,
      );
      return state;
    }

    case "TOGGLE_SHARED_CONTROL": {
      state.allowSharedDeviceControl = false;
      return state;
    }

    case "RESET_ROOM": {
      const fresh = createInitialRoomState(state.roomCode);
      fresh.creatorClientId = state.creatorClientId;
      fresh.hostClientId = state.hostClientId;
      fresh.connectedClientsCount = state.connectedClientsCount;
      fresh.seatUpdatedAt = state.seatUpdatedAt;
      fresh.leftClientIds = state.leftClientIds;
      fresh.version = (state.version || 1) + 1;
      fresh.updatedAt = nowMs;
      fresh.seats = state.seats.map((s) => ({
        ...s,
        score: 0,
        vcnvLocked: false,
        starUsed: false,
      })) as [ClimberSeat, ClimberSeat, ClimberSeat, ClimberSeat];
      fresh.allowSharedDeviceControl = false;
      return fresh;
    }

    case "FILL_DEMO_BOTS": {
      const demoProfiles: Record<
        1 | 2 | 3 | 4,
        { name: string; school: string }
      > = {
        1: { name: "Nguyễn Minh Quân", school: "THPT Chuyên KHTN" },
        2: { name: "Trần Hoàng Bảo", school: "THPT Chuyên Hà Nội - Amsterdam" },
        3: { name: "Lê Ngọc Minh Châu", school: "THPT Chuyên Quốc Học Huế" },
        4: { name: "Phạm Đức Duy", school: "THPT Chuyên Lê Hồng Phong" },
      };

      state.seats.forEach((s) => {
        if (!s.claimedByClientId) {
          const botId = `BOT_SIM_${s.position}`;
          const prof = demoProfiles[s.position];
          s.claimedByClientId = botId;
          s.name = prof.name;
          s.school = prof.school;
          s.isReady = true;
          state.seatUpdatedAt![botId] = nowMs;
          delete state.leftClientIds![botId];
        }
      });

      addRoomLog(
        state,
        "Chế độ Demo",
        "Đã bổ sung các Nhà Leo Núi giả lập tự động vào đủ 4/4 vị trí xuất phát!",
      );
      return state;
    }

    case "START_DEMO_MATCH": {
      state.creatorClientId = action.clientId;
      state.hostClientId = action.clientId;
      state.allowSharedDeviceControl = false;

      const demoSeats: [ClimberSeat, ClimberSeat, ClimberSeat, ClimberSeat] = [
        {
          position: 1,
          name: action.name.trim() || "Nguyễn Minh Quân",
          school: action.school.trim() || "THPT Chuyên KHTN",
          claimedByClientId: action.clientId,
          isReady: true,
          score: 0,
          vcnvLocked: false,
          starUsed: false,
        },
        {
          position: 2,
          name: "Trần Hoàng Bảo",
          school: "THPT Chuyên Hà Nội - Amsterdam",
          claimedByClientId: "BOT_SIM_2",
          isReady: true,
          score: 0,
          vcnvLocked: false,
          starUsed: false,
        },
        {
          position: 3,
          name: "Lê Ngọc Minh Châu",
          school: "THPT Chuyên Quốc Học Huế",
          claimedByClientId: "BOT_SIM_3",
          isReady: true,
          score: 0,
          vcnvLocked: false,
          starUsed: false,
        },
        {
          position: 4,
          name: "Phạm Đức Duy",
          school: "THPT Chuyên Lê Hồng Phong",
          claimedByClientId: "BOT_SIM_4",
          isReady: true,
          score: 0,
          vcnvLocked: false,
          starUsed: false,
        },
      ];
      state.seats = demoSeats;
      state.seatUpdatedAt = {
        [action.clientId]: nowMs,
        BOT_SIM_2: nowMs,
        BOT_SIM_3: nowMs,
        BOT_SIM_4: nowMs,
      };
      state.leftClientIds = {};
      state.stage = "ROUND_1_KHOI_DONG";
      state.round1 = {
        subPhase: "PERSONAL_READY",
        activePosition: 1,
        personalQIndex: 0,
        commonQIndex: 0,
        buzzedPosition: null,
        deadlineEpochMs: null,
        personalHistory: [],
        lastFeedback: null,
      };
      addRoomLog(
        state,
        "Chế độ Demo",
        `Khởi tạo trận đấu Demo: ${demoSeats[0].name} (Vị trí 1) cùng 3 Nhà Leo Núi tự động bước vào Phần 1: Khởi Động!`,
      );
      return state;
    }

    case "START_MATCH": {
      if (!isHostClient(state, action.clientId)) {
        return currentState;
      }
      const occupiedCount = state.seats.filter((s) =>
        Boolean(s.claimedByClientId),
      ).length;
      if (state.stage === "LOBBY" && occupiedCount < 4) {
        addRoomLog(
          state,
          "Hệ thống",
          `Chưa thể bắt đầu! Phòng hiện mới có ${occupiedCount}/4 Nhà Leo Núi.`,
        );
        return currentState;
      }

      const target = action.targetStage || "ROUND_1_KHOI_DONG";

      // STRICT ROUND PROGRESSION LOCK: Do not allow skipping a round before finishing the current round!
      if (state.stage === "LOBBY" && target !== "ROUND_1_KHOI_DONG") {
        return currentState;
      }
      if (state.stage === "ROUND_1_KHOI_DONG") {
        if (
          target !== "ROUND_2_VCNV" ||
          state.round1.subPhase !== "ROUND_SUMMARY"
        ) {
          return currentState;
        }
      }
      if (state.stage === "ROUND_2_VCNV") {
        if (
          target !== "ROUND_3_TANG_TOC" ||
          (state.round2.subPhase !== "ROUND_SUMMARY" &&
            state.round2.subPhase !== "FINAL_15S")
        ) {
          return currentState;
        }
      }
      if (state.stage === "ROUND_3_TANG_TOC") {
        if (
          target !== "ROUND_4_VE_DICH" ||
          state.round3.subPhase !== "QUESTION_RESULT" ||
          state.round3.qIndex < 3
        ) {
          return currentState;
        }
      }
      if (state.stage === "ROUND_4_VE_DICH") {
        return currentState;
      }

      state.stage = target;
      if (target === "ROUND_1_KHOI_DONG") {
        state.round1 = {
          subPhase: "PERSONAL_READY",
          activePosition: 1,
          personalQIndex: 0,
          commonQIndex: 0,
          buzzedPosition: null,
          deadlineEpochMs: null,
          personalHistory: [],
          lastFeedback: null,
        };
      } else if (target === "ROUND_2_VCNV") {
        state.seats.forEach((s) => (s.vcnvLocked = false));
        state.round2 = {
          ...state.round2,
          subPhase: "SELECT_ROW",
          selectorPosition: 1,
          activeRowId: null,
          openedRowCount: 0,
          rowStatuses: {
            1: "UNOPENED",
            2: "UNOPENED",
            3: "UNOPENED",
            4: "UNOPENED",
          },
          centerStatus: "UNOPENED",
          rowSubmissions: {},
          cnvBuzzerPosition: null,
          deadlineEpochMs: null,
          lastFeedback: null,
          lastRowEvaluation: null,
          cnvWinner: null,
        };
      } else if (target === "ROUND_3_TANG_TOC") {
        state.round3 = {
          subPhase: "INTRO",
          qIndex: 0,
          questionStartEpochMs: 0,
          deadlineEpochMs: null,
          submissions: {},
          rankedResults: [],
        };
      } else if (target === "ROUND_4_VE_DICH") {
        state.seats.forEach((s) => (s.starUsed = false));
        state.round4 = {
          subPhase: "SELECT_PACKAGE",
          turnOrder: [1, 2, 3, 4],
          turnIndex: 0,
          activePosition: 1,
          packagePoints: [20, 20, 30],
          questionIds: ["vd20-1", "vd20-2", "vd30-1"],
          qIndex: 0,
          starActiveThisQ: false,
          stealerPosition: null,
          deadlineEpochMs: null,
          mainSubmittedAnswer: null,
          stealSubmittedAnswer: null,
          lastResult: null,
          used20Ids: [],
          used30Ids: [],
        };
      }
      addRoomLog(state, "Hệ thống", `Bắt đầu phần thi: ${target}`);
      return state;
    }

    // ==================== SERVER AUTHORITATIVE TIMER EXPIRATION ====================
    case "SERVER_TIMER_EXPIRED": {
      return handleServerTimerExpired(
        state,
        currentState,
        nowMs,
        action.expectedDeadline,
      );
    }

    // ==================== ROUND 1: KHỞI ĐỘNG ====================
    case "R1_START_PERSONAL_TURN": {
      if (state.round1.subPhase !== "PERSONAL_READY") return currentState;
      const curPos = state.round1.activePosition;
      const isCurSeatBot = Boolean(
        state.seats[curPos - 1]?.claimedByClientId?.startsWith("BOT_SIM_"),
      );
      const isAuthorized =
        canClientControlSeat(state, curPos, action.clientId) ||
        (isCurSeatBot && isHostClient(state, action.clientId));
      if (!isAuthorized) {
        return currentState;
      }
      state.round1.subPhase = "PERSONAL_ACTIVE";
      state.round1.personalQIndex = 0;
      state.round1.personalHistory = [];
      state.round1.lastFeedback = null;
      state.round1.deadlineEpochMs = nowMs + 12000;
      return state;
    }

    case "R1_SUBMIT_PERSONAL": {
      if (state.round1.subPhase !== "PERSONAL_ACTIVE") return currentState;
      const pos = state.round1.activePosition;
      const isCurSeatBot = Boolean(
        state.seats[pos - 1]?.claimedByClientId?.startsWith("BOT_SIM_"),
      );
      const isAuthorized =
        canClientControlSeat(state, pos, action.clientId) ||
        (isCurSeatBot && isHostClient(state, action.clientId));
      if (action.position !== pos || !isAuthorized) {
        return currentState;
      }
      // Idempotency guard: prevent one answer submission from applying to subsequent questions!
      if (
        action.qIndex !== undefined &&
        action.qIndex !== state.round1.personalQIndex
      ) {
        return currentState;
      }
      return gradeRound1PersonalQuestion(state, action.answer, nowMs);
    }

    case "R1_NEXT_PERSONAL_CLIMBER": {
      if (state.round1.subPhase !== "PERSONAL_TURN_DONE") return currentState;
      const curPos = state.round1.activePosition;
      const isCurSeatBot = Boolean(
        state.seats[curPos - 1]?.claimedByClientId?.startsWith("BOT_SIM_"),
      );
      const isAuthorized =
        canClientControlSeat(state, curPos, action.clientId) ||
        (isCurSeatBot && isHostClient(state, action.clientId));
      if (!isAuthorized) {
        return currentState;
      }
      if (
        action.fromPosition !== undefined &&
        action.fromPosition !== state.round1.activePosition
      ) {
        return currentState;
      }
      if (state.round1.activePosition < 4) {
        state.round1.activePosition = (state.round1.activePosition + 1) as
          | 1
          | 2
          | 3
          | 4;
        state.round1.personalQIndex = 0;
        state.round1.personalHistory = [];
        state.round1.lastFeedback = null;
        state.round1.subPhase = "PERSONAL_READY";
      } else {
        state.round1.subPhase = "COMMON_INTRO";
        state.round1.commonQIndex = 0;
        state.round1.buzzedPosition = null;
        state.round1.lastFeedback = null;
      }
      return state;
    }

    case "R1_START_COMMON_QUESTION": {
      if (state.round1.subPhase !== "COMMON_INTRO") return currentState;
      if (!isHostClient(state, action.clientId)) return currentState;
      state.round1.subPhase = "COMMON_BUZZ_OPEN";
      state.round1.buzzedPosition = null;
      state.round1.lastFeedback = null;
      state.round1.deadlineEpochMs = nowMs + 10000;
      return state;
    }

    case "R1_BUZZ_COMMON": {
      if (
        state.round1.subPhase !== "COMMON_BUZZ_OPEN" ||
        state.round1.buzzedPosition !== null
      ) {
        return currentState;
      }
      const isBotSeat = Boolean(
        state.seats[action.position - 1]?.claimedByClientId?.startsWith(
          "BOT_SIM_",
        ),
      );
      const isAuthorized =
        canClientControlSeat(state, action.position, action.clientId) ||
        (isBotSeat && isHostClient(state, action.clientId));
      if (!isAuthorized) {
        return currentState;
      }
      state.round1.buzzedPosition = action.position;
      state.round1.subPhase = "COMMON_ANSWERING";
      state.round1.deadlineEpochMs = nowMs + 12000;
      const seat = state.seats[action.position - 1];
      addRoomLog(
        state,
        "Khởi Động Chung",
        `${seat.name} (Vị trí ${action.position}) đã bấm chuông giành quyền trả lời câu ${state.round1.commonQIndex + 1}!`,
      );
      return state;
    }

    case "R1_SUBMIT_COMMON": {
      if (state.round1.subPhase !== "COMMON_ANSWERING") return currentState;
      const buzzPos = state.round1.buzzedPosition;
      if (!buzzPos || action.position !== buzzPos) {
        return currentState;
      }
      const isBotSeat = Boolean(
        state.seats[buzzPos - 1]?.claimedByClientId?.startsWith("BOT_SIM_"),
      );
      const isAuthorized =
        canClientControlSeat(state, buzzPos, action.clientId) ||
        (isBotSeat && isHostClient(state, action.clientId));
      if (!isAuthorized) {
        return currentState;
      }
      if (
        action.qIndex !== undefined &&
        action.qIndex !== state.round1.commonQIndex
      ) {
        return currentState;
      }
      return gradeRound1CommonQuestion(state, buzzPos, action.answer);
    }

    case "R1_NEXT_COMMON_QUESTION": {
      if (state.round1.subPhase !== "COMMON_RESULT") return currentState;
      if (!isHostClient(state, action.clientId)) return currentState;
      if (
        action.fromQIndex !== undefined &&
        action.fromQIndex !== state.round1.commonQIndex
      ) {
        return currentState;
      }
      state.round1.buzzedPosition = null;
      state.round1.lastFeedback = null;
      if (state.round1.commonQIndex + 1 < KHOI_DONG_COMMON_QUESTIONS.length) {
        state.round1.commonQIndex += 1;
        state.round1.subPhase = "COMMON_BUZZ_OPEN";
        state.round1.deadlineEpochMs = nowMs + 10000;
      } else {
        state.round1.subPhase = "ROUND_SUMMARY";
        state.round1.deadlineEpochMs = null;
      }
      return state;
    }

    // ==================== ROUND 2: VƯỢT CHƯỚNG NGẠI VẬT ====================
    case "R2_SELECT_PUZZLE": {
      if (!isHostClient(state, action.clientId)) return currentState;
      if (
        state.round2.subPhase !== "SELECT_ROW" ||
        state.round2.openedRowCount > 0
      ) {
        return currentState;
      }
      state.round2.puzzleIndex = action.puzzleIndex;
      state.round2.rowStatuses = {
        1: "UNOPENED",
        2: "UNOPENED",
        3: "UNOPENED",
        4: "UNOPENED",
      };
      state.round2.centerStatus = "UNOPENED";
      state.round2.openedRowCount = 0;
      state.round2.rowSubmissions = {};
      state.round2.cnvBuzzerPosition = null;
      state.round2.lastRowEvaluation = null;
      state.round2.cnvWinner = null;
      state.seats.forEach((s) => (s.vcnvLocked = false));
      return state;
    }

    case "R2_PICK_ROW": {
      if (state.round2.subPhase !== "SELECT_ROW") return currentState;
      const selPos = state.round2.selectorPosition;
      const isSelBot = Boolean(
        state.seats[selPos - 1]?.claimedByClientId?.startsWith("BOT_SIM_"),
      );
      const isAuthorized =
        canClientControlSeat(state, selPos, action.clientId) ||
        (isSelBot && isHostClient(state, action.clientId));
      if (!isAuthorized) {
        return currentState;
      }
      if (state.round2.rowStatuses[action.rowId] !== "UNOPENED") {
        return currentState;
      }
      state.round2.activeRowId = action.rowId;
      state.round2.openedRowCount += 1;
      state.round2.rowSubmissions = {};
      state.round2.lastFeedback = null;
      state.round2.lastRowEvaluation = null;
      state.round2.subPhase = "ANSWERING_ROW";
      state.round2.deadlineEpochMs = nowMs + 15000;
      const selector = state.seats[state.round2.selectorPosition - 1];
      addRoomLog(
        state,
        "VCNV",
        `${selector.name} chọn mở Hàng ngang số ${action.rowId}. Cả 4 thí sinh có 15 giây gửi đáp án tự luận!`,
      );
      return state;
    }

    case "R2_SUBMIT_ROW_ANSWER": {
      if (
        state.round2.subPhase !== "ANSWERING_ROW" &&
        state.round2.subPhase !== "ANSWERING_CENTER"
      ) {
        return currentState;
      }
      const isBotSeat = Boolean(
        state.seats[action.position - 1]?.claimedByClientId?.startsWith(
          "BOT_SIM_",
        ),
      );
      const isAuthorized =
        canClientControlSeat(state, action.position, action.clientId) ||
        (isBotSeat && isHostClient(state, action.clientId));
      if (!isAuthorized) {
        return currentState;
      }
      const seat = state.seats[action.position - 1];
      if (!seat || seat.vcnvLocked) return currentState;
      state.round2.rowSubmissions[action.position] = action.answer.trim();
      return state;
    }

    case "R2_EVALUATE_ROW_NOW": {
      if (
        state.round2.subPhase !== "ANSWERING_ROW" &&
        state.round2.subPhase !== "ANSWERING_CENTER"
      ) {
        return currentState;
      }
      return evaluateVcnvRow(state, nowMs);
    }

    case "R2_CONTINUE_SELECT_ROW": {
      if (state.round2.subPhase !== "ROW_RESULT") return currentState;
      const selPos = state.round2.selectorPosition;
      const isSelBot = Boolean(
        state.seats[selPos - 1]?.claimedByClientId?.startsWith("BOT_SIM_"),
      );
      const isAuthorized =
        canClientControlSeat(state, selPos, action.clientId) ||
        (isSelBot && isHostClient(state, action.clientId));
      if (!isAuthorized) {
        return currentState;
      }
      let nextPos = ((state.round2.selectorPosition % 4) + 1) as 1 | 2 | 3 | 4;
      for (let i = 0; i < 4; i++) {
        if (!state.seats[nextPos - 1].vcnvLocked) break;
        nextPos = ((nextPos % 4) + 1) as 1 | 2 | 3 | 4;
      }
      state.round2.selectorPosition = nextPos;
      state.round2.subPhase = "SELECT_ROW";
      state.round2.activeRowId = null;
      state.round2.rowSubmissions = {};
      return state;
    }

    case "R2_OPEN_CENTER": {
      if (!isHostClient(state, action.clientId)) return currentState;
      state.round2.subPhase = "ANSWERING_CENTER";
      state.round2.rowSubmissions = {};
      state.round2.lastRowEvaluation = null;
      state.round2.deadlineEpochMs = nowMs + 15000;
      return state;
    }

    case "R2_BUZZ_CNV": {
      if (!canClientControlSeat(state, action.position, action.clientId)) {
        return currentState;
      }
      const seat = state.seats[action.position - 1];
      if (
        !seat ||
        seat.vcnvLocked ||
        state.round2.cnvBuzzerPosition !== null ||
        state.round2.subPhase === "ROUND_SUMMARY"
      ) {
        return currentState;
      }
      state.round2.cnvBuzzerPosition = action.position;
      addRoomLog(
        state,
        "VCNV",
        `TÍN HIỆU CHUÔNG! ${seat.name} (Vị trí ${action.position}) bấm chuông xin giải Chướng Ngại Vật!`,
      );
      return state;
    }

    case "R2_CANCEL_BUZZ_CNV": {
      if (
        !state.round2.cnvBuzzerPosition ||
        !canClientControlSeat(
          state,
          state.round2.cnvBuzzerPosition,
          action.clientId,
        )
      ) {
        return currentState;
      }
      state.round2.cnvBuzzerPosition = null;
      return state;
    }

    case "R2_SUBMIT_CNV": {
      const pos = state.round2.cnvBuzzerPosition;
      if (
        !pos ||
        action.position !== pos ||
        !canClientControlSeat(state, pos, action.clientId)
      ) {
        return currentState;
      }
      const seat = state.seats[pos - 1];
      const puzzle = OBSTACLE_PUZZLES[state.round2.puzzleIndex];
      const isOk = isAnswerMatch(
        action.keyword,
        puzzle.acceptedKeywords,
        puzzle.keywordDisplay,
      );
      const pts = getCnvRewardPoints(state.round2);
      const submittedKw = action.keyword.trim() || "(Trống)";

      if (isOk) {
        seat.score += pts;
        state.round2.rowStatuses = {
          1: "SOLVED",
          2: "SOLVED",
          3: "SOLVED",
          4: "SOLVED",
        };
        state.round2.centerStatus = "SOLVED";
        state.round2.cnvBuzzerPosition = null;
        state.round2.deadlineEpochMs = null;
        state.round2.cnvWinner = {
          solved: true,
          position: pos,
          name: seat.name,
          submittedKeyword: submittedKw,
          officialKeyword: puzzle.keywordDisplay,
          points: pts,
          message: `Xuất sắc! ${seat.name} (Vị trí ${pos}) trả lời "${submittedKw}" — CHÍNH XÁC! Chướng Ngại Vật là "${puzzle.keywordDisplay}" (+${pts} điểm)!`,
        };
        state.round2.subPhase = "ROUND_SUMMARY";
        addRoomLog(
          state,
          "VCNV",
          `${seat.name} giải ĐÚNG Chướng Ngại Vật "${puzzle.keywordDisplay}"`,
          `+${pts}`,
        );
      } else {
        seat.vcnvLocked = true;
        state.round2.cnvBuzzerPosition = null;
        state.round2.lastFeedback = `${seat.name} (Vị trí ${pos}) trả lời từ khóa Chướng Ngại Vật là "${submittedKw}" — CHƯA CHÍNH XÁC! ${seat.name} bị khóa quyền thi tiếp phần Vượt Chướng Ngại Vật.`;
        addRoomLog(
          state,
          "VCNV",
          `${seat.name} giải SAI Chướng Ngại Vật ("${submittedKw}") -> Bị khóa quyền VCNV!`,
          "Khóa",
        );

        if (state.seats.every((s) => s.vcnvLocked)) {
          state.round2.cnvWinner = {
            solved: false,
            officialKeyword: puzzle.keywordDisplay,
            message: `Cả 4 thí sinh đều đã mất quyền trả lời. Đáp án Chướng Ngại Vật chính thức là "${puzzle.keywordDisplay}".`,
          };
          state.round2.subPhase = "ROUND_SUMMARY";
          state.round2.deadlineEpochMs = null;
        }
      }
      return state;
    }

    // ==================== ROUND 3: TĂNG TỐC ====================
    case "R3_START_QUESTION": {
      if (!isHostClient(state, action.clientId)) return currentState;
      const questionsArray = state.questions?.round3 || TANG_TOC_QUESTIONS;
      const q = questionsArray[action.qIndex];
      state.round3.qIndex = action.qIndex;
      state.round3.subPhase = "QUESTION_ACTIVE";
      state.round3.questionStartEpochMs = nowMs;
      state.round3.deadlineEpochMs = nowMs + q.timeLimitSec * 1000;
      state.round3.submissions = {};
      state.round3.rankedResults = [];
      return state;
    }

    case "R3_SUBMIT_ANSWER": {
      if (state.round3.subPhase !== "QUESTION_ACTIVE") return currentState;
      const isBotSeat = Boolean(
        state.seats[action.position - 1]?.claimedByClientId?.startsWith(
          "BOT_SIM_",
        ),
      );
      const isAuthorized =
        canClientControlSeat(state, action.position, action.clientId) ||
        (isBotSeat && isHostClient(state, action.clientId));
      if (!isAuthorized) {
        return currentState;
      }
      const questionsArray = state.questions?.round3 || TANG_TOC_QUESTIONS;
      const q = questionsArray[state.round3.qIndex];
      const seat = state.seats[action.position - 1];
      if (!seat) return currentState;

      const elapsedSec = Math.max(
        0.15,
        Math.min(
          q.timeLimitSec,
          Number(
            ((nowMs - state.round3.questionStartEpochMs) / 1000).toFixed(2),
          ),
        ),
      );

      state.round3.submissions[action.position] = {
        position: action.position,
        name: seat.name,
        answer: action.answer.trim(),
        timeSec: elapsedSec,
      };

      return state;
    }

    case "R3_FINALIZE_QUESTION": {
      if (state.round3.subPhase !== "QUESTION_ACTIVE") return currentState;
      return finalizeTangTocQuestion(state);
    }

    // ==================== ROUND 4: VỀ ĐÍCH ====================
    case "R4_CONFIRM_PACKAGE": {
      const r4 = state.round4;
      if (r4.subPhase !== "SELECT_PACKAGE") return currentState;
      const curPos = r4.activePosition;
      const isCurSeatBot = Boolean(
        state.seats[curPos - 1]?.claimedByClientId?.startsWith("BOT_SIM_"),
      );
      const isAuthorized =
        canClientControlSeat(state, curPos, action.clientId) ||
        (isCurSeatBot && isHostClient(state, action.clientId));
      if (action.position !== curPos || !isAuthorized) {
        return currentState;
      }
      r4.packagePoints = action.points;
      const chosenIds: [string, string, string] = [
        "vd20-1",
        "vd20-2",
        "vd20-3",
      ];

      action.points.forEach((pt, idx) => {
        const pool = pt === 20 ? VE_DICH_20_QUESTIONS : VE_DICH_30_QUESTIONS;
        const usedList = pt === 20 ? r4.used20Ids : r4.used30Ids;
        const avail = pool.filter((q) => !usedList.includes(q.id));
        const picked = avail.length > 0 ? avail[0] : pool[idx % pool.length];
        usedList.push(picked.id);
        chosenIds[idx] = picked.id;
      });

      r4.questionIds = chosenIds;
      r4.qIndex = 0;
      r4.starActiveThisQ = false;
      r4.stealerPosition = null;
      r4.mainSubmittedAnswer = null;
      r4.stealSubmittedAnswer = null;
      r4.lastResult = null;
      r4.subPhase = "PRE_QUESTION_STAR";
      const seat = state.seats[r4.activePosition - 1];
      addRoomLog(
        state,
        "Về Đích",
        `${seat.name} (Vị trí ${r4.activePosition}) chọn gói câu hỏi ${action.points.join(" - ")} điểm.`,
      );
      return state;
    }

    case "R4_START_QUESTION": {
      const r4 = state.round4;
      if (r4.subPhase !== "PRE_QUESTION_STAR") return currentState;
      const curPos = r4.activePosition;
      const isCurSeatBot = Boolean(
        state.seats[curPos - 1]?.claimedByClientId?.startsWith("BOT_SIM_"),
      );
      const isAuthorized =
        canClientControlSeat(state, curPos, action.clientId) ||
        (isCurSeatBot && isHostClient(state, action.clientId));
      if (!isAuthorized) {
        return currentState;
      }
      const seat = state.seats[r4.activePosition - 1];
      const q = getFinishQuestionById(r4.questionIds[r4.qIndex]);

      if (action.useStar && !seat.starUsed) {
        seat.starUsed = true;
        r4.starActiveThisQ = true;
        addRoomLog(
          state,
          "Về Đích",
          `${seat.name} đặt ★ NGÔI SAO HY VỌNG cho câu hỏi số ${r4.qIndex + 1} (${q.points} điểm)!`,
        );
      } else {
        r4.starActiveThisQ = false;
      }

      r4.stealerPosition = null;
      r4.mainSubmittedAnswer = null;
      r4.stealSubmittedAnswer = null;
      r4.lastResult = null;
      r4.subPhase = "MAIN_ANSWERING";
      r4.deadlineEpochMs = nowMs + (q.points === 20 ? 15000 : 20000);
      return state;
    }

    case "R4_SUBMIT_MAIN_ANSWER": {
      const r4 = state.round4;
      if (r4.subPhase !== "MAIN_ANSWERING") return currentState;
      const curPos = r4.activePosition;
      const isCurSeatBot = Boolean(
        state.seats[curPos - 1]?.claimedByClientId?.startsWith("BOT_SIM_"),
      );
      const isAuthorized =
        canClientControlSeat(state, curPos, action.clientId) ||
        (isCurSeatBot && isHostClient(state, action.clientId));
      if (!isAuthorized) {
        return currentState;
      }
      if (action.qIndex !== undefined && action.qIndex !== r4.qIndex) {
        return currentState;
      }
      return gradeRound4MainAnswer(state, action.answer, nowMs);
    }

    case "R4_BUZZ_STEAL": {
      const r4 = state.round4;
      if (
        r4.subPhase !== "STEAL_WINDOW" ||
        r4.stealerPosition !== null ||
        action.position === r4.activePosition
      ) {
        return currentState;
      }
      if (!canClientControlSeat(state, action.position, action.clientId)) {
        return currentState;
      }
      r4.stealerPosition = action.position;
      r4.subPhase = "STEAL_ANSWERING";
      r4.deadlineEpochMs = nowMs + 12000;
      const stealer = state.seats[action.position - 1];
      addRoomLog(
        state,
        "Về Đích",
        `TÍN HIỆU CHUÔNG! ${stealer.name} (Vị trí ${action.position}) bấm chuông giành quyền trả lời câu hỏi của ${state.seats[r4.activePosition - 1].name}!`,
      );
      return state;
    }

    case "R4_SKIP_STEAL_WINDOW": {
      if (state.round4.subPhase !== "STEAL_WINDOW") return currentState;
      return finalizeRound4NoSteal(state);
    }

    case "R4_SUBMIT_STEAL_ANSWER": {
      const r4 = state.round4;
      if (r4.subPhase !== "STEAL_ANSWERING") return currentState;
      const stealerPos = r4.stealerPosition;
      if (!stealerPos || action.position !== stealerPos) {
        return currentState;
      }
      const isBotSeat = Boolean(
        state.seats[stealerPos - 1]?.claimedByClientId?.startsWith("BOT_SIM_"),
      );
      const isAuthorized =
        canClientControlSeat(state, stealerPos, action.clientId) ||
        (isBotSeat && isHostClient(state, action.clientId));
      if (!isAuthorized) {
        return currentState;
      }
      return gradeRound4StealAnswer(state, stealerPos, action.answer);
    }

    case "R4_NEXT_STEP": {
      const r4 = state.round4;
      if (r4.subPhase !== "QUESTION_RESULT") return currentState;
      const curPos = r4.activePosition;
      const isCurSeatBot = Boolean(
        state.seats[curPos - 1]?.claimedByClientId?.startsWith("BOT_SIM_"),
      );
      const isAuthorized =
        canClientControlSeat(state, curPos, action.clientId) ||
        (isCurSeatBot && isHostClient(state, action.clientId));
      if (!isAuthorized) {
        return currentState;
      }
      if (
        action.fromTurnIndex !== undefined &&
        action.fromTurnIndex !== r4.turnIndex
      ) {
        return currentState;
      }
      if (action.fromQIndex !== undefined && action.fromQIndex !== r4.qIndex) {
        return currentState;
      }
      r4.lastResult = null;
      r4.stealerPosition = null;
      r4.mainSubmittedAnswer = null;
      r4.stealSubmittedAnswer = null;
      r4.starActiveThisQ = false;

      if (r4.qIndex + 1 < 3) {
        r4.qIndex += 1;
        r4.subPhase = "PRE_QUESTION_STAR";
      } else if (r4.turnIndex + 1 < 4) {
        r4.turnIndex += 1;
        r4.activePosition = r4.turnOrder[r4.turnIndex];
        r4.qIndex = 0;
        r4.packagePoints = [20, 20, 30];
        r4.subPhase = "SELECT_PACKAGE";
      } else {
        const maxScore = Math.max(...state.seats.map((s) => s.score));
        const tied = state.seats
          .filter((s) => s.score === maxScore)
          .map((s) => s.position);

        if (tied.length > 1) {
          state.stage = "TIE_BREAKER";
          state.tieBreaker = {
            tiedPositions: tied,
            subPhase: "BUZZ_OPEN",
            buzzedPosition: null,
            deadlineEpochMs: nowMs + 15000,
            lastFeedback: null,
          };
          addRoomLog(
            state,
            "Câu hỏi phụ",
            `Có ${tied.length} thí sinh đồng điểm cao nhất (${maxScore}đ). Bước vào vòng Câu Hỏi Phụ!`,
          );
        } else {
          state.stage = "GAME_OVER";
        }
      }
      return state;
    }

    // ==================== TIE BREAKER ====================
    case "TB_BUZZ": {
      if (
        state.tieBreaker.subPhase !== "BUZZ_OPEN" ||
        !state.tieBreaker.tiedPositions.includes(action.position)
      ) {
        return currentState;
      }
      if (!canClientControlSeat(state, action.position, action.clientId)) {
        return currentState;
      }
      state.tieBreaker.buzzedPosition = action.position;
      state.tieBreaker.subPhase = "ANSWERING";
      state.tieBreaker.deadlineEpochMs = nowMs + 12000;
      return state;
    }

    case "TB_SUBMIT": {
      const pos = state.tieBreaker.buzzedPosition;
      if (
        !pos ||
        action.position !== pos ||
        !canClientControlSeat(state, pos, action.clientId)
      ) {
        return currentState;
      }
      const seat = state.seats[pos - 1];
      const tbQ = TIE_BREAKER_QUESTIONS[0];
      const submittedText = action.answer.trim() || "(Trống)";
      const ok = isAnswerMatch(action.answer, tbQ.acceptedAnswers, tbQ.answer);

      if (ok) {
        seat.score += 10;
        state.tieBreaker.lastFeedback = {
          playerName: seat.name,
          submittedAnswer: submittedText,
          officialAnswer: tbQ.answer,
          message: `${seat.name} trả lời "${submittedText}" — CHÍNH XÁC (Đáp án: ${tbQ.answer})!`,
        };
        addRoomLog(
          state,
          "Câu hỏi phụ",
          `${seat.name} trả lời ĐÚNG Câu hỏi phụ ("${submittedText}" - Đáp án: ${tbQ.answer}) và trở thành Quán quân Olympia!`,
          "+10",
        );
        state.stage = "GAME_OVER";
      } else {
        state.tieBreaker.lastFeedback = {
          playerName: seat.name,
          submittedAnswer: submittedText,
          message: `${seat.name} trả lời "${submittedText}" — CHƯA CHÍNH XÁC! Quyền bấm chuông dành cho các thí sinh còn lại.`,
        };
        state.tieBreaker.tiedPositions = state.tieBreaker.tiedPositions.filter(
          (p) => p !== pos,
        );
        state.tieBreaker.buzzedPosition = null;
        state.tieBreaker.subPhase = "BUZZ_OPEN";
        state.tieBreaker.deadlineEpochMs = nowMs + 15000;
        if (state.tieBreaker.tiedPositions.length === 1) {
          const winnerPos = state.tieBreaker.tiedPositions[0];
          state.seats[winnerPos - 1].score += 10;
          state.stage = "GAME_OVER";
        }
      }
      return state;
    }

    default:
      return currentState;
  }
}

function gradeRound1PersonalQuestion(
  state: OlympiaRoomState,
  rawAnswer: string,
  nowMs: number,
): OlympiaRoomState {
  const pos = state.round1.activePosition;
  const seat = state.seats[pos - 1];
  const qNum = state.round1.personalQIndex + 1;
  const globalIdx = (pos - 1) * 6 + state.round1.personalQIndex;
  // Prioritize server-provided questions for better performance
  const questionsArray =
    state.questions?.round1Personal || KHOI_DONG_PERSONAL_QUESTIONS;
  const q = questionsArray[globalIdx % questionsArray.length];

  const submittedText = rawAnswer.trim() || "(Bỏ qua / Hết giờ)";
  const isCorrect = isAnswerMatch(rawAnswer, q.acceptedAnswers, q.answer);

  if (isCorrect) {
    seat.score += 10;
    state.round1.lastFeedback = {
      correct: true,
      playerName: seat.name,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      message: `Câu ${qNum}/6: ${seat.name} trả lời "${submittedText}" — CHÍNH XÁC (+10 điểm)! Đáp án chính thức: "${q.answer}".`,
      explanation: q.explanation,
    };
    addRoomLog(
      state,
      "Khởi Động",
      `${seat.name} trả lời ĐÚNG câu ${qNum}/6 ("${submittedText}" — Đáp án: ${q.answer})`,
      "+10",
    );
  } else {
    state.round1.lastFeedback = {
      correct: false,
      playerName: seat.name,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      message: `Câu ${qNum}/6: ${seat.name} trả lời "${submittedText}" — CHƯA CHÍNH XÁC (0 điểm). Đáp án chính thức là: "${q.answer}".`,
      explanation: q.explanation,
    };
    addRoomLog(
      state,
      "Khởi Động",
      `${seat.name} trả lời chưa đúng câu ${qNum}/6 ("${submittedText}" — Đáp án: ${q.answer})`,
      "0",
    );
  }

  state.round1.personalHistory.push({
    qNum,
    category: q.category,
    question: q.question,
    playerName: seat.name,
    position: pos,
    submittedAnswer: submittedText,
    officialAnswer: q.answer,
    correct: isCorrect,
    explanation: q.explanation,
  });

  if (state.round1.personalQIndex + 1 < 6) {
    state.round1.personalQIndex += 1;
    state.round1.deadlineEpochMs = nowMs + 12000;
  } else {
    state.round1.subPhase = "PERSONAL_TURN_DONE";
    state.round1.deadlineEpochMs = null;
  }
  return state;
}

function gradeRound1CommonQuestion(
  state: OlympiaRoomState,
  buzzPos: 1 | 2 | 3 | 4,
  rawAnswer: string,
): OlympiaRoomState {
  const seat = state.seats[buzzPos - 1];
  const questionsArray =
    state.questions?.round1Common || KHOI_DONG_COMMON_QUESTIONS;
  const q = questionsArray[state.round1.commonQIndex % questionsArray.length];
  const submittedText = rawAnswer.trim() || "(Hết giờ)";
  const isCorrect = isAnswerMatch(rawAnswer, q.acceptedAnswers, q.answer);

  if (isCorrect) {
    seat.score += 10;
    state.round1.lastFeedback = {
      correct: true,
      playerName: seat.name,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      message: `${seat.name} trả lời "${submittedText}" — CHÍNH XÁC (+10 điểm)! Đáp án chính thức: "${q.answer}".`,
      explanation: q.explanation,
    };
    addRoomLog(
      state,
      "Khởi Động Chung",
      `Câu ${state.round1.commonQIndex + 1}: ${seat.name} trả lời ĐÚNG ("${submittedText}" — Đáp án: ${q.answer})`,
      "+10",
    );
  } else {
    seat.score = Math.max(0, seat.score - 5);
    state.round1.lastFeedback = {
      correct: false,
      playerName: seat.name,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      message: `${seat.name} trả lời "${submittedText}" — CHƯA CHÍNH XÁC (-5 điểm). Đáp án chính thức là: "${q.answer}".`,
      explanation: q.explanation,
    };
    addRoomLog(
      state,
      "Khởi Động Chung",
      `Câu ${state.round1.commonQIndex + 1}: ${seat.name} trả lời SAI ("${submittedText}" — Đáp án: ${q.answer})`,
      "-5",
    );
  }

  state.round1.subPhase = "COMMON_RESULT";
  state.round1.deadlineEpochMs = null;
  return state;
}

function gradeRound4MainAnswer(
  state: OlympiaRoomState,
  rawAnswer: string,
  nowMs: number,
): OlympiaRoomState {
  const r4 = state.round4;
  const seat = state.seats[r4.activePosition - 1];
  const q = getFinishQuestionById(r4.questionIds[r4.qIndex]);
  const submittedText = rawAnswer.trim() || "(Bỏ qua / Hết giờ)";
  r4.mainSubmittedAnswer = submittedText;

  const isCorrect = isAnswerMatch(rawAnswer, q.acceptedAnswers, q.answer);

  if (isCorrect) {
    const gained = r4.starActiveThisQ ? q.points * 2 : q.points;
    seat.score += gained;
    r4.lastResult = {
      correct: true,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      headline: `Chính xác! ${seat.name} trả lời "${submittedText}" và giành được +${gained} điểm${
        r4.starActiveThisQ ? " (Nhân đôi nhờ ★ Ngôi Sao Hy Vọng)" : ""
      }!`,
      detail: `Đáp án chính thức của chương trình: "${q.answer}"`,
      explanation: q.explanation,
    };
    r4.subPhase = "QUESTION_RESULT";
    r4.deadlineEpochMs = null;
    addRoomLog(
      state,
      "Về Đích",
      `${seat.name} trả lời ĐÚNG câu ${r4.qIndex + 1} ("${submittedText}" — Đáp án: ${q.answer})`,
      `+${gained}`,
    );
  } else {
    if (r4.starActiveThisQ) {
      seat.score = Math.max(0, seat.score - q.points);
      addRoomLog(
        state,
        "Về Đích",
        `${seat.name} trả lời "${submittedText}" (SAI câu có ★ Ngôi Sao Hy Vọng) và bị trừ ${q.points} điểm!`,
        `-${q.points}`,
      );
    } else {
      addRoomLog(
        state,
        "Về Đích",
        `${seat.name} trả lời "${submittedText}" (chưa chính xác)! 3 thí sinh còn lại có 5 giây bấm chuông giành quyền trả lời!`,
      );
    }
    r4.subPhase = "STEAL_WINDOW";
    r4.stealerPosition = null;
    r4.deadlineEpochMs = nowMs + 5000;
  }
  return state;
}

function finalizeRound4NoSteal(state: OlympiaRoomState): OlympiaRoomState {
  const r4 = state.round4;
  const q = getFinishQuestionById(r4.questionIds[r4.qIndex]);
  const mainSeat = state.seats[r4.activePosition - 1];
  r4.subPhase = "QUESTION_RESULT";
  r4.deadlineEpochMs = null;
  r4.lastResult = {
    correct: false,
    submittedAnswer: r4.mainSubmittedAnswer || "(Chưa trả lời)",
    officialAnswer: q.answer,
    headline: `${mainSeat.name} trả lời "${
      r4.mainSubmittedAnswer || "(Trống)"
    }" (chưa đúng) và không có thí sinh nào bấm chuông giành quyền trả lời.`,
    detail: `Đáp án chính thức của câu hỏi (${q.points} điểm) là: "${q.answer}".`,
    explanation: q.explanation,
  };
  return state;
}

function gradeRound4StealAnswer(
  state: OlympiaRoomState,
  stealerPos: 1 | 2 | 3 | 4,
  rawAnswer: string,
): OlympiaRoomState {
  const r4 = state.round4;
  const stealerSeat = state.seats[stealerPos - 1];
  const mainSeat = state.seats[r4.activePosition - 1];
  const q = getFinishQuestionById(r4.questionIds[r4.qIndex]);
  const submittedText = rawAnswer.trim() || "(Hết giờ)";
  r4.stealSubmittedAnswer = submittedText;

  const isCorrect = isAnswerMatch(rawAnswer, q.acceptedAnswers, q.answer);

  if (isCorrect) {
    stealerSeat.score += q.points;
    if (!r4.starActiveThisQ) {
      mainSeat.score = Math.max(0, mainSeat.score - q.points);
    }
    r4.lastResult = {
      correct: true,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      headline: `Cướp điểm thành công! ${stealerSeat.name} trả lời "${submittedText}" — CHÍNH XÁC và giành được +${q.points} điểm${
        !r4.starActiveThisQ ? ` từ quỹ điểm của ${mainSeat.name}` : ""
      }!`,
      detail: `Đáp án chính thức của chương trình: "${q.answer}"`,
      explanation: q.explanation,
    };
    addRoomLog(
      state,
      "Về Đích",
      `${stealerSeat.name} bấm chuông CƯỚP ĐIỂM thành công ("${submittedText}" — Đáp án: ${q.answer})`,
      `+${q.points}`,
    );
  } else {
    const penalty = q.points / 2;
    stealerSeat.score = Math.max(0, stealerSeat.score - penalty);
    r4.lastResult = {
      correct: false,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      headline: `${stealerSeat.name} bấm chuông trả lời "${submittedText}" — CHƯA CHÍNH XÁC nên bị trừ ${penalty} điểm!`,
      detail: `Đáp án chính thức của chương trình là: "${q.answer}"`,
      explanation: q.explanation,
    };
    addRoomLog(
      state,
      "Về Đích",
      `${stealerSeat.name} bấm chuông trả lời SAI ("${submittedText}" — Đáp án: ${q.answer})`,
      `-${penalty}`,
    );
  }

  r4.subPhase = "QUESTION_RESULT";
  r4.deadlineEpochMs = null;
  return state;
}

function handleServerTimerExpired(
  state: OlympiaRoomState,
  currentState: OlympiaRoomState,
  nowMs: number,
  expectedDeadline?: number,
): OlympiaRoomState {
  if (state.stage === "ROUND_1_KHOI_DONG") {
    const r1 = state.round1;
    if (!r1.deadlineEpochMs) return currentState;
    if (
      expectedDeadline !== undefined &&
      r1.deadlineEpochMs !== expectedDeadline
    ) {
      return currentState;
    }

    if (r1.subPhase === "PERSONAL_ACTIVE") {
      return gradeRound1PersonalQuestion(state, "", nowMs);
    }
    if (r1.subPhase === "COMMON_BUZZ_OPEN") {
      const questionsArray =
        state.questions?.round1Common || KHOI_DONG_COMMON_QUESTIONS;
      const q = questionsArray[r1.commonQIndex % questionsArray.length];
      r1.subPhase = "COMMON_RESULT";
      r1.deadlineEpochMs = null;
      r1.lastFeedback = {
        correct: false,
        officialAnswer: q.answer,
        message: `Hết thời gian bấm chuông! Không có thí sinh nào bấm chuông trả lời câu số ${
          r1.commonQIndex + 1
        }. Đáp án chính thức là: "${q.answer}".`,
        explanation: q.explanation,
      };
      return state;
    }
    if (r1.subPhase === "COMMON_ANSWERING" && r1.buzzedPosition) {
      return gradeRound1CommonQuestion(state, r1.buzzedPosition, "");
    }
  } else if (state.stage === "ROUND_2_VCNV") {
    const r2 = state.round2;
    if (!r2.deadlineEpochMs) return currentState;
    if (
      expectedDeadline !== undefined &&
      r2.deadlineEpochMs !== expectedDeadline
    ) {
      return currentState;
    }
    if (r2.subPhase === "ANSWERING_ROW" || r2.subPhase === "ANSWERING_CENTER") {
      return evaluateVcnvRow(state, nowMs);
    }
  } else if (state.stage === "ROUND_3_TANG_TOC") {
    const r3 = state.round3;
    if (!r3.deadlineEpochMs) return currentState;
    if (
      expectedDeadline !== undefined &&
      r3.deadlineEpochMs !== expectedDeadline
    ) {
      return currentState;
    }
    if (r3.subPhase === "QUESTION_ACTIVE") {
      return finalizeTangTocQuestion(state);
    }
  } else if (state.stage === "ROUND_4_VE_DICH") {
    const r4 = state.round4;
    if (!r4.deadlineEpochMs) return currentState;
    if (
      expectedDeadline !== undefined &&
      r4.deadlineEpochMs !== expectedDeadline
    ) {
      return currentState;
    }
    if (r4.subPhase === "MAIN_ANSWERING") {
      return gradeRound4MainAnswer(state, "", nowMs);
    }
    if (r4.subPhase === "STEAL_WINDOW") {
      return finalizeRound4NoSteal(state);
    }
    if (r4.subPhase === "STEAL_ANSWERING" && r4.stealerPosition) {
      return gradeRound4StealAnswer(state, r4.stealerPosition, "");
    }
  }
  return currentState;
}

function evaluateVcnvRow(
  state: OlympiaRoomState,
  nowMs: number = Date.now(),
): OlympiaRoomState {
  const puzzle = OBSTACLE_PUZZLES[state.round2.puzzleIndex];
  if (state.round2.subPhase === "ANSWERING_CENTER") {
    const centerQ = puzzle.centerQuestion;
    const correctNames: string[] = [];
    const evalResults: Round2RowEvalItem[] = [];

    state.seats.forEach((seat) => {
      const rawAns = state.round2.rowSubmissions[seat.position] || "";
      const ok =
        !seat.vcnvLocked &&
        isAnswerMatch(rawAns, centerQ.acceptedAnswers, centerQ.displayWord);
      if (ok) {
        seat.score += 10;
        correctNames.push(seat.name);
      }
      evalResults.push({
        position: seat.position,
        name: seat.name,
        submittedAnswer: seat.vcnvLocked
          ? "(Đã khóa quyền VCNV)"
          : rawAns || "(Chưa gửi đáp án)",
        isCorrect: ok,
        pointsAwarded: ok ? 10 : 0,
      });
    });

    state.round2.lastRowEvaluation = {
      rowLabel: "Ô Trung Tâm",
      question: centerQ.question,
      officialAnswer: centerQ.displayWord,
      explanation: centerQ.explanation,
      results: evalResults,
    };

    if (correctNames.length > 0) {
      state.round2.centerStatus = "SOLVED";
      state.round2.lastFeedback = `Đáp án Ô Trung Tâm chính thức là "${centerQ.displayWord}". Thí sinh trả lời đúng (+10đ): ${correctNames.join(", ")}. Mảnh ghép trung tâm đã mở!`;
    } else {
      state.round2.centerStatus = "LOCKED";
      state.round2.lastFeedback = `Không có thí sinh nào trả lời đúng Ô Trung Tâm (Đáp án chính thức: "${centerQ.displayWord}"). Các thí sinh có 15 giây cuối để bấm chuông giải Chướng Ngại Vật!`;
    }
    state.round2.subPhase = "FINAL_15S";
    state.round2.deadlineEpochMs = nowMs + 15000;
    return state;
  }

  const rowId = state.round2.activeRowId;
  const rowObj = puzzle.rows.find((r) => r.id === rowId);
  if (!rowObj) return state;

  const correctNames: string[] = [];
  const evalResults: Round2RowEvalItem[] = [];

  state.seats.forEach((seat) => {
    const rawAns = state.round2.rowSubmissions[seat.position] || "";
    const ok =
      !seat.vcnvLocked &&
      isAnswerMatch(rawAns, rowObj.acceptedAnswers, rowObj.displayWord);
    if (ok) {
      seat.score += 10;
      correctNames.push(seat.name);
    }
    evalResults.push({
      position: seat.position,
      name: seat.name,
      submittedAnswer: seat.vcnvLocked
        ? "(Đã khóa quyền VCNV)"
        : rawAns || "(Chưa gửi đáp án)",
      isCorrect: ok,
      pointsAwarded: ok ? 10 : 0,
    });
  });

  state.round2.lastRowEvaluation = {
    rowLabel: `Hàng ngang số ${rowObj.id}`,
    question: rowObj.question,
    officialAnswer: rowObj.displayWord,
    explanation: rowObj.explanation,
    results: evalResults,
  };

  if (correctNames.length > 0) {
    state.round2.rowStatuses[rowObj.id] = "SOLVED";
    state.round2.lastFeedback = `Đáp án Hàng ngang số ${rowObj.id} là "${rowObj.displayWord}". Thí sinh trả lời đúng (+10đ): ${correctNames.join(", ")}. Mảnh ghép hình ảnh số ${rowObj.id} đã được mở!`;
    addRoomLog(
      state,
      "VCNV",
      `Hàng ngang ${rowObj.id} (${rowObj.displayWord}): ${correctNames.join(", ")} trả lời đúng`,
      "+10",
    );
  } else {
    state.round2.rowStatuses[rowObj.id] = "LOCKED";
    state.round2.lastFeedback = `Không có thí sinh nào trả lời đúng Hàng ngang số ${rowObj.id}. Đáp án chính thức là: "${rowObj.displayWord}". Mảnh ghép số ${rowObj.id} bị khóa!`;
  }

  state.round2.subPhase = "ROW_RESULT";
  state.round2.deadlineEpochMs = null;
  return state;
}

function finalizeTangTocQuestion(state: OlympiaRoomState): OlympiaRoomState {
  const questionsArray = state.questions?.round3 || TANG_TOC_QUESTIONS;
  const q = questionsArray[state.round3.qIndex];
  const allSubs = state.seats.map((seat) => {
    const existing = state.round3.submissions[seat.position];
    const ans = existing ? existing.answer : "(Chưa trả lời)";
    const tSec = existing ? existing.timeSec : q.timeLimitSec;
    const ok =
      Boolean(existing) && isAnswerMatch(ans, q.acceptedAnswers, q.answer);
    return {
      position: seat.position,
      name: seat.name,
      answer: ans,
      timeSec: tSec,
      isCorrect: ok,
      pointsAwarded: 0,
    };
  });

  allSubs.sort((a, b) => a.timeSec - b.timeSec);
  const ladder = [40, 30, 20, 10];
  let rank = 0;

  allSubs.forEach((sub) => {
    if (sub.isCorrect && rank < ladder.length) {
      sub.pointsAwarded = ladder[rank];
      rank++;
      const seat = state.seats[sub.position - 1];
      seat.score += sub.pointsAwarded;
    }
  });

  state.round3.rankedResults = allSubs;
  state.round3.subPhase = "QUESTION_RESULT";
  state.round3.deadlineEpochMs = null;

  const winners = allSubs
    .filter((s) => (s.pointsAwarded || 0) > 0)
    .map((s) => `${s.name} (+${s.pointsAwarded}đ - ${s.timeSec.toFixed(2)}s)`);
  addRoomLog(
    state,
    "Tăng Tốc",
    `Câu ${q.number} (Đáp án: ${q.answer}): ${
      winners.length ? winners.join(", ") : "Không ai trả lời đúng"
    }`,
  );

  return state;
}

/**
 * Automatically generates the next real-time action for any simulated climber (BOT_SIM_*)
 * so the user can test and watch a full 4-player match in real time.
 */
export function stepBotActionIfNeeded(
  state: OlympiaRoomState,
  nowMs: number = Date.now(),
): ClientAction | null {
  if (!state || state.stage === "LOBBY" || state.stage === "GAME_OVER") {
    return null;
  }

  const isBotSeat = (pos: 1 | 2 | 3 | 4): boolean =>
    Boolean(state.seats[pos - 1]?.claimedByClientId?.startsWith("BOT_SIM_"));

  const getBotId = (pos: 1 | 2 | 3 | 4): string | undefined =>
    state.seats[pos - 1]?.claimedByClientId || undefined;

  const hasAnyBot = ([1, 2, 3, 4] as (1 | 2 | 3 | 4)[]).some((p) =>
    isBotSeat(p),
  );
  if (!hasAnyBot) return null;

  const elapsedMs = nowMs - (state.updatedAt || 0);

  // ==================== ROUND 1: KHỞI ĐỘNG ====================
  if (state.stage === "ROUND_1_KHOI_DONG") {
    const r1 = state.round1;
    const activePos = r1.activePosition;

    if (r1.subPhase === "PERSONAL_READY" && isBotSeat(activePos)) {
      return {
        type: "R1_START_PERSONAL_TURN",
        clientId: getBotId(activePos),
      };
    }

    if (r1.subPhase === "PERSONAL_ACTIVE" && isBotSeat(activePos)) {
      if (elapsedMs < 2500) return null;
      const globalIdx = (activePos - 1) * 6 + r1.personalQIndex;
      const questionsArray =
        state.questions?.round1Personal || KHOI_DONG_PERSONAL_QUESTIONS;
      const q = questionsArray[globalIdx % questionsArray.length];
      const shouldBeCorrect =
        r1.personalQIndex !== 2 && r1.personalQIndex !== 5;
      const ans = shouldBeCorrect ? q.answer.toLowerCase() : "Chưa nhớ rõ";
      return {
        type: "R1_SUBMIT_PERSONAL",
        position: activePos,
        qIndex: r1.personalQIndex,
        answer: ans,
        clientId: getBotId(activePos),
      };
    }

    if (r1.subPhase === "PERSONAL_TURN_DONE" && isBotSeat(activePos)) {
      if (elapsedMs < 2000) return null;
      return {
        type: "R1_NEXT_PERSONAL_CLIMBER",
        fromPosition: activePos,
        clientId: getBotId(activePos),
      };
    }

    if (r1.subPhase === "COMMON_BUZZ_OPEN" && r1.buzzedPosition === null) {
      if (elapsedMs >= 3200) {
        const botPositions = ([2, 3, 4, 1] as (1 | 2 | 3 | 4)[]).filter((p) =>
          isBotSeat(p),
        );
        if (botPositions.length > 0) {
          const chosenBot = botPositions[r1.commonQIndex % botPositions.length];
          return {
            type: "R1_BUZZ_COMMON",
            position: chosenBot,
            clientId: getBotId(chosenBot),
          };
        }
      }
    }

    if (
      r1.subPhase === "COMMON_ANSWERING" &&
      r1.buzzedPosition &&
      isBotSeat(r1.buzzedPosition)
    ) {
      const questionsArray =
        state.questions?.round1Common || KHOI_DONG_COMMON_QUESTIONS;
      const q = questionsArray[r1.commonQIndex] || questionsArray[0];
      const shouldBeCorrect = r1.commonQIndex % 3 !== 1;
      const ans = shouldBeCorrect ? q.answer.toLowerCase() : "Đáp án khác";
      return {
        type: "R1_SUBMIT_COMMON",
        position: r1.buzzedPosition,
        qIndex: r1.commonQIndex,
        answer: ans,
        clientId: getBotId(r1.buzzedPosition),
      };
    }
  }

  // ==================== ROUND 2: VƯỢT CHƯỚNG NGẠI VẬT ====================
  if (state.stage === "ROUND_2_VCNV") {
    const r2 = state.round2;

    if (
      r2.subPhase === "SELECT_ROW" &&
      r2.cnvBuzzerPosition === null &&
      isBotSeat(r2.selectorPosition)
    ) {
      const unopenedRow = [1, 2, 3, 4].find(
        (id) => r2.rowStatuses[id] === "UNOPENED",
      );
      if (unopenedRow) {
        return {
          type: "R2_PICK_ROW",
          rowId: unopenedRow,
          clientId: getBotId(r2.selectorPosition),
        };
      }
    }

    if (
      (r2.subPhase === "ANSWERING_ROW" || r2.subPhase === "ANSWERING_CENTER") &&
      r2.cnvBuzzerPosition === null
    ) {
      const puzzle = OBSTACLE_PUZZLES[r2.puzzleIndex] || OBSTACLE_PUZZLES[0];
      for (const pos of [2, 3, 4, 1] as (1 | 2 | 3 | 4)[]) {
        if (
          isBotSeat(pos) &&
          !state.seats[pos - 1].vcnvLocked &&
          r2.rowSubmissions[pos] === undefined
        ) {
          let correctWord = "";
          if (r2.subPhase === "ANSWERING_CENTER") {
            correctWord = puzzle.centerQuestion.displayWord;
          } else {
            const rowObj = puzzle.rows.find((r) => r.id === r2.activeRowId);
            correctWord = rowObj ? rowObj.displayWord : "";
          }
          const shouldBeCorrect = pos !== 4 || (r2.activeRowId || 1) % 2 === 0;
          return {
            type: "R2_SUBMIT_ROW_ANSWER",
            position: pos,
            answer: shouldBeCorrect ? correctWord.toLowerCase() : "Chưa rõ",
            clientId: getBotId(pos),
          };
        }
      }
    }
  }

  // ==================== ROUND 3: TĂNG TỐC ====================
  if (state.stage === "ROUND_3_TANG_TOC") {
    const r3 = state.round3;
    if (r3.subPhase === "QUESTION_ACTIVE") {
      const questionsArray = state.questions?.round3 || TANG_TOC_QUESTIONS;
      const q = questionsArray[r3.qIndex] || questionsArray[0];
      for (const pos of [2, 3, 4, 1] as (1 | 2 | 3 | 4)[]) {
        if (isBotSeat(pos) && !r3.submissions[pos]) {
          const shouldBeCorrect = pos !== 4 || r3.qIndex % 2 === 0;
          return {
            type: "R3_SUBMIT_ANSWER",
            position: pos,
            answer: shouldBeCorrect ? q.answer.toLowerCase() : "Phương án khác",
            clientId: getBotId(pos),
          };
        }
      }
    }
  }

  // ==================== ROUND 4: VỀ ĐÍCH ====================
  if (state.stage === "ROUND_4_VE_DICH") {
    const r4 = state.round4;
    const activePos = r4.activePosition;

    if (r4.subPhase === "SELECT_PACKAGE" && isBotSeat(activePos)) {
      if (elapsedMs < 2000) return null;
      const pkg: [20 | 30, 20 | 30, 20 | 30] =
        activePos === 2
          ? [20, 20, 30]
          : activePos === 3
            ? [20, 30, 20]
            : [20, 30, 30];
      return {
        type: "R4_CONFIRM_PACKAGE",
        position: activePos,
        points: pkg,
        clientId: getBotId(activePos),
      };
    }

    if (r4.subPhase === "PRE_QUESTION_STAR" && isBotSeat(activePos)) {
      if (elapsedMs < 2000) return null;
      const useStar = !state.seats[activePos - 1].starUsed && r4.qIndex === 1;
      return {
        type: "R4_START_QUESTION",
        useStar,
        clientId: getBotId(activePos),
      };
    }

    if (r4.subPhase === "MAIN_ANSWERING" && isBotSeat(activePos)) {
      if (elapsedMs < 3500) return null;
      const q = getFinishQuestionById(r4.questionIds[r4.qIndex]);
      const shouldBeCorrect = r4.qIndex !== 1;
      return {
        type: "R4_SUBMIT_MAIN_ANSWER",
        qIndex: r4.qIndex,
        answer: shouldBeCorrect ? q.answer.toLowerCase() : "Chưa chắc chắn",
        clientId: getBotId(activePos),
      };
    }

    // In STEAL_WINDOW: Do not auto-buzz bots early so the 5s steal countdown runs smoothly to 0s
    if (r4.subPhase === "STEAL_WINDOW") {
      return null;
    }

    if (
      r4.subPhase === "STEAL_ANSWERING" &&
      r4.stealerPosition &&
      isBotSeat(r4.stealerPosition)
    ) {
      if (elapsedMs < 3000) return null;
      const q = getFinishQuestionById(r4.questionIds[r4.qIndex]);
      return {
        type: "R4_SUBMIT_STEAL_ANSWER",
        position: r4.stealerPosition,
        answer: q.answer.toLowerCase(),
        clientId: getBotId(r4.stealerPosition),
      };
    }

    if (r4.subPhase === "QUESTION_RESULT" && isBotSeat(activePos)) {
      if (elapsedMs < 2500) return null;
      return {
        type: "R4_NEXT_STEP",
        fromTurnIndex: r4.turnIndex,
        fromQIndex: r4.qIndex,
        clientId: getBotId(activePos),
      };
    }
  }

  return null;
}
