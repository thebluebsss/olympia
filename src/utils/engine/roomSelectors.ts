import type {
  OlympiaRoomState,
  BuzzerEntry,
} from '../../types/olympia.ts';
import {
  KHOI_DONG_PERSONAL_QUESTIONS,
  KHOI_DONG_COMMON_QUESTIONS,
  OBSTACLE_PUZZLES,
  TANG_TOC_QUESTIONS,
  VE_DICH_20_QUESTIONS,
  VE_DICH_30_QUESTIONS,
  TIE_BREAKER_QUESTIONS,
} from '../../data/olympiaQuestions.ts';
import type {
  QuizQuestion,
  ObstaclePuzzle,
  AccelerationQuestion,
  FinishQuestion,
} from '../../data/olympiaQuestions.ts';

export function upsertAndSortBuzzQueue(
  existing: BuzzerEntry[] | undefined,
  entry: BuzzerEntry
): BuzzerEntry[] {
  const list = Array.isArray(existing) ? [...existing] : [];
  const idx = list.findIndex((item) => item.position === entry.position);
  if (idx >= 0) {
    if (
      entry.elapsedSec < list[idx].elapsedSec ||
      (entry.elapsedSec === list[idx].elapsedSec &&
        entry.timestampMs < list[idx].timestampMs)
    ) {
      list[idx] = entry;
    }
  } else {
    list.push(entry);
  }
  list.sort(
    (a, b) => a.elapsedSec - b.elapsedSec || a.timestampMs - b.timestampMs
  );
  return list;
}

export function mergeBuzzQueues(
  qA: BuzzerEntry[] | undefined,
  qB: BuzzerEntry[] | undefined
): BuzzerEntry[] {
  let merged = Array.isArray(qA) ? [...qA] : [];
  for (const item of qB || []) {
    merged = upsertAndSortBuzzQueue(merged, item);
  }
  return merged;
}

export function getRoomPersonalQuestions(
  state?: OlympiaRoomState
): QuizQuestion[] {
  if (state?.questionDeck?.personalQuestions?.length) {
    return state.questionDeck.personalQuestions;
  }
  return KHOI_DONG_PERSONAL_QUESTIONS;
}

export function getRoomCommonQuestions(
  state?: OlympiaRoomState
): QuizQuestion[] {
  if (state?.questionDeck?.commonQuestions?.length) {
    return state.questionDeck.commonQuestions;
  }
  return KHOI_DONG_COMMON_QUESTIONS;
}

const OBSTACLE_BY_ID = new Map<string, ObstaclePuzzle>(
  OBSTACLE_PUZZLES.map((p) => [p.id, p])
);

export function getRoomObstaclePuzzles(
  state?: OlympiaRoomState
): ObstaclePuzzle[] {
  if (state?.questionDeck?.obstaclePuzzles?.length) {
    const validVisualPuzzles = state.questionDeck.obstaclePuzzles
      .filter((p) => !p.id.startsWith('vcnv-csv-'))
      .map((p) => {
        const canonical = OBSTACLE_BY_ID.get(p.id);
        return canonical ? { ...p, imageUrl: canonical.imageUrl } : p;
      });
    const seenIds = new Set(validVisualPuzzles.map((p) => p.id));
    for (const p of OBSTACLE_PUZZLES) {
      if (!seenIds.has(p.id)) {
        validVisualPuzzles.push(p);
      }
    }
    if (validVisualPuzzles.length > 0) {
      return validVisualPuzzles;
    }
  }
  return OBSTACLE_PUZZLES;
}

export function buildDeterministicTangTocSet(
  seedKey: string,
  excludeIds?: Set<string>
): AccelerationQuestion[] {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash ^= seedKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  if (hash === 0) hash = 987654321;

  const nextRand = (): number => {
    hash = (hash + 0x6d2b79f5) >>> 0;
    let t = Math.imul(hash ^ (hash >>> 15), 1 | hash);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return ([1, 2, 3, 4] as const).map((num) => {
    const candidates = TANG_TOC_QUESTIONS.filter(
      (q) => q.number === num && (!excludeIds || !excludeIds.has(q.id))
    );
    const pool =
      candidates.length > 0
        ? candidates
        : TANG_TOC_QUESTIONS.filter((q) => q.number === num);
    const idx = Math.floor(nextRand() * pool.length);
    return pool[idx] || TANG_TOC_QUESTIONS[num - 1];
  });
}

export function getRoomTangTocQuestions(
  state?: OlympiaRoomState
): AccelerationQuestion[] {
  const deckQs = state?.questionDeck?.tangTocQuestions;
  const isLegacyUnshuffledDefault =
    deckQs &&
    deckQs.length === 40 &&
    deckQs[0]?.id === 'tt-1' &&
    deckQs[1]?.id === 'tt-2' &&
    deckQs[2]?.id === 'tt-3' &&
    deckQs[3]?.id === 'tt-4';

  if (deckQs && deckQs.length >= 4 && !isLegacyUnshuffledDefault) {
    return deckQs;
  }

  const seedKey = `${state?.roomCode || 'OLYMPIA'}|${
    state?.questionDeck?.deckId || 'default'
  }`;
  return buildDeterministicTangTocSet(seedKey);
}

export function getRoomVeDich20Questions(
  state?: OlympiaRoomState
): FinishQuestion[] {
  if (state?.questionDeck?.veDich20Questions?.length) {
    return state.questionDeck.veDich20Questions;
  }
  return VE_DICH_20_QUESTIONS;
}

export function getRoomVeDich30Questions(
  state?: OlympiaRoomState
): FinishQuestion[] {
  if (state?.questionDeck?.veDich30Questions?.length) {
    return state.questionDeck.veDich30Questions;
  }
  return VE_DICH_30_QUESTIONS;
}

export function getRoomTieBreakerQuestions(
  state?: OlympiaRoomState
): QuizQuestion[] {
  if (state?.questionDeck?.tieBreakerQuestions?.length) {
    return state.questionDeck.tieBreakerQuestions;
  }
  return TIE_BREAKER_QUESTIONS;
}

export function addRoomLog(
  state: OlympiaRoomState,
  round: string,
  text: string,
  delta?: string
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

export function getFinishQuestionById(
  id: string,
  state?: OlympiaRoomState
): FinishQuestion {
  const pool20 = getRoomVeDich20Questions(state);
  const pool30 = getRoomVeDich30Questions(state);
  const found20 =
    pool20.find((q) => q.id === id) ||
    VE_DICH_20_QUESTIONS.find((q) => q.id === id);
  if (found20) return found20;
  const found30 =
    pool30.find((q) => q.id === id) ||
    VE_DICH_30_QUESTIONS.find((q) => q.id === id);
  if (found30) return found30;
  return pool20[0] || VE_DICH_20_QUESTIONS[0];
}

export function getCnvRewardPoints(r2: OlympiaRoomState['round2']): number {
  if (
    r2.subPhase === 'ANSWERING_CENTER' ||
    r2.subPhase === 'FINAL_15S' ||
    r2.centerStatus !== 'UNOPENED'
  ) {
    return 20;
  }
  if (r2.openedRowCount <= 1) return 60;
  if (r2.openedRowCount === 2) return 50;
  if (r2.openedRowCount === 3) return 40;
  return 30;
}

export function canClientControlSeat(
  state: OlympiaRoomState,
  pos: 1 | 2 | 3 | 4,
  clientId?: string
): boolean {
  if (!clientId) return true;
  const seat = state.seats[pos - 1];
  if (!seat || !seat.claimedByClientId) return false;
  return seat.claimedByClientId === clientId;
}

export function isHostClient(
  state: OlympiaRoomState,
  clientId?: string
): boolean {
  if (!clientId) return true;
  const expectedHost = state.hostClientId || state.creatorClientId;
  if (!expectedHost) return false;
  return clientId === expectedHost;
}
