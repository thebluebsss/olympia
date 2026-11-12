import {
  KHOI_DONG_PERSONAL_QUESTIONS,
  KHOI_DONG_COMMON_QUESTIONS,
  OBSTACLE_PUZZLES,
  TANG_TOC_QUESTIONS,
  VE_DICH_20_QUESTIONS,
  VE_DICH_30_QUESTIONS,
  TIE_BREAKER_QUESTIONS,
} from '../../data/olympiaQuestions.ts';
import {
  OBSTACLE_REAL_PHOTOS,
  resolveObstacleImageUrl,
} from '../obstacleIllustrations.ts';
import { HISTORICAL_VCNV_SUPPLEMENTS } from '../../data/vcnvHistoricalSupplements.ts';
import type {
  QuizQuestion,
  ObstaclePuzzle,
  ObstacleRow,
  AccelerationQuestion,
  FinishQuestion,
} from '../../data/olympiaQuestions.ts';
import type { RoomQuestionDeck, QuestionDeckMode } from '../../types/olympia.ts';
import {
  type BankQuestionRecord,
  sanitizeTangTocQuestionAndClues,
} from './csvParser.ts';

/**
 * Reconstructs playable Round 2 ObstaclePuzzle sets from `r.round === 'VCNV'` records in the backend bank,
 * prioritizing upgraded indirect-clue puzzles so the mystery image and horizontal rows are never too easy to guess.
 */
export function buildObstaclePuzzlesFromBank(
  vcnvRecords: BankQuestionRecord[],
  specificMatch?: string
): ObstaclePuzzle[] {
  const byMatchKey = new Map<string, BankQuestionRecord[]>();
  for (const rec of vcnvRecords) {
    const key = `${rec.season}:::${rec.match}`;
    if (!byMatchKey.has(key)) {
      byMatchKey.set(key, []);
    }
    byMatchKey.get(key)!.push(rec);
  }

  const builtPuzzles: ObstaclePuzzle[] = [];

  for (const [key, group] of byMatchKey.entries()) {
    const [season, match] = key.split(':::');
    if (specificMatch && match !== specificMatch) continue;

    // If this is one of the 16 upgraded VCNV sets (VCNV01..VCNV16), use the upgraded indirect-clue puzzle directly
    const vcnvNumMatch = match.match(/^VCNV0*(\d+)$/i);
    if (vcnvNumMatch) {
      const idx = parseInt(vcnvNumMatch[1], 10) - 1;
      if (idx >= 0 && idx < OBSTACLE_PUZZLES.length) {
        builtPuzzles.push(OBSTACLE_PUZZLES[idx]);
        continue;
      }
    } else if (!specificMatch && !HISTORICAL_VCNV_SUPPLEMENTS[`${season}-${match}`]) {
      // In random mode, include all 60 VCNV01..60 sets plus all 102 authentic curated historical Olympia sets (162 distinct VCNV puzzles total)
      continue;
    }

    const cnvRec = group.find(
      (r) =>
        r.subCode.toUpperCase() === 'CNV' ||
        r.subCode.toUpperCase() === 'KEYWORD'
    );
    const row1 = group.find((r) => r.subCode === '1');
    const row2 = group.find((r) => r.subCode === '2');
    const row3 = group.find((r) => r.subCode === '3');
    const row4 = group.find((r) => r.subCode === '4');
    const row5 = group.find(
      (r) =>
        r.subCode === '5' ||
        r.subCode.toUpperCase() === 'OTT' ||
        r.subCode.toUpperCase() === 'CENTER'
    );

    if (cnvRec && row1 && row2 && row3 && row4) {
      const puzzleId = vcnvNumMatch
        ? `vcnv-${vcnvNumMatch[1]}`
        : `vcnv-${season}-${match}`;

      const primaryKeyword = cnvRec.officialAnswer
        .split('/')[0]
        .trim()
        .toUpperCase();
      const charCount = primaryKeyword.replace(/\s+/g, '').length;

      const themeMatch = cnvRec.question.match(/\[Chủ đề:\s*([^·\]]+)/i);
      const title = themeMatch
        ? themeMatch[1].trim()
        : `${cnvRec.categoryVi} (O${season} · ${match})`;

      const toObstacleRow = (
        r: BankQuestionRecord,
        id: 1 | 2 | 3 | 4
      ): ObstacleRow => {
        const disp = r.officialAnswer.split('/')[0].trim().toUpperCase();
        return {
          id,
          rowLabel: `Hàng ngang số ${id}`,
          charCount: disp.replace(/\s+/g, '').length,
          question: r.question,
          displayWord: disp,
          acceptedAnswers: r.acceptedAnswers,
          explanation: r.explanation,
        };
      };

      const centerDisp = row5
        ? row5.officialAnswer.split('/')[0].trim().toUpperCase()
        : primaryKeyword;

      const rowWords = [row1, row2, row3, row4].map((r) =>
        r.officialAnswer.split('/')[0].trim().toUpperCase()
      );

      const indirectPhoto = resolveObstacleImageUrl(
        puzzleId,
        cnvRec.imageUrl,
        primaryKeyword,
        title,
        rowWords,
        centerDisp,
        cnvRec.explanation
      );

      builtPuzzles.push({
        id: puzzleId,
        title,
        keywordDisplay: primaryKeyword,
        charCount,
        acceptedKeywords: cnvRec.acceptedAnswers,
        imageUrl: indirectPhoto,
        rows: [
          toObstacleRow(row1, 1),
          toObstacleRow(row2, 2),
          toObstacleRow(row3, 3),
          toObstacleRow(row4, 4),
        ],
        centerQuestion: row5
          ? {
              question: row5.question,
              displayWord: centerDisp,
              acceptedAnswers: row5.acceptedAnswers,
              explanation: row5.explanation,
            }
          : {
              question: `Câu hỏi Ô Trung Tâm: Từ khóa chính liên quan đến 4 hàng ngang trong chủ đề "${title}" là gì?`,
              displayWord: primaryKeyword,
              acceptedAnswers: cnvRec.acceptedAnswers,
              explanation: cnvRec.explanation,
            },
        summaryExplanation: cnvRec.explanation,
      });
    } else if (specificMatch && group.length >= 3) {
      const sortedRows = [...group].sort((a, b) =>
        a.subCode.localeCompare(b.subCode)
      );
      const fallbackBase =
        OBSTACLE_PUZZLES[
          Math.abs(match.charCodeAt(0) + Number(season || 26)) %
            OBSTACLE_PUZZLES.length
        ];
      const rows: ObstacleRow[] = ([1, 2, 3, 4] as const).map((id, idx) => {
        const r = sortedRows[idx];
        if (r) {
          const disp = r.officialAnswer.split('/')[0].trim().toUpperCase();
          return {
            id,
            rowLabel: `Hàng ngang số ${id}`,
            charCount: disp.replace(/\s+/g, '').length,
            question: r.question,
            displayWord: disp,
            acceptedAnswers: r.acceptedAnswers,
            explanation: r.explanation,
          };
        }
        return fallbackBase.rows[idx];
      });

      const fifth = sortedRows[4];
      builtPuzzles.push({
        ...fallbackBase,
        id: `vcnv-${season}-${match}`,
        title: `Vượt Chướng Ngại Vật (Olympia Mùa ${season} · Trận ${match})`,
        rows,
        centerQuestion: fifth
          ? {
              question: fifth.question,
              displayWord: fifth.officialAnswer
                .split('/')[0]
                .trim()
                .toUpperCase(),
              acceptedAnswers: fifth.acceptedAnswers,
              explanation: fifth.explanation,
            }
          : fallbackBase.centerQuestion,
      });
    }
  }

  return builtPuzzles.length > 0 ? builtPuzzles : [...OBSTACLE_PUZZLES];
}

/**
 * Reconstructs playable Round 3 AccelerationQuestion sets from `r.round === 'TT'` records in the backend bank
 * combined with the 40 high-difficulty, hint-free TANG_TOC_QUESTIONS.
 */
export function buildTangTocQuestionsFromBank(
  ttRecords: BankQuestionRecord[],
  shuffleFn: <T>(arr: T[]) => T[],
  specificMatch?: string
): AccelerationQuestion[] {
  const toAccQuestion = (
    rec: BankQuestionRecord,
    num: 1 | 2 | 3 | 4
  ): AccelerationQuestion => {
    const limits: Record<1 | 2 | 3 | 4, number> = {
      1: 15,
      2: 20,
      3: 25,
      4: 30,
    };
    const { mainQuestion, clues } = sanitizeTangTocQuestionAndClues(rec.question);

    return {
      id: `tt-csv-${rec.qid}`,
      number: num,
      timeLimitSec: limits[num],
      typeLabel: `Câu ${num} · Tăng Tốc (${rec.categoryVi})`,
      question: mainQuestion,
      clues,
      answer: rec.officialAnswer,
      acceptedAnswers: rec.acceptedAnswers,
      options: [],
      explanation: rec.explanation,
    };
  };

  // Filter out overly short/easy CSV TT questions unless a specific match was requested
  const isChallengingTtRecord = (rec: BankQuestionRecord): boolean => {
    if (specificMatch && rec.match === specificMatch) return true;
    // Skip legacy TT01..TT10 rows from old CSV if they haven't been replaced yet
    if (/^TT0[1-9]|^TT10$/i.test(rec.match)) return false;
    return rec.question.length >= 95;
  };

  const challengingCsvRecords = ttRecords.filter(isChallengingTtRecord);

  const buildSlotPool = (num: 1 | 2 | 3 | 4): AccelerationQuestion[] => {
    const curatedHighDiff = TANG_TOC_QUESTIONS.filter((q) => q.number === num);
    const fromCsv = challengingCsvRecords
      .filter((r) => r.subCode === String(num))
      .map((r) => toAccQuestion(r, num));

    if (specificMatch && fromCsv.length > 0) {
      return [...fromCsv, ...curatedHighDiff];
    }
    // Prioritize our 40 high-difficulty hint-free TANG_TOC_QUESTIONS + challenging CSV TT records
    return [...curatedHighDiff, ...fromCsv.slice(0, 10)];
  };

  const dedupAndShuffle = (
    list: AccelerationQuestion[]
  ): AccelerationQuestion[] => {
    const seen = new Set<string>();
    const unique: AccelerationQuestion[] = [];
    for (const item of list) {
      const key = item.question.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }
    return shuffleFn(unique);
  };

  const s1 = dedupAndShuffle(buildSlotPool(1));
  const s2 = dedupAndShuffle(buildSlotPool(2));
  const s3 = dedupAndShuffle(buildSlotPool(3));
  const s4 = dedupAndShuffle(buildSlotPool(4));

  const extras: AccelerationQuestion[] = [];
  const maxLen = Math.max(s1.length, s2.length, s3.length, s4.length);
  for (let i = 1; i < Math.min(maxLen, 8); i++) {
    if (s1[i]) extras.push(s1[i]);
    if (s2[i]) extras.push(s2[i]);
    if (s3[i]) extras.push(s3[i]);
    if (s4[i]) extras.push(s4[i]);
  }
  return [s1[0], s2[0], s3[0], s4[0], ...extras];
}

export function buildRoomQuestionDeckFromRecords(
  allRecords: BankQuestionRecord[],
  options?: {
    roomCode?: string;
    deckSeed?: string;
    mode?: QuestionDeckMode;
    season?: string;
    match?: string;
    subjectFilter?: string;
  }
): RoomQuestionDeck {
  const mode: QuestionDeckMode = options?.mode || 'CSV_RANDOM';
  const roomCodeNorm = (options?.roomCode || 'OLYMPIA').trim().toUpperCase();
  const seasonFilter = (options?.season || '').trim();
  const matchFilter = (options?.match || '').trim();
  const subjectFilter = (options?.subjectFilter || '').trim();
  const deckSeed = (options?.deckSeed || 'v1').trim();

  const fullSeedString = `${roomCodeNorm}|${mode}|${seasonFilter}|${matchFilter}|${subjectFilter}|${deckSeed}`;
  let hashState = 2166136261 >>> 0;
  for (let i = 0; i < fullSeedString.length; i++) {
    hashState ^= fullSeedString.charCodeAt(i);
    hashState = Math.imul(hashState, 16777619) >>> 0;
  }
  if (hashState === 0) hashState = 123456789;

  const nextRand = (): number => {
    hashState = (hashState + 0x6d2b79f5) >>> 0;
    let t = Math.imul(hashState ^ (hashState >>> 15), 1 | hashState);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const deterministicDeckId = `deck-${mode.toLowerCase()}-${roomCodeNorm}-${hashState.toString(36)}`;

  if (mode === 'CLASSIC_DEFAULT' || allRecords.length === 0) {
    return {
      deckId: deterministicDeckId,
      mode: 'CLASSIC_DEFAULT',
      label: 'Bộ đề Olympia Mặc Định (Nâng cao)',
      totalSourceQuestions:
        KHOI_DONG_PERSONAL_QUESTIONS.length +
        KHOI_DONG_COMMON_QUESTIONS.length +
        OBSTACLE_PUZZLES.length * 6 +
        TANG_TOC_QUESTIONS.length +
        VE_DICH_20_QUESTIONS.length +
        VE_DICH_30_QUESTIONS.length,
      personalQuestions: shuffle(KHOI_DONG_PERSONAL_QUESTIONS),
      commonQuestions: shuffle(KHOI_DONG_COMMON_QUESTIONS),
      obstaclePuzzles: shuffle(OBSTACLE_PUZZLES).slice(0, 16),
      tangTocQuestions: buildTangTocQuestionsFromBank([], shuffle),
      veDich20Questions: shuffle(VE_DICH_20_QUESTIONS),
      veDich30Questions: shuffle(VE_DICH_30_QUESTIONS),
      tieBreakerQuestions: shuffle(TIE_BREAKER_QUESTIONS),
    };
  }

  const toQuizQuestion = (rec: BankQuestionRecord): QuizQuestion => ({
    id: rec.qid,
    category: `${rec.categoryVi} (O${rec.season} · ${rec.match})`,
    question: rec.question,
    answer: rec.officialAnswer,
    acceptedAnswers: rec.acceptedAnswers,
    options: [],
    explanation: rec.explanation,
  });

  const toFinishQuestion = (
    rec: BankQuestionRecord,
    pts: 20 | 30
  ): FinishQuestion => ({
    id: rec.qid,
    points: pts,
    category: `${rec.categoryVi} · ${pts} điểm (O${rec.season} · ${rec.match})`,
    question: rec.question,
    answer: rec.officialAnswer,
    acceptedAnswers: rec.acceptedAnswers,
    options: [],
    explanation: rec.explanation,
  });

  let primaryPool = allRecords.filter((r) => {
    if (seasonFilter && r.season !== seasonFilter) return false;
    if (mode === 'CSV_MATCH' && matchFilter && r.match !== matchFilter) {
      return false;
    }
    if (
      subjectFilter &&
      r.categoryVi !== subjectFilter &&
      r.subjectRaw !== subjectFilter
    ) {
      return false;
    }
    return true;
  });

  if (primaryPool.length < 15) {
    primaryPool = seasonFilter
      ? allRecords.filter((r) => r.season === seasonFilter)
      : allRecords;
  }

  const seasonFallbackPool = seasonFilter
    ? allRecords.filter((r) => r.season === seasonFilter)
    : allRecords;

  // 1. ROUND 1: KHỞI ĐỘNG
  const isSuitableForKhoiDong = (r: BankQuestionRecord): boolean => {
    if (r.round !== 'KD') return false;
    if (r.question.length > 220) return false;
    if (
      r.explanation &&
      !r.explanation.startsWith('Đáp án chính thức') &&
      r.explanation.includes('=')
    ) {
      return false;
    }
    return true;
  };

  const kdPrimary = primaryPool.filter(isSuitableForKhoiDong);
  const kdFallback = shuffle(seasonFallbackPool.filter(isSuitableForKhoiDong));
  const kdAllFallback = shuffle(allRecords.filter(isSuitableForKhoiDong));

  let personalRecords: BankQuestionRecord[] = [];
  let commonRecords: BankQuestionRecord[] = [];

  if (mode === 'CSV_MATCH' && matchFilter) {
    const aRecords = kdPrimary
      .filter((r) => r.subCode.startsWith('A'))
      .sort((a, b) => a.subCode.localeCompare(b.subCode));
    const bRecords = kdPrimary
      .filter((r) => r.subCode.startsWith('B'))
      .sort((a, b) => {
        const numA = parseFloat(a.subCode.replace('B.', '')) || 0;
        const numB = parseFloat(b.subCode.replace('B.', '')) || 0;
        return numA - numB;
      });

    personalRecords = [...aRecords];
    commonRecords = [...bRecords];

    if (personalRecords.length === 0 && kdPrimary.length > 0) {
      personalRecords = kdPrimary.slice(0, 24);
      commonRecords = kdPrimary.slice(24, 36);
    }
  } else {
    const shuffledKd = shuffle(kdPrimary.length >= 36 ? kdPrimary : kdFallback);
    personalRecords = shuffledKd.slice(0, 24);
    commonRecords = shuffledKd.slice(24, 36);
  }

  const usedKdIds = new Set(
    [...personalRecords, ...commonRecords].map((r) => r.qid)
  );
  for (const cand of [...kdFallback, ...kdAllFallback]) {
    if (personalRecords.length >= 24 && commonRecords.length >= 12) break;
    if (usedKdIds.has(cand.qid)) continue;
    usedKdIds.add(cand.qid);
    if (personalRecords.length < 24) {
      personalRecords.push(cand);
    } else if (commonRecords.length < 12) {
      commonRecords.push(cand);
    }
  }

  const personalQuestions: QuizQuestion[] =
    personalRecords.length >= 24
      ? personalRecords.slice(0, 24).map(toQuizQuestion)
      : KHOI_DONG_PERSONAL_QUESTIONS;

  const commonQuestions: QuizQuestion[] =
    commonRecords.length >= 12
      ? commonRecords.slice(0, 12).map(toQuizQuestion)
      : KHOI_DONG_COMMON_QUESTIONS;

  // 2. ROUND 2: VƯỢT CHƯỚNG NGẠI VẬT
  const allVcnvRecords = allRecords.filter((r) => r.round === 'VCNV');
  const allCompleteBankPuzzles = shuffle(
    buildObstaclePuzzlesFromBank(allVcnvRecords)
  );

  let obstaclePuzzles: ObstaclePuzzle[] = [];
  if (mode === 'CSV_MATCH' && matchFilter) {
    const matchSpecificPuzzles = buildObstaclePuzzlesFromBank(
      allVcnvRecords,
      matchFilter
    );
    obstaclePuzzles =
      matchSpecificPuzzles.length > 0
        ? [...matchSpecificPuzzles, ...allCompleteBankPuzzles].slice(0, 25)
        : allCompleteBankPuzzles.slice(0, 25);
  } else {
    obstaclePuzzles =
      allCompleteBankPuzzles.length > 0
        ? allCompleteBankPuzzles.slice(0, 25)
        : shuffle([...OBSTACLE_PUZZLES]).slice(0, 16);
  }

  // 3. ROUND 3: TĂNG TỐC
  const ttPrimary = primaryPool.filter((r) => r.round === 'TT');
  const ttAll = allRecords.filter((r) => r.round === 'TT');
  const tangTocQuestions: AccelerationQuestion[] = buildTangTocQuestionsFromBank(
    ttPrimary.length >= 4 ? [...ttPrimary, ...ttAll] : ttAll,
    shuffle,
    mode === 'CSV_MATCH' ? matchFilter : undefined
  );

  // 4. ROUND 4: VỀ ĐÍCH (20pt vs 30pt)
  const vdPrimary = primaryPool.filter((r) => r.round === 'VD');
  const vdFallback = shuffle(seasonFallbackPool.filter((r) => r.round === 'VD'));
  const vdAllFallback = shuffle(allRecords.filter((r) => r.round === 'VD'));

  const raw20Primary = vdPrimary.filter((r) => r.points === 20);
  const raw30Primary = vdPrimary.filter((r) => r.points === 30);

  const vd20Pool: BankQuestionRecord[] = shuffle([...raw20Primary]);
  const vd30Pool: BankQuestionRecord[] = shuffle([...raw30Primary]);

  const usedVdIds = new Set([...vd20Pool, ...vd30Pool].map((r) => r.qid));

  for (const cand of [...vdFallback, ...vdAllFallback]) {
    if (vd20Pool.length >= 16 && vd30Pool.length >= 16) break;
    if (usedVdIds.has(cand.qid)) continue;
    if (cand.points === 30 && vd30Pool.length < 16) {
      usedVdIds.add(cand.qid);
      vd30Pool.push(cand);
    } else if (cand.points !== 30 && vd20Pool.length < 16) {
      usedVdIds.add(cand.qid);
      vd20Pool.push(cand);
    }
  }

  const veDich20Questions: FinishQuestion[] =
    vd20Pool.length >= 12
      ? vd20Pool.slice(0, 16).map((r) => toFinishQuestion(r, 20))
      : VE_DICH_20_QUESTIONS;

  const veDich30Questions: FinishQuestion[] =
    vd30Pool.length >= 12
      ? vd30Pool.slice(0, 16).map((r) => toFinishQuestion(r, 30))
      : VE_DICH_30_QUESTIONS;

  const tieBreakerPool = vd30Pool.slice(12, 16);
  const tieBreakerQuestions: QuizQuestion[] =
    tieBreakerPool.length > 0
      ? tieBreakerPool.map(toQuizQuestion)
      : TIE_BREAKER_QUESTIONS;

  let label = `Ngân hàng CSV Ngẫu nhiên (${allRecords.length.toLocaleString()} câu)`;
  if (mode === 'CSV_MATCH' && seasonFilter && matchFilter) {
    label = `Đề thi Olympia Mùa ${seasonFilter} · Trận ${matchFilter}`;
  } else if (seasonFilter) {
    label = `Ngân hàng Olympia Mùa ${seasonFilter}${
      subjectFilter ? ` · ${subjectFilter}` : ''
    }`;
  } else if (subjectFilter) {
    label = `Chuyên đề: ${subjectFilter}`;
  }

  return {
    deckId: deterministicDeckId,
    mode,
    season: seasonFilter || undefined,
    match: matchFilter || undefined,
    subjectFilter: subjectFilter || undefined,
    label,
    totalSourceQuestions: primaryPool.length,
    personalQuestions,
    commonQuestions,
    obstaclePuzzles,
    tangTocQuestions,
    veDich20Questions,
    veDich30Questions,
    tieBreakerQuestions,
  };
}
