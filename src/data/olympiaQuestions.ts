// Barrel module re-exporting all Olympia data & types from modular files
export {
  type QuizQuestion,
  type ObstacleRow,
  type ObstaclePuzzle,
  type AccelerationQuestion,
  type FinishQuestion,
  LAUREL_WREATH_IMG,
  normalizeViText,
  normalizeAsciiWords,
  normalizeAnswer,
  extractAnswerVariants,
  isAnswerMatch,
} from './questionTypes.ts';

export {
  KHOI_DONG_PERSONAL_QUESTIONS,
  KHOI_DONG_COMMON_QUESTIONS,
} from './khoiDongData.ts';

export { OBSTACLE_PUZZLES } from './vcnvData.ts';

export { TANG_TOC_QUESTIONS } from './tangTocData.ts';

export {
  VE_DICH_20_QUESTIONS,
  VE_DICH_30_QUESTIONS,
  TIE_BREAKER_QUESTIONS,
} from './veDichData.ts';
