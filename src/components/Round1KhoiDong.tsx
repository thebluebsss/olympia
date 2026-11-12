import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Send,
  User,
  SkipForward,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import {
  getRoomPersonalQuestions,
  getRoomCommonQuestions,
} from '../utils/olympiaEngine';
import { isAnswerMatch } from '../data/olympiaQuestions';
import type { OlympiaRoomState, ClientAction } from '../types/olympia';
import { soundFX } from '../utils/soundEffects';
import { BuzzerQueuePanel } from './shared/BuzzerQueuePanel';

interface Round1KhoiDongProps {
  room: OlympiaRoomState;
  clientId: string;
  isHost: boolean;
  myPositions: (1 | 2 | 3 | 4)[];
  onDispatch: (action: ClientAction) => void;
}

export const Round1KhoiDong: React.FC<Round1KhoiDongProps> = ({
  room,
  clientId,
  isHost,
  myPositions,
  onDispatch,
}) => {
  const { round1, seats } = room;
  const myPosition: 1 | 2 | 3 | 4 | null = myPositions[0] ?? null;
  const activeSeat = seats[round1.activePosition - 1];
  const buzzedSeat = round1.buzzedPosition ? seats[round1.buzzedPosition - 1] : null;

  const isMyPersonalTurn = myPosition === round1.activePosition;
  const isMyCommonBuzzAnswer =
    round1.buzzedPosition !== null && myPosition === round1.buzzedPosition;

  const [textAnswer, setTextAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(12);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastExpiredDeadlineRef = useRef<number | null>(null);
  const localTimerAnchorRef = useRef<{ token: number | null; localEndMs: number }>({
    token: null,
    localEndMs: 0,
  });
  const buzzWindowLocalStartPerfRef = useRef<number>(performance.now());

  useEffect(() => {
    if (round1.subPhase === 'COMMON_BUZZ_OPEN') {
      buzzWindowLocalStartPerfRef.current = performance.now();
    }
  }, [round1.subPhase, round1.commonQIndex, round1.buzzWindowStartMs]);

  useEffect(() => {
    if (!round1.deadlineEpochMs) return;
    const durationMs = round1.subPhase === 'COMMON_BUZZ_OPEN' ? 10000 : 12000;
    if (localTimerAnchorRef.current.token !== round1.deadlineEpochMs) {
      localTimerAnchorRef.current = {
        token: round1.deadlineEpochMs,
        localEndMs: Date.now() + durationMs,
      };
      setTimeLeft(Math.ceil(durationMs / 1000));
    }

    const updateClock = () => {
      const msLeft = localTimerAnchorRef.current.localEndMs - Date.now();
      const rem = Math.max(0, Math.ceil(msLeft / 1000));
      setTimeLeft((prev) => {
        if (rem !== prev && rem > 0 && rem <= 3) soundFX.playTick(true);
        return rem;
      });
      if (
        msLeft <= 0 &&
        round1.deadlineEpochMs &&
        lastExpiredDeadlineRef.current !== round1.deadlineEpochMs &&
        isHost
      ) {
        lastExpiredDeadlineRef.current = round1.deadlineEpochMs;
        onDispatch({
          type: 'SERVER_TIMER_EXPIRED',
          expectedDeadline: round1.deadlineEpochMs,
        });
      }
    };

    updateClock();
    const interval = window.setInterval(updateClock, 100);
    return () => window.clearInterval(interval);
  }, [round1.deadlineEpochMs, round1.subPhase, isHost, onDispatch]);

  useEffect(() => {
    setTextAnswer('');
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [round1.subPhase, round1.personalQIndex, round1.commonQIndex, round1.activePosition]);

  const isCommonBuzzCountdownActive =
    round1.subPhase === 'COMMON_BUZZ_OPEN' && Boolean(round1.deadlineEpochMs) && timeLeft > 0;

  const haveIBuzzedCommon = Boolean(
    myPosition && (round1.buzzQueue || []).some((entry) => entry.position === myPosition)
  );

  const canICoBuzzCommon =
    round1.subPhase === 'COMMON_ANSWERING' && !round1.pendingCommonAnswer && !haveIBuzzedCommon;

  const triggerMyCommonBuzz = () => {
    if (!myPosition || haveIBuzzedCommon) return;
    if (round1.subPhase === 'COMMON_BUZZ_OPEN' && !isCommonBuzzCountdownActive) return;
    if (round1.subPhase === 'COMMON_ANSWERING' && !canICoBuzzCommon) return;
    const elapsedSec = Math.max(
      0.01,
      Math.min(
        10,
        Number(((performance.now() - buzzWindowLocalStartPerfRef.current) / 1000).toFixed(2))
      )
    );
    soundFX.playBuzzer();
    onDispatch({
      type: 'R1_BUZZ_COMMON',
      position: myPosition,
      clientBuzzElapsedSec: elapsedSec,
      clientId,
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (!myPosition || haveIBuzzedCommon) return;
      if (round1.subPhase === 'COMMON_BUZZ_OPEN' && !isCommonBuzzCountdownActive) return;
      if (round1.subPhase === 'COMMON_ANSWERING' && !canICoBuzzCommon) return;
      if (round1.subPhase !== 'COMMON_BUZZ_OPEN' && round1.subPhase !== 'COMMON_ANSWERING') return;
      if (e.code === 'Space') {
        e.preventDefault();
        triggerMyCommonBuzz();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const personalPool = getRoomPersonalQuestions(room);
  const commonPool = getRoomCommonQuestions(room);
  const personalGlobalIdx = (round1.activePosition - 1) * 6 + round1.personalQIndex;
  const personalQ = personalPool[personalGlobalIdx % personalPool.length];
  const commonQ = commonPool[round1.commonQIndex % commonPool.length];
  const historyList = round1.personalHistory || [];

  const personalSuggestedMatch =
    round1.pendingPersonalAnswer &&
    round1.pendingPersonalAnswer !== '(Bỏ qua)' &&
    round1.pendingPersonalAnswer !== '(Hết giờ)'
      ? isAnswerMatch(
          round1.pendingPersonalAnswer,
          personalQ?.acceptedAnswers || [],
          personalQ?.answer || ''
        )
      : false;

  const commonSuggestedMatch =
    round1.pendingCommonAnswer &&
    round1.pendingCommonAnswer !== '(Bỏ qua)' &&
    round1.pendingCommonAnswer !== '(Hết giờ)'
      ? isAnswerMatch(
          round1.pendingCommonAnswer,
          commonQ?.acceptedAnswers || [],
          commonQ?.answer || ''
        )
      : false;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="text-xs font-semibold text-amber-400">
            PHẦN THI THỨ NHẤT · MC ĐIỀU PHỐI & CHẤM ĐIỂM TRỰC TIẾP
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">1. Khởi Động</h2>
        </div>

        {(round1.subPhase === 'PERSONAL_ACTIVE' ||
          round1.subPhase === 'COMMON_BUZZ_OPEN' ||
          round1.subPhase === 'COMMON_ANSWERING') && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">
                {round1.subPhase === 'PERSONAL_ACTIVE'
                  ? `Lượt của ${activeSeat.name} · Câu ${round1.personalQIndex + 1} / 6`
                  : `Lượt bấm chuông chung · Câu ${round1.commonQIndex + 1} / 12`}
              </div>
              <div className="text-xs font-medium text-sky-300">
                {round1.subPhase === 'PERSONAL_ACTIVE'
                  ? 'MC chấm Đúng +10đ · Sai 0đ'
                  : 'MC chấm Đúng +10đ · Bấm chuông sai -5đ'}
              </div>
            </div>

            <div
              className={`w-14 h-14 rounded-xl border flex items-center justify-center font-mono font-bold text-2xl tabular-nums ${
                !round1.deadlineEpochMs
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 text-xs'
                  : timeLeft <= 3
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-amber-300'
              }`}
            >
              {round1.deadlineEpochMs
                ? `${timeLeft}s`
                : !round1.timerStarted && round1.subPhase === 'PERSONAL_ACTIVE'
                ? 'CHỜ MC'
                : 'CHẤM'}
            </div>
          </div>
        )}
      </div>

      {/* PERSONAL_READY */}
      {round1.subPhase === 'PERSONAL_READY' && (
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 font-mono font-extrabold text-xl flex items-center justify-center">
              #{round1.activePosition}
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase">
                LƯỢT KHỞI ĐỘNG CÁ NHÂN · VỊ TRÍ SỐ {round1.activePosition} / 4
              </div>
              <h3 className="text-xl font-bold text-white">
                Mời Nhà Leo Núi: {activeSeat.name} ({activeSeat.school})
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            <strong>{activeSeat.name}</strong> sẽ trả lời liên tiếp{' '}
            <strong>6 câu hỏi cá nhân</strong> (12 giây/câu). Sau khi mở từng câu hỏi,{' '}
            <strong>MC Chủ Phòng</strong> chủ động bấm nút bắt đầu chạy đồng hồ 12 giây và chấm{' '}
            <span className="text-emerald-400 font-bold">ĐÚNG (+10 điểm)</span> hoặc{' '}
            <span className="text-rose-400 font-bold">SAI (0 điểm)</span>!
          </p>

          {isHost ? (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  soundFX.playRoundStart();
                  onDispatch({ type: 'R1_START_PERSONAL_TURN', clientId });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shadow-lg"
              >
                [MC] Mở câu hỏi số 1 của {activeSeat.name} (Vị trí {round1.activePosition})
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-4 bg-sky-950/40 border border-sky-500/30 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-sky-200 font-medium">
              <Eye className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                Đang chờ <strong>MC Chủ Phòng</strong> bấm bắt đầu lượt thi Khởi Động cá nhân của{' '}
                <strong>
                  {activeSeat.name} (Vị trí {round1.activePosition})
                </strong>
                ...
              </span>
            </div>
          )}
        </div>
      )}

      {/* PERSONAL_ACTIVE */}
      {round1.subPhase === 'PERSONAL_ACTIVE' && personalQ && (
        <div className="space-y-5">
          <div className="px-4 py-2.5 bg-sky-950/60 border border-sky-500/40 rounded-xl flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-sky-300 flex items-center gap-2">
              <User className="w-4 h-4" />
              LƯỢT THI CÁ NHÂN CỦA: {activeSeat.name.toUpperCase()} (VỊ TRÍ {round1.activePosition})
            </span>
            <div className="flex items-center gap-3">
              {!round1.timerStarted && !round1.deadlineEpochMs && (
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-[11px] font-bold text-amber-300">
                  ⏱ Chờ MC bấm chạy đồng hồ 12s
                </span>
              )}
              <span className="text-xs font-mono text-amber-300 font-bold">
                Câu {round1.personalQIndex + 1} / 6
              </span>
            </div>
          </div>

          <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="text-xs font-semibold text-sky-300">Lĩnh vực: {personalQ.category}</div>
            <p className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
              {personalQ.question}
            </p>
          </div>

          {isHost && (
            <div className="p-5 bg-amber-950/35 border-2 border-amber-400/80 rounded-2xl space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-400/30 pb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  BẢNG ĐIỀU KHIỂN & ĐÁP ÁN BÍ MẬT DÀNH RIÊNG CHO MC CHỦ PHÒNG
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-200 text-[11px] font-bold">
                  Chỉ MC nhìn thấy đáp án này
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-950/90 border border-emerald-500/40 rounded-xl space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    Đáp án chính thức câu {round1.personalQIndex + 1}/6:
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-emerald-400">
                    {personalQ.answer}
                  </div>
                  {personalQ.explanation && (
                    <div className="text-xs text-slate-300 pt-1">
                      Giải thích: {personalQ.explanation}
                    </div>
                  )}
                </div>

                <div className="p-3.5 bg-slate-950/90 border border-sky-500/40 rounded-xl space-y-1.5 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    Câu trả lời của {activeSeat.name} (Vị trí {round1.activePosition}):
                  </div>
                  {round1.pendingPersonalAnswer ? (
                    <div className="space-y-1">
                      <div className="text-base sm:text-lg font-extrabold text-white">
                        "{round1.pendingPersonalAnswer}"
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          personalSuggestedMatch
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {personalSuggestedMatch
                          ? 'Gợi ý đối chiếu: Khớp đáp án'
                          : 'Hãy kiểm tra & quyết định Đúng / Sai'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-amber-300 italic">
                      Thí sinh đang suy nghĩ / nhập câu trả lời... (MC có thể chấm trực tiếp bất cứ
                      lúc nào)
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div>
                  {!round1.timerStarted && !round1.deadlineEpochMs ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playTick(false);
                        onDispatch({ type: 'MC_START_QUESTION_TIMER', clientId });
                      }}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-lg cursor-pointer active:scale-95 transition-transform"
                    >
                      ⏱ [MC] Bắt Đầu Chạy Đồng Hồ (12 giây)
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-sky-300">
                      {round1.deadlineEpochMs
                        ? `⏱ Đồng hồ đang đếm ngược: còn ${timeLeft}s`
                        : '⏱ Đã hết thời gian / Đã nhận câu trả lời'}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playCorrect();
                      onDispatch({ type: 'R1_MC_GRADE_PERSONAL', isCorrect: true, clientId });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg cursor-pointer active:scale-95 transition-transform"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    MC Chấm ĐÚNG (+10 điểm) & Qua câu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playWrong();
                      onDispatch({ type: 'R1_MC_GRADE_PERSONAL', isCorrect: false, clientId });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-rose-500 hover:bg-rose-400 text-white shadow-lg cursor-pointer active:scale-95 transition-transform"
                  >
                    <XCircle className="w-4 h-4" />
                    MC Chấm SAI (0 điểm) & Qua câu
                  </button>
                </div>
              </div>
            </div>
          )}

          {isMyPersonalTurn ? (
            round1.pendingPersonalAnswer ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 text-sm text-emerald-200 font-semibold">
                <span>
                  Bạn đã gửi đáp án: <strong className="text-white">"{round1.pendingPersonalAnswer}"</strong> — Đang chờ MC Chủ Phòng chấm điểm và chuyển câu...
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
            ) : !round1.timerStarted ? (
              <div className="p-4 bg-slate-900 border border-amber-400/50 rounded-xl flex items-center gap-2 text-sm text-amber-300 font-semibold">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Đang chờ MC Chủ Phòng đọc câu hỏi và bấm <strong>"Bắt Đầu Chạy Đồng Hồ"</strong> (12 giây) để mở ô nhập đáp án...
                </span>
              </div>
            ) : !round1.deadlineEpochMs ? (
              <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl text-sm text-rose-200 font-semibold">
                ⏱ Đã hết 12 giây trả lời — Đang chờ MC Chủ Phòng chấm điểm và chuyển câu...
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  soundFX.playBuzzer();
                  onDispatch({
                    type: 'R1_SUBMIT_PERSONAL',
                    position: round1.activePosition,
                    qIndex: round1.personalQIndex,
                    answer: textAnswer,
                    clientId,
                  });
                  setTextAnswer('');
                }}
                className="flex flex-wrap sm:flex-nowrap gap-3"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder={`[${activeSeat.name}] Nhập đáp án tự luận câu ${round1.personalQIndex + 1}/6 rồi nhấn Enter...`}
                  className="w-full flex-1 px-4 py-3.5 bg-slate-950 border-2 border-amber-400/80 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-amber-300"
                  autoFocus
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  Gửi đáp án
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playWrong();
                    onDispatch({
                      type: 'R1_SUBMIT_PERSONAL',
                      position: round1.activePosition,
                      qIndex: round1.personalQIndex,
                      answer: '(Bỏ qua)',
                      clientId,
                    });
                    setTextAnswer('');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer shrink-0"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Bỏ qua
                </button>
              </form>
            )
          ) : !isHost ? (
            <div className="p-4 bg-sky-950/50 border border-sky-400/40 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-sm text-sky-200 font-semibold">
                <Eye className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  {round1.pendingPersonalAnswer ? (
                    <>
                      <strong>{activeSeat.name}</strong> đã trả lời: <strong>"{round1.pendingPersonalAnswer}"</strong> — Đang chờ MC Chủ Phòng chấm điểm...
                    </>
                  ) : (
                    <>
                      Đang xem trực tiếp lượt thi của <strong>{activeSeat.name}</strong> (Vị trí {round1.activePosition}) — Câu {round1.personalQIndex + 1} / 6...
                    </>
                  )}
                </span>
              </div>
              <span className="text-xs font-mono text-amber-300 shrink-0">
                Điểm hiện tại của {activeSeat.name}: {activeSeat.score}đ
              </span>
            </div>
          ) : null}

          {round1.lastFeedback && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                round1.lastFeedback.correct
                  ? 'bg-emerald-950/50 border-emerald-500/50'
                  : 'bg-rose-950/40 border-rose-500/40'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {round1.lastFeedback.correct ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="font-bold text-white">{round1.lastFeedback.message}</div>
                  <div className="text-emerald-300 font-semibold">
                    Đáp án công bố: {round1.lastFeedback.officialAnswer}
                  </div>
                  <div className="text-xs text-slate-300">{round1.lastFeedback.explanation}</div>
                </div>
              </div>
            </div>
          )}

          {historyList.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase">
                Kết quả trực tiếp các câu vừa trả lời của {activeSeat.name} ({historyList.length}/6 câu):
              </div>
              <div className="grid grid-cols-1 gap-2">
                {historyList.map((item) => (
                  <div
                    key={item.qNum}
                    className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      item.correct
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-200">
                        Câu {item.qNum}: {item.question}
                      </div>
                      <div className="text-slate-400">
                        {item.playerName} trả lời:{' '}
                        <strong className={item.correct ? 'text-emerald-300' : 'text-rose-300'}>
                          "{item.submittedAnswer}"
                        </strong>{' '}
                        · Đáp án chính thức:{' '}
                        <strong className="text-amber-300">{item.officialAnswer}</strong>
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold shrink-0 ${
                        item.correct ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.correct ? '+10đ' : '0đ'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PERSONAL_TURN_DONE */}
      {round1.subPhase === 'PERSONAL_TURN_DONE' && (
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white">
              {activeSeat.name} (Vị trí {round1.activePosition}) đã hoàn thành 6 câu Khởi Động cá nhân!
            </h3>
            <p className="text-sm text-slate-300">
              Tổng điểm hiện tại của <strong>{activeSeat.name}</strong>:{' '}
              <strong className="text-amber-300 font-mono text-base">{activeSeat.score} điểm</strong>
            </p>
          </div>

          {historyList.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">
                Bảng công bố đáp án 6 câu hỏi của {activeSeat.name}:
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                {historyList.map((item) => (
                  <div
                    key={item.qNum}
                    className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      item.correct
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200">
                        Câu {item.qNum} ({item.category}): {item.question}
                      </div>
                      <div className="text-slate-400">
                        {item.playerName} trả lời:{' '}
                        <strong className={item.correct ? 'text-emerald-300' : 'text-rose-300'}>
                          {item.submittedAnswer}
                        </strong>{' '}
                        · Đáp án chính thức:{' '}
                        <strong className="text-amber-300">{item.officialAnswer}</strong>
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold shrink-0 ${
                        item.correct ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {item.correct ? '+10đ' : '0đ'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            {isHost ? (
              <button
                onClick={() =>
                  onDispatch({
                    type: 'R1_NEXT_PERSONAL_CLIMBER',
                    fromPosition: round1.activePosition,
                    clientId,
                  })
                }
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shadow-lg"
              >
                {round1.activePosition < 4
                  ? `[MC] Mời Nhà Leo Núi số ${round1.activePosition + 1}: ${
                      seats[Math.min(3, round1.activePosition)]?.name || ''
                    }`
                  : '[MC] Chuyển sang Lượt Khởi Động Chung (4 người bấm chuông)'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Đang chờ MC Chủ Phòng chuyển sang lượt thi tiếp theo...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMMON_INTRO */}
      {round1.subPhase === 'COMMON_INTRO' && (
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
          <div className="text-xs font-bold text-amber-400 uppercase">
            GIAI ĐOẠN 2 · CẢ 4 NHÀ LEO NÚI TRANH CHUÔNG TRẢ LỜI
          </div>
          <h3 className="text-xl font-bold text-white">
            Lượt Khởi Động Chung (12 câu hỏi bấm chuông)
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Ở mỗi câu hỏi, cả 4 thí sinh cùng bấm chuông giành quyền trả lời trên máy của mình.
            Người bấm chuông nhanh nhất sẽ gửi đáp án và được <strong>MC Chủ Phòng</strong> chấm
            trực tiếp: Đúng được <strong className="text-emerald-400">+10 điểm</strong>, sai bị{' '}
            <strong className="text-rose-400">-5 điểm</strong>!
          </p>
          <div className="flex justify-end">
            {isHost ? (
              <button
                onClick={() => {
                  soundFX.playRoundStart();
                  onDispatch({ type: 'R1_START_COMMON_QUESTION', clientId });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shadow-lg"
              >
                [MC] Mở Câu Hỏi Chung Số 1
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Đang chờ MC Chủ Phòng mở Câu Hỏi Chung Số 1...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMMON_BUZZ_OPEN / COMMON_ANSWERING / COMMON_RESULT */}
      {(round1.subPhase === 'COMMON_BUZZ_OPEN' ||
        round1.subPhase === 'COMMON_ANSWERING' ||
        round1.subPhase === 'COMMON_RESULT') &&
        commonQ && (
          <div className="space-y-5">
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-sky-300">
                <span>Lĩnh vực: {commonQ.category}</span>
                <span>Lượt chung · Câu {round1.commonQIndex + 1} / 12</span>
              </div>
              <p className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
                {commonQ.question}
              </p>
            </div>

            {isHost &&
              (round1.subPhase === 'COMMON_BUZZ_OPEN' ||
                round1.subPhase === 'COMMON_ANSWERING') && (
                <div className="p-5 bg-amber-950/35 border-2 border-amber-400/80 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-400/30 pb-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      ĐÁP ÁN BÍ MẬT & CHẤM ĐIỂM CỦA MC (CÂU CHUNG {round1.commonQIndex + 1}/12)
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-200 text-[11px] font-bold">
                      Chỉ MC nhìn thấy đáp án này
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-950/90 border border-emerald-500/40 rounded-xl space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">
                      Đáp án chính thức:
                    </div>
                    <div className="text-base sm:text-lg font-extrabold text-emerald-400">
                      {commonQ.answer}
                    </div>
                    {commonQ.explanation && (
                      <div className="text-xs text-slate-300 pt-1">
                        Giải thích: {commonQ.explanation}
                      </div>
                    )}
                  </div>

                  {round1.subPhase === 'COMMON_BUZZ_OPEN' && (
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <span className="text-xs text-slate-300">
                        Đang chờ thí sinh bấm chuông... Nếu hết giờ không ai bấm chuông:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onDispatch({
                            type: 'R1_MC_GRADE_COMMON',
                            isCorrect: false,
                            clientId,
                          })
                        }
                        className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 cursor-pointer shrink-0"
                      >
                        [MC] Không ai bấm chuông · Công bố đáp án
                      </button>
                    </div>
                  )}

                  {round1.subPhase === 'COMMON_ANSWERING' && buzzedSeat && (
                    <div className="space-y-3 pt-1">
                      <div className="p-3.5 bg-slate-950 border border-sky-500/40 rounded-xl flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase">
                            Câu trả lời của {buzzedSeat.name} (Vị trí {buzzedSeat.position}):
                          </div>
                          <div className="text-base font-extrabold text-white mt-0.5">
                            {round1.pendingCommonAnswer
                              ? `"${round1.pendingCommonAnswer}"`
                              : 'Đang nhập câu trả lời...'}
                          </div>
                        </div>
                        {round1.pendingCommonAnswer && (
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-bold ${
                              commonSuggestedMatch
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {commonSuggestedMatch
                              ? 'Gợi ý: Khớp đáp án'
                              : 'MC quyết định Đúng / Sai'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playCorrect();
                            onDispatch({
                              type: 'R1_MC_GRADE_COMMON',
                              isCorrect: true,
                              clientId,
                            });
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          MC Chấm ĐÚNG (+10 điểm)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playWrong();
                            onDispatch({
                              type: 'R1_MC_GRADE_COMMON',
                              isCorrect: false,
                              clientId,
                            });
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-rose-500 hover:bg-rose-400 text-white shadow-lg cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          MC Chấm SAI (-5 điểm)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {(round1.subPhase === 'COMMON_BUZZ_OPEN' ||
              round1.subPhase === 'COMMON_ANSWERING') && (
              <BuzzerQueuePanel
                queue={round1.buzzQueue || []}
                selectedPosition={round1.buzzedPosition}
                isHost={isHost}
                onSelectWinner={(position) =>
                  onDispatch({ type: 'MC_SELECT_BUZZER_WINNER', position, clientId })
                }
              />
            )}

            {round1.subPhase === 'COMMON_BUZZ_OPEN' && (
              <div className="space-y-3">
                {myPosition ? (
                  isCommonBuzzCountdownActive ? (
                    <button
                      type="button"
                      disabled={haveIBuzzedCommon}
                      onClick={triggerMyCommonBuzz}
                      className="w-full py-5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-amber-200 shadow-lg flex items-center justify-center gap-3 font-display font-extrabold text-lg sm:text-xl cursor-pointer active:scale-98 transition-transform"
                    >
                      <Bell className="w-6 h-6 fill-slate-950" />
                      BẤM CHUÔNG GIÀNH QUYỀN TRẢ LỜI ({seats[myPosition - 1]?.name} - Vị trí{' '}
                      {myPosition}) · [Phím Space]
                    </button>
                  ) : (
                    <div className="w-full py-4 px-6 rounded-2xl bg-slate-950 border-2 border-rose-500/40 text-rose-300 flex items-center justify-center gap-2 font-bold text-sm sm:text-base select-none">
                      <Lock className="w-5 h-5 text-rose-400 shrink-0" />
                      <span>
                        ⏱ ĐÃ HẾT THỜI GIAN ĐẾM NGƯỢC BẤM CHUÔNG (10 GIÂY) — Đang chờ MC Chủ Phòng
                        chuyển câu tiếp theo...
                      </span>
                    </div>
                  )
                ) : !isHost ? (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                    {isCommonBuzzCountdownActive
                      ? 'Đang chờ 1 trong 4 Nhà Leo Núi bấm chuông giành quyền trả lời...'
                      : '⏱ Đã hết thời gian bấm chuông — Đang chờ MC Chủ Phòng công bố đáp án...'}
                  </div>
                ) : null}
              </div>
            )}

            {round1.subPhase === 'COMMON_ANSWERING' && buzzedSeat && (
              <div className="p-5 bg-amber-500/10 border-2 border-amber-400 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-extrabold text-amber-300">
                    QUYỀN TRẢ LỜI THUỘC VỀ: {buzzedSeat.name.toUpperCase()} (VỊ TRÍ{' '}
                    {buzzedSeat.position}
                    {round1.buzzQueue?.[0]?.position === buzzedSeat.position
                      ? ` · ${round1.buzzQueue[0].elapsedSec.toFixed(2)}s — THỜI GIAN THẤP NHẤT`
                      : ''}
                    )!
                  </div>
                  {myPosition && canICoBuzzCommon && (
                    <button
                      type="button"
                      onClick={triggerMyCommonBuzz}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Bell className="w-3.5 h-3.5 fill-slate-950" />
                      Bấm chuông ghi nhận thời gian ({seats[myPosition - 1]?.name})
                    </button>
                  )}
                </div>

                {isMyCommonBuzzAnswer ? (
                  round1.pendingCommonAnswer ? (
                    <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-sm text-emerald-200 flex items-center justify-between">
                      <span>
                        Bạn đã chốt đáp án:{' '}
                        <strong className="text-white">"{round1.pendingCommonAnswer}"</strong> —
                        Đang chờ MC Chủ Phòng chấm điểm...
                      </span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        onDispatch({
                          type: 'R1_SUBMIT_COMMON',
                          position: buzzedSeat.position,
                          qIndex: round1.commonQIndex,
                          answer: textAnswer,
                          clientId,
                        });
                        setTextAnswer('');
                      }}
                      className="flex flex-wrap sm:flex-nowrap gap-3"
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        placeholder={`[${buzzedSeat.name}] Nhập đáp án tự luận của bạn...`}
                        className="w-full flex-1 px-4 py-3.5 bg-slate-950 border-2 border-amber-400 rounded-xl text-white text-sm font-medium focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-6 py-3.5 text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shrink-0"
                      >
                        Chốt đáp án
                      </button>
                    </form>
                  )
                ) : !isHost ? (
                  <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-200 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {round1.pendingCommonAnswer ? (
                        <>
                          <strong>{buzzedSeat.name}</strong> đã trả lời:{' '}
                          <strong>"{round1.pendingCommonAnswer}"</strong> — Đang chờ MC Chủ Phòng
                          chấm điểm...
                        </>
                      ) : (
                        <>
                          Đang chờ <strong>{buzzedSeat.name} (Vị trí {buzzedSeat.position})</strong>{' '}
                          nhập câu trả lời...
                        </>
                      )}
                    </span>
                  </div>
                ) : null}
              </div>
            )}

            {round1.subPhase === 'COMMON_RESULT' && round1.lastFeedback && (
              <div
                className={`p-5 rounded-xl border space-y-3 ${
                  round1.lastFeedback.correct
                    ? 'bg-emerald-950/50 border-emerald-500/50'
                    : 'bg-rose-950/50 border-rose-500/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {round1.lastFeedback.correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1.5">
                    {round1.lastFeedback.playerName && (
                      <div className="text-xs text-slate-300">
                        Câu trả lời của <strong>{round1.lastFeedback.playerName}</strong>:{' '}
                        <strong className="text-white">
                          "{round1.lastFeedback.submittedAnswer}"
                        </strong>
                      </div>
                    )}
                    <div className="text-sm font-bold text-white">
                      {round1.lastFeedback.message}
                    </div>
                    <div className="text-sm font-extrabold text-amber-300">
                      Đáp án chính thức của chương trình: {round1.lastFeedback.officialAnswer}
                    </div>
                    <div className="text-xs text-slate-300">
                      {round1.lastFeedback.explanation}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  {isHost ? (
                    <button
                      onClick={() =>
                        onDispatch({
                          type: 'R1_NEXT_COMMON_QUESTION',
                          fromQIndex: round1.commonQIndex,
                          clientId,
                        })
                      }
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer shadow-md"
                    >
                      {round1.commonQIndex + 1 < commonPool.length
                        ? '[MC] Mở Câu hỏi chung tiếp theo'
                        : '[MC] Tổng kết Phần 1: Khởi Động'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 py-1">
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      <span>Đang chờ MC Chủ Phòng chuyển câu tiếp theo...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      {/* ROUND_SUMMARY */}
      {round1.subPhase === 'ROUND_SUMMARY' && (
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-lg font-bold text-white">Kết thúc Phần 1: Khởi Động!</h3>
          <p className="text-sm text-slate-300">
            Cả 4 Nhà Leo Núi đã hoàn thành lượt thi cá nhân và 12 câu hỏi chung. Hãy bước sang{' '}
            <strong>Phần 2: Vượt Chướng Ngại Vật</strong>!
          </p>
          <div className="flex justify-end">
            {isHost ? (
              <button
                onClick={() =>
                  onDispatch({
                    type: 'START_MATCH',
                    targetStage: 'ROUND_2_VCNV',
                    clientId,
                  })
                }
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shadow-lg"
              >
                [MC] Sang Phần 2: Vượt Chướng Ngại Vật
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Đang chờ MC Chủ Phòng bắt đầu Phần 2: Vượt Chướng Ngại Vật...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
