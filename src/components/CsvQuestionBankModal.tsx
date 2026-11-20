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
  Edit3,
  Image as ImageIcon,
  Save,
  Trash2,
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
  imageUrl?: string;
  sourceFile: string;
}

interface EditableVcnvRowRecord {
  id: 1 | 2 | 3 | 4;
  qid: string;
  rowLabel: string;
  charCount: number;
  question: string;
  displayWord: string;
  acceptedAnswers: string[];
  explanation: string;
}

interface EditableVcnvPuzzleRecord {
  puzzleId: string;
  season: string;
  match: string;
  cnvQid: string;
  centerQid: string;
  title: string;
  keywordDisplay: string;
  charCount: number;
  acceptedKeywords: string[];
  imageUrl: string;
  rawImageUrl: string;
  summaryExplanation: string;
  rows: EditableVcnvRowRecord[];
  centerQuestion: {
    qid: string;
    charCount: number;
    question: string;
    displayWord: string;
    acceptedAnswers: string[];
    explanation: string;
  };
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

const BUILTIN_VCNV_PRESET_IMAGES: { label: string; url: string }[] = [
  { label: 'Vịnh Hạ Long', url: '/assets/vcnv/vcnv-1.jpg' },
  { label: 'Phố cổ Hội An', url: '/assets/vcnv/vcnv-2.jpg' },
  { label: 'Trống đồng Đông Sơn', url: '/assets/vcnv/vcnv-3.jpg' },
  { label: 'Điện Biên Phủ', url: '/assets/vcnv/vcnv-4.jpg' },
  { label: 'Truyện Kiều (Nguyễn Du)', url: '/assets/vcnv/vcnv-5.jpg' },
  { label: 'Vệ tinh Vinasat 1', url: '/assets/vcnv/vcnv-6.jpg' },
  { label: 'Hệ Mặt Trời', url: '/assets/vcnv/vcnv-7.jpg' },
  { label: 'Phở Việt Nam', url: '/assets/vcnv/vcnv-8.jpg' },
  { label: 'Quang hợp', url: '/assets/vcnv/vcnv-9.jpg' },
  { label: 'Áo dài Việt Nam', url: '/assets/vcnv/vcnv-10.jpg' },
  { label: 'Mặt Trăng', url: '/assets/vcnv/vcnv-11.jpg' },
  { label: 'Phân tử ADN', url: '/assets/vcnv/vcnv-12.jpg' },
  { label: 'Chùa Một Cột', url: '/assets/vcnv/vcnv-13.jpg' },
  { label: 'Định lý Pythagoras', url: '/assets/vcnv/vcnv-14.jpg' },
  { label: 'Dòng điện xoay chiều', url: '/assets/vcnv/vcnv-15.jpg' },
  { label: 'Tuyên ngôn Độc lập / Cách mạng T8', url: '/assets/vcnv/vcnv-16.jpg' },
  { label: 'Cố đô Huế', url: '/assets/vcnv/vcnv-codohue.jpg' },
  { label: 'Quần đảo Trường Sa', url: '/assets/vcnv/vcnv-truongsa.jpg' },
  { label: 'Trí tuệ nhân tạo (AI)', url: '/assets/vcnv/vcnv-trituenhantao.jpg' },
  { label: 'Bảng tuần hoàn Mendeleev', url: '/assets/vcnv/vcnv-bangtuanhoan.jpg' },
];

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
  const [activeTab, setActiveTab] = useState<
    'UPLOAD_CONVERT' | 'BROWSE_SEARCH' | 'VCNV_GALLERY' | 'SELECT_DECK'
  >('BROWSE_SEARCH');
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

  // Tab 2: Question Search & Edit states
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

  const [editingQid, setEditingQid] = useState<string | null>(null);
  const [editQForm, setEditQForm] = useState<{
    question: string;
    officialAnswer: string;
    acceptedAnswersText: string;
    explanation: string;
    categoryVi: string;
    points: 20 | 30;
    imageUrl: string;
  }>({
    question: '',
    officialAnswer: '',
    acceptedAnswersText: '',
    explanation: '',
    categoryVi: '',
    points: 20,
    imageUrl: '',
  });
  const [isSavingQuestion, setIsSavingQuestion] = useState<boolean>(false);
  const [confirmDeleteQid, setConfirmDeleteQid] = useState<string | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState<boolean>(false);
  const [questionEditMessage, setQuestionEditMessage] = useState<{
    qid: string;
    text: string;
    isError?: boolean;
  } | null>(null);

  // Tab 3: VCNV Obstacle Image & Answer Lookup & Edit states
  const [vcnvSearchQuery, setVcnvSearchQuery] = useState<string>('');
  const [vcnvSeasonFilter, setVcnvSeasonFilter] = useState<string>('');
  const [vcnvPage, setVcnvPage] = useState<number>(1);
  const [vcnvResults, setVcnvResults] = useState<{
    total: number;
    page: number;
    totalPages: number;
    items: EditableVcnvPuzzleRecord[];
  }>({ total: 0, page: 1, totalPages: 1, items: [] });
  const [isLoadingVcnv, setIsLoadingVcnv] = useState<boolean>(false);

  const [editingVcnvKey, setEditingVcnvKey] = useState<string | null>(null);
  const [confirmDeleteVcnvKey, setConfirmDeleteVcnvKey] = useState<string | null>(null);
  const [isDeletingVcnv, setIsDeletingVcnv] = useState<boolean>(false);
  const [editVcnvForm, setEditVcnvForm] = useState<{
    season: string;
    match: string;
    title: string;
    keywordDisplay: string;
    acceptedKeywordsText: string;
    imageUrl: string;
    summaryExplanation: string;
    rows: {
      id: 1 | 2 | 3 | 4;
      question: string;
      displayWord: string;
      acceptedAnswersText: string;
      explanation: string;
    }[];
    centerQuestion: {
      question: string;
      displayWord: string;
      acceptedAnswersText: string;
      explanation: string;
    };
  } | null>(null);
  const [isSavingVcnv, setIsSavingVcnv] = useState<boolean>(false);
  const [vcnvSaveMessage, setVcnvSaveMessage] = useState<{
    key: string;
    text: string;
    isError?: boolean;
  } | null>(null);
  const vcnvImageUploadRef = useRef<HTMLInputElement>(null);

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

  const fetchVcnvPuzzles = useCallback(async () => {
    setIsLoadingVcnv(true);
    try {
      const params = new URLSearchParams();
      if (vcnvSearchQuery.trim()) params.set('q', vcnvSearchQuery.trim());
      if (vcnvSeasonFilter) params.set('season', vcnvSeasonFilter);
      params.set('page', String(vcnvPage));
      params.set('limit', '10');

      const res = await fetch(`/api/questions/vcnv-puzzles?${params.toString()}`, {
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
      });
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        setVcnvResults(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingVcnv(false);
    }
  }, [vcnvSearchQuery, vcnvSeasonFilter, vcnvPage, adminToken]);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, fetchStats]);

  useEffect(() => {
    if (isOpen && activeTab === 'BROWSE_SEARCH') {
      fetchSearchResults();
    }
  }, [isOpen, activeTab, fetchSearchResults]);

  useEffect(() => {
    if (isOpen && activeTab === 'VCNV_GALLERY') {
      fetchVcnvPuzzles();
    }
  }, [isOpen, activeTab, fetchVcnvPuzzles]);

  const startEditingQuestion = (item: BankQuestionRecord) => {
    setEditingQid(item.qid);
    setQuestionEditMessage(null);
    setEditQForm({
      question: item.question,
      officialAnswer: item.officialAnswer,
      acceptedAnswersText: item.acceptedAnswers.join(' | '),
      explanation: item.explanation || '',
      categoryVi: item.categoryVi || 'Hiểu biết chung',
      points: item.points === 30 ? 30 : 20,
      imageUrl: item.imageUrl || '',
    });
  };

  const handleSaveQuestionEdit = async (qid: string) => {
    setIsSavingQuestion(true);
    setQuestionEditMessage(null);
    try {
      const res = await fetch('/api/questions/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          qid,
          question: editQForm.question,
          officialAnswer: editQForm.officialAnswer,
          acceptedAnswers: editQForm.acceptedAnswersText
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean),
          explanation: editQForm.explanation,
          categoryVi: editQForm.categoryVi,
          points: editQForm.points,
          imageUrl: editQForm.imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setQuestionEditMessage({
          qid,
          text: data?.error || 'Không thể lưu câu hỏi.',
          isError: true,
        });
      } else if (data?.item) {
        setSearchResults((prev) => ({
          ...prev,
          items: prev.items.map((it) => (it.qid === qid ? data.item : it)),
        }));
        if (data.stats) {
          setStats(data.stats);
          onStatsUpdated?.(data.stats);
        }
        setEditingQid(null);
        setQuestionEditMessage({
          qid,
          text: '✓ Đã lưu chỉnh sửa câu hỏi / đáp án thành công!',
        });
      }
    } catch {
      setQuestionEditMessage({
        qid,
        text: 'Lỗi kết nối khi lưu chỉnh sửa câu hỏi.',
        isError: true,
      });
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (qid: string) => {
    setIsDeletingQuestion(true);
    setQuestionEditMessage(null);
    try {
      const res = await fetch('/api/questions/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ qid }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setQuestionEditMessage({
          qid,
          text: data?.error || 'Không thể xoá câu hỏi này.',
          isError: true,
        });
      } else {
        setConfirmDeleteQid(null);
        if (editingQid === qid) {
          setEditingQid(null);
        }
        setSearchResults((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          items: prev.items.filter((it) => it.qid !== qid),
        }));
        if (data?.stats) {
          setStats(data.stats);
          onStatsUpdated?.(data.stats);
        }
      }
    } catch {
      setQuestionEditMessage({
        qid,
        text: 'Lỗi kết nối khi xoá câu hỏi.',
        isError: true,
      });
    } finally {
      setIsDeletingQuestion(false);
    }
  };

  const handleDeleteVcnvPuzzle = async (season: string, match: string) => {
    const key = `${season}-${match}`;
    setIsDeletingVcnv(true);
    setVcnvSaveMessage(null);
    try {
      const res = await fetch('/api/questions/vcnv-puzzles/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ season, match }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setVcnvSaveMessage({
          key,
          text: data?.error || 'Không thể xoá bộ Chướng Ngại Vật này.',
          isError: true,
        });
      } else {
        setConfirmDeleteVcnvKey(null);
        if (editingVcnvKey === key) {
          setEditingVcnvKey(null);
          setEditVcnvForm(null);
        }
        setVcnvResults((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          items: prev.items.filter(
            (it) => !(it.season === season && it.match === match)
          ),
        }));
        if (data?.stats) {
          setStats(data.stats);
          onStatsUpdated?.(data.stats);
        }
      }
    } catch {
      setVcnvSaveMessage({
        key,
        text: 'Lỗi kết nối khi xoá bộ Chướng Ngại Vật.',
        isError: true,
      });
    } finally {
      setIsDeletingVcnv(false);
    }
  };

  const startEditingVcnvPuzzle = (puz: EditableVcnvPuzzleRecord) => {
    const key = `${puz.season}-${puz.match}`;
    setEditingVcnvKey(key);
    setVcnvSaveMessage(null);
    setEditVcnvForm({
      season: puz.season,
      match: puz.match,
      title: puz.title,
      keywordDisplay: puz.keywordDisplay,
      acceptedKeywordsText: puz.acceptedKeywords.join(' | '),
      imageUrl: puz.imageUrl,
      summaryExplanation: puz.summaryExplanation || '',
      rows: puz.rows.map((r) => ({
        id: r.id,
        question: r.question,
        displayWord: r.displayWord,
        acceptedAnswersText: r.acceptedAnswers.join(' | '),
        explanation: r.explanation || '',
      })),
      centerQuestion: {
        question: puz.centerQuestion.question,
        displayWord: puz.centerQuestion.displayWord,
        acceptedAnswersText: puz.centerQuestion.acceptedAnswers.join(' | '),
        explanation: puz.centerQuestion.explanation || '',
      },
    });
  };

  const handleVcnvLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editVcnvForm) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1280;
        const maxH = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        if (h > maxH) {
          w = Math.round((w * maxH) / h);
          h = maxH;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setEditVcnvForm((prev) => (prev ? { ...prev, imageUrl: dataUrl } : prev));
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    if (vcnvImageUploadRef.current) vcnvImageUploadRef.current.value = '';
  };

  const handleSaveVcnvPuzzle = async () => {
    if (!editVcnvForm) return;
    const key = `${editVcnvForm.season}-${editVcnvForm.match}`;
    setIsSavingVcnv(true);
    setVcnvSaveMessage(null);
    try {
      const res = await fetch('/api/questions/vcnv-puzzles/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          season: editVcnvForm.season,
          match: editVcnvForm.match,
          title: editVcnvForm.title,
          keywordDisplay: editVcnvForm.keywordDisplay,
          acceptedKeywords: editVcnvForm.acceptedKeywordsText
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean),
          imageUrl: editVcnvForm.imageUrl,
          summaryExplanation: editVcnvForm.summaryExplanation,
          rows: editVcnvForm.rows.map((r) => ({
            id: r.id,
            question: r.question,
            displayWord: r.displayWord,
            acceptedAnswers: r.acceptedAnswersText
              .split('|')
              .map((s) => s.trim())
              .filter(Boolean),
            explanation: r.explanation,
          })),
          centerQuestion: {
            question: editVcnvForm.centerQuestion.question,
            displayWord: editVcnvForm.centerQuestion.displayWord,
            acceptedAnswers: editVcnvForm.centerQuestion.acceptedAnswersText
              .split('|')
              .map((s) => s.trim())
              .filter(Boolean),
            explanation: editVcnvForm.centerQuestion.explanation,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setVcnvSaveMessage({
          key,
          text: data?.error || 'Không thể lưu bộ Chướng Ngại Vật.',
          isError: true,
        });
      } else if (data?.item) {
        setVcnvResults((prev) => ({
          ...prev,
          items: prev.items.map((it) =>
            it.season === editVcnvForm.season && it.match === editVcnvForm.match
              ? data.item
              : it
          ),
        }));
        if (data.stats) {
          setStats(data.stats);
          onStatsUpdated?.(data.stats);
        }
        setEditingVcnvKey(null);
        setEditVcnvForm(null);
        setVcnvSaveMessage({
          key,
          text: '✓ Đã cập nhật Ảnh, Đáp án Chướng Ngại Vật và các Hàng ngang thành công!',
        });
      }
    } catch {
      setVcnvSaveMessage({
        key,
        text: 'Lỗi kết nối khi lưu bộ Chướng Ngại Vật.',
        isError: true,
      });
    } finally {
      setIsSavingVcnv(false);
    }
  };

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
        fetchVcnvPuzzles();
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
        fetchVcnvPuzzles();
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
      fetchVcnvPuzzles();
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
          sub: 'Có thể tra cứu & chỉnh sửa',
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
          sub: 'Kho Ảnh & Hàng ngang',
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
            QUẢN LÝ KHO DỮ LIỆU CÂU HỎI · CHỈNH SỬA CÂU HỎI & HÌNH ẢNH CHƯỚNG NGẠI VẬT
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Kho Dữ Liệu Câu Hỏi Olympia (
            {stats ? stats.totalQuestions.toLocaleString('vi-VN') : '21.640+'} Câu Hỏi)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Tra cứu, chỉnh sửa trực tiếp câu hỏi/đáp án bị sai sót, tra cứu & thay đổi Hình ảnh +
            Đáp án Chướng Ngại Vật (VCNV), tải thêm CSV hoặc chọn bộ đề cho phòng thi đấu!
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

      {/* 4 Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('BROWSE_SEARCH')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'BROWSE_SEARCH'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            1. Tra Cứu & Sửa Câu Hỏi / Đáp Án
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('VCNV_GALLERY')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'VCNV_GALLERY'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            2. Tra Cứu & Sửa Ảnh / Đáp Án Chướng Ngại Vật (VCNV)
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
            3. Chọn Bộ Đề Thi Đấu Cho Phòng
          </button>

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
            4. Tải File CSV & Convert
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/questions/export-csv?onlyNew=0${
              adminToken ? `&token=${encodeURIComponent(adminToken)}` : ''
            }`}
            download="olympia_questions_full_export.csv"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 rounded-xl cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Toàn Bộ Kho CSV (Đã gồm bản sửa)
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

      {/* ==================== TAB 1: BROWSE, SEARCH & EDIT QUESTIONS ==================== */}
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
                  placeholder="Nhập từ khóa câu hỏi hoặc đáp án cần tìm / sửa..."
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
                câu hỏi (Trang {searchResults.page} / {searchResults.totalPages}) — Nhấn nút{' '}
                <strong className="text-amber-300">"Sửa Câu Hỏi / Đáp Án"</strong> ở bất kỳ câu nào
                để chỉnh sửa ngay!
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

          <div className="grid grid-cols-1 gap-3 max-h-[520px] overflow-y-auto pr-1">
            {searchResults.items.map((item) => {
              const isEditingThis = editingQid === item.qid;
              const vcnvChars =
                item.round === 'VCNV'
                  ? item.officialAnswer.split('/')[0].trim().replace(/\s+/g, '').length
                  : 0;

              return (
                <div
                  key={item.qid}
                  className={`p-4 bg-slate-950 border rounded-xl space-y-2.5 transition-colors ${
                    isEditingThis
                      ? 'border-2 border-amber-400'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
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
                      {item.round === 'VCNV' && vcnvChars > 0 && (
                        <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                          {vcnvChars} chữ cái
                        </span>
                      )}
                      {item.points && (
                        <span className="font-mono font-bold text-emerald-400">
                          Gói {item.points} điểm
                        </span>
                      )}
                    </div>

                    {!isEditingThis && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteQid(null);
                            startEditingQuestion(item);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-300 font-bold text-xs cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Sửa Câu Hỏi / Đáp Án
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDeleteQid((prev) =>
                              prev === item.qid ? null : item.qid
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xoá Câu Hỏi
                        </button>
                      </div>
                    )}
                  </div>

                  {confirmDeleteQid === item.qid && (
                    <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <span className="font-bold text-rose-200">
                        ⚠️ Bạn có chắc chắn muốn xoá câu hỏi{' '}
                        <code className="font-mono text-amber-300">{item.qid}</code> khỏi kho dữ
                        liệu?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteQid(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          disabled={isDeletingQuestion}
                          onClick={() => handleDeleteQuestion(item.qid)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-extrabold cursor-pointer shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {isDeletingQuestion ? 'Đang xoá...' : 'Xác Nhận Xoá'}
                        </button>
                      </div>
                    </div>
                  )}

                  {questionEditMessage && questionEditMessage.qid === item.qid && (
                    <div
                      className={`p-2.5 rounded-lg text-xs font-bold flex items-center justify-between ${
                        questionEditMessage.isError
                          ? 'bg-rose-950/60 border border-rose-500/50 text-rose-200'
                          : 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                      }`}
                    >
                      <span>{questionEditMessage.text}</span>
                      <button
                        type="button"
                        onClick={() => setQuestionEditMessage(null)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {isEditingThis ? (
                    <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-3 text-xs">
                      <div className="text-xs font-extrabold text-amber-300 uppercase flex items-center justify-between">
                        <span>Đang chỉnh sửa câu hỏi: {item.qid}</span>
                        {item.round === 'VCNV' && (
                          <span className="font-mono text-emerald-300">
                            Số chữ tự động tính:{' '}
                            {editQForm.officialAnswer
                              .split('/')[0]
                              .trim()
                              .replace(/\s+/g, '').length}{' '}
                            chữ cái
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          Nội dung Câu Hỏi:
                        </label>
                        <textarea
                          rows={3}
                          value={editQForm.question}
                          onChange={(e) =>
                            setEditQForm((prev) => ({ ...prev, question: e.target.value }))
                          }
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-emerald-300 mb-1">
                            Đáp án chính thức:
                          </label>
                          <input
                            type="text"
                            value={editQForm.officialAnswer}
                            onChange={(e) =>
                              setEditQForm((prev) => ({
                                ...prev,
                                officialAnswer: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/60 rounded-lg text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-emerald-400"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-amber-300 mb-1">
                            Các biến thể chấm ĐÚNG (phân cách bằng dấu |):
                          </label>
                          <input
                            type="text"
                            value={editQForm.acceptedAnswersText}
                            onChange={(e) =>
                              setEditQForm((prev) => ({
                                ...prev,
                                acceptedAnswersText: e.target.value,
                              }))
                            }
                            placeholder="VD: Vịnh Hạ Long | Vinh Ha Long | Ha Long"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-300 mb-1">
                            Giải thích / Ghi chú đáp án:
                          </label>
                          <input
                            type="text"
                            value={editQForm.explanation}
                            onChange={(e) =>
                              setEditQForm((prev) => ({
                                ...prev,
                                explanation: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-300 mb-1">
                            Lĩnh vực / Chủ đề:
                          </label>
                          <input
                            type="text"
                            value={editQForm.categoryVi}
                            onChange={(e) =>
                              setEditQForm((prev) => ({
                                ...prev,
                                categoryVi: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {item.round === 'VCNV' &&
                        (item.subCode.toUpperCase() === 'CNV' ||
                          item.subCode.toUpperCase() === 'KEYWORD') && (
                          <div>
                            <label className="block font-bold text-sky-300 mb-1">
                              Đường dẫn Hình ảnh Chướng Ngại Vật (URL hoặc /assets/vcnv/...):
                            </label>
                            <input
                              type="text"
                              value={editQForm.imageUrl}
                              onChange={(e) =>
                                setEditQForm((prev) => ({
                                  ...prev,
                                  imageUrl: e.target.value,
                                }))
                              }
                              placeholder="/assets/vcnv/vcnv-1.jpg hoặc https://..."
                              className="w-full px-3 py-2 bg-slate-950 border border-sky-500/50 rounded-lg text-sky-200 font-mono text-xs focus:outline-none"
                            />
                          </div>
                        )}

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingQid(null)}
                          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          disabled={isSavingQuestion}
                          onClick={() => handleSaveQuestionEdit(item.qid)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs cursor-pointer shadow-md"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {isSavingQuestion ? 'Đang lưu...' : 'Lưu Câu Hỏi / Đáp Án'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-white leading-relaxed">
                        {item.question}
                      </p>

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
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: VCNV OBSTACLE IMAGE & ANSWER LOOKUP & EDITOR ==================== */}
      {activeTab === 'VCNV_GALLERY' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl items-end">
            <div className="sm:col-span-7">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Tra cứu Chướng Ngại Vật (Theo Đáp án CNV, Chủ đề, Mã bộ đề hoặc từ khóa hàng ngang)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vcnvSearchQuery}
                  onChange={(e) => {
                    setVcnvSearchQuery(e.target.value);
                    setVcnvPage(1);
                  }}
                  placeholder="VD: Vịnh Hạ Long, Truyện Kiều, Phở Việt Nam, Vinasat, M1Q4, VCNV01..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Lọc theo Mùa Olympia
              </label>
              <select
                value={vcnvSeasonFilter}
                onChange={(e) => {
                  setVcnvSeasonFilter(e.target.value);
                  setVcnvPage(1);
                }}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">Tất cả các mùa (162 bộ VCNV)</option>
                {stats?.seasonsList.map((s) => (
                  <option key={s.season} value={s.season}>
                    Olympia Mùa {s.season}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
              <button
                type="button"
                disabled={vcnvPage <= 1 || isLoadingVcnv}
                onClick={() => setVcnvPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-amber-300 px-1">
                {vcnvResults.page}/{vcnvResults.totalPages}
              </span>
              <button
                type="button"
                disabled={vcnvPage >= vcnvResults.totalPages || isLoadingVcnv}
                onClick={() => setVcnvPage((p) => Math.min(vcnvResults.totalPages, p + 1))}
                className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <span>
              Đang hiển thị{' '}
              <strong className="font-mono text-amber-300">{vcnvResults.total}</strong> bộ Chướng
              Ngại Vật kèm Hình ảnh & Đáp án (Trang {vcnvResults.page}/{vcnvResults.totalPages}).
              Nhấn <strong className="text-amber-300">"Sửa Ảnh / Đáp Án CNV"</strong> để đổi ảnh
              hoặc sửa đáp án!
            </span>
          </div>

          <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
            {vcnvResults.items.map((puz) => {
              const itemKey = `${puz.season}-${puz.match}`;
              const isEditingThisVcnv = editingVcnvKey === itemKey && editVcnvForm !== null;

              return (
                <div
                  key={itemKey}
                  className={`p-5 bg-slate-950 border rounded-2xl space-y-4 transition-all ${
                    isEditingThisVcnv
                      ? 'border-2 border-amber-400 shadow-xl'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {vcnvSaveMessage && vcnvSaveMessage.key === itemKey && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
                        vcnvSaveMessage.isError
                          ? 'bg-rose-950/60 border border-rose-500/50 text-rose-200'
                          : 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                      }`}
                    >
                      <span>{vcnvSaveMessage.text}</span>
                      <button
                        type="button"
                        onClick={() => setVcnvSaveMessage(null)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left: Mystery Image Preview */}
                    <div className="lg:col-span-4 space-y-2.5">
                      <div className="relative aspect-16/10 rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-900">
                        <img
                          src={isEditingThisVcnv ? editVcnvForm.imageUrl : puz.imageUrl}
                          alt={puz.keywordDisplay}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-slate-950/85 border border-amber-400/50 text-[11px] font-mono font-bold text-amber-300">
                          Olympia {puz.season} · {puz.match}
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 px-3 py-1.5 flex items-center justify-between text-xs">
                          <span className="font-extrabold text-emerald-300 truncate">
                            CNV: {puz.keywordDisplay}
                          </span>
                          <span className="font-mono font-bold text-amber-300 shrink-0 ml-2">
                            {puz.charCount} chữ cái
                          </span>
                        </div>
                      </div>

                      {!isEditingThisVcnv && (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDeleteVcnvKey(null);
                              startEditingVcnvPuzzle(puz);
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                          >
                            <Edit3 className="w-4 h-4" />
                            Sửa Ảnh / Đáp Án Chướng Ngại Vật & Hàng Ngang
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDeleteVcnvKey((prev) =>
                                prev === itemKey ? null : itemKey
                              )
                            }
                            className="w-full py-2 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Xoá Bộ Chướng Ngại Vật Này
                          </button>

                          {confirmDeleteVcnvKey === itemKey && (
                            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 space-y-2 text-xs">
                              <div className="font-bold text-rose-200">
                                ⚠️ Xoá toàn bộ bộ đề VCNV{' '}
                                <span className="text-amber-300">
                                  Olympia {puz.season} · {puz.match} ({puz.keywordDisplay})
                                </span>
                                ?
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteVcnvKey(null)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  disabled={isDeletingVcnv}
                                  onClick={() =>
                                    handleDeleteVcnvPuzzle(puz.season, puz.match)
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-extrabold cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  {isDeletingVcnv ? 'Đang xoá...' : 'Xác Nhận Xoá'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: CNV Details & 4 Horizontal Rows + Center */}
                    <div className="lg:col-span-8 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                        <div>
                          <div className="text-xs font-bold text-sky-300 uppercase">
                            Chủ đề: {puz.title}
                          </div>
                          <div className="text-lg font-display font-extrabold text-white flex flex-wrap items-center gap-2 mt-0.5">
                            <span>Đáp án Chướng Ngại Vật:</span>
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono">
                              {puz.keywordDisplay}
                            </span>
                            <span className="text-xs font-mono text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                              {puz.charCount} chữ cái
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-400">
                          Biến thể chấp nhận:{' '}
                          <code className="text-amber-200 font-mono">
                            {puz.acceptedKeywords.join(' | ')}
                          </code>
                        </div>
                      </div>

                      {puz.summaryExplanation && (
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {puz.summaryExplanation}
                        </p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        {puz.rows.map((r) => (
                          <div
                            key={r.id}
                            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-sky-300">
                                Hàng ngang {r.id} ({r.charCount} chữ):
                              </span>
                              <span className="font-mono font-extrabold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                {r.displayWord}
                              </span>
                            </div>
                            <div className="text-slate-300 line-clamp-2">{r.question}</div>
                          </div>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-amber-300">
                            Ô Trung Tâm ({puz.centerQuestion.charCount} chữ):
                          </span>
                          <span className="font-mono font-extrabold text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-amber-500/40">
                            {puz.centerQuestion.displayWord}
                          </span>
                        </div>
                        <div className="text-slate-300 line-clamp-2">
                          {puz.centerQuestion.question}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Editor for VCNV Image, Keyword, and Horizontal Rows */}
                  {isEditingThisVcnv && editVcnvForm && (
                    <div className="p-5 bg-slate-900 border-2 border-amber-400/70 rounded-xl space-y-4 text-xs mt-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div className="text-sm font-extrabold text-amber-300 uppercase">
                          ✏️ Chỉnh sửa Ảnh & Đáp án Chướng Ngại Vật (Olympia {editVcnvForm.season} ·{' '}
                          {editVcnvForm.match})
                        </div>
                        <span className="font-mono font-bold text-emerald-300">
                          Số chữ cái CNV tự động tính:{' '}
                          {
                            editVcnvForm.keywordDisplay
                              .split('/')[0]
                              .trim()
                              .replace(/\s+/g, '').length
                          }{' '}
                          chữ cái
                        </span>
                      </div>

                      {/* 1. Edit Obstacle Answer & Title */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-emerald-300 mb-1">
                            Đáp án Chướng Ngại Vật (Từ khóa chính):
                          </label>
                          <input
                            type="text"
                            value={editVcnvForm.keywordDisplay}
                            onChange={(e) =>
                              setEditVcnvForm((prev) =>
                                prev ? { ...prev, keywordDisplay: e.target.value } : prev
                              )
                            }
                            className="w-full px-3 py-2 bg-slate-950 border-2 border-emerald-400 rounded-lg text-white font-mono font-extrabold text-sm focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-amber-300 mb-1">
                            Biến thể đáp án CNV chấp nhận (phân cách bởi |):
                          </label>
                          <input
                            type="text"
                            value={editVcnvForm.acceptedKeywordsText}
                            onChange={(e) =>
                              setEditVcnvForm((prev) =>
                                prev ? { ...prev, acceptedKeywordsText: e.target.value } : prev
                              )
                            }
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-300 mb-1">
                            Chủ đề bộ đề VCNV:
                          </label>
                          <input
                            type="text"
                            value={editVcnvForm.title}
                            onChange={(e) =>
                              setEditVcnvForm((prev) =>
                                prev ? { ...prev, title: e.target.value } : prev
                              )
                            }
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* 2. Edit Obstacle Image (URL, File Upload, or Preset Gallery) */}
                      <div className="p-4 bg-slate-950 border border-sky-500/40 rounded-xl space-y-3">
                        <div className="text-xs font-extrabold text-sky-300 uppercase">
                          🖼️ Thay đổi Hình ảnh Chướng Ngại Vật (1 ảnh thống nhất mở dần 4 góc + ô
                          trung tâm)
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                          <div className="sm:col-span-6">
                            <label className="block text-slate-300 font-semibold mb-1">
                              Dán Link URL Ảnh hoặc đường dẫn ảnh:
                            </label>
                            <input
                              type="text"
                              value={editVcnvForm.imageUrl}
                              onChange={(e) =>
                                setEditVcnvForm((prev) =>
                                  prev ? { ...prev, imageUrl: e.target.value } : prev
                                )
                              }
                              placeholder="https://... hoặc /assets/vcnv/vcnv-1.jpg"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sky-200 font-mono text-xs focus:outline-none focus:border-sky-400"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-slate-300 font-semibold mb-1">
                              Hoặc chọn nhanh từ Kho ảnh sẵn có:
                            </label>
                            <select
                              value=""
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val) {
                                  setEditVcnvForm((prev) =>
                                    prev ? { ...prev, imageUrl: val } : prev
                                  );
                                }
                              }}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                            >
                              <option value="">-- Chọn tranh VCNV mẫu --</option>
                              {BUILTIN_VCNV_PRESET_IMAGES.map((img) => (
                                <option key={img.url} value={img.url}>
                                  {img.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-3">
                            <input
                              ref={vcnvImageUploadRef}
                              type="file"
                              accept="image/*"
                              onChange={handleVcnvLocalImageUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => vcnvImageUploadRef.current?.click()}
                              className="w-full py-2 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/60 text-sky-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Tải Ảnh Từ Máy Lên
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">
                            Giải thích ý nghĩa Chướng Ngại Vật:
                          </label>
                          <input
                            type="text"
                            value={editVcnvForm.summaryExplanation}
                            onChange={(e) =>
                              setEditVcnvForm((prev) =>
                                prev ? { ...prev, summaryExplanation: e.target.value } : prev
                              )
                            }
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* 3. Edit 4 Horizontal Rows & Center Question */}
                      <div className="space-y-2.5">
                        <div className="text-xs font-extrabold text-amber-300 uppercase">
                          Chỉnh sửa 4 Hàng Ngang & Ô Trung Tâm (Số chữ cái tự động chuẩn hóa theo
                          đáp án):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {editVcnvForm.rows.map((rowItem, rIdx) => {
                            const exactLen = rowItem.displayWord
                              .split('/')[0]
                              .trim()
                              .replace(/\s+/g, '').length;
                            return (
                              <div
                                key={rowItem.id}
                                className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-sky-300">
                                    Hàng ngang số {rowItem.id}
                                  </span>
                                  <span className="font-mono font-bold text-amber-300">
                                    {exactLen} chữ cái
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  value={rowItem.displayWord}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditVcnvForm((prev) => {
                                      if (!prev) return prev;
                                      const nextRows = [...prev.rows];
                                      nextRows[rIdx] = { ...nextRows[rIdx], displayWord: val };
                                      return { ...prev, rows: nextRows };
                                    });
                                  }}
                                  placeholder="Đáp án hàng ngang..."
                                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-emerald-500/50 rounded-lg text-emerald-300 font-mono font-bold text-xs"
                                />
                                <textarea
                                  rows={2}
                                  value={rowItem.question}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditVcnvForm((prev) => {
                                      if (!prev) return prev;
                                      const nextRows = [...prev.rows];
                                      nextRows[rIdx] = { ...nextRows[rIdx], question: val };
                                      return { ...prev, rows: nextRows };
                                    });
                                  }}
                                  placeholder="Câu hỏi hàng ngang..."
                                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                                />
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-300">
                              Câu hỏi & Đáp án Ô Trung Tâm (Mảnh ghép số 5)
                            </span>
                            <span className="font-mono font-bold text-amber-300">
                              {
                                editVcnvForm.centerQuestion.displayWord
                                  .split('/')[0]
                                  .trim()
                                  .replace(/\s+/g, '').length
                              }{' '}
                              chữ cái
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <input
                              type="text"
                              value={editVcnvForm.centerQuestion.displayWord}
                              onChange={(e) =>
                                setEditVcnvForm((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        centerQuestion: {
                                          ...prev.centerQuestion,
                                          displayWord: e.target.value,
                                        },
                                      }
                                    : prev
                                )
                              }
                              placeholder="Đáp án Ô Trung Tâm..."
                              className="px-2.5 py-1.5 bg-slate-900 border border-amber-400/60 rounded-lg text-amber-300 font-mono font-bold text-xs"
                            />
                            <input
                              type="text"
                              value={editVcnvForm.centerQuestion.question}
                              onChange={(e) =>
                                setEditVcnvForm((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        centerQuestion: {
                                          ...prev.centerQuestion,
                                          question: e.target.value,
                                        },
                                      }
                                    : prev
                                )
                              }
                              placeholder="Nội dung câu hỏi Ô Trung Tâm..."
                              className="sm:col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingVcnvKey(null);
                            setEditVcnvForm(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          disabled={isSavingVcnv}
                          onClick={handleSaveVcnvPuzzle}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer shadow-lg"
                        >
                          <Save className="w-4 h-4" />
                          {isSavingVcnv
                            ? 'Đang lưu bộ Chướng Ngại Vật...'
                            : 'Lưu Ảnh & Đáp Án Chướng Ngại Vật'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: SELECT QUESTION DECK ==================== */}
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

      {/* ==================== TAB 4: UPLOAD & CONVERT LARGE CSV ==================== */}
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
              </div>
            ) : (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="text-sm font-bold text-white">
                  Hướng dẫn Quản lý & Chỉnh sửa Kho Câu Hỏi Olympia:
                </div>
                <p>
                  • <strong>Sửa câu hỏi / đáp án:</strong> Tại mục{' '}
                  <code className="text-amber-300">1. Tra Cứu & Sửa Câu Hỏi / Đáp Án</code>, bạn có
                  thể tìm bất kỳ câu hỏi nào và nhấn nút <strong>Sửa Câu Hỏi / Đáp Án</strong> để cập
                  nhật nội dung câu hỏi, đáp án chính thức và biến thể chấm đúng.
                </p>
                <p>
                  • <strong>Tra cứu & Sửa Ảnh / Đáp án Chướng Ngại Vật:</strong> Tại mục{' '}
                  <code className="text-amber-300">
                    2. Tra Cứu & Sửa Ảnh / Đáp Án Chướng Ngại Vật (VCNV)
                  </code>
                  , bạn có thể xem toàn bộ 162 bộ Chướng Ngại Vật kèm hình ảnh gợi ý, đổi ảnh từ máy
                  tính hoặc link URL, và chỉnh sửa đáp án CNV cùng 4 hàng ngang.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
