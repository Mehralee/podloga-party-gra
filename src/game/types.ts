export type GamePhase = "setup" | "playing" | "duel-result" | "finished";

export interface Player {
  id: string;
  name: string;
  eliminated: boolean;
}

export interface Question {
  id: string;
  /** URL zdjęcia (uzupełniane w kolejnych krokach) */
  photoUrl: string;
  /** Poprawna odpowiedź */
  answer: string;
}

export interface Category {
  id: string;
  name: string;
  /** Jedna podpowiedź do kategorii */
  hint: string;
  /** Uporządkowana lista pytań ze zdjęciami */
  questions: Question[];
}

export interface Duel {
  /** Gracz wyzywający */
  challengerId: string;
  /** Gracz broniący się */
  defenderId: string;
  categoryId: string;
  /** Zwycięzca pojedynku (po rozstrzygnięciu) */
  winnerId: string | null;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  categories: Category[];
  /** Pytania zużyte w tej rozgrywce (id pytań) */
  consumedQuestionIds: string[];
  currentDuel: Duel | null;
  /** Gracz aktualnie odpowiadający */
  activePlayerId: string | null;
  /** Pozostały czas graczy w bieżącym pojedynku (sekundy) */
  timers: Record<string, number>;
  winnerId: string | null;
}

export const DEFAULT_DUEL_TIME = 45;
