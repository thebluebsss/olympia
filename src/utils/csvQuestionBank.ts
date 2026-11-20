import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  OBSTACLE_PUZZLES,
  TANG_TOC_QUESTIONS,
  extractAnswerVariants,
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
import {
  buildRoomQuestionDeckFromRecords,
  buildEditableVcnvPuzzlesFromBank,
  countObstacleLetters,
  syncQuestionTextWithExactCharCount,
  type EditableVcnvPuzzleRecord,
} from './csv/deckBuilder.ts';
import { completeAllHistoricalVcnvMatches } from '../data/vcnvHistoricalSupplements.ts';

export {
  type BankQuestionRecord,
  type UploadConversionReport,
  type EditableVcnvPuzzleRecord,
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
  private customOrEditedMap = new Map<string, BankQuestionRecord>();
  private deletedQids = new Set<string>();
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
   * override any older `26-VCNV` or `26-TT` records in the backend bank and CSV export,
   * and synchronizes exact character counts for all VCNV rows and keywords.
   */
  private syncUpgradedVcnvAndTangTocIntoBank() {
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
        const exactRowChars = countObstacleLetters(row.displayWord);
        this.questionsMap.set(qid, {
          qid,
          season: '26',
          match: code,
          round: 'VCNV',
          subCode: String(row.id),
          subjectRaw: 'General/Social',
          categoryVi: puz.title,
          question: syncQuestionTextWithExactCharCount(row.question, exactRowChars),
          officialAnswer: row.displayWord,
          acceptedAnswers: row.acceptedAnswers,
          explanation: row.explanation,
          sourceFile: 'olympia_new_questions.csv (Nâng cấp)',
        });
      });

      const ottQid = `26-${code}-VCNV-5`;
      const exactCenterChars = countObstacleLetters(puz.centerQuestion.displayWord);
      this.questionsMap.set(ottQid, {
        qid: ottQid,
        season: '26',
        match: code,
        round: 'VCNV',
        subCode: '5',
        subjectRaw: 'General/Social',
        categoryVi: puz.title,
        question: syncQuestionTextWithExactCharCount(
          puz.centerQuestion.question,
          exactCenterChars
        ),
        officialAnswer: puz.centerQuestion.displayWord,
        acceptedAnswers: puz.centerQuestion.acceptedAnswers,
        explanation: puz.centerQuestion.explanation,
        sourceFile: 'olympia_new_questions.csv (Nâng cấp)',
      });

      const cnvQid = `26-${code}-VCNV-CNV`;
      const exactCnvChars = countObstacleLetters(puz.keywordDisplay);
      this.questionsMap.set(cnvQid, {
        qid: cnvQid,
        season: '26',
        match: code,
        round: 'VCNV',
        subCode: 'CNV',
        subjectRaw: 'General/Social',
        categoryVi: puz.title,
        question: `[Chủ đề: ${puz.title} · Chướng ngại vật gồm ${exactCnvChars} chữ cái] Từ 4 hàng ngang và Ô trung tâm, hãy tìm Từ khóa Chướng Ngại Vật!`,
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

    // Ensure every VCNV record in the bank has accurate (X chữ cái) labels matching its officialAnswer
    for (const rec of this.questionsMap.values()) {
      if (rec.round === 'VCNV') {
        const exactChars = countObstacleLetters(rec.officialAnswer);
        if (exactChars > 0) {
          rec.question = syncQuestionTextWithExactCharCount(
            rec.question,
            exactChars
          );
        }
      }
    }
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
          editedRecords?: BankQuestionRecord[];
          deletedQids?: string[];
          history?: UploadConversionReport[];
        };
        if (Array.isArray(parsed.records)) {
          for (const rec of parsed.records) {
            if (
              rec &&
              rec.qid &&
              !rec.qid.startsWith('26-TT') &&
              !rec.qid.startsWith('26-VCNV')
            ) {
              this.customOrEditedMap.set(rec.qid, rec);
              this.questionsMap.set(rec.qid, rec);
            }
          }
        }
        // User-edited records always take highest priority, including 26-VCNV and 26-TT edits
        if (Array.isArray(parsed.editedRecords)) {
          for (const rec of parsed.editedRecords) {
            if (rec && rec.qid) {
              this.customOrEditedMap.set(rec.qid, rec);
              this.questionsMap.set(rec.qid, rec);
            }
          }
        }
        // Apply user-deleted QIDs
        if (Array.isArray(parsed.deletedQids)) {
          for (const delQid of parsed.deletedQids) {
            if (typeof delQid === 'string' && delQid.trim()) {
              this.deletedQids.add(delQid);
              this.questionsMap.delete(delQid);
              this.customOrEditedMap.delete(delQid);
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

  private persistCustomAndEditedToDisk() {
    try {
      const allCustom = Array.from(this.customOrEditedMap.values());
      const allDeleted = Array.from(this.deletedQids);
      fs.writeFileSync(
        CUSTOM_QUESTIONS_CACHE_PATH,
        JSON.stringify(
          {
            editedRecords: allCustom.slice(-15000),
            deletedQids: allDeleted.slice(-15000),
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
    this.customOrEditedMap.clear();
    this.deletedQids.clear();
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

  /**
   * Deletes an individual question record from the bank and persists the deletion to disk.
   */
  public deleteQuestionRecord(qid: string): {
    deletedQid: string;
    totalRemaining: number;
  } {
    this.init();
    const trimmedQid = (qid || '').trim();
    if (!trimmedQid || !this.questionsMap.has(trimmedQid)) {
      throw new Error(`Không tìm thấy câu hỏi với mã QID "${trimmedQid}" để xoá.`);
    }
    this.questionsMap.delete(trimmedQid);
    this.customOrEditedMap.delete(trimmedQid);
    this.deletedQids.add(trimmedQid);
    this.persistCustomAndEditedToDisk();
    return {
      deletedQid: trimmedQid,
      totalRemaining: this.questionsMap.size,
    };
  }

  /**
   * Deletes an entire VCNV Obstacle Puzzle set (all rows + center + CNV keyword for season & match)
   * and persists the deletion to disk.
   */
  public deleteVcnvPuzzle(
    season: string,
    match: string
  ): {
    deletedCount: number;
    totalRemaining: number;
  } {
    this.init();
    const s = (season || '').trim();
    const m = (match || '').trim();
    if (!s || !m) {
      throw new Error('Thiếu thông tin Mùa hoặc Mã trận của bộ VCNV cần xoá.');
    }
    const matchingRecords = Array.from(this.questionsMap.values()).filter(
      (r) => r.round === 'VCNV' && r.season === s && r.match === m
    );
    if (matchingRecords.length === 0) {
      throw new Error(`Không tìm thấy bộ đề VCNV của Mùa ${s} · Trận ${m} để xoá.`);
    }
    for (const rec of matchingRecords) {
      this.questionsMap.delete(rec.qid);
      this.customOrEditedMap.delete(rec.qid);
      this.deletedQids.add(rec.qid);
    }
    this.persistCustomAndEditedToDisk();
    return {
      deletedCount: matchingRecords.length,
      totalRemaining: this.questionsMap.size,
    };
  }

  /**
   * Updates an individual question/answer record in the bank and persists the edit to disk.
   */
  public updateQuestionRecord(
    qid: string,
    updates: {
      question?: string;
      officialAnswer?: string;
      acceptedAnswers?: string[] | string;
      explanation?: string;
      categoryVi?: string;
      points?: 20 | 30;
      imageUrl?: string;
    }
  ): BankQuestionRecord {
    this.init();
    const existing = this.questionsMap.get(qid);
    if (!existing) {
      throw new Error(`Không tìm thấy câu hỏi với mã QID "${qid}".`);
    }

    const nextOfficial =
      updates.officialAnswer !== undefined
        ? updates.officialAnswer.trim()
        : existing.officialAnswer;
    if (!nextOfficial) {
      throw new Error('Đáp án chính thức không được để trống.');
    }

    let nextQuestion =
      updates.question !== undefined
        ? updates.question.trim()
        : existing.question;
    if (!nextQuestion) {
      throw new Error('Nội dung câu hỏi không được để trống.');
    }

    if (existing.round === 'VCNV') {
      const exactChars = countObstacleLetters(nextOfficial);
      if (exactChars > 0) {
        nextQuestion = syncQuestionTextWithExactCharCount(
          nextQuestion,
          exactChars
        );
      }
    }

    let customVariants: string[] = [];
    if (Array.isArray(updates.acceptedAnswers)) {
      customVariants = updates.acceptedAnswers
        .map((s) => String(s).trim())
        .filter(Boolean);
    } else if (typeof updates.acceptedAnswers === 'string') {
      customVariants = updates.acceptedAnswers
        .split(/[|,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      customVariants = existing.acceptedAnswers;
    }

    const autoVariants = extractAnswerVariants(nextOfficial);
    const mergedAccepted = Array.from(
      new Set([nextOfficial, ...autoVariants, ...customVariants])
    ).filter(Boolean);

    const updatedRecord: BankQuestionRecord = {
      ...existing,
      question: nextQuestion,
      officialAnswer: nextOfficial,
      acceptedAnswers: mergedAccepted,
      explanation:
        updates.explanation !== undefined
          ? updates.explanation.trim()
          : existing.explanation,
      categoryVi:
        updates.categoryVi !== undefined && updates.categoryVi.trim()
          ? updates.categoryVi.trim()
          : existing.categoryVi,
      points:
        existing.round === 'VD' && (updates.points === 20 || updates.points === 30)
          ? updates.points
          : existing.points,
      imageUrl:
        updates.imageUrl !== undefined
          ? updates.imageUrl.trim() || undefined
          : existing.imageUrl,
      sourceFile: existing.sourceFile.includes('(Đã chỉnh sửa)')
        ? existing.sourceFile
        : `${existing.sourceFile} (Đã chỉnh sửa)`,
    };

    this.deletedQids.delete(qid);
    this.questionsMap.set(qid, updatedRecord);
    this.customOrEditedMap.set(qid, updatedRecord);
    this.persistCustomAndEditedToDisk();
    return updatedRecord;
  }

  /**
   * Lists and searches all complete VCNV Obstacle Puzzles with their resolved mystery image,
   * obstacle answer, exact character count, 4 horizontal rows, and center question.
   */
  public searchVcnvPuzzles(params?: {
    q?: string;
    season?: string;
    page?: number;
    limit?: number;
  }): {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    items: EditableVcnvPuzzleRecord[];
  } {
    this.init();
    const vcnvRecords = Array.from(this.questionsMap.values()).filter(
      (r) => r.round === 'VCNV'
    );
    const allPuzzles = buildEditableVcnvPuzzlesFromBank(vcnvRecords);

    const keyword = (params?.q || '').trim().toLowerCase();
    const seasonFilter = (params?.season || '').trim();
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.min(200, Math.max(1, Number(params?.limit) || 12));

    const matched = allPuzzles.filter((p) => {
      if (seasonFilter && p.season !== seasonFilter) return false;
      if (keyword) {
        const hay = [
          p.puzzleId,
          p.season,
          p.match,
          p.title,
          p.keywordDisplay,
          ...p.acceptedKeywords,
          p.summaryExplanation,
          ...p.rows.map((r) => `${r.displayWord} ${r.question}`),
          p.centerQuestion.displayWord,
          p.centerQuestion.question,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      return true;
    });

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

  /**
   * Updates a VCNV Obstacle Puzzle (Obstacle Answer, Mystery Image URL/DataURL, Title, Explanation,
   * and optionally the 4 horizontal rows & Center Question) and persists all changes.
   */
  public updateVcnvPuzzle(payload: {
    season: string;
    match: string;
    title?: string;
    keywordDisplay?: string;
    acceptedKeywords?: string[] | string;
    imageUrl?: string;
    summaryExplanation?: string;
    rows?: {
      id: 1 | 2 | 3 | 4;
      question?: string;
      displayWord?: string;
      acceptedAnswers?: string[] | string;
      explanation?: string;
    }[];
    centerQuestion?: {
      question?: string;
      displayWord?: string;
      acceptedAnswers?: string[] | string;
      explanation?: string;
    };
  }): EditableVcnvPuzzleRecord {
    this.init();
    const season = (payload.season || '26').trim();
    const match = (payload.match || '').trim();
    if (!match) {
      throw new Error('Thiếu mã trận / bộ đề VCNV cần cập nhật.');
    }

    const group = Array.from(this.questionsMap.values()).filter(
      (r) => r.round === 'VCNV' && r.season === season && r.match === match
    );
    if (group.length === 0) {
      throw new Error(
        `Không tìm thấy bộ đề VCNV của Mùa ${season} · Trận ${match}.`
      );
    }

    const cnvRec =
      group.find(
        (r) =>
          r.subCode.toUpperCase() === 'CNV' ||
          r.subCode.toUpperCase() === 'KEYWORD'
      ) || this.questionsMap.get(`${season}-${match}-VCNV-CNV`);

    if (!cnvRec) {
      throw new Error('Không tìm thấy bản ghi từ khóa Chướng Ngại Vật (CNV).');
    }

    const nextKeyword = (
      payload.keywordDisplay !== undefined
        ? payload.keywordDisplay
        : cnvRec.officialAnswer
    )
      .trim()
      .toUpperCase();
    if (!nextKeyword) {
      throw new Error('Đáp án Chướng Ngại Vật không được để trống.');
    }

    const nextCharCount = countObstacleLetters(nextKeyword);
    const nextTitle = (
      payload.title !== undefined ? payload.title : cnvRec.categoryVi
    ).trim();

    let nextAcceptedKeywords: string[] = [];
    if (Array.isArray(payload.acceptedKeywords)) {
      nextAcceptedKeywords = payload.acceptedKeywords
        .map((s) => String(s).trim())
        .filter(Boolean);
    } else if (typeof payload.acceptedKeywords === 'string') {
      nextAcceptedKeywords = payload.acceptedKeywords
        .split(/[|,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      nextAcceptedKeywords = cnvRec.acceptedAnswers;
    }

    const mergedCnvAccepted = Array.from(
      new Set([
        nextKeyword,
        ...extractAnswerVariants(nextKeyword),
        ...nextAcceptedKeywords,
      ])
    ).filter(Boolean);

    const nextImageUrl =
      payload.imageUrl !== undefined
        ? payload.imageUrl.trim() || undefined
        : cnvRec.imageUrl;

    const nextExplanation =
      payload.summaryExplanation !== undefined
        ? payload.summaryExplanation.trim()
        : cnvRec.explanation;

    const updatedCnvRec: BankQuestionRecord = {
      ...cnvRec,
      categoryVi: nextTitle || cnvRec.categoryVi,
      officialAnswer: nextKeyword,
      acceptedAnswers: mergedCnvAccepted,
      imageUrl: nextImageUrl,
      explanation: nextExplanation,
      question: `[Chủ đề: ${
        nextTitle || cnvRec.categoryVi
      } · Chướng ngại vật gồm ${nextCharCount} chữ cái] Từ 4 hàng ngang và Ô trung tâm, hãy tìm Từ khóa Chướng Ngại Vật!`,
      sourceFile: cnvRec.sourceFile.includes('(Đã chỉnh sửa)')
        ? cnvRec.sourceFile
        : `${cnvRec.sourceFile} (Đã chỉnh sửa)`,
    };

    this.questionsMap.set(updatedCnvRec.qid, updatedCnvRec);
    this.customOrEditedMap.set(updatedCnvRec.qid, updatedCnvRec);

    // Update any of the 4 horizontal rows if provided
    if (Array.isArray(payload.rows)) {
      for (const rowUpdate of payload.rows) {
        const rowRec =
          group.find((r) => r.subCode === String(rowUpdate.id)) ||
          this.questionsMap.get(`${season}-${match}-VCNV-${rowUpdate.id}`);
        if (rowRec) {
          this.updateQuestionRecord(rowRec.qid, {
            question: rowUpdate.question,
            officialAnswer: rowUpdate.displayWord
              ? rowUpdate.displayWord.trim().toUpperCase()
              : undefined,
            acceptedAnswers: rowUpdate.acceptedAnswers,
            explanation: rowUpdate.explanation,
            categoryVi: nextTitle || rowRec.categoryVi,
          });
        }
      }
    }

    // Update Center Question (Row 5) if provided
    if (payload.centerQuestion) {
      const centerRec =
        group.find(
          (r) =>
            r.subCode === '5' ||
            r.subCode.toUpperCase() === 'OTT' ||
            r.subCode.toUpperCase() === 'CENTER'
        ) || this.questionsMap.get(`${season}-${match}-VCNV-5`);
      if (centerRec) {
        this.updateQuestionRecord(centerRec.qid, {
          question: payload.centerQuestion.question,
          officialAnswer: payload.centerQuestion.displayWord
            ? payload.centerQuestion.displayWord.trim().toUpperCase()
            : undefined,
          acceptedAnswers: payload.centerQuestion.acceptedAnswers,
          explanation: payload.centerQuestion.explanation,
          categoryVi: nextTitle || centerRec.categoryVi,
        });
      }
    }

    this.persistCustomAndEditedToDisk();

    const refreshedGroup = Array.from(this.questionsMap.values()).filter(
      (r) => r.round === 'VCNV' && r.season === season && r.match === match
    );
    const built = buildEditableVcnvPuzzlesFromBank(refreshedGroup);
    if (built.length === 0) {
      throw new Error('Không thể tạo lại dữ liệu VCNV sau khi cập nhật.');
    }
    return built[0];
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
      this.customOrEditedMap.clear();
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

      if (normalizedRound === 'VCNV') {
        const exactChars = countObstacleLetters(parsedAns.officialAnswer);
        if (exactChars > 0) {
          rawQuestion = syncQuestionTextWithExactCharCount(
            rawQuestion,
            exactChars
          );
        }
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
        this.customOrEditedMap.set(record.qid, record);
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
      this.persistCustomAndEditedToDisk();
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
