export type RoomStage =
  | "LOBBY"
  | "ROUND_1_KHOI_DONG"
  | "ROUND_2_VCNV"
  | "ROUND_3_TANG_TOC"
  | "ROUND_4_VE_DICH"
  | "TIE_BREAKER"
  | "GAME_OVER";

export interface ClimberSeat {
  position: 1 | 2 | 3 | 4;
  name: string;
  school: string;
  claimedByClientId: string | null;
  isReady: boolean;
  score: number;
  vcnvLocked: boolean;
  starUsed: boolean;
}

export interface RoomLogItem {
  id: string;
  timestamp: string;
  round: string;
  text: string;
  delta?: string;
}

export interface Round1QuestionHistoryItem {
  qNum: number;
  category: string;
  question: string;
  playerName: string;
  position: 1 | 2 | 3 | 4;
  submittedAnswer: string;
  officialAnswer: string;
  correct: boolean;
  explanation: string;
}

// Round 1 State
export interface Round1State {
  subPhase:
    | "INTRO"
    | "PERSONAL_READY"
    | "PERSONAL_ACTIVE"
    | "PERSONAL_TURN_DONE"
    | "COMMON_INTRO"
    | "COMMON_BUZZ_OPEN"
    | "COMMON_ANSWERING"
    | "COMMON_RESULT"
    | "ROUND_SUMMARY";
  activePosition: 1 | 2 | 3 | 4;
  personalQIndex: number;
  commonQIndex: number;
  buzzedPosition: 1 | 2 | 3 | 4 | null;
  deadlineEpochMs: number | null;
  personalHistory: Round1QuestionHistoryItem[];
  lastFeedback: {
    correct: boolean;
    playerName?: string;
    submittedAnswer?: string;
    officialAnswer: string;
    message: string;
    explanation: string;
  } | null;
}

// Round 2 (VCNV) State
export type VCNVRowStatus = "UNOPENED" | "SOLVED" | "LOCKED";

export interface Round2RowEvalItem {
  position: 1 | 2 | 3 | 4;
  name: string;
  submittedAnswer: string;
  isCorrect: boolean;
  pointsAwarded: number;
}

export interface Round2State {
  puzzleIndex: number;
  subPhase:
    | "SELECT_ROW"
    | "ANSWERING_ROW"
    | "ROW_RESULT"
    | "ANSWERING_CENTER"
    | "FINAL_15S"
    | "CNV_ANSWERING"
    | "ROUND_SUMMARY";
  selectorPosition: 1 | 2 | 3 | 4;
  activeRowId: number | null;
  openedRowCount: number;
  rowStatuses: Record<number, VCNVRowStatus>;
  centerStatus: VCNVRowStatus;
  rowSubmissions: Record<number, string>;
  cnvBuzzerPosition: 1 | 2 | 3 | 4 | null;
  deadlineEpochMs: number | null;
  lastFeedback: string | null;
  lastRowEvaluation?: {
    rowLabel: string;
    question: string;
    officialAnswer: string;
    explanation: string;
    results: Round2RowEvalItem[];
  } | null;
  cnvWinner: {
    solved: boolean;
    position?: 1 | 2 | 3 | 4;
    name?: string;
    submittedKeyword?: string;
    officialKeyword?: string;
    points?: number;
    message: string;
  } | null;
}

// Round 3 (Tăng Tốc) State
export interface TangTocSubmission {
  position: 1 | 2 | 3 | 4;
  name: string;
  answer: string;
  timeSec: number;
  isCorrect?: boolean;
  pointsAwarded?: number;
}

export interface Round3State {
  subPhase: "INTRO" | "QUESTION_ACTIVE" | "QUESTION_RESULT" | "ROUND_SUMMARY";
  qIndex: number;
  questionStartEpochMs: number;
  deadlineEpochMs: number | null;
  submissions: Record<number, TangTocSubmission>;
  rankedResults: TangTocSubmission[];
}

// Round 4 (Về Đích) State
export interface Round4State {
  subPhase:
    | "SELECT_PACKAGE"
    | "PRE_QUESTION_STAR"
    | "MAIN_ANSWERING"
    | "STEAL_WINDOW"
    | "STEAL_ANSWERING"
    | "QUESTION_RESULT"
    | "TURN_DONE"
    | "ROUND_SUMMARY";
  turnOrder: (1 | 2 | 3 | 4)[];
  turnIndex: number;
  activePosition: 1 | 2 | 3 | 4;
  packagePoints: [20 | 30, 20 | 30, 20 | 30];
  questionIds: [string, string, string];
  qIndex: number;
  starActiveThisQ: boolean;
  stealerPosition: 1 | 2 | 3 | 4 | null;
  deadlineEpochMs: number | null;
  mainSubmittedAnswer?: string | null;
  stealSubmittedAnswer?: string | null;
  lastResult: {
    correct: boolean;
    headline: string;
    submittedAnswer?: string;
    officialAnswer: string;
    detail: string;
    explanation: string;
  } | null;
  used20Ids: string[];
  used30Ids: string[];
}

// Tie-breaker State
export interface TieBreakerState {
  tiedPositions: (1 | 2 | 3 | 4)[];
  subPhase: "BUZZ_OPEN" | "ANSWERING";
  buzzedPosition: 1 | 2 | 3 | 4 | null;
  deadlineEpochMs: number | null;
  lastFeedback?: {
    playerName: string;
    submittedAnswer: string;
    officialAnswer?: string;
    message: string;
  } | null;
}

// Question types for server-side selection
export interface BaseQuestion {
  text: string;
  answer: string;
  acceptedAnswers: string[];
}

export interface TangTocQuestion extends BaseQuestion {
  id: string;
  points: number;
  category: string;
}

export interface OlympiaRoomState {
  roomCode: string;
  version?: number;
  updatedAt?: number;
  creatorClientId?: string | null;
  hostClientId: string | null;
  connectedClientsCount: number;
  leftClientIds?: Record<string, number>;
  seatUpdatedAt?: Record<string, number>;
  processedActionIds?: string[];
  stage: RoomStage;
  allowSharedDeviceControl: boolean;
  seats: [ClimberSeat, ClimberSeat, ClimberSeat, ClimberSeat];
  logs: RoomLogItem[];
  round1: Round1State;
  round2: Round2State;
  round3: Round3State;
  round4: Round4State;
  tieBreaker: TieBreakerState;
  // Server-side selected questions (to reduce client bundle size)
  questions?: {
    round1Personal?: BaseQuestion[]; // 24 questions (6 per player)
    round1Common?: BaseQuestion[]; // 12 common questions
    round3?: TangTocQuestion[]; // 20 Tăng Tốc questions
  };
}

export type ClientAction = (
  | {
      type: "JOIN_OR_CLAIM_SEAT";
      preferredPosition?: 1 | 2 | 3 | 4;
      name: string;
      school: string;
      clientId: string;
      isCreatingRoom?: boolean;
    }
  | {
      type: "CLAIM_SEAT";
      position: 1 | 2 | 3 | 4;
      name: string;
      school: string;
      clientId: string;
    }
  | {
      type: "UPDATE_SEAT_INFO";
      position: 1 | 2 | 3 | 4;
      name: string;
      school: string;
      clientId?: string;
    }
  | {
      type: "LEAVE_SEAT";
      position: 1 | 2 | 3 | 4;
      clientId: string;
    }
  | {
      type: "TOGGLE_SHARED_CONTROL";
      allow: boolean;
    }
  | {
      type: "START_MATCH";
      clientId?: string;
      targetStage?: RoomStage;
    }
  | {
      type: "START_DEMO_MATCH";
      name: string;
      school: string;
      clientId: string;
    }
  | {
      type: "RESET_ROOM";
      clientId?: string;
    }
  | {
      type: "FILL_DEMO_BOTS";
      clientId?: string;
    }
  | {
      type: "SERVER_TIMER_EXPIRED";
      expectedDeadline?: number;
    }
  // Round 1 actions
  | { type: "R1_START_PERSONAL_TURN"; clientId?: string }
  | {
      type: "R1_SUBMIT_PERSONAL";
      position: 1 | 2 | 3 | 4;
      qIndex?: number;
      answer: string;
      clientId?: string;
    }
  | {
      type: "R1_NEXT_PERSONAL_CLIMBER";
      fromPosition?: 1 | 2 | 3 | 4;
      clientId?: string;
    }
  | { type: "R1_START_COMMON_QUESTION"; clientId?: string }
  | {
      type: "R1_BUZZ_COMMON";
      position: 1 | 2 | 3 | 4;
      clientId?: string;
    }
  | {
      type: "R1_SUBMIT_COMMON";
      position: 1 | 2 | 3 | 4;
      qIndex?: number;
      answer: string;
      clientId?: string;
    }
  | {
      type: "R1_NEXT_COMMON_QUESTION";
      fromQIndex?: number;
      clientId?: string;
    }
  // Round 2 actions
  | { type: "R2_SELECT_PUZZLE"; puzzleIndex: number; clientId?: string }
  | { type: "R2_PICK_ROW"; rowId: number; clientId?: string }
  | {
      type: "R2_SUBMIT_ROW_ANSWER";
      position: 1 | 2 | 3 | 4;
      answer: string;
      clientId?: string;
    }
  | { type: "R2_EVALUATE_ROW_NOW"; clientId?: string }
  | { type: "R2_CONTINUE_SELECT_ROW"; clientId?: string }
  | { type: "R2_OPEN_CENTER"; clientId?: string }
  | { type: "R2_BUZZ_CNV"; position: 1 | 2 | 3 | 4; clientId?: string }
  | { type: "R2_CANCEL_BUZZ_CNV"; clientId?: string }
  | {
      type: "R2_SUBMIT_CNV";
      position: 1 | 2 | 3 | 4;
      keyword: string;
      clientId?: string;
    }
  // Round 3 actions
  | { type: "R3_START_QUESTION"; qIndex: number; clientId?: string }
  | {
      type: "R3_SUBMIT_ANSWER";
      position: 1 | 2 | 3 | 4;
      answer: string;
      clientId?: string;
    }
  | { type: "R3_FINALIZE_QUESTION"; clientId?: string }
  // Round 4 actions
  | {
      type: "R4_CONFIRM_PACKAGE";
      position: 1 | 2 | 3 | 4;
      points: [20 | 30, 20 | 30, 20 | 30];
      clientId?: string;
    }
  | { type: "R4_START_QUESTION"; useStar: boolean; clientId?: string }
  | {
      type: "R4_SUBMIT_MAIN_ANSWER";
      qIndex?: number;
      answer: string;
      clientId?: string;
    }
  | { type: "R4_BUZZ_STEAL"; position: 1 | 2 | 3 | 4; clientId?: string }
  | { type: "R4_SKIP_STEAL_WINDOW"; clientId?: string }
  | {
      type: "R4_SUBMIT_STEAL_ANSWER";
      position: 1 | 2 | 3 | 4;
      answer: string;
      clientId?: string;
    }
  | {
      type: "R4_NEXT_STEP";
      fromTurnIndex?: number;
      fromQIndex?: number;
      clientId?: string;
    }
  // Tie Breaker
  | { type: "TB_BUZZ"; position: 1 | 2 | 3 | 4; clientId?: string }
  | {
      type: "TB_SUBMIT";
      position: 1 | 2 | 3 | 4;
      answer: string;
      clientId?: string;
    }
) & {
  actionId?: string;
};
