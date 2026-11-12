/**
 * Server-side question selection utilities
 * This file is ONLY imported by API routes
 * Uses REAL questions from CSV (21,649 total)
 */

import {
  KHOI_DONG_QUESTIONS_CSV,
  VE_DICH_QUESTIONS_CSV,
} from "./olympiaQuestionsFromCsv.js";

/**
 * Server-side Fisher-Yates shuffle for random question selection
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Select random questions for a new game room
 * @returns Object with questions for all rounds
 */
export function selectRandomQuestions() {
  // Round 1: Select 24 personal questions (6 per player) + 12 common questions
  // Pool: 16,604 Khởi Động questions from CSV
  const shuffledKD = shuffleArray(KHOI_DONG_QUESTIONS_CSV);
  const personalQuestionsForAllPlayers = shuffledKD.slice(0, 24);
  const commonQuestions = shuffledKD.slice(24, 36);

  // Round 3: Select 20 random Tăng Tốc questions
  // Pool: 4,239 Về Đích questions from CSV
  const shuffledVD = shuffleArray(VE_DICH_QUESTIONS_CSV);
  const tangTocQuestions = shuffledVD.slice(0, 20);

  // Convert to engine format
  const convertedPersonalQuestions = personalQuestionsForAllPlayers.map(
    (q) => ({
      text: q.question,
      answer: q.answer,
      acceptedAnswers: q.acceptedAnswers,
    }),
  );

  const convertedCommonQuestions = commonQuestions.map((q) => ({
    text: q.question,
    answer: q.answer,
    acceptedAnswers: q.acceptedAnswers,
  }));

  const convertedTangTocQuestions = tangTocQuestions.map((q, idx) => ({
    id: `r3-random-${idx + 1}`,
    text: q.question,
    answer: q.answer,
    acceptedAnswers: q.acceptedAnswers,
    points: 10,
    category: q.category,
  }));

  console.log(
    `✅ Selected questions: 24 personal + 12 common + 20 tăng tốc from ${KHOI_DONG_QUESTIONS_CSV.length} KD + ${VE_DICH_QUESTIONS_CSV.length} VD`,
  );

  return {
    personalQuestions: convertedPersonalQuestions,
    commonQuestions: convertedCommonQuestions,
    tangTocQuestions: convertedTangTocQuestions,
  };
}
