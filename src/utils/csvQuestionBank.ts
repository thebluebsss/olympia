import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  OBSTACLE_PUZZLES,
  TANG_TOC_QUESTIONS,
} from '../data/olympiaQuestions.ts';
import type { RoomQuestionDeck, QuestionDeckMode } from '../types/olympia.ts';
import {
  type BankQuestionRecord,
  type UploadConversionReport,
  mapSubjectToVietnamese,
  parseCsvString,
  escapeCsvCell,
  parseRawOlympiaAnswer,
  classifyVeDichPoints,
} from './csv/csvParser.ts';
import { buildRoomQuestionDeckFromRecords } from './csv/deckBuilder.ts';
import { completeAllHistoricalVcnvMatches } from '../data/vcnvHistoricalSupplements.ts';

export {
  type BankQuestionRecord,
  type UploadConversionReport,
  mapSubjectToVietnamese,
  parseCsvString,
  parseRawOlympiaAnswer,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const DEFAULT_CSV_PATH = path.join(
  PROJECT_ROOT,
  'public/assets/aistudio/questions_7b1e9b9b.csv'
);
const NEW_QUESTIONS_CSV_PATH = path.join(
  PROJECT_ROOT,
  'public/assets/aistudio/olympia_new_questions.csv'
);
const CUSTOM_QUESTIONS_CACHE_PATH = path.join(
  PROJECT_ROOT,
  '.olympia-custom-questions.json'
);

class CsvQuestionBankManager {
  private questionsMap = new Map<string, BankQuestionRecord>();
  private uploadHistory: UploadConversionReport[] = [];
  private initialized = false;

  public init() {
    if (this.initialized) return;
    this.initialized = true;
    this.loadDefaultCsv();
    this.loadNewQuestionsCsvIfPresent();
    this.syncUpgradedVcnvAndTangTocIntoBank();
    this.loadCustomCacheFromDisk();
  }

  /**
   * Ensures all upgraded VCNV puzzles (indirect clues & images) and hint-free Tăng Tốc sets
   * override any older `26-VCNV` or `26-TT` records in the backend bank and CSV export.
   */
  private syncUpgradedVcnvAndTangTocIntoBank() {
    // Remove legacy hint-laden 26-TT records, while keeping 26-VCNV17..60 intact
    for (const key of Array.from(this.questionsMap.keys())) {
      if (key.startsWith('26-TT')) {
        this.questionsMap.delete(key);
      }
    }

    // Populate upgraded 16 VCNV sets (overrides 26-VCNV01..16)
    OBSTACLE_PUZZLES.forEach((puz, idx) => {
      const code = `VCNV${String(idx + 1).padStart(2, '0')}`;
      puz.rows.forEach((row) => {
        const qid = `26-${code}-VCNV-${row.id}`;
        this.questionsMap.set(qid, {
          qid,
          season: '26',
          match: code,
          round: 'VCNV',
          subCode: String(row.id),
          subjectRaw: 'General/Social',
          categoryVi: puz.title,
          question: row.question,
          officialAnswer: row.displayWord,
          acceptedAnswers: row.acceptedAnswers,
          explanation: row.explanation,
          sourceFile: 'olympia_new_questions.csv (Nâng cấp)',
        });
      });

      const ottQid = `26-${code}-VCNV-5`;
      this.questionsMap.set(ottQid, {
        qid: ottQid,
        season: '26',
        match: code,
        round: 'VCNV',
        subCode: '5',
        subjectRaw: 'General/Social',
        categoryVi: puz.title,
        question: puz.centerQuestion.question,
        officialAnswer: puz.centerQuestion.displayWord,
        acceptedAnswers: puz.centerQuestion.acceptedAnswers,
        explanation: puz.centerQuestion.explanation,
        sourceFile: 'olympia_new_questions.csv (Nâng cấp)',
      });

      const cnvQid = `26-${code}-VCNV-CNV`;
      this.questionsMap.set(cnvQid, {
        qid: cnvQid,
        season: '26',
        match: code,
        round: 'VCNV',
        subCode: 'CNV',
        subjectRaw: 'General/Social',
        categoryVi: puz.title,
        question: `[Chủ đề: ${puz.title} · Chướng ngại vật gồm ${puz.charCount} chữ cái] Từ 4 hàng ngang và Ô trung tâm, hãy tìm Từ khóa Chướng Ngại Vật!`,
        officialAnswer: puz.keywordDisplay,
        acceptedAnswers: puz.acceptedKeywords,
        explanation: puz.summaryExplanation,
        imageUrl: puz.imageUrl,
        sourceFile: 'olympia_new_questions.csv (Nâng cấp)',
      });
    });

    // Populate upgraded 10 Tăng Tốc sets (40 hint-free high-difficulty questions)
    TANG_TOC_QUESTIONS.forEach((tt, idx) => {
      const setNum = Math.floor(idx / 4) + 1;
      const code = `TT${String(setNum).padStart(2, '0')}`;
      const qid = `26-${code}-TT-${tt.number}`;
      const fullQ =
        tt.clues.length > 0
          ? `${tt.question} | ${tt.clues.join(' | ')}`
          : tt.question;
      this.questionsMap.set(qid, {
        qid,
        season: '26',
        match: code,
        round: 'TT',
        subCode: String(tt.number),
        subjectRaw: 'Logic/IQ',
        categoryVi: tt.typeLabel,
        question: fullQ,
        officialAnswer: tt.answer,
        acceptedAnswers: tt.acceptedAnswers,
        explanation: tt.explanation,
        sourceFile: 'olympia_new_questions.csv (Nâng cấp)',
      });
    });

    // Complete all historical Olympia VCNV matches (Seasons 19-26) with any missing rows 1..4, Center Question (Row 5), and CNV Keyword
    completeAllHistoricalVcnvMatches(this.questionsMap);
  }

  private loadDefaultCsv() {
    try {
      if (fs.existsSync(DEFAULT_CSV_PATH)) {
        const rawText = fs.readFileSync(DEFAULT_CSV_PATH, 'utf8');
        this.ingestCsvContent(
          rawText,
          'questions_7b1e9b9b.csv (Mặc định)',
          'merge',
          false
        );
      }
    } catch (err) {
      console.error('Failed to load default CSV question bank:', err);
    }
  }

  private loadNewQuestionsCsvIfPresent() {
    try {
      if (fs.existsSync(NEW_QUESTIONS_CSV_PATH)) {
        const rawText = fs.readFileSync(NEW_QUESTIONS_CSV_PATH, 'utf8');
        this.ingestCsvContent(
          rawText,
          'olympia_new_questions.csv (Bộ đề mới)',
          'merge',
          false
        );
      }
    } catch (err) {
      console.error('Failed to load olympia_new_questions.csv:', err);
    }
  }

  private loadCustomCacheFromDisk() {
    try {
      if (fs.existsSync(CUSTOM_QUESTIONS_CACHE_PATH)) {
        const raw = fs.readFileSync(CUSTOM_QUESTIONS_CACHE_PATH, 'utf8');
        const parsed = JSON.parse(raw) as {
          records?: BankQuestionRecord[];
          history?: UploadConversionReport[];
        };
        if (Array.isArray(parsed.records)) {
          for (const rec of parsed.records) {
            if (rec && rec.qid && !rec.qid.startsWith('26-TT') && !rec.qid.startsWith('26-VCNV')) {
              this.questionsMap.set(rec.qid, rec);
            }
          }
        }
        if (Array.isArray(parsed.history)) {
          this.uploadHistory = parsed.history;
        }
      }
    } catch {
      // ignore cache load errors
    }
  }

  private saveCustomCacheToDisk(customRecords: BankQuestionRecord[]) {
    try {
      fs.writeFileSync(
        CUSTOM_QUESTIONS_CACHE_PATH,
        JSON.stringify(
          {
            records: customRecords.slice(-15000),
            history: this.uploadHistory.slice(0, 20),
          },
          null,
          2
        ),
        'utf8'
      );
    } catch {
      // ignore disk write errors
    }
  }

  public resetToDefault(): UploadConversionReport {
    this.questionsMap.clear();
    this.uploadHistory = [];
    try {
      if (fs.existsSync(CUSTOM_QUESTIONS_CACHE_PATH)) {
        fs.unlinkSync(CUSTOM_QUESTIONS_CACHE_PATH);
      }
    } catch {
      // ignore
    }
    this.loadDefaultCsv();
    this.loadNewQuestionsCsvIfPresent();
    this.syncUpgradedVcnvAndTangTocIntoBank();
    return {
      fileName: 'questions_7b1e9b9b.csv + olympia_new_questions.csv',
      mode: 'replace',
      totalRowsParsed: this.questionsMap.size,
      validQuestionsConverted: this.questionsMap.size,
      skippedMalformedCount: 0,
      addedOrUpdatedCount: this.questionsMap.size,
      totalBankSizeAfter: this.questionsMap.size,
      byRound: this.getStats().byRound,
      bySubject: this.getStats().bySubject,
      bySeason: this.getStats().bySeason,
      sampleConverted: Array.from(this.questionsMap.values()).slice(-10),
      timestamp: new Date().toISOString(),
    };
  }

  public ingestCsvContent(
    csvText: string,
    fileName = 'uploaded.csv',
    mode: 'merge' | 'replace' = 'merge',
    recordHistory = true
  ): UploadConversionReport {
    const rows = parseCsvString(csvText);
    if (rows.length === 0) {
      throw new Error('File CSV trống hoặc không đúng định dạng.');
    }

    if (mode === 'replace') {
      this.questionsMap.clear();
    }

    const headerRow = rows[0].map((h) => h.trim().toLowerCase());
    const hasHeader =
      headerRow.includes('qid') ||
      headerRow.includes('question') ||
      headerRow.includes('cau_hoi') ||
      headerRow.includes('câu hỏi') ||
      headerRow.includes('answer') ||
      headerRow.includes('dap_an');

    const findColIdx = (candidates: string[], fallbackIdx: number): number => {
      if (!hasHeader) return fallbackIdx;
      for (const c of candidates) {
        const idx = headerRow.indexOf(c);
        if (idx !== -1) return idx;
      }
      return fallbackIdx;
    };

    const colQid = findColIdx(['qid', 'id', 'ma_cau_hoi'], 0);
    const colSeason = findColIdx(['season', 'mua', 'nam', 'olympia'], 1);
    const colMatch = findColIdx(['match', 'tran', 'bo_de'], 2);
    const colRound = findColIdx(['round', 'vong', 'phan_thi'], 3);
    const colSubject = findColIdx(
      ['subject', 'category', 'linh_vuc', 'mon', 'chude'],
      4
    );
    const colQuestion = findColIdx(
      ['question', 'cau_hoi', 'câu hỏi', 'noidung', 'de_bai'],
      5
    );
    const colAnswer = findColIdx(
      ['answer', 'dap_an', 'đáp án', 'dapan', 'ket_qua'],
      6
    );
    const colExplanation = findColIdx(
      ['explanation', 'giai_thich', 'giải thích', 'note'],
      -1
    );

    const startRow = hasHeader ? 1 : 0;
    let validQuestionsConverted = 0;
    let skippedMalformedCount = 0;
    const byRound: Record<string, number> = {};
    const bySubject: Record<string, number> = {};
    const bySeason: Record<string, number> = {};
    const sampleConverted: BankQuestionRecord[] = [];
    const newlyConverted: BankQuestionRecord[] = [];

    for (let i = startRow; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length < 2) {
        skippedMalformedCount++;
        continue;
      }

      let rawQid = '';
      let rawSeason = 'Custom';
      let rawMatch = 'Upload';
      let rawRound = 'KD';
      let rawSubject = 'General/Social';
      let rawQuestion = '';
      let rawAnswer = '';
      let rawExplicitExplanation = '';

      if (r.length === 2) {
        rawQid = `CSV-${Date.now()}-${i}`;
        rawQuestion = r[0] || '';
        rawAnswer = r[1] || '';
      } else if (r.length === 3 && !hasHeader) {
        rawQid = `CSV-${Date.now()}-${i}`;
        rawSubject = r[0] || 'General/Social';
        rawQuestion = r[1] || '';
        rawAnswer = r[2] || '';
      } else {
        rawQid = (r[colQid] || `CSV-${i}`).trim();
        rawSeason = (r[colSeason] || 'Custom').trim();
        rawMatch = (r[colMatch] || 'M1').trim();
        rawRound = (r[colRound] || 'KD').trim().toUpperCase();
        rawSubject = (r[colSubject] || 'General/Social').trim();
        rawQuestion = (r[colQuestion] || '').trim();
        rawAnswer = (r[colAnswer] || '').trim();
        if (colExplanation >= 0 && r[colExplanation]) {
          rawExplicitExplanation = r[colExplanation].trim();
        }
      }

      if (!rawQuestion || !rawAnswer) {
        skippedMalformedCount++;
        continue;
      }

      let normalizedRound: 'KD' | 'VCNV' | 'TT' | 'VD' = 'KD';
      if (
        rawRound.includes('VCNV') ||
        rawRound === '2' ||
        rawQid.includes('-VCNV-')
      ) {
        normalizedRound = 'VCNV';
      } else if (
        rawRound.includes('TT') ||
        rawRound.includes('TĂNG TỐC') ||
        rawRound === '3' ||
        rawQid.includes('-TT-')
      ) {
        normalizedRound = 'TT';
      } else if (
        rawRound.includes('VD') ||
        rawRound.includes('VỀ ĐÍCH') ||
        rawRound === '4' ||
        rawQid.includes('-VD-')
      ) {
        normalizedRound = 'VD';
      }

      let extractedImageUrl: string | undefined = undefined;
      const imgMatch = rawQuestion.match(/\[IMAGE:([^\]]+)\]/i);
      if (imgMatch) {
        extractedImageUrl = imgMatch[1].trim();
        rawQuestion = rawQuestion.replace(/\[IMAGE:[^\]]+\]/gi, '').trim();
      }

      const categoryVi = mapSubjectToVietnamese(rawSubject);
      const parsedAns = parseRawOlympiaAnswer(
        rawAnswer,
        rawSeason,
        rawMatch,
        categoryVi
      );

      if (!parsedAns.isValid) {
        skippedMalformedCount++;
        continue;
      }

      const qidParts = rawQid.split(`-${normalizedRound}-`);
      const subCode = qidParts.length > 1 ? qidParts[1] : `${i}`;

      const points =
        normalizedRound === 'VD'
          ? classifyVeDichPoints(
              rawQuestion,
              rawAnswer,
              rawQid,
              subCode,
              parsedAns.officialAnswer
            )
          : undefined;

      const record: BankQuestionRecord = {
        qid: rawQid,
        season: rawSeason,
        match: rawMatch,
        round: normalizedRound,
        subCode,
        subjectRaw: rawSubject,
        categoryVi,
        question: rawQuestion,
        officialAnswer: parsedAns.officialAnswer,
        acceptedAnswers: parsedAns.acceptedAnswers,
        explanation: rawExplicitExplanation || parsedAns.explanation,
        points,
        imageUrl: extractedImageUrl,
        sourceFile: fileName,
      };

      this.questionsMap.set(record.qid, record);
      validQuestionsConverted++;
      byRound[normalizedRound] = (byRound[normalizedRound] || 0) + 1;
      bySubject[categoryVi] = (bySubject[categoryVi] || 0) + 1;
      bySeason[rawSeason] = (bySeason[rawSeason] || 0) + 1;

      if (sampleConverted.length < 12) {
        sampleConverted.push(record);
      }
      if (recordHistory) {
        newlyConverted.push(record);
      }
    }

    const report: UploadConversionReport = {
      fileName,
      mode,
      totalRowsParsed: Math.max(0, rows.length - startRow),
      validQuestionsConverted,
      skippedMalformedCount,
      addedOrUpdatedCount: validQuestionsConverted,
      totalBankSizeAfter: this.questionsMap.size,
      byRound,
      bySubject,
      bySeason,
      sampleConverted,
      timestamp: new Date().toISOString(),
    };

    if (recordHistory) {
      this.uploadHistory.unshift(report);
      if (this.uploadHistory.length > 20) {
        this.uploadHistory.length = 20;
      }
      this.saveCustomCacheToDisk(newlyConverted);
    }

    return report;
  }

  public getStats() {
    this.init();
    const byRound: Record<string, number> = { KD: 0, VCNV: 0, TT: 0, VD: 0 };
    const bySubject: Record<string, number> = {};
    const bySeason: Record<string, number> = {};
    const matchesBySeason: Record<string, Set<string>> = {};

    for (const q of this.questionsMap.values()) {
      byRound[q.round] = (byRound[q.round] || 0) + 1;
      bySubject[q.categoryVi] = (bySubject[q.categoryVi] || 0) + 1;
      bySeason[q.season] = (bySeason[q.season] || 0) + 1;
      if (!matchesBySeason[q.season]) {
        matchesBySeason[q.season] = new Set();
      }
      matchesBySeason[q.season].add(q.match);
    }

    const seasonsList = Object.keys(matchesBySeason)
      .sort((a, b) => Number(b) - Number(a))
      .map((s) => ({
        season: s,
        questionCount: bySeason[s] || 0,
        matches: Array.from(matchesBySeason[s]).sort(),
      }));

    const totalMatches = seasonsList.reduce(
      (acc, item) => acc + item.matches.length,
      0
    );

    return {
      totalQuestions: this.questionsMap.size,
      totalMatches,
      byRound,
      bySubject,
      bySeason,
      seasonsList,
      uploadHistory: this.uploadHistory,
    };
  }

  public searchQuestions(params: {
    q?: string;
    season?: string;
    match?: string;
    round?: string;
    subject?: string;
    page?: number;
    limit?: number;
  }) {
    this.init();
    const keyword = (params.q || '').trim().toLowerCase();
    const seasonFilter = (params.season || '').trim();
    const matchFilter = (params.match || '').trim();
    const roundFilter = (params.round || '').trim().toUpperCase();
    const subjectFilter = (params.subject || '').trim();
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(5000, Math.max(1, Number(params.limit) || 25));

    const matched: BankQuestionRecord[] = [];
    for (const item of this.questionsMap.values()) {
      if (seasonFilter && item.season !== seasonFilter) continue;
      if (matchFilter && item.match !== matchFilter) continue;
      if (roundFilter && item.round !== roundFilter) continue;
      if (
        subjectFilter &&
        item.categoryVi !== subjectFilter &&
        item.subjectRaw !== subjectFilter
      ) {
        continue;
      }
      if (keyword) {
        const hay = `${item.qid} ${item.match} ${item.question} ${item.officialAnswer} ${item.categoryVi}`.toLowerCase();
        if (!hay.includes(keyword)) continue;
      }
      matched.push(item);
    }

    if (roundFilter === 'VCNV') {
      const subRank = (sc: string): number => {
        const up = sc.toUpperCase();
        if (up === '1') return 1;
        if (up === '2') return 2;
        if (up === '3') return 3;
        if (up === '4') return 4;
        if (up === '5' || up === 'OTT' || up === 'CENTER') return 5;
        if (up === 'CNV' || up === 'KEYWORD') return 6;
        return 7;
      };
      matched.sort((a, b) => {
        const sDiff = (parseInt(b.season, 10) || 0) - (parseInt(a.season, 10) || 0);
        if (sDiff !== 0) return sDiff;
        if (a.match !== b.match) {
          const aIsVcnv = a.match.startsWith('VCNV') ? 1 : 0;
          const bIsVcnv = b.match.startsWith('VCNV') ? 1 : 0;
          if (aIsVcnv !== bIsVcnv) return bIsVcnv - aIsVcnv;
          return a.match.localeCompare(b.match, undefined, { numeric: true });
        }
        return subRank(a.subCode) - subRank(b.subCode);
      });
    } else {
      matched.reverse();
    }

    const total = matched.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const items = matched.slice(offset, offset + limit);

    return {
      total,
      page,
      limit,
      totalPages,
      items,
    };
  }

  public exportQuestions(params: {
    season?: string;
    match?: string;
    round?: string;
    limit?: number;
  }) {
    this.init();
    return this.searchQuestions({
      season: params.season,
      match: params.match,
      round: params.round,
      page: 1,
      limit: params.limit || 5000,
    }).items;
  }

  public exportQuestionsAsCsv(params?: {
    season?: string;
    match?: string;
    round?: string;
    onlyNew?: boolean;
  }): string {
    this.init();
    const header = 'qid,season,match,round,subject,question,answer';
    const rows: string[] = [header];

    for (const rec of this.questionsMap.values()) {
      if (params?.season && rec.season !== params.season) continue;
      if (params?.match && rec.match !== params.match) continue;
      if (
        params?.round &&
        rec.round !== params.round.trim().toUpperCase()
      ) {
        continue;
      }
      if (
        params?.onlyNew &&
        !rec.qid.startsWith('26-NEW-') &&
        !rec.qid.startsWith('26-VCNV') &&
        !rec.qid.startsWith('26-TT')
      ) {
        continue;
      }

      const qText = rec.imageUrl
        ? `${rec.question} [IMAGE:${rec.imageUrl}]`
        : rec.question;
      const ansText =
        rec.explanation && !rec.explanation.startsWith('Đáp án chính thức')
          ? `${rec.officialAnswer} (${rec.explanation})`
          : rec.officialAnswer;

      rows.push(
        [
          rec.qid,
          rec.season,
          rec.match,
          rec.round,
          rec.subjectRaw,
          qText,
          ansText,
        ]
          .map(escapeCsvCell)
          .join(',')
      );
    }

    return rows.join('\n') + '\n';
  }

  public buildRoomQuestionDeck(options?: {
    roomCode?: string;
    deckSeed?: string;
    mode?: QuestionDeckMode;
    season?: string;
    match?: string;
    subjectFilter?: string;
  }): RoomQuestionDeck {
    this.init();
    return buildRoomQuestionDeckFromRecords(
      Array.from(this.questionsMap.values()),
      options
    );
  }
}

export const csvQuestionBank = new CsvQuestionBankManager();
