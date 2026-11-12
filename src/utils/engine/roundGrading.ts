import type {
  OlympiaRoomState,
  Round2RowEvalItem,
} from '../../types/olympia.ts';
import { isAnswerMatch } from '../../data/olympiaQuestions.ts';
import {
  getRoomPersonalQuestions,
  getRoomCommonQuestions,
  getRoomObstaclePuzzles,
  getRoomTangTocQuestions,
  getFinishQuestionById,
  addRoomLog,
} from './roomSelectors.ts';

export function gradeRound1PersonalQuestion(
  state: OlympiaRoomState,
  rawAnswer: string,
  _nowMs: number,
  explicitCorrect?: boolean
): OlympiaRoomState {
  const pos = state.round1.activePosition;
  const seat = state.seats[pos - 1];
  const qNum = state.round1.personalQIndex + 1;
  const globalIdx = (pos - 1) * 6 + state.round1.personalQIndex;
  const personalPool = getRoomPersonalQuestions(state);
  const q = personalPool[globalIdx % personalPool.length];

  const submittedText = rawAnswer.trim() || '(Bỏ qua / Hết giờ)';
  const isCorrect =
    explicitCorrect !== undefined
      ? explicitCorrect
      : isAnswerMatch(rawAnswer, q.acceptedAnswers, q.answer);

  if (isCorrect) {
    seat.score += 10;
    state.round1.lastFeedback = {
      correct: true,
      playerName: seat.name,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      message: `Câu ${qNum}/6: ${seat.name} trả lời "${submittedText}" — MC chấm ĐÚNG (+10 điểm)! Đáp án chính thức: "${q.answer}".`,
      explanation: q.explanation,
    };
    addRoomLog(
      state,
      'Khởi Động',
      `MC chấm ĐÚNG câu ${qNum}/6 cho ${seat.name} ("${submittedText}" — Đáp án: ${q.answer})`,
      '+10'
    );
  } else {
    state.round1.lastFeedback = {
      correct: false,
      playerName: seat.name,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      message: `Câu ${qNum}/6: ${seat.name} trả lời "${submittedText}" — MC chấm SAI (0 điểm). Đáp án chính thức là: "${q.answer}".`,
      explanation: q.explanation,
    };
    addRoomLog(
      state,
      'Khởi Động',
      `MC chấm SAI câu ${qNum}/6 của ${seat.name} ("${submittedText}" — Đáp án: ${q.answer})`,
      '0'
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
    state.round1.deadlineEpochMs = null;
    state.round1.timerStarted = false;
  } else {
    state.round1.subPhase = 'PERSONAL_TURN_DONE';
    state.round1.deadlineEpochMs = null;
    state.round1.timerStarted = false;
  }
  return state;
}

export function gradeRound1CommonQuestion(
  state: OlympiaRoomState,
  buzzPos: 1 | 2 | 3 | 4,
  rawAnswer: string,
  explicitCorrect?: boolean
): OlympiaRoomState {
  const seat = state.seats[buzzPos - 1];
  const commonPool = getRoomCommonQuestions(state);
  const q = commonPool[state.round1.commonQIndex % commonPool.length];
  const submittedText = rawAnswer.trim() || '(Hết giờ)';
  const isCorrect =
    explicitCorrect !== undefined
      ? explicitCorrect
      : isAnswerMatch(rawAnswer, q.acceptedAnswers, q.answer);

  if (isCorrect) {
    seat.score += 10;
    state.round1.lastFeedback = {
      correct: true,
      playerName: seat.name,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      message: `${seat.name} trả lời "${submittedText}" — MC chấm ĐÚNG (+10 điểm)! Đáp án chính thức: "${q.answer}".`,
      explanation: q.explanation,
    };
    addRoomLog(
      state,
      'Khởi Động Chung',
      `Câu ${state.round1.commonQIndex + 1}: MC chấm ĐÚNG cho ${seat.name} ("${submittedText}" — Đáp án: ${q.answer})`,
      '+10'
    );
  } else {
    seat.score = Math.max(0, seat.score - 5);
    state.round1.lastFeedback = {
      correct: false,
      playerName: seat.name,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      message: `${seat.name} trả lời "${submittedText}" — MC chấm SAI (-5 điểm). Đáp án chính thức là: "${q.answer}".`,
      explanation: q.explanation,
    };
    addRoomLog(
      state,
      'Khởi Động Chung',
      `Câu ${state.round1.commonQIndex + 1}: MC chấm SAI cho ${seat.name} ("${submittedText}" — Đáp án: ${q.answer})`,
      '-5'
    );
  }

  state.round1.subPhase = 'COMMON_RESULT';
  state.round1.deadlineEpochMs = null;
  state.round1.timerStarted = false;
  return state;
}

export function gradeRound4MainAnswer(
  state: OlympiaRoomState,
  rawAnswer: string,
  nowMs: number,
  explicitCorrect?: boolean
): OlympiaRoomState {
  const r4 = state.round4;
  const seat = state.seats[r4.activePosition - 1];
  const q = getFinishQuestionById(r4.questionIds[r4.qIndex], state);
  const submittedText = rawAnswer.trim() || '(Bỏ qua / Hết giờ)';
  r4.mainSubmittedAnswer = submittedText;

  const isCorrect =
    explicitCorrect !== undefined
      ? explicitCorrect
      : isAnswerMatch(rawAnswer, q.acceptedAnswers, q.answer);

  if (isCorrect) {
    const gained = r4.starActiveThisQ ? q.points * 2 : q.points;
    seat.score += gained;
    r4.lastResult = {
      correct: true,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      headline: `Chính xác! MC xác nhận ${seat.name} trả lời "${submittedText}" ĐÚNG và giành được +${gained} điểm${
        r4.starActiveThisQ ? ' (Nhân đôi nhờ ★ Ngôi Sao Hy Vọng)' : ''
      }!`,
      detail: `Đáp án chính thức của chương trình: "${q.answer}"`,
      explanation: q.explanation,
    };
    r4.subPhase = 'QUESTION_RESULT';
    r4.deadlineEpochMs = null;
    r4.timerStarted = false;
    addRoomLog(
      state,
      'Về Đích',
      `MC chấm ĐÚNG câu ${r4.qIndex + 1} cho ${seat.name} ("${submittedText}" — Đáp án: ${q.answer})`,
      `+${gained}`
    );
  } else {
    if (r4.starActiveThisQ) {
      seat.score = Math.max(0, seat.score - q.points);
      addRoomLog(
        state,
        'Về Đích',
        `MC chấm SAI cho ${seat.name} ("${submittedText}" — câu có ★ Ngôi Sao Hy Vọng) -> bị trừ ${q.points} điểm!`,
        `-${q.points}`
      );
    } else {
      addRoomLog(
        state,
        'Về Đích',
        `MC chấm SAI cho ${seat.name} ("${submittedText}")! 3 thí sinh còn lại có 5 giây bấm chuông giành quyền trả lời!`
      );
    }
    r4.subPhase = 'STEAL_WINDOW';
    r4.stealerPosition = null;
    r4.stealBuzzQueue = [];
    r4.stealWindowStartMs = nowMs;
    r4.deadlineEpochMs = nowMs + 5000;
    r4.timerStarted = true;
  }
  return state;
}

export function finalizeRound4NoSteal(
  state: OlympiaRoomState
): OlympiaRoomState {
  const r4 = state.round4;
  const q = getFinishQuestionById(r4.questionIds[r4.qIndex], state);
  const mainSeat = state.seats[r4.activePosition - 1];
  r4.subPhase = 'QUESTION_RESULT';
  r4.deadlineEpochMs = null;
  r4.timerStarted = false;
  r4.lastResult = {
    correct: false,
    submittedAnswer: r4.mainSubmittedAnswer || '(Chưa trả lời)',
    officialAnswer: q.answer,
    headline: `${mainSeat.name} trả lời "${
      r4.mainSubmittedAnswer || '(Trống)'
    }" (chưa đúng) và không có thí sinh nào bấm chuông giành quyền trả lời.`,
    detail: `Đáp án chính thức của câu hỏi (${q.points} điểm) là: "${q.answer}".`,
    explanation: q.explanation,
  };
  return state;
}

export function gradeRound4StealAnswer(
  state: OlympiaRoomState,
  stealerPos: 1 | 2 | 3 | 4,
  rawAnswer: string,
  explicitCorrect?: boolean
): OlympiaRoomState {
  const r4 = state.round4;
  const stealerSeat = state.seats[stealerPos - 1];
  const mainSeat = state.seats[r4.activePosition - 1];
  const q = getFinishQuestionById(r4.questionIds[r4.qIndex], state);
  const submittedText = rawAnswer.trim() || '(Hết giờ)';
  r4.stealSubmittedAnswer = submittedText;

  const isCorrect =
    explicitCorrect !== undefined
      ? explicitCorrect
      : isAnswerMatch(rawAnswer, q.acceptedAnswers, q.answer);

  if (isCorrect) {
    stealerSeat.score += q.points;
    if (!r4.starActiveThisQ) {
      mainSeat.score = Math.max(0, mainSeat.score - q.points);
    }
    r4.lastResult = {
      correct: true,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      headline: `Cướp điểm thành công! MC xác nhận ${stealerSeat.name} trả lời "${submittedText}" — CHÍNH XÁC và giành được +${q.points} điểm${
        !r4.starActiveThisQ ? ` từ quỹ điểm của ${mainSeat.name}` : ''
      }!`,
      detail: `Đáp án chính thức của chương trình: "${q.answer}"`,
      explanation: q.explanation,
    };
    addRoomLog(
      state,
      'Về Đích',
      `MC chấm ĐÚNG cho ${stealerSeat.name} cướp điểm thành công ("${submittedText}" — Đáp án: ${q.answer})`,
      `+${q.points}`
    );
  } else {
    const penalty = q.points / 2;
    stealerSeat.score = Math.max(0, stealerSeat.score - penalty);
    r4.lastResult = {
      correct: false,
      submittedAnswer: submittedText,
      officialAnswer: q.answer,
      headline: `MC xác nhận ${stealerSeat.name} bấm chuông trả lời "${submittedText}" — CHƯA CHÍNH XÁC nên bị trừ ${penalty} điểm!`,
      detail: `Đáp án chính thức của chương trình là: "${q.answer}"`,
      explanation: q.explanation,
    };
    addRoomLog(
      state,
      'Về Đích',
      `MC chấm SAI cho ${stealerSeat.name} khi cướp điểm ("${submittedText}" — Đáp án: ${q.answer})`,
      `-${penalty}`
    );
  }

  r4.subPhase = 'QUESTION_RESULT';
  r4.deadlineEpochMs = null;
  r4.timerStarted = false;
  return state;
}

export function handleServerTimerExpired(
  state: OlympiaRoomState,
  currentState: OlympiaRoomState,
  _nowMs: number,
  expectedDeadline?: number
): OlympiaRoomState {
  if (state.stage === 'ROUND_1_KHOI_DONG') {
    const r1 = state.round1;
    if (!r1.deadlineEpochMs) return currentState;
    if (
      expectedDeadline !== undefined &&
      r1.deadlineEpochMs !== expectedDeadline
    ) {
      return currentState;
    }
    r1.deadlineEpochMs = null;
    if (r1.subPhase === 'PERSONAL_ACTIVE' && !r1.pendingPersonalAnswer) {
      r1.pendingPersonalAnswer = '(Hết giờ)';
    } else if (r1.subPhase === 'COMMON_ANSWERING' && !r1.pendingCommonAnswer) {
      r1.pendingCommonAnswer = '(Hết giờ)';
    }
    return state;
  } else if (state.stage === 'ROUND_2_VCNV') {
    const r2 = state.round2;
    if (!r2.deadlineEpochMs) return currentState;
    if (
      expectedDeadline !== undefined &&
      r2.deadlineEpochMs !== expectedDeadline
    ) {
      return currentState;
    }
    r2.deadlineEpochMs = null;
    return state;
  } else if (state.stage === 'ROUND_3_TANG_TOC') {
    const r3 = state.round3;
    if (!r3.deadlineEpochMs) return currentState;
    if (
      expectedDeadline !== undefined &&
      r3.deadlineEpochMs !== expectedDeadline
    ) {
      return currentState;
    }
    r3.deadlineEpochMs = null;
    return state;
  } else if (state.stage === 'ROUND_4_VE_DICH') {
    const r4 = state.round4;
    if (!r4.deadlineEpochMs) return currentState;
    if (
      expectedDeadline !== undefined &&
      r4.deadlineEpochMs !== expectedDeadline
    ) {
      return currentState;
    }
    r4.deadlineEpochMs = null;
    if (r4.subPhase === 'MAIN_ANSWERING' && !r4.mainSubmittedAnswer) {
      r4.mainSubmittedAnswer = '(Hết giờ)';
    } else if (r4.subPhase === 'STEAL_ANSWERING' && !r4.stealSubmittedAnswer) {
      r4.stealSubmittedAnswer = '(Hết giờ)';
    }
    return state;
  } else if (state.stage === 'TIE_BREAKER') {
    const tb = state.tieBreaker;
    if (!tb.deadlineEpochMs) return currentState;
    if (
      expectedDeadline !== undefined &&
      tb.deadlineEpochMs !== expectedDeadline
    ) {
      return currentState;
    }
    tb.deadlineEpochMs = null;
    if (tb.subPhase === 'ANSWERING' && !tb.pendingAnswer) {
      tb.pendingAnswer = '(Hết giờ)';
    }
    return state;
  }
  return currentState;
}

export function evaluateVcnvRow(
  state: OlympiaRoomState,
  nowMs: number = Date.now(),
  explicitCorrectPositions?: (1 | 2 | 3 | 4)[]
): OlympiaRoomState {
  const puzzles = getRoomObstaclePuzzles(state);
  const puzzle = puzzles[state.round2.puzzleIndex] || puzzles[0];
  const mcGrades = state.round2.mcGrades || {};

  if (state.round2.subPhase === 'ANSWERING_CENTER') {
    const centerQ = puzzle.centerQuestion;
    const correctNames: string[] = [];
    const evalResults: Round2RowEvalItem[] = [];

    state.seats.forEach((seat) => {
      const rawAns = state.round2.rowSubmissions[seat.position] || '';
      let isCorrectSeat = false;
      if (explicitCorrectPositions !== undefined) {
        isCorrectSeat = explicitCorrectPositions.includes(seat.position);
      } else if (mcGrades[seat.position] !== undefined) {
        isCorrectSeat = Boolean(mcGrades[seat.position]);
      } else {
        isCorrectSeat = isAnswerMatch(
          rawAns,
          centerQ.acceptedAnswers,
          centerQ.displayWord
        );
      }
      const ok = !seat.vcnvLocked && isCorrectSeat;
      if (ok) {
        seat.score += 10;
        correctNames.push(seat.name);
      }
      evalResults.push({
        position: seat.position,
        name: seat.name,
        submittedAnswer: seat.vcnvLocked
          ? '(Đã khóa quyền VCNV)'
          : rawAns || '(Chưa gửi đáp án)',
        isCorrect: ok,
        pointsAwarded: ok ? 10 : 0,
      });
    });

    state.round2.lastRowEvaluation = {
      rowLabel: 'Ô Trung Tâm',
      question: centerQ.question,
      officialAnswer: centerQ.displayWord,
      explanation: centerQ.explanation,
      results: evalResults,
    };

    if (correctNames.length > 0) {
      state.round2.centerStatus = 'SOLVED';
      state.round2.lastFeedback = `Đáp án Ô Trung Tâm chính thức là "${centerQ.displayWord}". Thí sinh trả lời đúng (+10đ): ${correctNames.join(', ')}. Mảnh ghép trung tâm đã mở!`;
    } else {
      state.round2.centerStatus = 'LOCKED';
      state.round2.lastFeedback = `Không có thí sinh nào trả lời đúng Ô Trung Tâm (Đáp án chính thức: "${centerQ.displayWord}"). Các thí sinh có 15 giây cuối để bấm chuông giải Chướng Ngại Vật!`;
    }
    state.round2.subPhase = 'FINAL_15S';
    state.round2.cnvPhaseStartMs = nowMs;
    state.round2.deadlineEpochMs = nowMs + 15000;
    state.round2.timerStarted = true;
    return state;
  }

  const rowId = state.round2.activeRowId;
  const rowObj = puzzle.rows.find((r) => r.id === rowId);
  if (!rowObj) return state;

  const correctNames: string[] = [];
  const evalResults: Round2RowEvalItem[] = [];

  state.seats.forEach((seat) => {
    const rawAns = state.round2.rowSubmissions[seat.position] || '';
    let isCorrectSeat = false;
    if (explicitCorrectPositions !== undefined) {
      isCorrectSeat = explicitCorrectPositions.includes(seat.position);
    } else if (mcGrades[seat.position] !== undefined) {
      isCorrectSeat = Boolean(mcGrades[seat.position]);
    } else {
      isCorrectSeat = isAnswerMatch(
        rawAns,
        rowObj.acceptedAnswers,
        rowObj.displayWord
      );
    }
    const ok = !seat.vcnvLocked && isCorrectSeat;
    if (ok) {
      seat.score += 10;
      correctNames.push(seat.name);
    }
    evalResults.push({
      position: seat.position,
      name: seat.name,
      submittedAnswer: seat.vcnvLocked
        ? '(Đã khóa quyền VCNV)'
        : rawAns || '(Chưa gửi đáp án)',
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
    state.round2.rowStatuses[rowObj.id] = 'SOLVED';
    state.round2.lastFeedback = `Đáp án Hàng ngang số ${rowObj.id} là "${rowObj.displayWord}". Thí sinh trả lời đúng (+10đ): ${correctNames.join(', ')}. Mảnh ghép hình ảnh số ${rowObj.id} đã được mở!`;
    addRoomLog(
      state,
      'VCNV',
      `Hàng ngang ${rowObj.id} (${rowObj.displayWord}): ${correctNames.join(', ')} trả lời đúng`,
      '+10'
    );
  } else {
    state.round2.rowStatuses[rowObj.id] = 'LOCKED';
    state.round2.lastFeedback = `Không có thí sinh nào trả lời đúng Hàng ngang số ${rowObj.id}. Đáp án chính thức là: "${rowObj.displayWord}". Mảnh ghép số ${rowObj.id} bị khóa!`;
  }

  state.round2.subPhase = 'ROW_RESULT';
  state.round2.deadlineEpochMs = null;
  state.round2.timerStarted = false;
  return state;
}

export function finalizeTangTocQuestion(
  state: OlympiaRoomState,
  explicitCorrectPositions?: (1 | 2 | 3 | 4)[]
): OlympiaRoomState {
  const ttPool = getRoomTangTocQuestions(state);
  const q = ttPool[state.round3.qIndex] || ttPool[0];
  const mcGrades = state.round3.mcGrades || {};

  const allSubs = state.seats.map((seat) => {
    const existing = state.round3.submissions[seat.position];
    const ans = existing ? existing.answer : '(Chưa trả lời)';
    const tSec = existing ? existing.timeSec : q.timeLimitSec;
    let ok = false;
    if (explicitCorrectPositions !== undefined) {
      ok = explicitCorrectPositions.includes(seat.position);
    } else if (mcGrades[seat.position] !== undefined) {
      ok = Boolean(mcGrades[seat.position]);
    } else if (existing) {
      ok = isAnswerMatch(ans, q.acceptedAnswers, q.answer);
    }
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
  state.round3.subPhase = 'QUESTION_RESULT';
  state.round3.deadlineEpochMs = null;
  state.round3.timerStarted = false;

  const winners = allSubs
    .filter((s) => (s.pointsAwarded || 0) > 0)
    .map((s) => `${s.name} (+${s.pointsAwarded}đ - ${s.timeSec.toFixed(2)}s)`);
  addRoomLog(
    state,
    'Tăng Tốc',
    `Câu ${q.number} (Đáp án: ${q.answer}): ${
      winners.length ? winners.join(', ') : 'Không ai trả lời đúng'
    }`
  );

  return state;
}
