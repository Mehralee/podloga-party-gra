export type GamePhase =
  | "setup"
  | "playing"
  | "duel-result"
  | "finished";

export interface Player {
  id: string;
  name: string;
  eliminated: boolean;
}

export interface Question {
  id: string;
  imageId: string;
  fileName?: string | undefined;
  answer: string;
}

export interface Category {
  id: string;
  name: string;
  hint: string;
  questions: Question[];
}

export interface Duel {
  challengerId: string;
  defenderId: string;
  categoryId: string;
  questionId: string | null;
  winnerId: string | null;
  loserId: string | null;
}

export interface GameState {
  phase: GamePhase;

  players: Player[];

  categories: Category[];

  consumedQuestionIds: string[];

  currentDuel: Duel | null;

  /*
   * Exact tournament match currently being played.
   */
  activeMatchId: string | null;

  activePlayerId: string | null;

  timers: Record<string, number>;

  revealed: boolean;

  paused: boolean;

  winnerId: string | null;
}

export const DEFAULT_DUEL_TIME = 4;