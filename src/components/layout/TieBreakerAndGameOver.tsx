import React, { useState } from 'react';
import { Bell, Sparkles, Trophy, Award, RotateCcw } from 'lucide-react';
import type { OlympiaRoomState, ClientAction } from '../../types/olympia.ts';
import type { QuizQuestion } from '../../data/olympiaQuestions.ts';
import { BuzzerQueuePanel } from '../shared/BuzzerQueuePanel.tsx';
import { soundFX } from '../../utils/soundEffects.ts';
import laurelWreathImg from '../../assets/images/olympia_laurel_wreath_1794066591261.jpg';

interface TieBreakerAndGameOverProps {
  roomState: OlympiaRoomState;
  clientId: string;
  isHost: boolean;
  myPosition: 1 | 2 | 3 | 4 | null;
  tieBreakerQuestions: QuizQuestion[];
  onDispatch: (action: ClientAction) => void;
}

export const TieBreakerAndGameOver: React.FC<TieBreakerAndGameOverProps> = ({
  roomState,
  clientId,
  isHost,
  myPosition,
  tieBreakerQuestions,
  onDispatch,
}) => {
  const [tbAnswer, setTbAnswer] = useState<string>('');
  const sortedStandings = [...roomState.seats].sort(
    (a, b) => b.score - a.score
  );
  const champion = sortedStandings[0];

  if (roomState.stage === 'TIE_BREAKER') {
    return (
      <div className="bg-slate-900 border-2 border-amber-400 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="text-xs font-bold text-amber-400 uppercase">
          PHẦN THI CÂU HỎI PHỤ · QUYẾT ĐỊNH CHỦ NHÂN VÒNG NGUYỆT QUẾ
        </div>
        <h2 className="text-2xl font-display font-extrabold text-white">
          Các thí sinh đang đồng điểm cao nhất:{' '}
          {roomState.tieBreaker.tiedPositions
            .map((p) => roomState.seats[p - 1].name)
            .join(' & ')}
        </h2>
        <p className="text-lg font-semibold text-white bg-slate-950 p-5 rounded-xl border border-slate-800">
          {tieBreakerQuestions[0]?.question}
        </p>

        {isHost && tieBreakerQuestions[0] && (
          <div className="p-5 bg-amber-950/40 border-2 border-amber-400 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-400 text-slate-950">
                BẢNG ĐIỀU PHỐI & ĐÁP ÁN MẬT DÀNH RIÊNG CHO MC CHỦ PHÒNG
              </span>
              <span className="text-xs text-amber-300 font-semibold">
                Thí sinh không thể nhìn thấy khung này
              </span>
            </div>

            <div className="p-3.5 bg-slate-950/90 border border-amber-400/50 rounded-xl space-y-1">
              <div className="text-xs text-slate-400">
                Đáp án chính thức Câu hỏi phụ:
              </div>
              <div className="text-lg font-mono font-extrabold text-emerald-300">
                {tieBreakerQuestions[0].answer}
              </div>
            </div>

            {roomState.tieBreaker.subPhase === 'ANSWERING' &&
              roomState.tieBreaker.buzzedPosition && (
                <div className="p-4 bg-slate-950 border border-sky-400/60 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-sky-300 uppercase">
                    Thí sinh bấm chuông:{' '}
                    {
                      roomState.seats[roomState.tieBreaker.buzzedPosition - 1]
                        .name
                    }{' '}
                    (Vị trí {roomState.tieBreaker.buzzedPosition})
                  </div>
                  <div className="text-sm text-white">
                    Câu trả lời đã gửi:{' '}
                    {roomState.tieBreaker.pendingAnswer !== undefined &&
                    roomState.tieBreaker.pendingAnswer !== null ? (
                      <strong className="font-mono text-amber-300 text-base">
                        "{roomState.tieBreaker.pendingAnswer || '(Bỏ trống)'}"
                      </strong>
                    ) : (
                      <span className="italic text-slate-400">
                        Đang nhập câu trả lời...
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playCorrect();
                        onDispatch({
                          type: 'TB_MC_GRADE',
                          isCorrect: true,
                          clientId,
                        });
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer shadow-md"
                    >
                      ✓ MC Chấm ĐÚNG (+10đ & Trao Vòng Nguyệt Quế)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playWrong();
                        onDispatch({
                          type: 'TB_MC_GRADE',
                          isCorrect: false,
                          clientId,
                        });
                      }}
                      className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs sm:text-sm cursor-pointer shadow-md"
                    >
                      ✕ MC Chấm SAI (Mở lại chuông cho thí sinh còn lại)
                    </button>
                  </div>
                </div>
              )}
          </div>
        )}

        {roomState.tieBreaker.lastFeedback && (
          <div className="p-4 bg-rose-950/50 border border-rose-500/40 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-rose-200">
              {roomState.tieBreaker.lastFeedback.message}
            </div>
            {roomState.tieBreaker.lastFeedback.officialAnswer && (
              <div className="text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  Đáp án chính thức:{' '}
                  <strong className="font-mono">
                    {roomState.tieBreaker.lastFeedback.officialAnswer}
                  </strong>
                </span>
              </div>
            )}
          </div>
        )}

        <BuzzerQueuePanel
          entries={roomState.tieBreaker.buzzQueue}
          selectedPosition={roomState.tieBreaker.buzzedPosition}
          isHost={isHost}
          title="📊 BẢNG TÍN HIỆU CHUÔNG CÂU HỎI PHỤ (XẾP THEO THỜI GIAN TỪ THẤP NHẤT):"
          onSelectWinner={(pos) =>
            onDispatch({
              type: 'MC_SELECT_BUZZER_WINNER',
              position: pos,
              clientId,
            })
          }
        />

        {roomState.tieBreaker.subPhase === 'BUZZ_OPEN' ? (
          myPosition &&
          roomState.tieBreaker.tiedPositions.includes(myPosition) ? (
            roomState.tieBreaker.deadlineEpochMs ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playBuzzer();
                    onDispatch({
                      type: 'TB_BUZZ',
                      position: myPosition,
                      clientId,
                    });
                  }}
                  className="px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Bell className="w-5 h-5 fill-slate-950" />
                  BẤM CHUÔNG GIÀNH QUYỀN TRẢ LỜI (
                  {roomState.seats[myPosition - 1].name})
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-rose-500/40 rounded-xl text-center text-sm font-bold text-rose-300">
                ⏱ Đã hết 15 giây đếm ngược bấm chuông Câu hỏi phụ!
              </div>
            )
          ) : (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-sm text-slate-300">
              {roomState.tieBreaker.deadlineEpochMs
                ? 'Đang chờ các thí sinh đồng điểm cao nhất bấm chuông giành quyền trả lời...'
                : '⏱ Đã hết 15 giây đếm ngược bấm chuông Câu hỏi phụ!'}
            </div>
          )
        ) : myPosition && roomState.tieBreaker.buzzedPosition === myPosition ? (
          roomState.tieBreaker.pendingAnswer !== undefined &&
          roomState.tieBreaker.pendingAnswer !== null ? (
            <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-xl text-center text-sm text-emerald-300">
              Đã gửi đáp án:{' '}
              <strong className="font-mono text-white">
                "{roomState.tieBreaker.pendingAnswer}"
              </strong>{' '}
              — Đang chờ MC Chủ phòng công bố kết quả Đúng / Sai...
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onDispatch({
                  type: 'TB_SUBMIT',
                  position: myPosition,
                  answer: tbAnswer,
                  clientId,
                });
                setTbAnswer('');
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={tbAnswer}
                onChange={(e) => setTbAnswer(e.target.value)}
                placeholder={`[${
                  roomState.seats[myPosition - 1].name
                }] Nhập đáp án tự luận Câu hỏi phụ...`}
                className="flex-1 px-4 py-3 bg-slate-950 border-2 border-amber-400 rounded-xl text-white text-sm"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-3 text-sm font-bold text-slate-950 bg-amber-400 rounded-xl cursor-pointer"
              >
                Gửi đáp án
              </button>
            </form>
          )
        ) : (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-sm text-slate-300">
            {roomState.tieBreaker.pendingAnswer !== undefined &&
            roomState.tieBreaker.pendingAnswer !== null ? (
              <span>
                <strong>
                  {
                    roomState.seats[
                      (roomState.tieBreaker.buzzedPosition || 1) - 1
                    ].name
                  }
                </strong>{' '}
                đã gửi câu trả lời:{' '}
                <strong className="font-mono text-amber-300">
                  "{roomState.tieBreaker.pendingAnswer}"
                </strong>
                . Đang chờ MC Chủ phòng chấm điểm...
              </span>
            ) : (
              <span>
                Đang chờ{' '}
                <strong>
                  {
                    roomState.seats[
                      (roomState.tieBreaker.buzzedPosition || 1) - 1
                    ].name
                  }
                </strong>{' '}
                nhập đáp án câu hỏi phụ...
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  if (roomState.stage === 'GAME_OVER' && champion) {
    return (
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
              <Trophy className="w-4 h-4" />
              LỄ TRAO VÒNG NGUYỆT QUẾ ĐƯỜNG LÊN ĐỈNH OLYMPIA
            </div>

            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              Quán Quân: {champion.name} ({champion.score} điểm)
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Xin chúc mừng Nhà Leo Núi <strong>{champion.name}</strong> (Vị trí
              số {champion.position} — {champion.school}) đã xuất sắc dẫn đầu
              đoàn leo núi và trở thành chủ nhân của chiếc Vòng Nguyệt Quế vinh
              quang!
            </p>

            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-400 uppercase">
                Bảng xếp hạng chung cuộc cả 4 Nhà Leo Núi:
              </div>
              {sortedStandings.map((climber, idx) => (
                <div
                  key={climber.position}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    idx === 0
                      ? 'bg-amber-400/15 border-amber-400'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-lg font-mono text-sm font-extrabold flex items-center justify-center ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-base font-bold text-white flex items-center gap-2">
                        <span>
                          Vị trí {climber.position}: {climber.name}
                        </span>
                        {idx === 0 && (
                          <Award className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {climber.school}
                      </div>
                    </div>
                  </div>

                  <div className="font-mono font-extrabold text-2xl text-white tabular-nums">
                    {climber.score} điểm
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              {isHost ? (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playRoundStart();
                    onDispatch({ type: 'RESET_ROOM', clientId });
                  }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer whitespace-nowrap shrink-0 shadow-lg active:scale-95 transition-transform"
                >
                  <RotateCcw className="w-4 h-4" />
                  Quay về Phòng Chờ Thi Đấu Lại
                </button>
              ) : (
                <div className="text-xs text-slate-400">
                  Đang chờ MC Chủ Phòng bấm "Quay về Phòng Chờ Thi Đấu Lại"...
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-2xl bg-slate-950">
              <img
                src={laurelWreathImg}
                alt="Vòng Nguyệt Quế Vinh Quang"
                referrerPolicy="no-referrer"
                className="w-full aspect-square object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
