import type {
  OlympiaRoomState,
  ClientAction,
  ClimberSeat,
} from '../../types/olympia.ts';
import {
  addRoomLog,
  isHostClient,
  getRoomTangTocQuestions,
  getFinishQuestionById,
  buildDeterministicTangTocSet,
  getRoomObstaclePuzzles,
} from './roomSelectors.ts';
import { createInitialRoomState } from './roomMerge.ts';

export function applyLobbyAndMcAction(
  state: OlympiaRoomState,
  currentState: OlympiaRoomState,
  action: ClientAction,
  nowMs: number
): OlympiaRoomState | null {
  switch (action.type) {
    case 'JOIN_OR_CLAIM_SEAT': {
      if (action.isCreatingRoom) {
        state.creatorClientId = action.clientId;
        state.hostClientId = action.clientId;
        state.hostName = action.name.trim() || 'MC Chủ Phòng';
        state.seats.forEach((s) => {
          if (s.claimedByClientId === action.clientId) {
            s.claimedByClientId = null;
            s.isReady = false;
            s.name = 'Chưa có thí sinh';
            s.school = `Đang chờ vào vị trí ${s.position}...`;
          }
        });
        addRoomLog(
          state,
          'Phòng chờ',
          `MC Chủ Phòng ${state.hostName} đã mở phòng thi đấu! Đang chờ 4 Nhà Leo Núi vào vị trí 1, 2, 3, 4.`
        );
        return state;
      }

      if (
        action.clientId === state.creatorClientId ||
        action.clientId === state.hostClientId
      ) {
        if (action.name.trim()) {
          state.hostName = action.name.trim();
        }
        return state;
      }

      delete state.leftClientIds![action.clientId];
      delete state.kickedClientIds![action.clientId];
      state.seatUpdatedAt![action.clientId] = nowMs;

      const existingSeat = state.seats.find(
        (s) => s.claimedByClientId === action.clientId
      );

      if (existingSeat && !action.preferredPosition) {
        existingSeat.name =
          action.name.trim() || `Nhà Leo Núi ${existingSeat.position}`;
        existingSeat.school = action.school.trim() || 'THPT Chuyên';
        existingSeat.isReady = true;
        return state;
      }

      let targetSeat = action.preferredPosition
        ? state.seats[action.preferredPosition - 1]
        : undefined;

      if (
        !targetSeat ||
        (targetSeat.claimedByClientId &&
          targetSeat.claimedByClientId !== action.clientId)
      ) {
        targetSeat = state.seats.find((s) => !s.claimedByClientId);
      }

      if (targetSeat) {
        if (existingSeat && existingSeat.position !== targetSeat.position) {
          existingSeat.claimedByClientId = null;
          existingSeat.isReady = false;
          existingSeat.name = 'Chưa có thí sinh';
          existingSeat.school = `Đang chờ vào vị trí ${existingSeat.position}...`;
        }

        targetSeat.claimedByClientId = action.clientId;
        targetSeat.isReady = true;
        targetSeat.name =
          action.name.trim() || `Nhà Leo Núi ${targetSeat.position}`;
        targetSeat.school = action.school.trim() || 'THPT Chuyên';

        const count = state.seats.filter((s) =>
          Boolean(s.claimedByClientId)
        ).length;
        addRoomLog(
          state,
          'Phòng chờ',
          `${targetSeat.name} (${targetSeat.school}) đã vào Vị trí số ${targetSeat.position} (${count}/4 thí sinh).`
        );
      }
      return state;
    }

    case 'CLAIM_SEAT': {
      if (isHostClient(state, action.clientId)) return currentState;
      const seat = state.seats[action.position - 1];
      if (!seat) return currentState;
      if (
        seat.claimedByClientId &&
        seat.claimedByClientId !== action.clientId
      ) {
        return currentState;
      }

      delete state.leftClientIds![action.clientId];
      delete state.kickedClientIds![action.clientId];
      state.seatUpdatedAt![action.clientId] = nowMs;

      state.seats.forEach((s) => {
        if (
          s.claimedByClientId === action.clientId &&
          s.position !== action.position
        ) {
          s.claimedByClientId = null;
          s.isReady = false;
          s.name = 'Chưa có thí sinh';
          s.school = `Đang chờ vào vị trí ${s.position}...`;
        }
      });

      seat.name = action.name.trim() || `Nhà Leo Núi ${action.position}`;
      seat.school = action.school.trim() || 'THPT Chuyên';
      seat.claimedByClientId = action.clientId;
      seat.isReady = true;

      const count = state.seats.filter((s) =>
        Boolean(s.claimedByClientId)
      ).length;
      addRoomLog(
        state,
        'Phòng chờ',
        `${seat.name} (${seat.school}) đã nhận Vị trí số ${action.position} (${count}/4 thí sinh).`
      );
      return state;
    }

    case 'MC_SWAP_SEATS': {
      if (!isHostClient(state, action.clientId)) return currentState;
      const { posA, posB } = action;
      if (posA === posB) return currentState;
      const seatA = state.seats[posA - 1];
      const seatB = state.seats[posB - 1];
      if (!seatA || !seatB) return currentState;

      const copyA = { ...seatA };
      const copyB = { ...seatB };

      const applyToSeat = (
        target: ClimberSeat,
        src: ClimberSeat,
        targetPos: 1 | 2 | 3 | 4
      ) => {
        if (src.claimedByClientId) {
          target.claimedByClientId = src.claimedByClientId;
          target.name = src.name;
          target.school = src.school;
          target.isReady = src.isReady;
          target.score = src.score;
          target.vcnvLocked = src.vcnvLocked;
          target.starUsed = src.starUsed;
          state.seatUpdatedAt![src.claimedByClientId] = nowMs;
        } else {
          target.claimedByClientId = null;
          target.name = 'Chưa có thí sinh';
          target.school = `Đang chờ vào vị trí ${targetPos}...`;
          target.isReady = false;
          target.score = 0;
          target.vcnvLocked = false;
          target.starUsed = false;
        }
      };

      applyToSeat(seatA, copyB, posA);
      applyToSeat(seatB, copyA, posB);

      addRoomLog(
        state,
        'MC Điều phối',
        `MC Chủ Phòng đã đổi chỗ Vị trí số ${posA} (${seatA.name}) và Vị trí số ${posB} (${seatB.name}).`
      );
      return state;
    }

    case 'MC_KICK_PLAYER': {
      if (!isHostClient(state, action.clientId)) return currentState;
      const seat = state.seats[action.position - 1];
      if (!seat || !seat.claimedByClientId) return currentState;

      const kickedCid = seat.claimedByClientId;
      const kickedName = seat.name;
      state.leftClientIds![kickedCid] = nowMs + 60000;
      state.kickedClientIds![kickedCid] = nowMs + 60000;
      delete state.seatUpdatedAt![kickedCid];

      seat.claimedByClientId = null;
      seat.isReady = false;
      seat.name = 'Chưa có thí sinh';
      seat.school = `Đang chờ vào vị trí ${action.position}...`;
      seat.score = 0;
      seat.vcnvLocked = false;
      seat.starUsed = false;

      const count = state.seats.filter((s) =>
        Boolean(s.claimedByClientId)
      ).length;
      addRoomLog(
        state,
        'MC Điều phối',
        `MC Chủ Phòng đã mời ${kickedName} (Vị trí số ${action.position}) rời khỏi phòng (${count}/4 thí sinh).`
      );
      return state;
    }

    case 'MC_START_QUESTION_TIMER': {
      if (!isHostClient(state, action.clientId)) return currentState;
      if (
        state.stage === 'ROUND_1_KHOI_DONG' &&
        state.round1.subPhase === 'PERSONAL_ACTIVE'
      ) {
        state.round1.deadlineEpochMs = nowMs + 12000;
        state.round1.timerStarted = true;
        return state;
      }
      if (
        state.stage === 'ROUND_2_VCNV' &&
        (state.round2.subPhase === 'ANSWERING_ROW' ||
          state.round2.subPhase === 'ANSWERING_CENTER')
      ) {
        state.round2.cnvPhaseStartMs = nowMs;
        state.round2.deadlineEpochMs = nowMs + 15000;
        state.round2.timerStarted = true;
        return state;
      }
      if (
        state.stage === 'ROUND_3_TANG_TOC' &&
        state.round3.subPhase === 'QUESTION_ACTIVE'
      ) {
        const ttPool = getRoomTangTocQuestions(state);
        const q = ttPool[state.round3.qIndex] || ttPool[0];
        state.round3.questionStartEpochMs = nowMs;
        state.round3.deadlineEpochMs = nowMs + q.timeLimitSec * 1000;
        state.round3.timerStarted = true;
        return state;
      }
      if (
        state.stage === 'ROUND_4_VE_DICH' &&
        state.round4.subPhase === 'MAIN_ANSWERING'
      ) {
        const q = getFinishQuestionById(
          state.round4.questionIds[state.round4.qIndex],
          state
        );
        state.round4.deadlineEpochMs =
          nowMs + (q.points === 20 ? 15000 : 20000);
        state.round4.timerStarted = true;
        return state;
      }
      return currentState;
    }

    case 'MC_SELECT_BUZZER_WINNER': {
      if (!isHostClient(state, action.clientId)) return currentState;
      const targetPos = action.position;
      const targetSeat = state.seats[targetPos - 1];
      if (!targetSeat) return currentState;

      if (
        state.stage === 'ROUND_1_KHOI_DONG' &&
        (state.round1.subPhase === 'COMMON_BUZZ_OPEN' ||
          state.round1.subPhase === 'COMMON_ANSWERING')
      ) {
        const entry = (state.round1.buzzQueue || []).find(
          (b) => b.position === targetPos
        );
        state.round1.buzzedPosition = targetPos;
        state.round1.buzzedAtMs = entry?.timestampMs || nowMs;
        state.round1.pendingCommonAnswer = null;
        state.round1.subPhase = 'COMMON_ANSWERING';
        state.round1.deadlineEpochMs = nowMs + 12000;
        state.round1.timerStarted = true;
        addRoomLog(
          state,
          'Khởi Động Chung',
          `MC chọn ${targetSeat.name} (Vị trí ${targetPos}${
            entry ? ` · ${entry.elapsedSec.toFixed(2)}s` : ''
          }) trả lời câu hỏi chung số ${state.round1.commonQIndex + 1}!`
        );
        return state;
      }

      if (
        state.stage === 'ROUND_2_VCNV' &&
        state.round2.subPhase !== 'ROUND_SUMMARY' &&
        !targetSeat.vcnvLocked
      ) {
        const entry = (state.round2.cnvBuzzQueue || []).find(
          (b) => b.position === targetPos
        );
        state.round2.cnvBuzzerPosition = targetPos;
        state.round2.cnvBuzzedAtMs = entry?.timestampMs || nowMs;
        state.round2.pendingCnvKeyword = null;
        addRoomLog(
          state,
          'VCNV',
          `MC chọn ${targetSeat.name} (Vị trí ${targetPos}${
            entry ? ` · ${entry.elapsedSec.toFixed(2)}s` : ''
          }) trả lời từ khóa Chướng Ngại Vật!`
        );
        return state;
      }

      if (
        state.stage === 'ROUND_4_VE_DICH' &&
        (state.round4.subPhase === 'STEAL_WINDOW' ||
          state.round4.subPhase === 'STEAL_ANSWERING') &&
        targetPos !== state.round4.activePosition
      ) {
        const entry = (state.round4.stealBuzzQueue || []).find(
          (b) => b.position === targetPos
        );
        state.round4.stealerPosition = targetPos;
        state.round4.stealerBuzzedAtMs = entry?.timestampMs || nowMs;
        state.round4.stealSubmittedAnswer = null;
        state.round4.subPhase = 'STEAL_ANSWERING';
        state.round4.deadlineEpochMs = nowMs + 12000;
        state.round4.timerStarted = true;
        addRoomLog(
          state,
          'Về Đích',
          `MC chọn ${targetSeat.name} (Vị trí ${targetPos}${
            entry ? ` · ${entry.elapsedSec.toFixed(2)}s` : ''
          }) giành quyền trả lời câu hỏi Về Đích!`
        );
        return state;
      }

      if (
        state.stage === 'TIE_BREAKER' &&
        (state.tieBreaker.subPhase === 'BUZZ_OPEN' ||
          state.tieBreaker.subPhase === 'ANSWERING') &&
        state.tieBreaker.tiedPositions.includes(targetPos)
      ) {
        const entry = (state.tieBreaker.buzzQueue || []).find(
          (b) => b.position === targetPos
        );
        state.tieBreaker.buzzedPosition = targetPos;
        state.tieBreaker.buzzedAtMs = entry?.timestampMs || nowMs;
        state.tieBreaker.pendingAnswer = null;
        state.tieBreaker.subPhase = 'ANSWERING';
        state.tieBreaker.deadlineEpochMs = nowMs + 12000;
        addRoomLog(
          state,
          'Câu hỏi phụ',
          `MC chọn ${targetSeat.name} (Vị trí ${targetPos}${
            entry ? ` · ${entry.elapsedSec.toFixed(2)}s` : ''
          }) trả lời Câu hỏi phụ!`
        );
        return state;
      }

      return currentState;
    }

    case 'UPDATE_SEAT_INFO': {
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
      seat.school = action.school.trim() || 'THPT Chuyên';
      return state;
    }

    case 'LEAVE_SEAT': {
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
        state.leftClientIds![leavingClientId] = nowMs;
      }
      seat.claimedByClientId = null;
      seat.isReady = false;
      seat.name = 'Chưa có thí sinh';
      seat.school = `Đang chờ vào vị trí ${action.position}...`;

      const count = state.seats.filter((s) =>
        Boolean(s.claimedByClientId)
      ).length;
      addRoomLog(
        state,
        'Phòng chờ',
        `${oldName} đã rời khỏi Vị trí số ${action.position} (${count}/4 thí sinh).`
      );
      return state;
    }

    case 'SET_QUESTION_DECK': {
      state.questionDeck = action.deck;
      state.round2.puzzleIndex = 0;
      addRoomLog(
        state,
        'Ngân hàng câu hỏi',
        `Đã nạp bộ đề thi mới: ${action.deck.label}`
      );
      return state;
    }

    case 'TOGGLE_SHARED_CONTROL': {
      state.allowSharedDeviceControl = false;
      return state;
    }

    case 'RESET_ROOM': {
      const fresh = createInitialRoomState(state.roomCode);
      fresh.creatorClientId = state.creatorClientId;
      fresh.hostClientId = state.hostClientId;
      fresh.hostName = state.hostName || 'MC Chủ Phòng';
      fresh.connectedClientsCount = state.connectedClientsCount;
      fresh.seatUpdatedAt = state.seatUpdatedAt || {};
      fresh.leftClientIds = state.leftClientIds || {};
      fresh.kickedClientIds = state.kickedClientIds || {};
      fresh.processedActionIds = state.processedActionIds || [];
      fresh.matchEpoch = (state.matchEpoch || 1) + 1;
      fresh.version = (state.version || 1) + 10;
      fresh.updatedAt = nowMs;
      if (state.questionDeck) {
        const currentTtIds = new Set(
          (state.questionDeck.tangTocQuestions || [])
            .slice(0, 4)
            .map((q) => q.id)
        );
        fresh.questionDeck = {
          ...state.questionDeck,
          deckId: `${state.questionDeck.deckId}-v${fresh.version}`,
          tangTocQuestions: buildDeterministicTangTocSet(
            `${state.roomCode}|reset|${fresh.version}`,
            currentTtIds
          ),
        };
      }
      fresh.seats = state.seats.map((s) => ({
        ...s,
        score: 0,
        vcnvLocked: false,
        starUsed: false,
      })) as [ClimberSeat, ClimberSeat, ClimberSeat, ClimberSeat];
      fresh.allowSharedDeviceControl = false;
      addRoomLog(
        fresh,
        'Phòng chờ',
        'MC Chủ Phòng đã đưa trận đấu quay về Phòng Chờ để chuẩn bị thi đấu lại!'
      );
      return fresh;
    }

    case 'FILL_DEMO_BOTS': {
      if (!isHostClient(state, action.clientId)) return currentState;
      const demoProfiles: Record<1 | 2 | 3 | 4, { name: string; school: string }> =
        {
          1: { name: 'Nguyễn Minh Quân', school: 'THPT Chuyên KHTN' },
          2: {
            name: 'Trần Hoàng Bảo',
            school: 'THPT Chuyên Hà Nội - Amsterdam',
          },
          3: { name: 'Lê Ngọc Minh Châu', school: 'THPT Chuyên Quốc Học Huế' },
          4: { name: 'Phạm Đức Duy', school: 'THPT Chuyên Lê Hồng Phong' },
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
        'Chế độ Demo',
        'MC Chủ Phòng đã bổ sung các Nhà Leo Núi giả lập vào đủ 4/4 vị trí xuất phát!'
      );
      return state;
    }

    case 'START_DEMO_MATCH': {
      state.creatorClientId = action.clientId;
      state.hostClientId = action.clientId;
      state.hostName = action.name.trim() || 'MC Chủ Phòng';
      state.allowSharedDeviceControl = false;

      const demoSeats: [ClimberSeat, ClimberSeat, ClimberSeat, ClimberSeat] = [
        {
          position: 1,
          name: 'Nguyễn Minh Quân',
          school: 'THPT Chuyên KHTN',
          claimedByClientId: 'BOT_SIM_1',
          isReady: true,
          score: 0,
          vcnvLocked: false,
          starUsed: false,
        },
        {
          position: 2,
          name: 'Trần Hoàng Bảo',
          school: 'THPT Chuyên Hà Nội - Amsterdam',
          claimedByClientId: 'BOT_SIM_2',
          isReady: true,
          score: 0,
          vcnvLocked: false,
          starUsed: false,
        },
        {
          position: 3,
          name: 'Lê Ngọc Minh Châu',
          school: 'THPT Chuyên Quốc Học Huế',
          claimedByClientId: 'BOT_SIM_3',
          isReady: true,
          score: 0,
          vcnvLocked: false,
          starUsed: false,
        },
        {
          position: 4,
          name: 'Phạm Đức Duy',
          school: 'THPT Chuyên Lê Hồng Phong',
          claimedByClientId: 'BOT_SIM_4',
          isReady: true,
          score: 0,
          vcnvLocked: false,
          starUsed: false,
        },
      ];
      state.seats = demoSeats;
      state.seatUpdatedAt = {
        BOT_SIM_1: nowMs,
        BOT_SIM_2: nowMs,
        BOT_SIM_3: nowMs,
        BOT_SIM_4: nowMs,
      };
      state.leftClientIds = {};
      state.stage = 'ROUND_1_KHOI_DONG';
      state.round1 = {
        subPhase: 'PERSONAL_READY',
        activePosition: 1,
        personalQIndex: 0,
        commonQIndex: 0,
        buzzedPosition: null,
        deadlineEpochMs: null,
        pendingPersonalAnswer: null,
        pendingCommonAnswer: null,
        personalHistory: [],
        lastFeedback: null,
      };
      addRoomLog(
        state,
        'Chế độ Demo',
        `Khởi tạo trận đấu Demo: MC Chủ Phòng (${state.hostName}) điều phối 4 Nhà Leo Núi bước vào Phần 1: Khởi Động!`
      );
      return state;
    }

    case 'START_MATCH': {
      if (!isHostClient(state, action.clientId)) return currentState;
      const occupiedCount = state.seats.filter((s) =>
        Boolean(s.claimedByClientId)
      ).length;
      if (state.stage === 'LOBBY' && occupiedCount < 4) {
        addRoomLog(
          state,
          'Hệ thống',
          `Chưa thể bắt đầu! Phòng hiện mới có ${occupiedCount}/4 Nhà Leo Núi.`
        );
        return currentState;
      }

      const target = action.targetStage || 'ROUND_1_KHOI_DONG';

      if (state.stage === 'LOBBY' && target !== 'ROUND_1_KHOI_DONG') {
        return currentState;
      }
      if (state.stage === 'ROUND_1_KHOI_DONG') {
        if (
          target !== 'ROUND_2_VCNV' ||
          state.round1.subPhase !== 'ROUND_SUMMARY'
        ) {
          return currentState;
        }
      }
      if (state.stage === 'ROUND_2_VCNV') {
        if (
          target !== 'ROUND_3_TANG_TOC' ||
          (state.round2.subPhase !== 'ROUND_SUMMARY' &&
            state.round2.subPhase !== 'FINAL_15S')
        ) {
          return currentState;
        }
      }
      if (state.stage === 'ROUND_3_TANG_TOC') {
        if (
          target !== 'ROUND_4_VE_DICH' ||
          state.round3.subPhase !== 'QUESTION_RESULT' ||
          state.round3.qIndex < 3
        ) {
          return currentState;
        }
      }
      if (state.stage === 'ROUND_4_VE_DICH') {
        return currentState;
      }

      state.stage = target;
      if (target === 'ROUND_1_KHOI_DONG') {
        state.round1 = {
          subPhase: 'PERSONAL_READY',
          activePosition: 1,
          personalQIndex: 0,
          commonQIndex: 0,
          buzzedPosition: null,
          deadlineEpochMs: null,
          pendingPersonalAnswer: null,
          pendingCommonAnswer: null,
          personalHistory: [],
          lastFeedback: null,
        };
      } else if (target === 'ROUND_2_VCNV') {
        state.seats.forEach((s) => (s.vcnvLocked = false));
        const availablePuzzles = getRoomObstaclePuzzles(state);
        const totalPuzzles = Math.max(1, availablePuzzles.length);
        const safePuzzleIndex =
          typeof state.round2.puzzleIndex === 'number' &&
          state.round2.puzzleIndex >= 0 &&
          state.round2.puzzleIndex < totalPuzzles
            ? state.round2.puzzleIndex
            : 0;
        state.round2 = {
          ...state.round2,
          puzzleIndex: safePuzzleIndex,
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
          cnvBuzzerPosition: null,
          pendingCnvKeyword: null,
          deadlineEpochMs: null,
          timerStarted: false,
          mcGrades: {},
          lastFeedback: null,
          lastRowEvaluation: null,
          cnvWinner: null,
        };
      } else if (target === 'ROUND_3_TANG_TOC') {
        state.round3 = {
          subPhase: 'INTRO',
          qIndex: 0,
          questionStartEpochMs: 0,
          deadlineEpochMs: null,
          timerStarted: false,
          submissions: {},
          mcGrades: {},
          rankedResults: [],
        };
      } else if (target === 'ROUND_4_VE_DICH') {
        state.seats.forEach((s) => (s.starUsed = false));
        state.round4 = {
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
        };
      }
      addRoomLog(
        state,
        'Hệ thống',
        `MC Chủ Phòng bắt đầu phần thi: ${target}`
      );
      return state;
    }

    default:
      return null;
  }
}
