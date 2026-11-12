import type {
  OlympiaRoomState,
  ClimberSeat,
  RoomStage,
} from '../../types/olympia.ts';
import { mergeBuzzQueues } from './roomSelectors.ts';

export function createInitialRoomState(roomCode: string): OlympiaRoomState {
  const defaultSeats: [ClimberSeat, ClimberSeat, ClimberSeat, ClimberSeat] = (
    [1, 2, 3, 4] as const
  ).map((pos) => ({
    position: pos,
    name: 'Chưa có thí sinh',
    school: `Đang chờ vào vị trí ${pos}...`,
    claimedByClientId: null,
    isReady: false,
    score: 0,
    vcnvLocked: false,
    starUsed: false,
  })) as [ClimberSeat, ClimberSeat, ClimberSeat, ClimberSeat];

  return {
    roomCode: roomCode.toUpperCase(),
    version: 1,
    matchEpoch: 1,
    updatedAt: Date.now(),
    creatorClientId: null,
    hostClientId: null,
    hostName: 'MC Chủ Phòng',
    connectedClientsCount: 0,
    leftClientIds: {},
    kickedClientIds: {},
    seatUpdatedAt: {},
    stage: 'LOBBY',
    allowSharedDeviceControl: false,
    seats: defaultSeats,
    logs: [],
    round1: {
      subPhase: 'PERSONAL_READY',
      activePosition: 1,
      personalQIndex: 0,
      commonQIndex: 0,
      buzzedPosition: null,
      deadlineEpochMs: null,
      timerStarted: false,
      pendingPersonalAnswer: null,
      pendingCommonAnswer: null,
      personalHistory: [],
      lastFeedback: null,
    },
    round2: {
      puzzleIndex: 0,
      subPhase: 'SELECT_ROW',
      selectorPosition: 1,
      activeRowId: null,
      openedRowCount: 0,
      rowStatuses: {
        1: 'UNOPENED',
        2: 'UNOPENED',
        3: 'UNOPENED',
        4: 'UNOPENED',
      },
      centerStatus: 'UNOPENED',
      rowSubmissions: {},
      mcGrades: {},
      cnvBuzzerPosition: null,
      pendingCnvKeyword: null,
      deadlineEpochMs: null,
      timerStarted: false,
      lastFeedback: null,
      lastRowEvaluation: null,
      cnvWinner: null,
    },
    round3: {
      subPhase: 'INTRO',
      qIndex: 0,
      questionStartEpochMs: 0,
      deadlineEpochMs: null,
      timerStarted: false,
      submissions: {},
      mcGrades: {},
      rankedResults: [],
    },
    round4: {
      subPhase: 'SELECT_PACKAGE',
      turnOrder: [1, 2, 3, 4],
      turnIndex: 0,
      activePosition: 1,
      packagePoints: [20, 20, 30],
      questionIds: ['vd20-1', 'vd20-2', 'vd30-1'],
      qIndex: 0,
      starActiveThisQ: false,
      stealerPosition: null,
      deadlineEpochMs: null,
      timerStarted: false,
      mainSubmittedAnswer: null,
      stealSubmittedAnswer: null,
      lastResult: null,
      used20Ids: [],
      used30Ids: [],
    },
    tieBreaker: {
      tiedPositions: [],
      subPhase: 'BUZZ_OPEN',
      buzzedPosition: null,
      pendingAnswer: null,
      deadlineEpochMs: null,
      lastFeedback: null,
    },
  };
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
  incoming: OlympiaRoomState
): OlympiaRoomState {
  if (!local) return JSON.parse(JSON.stringify(incoming));
  if (!incoming) return JSON.parse(JSON.stringify(local));

  const resolvedCreator =
    local.creatorClientId ||
    incoming.creatorClientId ||
    local.hostClientId ||
    incoming.hostClientId ||
    null;

  const resolvedHostName =
    incoming.hostName || local.hostName || 'MC Chủ Phòng';

  const localVer = local.version || 0;
  const incomingVer = incoming.version || 0;
  const resolvedDeck =
    incomingVer > localVer && incoming.questionDeck
      ? incoming.questionDeck
      : local.questionDeck || incoming.questionDeck;

  const ensureHostIntegrity = (st: OlympiaRoomState): OlympiaRoomState => {
    const copy: OlympiaRoomState = JSON.parse(JSON.stringify(st));
    const creator =
      resolvedCreator || copy.creatorClientId || copy.hostClientId || null;
    copy.creatorClientId = creator;
    copy.hostClientId = creator;
    copy.hostName = copy.hostName || resolvedHostName;
    if (resolvedDeck) {
      copy.questionDeck = resolvedDeck;
    }
    return copy;
  };

  const localEpoch = local.matchEpoch || 1;
  const incomingEpoch = incoming.matchEpoch || 1;

  if (incomingEpoch > localEpoch) return ensureHostIntegrity(incoming);
  if (localEpoch > incomingEpoch) return ensureHostIntegrity(local);

  const localRank = STAGE_RANK[local.stage] ?? 0;
  const incomingRank = STAGE_RANK[incoming.stage] ?? 0;

  if (incomingRank > localRank) return ensureHostIntegrity(incoming);
  if (localRank > incomingRank) return ensureHostIntegrity(local);

  if (local.stage !== 'LOBBY') {
    let winnerState: OlympiaRoomState;
    let otherState: OlympiaRoomState;

    if (incomingVer > localVer) {
      winnerState = incoming;
      otherState = local;
    } else if (localVer > incomingVer) {
      winnerState = local;
      otherState = incoming;
    } else {
      if (
        local.stage === 'ROUND_1_KHOI_DONG' &&
        local.round1.commonQIndex === incoming.round1.commonQIndex &&
        local.round1.buzzedPosition !== null &&
        incoming.round1.buzzedPosition !== null &&
        local.round1.buzzedPosition !== incoming.round1.buzzedPosition
      ) {
        const localBuzzTs = local.round1.buzzedAtMs || local.updatedAt || 0;
        const incBuzzTs =
          incoming.round1.buzzedAtMs || incoming.updatedAt || 0;
        winnerState = incBuzzTs < localBuzzTs ? incoming : local;
        otherState = winnerState === incoming ? local : incoming;
      } else if (
        local.stage === 'ROUND_2_VCNV' &&
        local.round2.cnvBuzzerPosition !== null &&
        incoming.round2.cnvBuzzerPosition !== null &&
        local.round2.cnvBuzzerPosition !== incoming.round2.cnvBuzzerPosition
      ) {
        const localBuzzTs = local.round2.cnvBuzzedAtMs || local.updatedAt || 0;
        const incBuzzTs =
          incoming.round2.cnvBuzzedAtMs || incoming.updatedAt || 0;
        winnerState = incBuzzTs < localBuzzTs ? incoming : local;
        otherState = winnerState === incoming ? local : incoming;
      } else if (
        local.stage === 'ROUND_4_VE_DICH' &&
        local.round4.turnIndex === incoming.round4.turnIndex &&
        local.round4.qIndex === incoming.round4.qIndex &&
        local.round4.stealerPosition !== null &&
        incoming.round4.stealerPosition !== null &&
        local.round4.stealerPosition !== incoming.round4.stealerPosition
      ) {
        const localBuzzTs =
          local.round4.stealerBuzzedAtMs || local.updatedAt || 0;
        const incBuzzTs =
          incoming.round4.stealerBuzzedAtMs || incoming.updatedAt || 0;
        winnerState = incBuzzTs < localBuzzTs ? incoming : local;
        otherState = winnerState === incoming ? local : incoming;
      } else if (
        local.stage === 'TIE_BREAKER' &&
        local.tieBreaker.buzzedPosition !== null &&
        incoming.tieBreaker.buzzedPosition !== null &&
        local.tieBreaker.buzzedPosition !== incoming.tieBreaker.buzzedPosition
      ) {
        const localBuzzTs =
          local.tieBreaker.buzzedAtMs || local.updatedAt || 0;
        const incBuzzTs =
          incoming.tieBreaker.buzzedAtMs || incoming.updatedAt || 0;
        winnerState = incBuzzTs < localBuzzTs ? incoming : local;
        otherState = winnerState === incoming ? local : incoming;
      } else if ((incoming.updatedAt || 0) >= (local.updatedAt || 0)) {
        winnerState = incoming;
        otherState = local;
      } else {
        winnerState = local;
        otherState = incoming;
      }
    }

    const result = ensureHostIntegrity(winnerState);

    if (
      result.stage === 'ROUND_1_KHOI_DONG' &&
      otherState.stage === 'ROUND_1_KHOI_DONG' &&
      result.round1.commonQIndex === otherState.round1.commonQIndex &&
      (result.round1.subPhase === 'COMMON_BUZZ_OPEN' ||
        result.round1.subPhase === 'COMMON_ANSWERING') &&
      (otherState.round1.subPhase === 'COMMON_BUZZ_OPEN' ||
        otherState.round1.subPhase === 'COMMON_ANSWERING')
    ) {
      const mergedQueue = mergeBuzzQueues(
        result.round1.buzzQueue,
        otherState.round1.buzzQueue
      );
      if (mergedQueue.length > 0) {
        result.round1.buzzQueue = mergedQueue;
        if (!result.round1.pendingCommonAnswer) {
          result.round1.buzzedPosition = mergedQueue[0].position;
          result.round1.buzzedAtMs = mergedQueue[0].timestampMs;
          result.round1.subPhase = 'COMMON_ANSWERING';
        }
      }
    }

    if (
      result.stage === 'ROUND_2_VCNV' &&
      otherState.stage === 'ROUND_2_VCNV' &&
      result.round2.puzzleIndex === otherState.round2.puzzleIndex &&
      result.round2.subPhase !== 'ROUND_SUMMARY' &&
      otherState.round2.subPhase !== 'ROUND_SUMMARY'
    ) {
      const mergedCnvQueue = mergeBuzzQueues(
        result.round2.cnvBuzzQueue,
        otherState.round2.cnvBuzzQueue
      ).filter((entry) => !result.seats[entry.position - 1]?.vcnvLocked);
      if (mergedCnvQueue.length > 0) {
        result.round2.cnvBuzzQueue = mergedCnvQueue;
        if (
          !result.round2.pendingCnvKeyword &&
          result.round2.cnvBuzzerPosition !== null
        ) {
          result.round2.cnvBuzzerPosition = mergedCnvQueue[0].position;
          result.round2.cnvBuzzedAtMs = mergedCnvQueue[0].timestampMs;
        }
      }
    }

    if (
      result.stage === 'ROUND_2_VCNV' &&
      otherState.stage === 'ROUND_2_VCNV' &&
      result.round2.activeRowId === otherState.round2.activeRowId &&
      (result.round2.subPhase === 'ANSWERING_ROW' ||
        result.round2.subPhase === 'ANSWERING_CENTER')
    ) {
      result.round2.rowSubmissions = {
        ...(otherState.round2.rowSubmissions || {}),
        ...(result.round2.rowSubmissions || {}),
      };
      result.round2.mcGrades = {
        ...(otherState.round2.mcGrades || {}),
        ...(result.round2.mcGrades || {}),
      };
    }

    if (
      result.stage === 'ROUND_4_VE_DICH' &&
      otherState.stage === 'ROUND_4_VE_DICH' &&
      result.round4.turnIndex === otherState.round4.turnIndex &&
      result.round4.qIndex === otherState.round4.qIndex &&
      (result.round4.subPhase === 'STEAL_WINDOW' ||
        result.round4.subPhase === 'STEAL_ANSWERING') &&
      (otherState.round4.subPhase === 'STEAL_WINDOW' ||
        otherState.round4.subPhase === 'STEAL_ANSWERING')
    ) {
      const mergedStealQueue = mergeBuzzQueues(
        result.round4.stealBuzzQueue,
        otherState.round4.stealBuzzQueue
      );
      if (mergedStealQueue.length > 0) {
        result.round4.stealBuzzQueue = mergedStealQueue;
        if (!result.round4.stealSubmittedAnswer) {
          result.round4.stealerPosition = mergedStealQueue[0].position;
          result.round4.stealerBuzzedAtMs = mergedStealQueue[0].timestampMs;
          result.round4.subPhase = 'STEAL_ANSWERING';
        }
      }
    }

    if (
      result.stage === 'TIE_BREAKER' &&
      otherState.stage === 'TIE_BREAKER' &&
      (result.tieBreaker.subPhase === 'BUZZ_OPEN' ||
        result.tieBreaker.subPhase === 'ANSWERING') &&
      (otherState.tieBreaker.subPhase === 'BUZZ_OPEN' ||
        otherState.tieBreaker.subPhase === 'ANSWERING')
    ) {
      const mergedTbQueue = mergeBuzzQueues(
        result.tieBreaker.buzzQueue,
        otherState.tieBreaker.buzzQueue
      ).filter((entry) =>
        result.tieBreaker.tiedPositions.includes(entry.position)
      );
      if (mergedTbQueue.length > 0) {
        result.tieBreaker.buzzQueue = mergedTbQueue;
        if (!result.tieBreaker.pendingAnswer) {
          result.tieBreaker.buzzedPosition = mergedTbQueue[0].position;
          result.tieBreaker.buzzedAtMs = mergedTbQueue[0].timestampMs;
          result.tieBreaker.subPhase = 'ANSWERING';
        }
      }
    }

    if (
      result.stage === 'ROUND_3_TANG_TOC' &&
      otherState.stage === 'ROUND_3_TANG_TOC' &&
      result.round3.qIndex === otherState.round3.qIndex &&
      result.round3.subPhase === 'QUESTION_ACTIVE'
    ) {
      const mergedSubs = { ...(otherState.round3.submissions || {}) };
      for (const [posKey, sub] of Object.entries(
        result.round3.submissions || {}
      )) {
        const pos = Number(posKey);
        const existing = mergedSubs[pos];
        if (!existing) {
          mergedSubs[pos] = sub;
        } else if (existing.answer === sub.answer) {
          mergedSubs[pos] = existing.timeSec <= sub.timeSec ? existing : sub;
        } else {
          mergedSubs[pos] = sub;
        }
      }
      result.round3.submissions = mergedSubs;
      result.round3.mcGrades = {
        ...(otherState.round3.mcGrades || {}),
        ...(result.round3.mcGrades || {}),
      };
    }

    return result;
  }

  const isIncomingNewer =
    (incoming.version || 0) > (local.version || 0) ||
    ((incoming.version || 0) === (local.version || 0) &&
      (incoming.updatedAt || 0) >= (local.updatedAt || 0));

  const newerState = isIncomingNewer ? incoming : local;
  const olderState = isIncomingNewer ? local : incoming;

  const base: OlympiaRoomState = JSON.parse(JSON.stringify(newerState));

  const mergedLeft: Record<string, number> = {
    ...(local.leftClientIds || {}),
  };
  for (const [cid, ts] of Object.entries(incoming.leftClientIds || {})) {
    mergedLeft[cid] = Math.max(mergedLeft[cid] || 0, ts);
  }

  const mergedKicked: Record<string, number> = {
    ...(local.kickedClientIds || {}),
  };
  for (const [cid, ts] of Object.entries(incoming.kickedClientIds || {})) {
    mergedKicked[cid] = Math.max(mergedKicked[cid] || 0, ts);
  }

  const mergedSeatUpdated: Record<string, number> = {
    ...(olderState.seatUpdatedAt || {}),
    ...(newerState.seatUpdatedAt || {}),
  };

  const creatorClientId = resolvedCreator;

  const newSeats: [ClimberSeat, ClimberSeat, ClimberSeat, ClimberSeat] = [
    1, 2, 3, 4,
  ].map((pos) => ({
    position: pos as 1 | 2 | 3 | 4,
    name: 'Chưa có thí sinh',
    school: `Đang chờ vào vị trí ${pos}...`,
    claimedByClientId: null,
    isReady: false,
    score: 0,
    vcnvLocked: false,
    starUsed: false,
  })) as [ClimberSeat, ClimberSeat, ClimberSeat, ClimberSeat];

  const placedClientIds = new Set<string>();

  for (const s of newerState.seats) {
    if (!s.claimedByClientId) continue;
    const cid = s.claimedByClientId;
    if (creatorClientId && cid === creatorClientId) continue;
    const claimTs = mergedSeatUpdated[cid] || newerState.updatedAt || 1;
    const leftTs = Math.max(mergedLeft[cid] || 0, mergedKicked[cid] || 0);
    if (leftTs > claimTs || placedClientIds.has(cid)) continue;

    const target = newSeats[s.position - 1];
    if (target && !target.claimedByClientId) {
      target.claimedByClientId = cid;
      target.name = s.name;
      target.school = s.school;
      target.isReady = true;
      placedClientIds.add(cid);
    }
  }

  for (const s of olderState.seats) {
    if (!s.claimedByClientId) continue;
    const cid = s.claimedByClientId;
    if (creatorClientId && cid === creatorClientId) continue;
    if (placedClientIds.has(cid)) continue;
    const claimTs = mergedSeatUpdated[cid] || olderState.updatedAt || 1;
    const leftTs = Math.max(mergedLeft[cid] || 0, mergedKicked[cid] || 0);
    if (leftTs >= claimTs) continue;

    const preferred = newSeats[s.position - 1];
    const target =
      preferred && !preferred.claimedByClientId
        ? preferred
        : newSeats.find((seat) => !seat.claimedByClientId);
    if (target) {
      target.claimedByClientId = cid;
      target.name = s.name;
      target.school = s.school;
      target.isReady = true;
      placedClientIds.add(cid);
    }
  }

  const seenLogs = new Set<string>();
  const mergedLogs = [...(incoming.logs || []), ...(local.logs || [])].filter(
    (item) => {
      const key = `${item.round}|${item.text}`;
      if (seenLogs.has(key)) return false;
      seenLogs.add(key);
      return true;
    }
  );
  mergedLogs.length = Math.min(mergedLogs.length, 80);

  const occupiedCount = newSeats.filter((s) =>
    Boolean(s.claimedByClientId)
  ).length;

  base.creatorClientId = creatorClientId;
  base.hostClientId = creatorClientId;
  base.hostName = resolvedHostName;
  base.leftClientIds = mergedLeft;
  base.kickedClientIds = mergedKicked;
  base.seatUpdatedAt = mergedSeatUpdated;
  base.seats = newSeats;
  base.logs = mergedLogs;
  base.questionDeck = resolvedDeck;
  base.allowSharedDeviceControl = false;
  base.matchEpoch = Math.max(local.matchEpoch || 1, incoming.matchEpoch || 1);
  base.version = Math.max(local.version || 1, incoming.version || 1);
  base.updatedAt = Math.max(local.updatedAt || 0, incoming.updatedAt || 0);
  base.connectedClientsCount = Math.max(
    local.connectedClientsCount || 0,
    incoming.connectedClientsCount || 0,
    occupiedCount + (creatorClientId ? 1 : 0)
  );

  return base;
}
