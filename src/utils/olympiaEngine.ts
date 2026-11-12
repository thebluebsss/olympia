import type { OlympiaRoomState, ClientAction } from '../types/olympia.ts';
import {
  TANG_TOC_QUESTIONS,
  TIE_BREAKER_QUESTIONS,
  isAnswerMatch,
} from '../data/olympiaQuestions.ts';
import {
  upsertAndSortBuzzQueue,
  getRoomPersonalQuestions,
  getRoomCommonQuestions,
  getRoomObstaclePuzzles,
  buildDeterministicTangTocSet,
  getRoomTangTocQuestions,
  getRoomVeDich20Questions,
  getRoomVeDich30Questions,
  getRoomTieBreakerQuestions,
  addRoomLog,
  getFinishQuestionById,
  getCnvRewardPoints,
  canClientControlSeat,
  isHostClient,
} from './engine/roomSelectors.ts';
import { createInitialRoomState, mergeRoomStates } from './engine/roomMerge.ts';
import {
  gradeRound1PersonalQuestion,
  gradeRound1CommonQuestion,
  gradeRound4MainAnswer,
  finalizeRound4NoSteal,
  gradeRound4StealAnswer,
  handleServerTimerExpired,
  evaluateVcnvRow,
  finalizeTangTocQuestion,
} from './engine/roundGrading.ts';
import { stepBotActionIfNeeded } from './engine/botStep.ts';
import { applyLobbyAndMcAction } from './engine/lobbyActions.ts';

export {
  getRoomPersonalQuestions,
  getRoomCommonQuestions,
  getRoomObstaclePuzzles,
  buildDeterministicTangTocSet,
  getRoomTangTocQuestions,
  getRoomVeDich20Questions,
  getRoomVeDich30Questions,
  getRoomTieBreakerQuestions,
  getFinishQuestionById,
  getCnvRewardPoints,
  isHostClient,
  createInitialRoomState,
  mergeRoomStates,
  stepBotActionIfNeeded,
};

export function applyClientAction(
  currentState: OlympiaRoomState,
  action: ClientAction
): OlympiaRoomState {
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
  if (!state.kickedClientIds) state.kickedClientIds = {};
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

  const lobbyResult = applyLobbyAndMcAction(state, currentState, action, nowMs);
  if (lobbyResult !== null) {
    return lobbyResult;
  }

  switch (action.type) {
    case 'SERVER_TIMER_EXPIRED':
      return handleServerTimerExpired(
        state,
        currentState,
        nowMs,
        action.expectedDeadline
      );

    // ==================== ROUND 1: KHỞI ĐỘNG ====================
    case 'R1_START_PERSONAL_TURN': {
      if (state.round1.subPhase !== 'PERSONAL_READY') return currentState;
      if (!isHostClient(state, action.clientId)) return currentState;
      state.round1.subPhase = 'PERSONAL_ACTIVE';
      state.round1.personalQIndex = 0;
      state.round1.pendingPersonalAnswer = null;
      state.round1.personalHistory = [];
      state.round1.lastFeedback = null;
      state.round1.deadlineEpochMs = null;
      state.round1.timerStarted = false;
      return state;
    }

    case 'R1_SUBMIT_PERSONAL': {
      if (
        state.round1.subPhase !== 'PERSONAL_ACTIVE' ||
        !state.round1.timerStarted ||
        !state.round1.deadlineEpochMs
      ) {
        return currentState;
      }
      const pos = state.round1.activePosition;
      const isCurSeatBot = Boolean(
        state.seats[pos - 1]?.claimedByClientId?.startsWith('BOT_SIM_')
      );
      const isAuthorized =
        canClientControlSeat(state, pos, action.clientId) ||
        (isCurSeatBot && isHostClient(state, action.clientId));
      if (action.position !== pos || !isAuthorized) return currentState;
      if (
        action.qIndex !== undefined &&
        action.qIndex !== state.round1.personalQIndex
      ) {
        return currentState;
      }
      state.round1.pendingPersonalAnswer = action.answer.trim() || '(Bỏ qua)';
      state.round1.deadlineEpochMs = null;
      return state;
    }

    case 'R1_MC_GRADE_PERSONAL': {
      if (state.round1.subPhase !== 'PERSONAL_ACTIVE') return currentState;
      if (!isHostClient(state, action.clientId)) return currentState;
      const rawAns = state.round1.pendingPersonalAnswer || '(Chưa trả lời)';
      state.round1.pendingPersonalAnswer = null;
      return gradeRound1PersonalQuestion(
        state,
        rawAns,
        nowMs,
        action.isCorrect
      );
    }

    case 'R1_NEXT_PERSONAL_CLIMBER': {
      if (state.round1.subPhase !== 'PERSONAL_TURN_DONE') return currentState;
      if (!isHostClient(state, action.clientId)) return currentState;
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
        state.round1.pendingPersonalAnswer = null;
        state.round1.personalHistory = [];
        state.round1.lastFeedback = null;
        state.round1.deadlineEpochMs = null;
        state.round1.timerStarted = false;
        state.round1.subPhase = 'PERSONAL_READY';
      } else {
        state.round1.subPhase = 'COMMON_INTRO';
        state.round1.commonQIndex = 0;
        state.round1.buzzedPosition = null;
        state.round1.pendingCommonAnswer = null;
        state.round1.lastFeedback = null;
        state.round1.deadlineEpochMs = null;
        state.round1.timerStarted = false;
      }
      return state;
    }

    case 'R1_START_COMMON_QUESTION': {
      if (state.round1.subPhase !== 'COMMON_INTRO') return currentState;
      if (!isHostClient(state, action.clientId)) return currentState;
      state.round1.subPhase = 'COMMON_BUZZ_OPEN';
      state.round1.buzzedPosition = null;
      state.round1.buzzedAtMs = null;
      state.round1.buzzWindowStartMs = nowMs;
      state.round1.buzzQueue = [];
      state.round1.pendingCommonAnswer = null;
      state.round1.lastFeedback = null;
      state.round1.deadlineEpochMs = nowMs + 10000;
      state.round1.timerStarted = true;
      return state;
    }

    case 'R1_BUZZ_COMMON': {
      const r1 = state.round1;
      if (r1.subPhase === 'COMMON_BUZZ_OPEN') {
        if (!r1.deadlineEpochMs || nowMs > r1.deadlineEpochMs + 250) {
          return currentState;
        }
      } else if (r1.subPhase === 'COMMON_ANSWERING') {
        const windowStart = r1.buzzWindowStartMs || 0;
        if (
          r1.pendingCommonAnswer !== null ||
          !windowStart ||
          nowMs > windowStart + 10000
        ) {
          return currentState;
        }
      } else {
        return currentState;
      }

      const isBotSeat = Boolean(
        state.seats[action.position - 1]?.claimedByClientId?.startsWith(
          'BOT_SIM_'
        )
      );
      const isAuthorized =
        canClientControlSeat(state, action.position, action.clientId) ||
        (isBotSeat && isHostClient(state, action.clientId));
      if (!isAuthorized) return currentState;
      const seat = state.seats[action.position - 1];
      if (!seat) return currentState;

      const windowStart = r1.buzzWindowStartMs || nowMs;
      const serverElapsedSec = Math.max(
        0.01,
        Math.min(10, Number(((nowMs - windowStart) / 1000).toFixed(2)))
      );
      const elapsedSec =
        typeof action.clientBuzzElapsedSec === 'number' &&
        Number.isFinite(action.clientBuzzElapsedSec) &&
        action.clientBuzzElapsedSec > 0 &&
        action.clientBuzzElapsedSec <= 10
          ? Math.max(
              0.01,
              Math.min(10, Number(action.clientBuzzElapsedSec.toFixed(2)))
            )
          : serverElapsedSec;

      const buzzTs = action.actionTimestampMs || nowMs;
      r1.buzzQueue = upsertAndSortBuzzQueue(r1.buzzQueue, {
        position: action.position,
        name: seat.name,
        elapsedSec,
        timestampMs: buzzTs,
      });

      const fastest = r1.buzzQueue[0];
      const wasFirstBuzz = r1.subPhase === 'COMMON_BUZZ_OPEN';
      if (!r1.pendingCommonAnswer) {
        r1.buzzedPosition = fastest.position;
        r1.buzzedAtMs = fastest.timestampMs;
      }
      if (wasFirstBuzz) {
        r1.pendingCommonAnswer = null;
        r1.subPhase = 'COMMON_ANSWERING';
        r1.deadlineEpochMs = nowMs + 12000;
        r1.timerStarted = true;
      }
      addRoomLog(
        state,
        'Khởi Động Chung',
        `${seat.name} (Vị trí ${action.position}) bấm chuông ở ${elapsedSec.toFixed(2)}s (Nhanh nhất: ${fastest.name} - ${fastest.elapsedSec.toFixed(2)}s)!`
      );
      return state;
    }

    case 'R1_SUBMIT_COMMON': {
      if (state.round1.subPhase !== 'COMMON_ANSWERING') return currentState;
      const buzzPos = state.round1.buzzedPosition;
      if (!buzzPos || action.position !== buzzPos) return currentState;
      const isBotSeat = Boolean(
        state.seats[buzzPos - 1]?.claimedByClientId?.startsWith('BOT_SIM_')
      );
      const isAuthorized =
        canClientControlSeat(state, buzzPos, action.clientId) ||
        (isBotSeat && isHostClient(state, action.clientId));
      if (!isAuthorized) return currentState;
      if (
        action.qIndex !== undefined &&
        action.qIndex !== state.round1.commonQIndex
      ) {
        return currentState;
      }
      state.round1.pendingCommonAnswer = action.answer.trim() || '(Bỏ qua)';
      state.round1.deadlineEpochMs = null;
      return state;
    }

    case 'R1_MC_GRADE_COMMON': {
      if (!isHostClient(state, action.clientId)) return currentState;
      if (
        state.round1.subPhase === 'COMMON_BUZZ_OPEN' &&
        !state.round1.buzzedPosition
      ) {
        const commonPool = getRoomCommonQuestions(state);
        const q = commonPool[state.round1.commonQIndex % commonPool.length];
        state.round1.subPhase = 'COMMON_RESULT';
        state.round1.deadlineEpochMs = null;
        state.round1.pendingCommonAnswer = null;
        state.round1.lastFeedback = {
          correct: false,
          officialAnswer: q.answer,
          message: `Không có thí sinh nào bấm chuông trả lời câu số ${
            state.round1.commonQIndex + 1
          }. Đáp án chính thức là: "${q.answer}".`,
          explanation: q.explanation,
        };
        return state;
      }
      if (state.round1.subPhase !== 'COMMON_ANSWERING') return currentState;
      const buzzPos = state.round1.buzzedPosition;
      if (!buzzPos) return currentState;
      const rawAns = state.round1.pendingCommonAnswer || '(Chưa trả lời)';
      state.round1.pendingCommonAnswer = null;
      return gradeRound1CommonQuestion(
        state,
        buzzPos,
        rawAns,
        action.isCorrect
      );
    }

    case 'R1_NEXT_COMMON_QUESTION': {
      if (state.round1.subPhase !== 'COMMON_RESULT') return currentState;
      if (!isHostClient(state, action.clientId)) return currentState;
      if (
        action.fromQIndex !== undefined &&
        action.fromQIndex !== state.round1.commonQIndex
      ) {
        return currentState;
      }
      state.round1.buzzedPosition = null;
      state.round1.buzzedAtMs = null;
      state.round1.buzzQueue = [];
      state.round1.pendingCommonAnswer = null;
      state.round1.lastFeedback = null;
      const commonPool = getRoomCommonQuestions(state);
      if (state.round1.commonQIndex + 1 < commonPool.length) {
        state.round1.commonQIndex += 1;
        state.round1.subPhase = 'COMMON_BUZZ_OPEN';
        state.round1.buzzWindowStartMs = nowMs;
        state.round1.deadlineEpochMs = nowMs + 10000;
        state.round1.timerStarted = true;
      } else {
        state.round1.subPhase = 'ROUND_SUMMARY';
        state.round1.deadlineEpochMs = null;
        state.round1.timerStarted = false;
      }
      return state;
    }

    // ==================== ROUND 2: VƯỢT CHƯỚNG NGẠI VẬT ====================
    case 'R2_SELECT_PUZZLE': {
      if (!isHostClient(state, action.clientId)) return currentState;
      if (
        state.round2.subPhase !== 'SELECT_ROW' ||
        state.round2.openedRowCount > 0
      ) {
        return currentState;
      }
      state.round2.puzzleIndex = action.puzzleIndex;
      state.round2.rowStatuses = {
        1: 'UNOPENED',
        2: 'UNOPENED',
        3: 'UNOPENED',
        4: 'UNOPENED',
      };
      state.round2.centerStatus = 'UNOPENED';
      state.round2.openedRowCount = 0;
      state.round2.rowSubmissions = {};
      state.round2.mcGrades = {};
      state.round2.cnvBuzzerPosition = null;
      state.round2.cnvBuzzQueue = [];
      state.round2.cnvPhaseStartMs = nowMs;
      state.round2.pendingCnvKeyword = null;
      state.round2.lastRowEvaluation = null;
      state.round2.cnvWinner = null;
      state.round2.deadlineEpochMs = null;
      state.round2.timerStarted = false;
      state.seats.forEach((s) => (s.vcnvLocked = false));
      return state;
    }

    case 'R2_PICK_ROW': {
      if (state.round2.subPhase !== 'SELECT_ROW') return currentState;
      if (!isHostClient(state, action.clientId)) return currentState;
      if (state.round2.rowStatuses[action.rowId] !== 'UNOPENED') {
        return currentState;
      }
      state.round2.activeRowId = action.rowId;
      state.round2.openedRowCount += 1;
      state.round2.rowSubmissions = {};
      state.round2.mcGrades = {};
      state.round2.lastFeedback = null;
      state.round2.lastRowEvaluation = null;
      state.round2.subPhase = 'ANSWERING_ROW';
      state.round2.cnvPhaseStartMs = nowMs;
      state.round2.deadlineEpochMs = null;
      state.round2.timerStarted = false;
      const selector = state.seats[state.round2.selectorPosition - 1];
      addRoomLog(
        state,
        'VCNV',
        `MC mở Hàng ngang số ${action.rowId} (theo lựa chọn của ${selector.name}). Chờ MC bấm bắt đầu tính giờ 15 giây!`
      );
      return state;
    }

    case 'R2_SUBMIT_ROW_ANSWER': {
      if (
        (state.round2.subPhase !== 'ANSWERING_ROW' &&
          state.round2.subPhase !== 'ANSWERING_CENTER') ||
        !state.round2.timerStarted ||
        !state.round2.deadlineEpochMs
      ) {
        return currentState;
      }
      const isBotSeat = Boolean(
        state.seats[action.position - 1]?.claimedByClientId?.startsWith(
          'BOT_SIM_'
        )
      );
      const isAuthorized =
        canClientControlSeat(state, action.position, action.clientId) ||
        (isBotSeat && isHostClient(state, action.clientId));
      if (!isAuthorized) return currentState;
      const seat = state.seats[action.position - 1];
      if (!seat || seat.vcnvLocked) return currentState;
      const trimmed = action.answer.trim();
      state.round2.rowSubmissions[action.position] = trimmed;
      if (!state.round2.mcGrades) state.round2.mcGrades = {};
      const puzzles = getRoomObstaclePuzzles(state);
      const puzzle = puzzles[state.round2.puzzleIndex] || puzzles[0];
      if (state.round2.subPhase === 'ANSWERING_CENTER') {
        const centerQ = puzzle.centerQuestion;
        state.round2.mcGrades[action.position] = Boolean(
          trimmed &&
            isAnswerMatch(trimmed, centerQ.acceptedAnswers, centerQ.displayWord)
        );
      } else {
        const rowObj = puzzle.rows.find(
          (r) => r.id === state.round2.activeRowId
        );
        if (rowObj) {
          state.round2.mcGrades[action.position] = Boolean(
            trimmed &&
              isAnswerMatch(trimmed, rowObj.acceptedAnswers, rowObj.displayWord)
          );
        }
      }
      return state;
    }

    case 'R2_MC_TOGGLE_ROW_GRADE': {
      if (!isHostClient(state, action.clientId)) return currentState;
      if (
        state.round2.subPhase !== 'ANSWERING_ROW' &&
        state.round2.subPhase !== 'ANSWERING_CENTER'
      ) {
        return currentState;
      }
      if (!state.round2.mcGrades) state.round2.mcGrades = {};
      state.round2.mcGrades[action.position] = action.isCorrect;
      return state;
    }

    case 'R2_EVALUATE_ROW_NOW': {
      if (!isHostClient(state, action.clientId)) return currentState;
      if (
        state.round2.subPhase !== 'ANSWERING_ROW' &&
        state.round2.subPhase !== 'ANSWERING_CENTER'
      ) {
        return currentState;
      }
      return evaluateVcnvRow(state, nowMs);
    }

    case 'R2_MC_CONFIRM_ROW_EVAL': {
      if (!isHostClient(state, action.clientId)) return currentState;
      if (
        state.round2.subPhase !== 'ANSWERING_ROW' &&
        state.round2.subPhase !== 'ANSWERING_CENTER'
      ) {
        return currentState;
      }
      return evaluateVcnvRow(state, nowMs, action.correctPositions);
    }

    case 'R2_CONTINUE_SELECT_ROW': {
      if (state.round2.subPhase !== 'ROW_RESULT') return currentState;
      if (!isHostClient(state, action.clientId)) return currentState;
      let nextPos = ((state.round2.selectorPosition % 4) + 1) as 1 | 2 | 3 | 4;
      for (let i = 0; i < 4; i++) {
        if (!state.seats[nextPos - 1].vcnvLocked) break;
        nextPos = ((nextPos % 4) + 1) as 1 | 2 | 3 | 4;
      }
      state.round2.selectorPosition = nextPos;
      state.round2.subPhase = 'SELECT_ROW';
      state.round2.activeRowId = null;
      state.round2.rowSubmissions = {};
      state.round2.mcGrades = {};
      state.round2.deadlineEpochMs = null;
      state.round2.timerStarted = false;
      return state;
    }

    case 'R2_OPEN_CENTER': {
      if (!isHostClient(state, action.clientId)) return currentState;
      state.round2.subPhase = 'ANSWERING_CENTER';
      state.round2.rowSubmissions = {};
      state.round2.mcGrades = {};
      state.round2.lastRowEvaluation = null;
      state.round2.cnvPhaseStartMs = nowMs;
      state.round2.deadlineEpochMs = null;
      state.round2.timerStarted = false;
      return state;
    }

    case 'R2_BUZZ_CNV': {
      if (!canClientControlSeat(state, action.position, action.clientId)) {
        return currentState;
      }
      const seat = state.seats[action.position - 1];
      if (
        !seat ||
        seat.vcnvLocked ||
        state.round2.subPhase === 'ROUND_SUMMARY'
      ) {
        return currentState;
      }
      if (
        state.round2.subPhase === 'FINAL_15S' &&
        (!state.round2.deadlineEpochMs ||
          nowMs > state.round2.deadlineEpochMs + 250)
      ) {
        return currentState;
      }

      const phaseStart = state.round2.cnvPhaseStartMs || nowMs;
      const serverElapsedSec = Math.max(
        0.01,
        Math.min(60, Number(((nowMs - phaseStart) / 1000).toFixed(2)))
      );
      const elapsedSec =
        typeof action.clientBuzzElapsedSec === 'number' &&
        Number.isFinite(action.clientBuzzElapsedSec) &&
        action.clientBuzzElapsedSec > 0 &&
        action.clientBuzzElapsedSec <= 60
          ? Math.max(
              0.01,
              Math.min(60, Number(action.clientBuzzElapsedSec.toFixed(2)))
            )
          : serverElapsedSec;

      const buzzTs = action.actionTimestampMs || nowMs;
      state.round2.cnvBuzzQueue = upsertAndSortBuzzQueue(
        state.round2.cnvBuzzQueue,
        {
          position: action.position,
          name: seat.name,
          elapsedSec,
          timestampMs: buzzTs,
        }
      ).filter((entry) => !state.seats[entry.position - 1]?.vcnvLocked);

      const fastest = state.round2.cnvBuzzQueue[0];
      if (!state.round2.pendingCnvKeyword && fastest) {
        state.round2.cnvBuzzerPosition = fastest.position;
        state.round2.cnvBuzzedAtMs = fastest.timestampMs;
      }
      addRoomLog(
        state,
        'VCNV',
        `TÍN HIỆU CHUÔNG! ${seat.name} (Vị trí ${action.position}) bấm chuông giải CNV ở ${elapsedSec.toFixed(2)}s!`
      );
      return state;
    }

    case 'R2_CANCEL_BUZZ_CNV': {
      if (
        !state.round2.cnvBuzzerPosition ||
        (!canClientControlSeat(
          state,
          state.round2.cnvBuzzerPosition,
          action.clientId
        ) &&
          !isHostClient(state, action.clientId))
      ) {
        return currentState;
      }
      const cancelledPos = state.round2.cnvBuzzerPosition;
      state.round2.cnvBuzzQueue = (state.round2.cnvBuzzQueue || []).filter(
        (b) => b.position !== cancelledPos
      );
      const nextFastest = state.round2.cnvBuzzQueue[0] || null;
      state.round2.cnvBuzzerPosition = nextFastest ? nextFastest.position : null;
      state.round2.cnvBuzzedAtMs = nextFastest ? nextFastest.timestampMs : null;
      state.round2.pendingCnvKeyword = null;
      return state;
    }

    case 'R2_SUBMIT_CNV': {
      const pos = state.round2.cnvBuzzerPosition;
      if (
        !pos ||
        action.position !== pos ||
        (!canClientControlSeat(state, pos, action.clientId) &&
          !isHostClient(state, action.clientId))
      ) {
        return currentState;
      }
      state.round2.pendingCnvKeyword = action.keyword.trim() || '(Trống)';
      return state;
    }

    case 'R2_MC_GRADE_CNV': {
      if (!isHostClient(state, action.clientId)) return currentState;
      const pos = state.round2.cnvBuzzerPosition;
      if (!pos) return currentState;
      const seat = state.seats[pos - 1];
      const puzzles = getRoomObstaclePuzzles(state);
      const puzzle = puzzles[state.round2.puzzleIndex] || puzzles[0];
      const pts = getCnvRewardPoints(state.round2);
      const submittedKw =
        state.round2.pendingCnvKeyword || '(Chưa gửi từ khóa)';
      state.round2.pendingCnvKeyword = null;

      if (action.isCorrect) {
        seat.score += pts;
        state.round2.rowStatuses = {
          1: 'SOLVED',
          2: 'SOLVED',
          3: 'SOLVED',
          4: 'SOLVED',
        };
        state.round2.centerStatus = 'SOLVED';
        state.round2.cnvBuzzerPosition = null;
        state.round2.cnvBuzzQueue = [];
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
        state.round2.subPhase = 'ROUND_SUMMARY';
        addRoomLog(
          state,
          'VCNV',
          `${seat.name} giải ĐÚNG Chướng Ngại Vật "${puzzle.keywordDisplay}"`,
          `+${pts}`
        );
      } else {
        seat.vcnvLocked = true;
        state.round2.cnvBuzzQueue = (state.round2.cnvBuzzQueue || []).filter(
          (b) => b.position !== pos && !state.seats[b.position - 1]?.vcnvLocked
        );
        const nextFastest = state.round2.cnvBuzzQueue[0] || null;
        state.round2.cnvBuzzerPosition = nextFastest
          ? nextFastest.position
          : null;
        state.round2.cnvBuzzedAtMs = nextFastest
          ? nextFastest.timestampMs
          : null;
        state.round2.lastFeedback = `${seat.name} (Vị trí ${pos}) trả lời từ khóa Chướng Ngại Vật là "${submittedKw}" — CHƯA CHÍNH XÁC! ${seat.name} bị khóa quyền thi tiếp phần Vượt Chướng Ngại Vật.`;
        addRoomLog(
          state,
          'VCNV',
          `${seat.name} giải SAI Chướng Ngại Vật ("${submittedKw}") -> Bị khóa quyền VCNV!`,
          'Khóa'
        );

        if (state.seats.every((s) => s.vcnvLocked)) {
          state.round2.cnvWinner = {
            solved: false,
            officialKeyword: puzzle.keywordDisplay,
            message: `Cả 4 thí sinh đều đã mất quyền trả lời. Đáp án Chướng Ngại Vật chính thức là "${puzzle.keywordDisplay}".`,
          };
          state.round2.subPhase = 'ROUND_SUMMARY';
          state.round2.deadlineEpochMs = null;
        }
      }
      return state;
    }

    case 'R2_MC_REVEAL_CNV': {
      if (!isHostClient(state, action.clientId)) return currentState;
      const puzzles = getRoomObstaclePuzzles(state);
      const puzzle = puzzles[state.round2.puzzleIndex] || puzzles[0];
      state.round2.rowStatuses = {
        1: 'SOLVED',
        2: 'SOLVED',
        3: 'SOLVED',
        4: 'SOLVED',
      };
      state.round2.centerStatus = 'SOLVED';
      state.round2.cnvBuzzerPosition = null;
      state.round2.pendingCnvKeyword = null;
      state.round2.deadlineEpochMs = null;
      state.round2.cnvWinner = {
        solved: false,
        officialKeyword: puzzle.keywordDisplay,
        message: `MC công bố Chướng Ngại Vật chính thức: "${puzzle.keywordDisplay}".`,
      };
      state.round2.subPhase = 'ROUND_SUMMARY';
      return state;
    }

    // ==================== ROUND 3: TĂNG TỐC ====================
    case 'R3_START_QUESTION': {
      if (!isHostClient(state, action.clientId)) return currentState;
      if (action.qIndex < 0 || action.qIndex >= 4) return currentState;
      state.round3.qIndex = action.qIndex;
      state.round3.subPhase = 'QUESTION_ACTIVE';
      state.round3.questionStartEpochMs = nowMs;
      state.round3.deadlineEpochMs = null;
      state.round3.timerStarted = false;
      state.round3.submissions = {};
      state.round3.mcGrades = {};
      state.round3.rankedResults = [];
      return state;
    }

    case 'R3_CHANGE_QUESTION': {
      if (!isHostClient(state, action.clientId)) return currentState;
      if (
        state.round3.subPhase === 'QUESTION_ACTIVE' &&
        state.round3.timerStarted
      ) {
        return currentState;
      }

      const currentPool = getRoomTangTocQuestions(state);
      const currentFour = ([0, 1, 2, 3] as const).map(
        (idx) => currentPool[idx] || TANG_TOC_QUESTIONS[idx]
      );

      if (!state.questionDeck) {
        state.questionDeck = {
          deckId: `deck-tt-${state.roomCode}-${state.version}`,
          mode: 'CLASSIC_DEFAULT',
          label: 'Bộ đề Olympia Mặc Định',
          totalSourceQuestions: TANG_TOC_QUESTIONS.length,
          personalQuestions: getRoomPersonalQuestions(state),
          commonQuestions: getRoomCommonQuestions(state),
          obstaclePuzzles: getRoomObstaclePuzzles(state),
          tangTocQuestions: currentFour,
          veDich20Questions: getRoomVeDich20Questions(state),
          veDich30Questions: getRoomVeDich30Questions(state),
          tieBreakerQuestions: getRoomTieBreakerQuestions(state),
        };
      }

      if (
        action.qIndex !== undefined &&
        action.qIndex >= 0 &&
        action.qIndex <= 3
      ) {
        const targetIdx = action.qIndex;
        const targetNum = (targetIdx + 1) as 1 | 2 | 3 | 4;
        const oldQ = currentFour[targetIdx];
        const combinedCandidates = [
          ...currentPool.filter(
            (q) => q.number === targetNum && q.id !== oldQ?.id
          ),
          ...TANG_TOC_QUESTIONS.filter(
            (q) => q.number === targetNum && q.id !== oldQ?.id
          ),
        ];
        if (combinedCandidates.length > 0) {
          const pickIdx = (state.version || 1) % combinedCandidates.length;
          currentFour[targetIdx] = combinedCandidates[pickIdx];
        }
        state.questionDeck.tangTocQuestions = [
          ...currentFour,
          ...currentPool.slice(4),
        ];
        state.round3.submissions = {};
        state.round3.mcGrades = {};
        state.round3.rankedResults = [];
        addRoomLog(
          state,
          'Tăng Tốc',
          `MC Chủ Phòng đã đổi sang câu hỏi Tăng Tốc số ${targetNum} khác.`
        );
      } else {
        const usedIds = new Set(currentFour.map((q) => q.id));
        const newFour = buildDeterministicTangTocSet(
          `${state.roomCode}|reroll-r3|${state.version || 1}`,
          usedIds
        );
        state.questionDeck.tangTocQuestions = newFour;
        addRoomLog(
          state,
          'Tăng Tốc',
          'MC Chủ Phòng đã đổi sang bộ 4 câu hỏi Tăng Tốc mới.'
        );
      }
      return state;
    }

    case 'R3_SUBMIT_ANSWER': {
      if (
        state.round3.subPhase !== 'QUESTION_ACTIVE' ||
        !state.round3.timerStarted ||
        !state.round3.deadlineEpochMs
      ) {
        return currentState;
      }
      const isBotSeat = Boolean(
        state.seats[action.position - 1]?.claimedByClientId?.startsWith(
          'BOT_SIM_'
        )
      );
      const isAuthorized =
        canClientControlSeat(state, action.position, action.clientId) ||
        (isBotSeat && isHostClient(state, action.clientId));
      if (!isAuthorized) return currentState;
      const ttPool = getRoomTangTocQuestions(state);
      const q = ttPool[state.round3.qIndex] || ttPool[0];
      const seat = state.seats[action.position - 1];
      if (!seat) return currentState;

      const startMs =
        state.round3.questionStartEpochMs > 0
          ? state.round3.questionStartEpochMs
          : nowMs;
      const serverElapsedSec = Math.max(
        0.05,
        Math.min(
          q.timeLimitSec,
          Number(((nowMs - startMs) / 1000).toFixed(2))
        )
      );
      const elapsedSec =
        typeof action.clientElapsedSec === 'number' &&
        Number.isFinite(action.clientElapsedSec) &&
        action.clientElapsedSec > 0
          ? Math.max(
              0.05,
              Math.min(q.timeLimitSec, Number(action.clientElapsedSec.toFixed(2)))
            )
          : serverElapsedSec;

      const trimmedAns = action.answer.trim();
      state.round3.submissions[action.position] = {
        position: action.position,
        name: seat.name,
        answer: trimmedAns,
        timeSec: elapsedSec,
      };
      if (!state.round3.mcGrades) state.round3.mcGrades = {};
      state.round3.mcGrades[action.position] = Boolean(
        trimmedAns && isAnswerMatch(trimmedAns, q.acceptedAnswers, q.answer)
      );

      return state;
    }

    case 'R3_MC_TOGGLE_GRADE': {
      if (!isHostClient(state, action.clientId)) return currentState;
      if (state.round3.subPhase !== 'QUESTION_ACTIVE') return currentState;
      if (!state.round3.mcGrades) state.round3.mcGrades = {};
      state.round3.mcGrades[action.position] = action.isCorrect;
      return state;
    }

    case 'R3_FINALIZE_QUESTION': {
      if (!isHostClient(state, action.clientId)) return currentState;
      if (state.round3.subPhase !== 'QUESTION_ACTIVE') return currentState;
      return finalizeTangTocQuestion(state);
    }

    case 'R3_MC_CONFIRM_EVAL': {
      if (!isHostClient(state, action.clientId)) return currentState;
      if (state.round3.subPhase !== 'QUESTION_ACTIVE') return currentState;
      return finalizeTangTocQuestion(state, action.correctPositions);
    }

    // ==================== ROUND 4: VỀ ĐÍCH ====================
    case 'R4_CONFIRM_PACKAGE': {
      const r4 = state.round4;
      if (r4.subPhase !== 'SELECT_PACKAGE') return currentState;
      const curPos = r4.activePosition;
      const isAuthorized =
        canClientControlSeat(state, curPos, action.clientId) ||
        isHostClient(state, action.clientId);
      if (action.position !== curPos || !isAuthorized) return currentState;
      r4.packagePoints = action.points;
      const chosenIds: [string, string, string] = ['vd20-1', 'vd20-2', 'vd20-3'];

      const pool20 = getRoomVeDich20Questions(state);
      const pool30 = getRoomVeDich30Questions(state);
      action.points.forEach((pt, idx) => {
        const pool = pt === 20 ? pool20 : pool30;
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
      r4.deadlineEpochMs = null;
      r4.timerStarted = false;
      r4.subPhase = 'PRE_QUESTION_STAR';
      const seat = state.seats[r4.activePosition - 1];
      addRoomLog(
        state,
        'Về Đích',
        `${seat.name} (Vị trí ${r4.activePosition}) chọn gói câu hỏi ${action.points.join(' - ')} điểm.`
      );
      return state;
    }

    case 'R4_START_QUESTION': {
      const r4 = state.round4;
      if (r4.subPhase !== 'PRE_QUESTION_STAR') return currentState;
      if (!isHostClient(state, action.clientId)) return currentState;
      const seat = state.seats[r4.activePosition - 1];
      const q = getFinishQuestionById(r4.questionIds[r4.qIndex], state);

      if (action.useStar && !seat.starUsed) {
        seat.starUsed = true;
        r4.starActiveThisQ = true;
        addRoomLog(
          state,
          'Về Đích',
          `${seat.name} đặt ★ NGÔI SAO HY VỌNG cho câu hỏi số ${r4.qIndex + 1} (${q.points} điểm)!`
        );
      } else {
        r4.starActiveThisQ = false;
      }

      r4.stealerPosition = null;
      r4.mainSubmittedAnswer = null;
      r4.stealSubmittedAnswer = null;
      r4.lastResult = null;
      r4.subPhase = 'MAIN_ANSWERING';
      r4.deadlineEpochMs = null;
      r4.timerStarted = false;
      return state;
    }

    case 'R4_SUBMIT_MAIN_ANSWER': {
      const r4 = state.round4;
      if (
        r4.subPhase !== 'MAIN_ANSWERING' ||
        !r4.timerStarted ||
        !r4.deadlineEpochMs
      ) {
        return currentState;
      }
      const curPos = r4.activePosition;
      const isCurSeatBot = Boolean(
        state.seats[curPos - 1]?.claimedByClientId?.startsWith('BOT_SIM_')
      );
      const isAuthorized =
        canClientControlSeat(state, curPos, action.clientId) ||
        (isCurSeatBot && isHostClient(state, action.clientId));
      if (!isAuthorized) return currentState;
      if (action.qIndex !== undefined && action.qIndex !== r4.qIndex) {
        return currentState;
      }
      r4.mainSubmittedAnswer = action.answer.trim() || '(Bỏ qua)';
      r4.deadlineEpochMs = null;
      return state;
    }

    case 'R4_MC_GRADE_MAIN': {
      const r4 = state.round4;
      if (r4.subPhase !== 'MAIN_ANSWERING') return currentState;
      if (!isHostClient(state, action.clientId)) return currentState;
      const rawAns = r4.mainSubmittedAnswer || '(Chưa trả lời)';
      return gradeRound4MainAnswer(state, rawAns, nowMs, action.isCorrect);
    }

    case 'R4_BUZZ_STEAL': {
      const r4 = state.round4;
      if (action.position === r4.activePosition) return currentState;
      if (r4.subPhase === 'STEAL_WINDOW') {
        if (!r4.deadlineEpochMs || nowMs > r4.deadlineEpochMs + 250) {
          return currentState;
        }
      } else if (r4.subPhase === 'STEAL_ANSWERING') {
        const windowStart = r4.stealWindowStartMs || 0;
        if (
          r4.stealSubmittedAnswer !== null ||
          !windowStart ||
          nowMs > windowStart + 5000
        ) {
          return currentState;
        }
      } else {
        return currentState;
      }

      if (!canClientControlSeat(state, action.position, action.clientId)) {
        return currentState;
      }
      const stealer = state.seats[action.position - 1];
      if (!stealer) return currentState;

      const windowStart = r4.stealWindowStartMs || nowMs;
      const serverElapsedSec = Math.max(
        0.01,
        Math.min(5, Number(((nowMs - windowStart) / 1000).toFixed(2)))
      );
      const elapsedSec =
        typeof action.clientBuzzElapsedSec === 'number' &&
        Number.isFinite(action.clientBuzzElapsedSec) &&
        action.clientBuzzElapsedSec > 0 &&
        action.clientBuzzElapsedSec <= 5
          ? Math.max(
              0.01,
              Math.min(5, Number(action.clientBuzzElapsedSec.toFixed(2)))
            )
          : serverElapsedSec;

      const buzzTs = action.actionTimestampMs || nowMs;
      r4.stealBuzzQueue = upsertAndSortBuzzQueue(r4.stealBuzzQueue, {
        position: action.position,
        name: stealer.name,
        elapsedSec,
        timestampMs: buzzTs,
      });

      const fastest = r4.stealBuzzQueue[0];
      const wasStealWindow = r4.subPhase === 'STEAL_WINDOW';
      if (!r4.stealSubmittedAnswer) {
        r4.stealerPosition = fastest.position;
        r4.stealerBuzzedAtMs = fastest.timestampMs;
      }
      if (wasStealWindow) {
        r4.stealSubmittedAnswer = null;
        r4.subPhase = 'STEAL_ANSWERING';
        r4.deadlineEpochMs = nowMs + 12000;
        r4.timerStarted = true;
      }
      addRoomLog(
        state,
        'Về Đích',
        `TÍN HIỆU CHUÔNG! ${stealer.name} (Vị trí ${action.position}) bấm chuông ở ${elapsedSec.toFixed(2)}s (Nhanh nhất: ${fastest.name} - ${fastest.elapsedSec.toFixed(2)}s)!`
      );
      return state;
    }

    case 'R4_SKIP_STEAL_WINDOW': {
      if (!isHostClient(state, action.clientId)) return currentState;
      if (state.round4.subPhase !== 'STEAL_WINDOW') return currentState;
      return finalizeRound4NoSteal(state);
    }

    case 'R4_SUBMIT_STEAL_ANSWER': {
      const r4 = state.round4;
      if (r4.subPhase !== 'STEAL_ANSWERING') return currentState;
      const stealerPos = r4.stealerPosition;
      if (!stealerPos || action.position !== stealerPos) return currentState;
      const isBotSeat = Boolean(
        state.seats[stealerPos - 1]?.claimedByClientId?.startsWith('BOT_SIM_')
      );
      const isAuthorized =
        canClientControlSeat(state, stealerPos, action.clientId) ||
        (isBotSeat && isHostClient(state, action.clientId));
      if (!isAuthorized) return currentState;
      r4.stealSubmittedAnswer = action.answer.trim() || '(Bỏ qua)';
      r4.deadlineEpochMs = null;
      return state;
    }

    case 'R4_MC_GRADE_STEAL': {
      const r4 = state.round4;
      if (r4.subPhase !== 'STEAL_ANSWERING') return currentState;
      if (!isHostClient(state, action.clientId)) return currentState;
      const stealerPos = r4.stealerPosition;
      if (!stealerPos) return currentState;
      const rawAns = r4.stealSubmittedAnswer || '(Chưa trả lời)';
      return gradeRound4StealAnswer(
        state,
        stealerPos,
        rawAns,
        action.isCorrect
      );
    }

    case 'R4_NEXT_STEP': {
      const r4 = state.round4;
      if (r4.subPhase !== 'QUESTION_RESULT') return currentState;
      if (!isHostClient(state, action.clientId)) return currentState;
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
      r4.stealBuzzQueue = [];
      r4.mainSubmittedAnswer = null;
      r4.stealSubmittedAnswer = null;
      r4.starActiveThisQ = false;
      r4.deadlineEpochMs = null;
      r4.timerStarted = false;

      if (r4.qIndex + 1 < 3) {
        r4.qIndex += 1;
        r4.subPhase = 'PRE_QUESTION_STAR';
      } else if (r4.turnIndex + 1 < 4) {
        r4.turnIndex += 1;
        r4.activePosition = r4.turnOrder[r4.turnIndex];
        r4.qIndex = 0;
        r4.packagePoints = [20, 20, 30];
        r4.subPhase = 'SELECT_PACKAGE';
      } else {
        const maxScore = Math.max(...state.seats.map((s) => s.score));
        const tied = state.seats
          .filter((s) => s.score === maxScore)
          .map((s) => s.position);

        if (tied.length > 1) {
          state.stage = 'TIE_BREAKER';
          state.tieBreaker = {
            tiedPositions: tied,
            subPhase: 'BUZZ_OPEN',
            buzzedPosition: null,
            buzzWindowStartMs: nowMs,
            buzzQueue: [],
            pendingAnswer: null,
            deadlineEpochMs: nowMs + 15000,
            lastFeedback: null,
          };
          addRoomLog(
            state,
            'Câu hỏi phụ',
            `Có ${tied.length} thí sinh đồng điểm cao nhất (${maxScore}đ). Bước vào vòng Câu Hỏi Phụ!`
          );
        } else {
          state.stage = 'GAME_OVER';
        }
      }
      return state;
    }

    // ==================== TIE BREAKER ====================
    case 'TB_BUZZ': {
      const tb = state.tieBreaker;
      if (!tb.tiedPositions.includes(action.position)) return currentState;
      if (tb.subPhase === 'BUZZ_OPEN') {
        if (!tb.deadlineEpochMs || nowMs > tb.deadlineEpochMs + 250) {
          return currentState;
        }
      } else if (tb.subPhase === 'ANSWERING') {
        const windowStart = tb.buzzWindowStartMs || 0;
        if (
          tb.pendingAnswer !== null ||
          !windowStart ||
          nowMs > windowStart + 15000
        ) {
          return currentState;
        }
      } else {
        return currentState;
      }

      if (!canClientControlSeat(state, action.position, action.clientId)) {
        return currentState;
      }
      const seat = state.seats[action.position - 1];
      if (!seat) return currentState;

      const windowStart = tb.buzzWindowStartMs || nowMs;
      const serverElapsedSec = Math.max(
        0.01,
        Math.min(15, Number(((nowMs - windowStart) / 1000).toFixed(2)))
      );
      const elapsedSec =
        typeof action.clientBuzzElapsedSec === 'number' &&
        Number.isFinite(action.clientBuzzElapsedSec) &&
        action.clientBuzzElapsedSec > 0 &&
        action.clientBuzzElapsedSec <= 15
          ? Math.max(
              0.01,
              Math.min(15, Number(action.clientBuzzElapsedSec.toFixed(2)))
            )
          : serverElapsedSec;

      const buzzTs = action.actionTimestampMs || nowMs;
      tb.buzzQueue = upsertAndSortBuzzQueue(tb.buzzQueue, {
        position: action.position,
        name: seat.name,
        elapsedSec,
        timestampMs: buzzTs,
      }).filter((b) => tb.tiedPositions.includes(b.position));

      const fastest = tb.buzzQueue[0];
      const wasBuzzOpen = tb.subPhase === 'BUZZ_OPEN';
      if (!tb.pendingAnswer && fastest) {
        tb.buzzedPosition = fastest.position;
        tb.buzzedAtMs = fastest.timestampMs;
      }
      if (wasBuzzOpen) {
        tb.pendingAnswer = null;
        tb.subPhase = 'ANSWERING';
        tb.deadlineEpochMs = nowMs + 12000;
      }
      return state;
    }

    case 'TB_SUBMIT': {
      const pos = state.tieBreaker.buzzedPosition;
      if (
        !pos ||
        action.position !== pos ||
        (!canClientControlSeat(state, pos, action.clientId) &&
          !isHostClient(state, action.clientId))
      ) {
        return currentState;
      }
      state.tieBreaker.pendingAnswer = action.answer.trim() || '(Trống)';
      state.tieBreaker.deadlineEpochMs = null;
      return state;
    }

    case 'TB_MC_GRADE': {
      if (!isHostClient(state, action.clientId)) return currentState;
      const pos = state.tieBreaker.buzzedPosition;
      if (!pos) return currentState;
      const seat = state.seats[pos - 1];
      const tbPool = getRoomTieBreakerQuestions(state);
      const tbQ = tbPool[0] || TIE_BREAKER_QUESTIONS[0];
      const submittedText = state.tieBreaker.pendingAnswer || '(Chưa trả lời)';
      state.tieBreaker.pendingAnswer = null;

      if (action.isCorrect) {
        seat.score += 10;
        state.tieBreaker.lastFeedback = {
          playerName: seat.name,
          submittedAnswer: submittedText,
          officialAnswer: tbQ.answer,
          message: `${seat.name} trả lời "${submittedText}" — CHÍNH XÁC (Đáp án: ${tbQ.answer})!`,
        };
        addRoomLog(
          state,
          'Câu hỏi phụ',
          `${seat.name} trả lời ĐÚNG Câu hỏi phụ ("${submittedText}" - Đáp án: ${tbQ.answer}) và trở thành Quán quân Olympia!`,
          '+10'
        );
        state.stage = 'GAME_OVER';
      } else {
        state.tieBreaker.lastFeedback = {
          playerName: seat.name,
          submittedAnswer: submittedText,
          message: `${seat.name} trả lời "${submittedText}" — CHƯA CHÍNH XÁC! Quyền bấm chuông dành cho các thí sinh còn lại.`,
        };
        state.tieBreaker.tiedPositions = state.tieBreaker.tiedPositions.filter(
          (p) => p !== pos
        );
        state.tieBreaker.buzzQueue = (state.tieBreaker.buzzQueue || []).filter(
          (b) => state.tieBreaker.tiedPositions.includes(b.position)
        );
        state.tieBreaker.buzzedPosition = null;
        state.tieBreaker.subPhase = 'BUZZ_OPEN';
        state.tieBreaker.buzzWindowStartMs = nowMs;
        state.tieBreaker.deadlineEpochMs = nowMs + 15000;
        if (state.tieBreaker.tiedPositions.length === 1) {
          const winnerPos = state.tieBreaker.tiedPositions[0];
          state.seats[winnerPos - 1].score += 10;
          state.stage = 'GAME_OVER';
        }
      }
      return state;
    }

    default:
      return currentState;
  }
}
