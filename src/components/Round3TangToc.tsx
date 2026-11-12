import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Send,
  Check,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { getRoomTangTocQuestions } from '../utils/olympiaEngine';
import { isAnswerMatch } from '../data/olympiaQuestions';
import type { OlympiaRoomState, ClientAction } from '../types/olympia';
import { soundFX } from '../utils/soundEffects';

interface Round3TangTocProps {
  room: OlympiaRoomState;
  clientId: string;
  isHost: boolean;
  myPositions: (1 | 2 | 3 | 4)[];
  onDispatch: (action: ClientAction) => void;
}

export const Round3TangToc: React.FC<Round3TangTocProps> = ({
  room,
  clientId,
  isHost,
  myPositions,
  onDispatch,
}) => {
  const { round3, seats } = room;
  const myPosition: 1 | 2 | 3 | 4 | null = myPositions[0] ?? null;
  const mySeat = myPosition ? seats[myPosition - 1] : null;
  const tangTocPool = getRoomTangTocQuestions(room).slice(0, 4);
  const currentQ = tangTocPool[round3.qIndex] || tangTocPool[0];

  const [inputVal, setInputVal] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [liveElapsedSec, setLiveElapsedSec] = useState<number>(0);

  const lastExpiredDeadlineRef = useRef<number | null>(null);
  const localTimerAnchorRef = useRef<{
    token: number | null;
    localStartPerfMs: number;
    localEndMs: number;
  }>({ token: null, localStartPerfMs: 0, localEndMs: 0 });

  useEffect(() => {
    setInputVal('');
    setLiveElapsedSec(0);
  }, [round3.qIndex, round3.subPhase]);

  useEffect(() => {
    if (round3.subPhase !== 'QUESTION_ACTIVE' || !round3.deadlineEpochMs) return;

    const limitSec = currentQ?.timeLimitSec || 20;
    const durationMs = limitSec * 1000;
    if (localTimerAnchorRef.current.token !== round3.deadlineEpochMs) {
      localTimerAnchorRef.current = {
        token: round3.deadlineEpochMs,
        localStartPerfMs: performance.now(),
        localEndMs: Date.now() + durationMs,
      };
      setTimeLeft(limitSec);
      setLiveElapsedSec(0);
    }

    const updateClock = () => {
      const msLeft = localTimerAnchorRef.current.localEndMs - Date.now();
      const rem = Math.max(0, Math.ceil(msLeft / 1000));
      const elapsed = Math.min(
        limitSec,
        Math.max(
          0,
          (performance.now() - localTimerAnchorRef.current.localStartPerfMs) /
            1000
        )
      );
      setLiveElapsedSec(Number(elapsed.toFixed(2)));
      setTimeLeft((prev) => {
        if (rem !== prev && rem > 0 && rem <= 3) {
          soundFX.playTick(true);
        }
        return rem;
      });

      if (
        msLeft <= 0 &&
        round3.deadlineEpochMs &&
        lastExpiredDeadlineRef.current !== round3.deadlineEpochMs &&
        isHost
      ) {
        lastExpiredDeadlineRef.current = round3.deadlineEpochMs;
        onDispatch({
          type: 'SERVER_TIMER_EXPIRED',
          expectedDeadline: round3.deadlineEpochMs,
        });
      }
    };

    updateClock();
    const interval = window.setInterval(updateClock, 50);
    return () => window.clearInterval(interval);
  }, [
    round3.subPhase,
    round3.deadlineEpochMs,
    currentQ,
    isHost,
    onDispatch,
  ]);

  const handleMySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myPosition || !inputVal.trim()) return;
    soundFX.playBuzzer();
    const limitSec = currentQ?.timeLimitSec || 20;
    const rawElapsed =
      localTimerAnchorRef.current.localStartPerfMs > 0
        ? (performance.now() - localTimerAnchorRef.current.localStartPerfMs) /
          1000
        : 0.25;
    const clientElapsedSec = Math.max(
      0.05,
      Math.min(limitSec, Number(rawElapsed.toFixed(2)))
    );
    onDispatch({
      type: 'R3_SUBMIT_ANSWER',
      position: myPosition,
      answer: inputVal.trim(),
      clientElapsedSec,
      clientId,
    });
    setInputVal('');
  };

  const mySubmission = myPosition ? round3.submissions[myPosition] : undefined;

  const isSeatMarkedCorrect = (pos: 1 | 2 | 3 | 4): boolean => {
    if (round3.mcGrades && round3.mcGrades[pos] !== undefined) {
      return Boolean(round3.mcGrades[pos]);
    }
    const sub = round3.submissions[pos];
    if (!sub || !currentQ) return false;
    return isAnswerMatch(sub.answer, currentQ.acceptedAnswers, currentQ.answer);
  };

  // Compute preview points for MC based on checked positions sorted by timeSec
  const mcSortedPreview = seats
    .map((s) => {
      const sub = round3.submissions[s.position];
      return {
        position: s.position,
        name: s.name,
        answer: sub ? sub.answer : '(Chưa trả lời)',
        timeSec: sub ? sub.timeSec : currentQ?.timeLimitSec || 30,
        hasSub: Boolean(sub),
        isChecked: isSeatMarkedCorrect(s.position),
      };
    })
    .sort((a, b) => a.timeSec - b.timeSec);

  const ladder = [40, 30, 20, 10];
  let rankIdx = 0;
  const previewPointsByPos: Record<number, number> = {};
  mcSortedPreview.forEach((item) => {
    if (item.isChecked && rankIdx < ladder.length) {
      previewPointsByPos[item.position] = ladder[rankIdx];
      rankIdx++;
    } else {
      previewPointsByPos[item.position] = 0;
    }
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="text-xs font-semibold text-amber-400">
            PHẦN THI THỨ BA · CẢ 4 NHÀ LEO NÚI ĐUA TỐC ĐỘ TỰ LUẬN (40 - 30 - 20 - 10 ĐIỂM)
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">
            3. Tăng Tốc
          </h2>
        </div>

        {round3.subPhase === 'QUESTION_ACTIVE' && currentQ && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">
                Câu {currentQ.number} / 4
              </div>
              <div className="text-xs font-medium text-sky-300">
                Nhanh nhất: +40đ · Nhì: +30đ · Ba: +20đ · Tư: +10đ
              </div>
            </div>
            <div
              className={`w-14 h-14 rounded-xl border flex items-center justify-center font-mono font-bold text-2xl tabular-nums ${
                !round3.deadlineEpochMs
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 text-xs'
                  : timeLeft <= 5
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-amber-300'
              }`}
            >
              {round3.deadlineEpochMs
                ? `${timeLeft}s`
                : !round3.timerStarted
                ? 'CHỜ MC'
                : 'CHẤM'}
            </div>
          </div>
        )}
      </div>

      {/* INTRO */}
      {round3.subPhase === 'INTRO' && (
        <div className="space-y-5">
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3 text-sm text-slate-300 leading-relaxed">
            <p className="font-semibold text-white text-base">
              Thể lệ phần thi Tăng Tốc cho 4 Nhà Leo Núi:
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                Có <strong>4 câu hỏi tự luận</strong>. Khi MC mở câu hỏi và bấm <strong>Bắt Đầu Chạy Đồng Hồ</strong>, cả 4 nhà leo núi cùng nhập và gửi đáp án trên thiết bị của mình.
              </li>
              <li>
                Máy chủ ghi nhận chính xác <strong>thời gian gửi đáp án đến phần trăm giây (0.01s)</strong> của từng người chơi tính từ lúc đồng hồ bắt đầu chạy.
              </li>
              <li>
                <strong>MC Chủ Phòng</strong> chấm thủ công từng thí sinh <strong className="text-emerald-400">✓ ĐÚNG</strong> hoặc <strong className="text-rose-400">✕ SAI</strong>: Người trả lời đúng nhanh nhất được{' '}
                <strong className="text-emerald-400">+40 điểm</strong>, thứ hai{' '}
                <strong className="text-emerald-400">+30 điểm</strong>, thứ ba{' '}
                <strong className="text-emerald-400">+20 điểm</strong>, thứ tư{' '}
                <strong className="text-emerald-400">+10 điểm</strong>.
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {isHost ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onDispatch({
                      type: 'R3_CHANGE_QUESTION',
                      clientId,
                    });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold text-amber-300 bg-slate-900 hover:bg-slate-800 border border-amber-400/50 rounded-xl cursor-pointer"
                >
                  🎲 [MC] Đổi Bộ Đề Tăng Tốc Khác
                </button>
                <button
                  onClick={() => {
                    soundFX.playRoundStart();
                    onDispatch({
                      type: 'R3_START_QUESTION',
                      qIndex: 0,
                      clientId,
                    });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shadow-lg"
                >
                  [MC] Mở Câu Hỏi Tăng Tốc Số 1
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Đang chờ MC Chủ Phòng mở Câu Hỏi Tăng Tốc Số 1...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUESTION_ACTIVE */}
      {round3.subPhase === 'QUESTION_ACTIVE' && currentQ && (
        <div className="space-y-5">
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-sky-300">
              <span>{currentQ.typeLabel}</span>
              <span className="text-amber-300 font-mono">
                {round3.deadlineEpochMs
                  ? `⏱ Đang chạy đồng hồ: còn ${timeLeft}s / ${currentQ.timeLimitSec}s`
                  : !round3.timerStarted
                  ? `⏱ Chờ MC bấm bắt đầu chạy đồng hồ (${currentQ.timeLimitSec} giây)`
                  : `⏱ Đã hết ${currentQ.timeLimitSec} giây · Chờ MC chấm điểm`}
              </span>
            </div>

            <p className="text-lg font-bold text-white leading-relaxed">
              {currentQ.question}
            </p>

            {currentQ.clues &&
              currentQ.clues.filter((clue) => {
                const lower = clue.toLowerCase().trim();
                return (
                  !lower.includes('gợi ý') &&
                  !lower.startsWith('quy luật') &&
                  !lower.startsWith('công thức') &&
                  !lower.startsWith('áp dụng') &&
                  !lower.startsWith('tính:') &&
                  !lower.startsWith('đổi đơn vị') &&
                  !lower.startsWith('lĩnh vực:')
                );
              }).length > 0 && (
                <div className="space-y-2 pt-1">
                  {currentQ.clues
                    .filter((clue) => {
                      const lower = clue.toLowerCase().trim();
                      return (
                        !lower.includes('gợi ý') &&
                        !lower.startsWith('quy luật') &&
                        !lower.startsWith('công thức') &&
                        !lower.startsWith('áp dụng') &&
                        !lower.startsWith('tính:') &&
                        !lower.startsWith('đổi đơn vị') &&
                        !lower.startsWith('lĩnh vực:')
                      );
                    })
                    .map((clue, idx) => (
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

          {/* Live Status of All 4 Climbers (Read-only status cards for contestants) */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase">
              Trạng thái nộp đáp án thời gian thực của 4 Nhà Leo Núi:
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {seats.map((s) => {
                const sub = round3.submissions[s.position];
                const isMe = myPosition === s.position;
                return (
                  <div
                    key={s.position}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      sub
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : isMe
                        ? 'bg-amber-500/10 border-amber-400/60 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">
                        {s.position}. {s.name} {isMe ? '(Bạn)' : ''}
                      </div>
                      <div className="text-[11px] opacity-85 font-mono">
                        {sub
                          ? `Đã nộp ở ${sub.timeSec.toFixed(2)}s`
                          : 'Đang suy nghĩ...'}
                      </div>
                    </div>
                    {sub && <Check className="w-4 h-4 shrink-0 text-emerald-400" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strictly Own-Seat Free-Text Input for Contestants — Only unlocked after MC starts timer */}
          {myPosition && mySeat && (
            !round3.timerStarted ? (
              <div className="p-4 bg-slate-950 border border-amber-400/50 rounded-xl flex items-center gap-2 text-xs sm:text-sm text-amber-300 font-semibold">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Đang chờ MC Chủ Phòng đọc câu hỏi và bấm <strong>"Bắt Đầu Chạy Đồng Hồ"</strong> ({currentQ.timeLimitSec} giây) để mở ô nhập đáp án Tăng Tốc...
                </span>
              </div>
            ) : !round3.deadlineEpochMs ? (
              <div className="p-4 bg-slate-950 border border-rose-500/40 rounded-xl text-xs sm:text-sm text-rose-200 font-semibold">
                {mySubmission ? (
                  <span>
                    ⏱ Đã hết giờ! Đáp án đã ghi nhận của bạn: <strong className="text-emerald-300">"{mySubmission.answer}"</strong> ({mySubmission.timeSec.toFixed(2)}s) — Đang chờ MC Chủ Phòng công bố kết quả...
                  </span>
                ) : (
                  <span>
                    ⏱ Đã hết {currentQ.timeLimitSec} giây Tăng Tốc — Đang chờ MC Chủ Phòng công bố kết quả và chấm điểm...
                  </span>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-amber-300">
                    Ô nhập đáp án Tăng Tốc của bạn: {mySeat.name} (Vị trí{' '}
                    {myPosition}) ·{' '}
                    <span className="font-mono text-sky-300">
                      ⏱ Đồng hồ bấm giờ: {liveElapsedSec.toFixed(2)}s
                    </span>
                  </span>
                  {mySubmission && (
                    <span className="font-mono text-emerald-400 font-semibold">
                      Bạn đã nộp đáp án "{mySubmission.answer}" lúc{' '}
                      {mySubmission.timeSec.toFixed(2)}s (Có thể gửi lại trước khi
                      hết giờ)
                    </span>
                  )}
                </div>

                <form
                  onSubmit={handleMySubmit}
                  className="flex flex-wrap sm:flex-nowrap gap-3"
                >
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={`[${mySeat.name}] Nhập đáp án tự luận và nhấn Enter...`}
                    className="w-full flex-1 px-4 py-3 bg-slate-900 border-2 border-amber-400/80 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-amber-300"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    Gửi đáp án ({mySeat.name})
                  </button>
                </form>
              </div>
            )
          )}

          {/* EXCLUSIVE MC SECRET ANSWER & GRADING PANEL */}
          {isHost && (
            <div className="p-5 bg-amber-950/35 border-2 border-amber-400/80 rounded-2xl space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-400/30 pb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  ĐÁP ÁN BÍ MẬT & BẢNG CHẤM ĐIỂM TĂNG TỐC DÀNH RIÊNG CHO MC
                </div>
                {!round3.timerStarted && !round3.deadlineEpochMs ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDispatch({
                          type: 'R3_CHANGE_QUESTION',
                          qIndex: round3.qIndex,
                          clientId,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-200 bg-slate-900 hover:bg-slate-800 border border-amber-400/50 rounded-xl cursor-pointer"
                    >
                      🎲 [MC] Đổi Câu Hỏi Khác
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playTick(false);
                        onDispatch({
                          type: 'MC_START_QUESTION_TIMER',
                          clientId,
                        });
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-lg cursor-pointer active:scale-95 transition-transform"
                    >
                      ⏱ [MC] Bắt Đầu Chạy Đồng Hồ ({currentQ.timeLimitSec} giây)
                    </button>
                  </div>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-200 text-xs font-bold">
                    {round3.deadlineEpochMs
                      ? `⏱ Đang chạy đồng hồ: còn ${timeLeft}s`
                      : '⏱ Đã hết giờ · MC chấm điểm bên dưới'}
                  </span>
                )}
              </div>

              <div className="p-3.5 bg-slate-950/90 border border-emerald-500/40 rounded-xl space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">
                  Đáp án chính thức Câu Tăng Tốc {currentQ.number}/4:
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

              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-200">
                  Danh sách câu trả lời theo thứ tự thời gian (MC chủ động bấm ✓ ĐÚNG hoặc ✕ SAI cho từng thí sinh):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mcSortedPreview.map((item, idx) => {
                    const pts = previewPointsByPos[item.position] || 0;
                    return (
                      <div
                        key={item.position}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                          item.isChecked
                            ? 'bg-emerald-950/50 border-emerald-500/60'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="truncate space-y-0.5">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-amber-300">
                              #{idx + 1} ·{' '}
                              {item.hasSub ? `${item.timeSec.toFixed(2)}s` : '--'}
                            </span>
                            <span className="truncate">
                              Vị trí {item.position}: {item.name}
                            </span>
                          </div>
                          <div className="text-slate-300 truncate">
                            Trả lời:{' '}
                            <strong className="text-amber-300">
                              "{item.answer}"
                            </strong>
                          </div>
                          {item.isChecked && (
                            <div className="text-[11px] font-mono font-bold text-emerald-400">
                              Dự kiến cộng: +{pts} điểm
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              onDispatch({
                                type: 'R3_MC_TOGGLE_GRADE',
                                position: item.position,
                                isCorrect: true,
                                clientId,
                              })
                            }
                            className={`px-3 py-1.5 rounded-lg font-extrabold text-xs cursor-pointer transition-all ${
                              item.isChecked
                                ? 'bg-emerald-500 text-slate-950 shadow-md'
                                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                            }`}
                          >
                            ✓ ĐÚNG {item.isChecked ? `(+${pts}đ)` : ''}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onDispatch({
                                type: 'R3_MC_TOGGLE_GRADE',
                                position: item.position,
                                isCorrect: false,
                                clientId,
                              })
                            }
                            className={`px-3 py-1.5 rounded-lg font-extrabold text-xs cursor-pointer transition-all ${
                              !item.isChecked
                                ? 'bg-rose-500 text-white shadow-md'
                                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                            }`}
                          >
                            ✕ SAI
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const correctPositions = (
                      [1, 2, 3, 4] as (1 | 2 | 3 | 4)[]
                    ).filter((p) => isSeatMarkedCorrect(p));
                    if (correctPositions.length > 0) {
                      soundFX.playCorrect();
                    } else {
                      soundFX.playWrong();
                    }
                    onDispatch({
                      type: 'R3_MC_CONFIRM_EVAL',
                      correctPositions,
                      clientId,
                    });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  [MC] Công bố Đáp án & Cộng điểm Tăng Tốc (40-30-20-10)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUESTION_RESULT */}
      {round3.subPhase === 'QUESTION_RESULT' && currentQ && (
        <div className="space-y-5">
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Đáp án chính thức Câu {currentQ.number}:
                </span>
                <div className="text-xl font-extrabold text-emerald-400">
                  {currentQ.answer}
                </div>
              </div>
              <div className="text-xs text-slate-300 max-w-md">
                {currentQ.explanation}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-400 uppercase">
                Bảng xếp hạng thời gian & đáp án của 4 Nhà Leo Núi:
              </div>
              {round3.rankedResults.map((rec, idx) => (
                <div
                  key={rec.position}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 ${
                    rec.isCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 font-mono text-xs font-bold text-slate-300 flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>
                          Vị trí {rec.position}: {rec.name}
                        </span>
                        {rec.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                      <div className="text-xs text-slate-300">
                        Trả lời: <strong className="text-white">"{rec.answer}"</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="inline-flex items-center gap-1 text-xs font-mono text-amber-300 tabular-nums">
                      <Timer className="w-3.5 h-3.5" />
                      {rec.timeSec.toFixed(2)}s
                    </div>
                    <div
                      className={`font-mono font-bold text-base w-16 text-right tabular-nums ${
                        (rec.pointsAwarded || 0) > 0
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    >
                      +{rec.pointsAwarded || 0}đ
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            {isHost ? (
              round3.qIndex + 1 < 4 ? (
                <button
                  onClick={() => {
                    soundFX.playRoundStart();
                    onDispatch({
                      type: 'R3_START_QUESTION',
                      qIndex: round3.qIndex + 1,
                      clientId,
                    });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shadow-lg"
                >
                  [MC] Sang Câu Tăng Tốc Số {round3.qIndex + 2} / 4
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() =>
                    onDispatch({
                      type: 'START_MATCH',
                      targetStage: 'ROUND_4_VE_DICH',
                      clientId,
                    })
                  }
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shadow-lg"
                >
                  [MC] Bước vào Phần 4: Về Đích (Lần lượt 4 người chơi)
                  <ArrowRight className="w-4 h-4" />
                </button>
              )
            ) : (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {round3.qIndex + 1 < 4
                    ? 'Đang chờ MC Chủ Phòng mở câu Tăng Tốc tiếp theo...'
                    : 'Đang chờ MC Chủ Phòng bắt đầu Phần 4: Về Đích...'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
