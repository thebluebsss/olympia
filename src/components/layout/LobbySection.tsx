import React from 'react';
import {
  Users,
  Check,
  Copy,
  Crown,
  Database,
  RefreshCw,
  Lock,
  FileSpreadsheet,
  UserCheck,
  ArrowLeft,
  Sparkles,
  Play,
} from 'lucide-react';
import type { OlympiaRoomState, ClientAction } from '../../types/olympia.ts';
import type { AdminUser } from '../AdminLoginModal.tsx';
import { soundFX } from '../../utils/soundEffects.ts';

interface LobbySectionProps {
  roomCode: string;
  roomState: OlympiaRoomState;
  clientId: string;
  isHost: boolean;
  canHostStartMatch: boolean;
  occupiedSeatsCount: number;
  wsConnected: boolean;
  copiedCode: boolean;
  copiedLink: boolean;
  isApplyingDeck: boolean;
  adminUser: AdminUser | null;
  myProfileName: string;
  myProfileSchool: string;
  onCopyRoomCode: () => void;
  onCopyInviteLink: () => void;
  onLeaveRoom: () => void;
  onProtectedDeckAction: (action: 'OPEN_BANK' | 'REROLL_DECK') => void;
  onDispatch: (action: ClientAction) => void;
}

export const LobbySection: React.FC<LobbySectionProps> = ({
  roomCode,
  roomState,
  clientId,
  isHost,
  canHostStartMatch,
  occupiedSeatsCount,
  wsConnected,
  copiedCode,
  copiedLink,
  isApplyingDeck,
  adminUser,
  myProfileName,
  myProfileSchool,
  onCopyRoomCode,
  onCopyInviteLink,
  onLeaveRoom,
  onProtectedDeckAction,
  onDispatch,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
            <Users className="w-4 h-4" />
            <span>
              PHÒNG CHỜ THI ĐẤU TRỰC TUYẾN (1 MC CHỦ PHÒNG + 4 NHÀ LEO NÚI)
            </span>
            <span>·</span>
            <span className="text-emerald-400">
              {wsConnected
                ? 'Đã kết nối Socket thời gian thực'
                : 'Đang đồng bộ...'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Mã Phòng:{' '}
            <span className="font-mono text-amber-300 tracking-wider">
              {roomCode}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Gửi Mã Phòng{' '}
            <strong className="font-mono text-white">{roomCode}</strong> (hoặc
            Link mời) cho 4 người chơi để vào 4 vị trí xuất phát (Số 1, 2, 3,
            4). Người tạo phòng là <strong>MC Chủ Phòng</strong> điều phối độc
            lập.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-right">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">
              SỐ THÍ SINH TRONG PHÒNG
            </div>
            <div
              className={`font-mono font-extrabold text-xl tabular-nums ${
                occupiedSeatsCount === 4 ? 'text-emerald-400' : 'text-amber-300'
              }`}
            >
              {occupiedSeatsCount} / 4 Nhà Leo Núi
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onCopyRoomCode}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Đã chép Mã: {roomCode}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Sao chép Mã Phòng
                </>
              )}
            </button>

            <button
              onClick={onCopyInviteLink}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Đã chép
                  Link mời
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Sao chép Link mời
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`p-5 rounded-2xl border-2 flex flex-wrap items-center justify-between gap-4 ${
          isHost
            ? 'bg-amber-500/10 border-amber-400 shadow-lg'
            : 'bg-slate-950/90 border-amber-500/40'
        }`}
      >
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
            <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
            BÀN ĐIỀU PHỐI MC CHỦ PHÒNG (ĐỘC QUYỀN ĐIỀU KHIỂN & CHẤM ĐIỂM)
          </div>
          <div className="text-lg font-display font-extrabold text-white flex items-center gap-2">
            <span>
              MC Chủ Phòng: {roomState.hostName || 'Chủ Phòng Olympia'}
            </span>
            {isHost && (
              <span className="px-2.5 py-0.5 text-xs font-extrabold rounded bg-amber-400 text-slate-950">
                BẠN ĐANG LÀ MC CHỦ PHÒNG
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 max-w-3xl">
            • MC Chủ phòng không ngồi vào 4 ghế thí sinh mà nắm giữ{' '}
            <strong>Bảng Điều Phối Độc Quyền</strong>: bấm mở câu hỏi, chuyển
            lượt, chuyển phần thi, xem trước đáp án chính thức của từng câu hỏi
            và trực tiếp bấm <strong>ĐÚNG / SAI</strong> để cộng hoặc trừ điểm
            cho 4 Nhà Leo Núi theo đúng luật Đường Lên Đỉnh Olympia.
          </p>
        </div>

        <div className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 shrink-0">
          <div className="font-bold text-amber-300 uppercase">
            Quyền hạn MC Chủ Phòng:
          </div>
          <div className="text-slate-300">
            ✓ Biết trước đáp án & giải thích mọi câu hỏi
          </div>
          <div className="text-slate-300">
            ✓ Quyết định Đúng/Sai để cộng hoặc trừ điểm
          </div>
          <div className="text-slate-300">
            ✓ Duy nhất có quyền chuyển câu, chuyển lượt, qua vòng
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
            <Database className="w-3.5 h-3.5" />
            <span>BỘ ĐỀ CÂU HỎI ĐANG ÁP DỤNG CHO PHÒNG {roomCode}</span>
          </div>
          <div className="text-sm font-bold text-white">
            {roomState.questionDeck?.label ||
              'Ngân hàng CSV Olympia (Trộn ngẫu nhiên)'}
          </div>
          <div className="text-xs text-slate-400">
            Gồm 24 câu Khởi Động Cá Nhân · 12 câu Khởi Động Chung ·{' '}
            {roomState.questionDeck?.obstaclePuzzles?.length || 1} bộ VCNV · 4
            câu Tăng Tốc · 16 câu Về Đích (20đ/30đ)
          </div>
        </div>

        {isHost && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isApplyingDeck}
              onClick={() => onProtectedDeckAction('REROLL_DECK')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl cursor-pointer"
            >
              {adminUser ? (
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isApplyingDeck ? 'animate-spin text-amber-400' : ''
                  }`}
                />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              {adminUser
                ? 'Đổi Ngẫu Nhiên Đề Mới'
                : 'Đổi Đề Mới (Cần Quyền BTC)'}
            </button>

            <button
              type="button"
              onClick={() => onProtectedDeckAction('OPEN_BANK')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-400 text-slate-950 hover:bg-emerald-300 rounded-xl cursor-pointer"
            >
              {adminUser ? (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              {adminUser
                ? 'Chọn Trận CSV / Tải File CSV Khác'
                : 'Chọn Đề Thi CSV (Cần Đăng Nhập)'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-300 uppercase">
            Sơ đồ 4 Vị Trí Nhà Leo Núi (Dành cho 4 thí sinh tham gia phòng)
          </h3>
          <span className="text-xs text-slate-400">
            {occupiedSeatsCount < 4
              ? `Cần thêm ${4 - occupiedSeatsCount} Nhà Leo Núi nữa để MC Chủ phòng bắt đầu cuộc thi`
              : 'Đã đủ 4/4 vị trí thi đấu! Sẵn sàng xuất phát!'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roomState.seats.map((seat) => {
            const pos = seat.position;
            const isOccupied = Boolean(seat.claimedByClientId);
            const isMine = seat.claimedByClientId === clientId;

            return (
              <div
                key={pos}
                className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                  isMine
                    ? 'bg-amber-500/10 border-2 border-amber-400 shadow-md'
                    : isOccupied
                      ? 'bg-sky-950/30 border border-sky-500/50'
                      : 'bg-slate-950/80 border border-dashed border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-xs px-2.5 py-1 rounded bg-slate-800 text-amber-300">
                      VỊ TRÍ SỐ {pos}
                    </span>

                    {isOccupied && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-300">
                        Nhà Leo Núi {pos}
                      </span>
                    )}
                  </div>

                  {isOccupied ? (
                    <div className="space-y-1">
                      <div className="text-lg font-display font-extrabold text-white flex items-center gap-2">
                        <span className="truncate">{seat.name}</span>
                        {isMine && (
                          <span className="text-xs font-semibold text-amber-300 shrink-0">
                            (Bạn)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {seat.school}
                      </div>
                      <div className="pt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <UserCheck className="w-3.5 h-3.5" />
                        Đã vào vị trí · Sẵn sàng
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 space-y-1 text-center">
                      <div className="text-sm font-bold text-slate-400">
                        Vị trí đang trống
                      </div>
                      <div className="text-xs text-slate-500">
                        Đang chờ thí sinh tham gia...
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  {isHost ? (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">
                        [MC] Đổi chỗ hoặc Kick vị trí {pos}:
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {([1, 2, 3, 4] as const)
                          .filter((otherPos) => otherPos !== pos)
                          .map((otherPos) => (
                            <button
                              key={otherPos}
                              type="button"
                              onClick={() => {
                                soundFX.playTick();
                                onDispatch({
                                  type: 'MC_SWAP_SEATS',
                                  posA: pos,
                                  posB: otherPos,
                                  clientId,
                                });
                              }}
                              className="py-1.5 px-2 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-sky-900/60 text-sky-300 border border-slate-700 hover:border-sky-400/50 cursor-pointer transition-colors"
                            >
                              ⇄ Đổi VT {otherPos}
                            </button>
                          ))}
                      </div>
                      {isOccupied && (
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playWrong();
                            onDispatch({
                              type: 'MC_KICK_PLAYER',
                              position: pos,
                              clientId,
                            });
                          }}
                          className="w-full py-1.5 px-3 rounded-lg text-xs font-extrabold bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-300 border border-rose-500/40 cursor-pointer transition-colors"
                        >
                          ✕ Kick "{seat.name}" khỏi phòng
                        </button>
                      )}
                    </div>
                  ) : isMine ? (
                    <div className="text-xs text-amber-300 font-semibold text-center">
                      Bạn đang đứng ở Vị trí số {pos}
                    </div>
                  ) : !isOccupied ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playBuzzer();
                        onDispatch({
                          type: 'CLAIM_SEAT',
                          position: pos,
                          name: myProfileName.trim() || `Nhà Leo Núi ${pos}`,
                          school: myProfileSchool.trim() || 'THPT Chuyên',
                          clientId,
                        });
                      }}
                      className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 cursor-pointer"
                    >
                      Chuyển sang Vị trí {pos}
                    </button>
                  ) : (
                    <div className="text-xs text-slate-400 text-center">
                      Vị trí của {seat.name}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onLeaveRoom}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Rời Phòng
          </button>

          {isHost && occupiedSeatsCount < 4 && (
            <button
              type="button"
              onClick={() => {
                soundFX.playBuzzer();
                onDispatch({ type: 'FILL_DEMO_BOTS', clientId });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-500/50 rounded-xl cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Điền {4 - occupiedSeatsCount} Nhà Leo Núi Tự Động (Đủ 4/4 Để MC
              Điều Phối Ngay)
            </button>
          )}
        </div>

        {isHost ? (
          <div className="flex flex-col items-end gap-1.5">
            <button
              type="button"
              disabled={!canHostStartMatch}
              onClick={() => {
                if (!canHostStartMatch) return;
                soundFX.playRoundStart();
                onDispatch({
                  type: 'START_MATCH',
                  clientId,
                  targetStage: 'ROUND_1_KHOI_DONG',
                });
              }}
              className={`inline-flex items-center gap-2.5 px-7 py-4 text-sm sm:text-base font-extrabold rounded-xl transition-all ${
                canHostStartMatch
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {canHostStartMatch ? (
                <>
                  <Play className="w-5 h-5 fill-slate-950" />
                  [MC] Đủ 4/4 Thí Sinh · Bắt Đầu Trận Thi Đấu Ngay!
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  Đang chờ đủ 4 Nhà Leo Núi ({occupiedSeatsCount}/4 người)...
                </>
              )}
            </button>
            {!canHostStartMatch && (
              <span className="text-[11px] text-slate-400">
                Bạn là MC Chủ phòng. Hãy mời đủ 4 người chơi (hoặc bấm Điền Nhà
                Leo Núi Tự Động) để mở khóa nút Bắt Đầu.
              </span>
            )}
          </div>
        ) : (
          <div className="px-5 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-sky-300">
            {occupiedSeatsCount < 4
              ? `Đang chờ đủ 4 Nhà Leo Núi (${occupiedSeatsCount}/4 người) và chờ MC Chủ phòng bắt đầu...`
              : 'Đã đủ 4/4 Nhà Leo Núi! Đang chờ MC Chủ phòng nhấn Bắt Đầu Trận Thi Đấu...'}
          </div>
        )}
      </div>
    </div>
  );
};
