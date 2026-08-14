export type GamePhase = "setup" | "playing" | "duel-result" | "finished";

export interface Player {
  id: string;
  name: string;
  eliminated: boolean;
}

export interface Question {
  id: string;
  /** Key of the image blob stored locally in IndexedDB */
  imageId: string;
  /** Original file name, shown as a fallback label */
  fileName?: string;
  /** Correct answer for this photo */
  answer: string;
}

export interface Category {
  id: string;
  name: string;
  /** One fixed hint for the whole category */
  hint: string;
  /** Ordered list of photo questions */
  questions: Question[];
}

export interface Duel {
  challengerId: string;
  defenderId: string;
  categoryId: string;
  winnerId: string | null;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  /** Shared category pool — categories are never owned by players */
  categories: Category[];
  /** Questions already used in the current game */
  consumedQuestionIds: string[];
  currentDuel: Duel | null;
  activePlayerId: string | null;
  /** Remaining seconds per player in the current duel */
  timers: Record<string, number>;
  winnerId: string | null;
}

export const DEFAULT_DUEL_TIME = 45;
