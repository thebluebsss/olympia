import { extractAnswerVariants } from '../../data/olympiaQuestions.ts';

export interface BankQuestionRecord {
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

export interface UploadConversionReport {
  fileName: string;
  mode: 'merge' | 'replace';
  totalRowsParsed: number;
  validQuestionsConverted: number;
  skippedMalformedCount: number;
  addedOrUpdatedCount: number;
  totalBankSizeAfter: number;
  byRound: Record<string, number>;
  bySubject: Record<string, number>;
  bySeason: Record<string, number>;
  sampleConverted: BankQuestionRecord[];
  timestamp: string;
}

const SUBJECT_VI_MAP: Record<string, string> = {
  Math: 'Toán học',
  Physics: 'Vật lý',
  Chemistry: 'Hóa học',
  Biology: 'Sinh học',
  Literature: 'Văn học',
  History: 'Lịch sử',
  Geography: 'Địa lý',
  English: 'Tiếng Anh',
  'General/Social': 'Hiểu biết chung',
  'Art/Sports': 'Nghệ thuật & Thể thao',
  'Logic/IQ': 'Tư duy Logic',
};

export function mapSubjectToVietnamese(rawSubject: string): string {
  const trimmed = (rawSubject || '').trim();
  if (!trimmed) return 'Hiểu biết chung';
  return SUBJECT_VI_MAP[trimmed] || trimmed;
}

export function parseCsvString(csvText: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let inQuotes = false;
  const startIdx = csvText.charCodeAt(0) === 0xfeff ? 1 : 0;

  for (let i = startIdx; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(cur);
        cur = '';
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        row.push(cur);
        if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
          rows.push(row);
        }
        row = [];
        cur = '';
      } else {
        cur += ch;
      }
    }
  }

  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

export function escapeCsvCell(val: string): string {
  const s = String(val ?? '')
    .replace(/\r?\n/g, ' ')
    .trim();
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function parseRawOlympiaAnswer(
  rawAnswer: string,
  season: string,
  match: string,
  categoryVi: string
): {
  officialAnswer: string;
  explanation: string;
  acceptedAnswers: string[];
  isValid: boolean;
} {
  const trimmed = (rawAnswer || '').trim();
  if (!trimmed || trimmed.startsWith('(')) {
    return {
      officialAnswer: '',
      explanation: '',
      acceptedAnswers: [],
      isValid: false,
    };
  }

  let officialAnswer = trimmed;
  let extractedExplanation = '';

  const firstParen = trimmed.indexOf('(');
  if (firstParen > 0 && trimmed.endsWith(')')) {
    const before = trimmed.slice(0, firstParen).trim();
    const inside = trimmed.slice(firstParen + 1, -1).trim();
    if (before && (inside.length > 20 || inside.includes('='))) {
      officialAnswer = before;
      extractedExplanation = inside;
    }
  }

  const acceptedAnswers = extractAnswerVariants(officialAnswer);
  const matchLabel = match ? ` · Trận ${match}` : '';
  const seasonLabel = season
    ? `Olympia Mùa ${season}${matchLabel}`
    : 'Ngân hàng câu hỏi Olympia';

  const explanation = extractedExplanation
    ? `${extractedExplanation}`
    : `Đáp án chính thức từ ngân hàng đề thi ${seasonLabel} (Lĩnh vực: ${categoryVi}).`;

  return {
    officialAnswer,
    explanation,
    acceptedAnswers,
    isValid: Boolean(officialAnswer),
  };
}

/**
 * Strips giveaway hints, formulas, and parenthetical years from Tăng Tốc question stems and clues.
 */
export function sanitizeTangTocQuestionAndClues(rawQuestion: string): {
  mainQuestion: string;
  clues: string[];
} {
  // Remove inline parenthetical hints like "(Gợi ý: ...)" or "(Công thức: ...)"
  const cleanedRaw = rawQuestion
    .replace(/\(\s*(?:gợi ý|công thức|quy luật|hướng dẫn)[^)]*\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = cleanedRaw
    .split(' | ')
    .map((s) => s.trim())
    .filter(Boolean);

  const mainQuestion = parts[0] || cleanedRaw;
  const rawClues = parts.slice(1);

  const filteredClues = rawClues
    .filter((clue) => {
      const lower = clue.toLowerCase();
      if (
        lower.startsWith('gợi ý') ||
        lower.startsWith('quy luật') ||
        lower.startsWith('công thức') ||
        lower.startsWith('áp dụng') ||
        lower.startsWith('tính:') ||
        lower.startsWith('đổi đơn vị') ||
        lower.startsWith('xác định số') ||
        lower.startsWith('mỗi trận đấu là') ||
        lower.startsWith('lĩnh vực:') ||
        lower.includes('gợi ý định dạng')
      ) {
        return false;
      }
      return true;
    })
    .map((clue) => {
      // If it is a chronological sorting option like "A. Nhà Trần (1225 – 1400)", strip parenthetical year ranges
      if (/^[A-D]\.\s+/i.test(clue)) {
        return clue
          .replace(/\s*\((?:[^)]*\d{3,4}[^)]*|thời\s+[^)]+)\)/gi, '')
          .trim();
      }
      return clue;
    });

  return { mainQuestion, clues: filteredClues };
}

export function classifyVeDichPoints(
  rawQuestion: string,
  rawAnswer: string,
  rawQid: string,
  subCode: string,
  officialAnswer: string
): 20 | 30 {
  const qLower = rawQuestion.toLowerCase();
  if (qLower.includes('30 điểm') || rawQid.includes('VD30')) return 30;
  if (qLower.includes('20 điểm') || rawQid.includes('VD20')) return 20;

  const firstParen = rawAnswer.indexOf('(');
  const hasStepByStepSolution =
    firstParen > 0 &&
    rawAnswer.endsWith(')') &&
    (rawAnswer.slice(firstParen + 1, -1).trim().length > 20 ||
      rawAnswer.slice(firstParen + 1, -1).includes('='));

  const calcKeywords = [
    'tính xác suất', 'bao nhiêu cách', 'bao nhiêu số', 'tìm tất cả',
    'tìm số tự nhiên', 'tìm số nguyên', 'tìm tổng', 'tính tổng',
    'tận cùng là chữ số', 'chia hết', 'chia cho', 'số dư',
    'lũy thừa bậc mấy', 'ước nguyên', 'bước sóng', 'băng thông',
    'tần số', 'chu kì', 'quãng đường', 'vận tốc', 'gia tốc',
    'khối lượng', 'thể tích', 'nồng độ', 'hiệu suất', 'phần trăm',
    'tỉ lệ', 'xác định', 'tính giá trị', 'tính diện tích',
    'tính chu vi', 'mấy lần',
  ];
  const hasCalcKeyword = calcKeywords.some((kw) => qLower.includes(kw));

  const qMarkCount = (rawQuestion.match(/\?/g) || []).length;
  const isOrderedMultiPart =
    qMarkCount >= 2 ||
    qLower.includes('lần lượt') ||
    qLower.includes('kể tên ba ') ||
    qLower.includes('ba quốc gia') ||
    qLower.includes('ba tác phẩm') ||
    qLower.includes('bốn chữ số');

  const commaCount = officialAnswer
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean).length;
  const hasThreePlusEntities = commaCount >= 3 && rawQuestion.length >= 120;

  if (
    hasStepByStepSolution ||
    hasCalcKeyword ||
    isOrderedMultiPart ||
    hasThreePlusEntities ||
    rawQuestion.length >= 215 ||
    (subCode.includes('.3') && rawQuestion.length >= 165)
  ) {
    return 30;
  }
  return 20;
}
