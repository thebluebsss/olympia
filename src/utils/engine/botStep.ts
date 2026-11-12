import type { OlympiaRoomState, ClientAction } from '../../types/olympia.ts';
import {
  getRoomPersonalQuestions,
  getRoomCommonQuestions,
  getRoomObstaclePuzzles,
  getRoomTangTocQuestions,
  getFinishQuestionById,
} from './roomSelectors.ts';

/**
 * Automatically generates the next real-time contestant action for any simulated climber (BOT_SIM_*)
 * while leaving all orchestration, turn progression, and answer grading strictly to the MC Host.
 */
export function stepBotActionIfNeeded(
  state: OlympiaRoomState,
  nowMs: number = Date.now()
): ClientAction | null {
  if (!state || state.stage === 'LOBBY' || state.stage === 'GAME_OVER') {
    return null;
  }

  const isBotSeat = (pos: 1 | 2 | 3 | 4): boolean =>
    Boolean(state.seats[pos - 1]?.claimedByClientId?.startsWith('BOT_SIM_'));

  const getBotId = (pos: 1 | 2 | 3 | 4): string | undefined =>
    state.seats[pos - 1]?.claimedByClientId || undefined;

  const hasAnyBot = ([1, 2, 3, 4] as (1 | 2 | 3 | 4)[]).some((p) =>
    isBotSeat(p)
  );
  if (!hasAnyBot) return null;

  const elapsedMs = nowMs - (state.updatedAt || 0);

  if (state.stage === 'ROUND_1_KHOI_DONG') {
    const r1 = state.round1;
    const activePos = r1.activePosition;

    if (
      r1.subPhase === 'PERSONAL_ACTIVE' &&
      r1.deadlineEpochMs !== null &&
      isBotSeat(activePos) &&
      !r1.pendingPersonalAnswer
    ) {
      if (elapsedMs < 2200) return null;
      const globalIdx = (activePos - 1) * 6 + r1.personalQIndex;
      const personalPool = getRoomPersonalQuestions(state);
      const q = personalPool[globalIdx % personalPool.length];
      const shouldBeCorrect =
        r1.personalQIndex !== 2 && r1.personalQIndex !== 5;
      const ans = shouldBeCorrect ? q.answer.toLowerCase() : 'Chưa nhớ rõ';
      return {
        type: 'R1_SUBMIT_PERSONAL',
        position: activePos,
        qIndex: r1.personalQIndex,
        answer: ans,
        clientId: getBotId(activePos),
      };
    }

    if (r1.subPhase === 'COMMON_BUZZ_OPEN' && r1.buzzedPosition === null) {
      if (elapsedMs >= 3200) {
        const botPositions = ([2, 3, 4, 1] as (1 | 2 | 3 | 4)[]).filter((p) =>
          isBotSeat(p)
        );
        if (botPositions.length > 0) {
          const chosenBot =
            botPositions[r1.commonQIndex % botPositions.length];
          return {
            type: 'R1_BUZZ_COMMON',
            position: chosenBot,
            clientId: getBotId(chosenBot),
          };
        }
      }
    }

    if (
      r1.subPhase === 'COMMON_ANSWERING' &&
      r1.buzzedPosition &&
      isBotSeat(r1.buzzedPosition) &&
      !r1.pendingCommonAnswer
    ) {
      if (elapsedMs < 1800) return null;
      const commonPool = getRoomCommonQuestions(state);
      const q = commonPool[r1.commonQIndex] || commonPool[0];
      const shouldBeCorrect = r1.commonQIndex % 3 !== 1;
      const ans = shouldBeCorrect ? q.answer.toLowerCase() : 'Đáp án khác';
      return {
        type: 'R1_SUBMIT_COMMON',
        position: r1.buzzedPosition,
        qIndex: r1.commonQIndex,
        answer: ans,
        clientId: getBotId(r1.buzzedPosition),
      };
    }
  }

  if (state.stage === 'ROUND_2_VCNV') {
    const r2 = state.round2;
    if (
      (r2.subPhase === 'ANSWERING_ROW' || r2.subPhase === 'ANSWERING_CENTER') &&
      r2.deadlineEpochMs !== null &&
      r2.cnvBuzzerPosition === null
    ) {
      const puzzles = getRoomObstaclePuzzles(state);
      const puzzle = puzzles[r2.puzzleIndex] || puzzles[0];
      for (const pos of [2, 3, 4, 1] as (1 | 2 | 3 | 4)[]) {
        if (
          isBotSeat(pos) &&
          !state.seats[pos - 1].vcnvLocked &&
          r2.rowSubmissions[pos] === undefined
        ) {
          let correctWord = '';
          if (r2.subPhase === 'ANSWERING_CENTER') {
            correctWord = puzzle.centerQuestion.displayWord;
          } else {
            const rowObj = puzzle.rows.find((r) => r.id === r2.activeRowId);
            correctWord = rowObj ? rowObj.displayWord : '';
          }
          const shouldBeCorrect = pos !== 4 || (r2.activeRowId || 1) % 2 === 0;
          return {
            type: 'R2_SUBMIT_ROW_ANSWER',
            position: pos,
            answer: shouldBeCorrect ? correctWord.toLowerCase() : 'Chưa rõ',
            clientId: getBotId(pos),
          };
        }
      }
    }
  }

  if (state.stage === 'ROUND_3_TANG_TOC') {
    const r3 = state.round3;
    if (r3.subPhase === 'QUESTION_ACTIVE' && r3.deadlineEpochMs !== null) {
      const ttPool = getRoomTangTocQuestions(state);
      const q = ttPool[r3.qIndex] || ttPool[0];
      for (const pos of [2, 3, 4, 1] as (1 | 2 | 3 | 4)[]) {
        if (isBotSeat(pos) && !r3.submissions[pos]) {
          const shouldBeCorrect = pos !== 4 || r3.qIndex % 2 === 0;
          return {
            type: 'R3_SUBMIT_ANSWER',
            position: pos,
            answer: shouldBeCorrect ? q.answer.toLowerCase() : 'Phương án khác',
            clientId: getBotId(pos),
          };
        }
      }
    }
  }

  if (state.stage === 'ROUND_4_VE_DICH') {
    const r4 = state.round4;
    const activePos = r4.activePosition;

    if (r4.subPhase === 'SELECT_PACKAGE' && isBotSeat(activePos)) {
      if (elapsedMs < 2000) return null;
      const pkg: [20 | 30, 20 | 30, 20 | 30] =
        activePos === 2
          ? [20, 20, 30]
          : activePos === 3
            ? [20, 30, 20]
            : [20, 30, 30];
      return {
        type: 'R4_CONFIRM_PACKAGE',
        position: activePos,
        points: pkg,
        clientId: getBotId(activePos),
      };
    }

    if (
      r4.subPhase === 'MAIN_ANSWERING' &&
      r4.deadlineEpochMs !== null &&
      isBotSeat(activePos) &&
      !r4.mainSubmittedAnswer
    ) {
      if (elapsedMs < 3000) return null;
      const q = getFinishQuestionById(r4.questionIds[r4.qIndex], state);
      const shouldBeCorrect = r4.qIndex !== 1;
      return {
        type: 'R4_SUBMIT_MAIN_ANSWER',
        qIndex: r4.qIndex,
        answer: shouldBeCorrect ? q.answer.toLowerCase() : 'Chưa chắc chắn',
        clientId: getBotId(activePos),
      };
    }

    if (
      r4.subPhase === 'STEAL_ANSWERING' &&
      r4.stealerPosition &&
      isBotSeat(r4.stealerPosition) &&
      !r4.stealSubmittedAnswer
    ) {
      if (elapsedMs < 2500) return null;
      const q = getFinishQuestionById(r4.questionIds[r4.qIndex], state);
      return {
        type: 'R4_SUBMIT_STEAL_ANSWER',
        position: r4.stealerPosition,
        answer: q.answer.toLowerCase(),
        clientId: getBotId(r4.stealerPosition),
      };
    }
  }

  return null;
}
