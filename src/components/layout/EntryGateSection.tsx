import React from 'react';
import {
  Database,
  FileSpreadsheet,
  Lock,
  PlusCircle,
  LogIn,
  ArrowLeft,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import type {
  DeckSelectionConfig,
  QuestionBankStats,
} from '../CsvQuestionBankModal.tsx';
import type { AdminUser } from '../AdminLoginModal.tsx';
import laurelWreathImg from '../../assets/images/olympia_laurel_wreath_1794066591261.jpg';

interface EntryGateSectionProps {
  myProfileName: string;
  setMyProfileName: (val: string) => void;
  myProfileSchool: string;
  setMyProfileSchool: (val: string) => void;
  entryError: string;
  setEntryError: (val: string) => void;
  entryMode: 'CHOOSE' | 'JOIN_INPUT';
  setEntryMode: (mode: 'CHOOSE' | 'JOIN_INPUT') => void;
  joinCodeInput: string;
  setJoinCodeInput: (val: string) => void;
  isCreatingOrJoining: boolean;
  bankStats: QuestionBankStats | null;
  deckConfig: DeckSelectionConfig;
  adminUser: AdminUser | null;
  onProtectedDeckAction: (action: 'OPEN_BANK' | 'REROLL_DECK') => void;
  onCreateRoom: () => void;
  onStartDemoMatch: () => void;
  onStartSoloPractice: () => void;
  onJoinRoom: (e: React.FormEvent) => void;
}

export const EntryGateSection: React.FC<EntryGateSectionProps> = ({
  myProfileName,
  setMyProfileName,
  myProfileSchool,
  setMyProfileSchool,
  entryError,
  setEntryError,
  entryMode,
  setEntryMode,
  joinCodeInput,
  setJoinCodeInput,
  isCreatingOrJoining,
  bankStats,
  deckConfig,
  adminUser,
  onProtectedDeckAction,
  onCreateRoom,
  onStartDemoMatch,
  onStartSoloPractice,
  onJoinRoom,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch py-2">
      <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <div className="text-xs font-bold text-amber-400 tracking-wide uppercase">
            ĐẤU TRƯỜNG TRỰC TUYẾN OLYMPIA · 1 MC CHỦ PHÒNG + 4 NHÀ LEO NÚI
          </div>
          <h1
            className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight"
            style={{ textWrap: 'balance' }}
          >
            Tạo Phòng (MC Chủ Phòng) Hoặc Tham Gia Thi Đấu
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Người nhấn <strong className="text-amber-300">Tạo Phòng</strong> sẽ
            đóng vai trò là{' '}
            <strong className="text-amber-300">MC Chủ Phòng duy nhất</strong>{' '}
            (nắm toàn quyền điều phối chuyển lượt, mở câu hỏi, xem trước đáp án
            từng câu và quyết định chấm ĐÚNG / SAI để cộng/trừ điểm cho 4 thí
            sinh). 4 người chơi nhấn{' '}
            <strong className="text-sky-300">Tham Gia Phòng</strong> sẽ vào 4 Vị
            trị xuất phát 1, 2, 3, 4!
          </p>
        </div>

        <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
          <div className="text-xs font-bold text-slate-300 uppercase">
            1. Nhập thông tin của bạn (MC Chủ Phòng hoặc Nhà Leo Núi)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                Họ và tên <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={myProfileName}
                onChange={(e) => {
                  setMyProfileName(e.target.value);
                  if (entryError) setEntryError('');
                }}
                placeholder="Ví dụ: MC Khánh Vy / Nguyễn Minh Quân..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                Trường THPT / Đơn vị công tác
              </label>
              <input
                type="text"
                value={myProfileSchool}
                onChange={(e) => setMyProfileSchool(e.target.value)}
                placeholder="Ví dụ: THPT Chuyên Quốc Học / Ban Tổ Chức..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {entryError && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-lg text-xs font-semibold text-rose-200">
              {entryError}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase">
              <Database className="w-3.5 h-3.5" />
              Bộ đề câu hỏi từ Backend CSV (
              {(bankStats?.totalQuestions ?? 21639).toLocaleString('vi-VN')} câu ·{' '}
              {bankStats?.totalMatches ?? 424} trận)
            </div>
            <div className="text-xs font-semibold text-white">
              Chế độ đang chọn:{' '}
              <span className="text-amber-300">
                {deckConfig.mode === 'CSV_RANDOM'
                  ? `Trộn ngẫu nhiên từ Kho CSV${
                      deckConfig.subjectFilter
                        ? ` (Môn: ${deckConfig.subjectFilter})`
                        : ''
                    }`
                  : deckConfig.mode === 'CSV_MATCH'
                    ? `Đề thi chuẩn Olympia Mùa ${
                        deckConfig.season || '25'
                      } — ${deckConfig.match || 'Tuần 1 - Tháng 1 - Quý 1'}`
                    : 'Bộ đề mẫu kinh điển mặc định'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onProtectedDeckAction('OPEN_BANK')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-400/15 hover:bg-emerald-400/25 text-emerald-300 border border-emerald-400/50 rounded-lg cursor-pointer shrink-0"
          >
            {adminUser ? (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            {adminUser
              ? 'Đổi Bộ Đề / Tải Lên File CSV Lớn'
              : 'Đổi Bộ Đề / Chọn Đề (Cần Đăng Nhập BTC)'}
          </button>
        </div>

        {entryMode === 'CHOOSE' ? (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase">
              2. Chọn vai trò vào phòng thi đấu
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                disabled={isCreatingOrJoining}
                onClick={onCreateRoom}
                className="p-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-left transition-transform active:scale-95 flex flex-col justify-between gap-3 shadow-lg cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-extrabold uppercase tracking-wider">
                    Vai trò: MC Chủ Phòng Duy Nhất
                  </span>
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-xl">
                    Tạo Phòng Mới (Làm MC)
                  </div>
                  <div className="text-xs font-medium text-slate-800 mt-0.5">
                    Bạn làm MC điều phối trận đấu, biết trước đáp án và chấm
                    Đúng/Sai cho 4 thí sinh tham gia
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled={isCreatingOrJoining}
                onClick={() => {
                  setEntryError('');
                  setEntryMode('JOIN_INPUT');
                }}
                className="p-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-sky-400/60 text-white text-left transition-transform active:scale-95 flex flex-col justify-between gap-3 shadow-lg cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
                    Vai trò: Nhà Leo Núi (Vị trí 1–4)
                  </span>
                  <LogIn className="w-6 h-6 text-sky-300" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-xl">
                    Tham Gia Thi Đấu
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Nhập mã phòng từ MC Chủ phòng để vào 1 trong 4 vị trí xuất
                    phát còn trống
                  </div>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={isCreatingOrJoining}
                onClick={onStartSoloPractice}
                className="py-3.5 px-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border-2 border-sky-400 text-sky-200 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-sky-300 shrink-0" />
                <span>Chế Độ Ôn Tập 1 Người (Máy Tự Chấm · Không Có MC)</span>
              </button>

              
            </div>
          </div>
        ) : (
          <div className="p-5 bg-slate-950 border-2 border-sky-400/60 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-300 uppercase">
                NHẬP MÃ PHÒNG ĐỂ THAM GIA THI ĐẤU (VỊ TRÍ 1 - 4)
              </span>
              <button
                type="button"
                onClick={() => {
                  setEntryError('');
                  setEntryMode('CHOOSE');
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
              </button>
            </div>

            <form onSubmit={onJoinRoom} className="flex flex-wrap gap-3">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="Nhập Mã Phòng (VD: K8M4P2)..."
                maxLength={10}
                className="flex-1 px-4 py-3 bg-slate-900 border border-sky-400 rounded-xl font-mono text-lg font-extrabold text-amber-300 uppercase tracking-widest focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={isCreatingOrJoining}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-extrabold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl cursor-pointer shrink-0"
              >
                <LogIn className="w-4 h-4" />
                Vào Phòng Ngay
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-5">
        <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-4/3 bg-slate-950">
          <img
            src={laurelWreathImg}
            alt="Vòng Nguyệt Quế Đường Lên Đỉnh Olympia"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-5">
            <div className="text-xs font-semibold text-amber-300">
              1 MC CHỦ PHÒNG ĐIỀU PHỐI · 4 NHÀ LEO NÚI TRANH TÀI
            </div>
            <div className="text-xl font-display font-extrabold text-white">
              MC Độc Quyền Xem Đáp Án & Chấm Điểm Đúng Luật
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
