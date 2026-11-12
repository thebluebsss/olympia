import React from 'react';
import type { BuzzerEntry } from '../../types/olympia.ts';

interface BuzzerQueuePanelProps {
  entries?: BuzzerEntry[];
  queue?: BuzzerEntry[];
  selectedPosition: 1 | 2 | 3 | 4 | null;
  isHost: boolean;
  title?: string;
  subtitle?: string;
  selectedBadgeLabel?: string;
  onSelectWinner: (position: 1 | 2 | 3 | 4) => void;
}

export const BuzzerQueuePanel: React.FC<BuzzerQueuePanelProps> = ({
  entries,
  queue,
  selectedPosition,
  isHost,
  title = '📊 BẢNG TÍN HIỆU CHUÔNG (XẾP THEO THỜI GIAN TỪ THẤP NHẤT):',
  subtitle = 'MC có thể bấm chọn thí sinh có thời gian thấp nhất để trả lời',
  selectedBadgeLabel = 'ĐANG TRẢ LỜI',
  onSelectWinner,
}) => {
  const list = entries ?? queue;
  if (!list || list.length === 0) return null;

  return (
    <div className="p-4 bg-slate-950/95 border border-amber-400/50 rounded-xl space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
          {title}
        </span>
        <span className="text-[11px] text-slate-400">{subtitle}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {list.map((entry, idx) => {
          const isSelected = selectedPosition === entry.position;
          return (
            <div
              key={entry.position}
              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={`px-2 py-0.5 rounded font-mono font-extrabold text-[11px] ${
                    idx === 0
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  #{idx + 1} · {entry.elapsedSec.toFixed(2)}s
                </span>
                <span className="font-bold truncate">
                  Vị trí {entry.position}: {entry.name}
                </span>
              </div>
              <div className="shrink-0">
                {isSelected ? (
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-extrabold text-[10px]">
                    {selectedBadgeLabel}
                  </span>
                ) : isHost ? (
                  <button
                    type="button"
                    onClick={() => onSelectWinner(entry.position)}
                    className="px-2.5 py-1 rounded bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-[10px] cursor-pointer"
                  >
                    [MC] Chọn trả lời
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
