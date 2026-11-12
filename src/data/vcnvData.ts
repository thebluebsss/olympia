import type { ObstaclePuzzle } from './questionTypes.ts';
import { OBSTACLE_PUZZLES_PART1 } from './vcnvDataPart1.ts';
import { OBSTACLE_PUZZLES_PART2 } from './vcnvDataPart2.ts';

export const OBSTACLE_PUZZLES: ObstaclePuzzle[] = [
  ...OBSTACLE_PUZZLES_PART1,
  ...OBSTACLE_PUZZLES_PART2,
];
