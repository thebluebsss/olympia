import * as fs from 'fs';
import * as path from 'path';

interface CsvRow {
  qid: string;
  season: string;
  match: string;
  round: string;
  subject: string;
  question: string;
  answer: string;
}

interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  acceptedAnswers: string[];
  options: string[];
  explanation: string;
}

interface ObstacleRow {
  id: number;
  rowLabel: string;
  charCount: number;
  question: string;
  displayWord: string;
  acceptedAnswers: string[];
  explanation: string;
}

// Parse CSV file
function parseCsv(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  
  const rows: CsvRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // Handle CSV with quoted fields
    const row: any = {};
    let currentField = '';
    let inQuotes = false;
    let fieldIndex = 0;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row[headers[fieldIndex]] = currentField.trim();
        currentField = '';
        fieldIndex++;
      } else {
        currentField += char;
      }
    }
    
    // Add last field
    row[headers[fieldIndex]] = currentField.trim();
    
    rows.push(row as CsvRow);
  }
  
  return rows;
}

// Normalize Vietnamese text for matching
function normalizeViText(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'[\]\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Generate accepted answers variations
function generateAcceptedAnswers(answer: string): string[] {
  const normalized = normalizeViText(answer);
  const variations = [normalized];
  
  // Remove diacritics
  const noDiacritics = answer
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase();
  
  if (noDiacritics !== normalized) {
    variations.push(noDiacritics);
  }
  
  // Handle parenthetical like "Bạc (Ag)"
  const parenMatch = answer.match(/^([^(]+)\(([^)]+)\)/);
  if (parenMatch) {
    variations.push(normalizeViText(parenMatch[1]));
    variations.push(normalizeViText(parenMatch[2]));
  }
  
  return [...new Set(variations)];
}

// Subject mapping from CSV to Vietnamese
const subjectMap: Record<string, string> = {
  'Math': 'Toán học',
  'Physics': 'Vật lý',
  'Chemistry': 'Hóa học',
  'Biology': 'Sinh học',
  'Literature': 'Văn học',
  'History': 'Lịch sử',
  'Geography': 'Địa lý',
  'English': 'Tiếng Anh',
  'General/Social': 'Hiểu biết chung',
  'Art/Sports': 'Nghệ thuật & Thể thao',
  'Logic/IQ': 'Tư duy logic',
};

// Convert to Khởi Động questions
function convertToKhoiDong(rows: CsvRow[]): QuizQuestion[] {
  const kdRows = rows.filter(r => r.round === 'KD');
  
  return kdRows.map((row, index) => ({
    id: `kd-${row.qid}`,
    category: subjectMap[row.subject] || row.subject,
    question: row.question,
    answer: row.answer,
    acceptedAnswers: generateAcceptedAnswers(row.answer),
    options: [], // Options would need to be generated or provided separately
    explanation: `Câu hỏi từ ${row.match} - ${row.round}`,
  }));
}

// Convert to VCNV questions (these need special handling for keyword puzzles)
function convertToVCNV(rows: CsvRow[]): any[] {
  const vcnvRows = rows.filter(r => r.round === 'VCNV');
  
  // Group by match
  const grouped = vcnvRows.reduce((acc, row) => {
    if (!acc[row.match]) acc[row.match] = [];
    acc[row.match].push(row);
    return acc;
  }, {} as Record<string, CsvRow[]>);
  
  return Object.entries(grouped).map(([match, questions], index) => ({
    id: `vcnv-${index + 1}`,
    match,
    questions: questions.map(q => ({
      id: q.qid,
      question: q.question,
      answer: q.answer,
      acceptedAnswers: generateAcceptedAnswers(q.answer),
    })),
  }));
}

// Convert to Về Đích questions
function convertToVeDich(rows: CsvRow[]): any[] {
  const vdRows = rows.filter(r => r.round === 'VD');
  
  return vdRows.map((row, index) => ({
    id: `vd-${row.qid}`,
    category: subjectMap[row.subject] || row.subject,
    question: row.question,
    answer: row.answer,
    acceptedAnswers: generateAcceptedAnswers(row.answer),
    options: [],
    points: 20, // Default, can be adjusted based on qid pattern
    explanation: `Câu hỏi từ ${row.match} - ${row.round}`,
  }));
}

// Main conversion function
function convertCsvToQuestions() {
  const csvPath = path.join(__dirname, '..', 'questions.csv');
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'olympiaQuestionsFromCsv.ts');
  
  console.log('Reading CSV file:', csvPath);
  const rows = parseCsv(csvPath);
  console.log(`Parsed ${rows.length} questions`);
  
  // Count by round
  const roundCounts = rows.reduce((acc, row) => {
    acc[row.round] = (acc[row.round] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\nQuestions by round:');
  Object.entries(roundCounts).forEach(([round, count]) => {
    console.log(`  ${round}: ${count} questions`);
  });
  
  // Convert to different question types
  const khoiDongQuestions = convertToKhoiDong(rows);
  const vcnvData = convertToVCNV(rows);
  const veDichQuestions = convertToVeDich(rows);
  
  // Generate TypeScript file
  const tsContent = `// Auto-generated from questions.csv
// Generated at: ${new Date().toISOString()}

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  acceptedAnswers: string[];
  options: string[];
  explanation: string;
}

// ==================== KHỞI ĐỘNG ====================
export const KHOI_DONG_QUESTIONS_CSV: QuizQuestion[] = ${JSON.stringify(khoiDongQuestions, null, 2)};

// ==================== VƯỢT CHƯỚNG NGẠI VẬT ====================
// Note: VCNV questions need manual structuring into obstacle puzzles
export const VCNV_QUESTIONS_CSV = ${JSON.stringify(vcnvData, null, 2)};

// ==================== VỀ ĐÍCH ====================
export const VE_DICH_QUESTIONS_CSV = ${JSON.stringify(veDichQuestions, null, 2)};

// Summary statistics
export const CSV_STATISTICS = {
  totalQuestions: ${rows.length},
  khoiDong: ${khoiDongQuestions.length},
  vcnv: ${vcnvData.reduce((sum, g) => sum + g.questions.length, 0)},
  veDich: ${veDichQuestions.length},
};
`;
  
  fs.writeFileSync(outputPath, tsContent, 'utf-8');
  console.log(`\n✅ Generated ${outputPath}`);
  console.log(`\nSummary:`);
  console.log(`  Total questions: ${rows.length}`);
  console.log(`  Khởi Động: ${khoiDongQuestions.length}`);
  console.log(`  VCNV groups: ${vcnvData.length}`);
  console.log(`  Về Đích: ${veDichQuestions.length}`);
}

// Run the conversion
convertCsvToQuestions();
