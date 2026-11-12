import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Send,
  Star,
  Bell,
  Trophy,
  Sparkles,
  BookOpen,
  Timer,
  Shuffle,
  ArrowLeft,
  Eye,
  Award,
} from 'lucide-react';
import type { RoomQuestionDeck } from '../types/olympia.ts';
import {
  KHOI_DONG_PERSONAL_QUESTIONS,
  KHOI_DONG_COMMON_QUESTIONS,
  OBSTACLE_PUZZLES,
  TANG_TOC_QUESTIONS,
  VE_DICH_20_QUESTIONS,
  VE_DICH_30_QUESTIONS,
  TIE_BREAKER_QUESTIONS,
  isAnswerMatch,
  type QuizQuestion,
  type ObstaclePuzzle,
  type AccelerationQuestion,
  type FinishQuestion,
} from '../data/olympiaQuestions.ts';
import { soundFX } from '../utils/soundEffects.ts';
import { resolveObstacleImageUrl } from '../utils/obstacleIllustrations.ts';
import laurelWreathImg from '../assets/images/olympia_laurel_wreath_1794066591261.jpg';

type SoloRoundTab = 'R1_KHOI_DONG' | 'R2_VCNV' | 'R3_TANG_TOC' | 'R4_VE_DICH' | 'SUMMARY';

interface PracticeHistoryItem {
  round: string;
  question: string;
  userAnswer: string;
  officialAnswer: string;
  correct: boolean;
  pointsDelta: number;
  timeSec?: number;
}

interface SoloPracticeArenaProps {
  playerName: string;
  playerSchool: string;
  initialSubjectFilter?: string;
  onExitPractice: () => void;
}

const SUBJECT_OPTIONS = [
  { value: '', label: 'Tất cả lĩnh vực (Tổng hợp)' },
  { value: 'Toán học', label: 'Toán học & Tư duy Logic' },
  { value: 'Vật lý', label: 'Vật lý & Thiên văn' },
  { value: 'Hóa học', label: 'Hóa học' },
  { value: 'Sinh học', label: 'Sinh học' },
  { value: 'Lịch sử', label: 'Lịch sử' },
  { value: 'Địa lý', label: 'Địa lý' },
  { value: 'Văn học', label: 'Văn học & Tiếng Việt' },
  { value: 'Tiếng Anh', label: 'Tiếng Anh' },
  { value: 'Hiểu biết chung', label: 'Hiểu biết chung & Thể thao - Nghệ thuật' },
];

function createFallbackDeck(): RoomQuestionDeck {
  return {
    deckId: 'solo-fallback',
    mode: 'CLASSIC_DEFAULT',
    label: 'Bộ đề Olympia Mặc Định',
    personalQuestions: [...KHOI_DONG_PERSONAL_QUESTIONS],
    commonQuestions: [...KHOI_DONG_COMMON_QUESTIONS],
    obstaclePuzzles: [...OBSTACLE_PUZZLES],
    tangTocQuestions: [...TANG_TOC_QUESTIONS].slice(0, 4),
    veDich20Questions: [...VE_DICH_20_QUESTIONS],
    veDich30Questions: [...VE_DICH_30_QUESTIONS],
    tieBreakerQuestions: [...TIE_BREAKER_QUESTIONS],
  };
}

export const SoloPracticeArena: React.FC<SoloPracticeArenaProps> = ({
  playerName,
  playerSchool,
  initialSubjectFilter = '',
  onExitPractice,
}) => {
  const [deck, setDeck] = useState<RoomQuestionDeck>(() => createFallbackDeck());
  const [isLoadingDeck, setIsLoadingDeck] = useState<boolean>(false);
  const [subjectFilter, setSubjectFilter] = useState<string>(initialSubjectFilter);
  const [seasonFilter, setSeasonFilter] = useState<string>('');

  const [activeTab, setActiveTab] = useState<SoloRoundTab>('R1_KHOI_DONG');
  const [score, setScore] = useState<number>(0);
  const [history, setHistory] = useState<PracticeHistoryItem[]>([]);

  // ==================== ROUND 1 STATE ====================
  const [r1Index, setR1Index] = useState<number>(0);
  const [r1Input, setR1Input] = useState<string>('');
  const [r1TimeLeft, setR1TimeLeft] = useState<number>(12);
  const [r1Feedback, setR1Feedback] = useState<{
    correct: boolean;
    userAnswer: string;
    officialAnswer: string;
    explanation: string;
    pointsDelta: number;
  } | null>(null);

  const r1Questions: QuizQuestion[] = [
    ...(deck.personalQuestions || []).slice(0, 6),
    ...(deck.commonQuestions || []).slice(0, 6),
  ];
  const currentR1Q = r1Questions[r1Index] || r1Questions[0];

  // ==================== ROUND 2 STATE ====================
  const [r2PuzzleIdx, setR2PuzzleIdx] = useState<number>(0);
  const [r2RowStatuses, setR2RowStatuses] = useState<Record<number, 'UNOPENED' | 'SOLVED' | 'LOCKED'>>({
    1: 'UNOPENED',
    2: 'UNOPENED',
    3: 'UNOPENED',
    4: 'UNOPENED',
  });
  const [r2CenterStatus, setR2CenterStatus] = useState<'UNOPENED' | 'SOLVED' | 'LOCKED'>('UNOPENED');
  const [r2ActiveRow, setR2ActiveRow] = useState<1 | 2 | 3 | 4 | 'CENTER' | null>(null);
  const [r2RowInput, setR2RowInput] = useState<string>('');
  const [r2TimeLeft, setR2TimeLeft] = useState<number>(15);
  const [r2RowFeedback, setR2RowFeedback] = useState<{
    correct: boolean;
    rowLabel: string;
    userAnswer: string;
    officialAnswer: string;
    explanation: string;
  } | null>(null);
  const [r2ShowCnvInput, setR2ShowCnvInput] = useState<boolean>(false);
  const [r2CnvInput, setR2CnvInput] = useState<string>('');
  const [r2CnvSolved, setR2CnvSolved] = useState<{
    solved: boolean;
    userKeyword: string;
    pointsAwarded: number;
  } | null>(null);

  const r2Puzzles: ObstaclePuzzle[] =
    deck.obstaclePuzzles && deck.obstaclePuzzles.length > 0
      ? deck.obstaclePuzzles
      : OBSTACLE_PUZZLES;
  const currentPuzzle = r2Puzzles[r2PuzzleIdx % r2Puzzles.length] || OBSTACLE_PUZZLES[0];

  // ==================== ROUND 3 STATE ====================
  const [r3Index, setR3Index] = useState<number>(0);
  const [r3Input, setR3Input] = useState<string>('');
  const [r3TimeLeft, setR3TimeLeft] = useState<number>(15);
  const [r3ElapsedSec, setR3ElapsedSec] = useState<number>(0);
  const [r3Feedback, setR3Feedback] = useState<{
    correct: boolean;
    userAnswer: string;
    officialAnswer: string;
    explanation: string;
    timeSec: number;
    pointsDelta: number;
  } | null>(null);
  const r3StartPerfRef = useRef<number>(performance.now());

  const r3Questions: AccelerationQuestion[] = (
    deck.tangTocQuestions && deck.tangTocQuestions.length >= 4
      ? deck.tangTocQuestions
      : TANG_TOC_QUESTIONS
  ).slice(0, 4);
  const currentR3Q = r3Questions[r3Index] || r3Questions[0];

  // ==================== ROUND 4 STATE ====================
  const [r4SubPhase, setR4SubPhase] = useState<'PACKAGE' | 'PLAYING' | 'DONE'>('PACKAGE');
  const [r4Package, setR4Package] = useState<[20 | 30, 20 | 30, 20 | 30]>([20, 20, 30]);
  const [r4Questions, setR4Questions] = useState<FinishQuestion[]>([]);
  const [r4Index, setR4Index] = useState<number>(0);
  const [r4StarUsed, setR4StarUsed] = useState<boolean>(false);
  const [r4StarActive, setR4StarActive] = useState<boolean>(false);
  const [r4Input, setR4Input] = useState<string>('');
  const [r4TimeLeft, setR4TimeLeft] = useState<number>(15);
  const [r4Feedback, setR4Feedback] = useState<{
    correct: boolean;
    userAnswer: string;
    officialAnswer: string;
    explanation: string;
    pointsDelta: number;
  } | null>(null);

  const currentR4Q = r4Questions[r4Index] || deck.veDich20Questions[0] || VE_DICH_20_QUESTIONS[0];

  const resetAllRoundsWithDeck = useCallback((newDeck: RoomQuestionDeck) => {
    setDeck(newDeck);
    setScore(0);
    setHistory([]);
    setActiveTab('R1_KHOI_DONG');
    // R1
    setR1Index(0);
    setR1Input('');
    setR1TimeLeft(12);
    setR1Feedback(null);
    // R2
    setR2PuzzleIdx(0);
    setR2RowStatuses({ 1: 'UNOPENED', 2: 'UNOPENED', 3: 'UNOPENED', 4: 'UNOPENED' });
    setR2CenterStatus('UNOPENED');
    setR2ActiveRow(null);
    setR2RowInput('');
    setR2RowFeedback(null);
    setR2ShowCnvInput(false);
    setR2CnvInput('');
    setR2CnvSolved(null);
    // R3
    setR3Index(0);
    setR3Input('');
    const firstTtLimit = newDeck.tangTocQuestions?.[0]?.timeLimitSec || 15;
    setR3TimeLeft(firstTtLimit);
    setR3ElapsedSec(0);
    setR3Feedback(null);
    r3StartPerfRef.current = performance.now();
    // R4
    setR4SubPhase('PACKAGE');
    setR4Package([20, 20, 30]);
    setR4Questions([]);
    setR4Index(0);
    setR4StarUsed(false);
    setR4StarActive(false);
    setR4Input('');
    setR4Feedback(null);
  }, []);

  const fetchNewPracticeDeck = useCallback(
    async (subj: string, seas: string) => {
      setIsLoadingDeck(true);
      try {
        const res = await fetch('/api/questions/practice-deck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'CSV_RANDOM',
            subjectFilter: subj || undefined,
            season: seas || undefined,
          }),
        });
        const data = await res.json();
        if (data?.deck) {
          resetAllRoundsWithDeck(data.deck);
        }
      } catch {
        resetAllRoundsWithDeck(createFallbackDeck());
      } finally {
        setIsLoadingDeck(false);
      }
    },
    [resetAllRoundsWithDeck]
  );

  useEffect(() => {
    fetchNewPracticeDeck(initialSubjectFilter, '');
  }, [fetchNewPracticeDeck, initialSubjectFilter]);

  // ==================== ROUND 1 AUTO TIMER & GRADING ====================
  const submitR1Answer = useCallback(
    (rawAns: string) => {
      if (!currentR1Q || r1Feedback) return;
      const trimmed = rawAns.trim() || '(Hết giờ / Bỏ qua)';
      const isCorrect =
        rawAns.trim().length > 0 &&
        isAnswerMatch(rawAns, currentR1Q.acceptedAnswers, currentR1Q.answer);
      const isCommon = r1Index >= 6;
      const delta = isCorrect ? 10 : isCommon && rawAns.trim().length > 0 ? -5 : 0;

      if (isCorrect) soundFX.playCorrect();
      else soundFX.playWrong();

      setScore((prev) => prev + delta);
      setR1Feedback({
        correct: isCorrect,
        userAnswer: trimmed,
        officialAnswer: currentR1Q.answer,
        explanation: currentR1Q.explanation,
        pointsDelta: delta,
      });
      setHistory((prev) => [
        ...prev,
        {
          round: isCommon ? 'Khởi Động Chung' : 'Khởi Động Cá Nhân',
          question: currentR1Q.question,
          userAnswer: trimmed,
          officialAnswer: currentR1Q.answer,
          correct: isCorrect,
          pointsDelta: delta,
        },
      ]);
    },
    [currentR1Q, r1Feedback, r1Index]
  );

  useEffect(() => {
    if (activeTab !== 'R1_KHOI_DONG' || r1Feedback || !currentR1Q) return;
    setR1TimeLeft(12);
    const endMs = Date.now() + 12000;
    const timer = window.setInterval(() => {
      const rem = Math.max(0, Math.ceil((endMs - Date.now()) / 1000));
      setR1TimeLeft((prev) => {
        if (rem !== prev && rem > 0 && rem <= 3) soundFX.playTick(true);
        return rem;
      });
      if (rem <= 0) {
        window.clearInterval(timer);
        submitR1Answer('');
      }
    }, 150);
    return () => window.clearInterval(timer);
  }, [activeTab, r1Index, r1Feedback, currentR1Q, submitR1Answer]);

  const handleNextR1Question = () => {
    if (r1Index + 1 < r1Questions.length) {
      setR1Index((i) => i + 1);
      setR1Input('');
      setR1Feedback(null);
    } else {
      soundFX.playRoundStart();
      setActiveTab('R2_VCNV');
    }
  };

  // ==================== ROUND 2 AUTO TIMER & GRADING ====================
  const submitR2RowAnswer = useCallback(
    (rawAns: string) => {
      if (!r2ActiveRow || r2RowFeedback) return;
      const trimmed = rawAns.trim() || '(Hết giờ / Bỏ qua)';

      if (r2ActiveRow === 'CENTER') {
        const centerQ = currentPuzzle.centerQuestion;
        const isCorrect =
          rawAns.trim().length > 0 &&
          isAnswerMatch(rawAns, centerQ.acceptedAnswers, centerQ.displayWord);
        const delta = isCorrect ? 10 : 0;
        if (isCorrect) soundFX.playCorrect();
        else soundFX.playWrong();
        setR2CenterStatus(isCorrect ? 'SOLVED' : 'LOCKED');
        setScore((s) => s + delta);
        setR2RowFeedback({
          correct: isCorrect,
          rowLabel: 'Ô Trung Tâm',
          userAnswer: trimmed,
          officialAnswer: centerQ.displayWord,
          explanation: centerQ.explanation,
        });
        setHistory((prev) => [
          ...prev,
          {
            round: 'VCNV · Ô Trung Tâm',
            question: centerQ.question,
            userAnswer: trimmed,
            officialAnswer: centerQ.displayWord,
            correct: isCorrect,
            pointsDelta: delta,
          },
        ]);
        return;
      }

      const rowObj = currentPuzzle.rows.find((r) => r.id === r2ActiveRow);
      if (!rowObj) return;
      const isCorrect =
        rawAns.trim().length > 0 &&
        isAnswerMatch(rawAns, rowObj.acceptedAnswers, rowObj.displayWord);
      const delta = isCorrect ? 10 : 0;
      if (isCorrect) soundFX.playCorrect();
      else soundFX.playWrong();

      setR2RowStatuses((prev) => ({
        ...prev,
        [r2ActiveRow]: isCorrect ? 'SOLVED' : 'LOCKED',
      }));
      setScore((s) => s + delta);
      setR2RowFeedback({
        correct: isCorrect,
        rowLabel: `Hàng ngang số ${r2ActiveRow}`,
        userAnswer: trimmed,
        officialAnswer: rowObj.displayWord,
        explanation: rowObj.explanation,
      });
      setHistory((prev) => [
        ...prev,
        {
          round: `VCNV · Hàng ngang ${r2ActiveRow}`,
          question: rowObj.question,
          userAnswer: trimmed,
          officialAnswer: rowObj.displayWord,
          correct: isCorrect,
          pointsDelta: delta,
        },
      ]);
    },
    [r2ActiveRow, r2RowFeedback, currentPuzzle]
  );

  useEffect(() => {
    if (activeTab !== 'R2_VCNV' || !r2ActiveRow || r2RowFeedback || r2CnvSolved) return;
    setR2TimeLeft(15);
    const endMs = Date.now() + 15000;
    const timer = window.setInterval(() => {
      const rem = Math.max(0, Math.ceil((endMs - Date.now()) / 1000));
      setR2TimeLeft((prev) => {
        if (rem !== prev && rem > 0 && rem <= 3) soundFX.playTick(true);
        return rem;
      });
      if (rem <= 0) {
        window.clearInterval(timer);
        submitR2RowAnswer('');
      }
    }, 150);
    return () => window.clearInterval(timer);
  }, [activeTab, r2ActiveRow, r2RowFeedback, r2CnvSolved, submitR2RowAnswer]);

  const openedRowsCount = Object.values(r2RowStatuses).filter(
    (st) => st !== 'UNOPENED'
  ).length;
  const cnvRewardPoints =
    r2CenterStatus !== 'UNOPENED'
      ? 20
      : openedRowsCount === 0
      ? 60
      : openedRowsCount === 1
      ? 50
      : openedRowsCount === 2
      ? 40
      : 30;

  const handleSolveCnv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!r2CnvInput.trim() || r2CnvSolved) return;
    const isCorrect = isAnswerMatch(
      r2CnvInput,
      currentPuzzle.acceptedKeywords,
      currentPuzzle.keywordDisplay
    );
    const pts = isCorrect ? cnvRewardPoints : 0;
    if (isCorrect) {
      soundFX.playCorrect();
      setR2RowStatuses({ 1: 'SOLVED', 2: 'SOLVED', 3: 'SOLVED', 4: 'SOLVED' });
      setR2CenterStatus('SOLVED');
      setScore((s) => s + pts);
    } else {
      soundFX.playWrong();
    }
    setR2CnvSolved({
      solved: isCorrect,
      userKeyword: r2CnvInput.trim(),
      pointsAwarded: pts,
    });
    setR2ShowCnvInput(false);
    setHistory((prev) => [
      ...prev,
      {
        round: 'VCNV · Từ khóa CNV',
        question: `Từ khóa Chướng Ngại Vật (${currentPuzzle.charCount} chữ cái)`,
        userAnswer: r2CnvInput.trim(),
        officialAnswer: currentPuzzle.keywordDisplay,
        correct: isCorrect,
        pointsDelta: pts,
      },
    ]);
  };

  // ==================== ROUND 3 AUTO TIMER & GRADING ====================
  const submitR3Answer = useCallback(
    (rawAns: string) => {
      if (!currentR3Q || r3Feedback) return;
      const limitSec = currentR3Q.timeLimitSec || 20;
      const elapsed = Math.min(
        limitSec,
        Math.max(0.05, Number(((performance.now() - r3StartPerfRef.current) / 1000).toFixed(2)))
      );
      const trimmed = rawAns.trim() || '(Hết giờ / Bỏ qua)';
      const isCorrect =
        rawAns.trim().length > 0 &&
        isAnswerMatch(rawAns, currentR3Q.acceptedAnswers, currentR3Q.answer);

      let pts = 0;
      if (isCorrect) {
        const ratio = elapsed / limitSec;
        if (ratio <= 0.4) pts = 40;
        else if (ratio <= 0.65) pts = 30;
        else if (ratio <= 0.85) pts = 20;
        else pts = 10;
        soundFX.playCorrect();
      } else {
        soundFX.playWrong();
      }

      setScore((s) => s + pts);
      setR3Feedback({
        correct: isCorrect,
        userAnswer: trimmed,
        officialAnswer: currentR3Q.answer,
        explanation: currentR3Q.explanation,
        timeSec: elapsed,
        pointsDelta: pts,
      });
      setHistory((prev) => [
        ...prev,
        {
          round: `Tăng Tốc · Câu ${currentR3Q.number}`,
          question: currentR3Q.question,
          userAnswer: trimmed,
          officialAnswer: currentR3Q.answer,
          correct: isCorrect,
          pointsDelta: pts,
          timeSec: elapsed,
        },
      ]);
    },
    [currentR3Q, r3Feedback]
  );

  useEffect(() => {
    if (activeTab !== 'R3_TANG_TOC' || r3Feedback || !currentR3Q) return;
    const limitSec = currentR3Q.timeLimitSec || 20;
    setR3TimeLeft(limitSec);
    setR3ElapsedSec(0);
    r3StartPerfRef.current = performance.now();
    const endMs = Date.now() + limitSec * 1000;

    const timer = window.setInterval(() => {
      const msLeft = endMs - Date.now();
      const rem = Math.max(0, Math.ceil(msLeft / 1000));
      const elapsed = Math.min(
        limitSec,
        Math.max(0, (performance.now() - r3StartPerfRef.current) / 1000)
      );
      setR3ElapsedSec(Number(elapsed.toFixed(2)));
      setR3TimeLeft((prev) => {
        if (rem !== prev && rem > 0 && rem <= 3) soundFX.playTick(true);
        return rem;
      });
      if (msLeft <= 0) {
        window.clearInterval(timer);
        submitR3Answer('');
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [activeTab, r3Index, r3Feedback, currentR3Q, submitR3Answer]);

  // ==================== ROUND 4 AUTO TIMER & GRADING ====================
  const startR4Package = () => {
    const p20 = [...(deck.veDich20Questions || VE_DICH_20_QUESTIONS)];
    const p30 = [...(deck.veDich30Questions || VE_DICH_30_QUESTIONS)];
    let idx20 = 0;
    let idx30 = 0;
    const chosen: FinishQuestion[] = r4Package.map((pts) => {
      if (pts === 20) {
        const q = p20[idx20 % p20.length];
        idx20++;
        return q;
      } else {
        const q = p30[idx30 % p30.length];
        idx30++;
        return q;
      }
    });
    soundFX.playRoundStart();
    setR4Questions(chosen);
    setR4Index(0);
    setR4StarUsed(false);
    setR4StarActive(false);
    setR4Feedback(null);
    setR4Input('');
    setR4SubPhase('PLAYING');
  };

  const submitR4Answer = useCallback(
    (rawAns: string) => {
      if (!currentR4Q || r4Feedback) return;
      const trimmed = rawAns.trim() || '(Hết giờ / Bỏ qua)';
      const isCorrect =
        rawAns.trim().length > 0 &&
        isAnswerMatch(rawAns, currentR4Q.acceptedAnswers, currentR4Q.answer);

      let delta = 0;
      if (isCorrect) {
        delta = r4StarActive ? currentR4Q.points * 2 : currentR4Q.points;
        soundFX.playCorrect();
      } else {
        delta = r4StarActive ? -currentR4Q.points : 0;
        soundFX.playWrong();
      }

      setScore((s) => s + delta);
      setR4Feedback({
        correct: isCorrect,
        userAnswer: trimmed,
        officialAnswer: currentR4Q.answer,
        explanation: currentR4Q.explanation,
        pointsDelta: delta,
      });
      setHistory((prev) => [
        ...prev,
        {
          round: `Về Đích · Câu ${r4Index + 1}/3 (${currentR4Q.points}đ${
            r4StarActive ? ' ★' : ''
          })`,
          question: currentR4Q.question,
          userAnswer: trimmed,
          officialAnswer: currentR4Q.answer,
          correct: isCorrect,
          pointsDelta: delta,
        },
      ]);
    },
    [currentR4Q, r4Feedback, r4StarActive, r4Index]
  );

  useEffect(() => {
    if (
      activeTab !== 'R4_VE_DICH' ||
      r4SubPhase !== 'PLAYING' ||
      r4Feedback ||
      !currentR4Q
    ) {
      return;
    }
    const limitSec = currentR4Q.points === 20 ? 15 : 20;
    setR4TimeLeft(limitSec);
    const endMs = Date.now() + limitSec * 1000;

    const timer = window.setInterval(() => {
      const rem = Math.max(0, Math.ceil((endMs - Date.now()) / 1000));
      setR4TimeLeft((prev) => {
        if (rem !== prev && rem > 0 && rem <= 3) soundFX.playTick(true);
        return rem;
      });
      if (rem <= 0) {
        window.clearInterval(timer);
        submitR4Answer('');
      }
    }, 150);

    return () => window.clearInterval(timer);
  }, [activeTab, r4SubPhase, r4Index, r4Feedback, currentR4Q, submitR4Answer]);

  // Allow user to override a synonym as correct if machine string-matching missed a valid synonym
  const handleManualSynonymOverride = (
    roundType: 'R1' | 'R3' | 'R4',
    ptsToAward: number
  ) => {
    soundFX.playCorrect();
    setScore((s) => s + ptsToAward);
    if (roundType === 'R1' && r1Feedback) {
      setR1Feedback({
        ...r1Feedback,
        correct: true,
        pointsDelta: r1Feedback.pointsDelta + ptsToAward,
      });
    } else if (roundType === 'R3' && r3Feedback) {
      setR3Feedback({
        ...r3Feedback,
        correct: true,
        pointsDelta: ptsToAward,
      });
    } else if (roundType === 'R4' && r4Feedback) {
      setR4Feedback({
        ...r4Feedback,
        correct: true,
        pointsDelta: r4Feedback.pointsDelta + ptsToAward,
      });
    }
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy[copy.length - 1];
      copy[copy.length - 1] = {
        ...last,
        correct: true,
        pointsDelta: last.pointsDelta + ptsToAward,
      };
      return copy;
    });
  };

  const correctCount = history.filter((h) => h.correct).length;

  return (
    <div className="space-y-6">
      {/* Top Solo Practice Header & Subject Filter */}
      <div className="bg-slate-900/95 border border-sky-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExitPractice}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Thoát Chế Độ Ôn Tập
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-sky-400 uppercase">
                <BookOpen className="w-3.5 h-3.5" />
                CHẾ ĐỘ ÔN TẬP 1 NGƯỜI · MÁY TỰ CHẤM KHÔNG CẦN MC
              </div>
              <div className="text-lg font-display font-extrabold text-white">
                Nhà Leo Núi: {playerName} ({playerSchool})
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-right">
              <div className="text-[11px] text-slate-400">Tỷ lệ trả lời đúng</div>
              <div className="font-mono font-bold text-sm text-emerald-400">
                {correctCount} / {history.length} câu
              </div>
            </div>
            <div className="px-5 py-2 rounded-xl bg-amber-400/15 border-2 border-amber-400 text-right">
              <div className="text-[10px] font-bold text-amber-300 uppercase">
                Tổng điểm ôn tập
              </div>
              <div className="font-mono font-extrabold text-2xl text-amber-300 tabular-nums">
                {score} điểm
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Round Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'R1_KHOI_DONG', label: '1. Khởi Động' },
                { id: 'R2_VCNV', label: '2. Vượt Chướng Ngại Vật' },
                { id: 'R3_TANG_TOC', label: '3. Tăng Tốc' },
                { id: 'R4_VE_DICH', label: '4. Về Đích' },
                { id: 'SUMMARY', label: '🏆 Tổng Kết' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={subjectFilter}
              onChange={(e) => {
                const nextSubj = e.target.value;
                setSubjectFilter(nextSubj);
                fetchNewPracticeDeck(nextSubj, seasonFilter);
              }}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
            >
              {SUBJECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={seasonFilter}
              onChange={(e) => {
                const nextSeas = e.target.value;
                setSeasonFilter(nextSeas);
                fetchNewPracticeDeck(subjectFilter, nextSeas);
              }}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
            >
              <option value="">Tất cả mùa Olympia</option>
              <option value="26">Olympia Mùa 26</option>
              <option value="25">Olympia Mùa 25</option>
              <option value="24">Olympia Mùa 24</option>
              <option value="23">Olympia Mùa 23</option>
              <option value="22">Olympia Mùa 22</option>
            </select>

            <button
              type="button"
              disabled={isLoadingDeck}
              onClick={() => fetchNewPracticeDeck(subjectFilter, seasonFilter)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-xs cursor-pointer shadow"
            >
              <Shuffle className="w-3.5 h-3.5" />
              {isLoadingDeck ? 'Đang tạo đề...' : 'Đổi Bộ Đề Mới'}
            </button>
          </div>
        </div>
      </div>

      {/* ==================== ROUND 1: KHỞI ĐỘNG ==================== */}
      {activeTab === 'R1_KHOI_DONG' && currentR1Q && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase">
                VÒNG 1: KHỞI ĐỘNG · MÁY TỰ ĐỘNG CHẤM ĐÁP ÁN TỨC THÌ
              </div>
              <h2 className="text-2xl font-display font-extrabold text-white">
                Câu hỏi {r1Index + 1} / {r1Questions.length} (
                {r1Index < 6
                  ? 'Lượt Cá Nhân: Đúng +10đ, Sai 0đ'
                  : 'Lượt Chung: Đúng +10đ, Sai -5đ'}
                )
              </h2>
            </div>

            <div
              className={`w-14 h-14 rounded-xl border flex items-center justify-center font-mono font-bold text-2xl tabular-nums ${
                r1TimeLeft <= 3
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-amber-300'
              }`}
            >
              {r1Feedback ? 'XONG' : `${r1TimeLeft}s`}
            </div>
          </div>

          <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="text-xs font-semibold text-sky-300">
              {currentR1Q.category}
            </div>
            <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentR1Q.question}
            </p>
          </div>

          {!r1Feedback ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitR1Answer(r1Input);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={r1Input}
                onChange={(e) => setR1Input(e.target.value)}
                placeholder="Nhập câu trả lời và nhấn Enter (máy tự chấm ngay)..."
                className="flex-1 px-4 py-3.5 bg-slate-950 border-2 border-amber-400 rounded-xl text-white text-sm font-semibold focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                Nộp Đáp Án
              </button>
              <button
                type="button"
                onClick={() => submitR1Answer('')}
                className="px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer shrink-0"
              >
                Bỏ qua
              </button>
            </form>
          ) : (
            <div
              className={`p-5 rounded-xl border space-y-4 ${
                r1Feedback.correct
                  ? 'bg-emerald-950/40 border-emerald-500/50'
                  : 'bg-rose-950/40 border-rose-500/40'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {r1Feedback.correct ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-base font-extrabold text-white">
                      {r1Feedback.correct
                        ? `CHÍNH XÁC! (+${r1Feedback.pointsDelta} điểm)`
                        : `CHƯA CHÍNH XÁC (${r1Feedback.pointsDelta} điểm)`}
                    </div>
                    <div className="text-xs text-slate-300">
                      Câu trả lời của bạn: <strong>"{r1Feedback.userAnswer}"</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!r1Feedback.correct && (
                    <button
                      type="button"
                      onClick={() =>
                        handleManualSynonymOverride(
                          'R1',
                          10 - r1Feedback.pointsDelta
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-xs font-bold text-emerald-300 cursor-pointer"
                    >
                      ✓ Đáp án của tôi đồng nghĩa (Cộng +10đ)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNextR1Question}
                    autoFocus
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer shadow-lg"
                  >
                    {r1Index + 1 < r1Questions.length
                      ? `Sang Câu ${r1Index + 2}/${r1Questions.length}`
                      : 'Hoàn thành Khởi Động · Sang Vượt Chướng Ngại Vật'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-1 text-xs">
                <div className="text-emerald-300 font-bold text-sm">
                  Đáp án chính thức: {r1Feedback.officialAnswer}
                </div>
                {r1Feedback.explanation && (
                  <div className="text-slate-300">{r1Feedback.explanation}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== ROUND 2: VƯỢT CHƯỚNG NGẠI VẬT ==================== */}
      {activeTab === 'R2_VCNV' && currentPuzzle && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase">
                VÒNG 2: VƯỢT CHƯỚNG NGẠI VẬT ({currentPuzzle.charCount} CHỮ CÁI) · ĐIỂM CNV HIỆN TẠI: +{cnvRewardPoints}Đ
              </div>
              <h2 className="text-2xl font-display font-extrabold text-white">
                Chướng Ngại Vật: {r2CnvSolved ? currentPuzzle.keywordDisplay : `${currentPuzzle.charCount} chữ cái`}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setR2PuzzleIdx((i) => i + 1);
                  setR2RowStatuses({
                    1: 'UNOPENED',
                    2: 'UNOPENED',
                    3: 'UNOPENED',
                    4: 'UNOPENED',
                  });
                  setR2CenterStatus('UNOPENED');
                  setR2ActiveRow(null);
                  setR2RowFeedback(null);
                  setR2CnvSolved(null);
                  setR2ShowCnvInput(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 cursor-pointer"
              >
                🎲 Đổi Chướng Ngại Vật Khác
              </button>
              {!r2CnvSolved && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playBuzzer();
                    setR2ShowCnvInput((v) => !v);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs cursor-pointer shadow-lg"
                >
                  <Bell className="w-4 h-4 fill-slate-950" />
                  Bấm Chuông Giải Từ Khóa CNV (+{cnvRewardPoints}đ)
                </button>
              )}
            </div>
          </div>

          {r2ShowCnvInput && !r2CnvSolved && (
            <form
              onSubmit={handleSolveCnv}
              className="p-4 bg-amber-950/40 border-2 border-amber-400 rounded-xl flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={r2CnvInput}
                onChange={(e) => setR2CnvInput(e.target.value)}
                placeholder={`Nhập Từ khóa Chướng Ngại Vật (${currentPuzzle.charCount} chữ cái)...`}
                className="flex-1 px-4 py-3 bg-slate-950 border border-amber-400 rounded-xl text-white text-sm font-bold focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer"
              >
                Xác nhận Giải CNV (+{cnvRewardPoints}đ)
              </button>
            </form>
          )}

          {r2CnvSolved && (
            <div
              className={`p-5 rounded-xl border space-y-2 ${
                r2CnvSolved.solved
                  ? 'bg-emerald-950/50 border-emerald-500/50'
                  : 'bg-rose-950/40 border-rose-500/40'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-base font-extrabold text-white">
                  {r2CnvSolved.solved
                    ? `🎉 XUẤT SẮC! Bạn đã giải đúng Từ khóa CNV "${currentPuzzle.keywordDisplay}" (+${r2CnvSolved.pointsAwarded} điểm)!`
                    : `Từ khóa "${r2CnvSolved.userKeyword}" chưa chính xác! Đáp án CNV là: "${currentPuzzle.keywordDisplay}"`}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playRoundStart();
                    setActiveTab('R3_TANG_TOC');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs cursor-pointer"
                >
                  Sang Vòng 3: Tăng Tốc
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300">
                {currentPuzzle.summaryExplanation}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Mystery Image with 5 Tiles */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950">
                <img
                  src={resolveObstacleImageUrl(
                    currentPuzzle.id,
                    currentPuzzle.imageUrl,
                    currentPuzzle.keywordDisplay,
                    currentPuzzle.title,
                    currentPuzzle.rows.map((r) => r.displayWord),
                    currentPuzzle.centerQuestion.displayWord,
                    currentPuzzle.summaryExplanation
                  )}
                  alt="Hình ảnh gợi ý Chướng Ngại Vật"
                  className="w-full h-full object-cover"
                />
                {!r2CnvSolved?.solved && (
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    {([1, 2, 3, 4] as const).map((tileId) => {
                      const st = r2RowStatuses[tileId];
                      if (st === 'SOLVED') return <div key={tileId} />;
                      return (
                        <div
                          key={tileId}
                          className={`relative border border-slate-700 flex flex-col items-center justify-center select-none ${
                            st === 'LOCKED'
                              ? 'bg-rose-950/95 text-rose-300'
                              : 'bg-slate-900/95 text-sky-300'
                          }`}
                        >
                          <span className="font-display font-extrabold text-2xl">
                            {tileId}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                            {st === 'LOCKED' ? 'Đã khóa' : `Mảnh ghép ${tileId}`}
                          </span>
                        </div>
                      );
                    })}
                    {r2CenterStatus !== 'SOLVED' && (
                      <div className="absolute inset-1/4 border-2 border-amber-400 rounded-xl bg-slate-950/95 flex flex-col items-center justify-center shadow-2xl select-none">
                        <span className="font-display font-extrabold text-sm text-amber-400">
                          Ô TRUNG TÂM
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {r2CenterStatus === 'LOCKED' ? 'Đã khóa' : 'Mảnh số 5'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!r2CnvSolved && (
                <button
                  type="button"
                  onClick={() => {
                    setR2RowStatuses({
                      1: 'SOLVED',
                      2: 'SOLVED',
                      3: 'SOLVED',
                      4: 'SOLVED',
                    });
                    setR2CenterStatus('SOLVED');
                    setR2CnvSolved({
                      solved: false,
                      userKeyword: '(Xem đáp án)',
                      pointsAwarded: 0,
                    });
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Mở toàn bộ hình ảnh & Xem đáp án CNV
                </button>
              )}
            </div>

            {/* 4 Horizontal Rows + Active Row Question */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-2.5">
                {currentPuzzle.rows.map((row) => {
                  const st = r2RowStatuses[row.id];
                  const isSelected = r2ActiveRow === row.id;
                  return (
                    <div
                      key={row.id}
                      className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                        st === 'SOLVED'
                          ? 'bg-emerald-950/40 border-emerald-500/50'
                          : st === 'LOCKED'
                          ? 'bg-rose-950/30 border-rose-500/40'
                          : isSelected
                          ? 'bg-amber-500/15 border-amber-400'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 font-mono text-xs font-bold text-amber-300">
                          HN {row.id} ({row.charCount} chữ)
                        </span>
                        <span className="font-mono font-extrabold text-sm tracking-widest text-white">
                          {st === 'SOLVED' || r2CnvSolved
                            ? row.displayWord
                            : '● '.repeat(row.charCount).trim()}
                        </span>
                      </div>

                      {st === 'UNOPENED' && !r2CnvSolved && (
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playRoundStart();
                            setR2ActiveRow(row.id as 1 | 2 | 3 | 4);
                            setR2RowFeedback(null);
                            setR2RowInput('');
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-xs cursor-pointer"
                        >
                          Chọn mở HN {row.id}
                        </button>
                      )}
                    </div>
                  );
                })}

                {openedRowsCount >= 4 &&
                  r2CenterStatus === 'UNOPENED' &&
                  !r2CnvSolved && (
                    <div className="p-3.5 rounded-xl border border-amber-400/50 bg-amber-950/20 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">
                        Ô Trung Tâm (Mảnh ghép số 5)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setR2ActiveRow('CENTER');
                          setR2RowFeedback(null);
                          setR2RowInput('');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer"
                      >
                        Mở câu hỏi Ô Trung Tâm
                      </button>
                    </div>
                  )}
              </div>

              {r2ActiveRow && !r2CnvSolved && (
                <div className="p-5 bg-slate-950 border-2 border-sky-400/60 rounded-xl space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-sky-300">
                    <span>
                      {r2ActiveRow === 'CENTER'
                        ? 'Câu hỏi Ô Trung Tâm'
                        : `Câu hỏi Hàng ngang số ${r2ActiveRow}`}
                    </span>
                    {!r2RowFeedback && (
                      <span className="font-mono text-amber-300">
                        ⏱ Còn {r2TimeLeft}s
                      </span>
                    )}
                  </div>

                  <p className="text-base font-bold text-white leading-relaxed">
                    {r2ActiveRow === 'CENTER'
                      ? currentPuzzle.centerQuestion.question
                      : currentPuzzle.rows.find((r) => r.id === r2ActiveRow)
                          ?.question}
                  </p>

                  {!r2RowFeedback ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitR2RowAnswer(r2RowInput);
                      }}
                      className="flex gap-2.5"
                    >
                      <input
                        type="text"
                        value={r2RowInput}
                        onChange={(e) => setR2RowInput(e.target.value)}
                        placeholder="Nhập đáp án hàng ngang và nhấn Enter..."
                        className="flex-1 px-4 py-3 bg-slate-900 border border-amber-400 rounded-xl text-white text-sm font-semibold focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer"
                      >
                        Nộp
                      </button>
                    </form>
                  ) : (
                    <div
                      className={`p-4 rounded-xl border space-y-1 text-xs ${
                        r2RowFeedback.correct
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      }`}
                    >
                      <div className="font-extrabold text-sm text-white">
                        {r2RowFeedback.correct
                          ? `✓ CHÍNH XÁC (+10 điểm)! Đáp án: ${r2RowFeedback.officialAnswer}`
                          : `✕ CHƯA ĐÚNG! Đáp án chính thức: ${r2RowFeedback.officialAnswer}`}
                      </div>
                      {r2RowFeedback.explanation && (
                        <div className="text-slate-300">
                          {r2RowFeedback.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== ROUND 3: TĂNG TỐC ==================== */}
      {activeTab === 'R3_TANG_TOC' && currentR3Q && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase">
                VÒNG 3: TĂNG TỐC · TÍNH GIỜ CHÍNH XÁC 0.01 GIÂY (+40 / +30 / +20 / +10 ĐIỂM)
              </div>
              <h2 className="text-2xl font-display font-extrabold text-white">
                Câu Tăng Tốc {r3Index + 1} / 4 ({currentR3Q.timeLimitSec} giây)
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right font-mono text-xs text-sky-300">
                ⏱ Đã trôi qua: {r3ElapsedSec.toFixed(2)}s
              </div>
              <div
                className={`w-14 h-14 rounded-xl border flex items-center justify-center font-mono font-bold text-2xl tabular-nums ${
                  r3TimeLeft <= 5
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-amber-300'
                }`}
              >
                {r3Feedback ? 'XONG' : `${r3TimeLeft}s`}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <div className="text-xs font-semibold text-sky-300">
              {currentR3Q.typeLabel}
            </div>
            <p className="text-lg font-bold text-white leading-relaxed">
              {currentR3Q.question}
            </p>
            {currentR3Q.clues && currentR3Q.clues.length > 0 && (
              <div className="space-y-2 pt-1">
                {currentR3Q.clues.map((clue, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 font-medium"
                  >
                    {clue}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!r3Feedback ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitR3Answer(r3Input);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={r3Input}
                onChange={(e) => setR3Input(e.target.value)}
                placeholder="Nhập đáp án Tăng Tốc càng nhanh càng được điểm cao (40 - 30 - 20 - 10đ)..."
                className="flex-1 px-4 py-3.5 bg-slate-950 border-2 border-amber-400 rounded-xl text-white text-sm font-semibold focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                Gửi Đáp Án ({r3ElapsedSec.toFixed(2)}s)
              </button>
            </form>
          ) : (
            <div
              className={`p-5 rounded-xl border space-y-4 ${
                r3Feedback.correct
                  ? 'bg-emerald-950/40 border-emerald-500/50'
                  : 'bg-rose-950/40 border-rose-500/40'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-base font-extrabold text-white flex items-center gap-2">
                    {r3Feedback.correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <span>
                      {r3Feedback.correct
                        ? `CHÍNH XÁC Ở ${r3Feedback.timeSec.toFixed(2)} GIÂY! (+${r3Feedback.pointsDelta} điểm)`
                        : `CHƯA CHÍNH XÁC (${r3Feedback.timeSec.toFixed(2)}s)`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Đáp án đã gửi: <strong>"{r3Feedback.userAnswer}"</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!r3Feedback.correct && (
                    <button
                      type="button"
                      onClick={() => handleManualSynonymOverride('R3', 30)}
                      className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-xs font-bold text-emerald-300 cursor-pointer"
                    >
                      ✓ Đáp án của tôi đồng nghĩa (+30đ)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (r3Index + 1 < 4) {
                        setR3Index((i) => i + 1);
                        setR3Input('');
                        setR3Feedback(null);
                      } else {
                        soundFX.playRoundStart();
                        setActiveTab('R4_VE_DICH');
                      }
                    }}
                    autoFocus
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer shadow-lg"
                  >
                    {r3Index + 1 < 4
                      ? `Sang Câu Tăng Tốc ${r3Index + 2}/4`
                      : 'Sang Vòng 4: Về Đích'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-1 text-xs">
                <div className="text-emerald-300 font-bold text-sm">
                  Đáp án chính thức: {r3Feedback.officialAnswer}
                </div>
                {r3Feedback.explanation && (
                  <div className="text-slate-300">{r3Feedback.explanation}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== ROUND 4: VỀ ĐÍCH ==================== */}
      {activeTab === 'R4_VE_DICH' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          {r4SubPhase === 'PACKAGE' ? (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase">
                  VÒNG 4: VỀ ĐÍCH · LỰA CHỌN GÓI 3 CÂU HỎI (20 ĐIỂM HOẶC 30 ĐIỂM)
                </div>
                <h2 className="text-2xl font-display font-extrabold text-white">
                  Chọn Gói Câu Hỏi Về Đích Của Bạn
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map((slotIdx) => (
                  <div
                    key={slotIdx}
                    className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-center"
                  >
                    <div className="text-xs font-bold text-slate-400 uppercase">
                      Câu hỏi số {slotIdx + 1}
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {([20, 30] as const).map((val) => {
                        const active = r4Package[slotIdx] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              const next: [20 | 30, 20 | 30, 20 | 30] = [
                                ...r4Package,
                              ] as [20 | 30, 20 | 30, 20 | 30];
                              next[slotIdx] = val;
                              setR4Package(next);
                            }}
                            className={`py-3 rounded-xl font-mono font-extrabold text-lg border cursor-pointer ${
                              active
                                ? 'bg-amber-400 text-slate-950 border-amber-300'
                                : 'bg-slate-900 text-slate-300 border-slate-800'
                            }`}
                          >
                            {val}đ
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Thời gian suy nghĩ: {r4Package[slotIdx] === 20 ? '15 giây' : '20 giây'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={startR4Package}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  Bắt Đầu Gói Về Đích ({r4Package.join(' - ')} điểm)
                </button>
              </div>
            </div>
          ) : (
            currentR4Q && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-bold text-amber-400 uppercase">
                      VÒNG 4: VỀ ĐÍCH · CÂU {r4Index + 1} / 3 ({currentR4Q.points} ĐIỂM)
                    </div>
                    <h2 className="text-2xl font-display font-extrabold text-white">
                      {currentR4Q.category}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    {!r4StarUsed && !r4StarActive && !r4Feedback && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playStarOfHope();
                          setR4StarUsed(true);
                          setR4StarActive(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs cursor-pointer shadow"
                      >
                        <Star className="w-4 h-4 fill-slate-950" />
                        Đặt Ngôi Sao Hy Vọng (×2 điểm)
                      </button>
                    )}
                    {r4StarActive && (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-300 text-xs font-extrabold">
                        ★ Đang bật Ngôi Sao Hy Vọng (+{currentR4Q.points * 2}đ / -{currentR4Q.points}đ)
                      </span>
                    )}
                    <div
                      className={`w-14 h-14 rounded-xl border flex items-center justify-center font-mono font-bold text-2xl tabular-nums ${
                        r4TimeLeft <= 3
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-800 border-slate-700 text-amber-300'
                      }`}
                    >
                      {r4Feedback ? 'XONG' : `${r4TimeLeft}s`}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl">
                  <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                    {currentR4Q.question}
                  </p>
                </div>

                {!r4Feedback ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitR4Answer(r4Input);
                    }}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <input
                      type="text"
                      value={r4Input}
                      onChange={(e) => setR4Input(e.target.value)}
                      placeholder="Nhập đáp án Về Đích và nhấn Enter..."
                      className="flex-1 px-4 py-3.5 bg-slate-950 border-2 border-amber-400 rounded-xl text-white text-sm font-semibold focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      Nộp Đáp Án
                    </button>
                  </form>
                ) : (
                  <div
                    className={`p-5 rounded-xl border space-y-4 ${
                      r4Feedback.correct
                        ? 'bg-emerald-950/40 border-emerald-500/50'
                        : 'bg-rose-950/40 border-rose-500/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-base font-extrabold text-white">
                          {r4Feedback.correct
                            ? `CHÍNH XÁC! (+${r4Feedback.pointsDelta} điểm)`
                            : `CHƯA CHÍNH XÁC (${r4Feedback.pointsDelta} điểm)`}
                        </div>
                        <div className="text-xs text-slate-300">
                          Đáp án đã gửi: <strong>"{r4Feedback.userAnswer}"</strong>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {!r4Feedback.correct && (
                          <button
                            type="button"
                            onClick={() =>
                              handleManualSynonymOverride(
                                'R4',
                                (r4StarActive
                                  ? currentR4Q.points * 2
                                  : currentR4Q.points) - r4Feedback.pointsDelta
                              )
                            }
                            className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-xs font-bold text-emerald-300 cursor-pointer"
                          >
                            ✓ Đáp án đồng nghĩa (Cộng điểm)
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (r4Index + 1 < 3) {
                              setR4Index((i) => i + 1);
                              setR4StarActive(false);
                              setR4Input('');
                              setR4Feedback(null);
                            } else {
                              soundFX.playRoundStart();
                              setActiveTab('SUMMARY');
                            }
                          }}
                          autoFocus
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer shadow-lg"
                        >
                          {r4Index + 1 < 3
                            ? `Sang Câu Về Đích ${r4Index + 2}/3`
                            : 'Xem Tổng Kết Điểm Ôn Tập'}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-1 text-xs">
                      <div className="text-emerald-300 font-bold text-sm">
                        Đáp án chính thức: {r4Feedback.officialAnswer}
                      </div>
                      {r4Feedback.explanation && (
                        <div className="text-slate-300">
                          {r4Feedback.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* ==================== SUMMARY TAB ==================== */}
      {activeTab === 'SUMMARY' && (
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
                <Trophy className="w-4 h-4" />
                TỔNG KẾT CHẾ ĐỘ ÔN TẬP CÁ NHÂN ĐƯỜNG LÊN ĐỈNH OLYMPIA
              </div>
              <h2 className="text-3xl font-display font-extrabold text-white">
                {playerName} đạt {score} điểm ({correctCount}/{history.length} câu đúng)
              </h2>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => fetchNewPracticeDeck(subjectFilter, seasonFilter)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm cursor-pointer shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  Ôn Tập Lượt Mới (Đổi Bộ Đề Mới)
                </button>
                <button
                  type="button"
                  onClick={onExitPractice}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer"
                >
                  Quay Về Màn Hình Chính
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border-2 border-amber-400/60 bg-slate-950 max-w-xs mx-auto">
                <img
                  src={laurelWreathImg}
                  alt="Vòng Nguyệt Quế"
                  className="w-full aspect-square object-cover"
                />
              </div>
            </div>
          </div>

          {history.length > 0 && (
            <div className="space-y-3 border-t border-slate-800 pt-5">
              <div className="text-xs font-bold text-slate-400 uppercase">
                Chi tiết các câu hỏi đã làm trong lượt ôn tập ({history.length} câu):
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-3 ${
                      item.correct
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5 max-w-3xl">
                      <div className="font-bold text-amber-300">
                        #{idx + 1} · {item.round}
                      </div>
                      <div className="text-white font-medium">{item.question}</div>
                      <div className="text-slate-300">
                        Bạn trả lời: <strong>"{item.userAnswer}"</strong> · Đáp án chuẩn:{' '}
                        <strong className="text-emerald-400">
                          {item.officialAnswer}
                        </strong>
                      </div>
                    </div>
                    <div
                      className={`font-mono font-extrabold text-sm ${
                        item.pointsDelta > 0
                          ? 'text-emerald-400'
                          : item.pointsDelta < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.pointsDelta > 0
                        ? `+${item.pointsDelta}đ`
                        : `${item.pointsDelta}đ`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
