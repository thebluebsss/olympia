import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  Bell,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Send,
  ShieldAlert,
  User,
  Lock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { OlympiaRoomState, ClientAction } from '../types/olympia';
import { getFinishQuestionById } from '../utils/olympiaEngine';
import { isAnswerMatch } from '../data/olympiaQuestions';
import { soundFX } from '../utils/soundEffects';
import { BuzzerQueuePanel } from './shared/BuzzerQueuePanel';

interface Round4VeDichProps {
  room: OlympiaRoomState;
  clientId: string;
  isHost: boolean;
  myPositions: (1 | 2 | 3 | 4)[];
  onDispatch: (action: ClientAction) => void;
}

export const Round4VeDich: React.FC<Round4VeDichProps> = ({
  room,
  clientId,
  isHost,
  myPositions,
  onDispatch,
}) => {
  const { round4, seats } = room;
  const myPosition: 1 | 2 | 3 | 4 | null = myPositions[0] ?? null;

  const activeSeat = seats[round4.activePosition - 1];
  const stealerSeat = round4.stealerPosition ? seats[round4.stealerPosition - 1] : null;
  const currentQ = getFinishQuestionById(round4.questionIds[round4.qIndex], room);

  const [draftPackage, setDraftPackage] = useState<[20 | 30, 20 | 30, 20 | 30]>([20, 20, 30]);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const lastExpiredDeadlineRef = useRef<number | null>(null);
  const localTimerAnchorRef = useRef<{ token: number | null; localEndMs: number }>({
    token: null,
    localEndMs: 0,
  });
  const stealWindowLocalStartPerfRef = useRef<number>(performance.now());

  useEffect(() => {
    if (round4.subPhase === 'STEAL_WINDOW') {
      stealWindowLocalStartPerfRef.current = performance.now();
    }
  }, [round4.subPhase, round4.stealWindowStartMs, round4.turnIndex, round4.qIndex]);

  const isMyMainTurn = myPosition === round4.activePosition;
  const canIBuzzSteal = myPosition !== null && myPosition !== round4.activePosition;
  const isMyStealAnswer =
    round4.stealerPosition !== null && myPosition === round4.stealerPosition;

  useEffect(() => {
    if (!round4.deadlineEpochMs) return;
    if (
      round4.subPhase !== 'MAIN_ANSWERING' &&
      round4.subPhase !== 'STEAL_WINDOW' &&
      round4.subPhase !== 'STEAL_ANSWERING'
    ) {
      return;
    }

    let durationMs = 15000;
    if (round4.subPhase === 'STEAL_WINDOW') durationMs = 5000;
    else if (round4.subPhase === 'STEAL_ANSWERING') durationMs = 12000;
    else durationMs = currentQ.points === 20 ? 15000 : 20000;

    if (localTimerAnchorRef.current.token !== round4.deadlineEpochMs) {
      localTimerAnchorRef.current = {
        token: round4.deadlineEpochMs,
        localEndMs: Date.now() + durationMs,
      };
      setTimeLeft(Math.ceil(durationMs / 1000));
    }

    const updateTimer = () => {
      const msLeft = localTimerAnchorRef.current.localEndMs - Date.now();
      const rem = Math.max(0, Math.ceil(msLeft / 1000));
      setTimeLeft((prev) => {
        if (rem !== prev && rem > 0 && rem <= 3) soundFX.playTick(true);
        return rem;
      });

      if (
        msLeft <= 0 &&
        round4.deadlineEpochMs &&
        lastExpiredDeadlineRef.current !== round4.deadlineEpochMs &&
        isHost
      ) {
        lastExpiredDeadlineRef.current = round4.deadlineEpochMs;
        onDispatch({
          type: 'SERVER_TIMER_EXPIRED',
          expectedDeadline: round4.deadlineEpochMs,
        });
      }
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 100);
    return () => window.clearInterval(interval);
  }, [round4.deadlineEpochMs, round4.subPhase, currentQ.points, isHost, onDispatch]);

  useEffect(() => {
    setAnswerInput('');
  }, [round4.subPhase, round4.qIndex, round4.activePosition]);

  const isStealCountdownActive =
    round4.subPhase === 'STEAL_WINDOW' && Boolean(round4.deadlineEpochMs) && timeLeft > 0;

  const haveIBuzzedSteal = Boolean(
    myPosition && (round4.stealBuzzQueue || []).some((entry) => entry.position === myPosition)
  );

  const canICoBuzzSteal =
    round4.subPhase === 'STEAL_ANSWERING' &&
    canIBuzzSteal &&
    !round4.stealSubmittedAnswer &&
    !haveIBuzzedSteal;

  const triggerMyStealBuzz = () => {
    if (!canIBuzzSteal || !myPosition || haveIBuzzedSteal) return;
    if (round4.subPhase === 'STEAL_WINDOW' && !isStealCountdownActive) return;
    if (round4.subPhase === 'STEAL_ANSWERING' && !canICoBuzzSteal) return;
    const elapsedSec = Math.max(
      0.01,
      Math.min(
        5,
        Number(((performance.now() - stealWindowLocalStartPerfRef.current) / 1000).toFixed(2))
      )
    );
    soundFX.playBuzzer();
    onDispatch({
      type: 'R4_BUZZ_STEAL',
      position: myPosition,
      clientBuzzElapsedSec: elapsedSec,
      clientId,
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (!canIBuzzSteal || !myPosition || haveIBuzzedSteal) return;
      if (round4.subPhase === 'STEAL_WINDOW' && !isStealCountdownActive) return;
      if (round4.subPhase === 'STEAL_ANSWERING' && !canICoBuzzSteal) return;
      if (round4.subPhase !== 'STEAL_WINDOW' && round4.subPhase !== 'STEAL_ANSWERING') return;

      if (e.code === 'Space') {
        e.preventDefault();
        triggerMyStealBuzz();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const mainSuggestedMatch =
    round4.mainSubmittedAnswer &&
    round4.mainSubmittedAnswer !== '(Bỏ qua)' &&
    round4.mainSubmittedAnswer !== '(Hết giờ)'
      ? isAnswerMatch(round4.mainSubmittedAnswer, currentQ.acceptedAnswers, currentQ.answer)
      : false;

  const stealSuggestedMatch =
    round4.stealSubmittedAnswer &&
    round4.stealSubmittedAnswer !== '(Bỏ qua)' &&
    round4.stealSubmittedAnswer !== '(Hết giờ)'
      ? isAnswerMatch(round4.stealSubmittedAnswer, currentQ.acceptedAnswers, currentQ.answer)
      : false;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="text-xs font-semibold text-amber-400">
            PHẦN THI THỨ TƯ · LƯỢT VỀ ĐÍCH {round4.turnIndex + 1} / 4 — THÍ SINH:{' '}
            {activeSeat.name.toUpperCase()} (VỊ TRÍ {round4.activePosition})
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">
            4. Về Đích (MC Điều Phối & Chấm Điểm Trực Tiếp)
          </h2>
        </div>

        {(round4.subPhase === 'MAIN_ANSWERING' ||
          round4.subPhase === 'STEAL_WINDOW' ||
          round4.subPhase === 'STEAL_ANSWERING') && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">
                Lượt của {activeSeat.name} · Câu {round4.qIndex + 1} / 3 ({currentQ.points}đ)
              </div>
              {round4.starActiveThisQ && (
                <div className="text-xs font-bold text-amber-300">★ Đang đặt Ngôi Sao Hy Vọng</div>
              )}
            </div>
            <div
              className={`w-14 h-14 rounded-xl border flex items-center justify-center font-mono font-bold text-2xl tabular-nums ${
                !round4.deadlineEpochMs
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 text-xs'
                  : timeLeft <= 3
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-amber-300'
              }`}
            >
              {round4.deadlineEpochMs
                ? `${timeLeft}s`
                : !round4.timerStarted && round4.subPhase === 'MAIN_ANSWERING'
                ? 'CHỜ MC'
                : 'CHẤM'}
            </div>
          </div>
        )}
      </div>

      {/* Turn Progression Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {round4.turnOrder.map((pos, idx) => {
          const s = seats[pos - 1];
          const isCurrent = idx === round4.turnIndex;
          const isDone = idx < round4.turnIndex;
          return (
            <div
              key={pos}
              className={`px-3.5 py-2 rounded-xl border text-xs flex items-center justify-between ${
                isCurrent
                  ? 'bg-sky-950/80 border-sky-400 text-sky-200 font-bold'
                  : isDone
                  ? 'bg-slate-950/50 border-slate-800 text-slate-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span className="truncate">
                Lượt {idx + 1}: {s.name}
              </span>
              <span className="font-mono">
                {isCurrent ? 'Đang thi' : isDone ? 'Đã xong' : 'Chờ lượt'}
              </span>
            </div>
          );
        })}
      </div>

      {/* SELECT_PACKAGE */}
      {round4.subPhase === 'SELECT_PACKAGE' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
              <User className="w-4 h-4" />
              MỜI NHÀ LEO NÚI VỊ TRÍ SỐ {activeSeat.position}: {activeSeat.name} ({activeSeat.school})
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>{activeSeat.name}</strong> hiện có{' '}
              <strong className="text-amber-300 font-mono">{activeSeat.score} điểm</strong>. Hãy lựa
              chọn mức điểm (<strong>20 điểm</strong> hoặc <strong>30 điểm</strong>) cho từng câu
              trong gói 3 câu hỏi Về Đích của mình:
            </p>
          </div>

          {isMyMainTurn || isHost ? (
            <>
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
                      {[20, 30].map((val) => {
                        const active = draftPackage[slotIdx] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              const next: [20 | 30, 20 | 30, 20 | 30] = [
                                ...draftPackage,
                              ] as [20 | 30, 20 | 30, 20 | 30];
                              next[slotIdx] = val as 20 | 30;
                              setDraftPackage(next);
                            }}
                            className={`py-3 rounded-xl font-mono font-extrabold text-lg border transition-all cursor-pointer ${
                              active
                                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {val}đ
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Thời gian suy nghĩ: {draftPackage[slotIdx] === 20 ? '15 giây' : '20 giây'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="text-sm text-slate-300">
                  Gói câu hỏi của <strong>{activeSeat.name}</strong>:{' '}
                  <strong className="font-mono text-amber-300">
                    {draftPackage.join(' - ')} điểm
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playRoundStart();
                    onDispatch({
                      type: 'R4_CONFIRM_PACKAGE',
                      position: round4.activePosition,
                      points: draftPackage,
                      clientId,
                    });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shadow-lg"
                >
                  {isHost ? '[MC] ' : ''}Chốt gói câu hỏi của {activeSeat.name}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-center text-sm text-slate-300 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Đang theo dõi trực tiếp: Chờ <strong>{activeSeat.name}</strong> (Vị trí{' '}
                {activeSeat.position}) lựa chọn gói câu hỏi Về Đích...
              </span>
            </div>
          )}
        </div>
      )}

      {/* PRE_QUESTION_STAR */}
      {round4.subPhase === 'PRE_QUESTION_STAR' && (
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-5">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-sky-300 uppercase">
              Lượt Về Đích của {activeSeat.name} (Vị trí {activeSeat.position}) · Câu hỏi{' '}
              {round4.qIndex + 1} / 3
            </div>
            <h3 className="text-xl font-bold text-white">
              Câu hỏi mức {currentQ.points} điểm (Thời gian suy nghĩ:{' '}
              {currentQ.points === 20 ? '15 giây' : '20 giây'})
            </h3>
          </div>

          {!activeSeat.starUsed ? (
            <div className="p-4 bg-amber-500/10 border border-amber-400/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                Quyền đặt Ngôi Sao Hy Vọng dành cho {activeSeat.name}:
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nếu đặt Ngôi Sao Hy Vọng cho câu {currentQ.points} điểm này: Trả lời đúng được nhân
                đôi (<strong>+{currentQ.points * 2} điểm</strong>), trả lời sai bị trừ{' '}
                <strong>-{currentQ.points} điểm</strong>.
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              ({activeSeat.name} đã sử dụng Ngôi Sao Hy Vọng trong lượt Về Đích này)
            </div>
          )}

          {isHost ? (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playRoundStart();
                  onDispatch({ type: 'R4_START_QUESTION', useStar: false, clientId });
                }}
                className="px-5 py-3 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer"
              >
                [MC] Mở câu hỏi bình thường ({currentQ.points} điểm)
              </button>

              {!activeSeat.starUsed && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playStarOfHope();
                    onDispatch({ type: 'R4_START_QUESTION', useStar: true, clientId });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-slate-950" />
                  [MC] Đặt Ngôi Sao Hy Vọng & Mở câu hỏi (+{currentQ.points * 2} điểm)
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-sky-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                Đang chờ <strong>MC Chủ Phòng</strong> xác nhận Ngôi Sao Hy Vọng và mở câu hỏi cho{' '}
                <strong>{activeSeat.name}</strong>...
              </span>
            </div>
          )}
        </div>
      )}

      {/* MAIN_ANSWERING */}
      {round4.subPhase === 'MAIN_ANSWERING' && (
        <div className="space-y-5">
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-sky-300">
              <span>
                Câu hỏi dành riêng cho {activeSeat.name} (Vị trí {activeSeat.position}) ·{' '}
                {currentQ.category}
              </span>
              <div className="flex items-center gap-3">
                {!round4.timerStarted && !round4.deadlineEpochMs && (
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-[11px] font-bold text-amber-300">
                    ⏱ Chờ MC bấm chạy đồng hồ ({currentQ.points === 20 ? 15 : 20}s)
                  </span>
                )}
                {round4.starActiveThisQ && (
                  <span className="text-amber-300 font-bold">
                    ★ NGÔI SAO HY VỌNG (+{currentQ.points * 2}đ / -{currentQ.points}đ)
                  </span>
                )}
              </div>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {isHost && (
            <div className="p-5 bg-amber-950/35 border-2 border-amber-400/80 rounded-2xl space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-400/30 pb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  ĐÁP ÁN BÍ MẬT & BẢNG CHẤM ĐIỂM VỀ ĐÍCH DÀNH RIÊNG CHO MC
                </div>
                <span className="px-2.5 py-0.5 rounded bg-amber-400/20 text-amber-200 text-[11px] font-bold">
                  Chỉ MC nhìn thấy đáp án này
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-950/90 border border-emerald-500/40 rounded-xl space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    Đáp án chính thức câu {round4.qIndex + 1}/3 ({currentQ.points}đ):
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-emerald-400">
                    {currentQ.answer}
                  </div>
                  {currentQ.explanation && (
                    <div className="text-xs text-slate-300 pt-1">
                      Giải thích: {currentQ.explanation}
                    </div>
                  )}
                </div>

                <div className="p-3.5 bg-slate-950/90 border border-sky-500/40 rounded-xl space-y-1.5 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    Câu trả lời của {activeSeat.name} (Vị trí {activeSeat.position}):
                  </div>
                  {round4.mainSubmittedAnswer ? (
                    <div className="space-y-1">
                      <div className="text-base sm:text-lg font-extrabold text-white">
                        "{round4.mainSubmittedAnswer}"
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          mainSuggestedMatch
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {mainSuggestedMatch
                          ? 'Gợi ý: Khớp đáp án'
                          : 'MC kiểm tra & quyết định Đúng / Sai'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-amber-300 italic">
                      Thí sinh đang suy nghĩ / nhập câu trả lời...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div>
                  {!round4.timerStarted && !round4.deadlineEpochMs ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playTick(false);
                        onDispatch({ type: 'MC_START_QUESTION_TIMER', clientId });
                      }}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-lg cursor-pointer active:scale-95 transition-transform"
                    >
                      ⏱ [MC] Bắt Đầu Chạy Đồng Hồ ({currentQ.points === 20 ? 15 : 20} giây)
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-sky-300">
                      {round4.deadlineEpochMs
                        ? `⏱ Đồng hồ đang chạy: còn ${timeLeft}s`
                        : '⏱ Đã hết thời gian / Đã nhận câu trả lời'}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playCorrect();
                      onDispatch({ type: 'R4_MC_GRADE_MAIN', isCorrect: true, clientId });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    MC Chấm ĐÚNG (+
                    {round4.starActiveThisQ ? currentQ.points * 2 : currentQ.points} điểm)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playWrong();
                      onDispatch({ type: 'R4_MC_GRADE_MAIN', isCorrect: false, clientId });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-rose-500 hover:bg-rose-400 text-white shadow-lg cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    MC Chấm SAI ({round4.starActiveThisQ ? `-${currentQ.points}đ & ` : ''}Mở 5s Cướp điểm)
                  </button>
                </div>
              </div>
            </div>
          )}

          {isMyMainTurn ? (
            round4.mainSubmittedAnswer ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 text-sm text-emerald-200 font-semibold">
                <span>
                  Bạn đã gửi câu trả lời:{' '}
                  <strong className="text-white">"{round4.mainSubmittedAnswer}"</strong> — Đang chờ
                  MC Chủ Phòng chấm điểm...
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
            ) : !round4.timerStarted ? (
              <div className="p-4 bg-slate-950 border border-amber-400/50 rounded-xl flex items-center gap-2 text-sm text-amber-300 font-semibold">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Đang chờ MC Chủ Phòng đọc câu hỏi và bấm <strong>"Bắt Đầu Chạy Đồng Hồ"</strong> ({currentQ.points === 20 ? 15 : 20} giây) để mở ô nhập đáp án...
                </span>
              </div>
            ) : !round4.deadlineEpochMs ? (
              <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl text-sm text-rose-200 font-semibold">
                ⏱ Đã hết thời gian suy nghĩ — Đang chờ MC Chủ Phòng chấm điểm...
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  soundFX.playBuzzer();
                  onDispatch({
                    type: 'R4_SUBMIT_MAIN_ANSWER',
                    answer: answerInput,
                    qIndex: round4.qIndex,
                    clientId,
                  });
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder={`[${activeSeat.name}] Nhập đáp án tự luận (không phân biệt hoa/thường)...`}
                  className="flex-1 px-4 py-3.5 bg-slate-950 border-2 border-amber-400 rounded-xl text-white text-sm font-semibold focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  Gửi đáp án
                </button>
              </form>
            )
          ) : !isHost ? (
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-center text-sm text-slate-300 space-y-1">
              <div className="flex items-center justify-center gap-2 text-amber-300 font-bold">
                <Lock className="w-4 h-4" />
                <span>
                  {round4.mainSubmittedAnswer
                    ? `${activeSeat.name} vừa trả lời: "${round4.mainSubmittedAnswer}" — Đang chờ MC Chủ Phòng chấm điểm...`
                    : `Đang là lượt trả lời riêng của ${activeSeat.name} (Vị trí ${activeSeat.position})`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hãy chuẩn bị: Nếu MC chấm câu trả lời của <strong>{activeSeat.name}</strong> chưa
                chính xác, bạn sẽ có <strong>5 giây</strong> để bấm chuông giành quyền trả lời!
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* STEAL_WINDOW */}
      {round4.subPhase === 'STEAL_WINDOW' && (
        <div className="space-y-5">
          <div className="p-6 bg-slate-950 border-2 border-rose-500/50 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-rose-400">
              <span>
                {activeSeat.name.toUpperCase()} VỪA TRẢ LỜI:{' '}
                <span className="text-white underline">
                  "{round4.mainSubmittedAnswer || 'Chưa trả lời'}"
                </span>{' '}
                (MC CHẤM CHƯA CHÍNH XÁC!)
              </span>
              <span className="text-amber-300">
                Cướp điểm — Đúng: +{currentQ.points}đ · Sai: -{currentQ.points / 2}đ
              </span>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {canIBuzzSteal && myPosition ? (
            <div className="flex flex-col items-center gap-3">
              {isStealCountdownActive ? (
                <button
                  type="button"
                  disabled={haveIBuzzedSteal}
                  onClick={triggerMyStealBuzz}
                  className="w-full sm:w-auto min-w-[320px] px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-extrabold text-lg shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer"
                >
                  <Bell className="w-6 h-6 fill-slate-950" />
                  BẤM CHUÔNG CƯỚP ĐIỂM ({seats[myPosition - 1].name} · Phím Space)
                </button>
              ) : (
                <div className="w-full py-4 px-6 rounded-2xl bg-slate-950 border-2 border-rose-500/40 text-rose-300 flex items-center justify-center gap-2 font-bold text-sm sm:text-base select-none">
                  <Lock className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>
                    ⏱ ĐÃ HẾT 5 GIÂY ĐẾM NGƯỢC BẤM CHUÔNG CƯỚP ĐIỂM — Không thể bấm chuông thêm!
                  </span>
                </div>
              )}
            </div>
          ) : !isHost ? (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-sm text-slate-300">
              {isStealCountdownActive
                ? 'Đang mở 5 giây bấm chuông cướp điểm cho 3 thí sinh còn lại...'
                : '⏱ Đã hết 5 giây bấm chuông cướp điểm — Đang chờ MC Chủ Phòng công bố đáp án...'}
            </div>
          ) : null}

          {isHost ? (
            <div className="p-4 bg-amber-950/35 border border-amber-400/60 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-200">
                <span className="text-amber-300 font-bold">[MC] Đáp án bí mật: </span>
                <strong className="text-emerald-400">{currentQ.answer}</strong> · Đang chờ 3 thí sinh
                còn lại bấm chuông cướp điểm ({round4.deadlineEpochMs ? `${timeLeft}s` : 'Đã hết 5s'})
              </div>
              <button
                type="button"
                onClick={() => onDispatch({ type: 'R4_SKIP_STEAL_WINDOW', clientId })}
                className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer shadow-md"
              >
                [MC] Không ai cướp điểm · Công bố đáp án
              </button>
            </div>
          ) : (
            <div className="flex justify-center pt-1">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-300 bg-slate-950/90 border border-slate-800 rounded-xl select-none">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Thời gian bấm chuông cướp điểm:{' '}
                  <strong className="text-amber-300 font-mono">
                    {round4.deadlineEpochMs ? `${timeLeft}s` : 'Hết giờ'}
                  </strong>
                  .
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEAL_ANSWERING */}
      {round4.subPhase === 'STEAL_ANSWERING' && stealerSeat && (
        <div className="space-y-5">
          <div className="p-6 bg-slate-950 border-2 border-amber-400 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-extrabold text-amber-300">
                QUYỀN CƯỚP ĐIỂM ĐANG THUỘC VỀ: {stealerSeat.name.toUpperCase()} (VỊ TRÍ{' '}
                {stealerSeat.position}
                {round4.stealBuzzQueue?.[0]?.position === stealerSeat.position
                  ? ` · ${round4.stealBuzzQueue[0].elapsedSec.toFixed(2)}s — THỜI GIAN THẤP NHẤT`
                  : ''}
                )!
              </div>
              {myPosition && canICoBuzzSteal && (
                <button
                  type="button"
                  onClick={triggerMyStealBuzz}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Bell className="w-3.5 h-3.5 fill-slate-950" />
                  Bấm chuông ghi nhận thời gian ({seats[myPosition - 1]?.name})
                </button>
              )}
            </div>
            <p className="text-lg font-semibold text-white">{currentQ.question}</p>
          </div>

          <BuzzerQueuePanel
            queue={round4.stealBuzzQueue || []}
            selectedPosition={round4.stealerPosition}
            isHost={isHost}
            title="📊 BẢNG TÍN HIỆU CHUÔNG CƯỚP ĐIỂM (XẾP THEO THỜI GIAN TỪ THẤP NHẤT):"
            onSelectWinner={(position) =>
              onDispatch({ type: 'MC_SELECT_BUZZER_WINNER', position, clientId })
            }
          />

          {isHost && (
            <div className="p-5 bg-amber-950/35 border-2 border-amber-400/80 rounded-2xl space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-400/30 pb-2">
                <span className="text-xs font-extrabold text-amber-300 uppercase">
                  [MC] Chấm điểm Cướp Điểm của {stealerSeat.name} (Vị trí {stealerSeat.position})
                </span>
                <span className="text-xs text-emerald-300 font-bold">
                  Đáp án chính thức: {currentQ.answer}
                </span>
              </div>

              <div className="p-3.5 bg-slate-950 border border-sky-500/40 rounded-xl flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-bold">
                    Câu trả lời cướp điểm của {stealerSeat.name}:
                  </div>
                  <div className="text-base font-extrabold text-white mt-0.5">
                    {round4.stealSubmittedAnswer
                      ? `"${round4.stealSubmittedAnswer}"`
                      : 'Đang nhập câu trả lời...'}
                  </div>
                </div>
                {round4.stealSubmittedAnswer && (
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      stealSuggestedMatch
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {stealSuggestedMatch ? 'Gợi ý: Khớp đáp án' : 'MC quyết định Đúng / Sai'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playCorrect();
                    onDispatch({ type: 'R4_MC_GRADE_STEAL', isCorrect: true, clientId });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  MC Chấm Cướp Điểm ĐÚNG (+{currentQ.points} điểm)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playWrong();
                    onDispatch({ type: 'R4_MC_GRADE_STEAL', isCorrect: false, clientId });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-rose-500 hover:bg-rose-400 text-white shadow-lg cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  MC Chấm Cướp Điểm SAI (-{currentQ.points / 2} điểm)
                </button>
              </div>
            </div>
          )}

          {isMyStealAnswer ? (
            round4.stealSubmittedAnswer ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 text-sm text-emerald-200 font-semibold">
                <span>
                  Bạn đã gửi đáp án cướp điểm:{' '}
                  <strong className="text-white">"{round4.stealSubmittedAnswer}"</strong> — Đang chờ
                  MC Chủ Phòng chấm điểm...
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onDispatch({
                    type: 'R4_SUBMIT_STEAL_ANSWER',
                    position: stealerSeat.position,
                    answer: answerInput,
                    clientId,
                  });
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder={`[${stealerSeat.name}] Nhập đáp án tự luận cướp điểm...`}
                  className="flex-1 px-4 py-3.5 bg-slate-950 border-2 border-amber-400 rounded-xl text-white text-sm font-semibold focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shrink-0"
                >
                  Gửi đáp án cướp điểm
                </button>
              </form>
            )
          ) : !isHost ? (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-sm text-slate-300 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {round4.stealSubmittedAnswer ? (
                  <>
                    <strong>{stealerSeat.name}</strong> vừa trả lời cướp điểm:{' '}
                    <strong>"{round4.stealSubmittedAnswer}"</strong> — Đang chờ MC Chủ Phòng chấm
                    điểm...
                  </>
                ) : (
                  <>
                    Đang chờ <strong>{stealerSeat.name}</strong> (Vị trí {stealerSeat.position}) nhập
                    đáp án cướp điểm...
                  </>
                )}
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* QUESTION_RESULT */}
      {round4.subPhase === 'QUESTION_RESULT' && round4.lastResult && (
        <div
          className={`p-6 rounded-xl border space-y-4 ${
            round4.lastResult.correct
              ? 'bg-emerald-950/50 border-emerald-500/50'
              : 'bg-rose-950/40 border-rose-500/40'
          }`}
        >
          <div className="flex items-start gap-3">
            {round4.lastResult.correct ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-2 flex-1">
              <div className="text-base font-bold text-white">{round4.lastResult.headline}</div>
              <div className="text-sm text-slate-200">{round4.lastResult.detail}</div>

              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2 mt-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 font-bold text-amber-300 uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    Đáp án chính thức của chương trình:
                  </span>
                  <span className="font-mono font-extrabold text-sm text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40">
                    {round4.lastResult.officialAnswer}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                  <div>
                    • Đáp án của <strong>{activeSeat.name}</strong>:{' '}
                    <span className="font-mono font-semibold text-white">
                      "{round4.mainSubmittedAnswer || 'Chưa trả lời'}"
                    </span>
                  </div>
                  {stealerSeat && (
                    <div>
                      • Đáp án cướp điểm của <strong>{stealerSeat.name}</strong>:{' '}
                      <span className="font-mono font-semibold text-amber-300">
                        "{round4.stealSubmittedAnswer || 'Chưa trả lời'}"
                      </span>
                    </div>
                  )}
                </div>

                {round4.lastResult.explanation && (
                  <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                    <strong>Giải thích:</strong> {round4.lastResult.explanation}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            {isHost ? (
              <button
                type="button"
                onClick={() =>
                  onDispatch({
                    type: 'R4_NEXT_STEP',
                    fromTurnIndex: round4.turnIndex,
                    fromQIndex: round4.qIndex,
                    clientId,
                  })
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer shadow-md"
              >
                {round4.qIndex + 1 < 3
                  ? `[MC] Sang Câu hỏi số ${round4.qIndex + 2}/3 của ${activeSeat.name}`
                  : round4.turnIndex + 1 < 4
                  ? `[MC] Mời Nhà Leo Núi tiếp theo lên bục Về Đích: ${
                      seats[round4.turnOrder[round4.turnIndex + 1] - 1].name
                    }`
                  : '[MC] Công bố Kết Quả Chung Cuộc & Trao Vòng Nguyệt Quế'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-xs text-slate-400 flex items-center gap-1.5 py-1">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Đang chờ <strong>MC Chủ Phòng</strong> chuyển sang bước tiếp theo...
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
