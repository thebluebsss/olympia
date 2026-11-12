const fs = require('fs');
const path = require('path');

// Parse CSV file
function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    fields.push(currentField);
    
    if (fields.length >= 7) {
      rows.push({
        qid: fields[0],
        season: fields[1],
        match: fields[2],
        round: fields[3],
        subject: fields[4],
        question: fields[5],
        answer: fields[6],
      });
    }
  }
  
  return rows;
}

// Normalize Vietnamese text
function normalizeViText(input) {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'[\]\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Generate accepted answers
function generateAcceptedAnswers(answer) {
  const variations = new Set();
  variations.add(normalizeViText(answer));
  
  // Remove diacritics
  const noDiacritics = answer
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();
  
  variations.add(noDiacritics);
  
  // Handle parenthetical like "Bạc (Ag)"
  const parenMatch = answer.match(/^([^(]+)\(([^)]+)\)/);
  if (parenMatch) {
    variations.add(normalizeViText(parenMatch[1]));
    variations.add(normalizeViText(parenMatch[2]));
  }
  
  return Array.from(variations);
}

// Subject mapping
const subjectMap = {
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

// Main conversion
function main() {
  const csvPath = path.join(__dirname, '..', 'questions.csv');
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'olympiaQuestionsFromCsv.ts');
  
  console.log('Reading CSV file:', csvPath);
  const rows = parseCsv(csvPath);
  console.log(`Parsed ${rows.length} questions`);
  
  // Count by round
  const roundCounts = {};
  rows.forEach(row => {
    roundCounts[row.round] = (roundCounts[row.round] || 0) + 1;
  });
  
  console.log('\nQuestions by round:');
  Object.entries(roundCounts).forEach(([round, count]) => {
    console.log(`  ${round}: ${count} questions`);
  });
  
  // Group by round
  const khoiDongRows = rows.filter(r => r.round === 'KD');
  const vcnvRows = rows.filter(r => r.round === 'VCNV');
  const veDichRows = rows.filter(r => r.round === 'VD');
  
  // Convert Khởi Động
  const khoiDongQuestions = khoiDongRows.map((row, index) => ({
    id: `kd-csv-${index + 1}`,
    category: subjectMap[row.subject] || row.subject,
    question: row.question,
    answer: row.answer,
    acceptedAnswers: generateAcceptedAnswers(row.answer),
    options: [],
    explanation: `Từ ${row.match} - ${row.qid}`,
  }));
  
  // Convert Về Đích
  const veDichQuestions = veDichRows.map((row, index) => ({
    id: `vd-csv-${index + 1}`,
    category: subjectMap[row.subject] || row.subject,
    question: row.question,
    answer: row.answer,
    acceptedAnswers: generateAcceptedAnswers(row.answer),
    options: [],
    points: 20,
    explanation: `Từ ${row.match} - ${row.qid}`,
  }));
  
  // Generate TypeScript file
  const tsContent = `// Auto-generated from questions.csv
// Generated at: ${new Date().toISOString()}
// Total questions: ${rows.length}

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  acceptedAnswers: string[];
  options: string[];
  explanation: string;
}

export interface FinishQuestion extends QuizQuestion {
  points: 20 | 30;
}

// ==================== KHỞI ĐỘNG (${khoiDongQuestions.length} câu) ====================
export const KHOI_DONG_QUESTIONS_CSV: QuizQuestion[] = ${JSON.stringify(khoiDongQuestions, null, 2)};

// ==================== VỀ ĐÍCH (${veDichQuestions.length} câu) ====================
export const VE_DICH_QUESTIONS_CSV: FinishQuestion[] = ${JSON.stringify(veDichQuestions, null, 2)};

// ==================== VƯỢT CHƯỚNG NGẠI VẬT ====================
// VCNV questions from CSV (${vcnvRows.length} câu)
// These need manual organization into obstacle puzzles
export const VCNV_RAW_DATA = ${JSON.stringify(vcnvRows.map(r => ({
    id: r.qid,
    question: r.question,
    answer: r.answer,
    acceptedAnswers: generateAcceptedAnswers(r.answer),
  })), null, 2)};

// Summary statistics
export const CSV_STATISTICS = {
  totalQuestions: ${rows.length},
  khoiDong: ${khoiDongQuestions.length},
  vcnv: ${vcnvRows.length},
  veDich: ${veDichQuestions.length},
  byMatch: ${JSON.stringify(
    rows.reduce((acc, row) => {
      acc[row.match] = (acc[row.match] || 0) + 1;
      return acc;
    }, {}), null, 2
  )},
};
`;
  
  fs.writeFileSync(outputPath, tsContent, 'utf-8');
  console.log(`\n✅ Generated ${outputPath}`);
  console.log(`\nSummary:`);
  console.log(`  Khởi Động: ${khoiDongQuestions.length} questions`);
  console.log(`  VCNV: ${vcnvRows.length} questions`);
  console.log(`  Về Đích: ${veDichQuestions.length} questions`);
  console.log(`  Total: ${rows.length} questions`);
}

main();
