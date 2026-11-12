import React from 'react';
import { ClimberSeat } from '../types/olympia';
import { Bell, Lock, Star, UserCheck } from 'lucide-react';

interface ContestantScoreboardProps {
  seats: [ClimberSeat, ClimberSeat, ClimberSeat, ClimberSeat];
  myPositions: (1 | 2 | 3 | 4)[];
  activePosition?: 1 | 2 | 3 | 4 | null;
  buzzedPosition?: 1 | 2 | 3 | 4 | null;
  starPosition?: 1 | 2 | 3 | 4 | null;
}

export const ContestantScoreboard: React.FC<ContestantScoreboardProps> = ({
  seats,
  myPositions,
  activePosition,
  buzzedPosition,
  starPosition,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {seats.map((seat) => {
        const isActive = activePosition === seat.position;
        const isBuzzed = buzzedPosition === seat.position;
        const hasStar = starPosition === seat.position;
        const isMine = myPositions.includes(seat.position);

        return (
          <div
            key={seat.position}
            className={`relative rounded-xl px-4 py-3 border transition-all flex items-center justify-between gap-3 ${
              isBuzzed
                ? 'bg-amber-500/20 border-amber-400 shadow-md'
                : isActive
                ? 'bg-sky-950/80 border-sky-400 shadow-sm'
                : 'bg-slate-900/90 border-slate-800'
            } ${seat.vcnvLocked ? 'opacity-60' : ''}`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                <span className="font-mono font-semibold text-slate-300">
                  Vị trí {seat.position}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{seat.school}</span>
              </div>

              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span
                  className={`font-display font-bold text-base truncate ${
                    isActive
                      ? 'text-sky-300'
                      : isMine
                      ? 'text-amber-300'
                      : 'text-white'
                  }`}
                >
                  {seat.name}
                </span>

                {isMine && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 shrink-0"
                    title="Vị trí của bạn trên thiết bị này"
                  >
                    <UserCheck className="w-3 h-3" />
                    Bạn
                  </span>
                )}

                {isActive && (
                  <span className="text-[11px] font-bold text-sky-300 shrink-0">
                    · Đang thi
                  </span>
                )}

                {hasStar && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    x2
                  </span>
                )}

                {isBuzzed && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 shrink-0">
                    <Bell className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    Giành quyền
                  </span>
                )}

                {seat.vcnvLocked && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                    Khóa VCNV
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-mono font-bold text-2xl sm:text-3xl tracking-tight text-white tabular-nums">
                {seat.score}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                ĐIỂM SỐ
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
