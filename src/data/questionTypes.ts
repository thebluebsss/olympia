export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  acceptedAnswers: string[];
  options: string[];
  explanation: string;
}

export interface ObstacleRow {
  id: number;
  rowLabel: string;
  charCount: number;
  question: string;
  displayWord: string;
  acceptedAnswers: string[];
  explanation: string;
}

export interface ObstaclePuzzle {
  id: string;
  title: string;
  keywordDisplay: string;
  charCount: number;
  acceptedKeywords: string[];
  imageUrl: string;
  rows: ObstacleRow[];
  centerQuestion: {
    question: string;
    displayWord: string;
    acceptedAnswers: string[];
    explanation: string;
  };
  summaryExplanation: string;
}

export interface AccelerationQuestion {
  id: string;
  number: 1 | 2 | 3 | 4;
  timeLimitSec: number;
  typeLabel: string;
  question: string;
  clues: string[];
  answer: string;
  acceptedAnswers: string[];
  options: string[];
  explanation: string;
  videoClipId?: string;
}

export interface FinishQuestion extends QuizQuestion {
  points: 20 | 30;
  videoClipId?: string;
}

export const LAUREL_WREATH_IMG =
  '/src/assets/images/olympia_laurel_wreath_1794066591261.jpg';

export function normalizeViText(input: string): string {
  return (input || '')
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(
      /^(đáp án của em là|đáp án của tôi là|câu trả lời của em là|đáp án là|câu trả lời là|đáp án|câu trả lời|em xin trả lời là|xin trả lời là|đó là|chính là|là)\s+/i,
      ''
    )
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'[\]\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeAsciiWords(input: string): string {
  const cleaned = normalizeViText(input);
  return cleaned
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeAnswer(input: string): string {
  return normalizeAsciiWords(input).replace(/\s+/g, '');
}

function normalizePhoneticAscii(input: string): string {
  return normalizeAsciiWords(input)
    .replace(/\bqui\b/g, 'quy')
    .replace(/([klmstnhv])y\b/g, '$1i')
    .replace(/hidro/g, 'hydro')
    .replace(/oxi/g, 'oxy')
    .replace(/axit/g, 'acid')
    .replace(/bazo/g, 'base')
    .replace(/cacbon/g, 'carbon')
    .replace(/kali/g, 'cali')
    .replace(/photpho/g, 'phospho')
    .replace(/\s+/g, '');
}

const COMMON_LEADING_CLASSIFIERS: string[] = [
  'hiện tượng', 'quá trình', 'phản ứng', 'phản xạ', 'hiệu ứng',
  'định luật', 'định lý', 'định lí', 'nguyên lý', 'nguyên lí',
  'giả thuyết', 'học thuyết', 'thuyết', 'phương pháp', 'phương trình',
  'công thức', 'hệ thống', 'cơ quan', 'tế bào', 'vi khuẩn', 'vi rút',
  'virus', 'hoóc môn', 'hormone', 'enzym', 'enzyme', 'hợp chất',
  'đơn chất', 'nguyên tố hóa học', 'nguyên tố', 'kim loại', 'phi kim',
  'dung dịch', 'chất khí', 'khí', 'chất', 'axit', 'acid', 'bazơ', 'bazo',
  'muối', 'oxit', 'gương', 'thấu kính', 'tia', 'sóng', 'lực', 'năng lượng',
  'điện trường', 'từ trường', 'vận tốc', 'gia tốc', 'áp suất', 'nhiệt độ',
  'hình đa diện', 'khối đa diện', 'hình', 'khối', 'đường cong', 'đường',
  'mặt phẳng', 'mặt', 'hàm số', 'dãy số', 'tập hợp', 'số', 'chiến dịch',
  'chiến thắng', 'trận đánh', 'trận', 'cuộc khởi nghĩa', 'khởi nghĩa',
  'cuộc cách mạng', 'cách mạng', 'phong trào', 'hiệp định', 'hiệp ước',
  'hội nghị', 'tổ chức', 'liên minh', 'cộng hòa', 'vương quốc', 'đế quốc',
  'nhà nước', 'triều đại', 'vương triều', 'triều', 'nhà', 'vua', 'hoàng đế',
  'chủ tịch', 'tổng thống', 'thủ tướng', 'đại tướng', 'danh nhân',
  'đại thi hào', 'nhà thơ', 'nhà văn', 'nhà bác học', 'nhà khoa học',
  'tác giả', 'tác phẩm', 'bài thơ', 'bài hát', 'ca khúc', 'tiểu thuyết',
  'truyện ngắn', 'truyện', 'vở kịch', 'bộ phim', 'thành phố', 'tp', 'tỉnh',
  'huyện', 'quận', 'xã', 'phường', 'thị xã', 'thị trấn', 'thủ đô',
  'quốc gia', 'đất nước', 'nước', 'châu lục', 'châu', 'lục địa',
  'đồng bằng', 'cao nguyên', 'sơn nguyên', 'bán đảo', 'quần đảo',
  'hòn đảo', 'đảo', 'hòn', 'mũi', 'vịnh', 'vùng biển', 'biển', 'đại dương',
  'eo biển', 'kênh đào', 'dòng sông', 'con sông', 'sông', 'hồ', 'suối',
  'thác', 'đèo', 'dãy núi', 'dãy', 'đỉnh núi', 'đỉnh', 'ngọn núi', 'núi',
  'hang', 'động', 'vườn quốc gia', 'khu dự trữ sinh quyển', 'chùa', 'đền',
  'tháp', 'cầu', 'cung', 'cố đô', 'phố cổ', 'di tích', 'danh thắng',
];

const ANTONYM_CONFLICT_PAIRS: [string, string][] = [
  ['co', 'khong'], ['loi', 'lom'], ['bac', 'nam'], ['dong', 'tay'],
  ['trai', 'phai'], ['tren', 'duoi'], ['trong', 'ngoai'], ['truoc', 'sau'],
  ['som', 'muon'], ['tang', 'giam'], ['duong', 'am'], ['chan', 'le'],
  ['thuan', 'nghich'], ['cung', 'nguoc'], ['hoi tu', 'phan ky'],
  ['thuc', 'ao'], ['axit', 'bazo'], ['acid', 'bazo'],
  ['kim loai', 'phi kim'], ['oxi hoa', 'khu'], ['vo co', 'huu co'],
  ['nhan thuc', 'nhan sơ'],
];

function hasAntonymConflict(userAsciiWords: string, candAsciiWords: string): boolean {
  const uTokens = new Set(userAsciiWords.split(' ').filter(Boolean));
  const cTokens = new Set(candAsciiWords.split(' ').filter(Boolean));
  for (const [a, b] of ANTONYM_CONFLICT_PAIRS) {
    const uHasA = a.includes(' ') ? userAsciiWords.includes(a) : uTokens.has(a);
    const uHasB = b.includes(' ') ? userAsciiWords.includes(b) : uTokens.has(b);
    const cHasA = a.includes(' ') ? candAsciiWords.includes(a) : cTokens.has(a);
    const cHasB = b.includes(' ') ? candAsciiWords.includes(b) : cTokens.has(b);
    if ((uHasA && cHasB && !cHasA) || (uHasB && cHasA && !cHasB)) {
      return true;
    }
  }
  return false;
}

function stripLeadingClassifiers(text: string): string[] {
  const results = new Set<string>();
  let current = normalizeViText(text);
  if (!current) return [];

  for (let pass = 0; pass < 2; pass++) {
    let strippedInPass = false;
    for (const prefix of COMMON_LEADING_CLASSIFIERS) {
      if (current.startsWith(prefix + ' ')) {
        const remainder = current.slice(prefix.length).trim();
        if (remainder.length >= 2) {
          results.add(remainder);
          current = remainder;
          strippedInPass = true;
          break;
        }
      }
    }
    if (!strippedInPass) break;
  }
  return Array.from(results);
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const temp = dp[i];
      if (a[i - 1] === b[j - 1]) {
        dp[i] = prev;
      } else {
        dp[i] = 1 + Math.min(prev, dp[i - 1], dp[i]);
      }
      prev = temp;
    }
  }
  return dp[a.length];
}

export function extractAnswerVariants(rawAnswer: string): string[] {
  if (!rawAnswer) return [];
  const variants = new Set<string>();
  const trimmed = rawAnswer.trim();
  if (!trimmed) return [];
  variants.add(trimmed);

  const parenIndex = trimmed.indexOf('(');
  let core = trimmed;
  if (parenIndex > 0) {
    const beforeParen = trimmed.slice(0, parenIndex).trim();
    const insideParen = trimmed
      .slice(parenIndex + 1, trimmed.lastIndexOf(')'))
      .trim();
    if (beforeParen) {
      core = beforeParen;
      variants.add(beforeParen);
    }
    if (insideParen && insideParen.length <= 28 && !insideParen.includes('=')) {
      variants.add(insideParen);
    }
  }

  if (core.includes(' / ') || core.includes('/') || core.includes(';')) {
    const isDateOrFraction = /^\d+\/\d+(\/\d+)?$/.test(core.trim());
    if (!isDateOrFraction) {
      const slashParts = core.split(/\s*[/;]\s*/);
      for (const part of slashParts) {
        if (part.trim()) variants.add(part.trim());
      }
    }
  }

  for (const v of Array.from(variants)) {
    for (const stripped of stripLeadingClassifiers(v)) {
      variants.add(stripped);
    }
  }

  for (const v of Array.from(variants)) {
    const collapsedDigits = v.replace(/(\d)\s+(\d)/g, '$1$2');
    variants.add(collapsedDigits);
    const numUnitMatch = collapsedDigits.match(
      /^(-?\d+(?:[.,]\d+)?)\s*(đồng|m|km|cm|mm|kg|g|s|giây|phút|giờ|ngày|ngày đêm|năm|tháng|tuần|độ|độ c|độ k|%|k|hz|khz|mhz|mmhg|atm|pa|j|kj|w|kw|v|a|ôm|ohm|mol|lít|ml|liên kết|liên kết hiđrô|liên kết hidro|nhiễm sắc thể|nst|cặp|hình|hình vuông|cái bắt tay|người|quốc gia|tỉnh|thành phố|hạt|đỉnh|câu|điểm|lần|vòng|chữ số|số|bộ)$/i
    );
    if (numUnitMatch && numUnitMatch[1]) {
      variants.add(numUnitMatch[1]);
    }
  }

  return Array.from(variants);
}

export function isAnswerMatch(
  userAnswer: string,
  acceptedList: string[],
  officialAnswer?: string
): boolean {
  if (!userAnswer || !userAnswer.trim()) return false;
  const userVi = normalizeViText(userAnswer);
  const userAsciiWords = normalizeAsciiWords(userAnswer);
  const userAscii = userAsciiWords.replace(/\s+/g, '');
  const userPhonetic = normalizePhoneticAscii(userAnswer);
  if (!userAscii) return false;

  const candidates = new Set<string>(acceptedList || []);
  if (officialAnswer) {
    for (const v of extractAnswerVariants(officialAnswer)) {
      candidates.add(v);
    }
  }
  for (const item of acceptedList || []) {
    for (const v of extractAnswerVariants(item)) {
      candidates.add(v);
    }
  }
  const userExpandedVi = [userVi, ...stripLeadingClassifiers(userVi)];
  const userExpandedAsciiWords = userExpandedVi.map((u) =>
    normalizeAsciiWords(u)
  );

  for (const cand of candidates) {
    if (!cand) continue;
    const candVi = normalizeViText(cand);
    const candAsciiWords = normalizeAsciiWords(cand);
    const candAscii = candAsciiWords.replace(/\s+/g, '');
    const candPhonetic = normalizePhoneticAscii(cand);
    if (!candAscii) continue;

    if (candVi === userVi) return true;
    if (candAscii === userAscii) return true;
    if (candPhonetic && candPhonetic === userPhonetic) return true;

    for (const uWords of userExpandedAsciiWords) {
      if (uWords && uWords.replace(/\s+/g, '') === candAscii) {
        return true;
      }
    }

    if (hasAntonymConflict(userAsciiWords, candAsciiWords)) {
      continue;
    }

    const uTokens = userAsciiWords.split(' ').filter(Boolean);
    const cTokens = candAsciiWords.split(' ').filter(Boolean);
    const hasDigits = /\d/.test(candAscii) || /\d/.test(userAscii);

    if (!hasDigits && cTokens.length >= 3 && uTokens.length >= 2 && uTokens.length < cTokens.length) {
      const tailSlice = cTokens.slice(cTokens.length - uTokens.length).join(' ');
      if (tailSlice === userAsciiWords) {
        return true;
      }
      if (
        uTokens.length >= Math.ceil(cTokens.length * 0.5) &&
        ` ${candAsciiWords} `.includes(` ${userAsciiWords} `) &&
        !COMMON_LEADING_CLASSIFIERS.includes(userVi)
      ) {
        return true;
      }
      if (uTokens.length >= 3 && uTokens.length >= cTokens.length - 1) {
        let matchCount = 0;
        let cIdx = 0;
        for (const ut of uTokens) {
          while (cIdx < cTokens.length && cTokens[cIdx] !== ut) {
            cIdx++;
          }
          if (cIdx < cTokens.length && cTokens[cIdx] === ut) {
            matchCount++;
            cIdx++;
          }
        }
        if (matchCount === uTokens.length) {
          return true;
        }
      }
    }

    if (
      !hasDigits &&
      cTokens.length >= 2 &&
      cTokens.length <= 3 &&
      uTokens.length === 1 &&
      uTokens[0].length >= 5 &&
      cTokens[cTokens.length - 1] === uTokens[0] &&
      !COMMON_LEADING_CLASSIFIERS.includes(userVi)
    ) {
      return true;
    }

    if (
      !hasDigits &&
      uTokens.length > cTokens.length &&
      uTokens.length <= cTokens.length + 4 &&
      cTokens.length >= 1 &&
      candAscii.length >= 3 &&
      ` ${userAsciiWords} `.includes(` ${candAsciiWords} `)
    ) {
      return true;
    }

    if (!hasDigits && candAscii.length >= 7 && userAscii.length >= 7) {
      const dist = levenshteinDistance(candPhonetic, userPhonetic);
      const maxAllowed = candAscii.length >= 12 ? 2 : 1;
      if (dist <= maxAllowed && candPhonetic[0] === userPhonetic[0]) {
        return true;
      }
    }
  }
  return false;
}
