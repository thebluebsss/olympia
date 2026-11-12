import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  Check,
  Send,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import type { OlympiaRoomState, ClientAction } from '../types/olympia';
import { getCnvRewardPoints, getRoomObstaclePuzzles } from '../utils/olympiaEngine';
import { isAnswerMatch, normalizeViText } from '../data/olympiaQuestions';
import type { ObstaclePuzzle } from '../data/olympiaQuestions';
import { soundFX } from '../utils/soundEffects';
import { BuzzerQueuePanel } from './shared/BuzzerQueuePanel';

import {
  OBSTACLE_REAL_PHOTOS,
  resolveObstacleImageUrl,
} from '../utils/obstacleIllustrations';

const LOCAL_FALLBACK_BY_ID: Record<string, string> = OBSTACLE_REAL_PHOTOS;

function resolvePuzzleImageUrl(puzzle: ObstaclePuzzle): string {
  return resolveObstacleImageUrl(
    puzzle.id,
    puzzle.imageUrl,
    puzzle.keywordDisplay,
    puzzle.title,
    puzzle.rows.map((r) => r.displayWord),
    puzzle.centerQuestion.displayWord,
    puzzle.summaryExplanation
  );
}

interface Round2VCNVProps {
  room: OlympiaRoomState;
  clientId: string;
  isHost: boolean;
  myPositions: (1 | 2 | 3 | 4)[];
  onDispatch: (action: ClientAction) => void;
}

export const Round2VCNV: React.FC<Round2VCNVProps> = ({
  room,
  clientId,
  isHost,
  myPositions,
  onDispatch,
}) => {
  const { round2, seats } = room;
  const myPosition: 1 | 2 | 3 | 4 | null = myPositions[0] ?? null;
  const mySeat = myPosition ? seats[myPosition - 1] : null;
  const puzzles = getRoomObstaclePuzzles(room);
  const puzzle = puzzles[round2.puzzleIndex] || puzzles[0];
  const resolvedImageUrl = resolvePuzzleImageUrl(puzzle);
  const selectorSeat = seats[round2.selectorPosition - 1];
  const cnvBuzzerSeat = round2.cnvBuzzerPosition ? seats[round2.cnvBuzzerPosition - 1] : null;
  const isMyCnvBuzzer =
    round2.cnvBuzzerPosition !== null && myPosition === round2.cnvBuzzerPosition;

  const [rowInputText, setRowInputText] = useState<string>('');
  const [cnvInputText, setCnvInputText] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(15);

  const lastExpiredDeadlineRef = useRef<number | null>(null);
  const localTimerAnchorRef = useRef<{ token: number | null; localEndMs: number }>({
    token: null,
    localEndMs: 0,
  });
  const cnvPhaseLocalStartPerfRef = useRef<number>(performance.now());

  useEffect(() => {
    cnvPhaseLocalStartPerfRef.current = performance.now();
  }, [round2.cnvPhaseStartMs, round2.activeRowId, round2.subPhase, round2.puzzleIndex]);

  useEffect(() => {
    setRowInputText('');
  }, [round2.activeRowId, round2.subPhase]);

  useEffect(() => {
    if (!round2.deadlineEpochMs) return;
    if (
      round2.subPhase !== 'ANSWERING_ROW' &&
      round2.subPhase !== 'ANSWERING_CENTER' &&
      round2.subPhase !== 'FINAL_15S'
    ) {
      return;
    }

    const durationMs = 15000;
    if (localTimerAnchorRef.current.token !== round2.deadlineEpochMs) {
      localTimerAnchorRef.current = {
        token: round2.deadlineEpochMs,
        localEndMs: Date.now() + durationMs,
      };
      setTimeLeft(15);
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
        round2.deadlineEpochMs &&
        lastExpiredDeadlineRef.current !== round2.deadlineEpochMs &&
        isHost
      ) {
        lastExpiredDeadlineRef.current = round2.deadlineEpochMs;
        onDispatch({
          type: 'SERVER_TIMER_EXPIRED',
          expectedDeadline: round2.deadlineEpochMs,
        });
      }
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 100);
    return () => window.clearInterval(interval);
  }, [round2.deadlineEpochMs, round2.subPhase, isHost, onDispatch]);

  const cnvReward = getCnvRewardPoints(round2);
  const allFourRowsOpened =
    round2.rowStatuses[1] !== 'UNOPENED' &&
    round2.rowStatuses[2] !== 'UNOPENED' &&
    round2.rowStatuses[3] !== 'UNOPENED' &&
    round2.rowStatuses[4] !== 'UNOPENED';

  const handleMyRowAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myPosition || !rowInputText.trim()) return;
    soundFX.playBuzzer();
    onDispatch({
      type: 'R2_SUBMIT_ROW_ANSWER',
      position: myPosition,
      answer: rowInputText.trim(),
      clientId,
    });
    setRowInputText('');
  };

  const mySubmittedRowAnswer = myPosition ? round2.rowSubmissions[myPosition] : undefined;
  const activeRowOrCenterObj =
    round2.subPhase === 'ANSWERING_CENTER'
      ? puzzle.centerQuestion
      : puzzle.rows.find((r) => r.id === round2.activeRowId);

  const isSeatMarkedCorrect = (pos: 1 | 2 | 3 | 4): boolean => {
    const seat = seats[pos - 1];
    if (!seat || seat.vcnvLocked) return false;
    if (round2.mcGrades && round2.mcGrades[pos] !== undefined) {
      return Boolean(round2.mcGrades[pos]);
    }
    const rawAns = round2.rowSubmissions[pos];
    if (!rawAns || !activeRowOrCenterObj) return false;
    return isAnswerMatch(
      rawAns,
      activeRowOrCenterObj.acceptedAnswers,
      activeRowOrCenterObj.displayWord
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="text-xs font-semibold text-amber-400">
            PHẦN THI THỨ HAI · TỪ KHÓA GỒM {puzzle.charCount} CHỮ CÁI (ĐIỂM HIỆN TẠI: +{cnvReward}Đ)
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">
            2. Vượt Chướng Ngại Vật
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Đề Chướng Ngại Vật đã được tráo ngẫu nhiên tự động (Kho {puzzles.length} bộ đề)</span>
        </div>
      </div>

      {/* MC SECRET OVERVIEW SHEET */}
      {isHost && round2.subPhase !== 'ROUND_SUMMARY' && (
        <div className="p-4 bg-amber-950/35 border-2 border-amber-400/70 rounded-2xl space-y-3 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              ĐÁP ÁN & HÌNH ẢNH BÍ MẬT VÒNG 2 DÀNH RIÊNG CHO MC CHỦ PHÒNG (ĐỀ {round2.puzzleIndex + 1}/{puzzles.length})
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {round2.subPhase === 'SELECT_ROW' && round2.openedRowCount === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playTick(false);
                    const total = Math.max(1, puzzles.length);
                    let nextIdx = Math.floor(Math.random() * total);
                    if (total > 1 && nextIdx === round2.puzzleIndex) {
                      nextIdx = (nextIdx + 1) % total;
                    }
                    onDispatch({
                      type: 'R2_SELECT_PUZZLE',
                      puzzleIndex: nextIdx,
                      clientId,
                    });
                  }}
                  className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-200 text-[11px] font-extrabold cursor-pointer transition-colors"
                >
                  🎲 [MC] Đổi Ngẫu Nhiên Đề VCNV Khác (Kho {puzzles.length} đề)
                </button>
              )}
              <span className="px-2.5 py-0.5 rounded bg-amber-400/20 text-amber-200 text-[11px] font-bold">
                Từ khóa CNV: {puzzle.keywordDisplay} ({puzzle.charCount} chữ cái)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-3">
              <div className="relative rounded-xl overflow-hidden border border-amber-400/50 aspect-16/10 bg-slate-950">
                <img
                  src={resolvedImageUrl}
                  alt={puzzle.keywordDisplay}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-amber-300 text-center truncate">
                  Ảnh gợi ý: {puzzle.keywordDisplay}
                </div>
              </div>
            </div>

            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
              {puzzle.rows.map((r) => (
                <div key={r.id} className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800">
                  <div className="text-slate-400 font-semibold">Hàng ngang {r.id}:</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">{r.displayWord}</div>
                </div>
              ))}
              <div className="p-2.5 rounded-lg bg-slate-950/90 border border-amber-500/40">
                <div className="text-amber-300 font-semibold">Ô Trung Tâm:</div>
                <div className="font-mono font-bold text-amber-400 mt-0.5">
                  {puzzle.centerQuestion.displayWord}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buzzer Section for Solving the Main Obstacle */}
      {round2.subPhase !== 'ROUND_SUMMARY' && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-300">
              BẤM CHUÔNG GIẢI TỪ KHÓA CHƯỚNG NGẠI VẬT BẤT CỨ LÚC NÀO (+{cnvReward} ĐIỂM):
            </div>
            <div className="text-xs text-slate-400">
              Lưu ý: Nếu MC chấm SAI Chướng Ngại Vật, thí sinh sẽ bị khóa quyền thi tiếp ở phần thi này.
            </div>
          </div>

          {myPosition && mySeat ? (
            (() => {
              const haveIBuzzedCnv = Boolean(
                (round2.cnvBuzzQueue || []).some((entry) => entry.position === myPosition)
              );
              const isFinal15sExpired =
                round2.subPhase === 'FINAL_15S' && (!round2.deadlineEpochMs || timeLeft <= 0);
              const isBuzzDisabled =
                mySeat.vcnvLocked ||
                haveIBuzzedCnv ||
                isFinal15sExpired ||
                Boolean(round2.pendingCnvKeyword);

              return (
                <button
                  type="button"
                  disabled={isBuzzDisabled}
                  onClick={() => {
                    if (isBuzzDisabled) return;
                    const elapsedSec = Math.max(
                      0.01,
                      Math.min(
                        60,
                        Number(
                          ((performance.now() - cnvPhaseLocalStartPerfRef.current) / 1000).toFixed(2)
                        )
                      )
                    );
                    soundFX.playBuzzer();
                    setCnvInputText('');
                    onDispatch({
                      type: 'R2_BUZZ_CNV',
                      position: myPosition,
                      clientBuzzElapsedSec: elapsedSec,
                      clientId,
                    });
                  }}
                  className={`px-5 py-3 rounded-xl border font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                    mySeat.vcnvLocked
                      ? 'bg-slate-900 border-rose-500/30 text-rose-400 cursor-not-allowed'
                      : isFinal15sExpired
                      ? 'bg-slate-900 border-rose-500/40 text-rose-300 cursor-not-allowed'
                      : isBuzzDisabled
                      ? 'bg-slate-900 border-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 shadow-md cursor-pointer active:scale-95'
                  }`}
                >
                  {mySeat.vcnvLocked ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Bạn đã bị khóa quyền VCNV ({mySeat.name})
                    </>
                  ) : isFinal15sExpired ? (
                    <>
                      <Lock className="w-4 h-4" />
                      ⏱ Đã hết 15 giây bấm chuông cuối cùng
                    </>
                  ) : haveIBuzzedCnv ? (
                    <>
                      <Bell className="w-4 h-4 fill-current" />
                      Đã ghi nhận tín hiệu chuông ({mySeat.name})
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 fill-current" />
                      BẤM CHUÔNG GIẢI CNV ({mySeat.name} - Vị trí {myPosition})
                    </>
                  )}
                </button>
              );
            })()
          ) : null}
        </div>
      )}

      {/* Active CNV Buzzer Modal */}
      {cnvBuzzerSeat && round2.subPhase !== 'ROUND_SUMMARY' && (
        <div className="p-5 bg-amber-500/15 border-2 border-amber-400 rounded-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-extrabold text-amber-300">
              TÍN HIỆU CHUÔNG GIẢI CHƯỚNG NGẠI VẬT ĐANG CHỌN: {cnvBuzzerSeat.name.toUpperCase()} (VỊ TRÍ {cnvBuzzerSeat.position})!
            </div>
            <span className="text-xs font-mono text-amber-200">
              MC chấm Đúng: +{cnvReward} điểm · Sai: Khóa quyền chơi VCNV
            </span>
          </div>

          <BuzzerQueuePanel
            queue={round2.cnvBuzzQueue || []}
            selectedPosition={round2.cnvBuzzerPosition}
            isHost={isHost}
            title="📊 BẢNG TÍN HIỆU CHUÔNG GIẢI CNV (XẾP THEO THỜI GIAN TỪ THẤP NHẤT):"
            subtitle="MC có thể chọn người có thời gian thấp nhất để trả lời"
            onSelectWinner={(position) =>
              onDispatch({ type: 'MC_SELECT_BUZZER_WINNER', position, clientId })
            }
          />

          {isMyCnvBuzzer ? (
            round2.pendingCnvKeyword ? (
              <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-sm text-emerald-200 flex items-center justify-between">
                <span>
                  Bạn đã chốt từ khóa Chướng Ngại Vật:{' '}
                  <strong className="text-white">"{round2.pendingCnvKeyword}"</strong> — Đang chờ MC
                  Chủ Phòng công bố kết quả...
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onDispatch({
                    type: 'R2_SUBMIT_CNV',
                    position: cnvBuzzerSeat.position,
                    keyword: cnvInputText,
                    clientId,
                  });
                }}
                className="flex flex-wrap gap-3"
              >
                <input
                  type="text"
                  value={cnvInputText}
                  onChange={(e) => setCnvInputText(e.target.value)}
                  placeholder={`[${cnvBuzzerSeat.name}] Nhập từ khóa Chướng Ngại Vật (${puzzle.charCount} chữ cái)...`}
                  className="flex-1 px-4 py-3 bg-slate-950 border-2 border-amber-400 rounded-lg text-white text-sm font-bold focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-5 py-3 text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer"
                >
                  Chốt Chướng Ngại Vật
                </button>
                <button
                  type="button"
                  onClick={() => onDispatch({ type: 'R2_CANCEL_BUZZ_CNV', clientId })}
                  className="px-3 py-3 text-xs font-semibold bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
              </form>
            )
          ) : !isHost ? (
            <div className="text-xs sm:text-sm text-slate-200 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {round2.pendingCnvKeyword ? (
                  <>
                    <strong>{cnvBuzzerSeat.name}</strong> trả lời CNV là:{' '}
                    <strong>"{round2.pendingCnvKeyword}"</strong> — Đang chờ MC Chủ Phòng chấm điểm...
                  </>
                ) : (
                  <>
                    Đang chờ <strong>{cnvBuzzerSeat.name} (Vị trí {cnvBuzzerSeat.position})</strong>{' '}
                    nhập đáp án Chướng Ngại Vật...
                  </>
                )}
              </span>
            </div>
          ) : null}

          {isHost && (
            <div className="p-4 bg-slate-950/90 border border-amber-400/50 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Từ khóa thí sinh đưa ra: </span>
                  <strong className="text-white text-sm">
                    {round2.pendingCnvKeyword ? `"${round2.pendingCnvKeyword}"` : '(Đang nhập...)'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Đáp án CNV chính thức: </span>
                  <strong className="text-emerald-400 text-sm">{puzzle.keywordDisplay}</strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playCorrect();
                    onDispatch({ type: 'R2_MC_GRADE_CNV', isCorrect: true, clientId });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  MC Chấm ĐÚNG CNV (+{cnvReward} điểm)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playWrong();
                    onDispatch({ type: 'R2_MC_GRADE_CNV', isCorrect: false, clientId });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-rose-500 hover:bg-rose-400 text-white cursor-pointer shadow-lg"
                >
                  <XCircle className="w-4 h-4" />
                  MC Chấm SAI CNV (Khóa quyền của {cnvBuzzerSeat.name})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main 2-Column Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 4 Horizontal Rows + Active Row Question */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Lượt đề xuất chọn hàng ngang:{' '}
                <strong className="text-sky-300">
                  {selectorSeat.name} (Vị trí {selectorSeat.position})
                </strong>
              </span>
              <span className="font-mono text-amber-300">CNV: {puzzle.charCount} chữ cái</span>
            </div>

            {puzzle.rows.map((row) => {
              const status = round2.rowStatuses[row.id];
              const letters = row.displayWord.replace(/\s+/g, '').split('');

              return (
                <div
                  key={row.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    round2.activeRowId === row.id && round2.subPhase === 'ANSWERING_ROW'
                      ? 'bg-sky-950/60 border-sky-400'
                      : status === 'SOLVED'
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : status === 'LOCKED'
                      ? 'bg-slate-900/50 border-slate-800 opacity-50'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {letters.map((ch, idx) => (
                      <span
                        key={idx}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono text-xs sm:text-sm font-bold border ${
                          status === 'SOLVED'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                            : status === 'LOCKED'
                            ? 'bg-slate-800 text-slate-500 border-slate-700'
                            : 'bg-sky-900/70 text-sky-200 border-sky-500/50'
                        }`}
                      >
                        {status === 'SOLVED' ? ch : ''}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-slate-400">({row.charCount} chữ)</span>
                    {status === 'UNOPENED' && round2.subPhase === 'SELECT_ROW' && isHost ? (
                      <button
                        onClick={() => {
                          soundFX.playRoundStart();
                          onDispatch({ type: 'R2_PICK_ROW', rowId: row.id, clientId });
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-sky-400 hover:bg-sky-300 text-slate-950 rounded-lg cursor-pointer"
                      >
                        [MC] Mở Hàng {row.id}
                      </button>
                    ) : (
                      <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-300">
                        {row.id}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Row Question */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            {round2.subPhase === 'SELECT_ROW' && !allFourRowsOpened && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
                {isHost ? (
                  <span className="text-amber-300 font-bold">
                    [MC Chủ Phòng] Hãy bấm nút "[MC] Mở Hàng 1..4" ở trên theo lựa chọn của thí sinh{' '}
                    {selectorSeat.name} (Vị trí {selectorSeat.position}).
                  </span>
                ) : (
                  <span>
                    Lượt của <strong>{selectorSeat.name} (Vị trí {selectorSeat.position})</strong>{' '}
                    chọn hàng ngang — Đang chờ MC Chủ Phòng mở câu hỏi hàng ngang...
                  </span>
                )}
              </div>
            )}

            {round2.subPhase === 'SELECT_ROW' && allFourRowsOpened && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-amber-300 font-medium">
                  Đã mở hết 4 hàng ngang! Tiếp theo MC mở Câu hỏi Ô Trung Tâm:
                </span>
                {isHost ? (
                  <button
                    onClick={() => {
                      soundFX.playRoundStart();
                      onDispatch({ type: 'R2_OPEN_CENTER', clientId });
                    }}
                    className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer shrink-0"
                  >
                    [MC] Mở Ô Trung Tâm
                  </button>
                ) : (
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Đang chờ MC Chủ Phòng mở Ô Trung Tâm...</span>
                  </div>
                )}
              </div>
            )}

            {(round2.subPhase === 'ANSWERING_ROW' || round2.subPhase === 'ANSWERING_CENTER') && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-sky-300 uppercase">
                    {round2.subPhase === 'ANSWERING_ROW'
                      ? `Câu hỏi Hàng ngang số ${round2.activeRowId}`
                      : 'Câu hỏi Ô Trung Tâm'}
                  </span>
                  <span className="font-mono font-bold text-sm sm:text-base text-amber-300 tabular-nums">
                    {round2.deadlineEpochMs
                      ? `⏱ Thời gian: ${timeLeft}s`
                      : !round2.timerStarted
                      ? '⏱ Chờ MC bấm chạy đồng hồ (15s)'
                      : '⏱ Hết giờ · Chờ MC chấm'}
                  </span>
                </div>

                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {activeRowOrCenterObj?.question}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {seats.map((s) => {
                    const hasSub = round2.rowSubmissions[s.position] !== undefined;
                    const isMe = myPosition === s.position;
                    return (
                      <div
                        key={s.position}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center justify-between gap-1.5 ${
                          s.vcnvLocked
                            ? 'bg-slate-900 border-slate-800 text-slate-600'
                            : hasSub
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                            : isMe
                            ? 'bg-amber-500/10 border-amber-400/60 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="truncate">
                          {s.position}. {s.name}
                        </span>
                        {hasSub ? (
                          <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                        ) : (
                          <span className="text-[10px] opacity-75 shrink-0">
                            {s.vcnvLocked ? 'Khóa' : 'Đang gõ'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {myPosition && mySeat && !mySeat.vcnvLocked ? (
                  mySubmittedRowAnswer !== undefined ? (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
                      <span>
                        Bạn ({mySeat.name}) đã gửi đáp án: <strong>"{mySubmittedRowAnswer}"</strong>{' '}
                        (đang chờ MC công bố & chấm điểm).
                      </span>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    </div>
                  ) : !round2.timerStarted ? (
                    <div className="p-3 bg-slate-900 border border-amber-400/50 rounded-lg text-xs text-amber-300 font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Đang chờ MC Chủ Phòng đọc câu hỏi và bấm{' '}
                        <strong>"Bắt Đầu Chạy Đồng Hồ"</strong> (15 giây) để mở ô nhập đáp án...
                      </span>
                    </div>
                  ) : !round2.deadlineEpochMs ? (
                    <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-xs text-rose-200 font-semibold">
                      ⏱ Đã hết 15 giây suy nghĩ — Đang chờ MC Chủ Phòng công bố kết quả và chấm điểm...
                    </div>
                  ) : (
                    <form onSubmit={handleMyRowAnswerSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={rowInputText}
                        onChange={(e) => setRowInputText(e.target.value)}
                        placeholder={`[${mySeat.name}] Nhập đáp án tự luận của bạn...`}
                        className="flex-1 px-3.5 py-2.5 bg-slate-900 border-2 border-sky-400/70 rounded-lg text-sm text-white focus:outline-none focus:border-sky-300"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold bg-sky-400 hover:bg-sky-300 text-slate-950 rounded-lg cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Gửi đáp án
                      </button>
                    </form>
                  )
                ) : null}

                {isHost && activeRowOrCenterObj && (
                  <div className="p-4 bg-amber-950/35 border-2 border-amber-400/80 rounded-xl space-y-3 mt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-amber-300 uppercase">
                        [MC] Chấm điểm các thí sinh · Đáp án đúng:{' '}
                        <strong className="text-emerald-400">
                          {activeRowOrCenterObj.displayWord}
                        </strong>
                      </span>
                      {!round2.timerStarted && !round2.deadlineEpochMs ? (
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playTick(false);
                            onDispatch({ type: 'MC_START_QUESTION_TIMER', clientId });
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs bg-sky-400 hover:bg-sky-300 text-slate-950 cursor-pointer shadow-md active:scale-95 transition-transform"
                        >
                          ⏱ [MC] Bắt Đầu Chạy Đồng Hồ (15 giây)
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-sky-300">
                          {round2.deadlineEpochMs
                            ? `⏱ Đang chạy đồng hồ: còn ${timeLeft}s`
                            : '⏱ Đã hết 15 giây'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {seats.map((s) => {
                        const rawAns = round2.rowSubmissions[s.position];
                        const isChecked = isSeatMarkedCorrect(s.position);
                        return (
                          <div
                            key={s.position}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                              isChecked
                                ? 'bg-emerald-950/50 border-emerald-500/60'
                                : 'bg-slate-950 border-slate-800'
                            }`}
                          >
                            <div className="truncate">
                              <div className="font-bold text-white">
                                {s.position}. {s.name}
                              </div>
                              <div className="text-slate-300 truncate">
                                Đáp án:{' '}
                                <strong className="text-amber-300">
                                  {s.vcnvLocked ? '(Đã khóa VCNV)' : rawAns || '(Chưa gửi)'}
                                </strong>
                              </div>
                            </div>

                            {!s.vcnvLocked && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onDispatch({
                                      type: 'R2_MC_TOGGLE_ROW_GRADE',
                                      position: s.position,
                                      isCorrect: true,
                                      clientId,
                                    })
                                  }
                                  className={`px-2.5 py-1.5 rounded-lg font-extrabold text-[11px] cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                                      : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                                  }`}
                                >
                                  ✓ ĐÚNG
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onDispatch({
                                      type: 'R2_MC_TOGGLE_ROW_GRADE',
                                      position: s.position,
                                      isCorrect: false,
                                      clientId,
                                    })
                                  }
                                  className={`px-2.5 py-1.5 rounded-lg font-extrabold text-[11px] cursor-pointer transition-all ${
                                    !isChecked
                                      ? 'bg-rose-500 text-white shadow-md'
                                      : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                                  }`}
                                >
                                  ✕ SAI
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const correctList = ([1, 2, 3, 4] as (1 | 2 | 3 | 4)[]).filter((p) =>
                            isSeatMarkedCorrect(p)
                          );
                          if (correctList.length > 0) soundFX.playCorrect();
                          else soundFX.playWrong();
                          onDispatch({
                            type: 'R2_MC_CONFIRM_ROW_EVAL',
                            correctPositions: correctList,
                            clientId,
                          });
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer shadow-lg"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        [MC] Công bố kết quả Hàng ngang & Cộng điểm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(round2.subPhase === 'ROW_RESULT' || round2.subPhase === 'FINAL_15S') && (
              <div className="space-y-3">
                {round2.lastRowEvaluation && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase">
                          Đáp án chính thức {round2.lastRowEvaluation.rowLabel}:
                        </span>
                        <div className="text-base font-extrabold text-emerald-400">
                          {round2.lastRowEvaluation.officialAnswer}
                        </div>
                      </div>
                      <div className="text-xs text-slate-300">
                        {round2.lastRowEvaluation.explanation}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {round2.lastRowEvaluation.results.map((r) => (
                        <div
                          key={r.position}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                            r.isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="truncate">
                            <div className="font-bold text-white truncate">
                              {r.position}. {r.name}
                            </div>
                            <div className="truncate">
                              Trả lời: <strong>"{r.submittedAnswer}"</strong>
                            </div>
                          </div>
                          <span
                            className={`font-mono font-bold shrink-0 ${
                              r.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {r.isCorrect ? '+10đ' : '0đ'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {round2.subPhase === 'ROW_RESULT' && (
                  <div className="flex justify-end">
                    {isHost ? (
                      <button
                        onClick={() =>
                          onDispatch({ type: 'R2_CONTINUE_SELECT_ROW', clientId })
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer shadow-md"
                      >
                        [MC] Chuyển sang lượt chọn hàng ngang tiếp theo
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          Đang chờ <strong>MC Chủ Phòng</strong> chuyển lượt chọn hàng ngang tiếp
                          theo...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {round2.subPhase === 'FINAL_15S' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span>15 GIÂY CUỐI CÙNG ĐỂ BẤM CHUÔNG GIẢI CHƯỚNG NGẠI VẬT (20 ĐIỂM)</span>
                      <span className="font-mono text-base">
                        {round2.deadlineEpochMs ? `${timeLeft}s` : 'Hết giờ'}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2">
                      {isHost ? (
                        <button
                          onClick={() => onDispatch({ type: 'R2_MC_REVEAL_CNV', clientId })}
                          className="px-4 py-2.5 text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer shadow-md"
                        >
                          [MC] Công bố Chướng Ngại Vật & Tổng kết Vòng 2
                        </button>
                      ) : (
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Đang chờ MC Chủ Phòng công bố Chướng Ngại Vật...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: 5-Piece Mystery Image */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>Hình ảnh gợi ý Chướng Ngại Vật</span>
            <span className="inline-flex items-center gap-1 text-sky-300">
              <Eye className="w-3.5 h-3.5" />{' '}
              {isHost ? '5 mảnh ghép (MC nhìn xuyên thấu)' : '5 mảnh ghép'}
            </span>
          </div>

          <div className="relative w-full aspect-16/10 rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
            <img
              src={resolvedImageUrl}
              alt="Chướng ngại vật Olympia"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const fallback = LOCAL_FALLBACK_BY_ID[puzzle.id] || '/assets/vcnv/vcnv-1.jpg';
                if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
              }}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              {[1, 2, 3, 4].map((quad) => {
                const st = round2.rowStatuses[quad];
                if (st === 'SOLVED' || round2.subPhase === 'ROUND_SUMMARY') {
                  return <div key={quad} className="pointer-events-none" />;
                }
                return (
                  <div
                    key={quad}
                    className={`border border-slate-950 flex flex-col items-center justify-center ${
                      st === 'LOCKED'
                        ? isHost
                          ? 'bg-slate-900/70 text-slate-300'
                          : 'bg-slate-900/95 text-slate-600'
                        : isHost
                        ? 'bg-[#112240]/60 text-sky-200'
                        : 'bg-[#112240] text-sky-300'
                    }`}
                  >
                    <span className="font-display font-extrabold text-2xl drop-shadow">{quad}</span>
                    <span className="text-[10px] uppercase tracking-wider mt-0.5 drop-shadow">
                      {st === 'LOCKED' ? 'Đã khóa' : `Góc ${quad}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {round2.centerStatus !== 'SOLVED' && round2.subPhase !== 'ROUND_SUMMARY' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={`w-2/5 h-2/5 border-2 border-amber-400/80 rounded-lg shadow-xl flex flex-col items-center justify-center text-amber-300 ${
                    isHost ? 'bg-[#0A192F]/65' : 'bg-[#0A192F]'
                  }`}
                >
                  <span className="font-display font-extrabold text-sm uppercase">Ô Trung Tâm</span>
                  <span className="text-[10px] text-slate-300 mt-0.5">Mảnh ghép chính</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-center">
            <div className="text-[11px] text-slate-400 uppercase">
              Từ khóa Chướng Ngại Vật ({puzzle.charCount} chữ cái)
            </div>
            <div className="font-display font-extrabold text-lg text-amber-300 tracking-widest mt-0.5">
              {round2.subPhase === 'ROUND_SUMMARY' || isHost
                ? puzzle.keywordDisplay
                : Array.from({ length: puzzle.charCount })
                    .map(() => '•')
                    .join(' ')}
            </div>
          </div>
        </div>
      </div>

      {round2.lastFeedback &&
        round2.subPhase !== 'ROW_RESULT' &&
        round2.subPhase !== 'FINAL_15S' && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-200">
            {round2.lastFeedback}
          </div>
        )}

      {/* ROUND SUMMARY */}
      {round2.subPhase === 'ROUND_SUMMARY' && round2.cnvWinner && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border-2 space-y-5 shadow-2xl transition-all ${
            round2.cnvWinner.solved
              ? 'bg-linear-to-b from-emerald-950/70 via-slate-950 to-slate-900 border-amber-400'
              : 'bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 border-amber-400/60'
          }`}
        >
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-extrabold text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-400" />
              CÔNG BỐ ĐÁP ÁN LỚN CHƯỚNG NGẠI VẬT
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>

            <div className="space-y-1">
              <div className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
                TỪ KHÓA CHÍNH THỨC CỦA CHƯƠNG TRÌNH ({puzzle.charCount} CHỮ CÁI)
              </div>
              <h3 className="text-3xl sm:text-4xl font-display font-black text-amber-300 tracking-wider">
                {puzzle.keywordDisplay}
              </h3>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                round2.cnvWinner.solved
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900 border border-slate-800 text-slate-300'
              }`}
            >
              {round2.cnvWinner.solved ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-400" />
              )}
              <span>{round2.cnvWinner.message}</span>
            </div>
          </div>

          <div className="p-5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3 text-sm text-slate-200 leading-relaxed">
            <div className="font-bold text-amber-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Ý nghĩa và mối liên hệ với 4 từ hàng ngang:</span>
            </div>
            <p className="text-slate-300">{puzzle.summaryExplanation}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              {puzzle.rows.map((r) => (
                <div
                  key={r.id}
                  className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                >
                  <span className="truncate mr-2">
                    {r.rowLabel}: <strong className="text-slate-300">{r.question}</strong>
                  </span>
                  <span className="font-mono font-bold text-emerald-400 shrink-0">
                    {r.displayWord}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            {isHost ? (
              <button
                onClick={() =>
                  onDispatch({
                    type: 'START_MATCH',
                    targetStage: 'ROUND_3_TANG_TOC',
                    clientId,
                  })
                }
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg cursor-pointer transition-transform active:scale-95"
              >
                [MC] Tiếp tục trận đấu · Sang Phần 3: Tăng Tốc
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Đang chờ MC Chủ Phòng bắt đầu Phần 3: Tăng Tốc...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
