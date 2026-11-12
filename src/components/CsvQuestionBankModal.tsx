import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Database,
  Upload,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Sparkles,
  Filter,
  ChevronLeft,
  ChevronRight,
  Play,
  Layers,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';
import type { QuestionDeckMode, RoomQuestionDeck } from '../types/olympia';

export interface QuestionBankStats {
  totalQuestions: number;
  totalMatches: number;
  byRound: Record<string, number>;
  bySubject: Record<string, number>;
  bySeason: Record<string, number>;
  seasonsList: {
    season: string;
    questionCount: number;
    matches: string[];
  }[];
  uploadHistory: {
    fileName: string;
    mode: 'merge' | 'replace';
    totalRowsParsed: number;
    validQuestionsConverted: number;
    skippedMalformedCount: number;
    totalBankSizeAfter: number;
    timestamp: string;
  }[];
}

interface BankQuestionRecord {
  qid: string;
  season: string;
  match: string;
  round: 'KD' | 'VCNV' | 'TT' | 'VD';
  subCode: string;
  subjectRaw: string;
  categoryVi: string;
  question: string;
  officialAnswer: string;
  acceptedAnswers: string[];
  explanation: string;
  points?: 20 | 30;
  sourceFile: string;
}

export interface DeckSelectionConfig {
  mode: QuestionDeckMode;
  season: string;
  match: string;
  subjectFilter: string;
}

interface CsvQuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  inRoom: boolean;
  roomCode: string;
  isHost: boolean;
  adminToken?: string | null;
  currentDeck?: RoomQuestionDeck;
  deckConfig: DeckSelectionConfig;
  onChangeDeckConfig: (cfg: DeckSelectionConfig) => void;
  onApplyDeckToRoom?: (cfg: DeckSelectionConfig) => Promise<void>;
  onStatsUpdated?: (stats: QuestionBankStats) => void;
}

export const CsvQuestionBankModal: React.FC<CsvQuestionBankModalProps> = ({
  isOpen,
  onClose,
  inRoom,
  roomCode,
  isHost,
  adminToken,
  currentDeck,
  deckConfig,
  onChangeDeckConfig,
  onApplyDeckToRoom,
  onStatsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'UPLOAD_CONVERT' | 'BROWSE_SEARCH' | 'SELECT_DECK'>(
    'UPLOAD_CONVERT'
  );
  const [stats, setStats] = useState<QuestionBankStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const [uploadMode, setUploadMode] = useState<'merge' | 'replace'>('merge');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [lastReport, setLastReport] = useState<{
    fileName: string;
    mode: 'merge' | 'replace';
    totalRowsParsed: number;
    validQuestionsConverted: number;
    skippedMalformedCount: number;
    totalBankSizeAfter: number;
    byRound: Record<string, number>;
    bySubject: Record<string, number>;
    sampleConverted: BankQuestionRecord[];
  } | null>(null);
  const [rawCsvPaste, setRawCsvPaste] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSeason, setFilterSeason] = useState<string>('');
  const [filterMatch, setFilterMatch] = useState<string>('');
  const [filterRound, setFilterRound] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [searchPage, setSearchPage] = useState<number>(1);
  const [searchResults, setSearchResults] = useState<{
    total: number;
    page: number;
    totalPages: number;
    items: BankQuestionRecord[];
  }>({ total: 0, page: 1, totalPages: 1, items: [] });
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [isApplyingDeck, setIsApplyingDeck] = useState<boolean>(false);
  const [deckAppliedSuccess, setDeckAppliedSuccess] = useState<boolean>(false);

  const onStatsUpdatedRef = useRef(onStatsUpdated);
  onStatsUpdatedRef.current = onStatsUpdated;

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/questions/stats');
      const data = await res.json();
      if (data && typeof data.totalQuestions === 'number') {
        setStats(data);
        onStatsUpdatedRef.current?.(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchSearchResults = useCallback(async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (filterSeason) params.set('season', filterSeason);
      if (filterMatch) params.set('match', filterMatch);
      if (filterRound) params.set('round', filterRound);
      if (filterSubject) params.set('subject', filterSubject);
      params.set('page', String(searchPage));
      params.set('limit', '15');

      const res = await fetch(`/api/questions/search?${params.toString()}`, {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
      });
      const data = await res.json();
      if (data && Array.isArray(data.items)) setSearchResults(data);
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, filterSeason, filterMatch, filterRound, filterSubject, searchPage, adminToken]);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, fetchStats]);

  useEffect(() => {
    if (isOpen) {
      fetchSearchResults();
    }
  }, [isOpen, fetchSearchResults]);

  const processAndUploadCsvFile = async (file: File) => {
    setUploadError('');
    setIsUploading(true);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setUploadProgressText(
      `Đang đọc file "${file.name}" (${sizeMB} MB) và gửi lên Backend để phân tích & convert...`
    );

    try {
      const csvText = await file.text();
      const res = await fetch(
        `/api/questions/upload-csv?fileName=${encodeURIComponent(file.name)}&mode=${uploadMode}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
          body: csvText,
        }
      );
      const data = await res.json();
      if (!res.ok || data?.error) {
        setUploadError(data?.error || 'Không thể convert file CSV.');
      } else if (data?.report) {
        setLastReport(data.report);
        if (data.stats) {
          setStats(data.stats);
          onStatsUpdated?.(data.stats);
        }
        fetchSearchResults();
      }
    } catch {
      setUploadError('Lỗi kết nối khi tải file CSV lên máy chủ. Vui lòng kiểm tra lại định dạng file.');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAndUploadCsvFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasteCsvConvert = async () => {
    if (!rawCsvPaste.trim()) {
      setUploadError('Vui lòng dán nội dung CSV vào ô bên dưới trước khi nhấn Convert.');
      return;
    }
    setUploadError('');
    setIsUploading(true);
    setUploadProgressText('Đang phân tích và chuyển đổi dữ liệu CSV...');

    try {
      const res = await fetch('/api/questions/upload-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          csvText: rawCsvPaste,
          fileName: 'pasted_questions.csv',
          mode: uploadMode,
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setUploadError(data?.error || 'Không thể convert nội dung CSV.');
      } else if (data?.report) {
        setLastReport(data.report);
        setRawCsvPaste('');
        if (data.stats) {
          setStats(data.stats);
          onStatsUpdated?.(data.stats);
        }
        fetchSearchResults();
      }
    } catch {
      setUploadError('Không thể gửi dữ liệu CSV lên máy chủ.');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  const handleResetDefaultBank = async () => {
    setIsUploading(true);
    setUploadError('');
    try {
      const res = await fetch('/api/questions/reset-default', {
        method: 'POST',
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
      });
      const data = await res.json();
      if (data?.stats) {
        setStats(data.stats);
        onStatsUpdated?.(data.stats);
      }
      if (data?.report) setLastReport(data.report);
      fetchSearchResults();
    } catch {
      setUploadError('Không thể khôi phục kho câu hỏi mặc định.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyDeck = async () => {
    if (!onApplyDeckToRoom) return;
    setIsApplyingDeck(true);
    setDeckAppliedSuccess(false);
    try {
      await onApplyDeckToRoom(deckConfig);
      setDeckAppliedSuccess(true);
      setTimeout(() => setDeckAppliedSuccess(false), 3000);
    } finally {
      setIsApplyingDeck(false);
    }
  };

  if (!isOpen) return null;

  const selectedSeasonObj = stats?.seasonsList.find((s) => s.season === deckConfig.season);
  const availableMatchesForDeck = selectedSeasonObj?.matches || [];
  const filterSeasonObj = stats?.seasonsList.find((s) => s.season === filterSeason);
  const availableMatchesForFilter = filterSeasonObj?.matches || [];

  const summaryCards = stats
    ? [
        {
          label: 'Tổng số câu hỏi',
          value: stats.totalQuestions.toLocaleString('vi-VN'),
          color: 'text-amber-300',
          sub: 'Đã nạp trên Backend',
        },
        {
          label: 'Số trận / Bộ đề',
          value: `${stats.totalMatches} bộ`,
          color: 'text-sky-300',
          sub: 'Mùa O19 → O26 + Mới',
        },
        {
          label: 'Vòng 1: Khởi Động (KD)',
          value: (stats.byRound.KD || 0).toLocaleString('vi-VN'),
          color: 'text-white',
          sub: 'Cá nhân A1..A4 & Chung B',
        },
        {
          label: 'Vòng 2: VCNV',
          value: (stats.byRound.VCNV || 0).toLocaleString('vi-VN'),
          color: 'text-emerald-300',
          sub: 'Bộ đề & Hàng ngang',
        },
        {
          label: 'Vòng 3: Tăng Tốc (TT)',
          value: (stats.byRound.TT || 0).toLocaleString('vi-VN'),
          color: 'text-amber-300',
          sub: '4 câu tư duy 15s–30s',
        },
        {
          label: 'Vòng 4: Về Đích (VD)',
          value: (stats.byRound.VD || 0).toLocaleString('vi-VN'),
          color: 'text-white',
          sub: 'Gói 20đ · 30đ & Câu hỏi phụ',
        },
      ]
    : [];

  return (
    <div className="bg-slate-900 border-2 border-amber-400/70 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
            <Database className="w-4 h-4" />
            HỆ THỐNG BACKEND XỬ LÝ & CONVERT DỮ LIỆU CÂU HỎI CSV DUNG LƯỢNG LỚN
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Kho Dữ Liệu Câu Hỏi Olympia (
            {stats ? stats.totalQuestions.toLocaleString('vi-VN') : '21.640+'} Câu Hỏi)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Backend đã tự động nạp và convert file{' '}
            <code className="font-mono text-amber-300">questions_7b1e9b9b.csv</code> (
            {stats ? stats.totalMatches : 424} trận đấu Olympia Mùa 19–26). Bạn có thể tải thêm file
            CSV, tra cứu, xuất file CSV mới hoặc chọn bộ đề cho trận đấu!
          </p>
        </div>

        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl cursor-pointer"
        >
          <X className="w-4 h-4" />
          Đóng Bảng Dữ Liệu
        </button>
      </div>

      {/* Live Backend Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {summaryCards.map((c) => (
            <div key={c.label} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">{c.label}</div>
              <div className={`font-mono font-extrabold text-xl ${c.color} mt-0.5`}>{c.value}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* 3 Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('UPLOAD_CONVERT')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'UPLOAD_CONVERT'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            1. Tải File CSV Lớn & Convert Sang Data Câu Hỏi
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BROWSE_SEARCH')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'BROWSE_SEARCH'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            2. Tra Cứu & Kiểm Tra Kho Câu Hỏi Đã Convert
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SELECT_DECK')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'SELECT_DECK'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            3. Chọn Bộ Đề Thi Đấu Từ Kho CSV Cho Phòng
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/assets/aistudio/olympia_new_questions.csv"
            download="olympia_new_questions.csv"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-xl cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Tải CSV Câu Hỏi Mới (Chuẩn 7 cột)
          </a>

          <a
            href={`/api/questions/export-csv?onlyNew=0${
              adminToken ? `&token=${encodeURIComponent(adminToken)}` : ''
            }`}
            download="olympia_questions_full_export.csv"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 rounded-xl cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Toàn Bộ Kho CSV
          </a>

          <a
            href={`/api/questions/export-json?limit=5000${
              adminToken ? `&token=${encodeURIComponent(adminToken)}` : ''
            }`}
            download="olympia-questions-converted.json"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-sky-300 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/40 rounded-xl cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất JSON
          </a>
        </div>
      </div>

      {/* TAB 1: UPLOAD & CONVERT LARGE CSV */}
      {activeTab === 'UPLOAD_CONVERT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-5">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>Chọn chế độ nạp dữ liệu CSV vào Backend</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setUploadMode('merge')}
                    className={`px-3 py-1.5 rounded-md font-bold cursor-pointer ${
                      uploadMode === 'merge'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Gộp thêm / Cập nhật (Merge)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('replace')}
                    className={`px-3 py-1.5 rounded-md font-bold cursor-pointer ${
                      uploadMode === 'replace'
                        ? 'bg-rose-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Thay thế toàn bộ (Replace)
                  </button>
                </div>
              </div>

              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (isUploading) return;
                  const f = e.dataTransfer.files?.[0];
                  if (f) processAndUploadCsvFile(f);
                }}
                className="p-8 border-2 border-dashed border-amber-400/60 hover:border-amber-300 bg-slate-900/60 hover:bg-slate-900 rounded-2xl text-center space-y-3 transition-all cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-base font-extrabold text-white">
                    Nhấn để chọn File CSV hoặc Kéo thả File CSV dung lượng lớn vào đây
                  </div>
                  <div className="text-xs text-slate-400">
                    Hỗ trợ file CSV lên tới <strong>60 MB</strong>. Tự động tách đáp án phụ, số học,
                    công thức hóa học và phân loại đúng vòng thi!
                  </div>
                </div>
              </div>

              {isUploading && (
                <div className="p-4 bg-sky-950/60 border border-sky-400/50 rounded-xl text-xs font-semibold text-sky-200 flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  <span>{uploadProgressText || 'Đang xử lý file CSV...'}</span>
                </div>
              )}

              {uploadError && (
                <div className="p-4 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs font-semibold text-rose-200 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 uppercase">
                  Hoặc dán nhanh dữ liệu CSV trực tiếp để Convert:
                </label>
                <textarea
                  rows={4}
                  value={rawCsvPaste}
                  onChange={(e) => setRawCsvPaste(e.target.value)}
                  placeholder={`qid,season,match,round,subject,question,answer\n26-Custom-KD-A1.1,26,Final,KD,Math,"Số nguyên tố chẵn duy nhất là số mấy?",2`}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleResetDefaultBank}
                    disabled={isUploading || loadingStats}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Khôi phục Kho Mặc Định
                  </button>

                  <button
                    type="button"
                    onClick={handlePasteCsvConvert}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Convert Dữ Liệu CSV Đã Dán
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            {lastReport ? (
              <div className="p-5 bg-emerald-950/30 border-2 border-emerald-500/50 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-300 uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    KẾT QUẢ CONVERT CSV THÀNH CÔNG
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{lastReport.fileName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-slate-400">Số dòng CSV đã đọc</div>
                    <div className="font-mono font-extrabold text-base text-white">
                      {lastReport.totalRowsParsed.toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-slate-400">Câu hỏi hợp lệ đã Convert</div>
                    <div className="font-mono font-extrabold text-base text-emerald-400">
                      {lastReport.validQuestionsConverted.toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-slate-400">Đã lọc bỏ câu lỗi/trống</div>
                    <div className="font-mono font-bold text-sm text-amber-300">
                      {lastReport.skippedMalformedCount} dòng
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-slate-400">Tổng kho sau khi nạp</div>
                    <div className="font-mono font-extrabold text-base text-sky-300">
                      {lastReport.totalBankSizeAfter.toLocaleString('vi-VN')} câu
                    </div>
                  </div>
                </div>

                {lastReport.sampleConverted.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase">
                      Mẫu câu hỏi vừa Convert:
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {lastReport.sampleConverted.slice(0, 5).map((item) => (
                        <div
                          key={item.qid}
                          className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] text-sky-300 font-semibold">
                            <span>
                              [{item.round}] {item.qid} · {item.categoryVi}
                            </span>
                            {item.points && (
                              <span className="text-amber-300 font-mono">{item.points}đ</span>
                            )}
                          </div>
                          <div className="text-white font-medium">{item.question}</div>
                          <div className="text-emerald-300 font-semibold">
                            Đáp án gốc: "{item.officialAnswer}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="text-sm font-bold text-white">
                  Cơ chế Backend Convert CSV sang Data Câu Hỏi Olympia:
                </div>
                <p>
                  • <strong>Chuẩn hóa cấu trúc 7 cột Olympia:</strong> Hỗ trợ trực tiếp cấu trúc{' '}
                  <code className="text-amber-300">
                    qid,season,match,round,subject,question,answer
                  </code>{' '}
                  hoặc file CSV bất kỳ có cột <code className="text-amber-300">question,answer</code>.
                </p>
                <p>
                  • <strong>Tự động sinh danh sách đáp án chấp nhận (Accepted Answers):</strong> Tự
                  động tách lời giải thích riêng và cho phép người chơi gõ các biến thể hợp lệ đều
                  được chấm ĐÚNG!
                </p>
                <p>
                  • <strong>Phân bổ đúng Vòng Thi:</strong> Các mã câu hỏi{' '}
                  <code className="text-amber-300">KD</code> vào Khởi Động,{' '}
                  <code className="text-amber-300">VCNV</code> vào Vượt Chướng Ngại Vật,{' '}
                  <code className="text-amber-300">TT</code> vào Tăng Tốc (4 câu), và{' '}
                  <code className="text-amber-300">VD</code> vào gói 20đ / 30đ phần Về Đích!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BROWSE & SEARCH */}
      {activeTab === 'BROWSE_SEARCH' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Tìm kiếm nội dung câu hỏi / đáp án / mã QID
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchPage(1);
                  }}
                  placeholder="Nhập từ khóa (VD: Newton, sóng điện từ, Xuân Diệu...)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Mùa Olympia (Season)
              </label>
              <select
                value={filterSeason}
                onChange={(e) => {
                  setFilterSeason(e.target.value);
                  setFilterMatch('');
                  setSearchPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">Tất cả các mùa (O19–O26)</option>
                {stats?.seasonsList.map((s) => (
                  <option key={s.season} value={s.season}>
                    Olympia {s.season} ({s.questionCount.toLocaleString('vi-VN')} câu)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Trận đấu (Match)
              </label>
              <select
                value={filterMatch}
                onChange={(e) => {
                  setFilterMatch(e.target.value);
                  setSearchPage(1);
                }}
                disabled={!filterSeason}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-50"
              >
                <option value="">Tất cả các trận</option>
                {availableMatchesForFilter.map((m) => (
                  <option key={m} value={m}>
                    Trận {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Phần thi (Round)
              </label>
              <select
                value={filterRound}
                onChange={(e) => {
                  setFilterRound(e.target.value);
                  setSearchPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">Tất cả phần thi (4 vòng)</option>
                <option value="KD">Vòng 1: Khởi Động (KD)</option>
                <option value="VCNV">Vòng 2: Vượt Chướng Ngại Vật (VCNV)</option>
                <option value="TT">Vòng 3: Tăng Tốc (TT)</option>
                <option value="VD">Vòng 4: Về Đích (VD)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Lĩnh vực (Subject)
              </label>
              <select
                value={filterSubject}
                onChange={(e) => {
                  setFilterSubject(e.target.value);
                  setSearchPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">Tất cả lĩnh vực</option>
                {stats &&
                  Object.entries(stats.bySubject).map(([subj, cnt]) => (
                    <option key={subj} value={subj}>
                      {subj} ({cnt.toLocaleString('vi-VN')})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Tìm thấy{' '}
                <strong className="font-mono text-amber-300">
                  {searchResults.total.toLocaleString('vi-VN')}
                </strong>{' '}
                câu hỏi đã convert (Trang {searchResults.page} / {searchResults.totalPages})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={searchPage <= 1}
                onClick={() => {
                  if (!isSearching) setSearchPage((p) => Math.max(1, p - 1));
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Trang trước
              </button>
              <button
                type="button"
                disabled={searchPage >= searchResults.totalPages}
                onClick={() => {
                  if (!isSearching) {
                    setSearchPage((p) => Math.min(searchResults.totalPages, p + 1));
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
              >
                Trang sau <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {searchResults.items.map((item) => (
              <div
                key={item.qid}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/40 font-mono font-bold">
                      {item.qid}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-sky-500/15 text-sky-300 font-semibold">
                      Olympia {item.season} · Trận {item.match}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold">
                      Vòng {item.round} · {item.categoryVi}
                    </span>
                  </div>
                  {item.points && (
                    <span className="font-mono font-bold text-emerald-400">
                      Gói {item.points} điểm
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-white leading-relaxed">{item.question}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                  <div className="text-emerald-300 font-bold">
                    Đáp án chính thức:{' '}
                    <span className="font-mono bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
                      {item.officialAnswer}
                    </span>
                  </div>
                  <div className="text-slate-400">
                    Biến thể chấm đúng:{' '}
                    <code className="text-amber-200 font-mono">
                      {item.acceptedAnswers.join(' | ')}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SELECT QUESTION DECK */}
      {activeTab === 'SELECT_DECK' && (
        <div className="space-y-5">
          {currentDeck && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold text-emerald-300 uppercase">
                  BỘ ĐỀ ĐANG ÁP DỤNG TRONG PHÒNG HIỆN TẠI:
                </div>
                <div className="text-base font-extrabold text-white">{currentDeck.label}</div>
              </div>
              <span className="text-xs font-mono text-amber-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                24 câu KD cá nhân · 12 câu KD chung · {currentDeck.obstaclePuzzles.length} bộ VCNV ·
                4 câu Tăng Tốc · 24 câu Về Đích
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => onChangeDeckConfig({ ...deckConfig, mode: 'CSV_RANDOM' })}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer space-y-2 ${
                deckConfig.mode === 'CSV_RANDOM'
                  ? 'bg-amber-400/15 border-2 border-amber-400'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-amber-300">
                  Khuyên dùng · Đa dạng nhất
                </span>
                {deckConfig.mode === 'CSV_RANDOM' && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <div className="text-base font-display font-extrabold text-white">
                1. Bốc Ngẫu Nhiên Từ Kho CSV (21.640+ Câu)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mỗi trận đấu hệ thống tự động rút ngẫu nhiên bộ câu hỏi mới hoàn toàn từ kho CSV đúng
                theo từng vòng thi.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                const defaultSeason =
                  deckConfig.season || stats?.seasonsList[0]?.season || '26';
                const defaultMatch =
                  deckConfig.match ||
                  stats?.seasonsList.find((s) => s.season === defaultSeason)?.matches[0] ||
                  'Final';
                onChangeDeckConfig({
                  ...deckConfig,
                  mode: 'CSV_MATCH',
                  season: defaultSeason,
                  match: defaultMatch,
                });
              }}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer space-y-2 ${
                deckConfig.mode === 'CSV_MATCH'
                  ? 'bg-sky-400/15 border-2 border-sky-400'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-sky-300">
                  Thi đấu theo đề thật VTV3
                </span>
                {deckConfig.mode === 'CSV_MATCH' && <Check className="w-4 h-4 text-sky-400" />}
              </div>
              <div className="text-base font-display font-extrabold text-white">
                2. Chọn Trận Đấu Olympia Cụ Thể (424 Trận)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Chọn chính xác Mùa (O19–O26) và Trận đấu (VD: Chung kết Năm O26, Quý 1...) để thi đấu
                đúng bộ đề của trận đó!
              </p>
            </button>

            <button
              type="button"
              onClick={() => onChangeDeckConfig({ ...deckConfig, mode: 'CLASSIC_DEFAULT' })}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer space-y-2 ${
                deckConfig.mode === 'CLASSIC_DEFAULT'
                  ? 'bg-emerald-400/15 border-2 border-emerald-400'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-emerald-300">
                  Bộ đề chuẩn nâng cao
                </span>
                {deckConfig.mode === 'CLASSIC_DEFAULT' && (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <div className="text-base font-display font-extrabold text-white">
                3. Bộ Đề Olympia Mặc Định (Cổ Điển)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sử dụng bộ câu hỏi mặc định tích hợp sẵn cùng 16 bộ Vượt Chướng Ngại Vật suy luận đa
                tầng và 10 bộ Tăng Tốc phân hóa cao.
              </p>
            </button>
          </div>

          {deckConfig.mode !== 'CLASSIC_DEFAULT' && (
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Chọn Mùa Olympia (Season)
                </label>
                <select
                  value={deckConfig.season}
                  onChange={(e) => {
                    const newSeason = e.target.value;
                    const firstMatch =
                      stats?.seasonsList.find((s) => s.season === newSeason)?.matches[0] || '';
                    onChangeDeckConfig({
                      ...deckConfig,
                      season: newSeason,
                      match: deckConfig.mode === 'CSV_MATCH' ? firstMatch : '',
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  {deckConfig.mode === 'CSV_RANDOM' && (
                    <option value="">Tất cả các mùa (O19 – O26)</option>
                  )}
                  {stats?.seasonsList.map((s) => (
                    <option key={s.season} value={s.season}>
                      Olympia Mùa {s.season} ({s.questionCount.toLocaleString('vi-VN')} câu ·{' '}
                      {s.matches.length} trận)
                    </option>
                  ))}
                </select>
              </div>

              {deckConfig.mode === 'CSV_MATCH' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Chọn Trận Đấu Cụ Thể (Match)
                  </label>
                  <select
                    value={deckConfig.match}
                    onChange={(e) =>
                      onChangeDeckConfig({ ...deckConfig, match: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-sky-400 rounded-xl text-xs font-bold text-amber-300 focus:outline-none"
                  >
                    {availableMatchesForDeck.map((m) => (
                      <option key={m} value={m}>
                        Trận {m}{' '}
                        {m === 'Final'
                          ? '(Chung Kết Năm)'
                          : m.startsWith('QF')
                          ? `(Thi Quý ${m.replace('QF', '')})`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Lọc theo Chuyên đề / Lĩnh vực (Tùy chọn)
                  </label>
                  <select
                    value={deckConfig.subjectFilter}
                    onChange={(e) =>
                      onChangeDeckConfig({ ...deckConfig, subjectFilter: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Đầy đủ 11 lĩnh vực (Tổng hợp)</option>
                    {stats &&
                      Object.entries(stats.bySubject).map(([subj, cnt]) => (
                        <option key={subj} value={subj}>
                          Chuyên đề: {subj} ({cnt.toLocaleString('vi-VN')} câu)
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex items-end">
                {inRoom ? (
                  isHost ? (
                    <button
                      type="button"
                      disabled={isApplyingDeck}
                      onClick={handleApplyDeck}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      {isApplyingDeck
                        ? 'Đang tạo bộ đề từ CSV...'
                        : deckAppliedSuccess
                        ? 'Đã nạp Bộ Đề Mới cho Phòng!'
                        : `Nạp Bộ Đề Này Vào Phòng ${roomCode}`}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                      Chỉ Chủ phòng mới có thể đổi bộ đề của phòng đang chơi
                    </div>
                  )
                ) : (
                  <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-center text-xs text-emerald-300 font-semibold">
                    ✓ Đã lưu cấu hình! Khi bạn nhấn "Tạo Phòng" hoặc "Chạy Demo", bộ đề này sẽ được
                    áp dụng ngay.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
