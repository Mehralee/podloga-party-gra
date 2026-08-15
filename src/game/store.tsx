import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_DUEL_TIME,
  type Category,
  type GamePhase,
  type GameState,
  type Player,
  type Question,
} from "./types";


const STORAGE_KEY = "the-floor-setup-v1";

const createId = () => Math.random().toString(36).slice(2, 10);

export const createPlayer = (name = ""): Player => ({
  id: createId(),
  name,
  eliminated: false,
});

export const createQuestion = (imageId: string, fileName?: string): Question => ({
  id: createId(),
  imageId,
  fileName,
  answer: "",
});

export const createCategory = (name = ""): Category => ({
  id: createId(),
  name,
  hint: "",
  questions: [],
});

export const newImageId = () => `img_${createId()}${createId()}`;

const initialState: GameState = {
  phase: "setup",
  players: [createPlayer(), createPlayer()],
  categories: [],
  consumedQuestionIds: [],
  currentDuel: null,
  activePlayerId: null,
  timers: {},
  revealed: false,
  paused: false,
  winnerId: null,
};

const pick = <T,>(items: T[]): T | undefined =>
  items.length ? items[Math.floor(Math.random() * items.length)] : undefined;

/** Next unused question of a category, in stored order. */
function nextQuestion(state: GameState, categoryId: string): Question | undefined {
  const category = state.categories.find((c) => c.id === categoryId);
  return category?.questions.find((q) => !state.consumedQuestionIds.includes(q.id));
}

/** Categories that still have at least one unused question. */
function availableCategories(state: GameState): Category[] {
  return state.categories.filter((c) => nextQuestion(state, c.id));
}

/** Starts a duel between two random survivors on a random available category. */
function beginDuel(state: GameState): GameState {
  const survivors = state.players.filter((p) => !p.eliminated);
  if (survivors.length < 2) {
    return {
      ...state,
      phase: "finished",
      currentDuel: null,
      winnerId: survivors[0]?.id ?? null,
    };
  }
  const challenger = pick(survivors)!;
  const defender = pick(survivors.filter((p) => p.id !== challenger.id))!;
  const category = pick(availableCategories(state));
  if (!category) return { ...state, phase: "finished", currentDuel: null };
  const question = nextQuestion(state, category.id)!;

  return {
    ...state,
    phase: "playing",
    currentDuel: {
      challengerId: challenger.id,
      defenderId: defender.id,
      categoryId: category.id,
      questionId: question.id,
      winnerId: null,
      loserId: null,
    },
    consumedQuestionIds: [...state.consumedQuestionIds, question.id],
    activePlayerId: challenger.id,
    timers: { [challenger.id]: DEFAULT_DUEL_TIME, [defender.id]: DEFAULT_DUEL_TIME },
    revealed: false,
    paused: false,
  };
}

/** Loads the next unused question of the current category, if any. */
function advanceQuestion(state: GameState): GameState {
  const duel = state.currentDuel;
  if (!duel) return state;
  const question = nextQuestion(state, duel.categoryId);
  if (!question) return endDuel(state, state.activePlayerId!);
  return {
    ...state,
    currentDuel: { ...duel, questionId: question.id },
    consumedQuestionIds: [...state.consumedQuestionIds, question.id],
    revealed: false,
  };
}

/** Ends the duel: the given player wins. The loser is only marked as
 *  eliminated later, when the host confirms it on the result screen. */
function endDuel(state: GameState, winnerId: string): GameState {
  const duel = state.currentDuel;
  if (!duel) return state;
  const loserId = winnerId === duel.challengerId ? duel.defenderId : duel.challengerId;
  return {
    ...state,
    phase: "duel-result",
    paused: false,
    activePlayerId: null,
    currentDuel: { ...duel, winnerId, loserId },
  };
}

/** Host confirmed the elimination: remove the loser and continue the game. */
function confirmElimination(state: GameState): GameState {
  const loserId = state.currentDuel?.loserId;
  if (!loserId) return state;
  const players = state.players.map((p) => (p.id === loserId ? { ...p, eliminated: true } : p));
  const survivors = players.filter((p) => !p.eliminated);
  if (survivors.length <= 1) {
    return {
      ...state,
      players,
      phase: "finished",
      currentDuel: null,
      activePlayerId: null,
      winnerId: survivors[0]?.id ?? null,
    };
  }
  return beginDuel({ ...state, players });
}



type Action =
  | { type: "setPlayerCount"; count: number }
  | { type: "setPlayerName"; id: string; name: string }
  | { type: "addCategory" }
  | { type: "removeCategory"; id: string }
  | { type: "updateCategory"; id: string; changes: Partial<Omit<Category, "id" | "questions">> }
  | { type: "addQuestions"; categoryId: string; questions: Question[] }
  | { type: "removeQuestion"; categoryId: string; questionId: string }
  | {
      type: "updateQuestion";
      categoryId: string;
      questionId: string;
      changes: Partial<Omit<Question, "id">>;
    }
  | { type: "moveQuestion"; categoryId: string; questionId: string; direction: -1 | 1 }
  | { type: "setPhase"; phase: GamePhase }
  | { type: "startGame" }
  | { type: "nextDuel" }
  | { type: "reveal" }
  | { type: "correct" }
  | { type: "pass" }
  | { type: "togglePause" }
  | { type: "tick"; seconds: number }
  | { type: "resetGame" }
  | { type: "hydrate"; state: GameState };


function mapCategory(state: GameState, id: string, fn: (c: Category) => Category): GameState {
  return { ...state, categories: state.categories.map((c) => (c.id === id ? fn(c) : c)) };
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "setPlayerCount": {
      const count = Math.max(2, Math.min(24, action.count));
      const players = [...state.players];
      while (players.length < count) players.push(createPlayer());
      return { ...state, players: players.slice(0, count) };
    }
    case "setPlayerName":
      return {
        ...state,
        players: state.players.map((p) => (p.id === action.id ? { ...p, name: action.name } : p)),
      };
    case "addCategory":
      return { ...state, categories: [...state.categories, createCategory()] };
    case "removeCategory":
      return { ...state, categories: state.categories.filter((c) => c.id !== action.id) };
    case "updateCategory":
      return mapCategory(state, action.id, (c) => ({ ...c, ...action.changes }));
    case "addQuestions":
      return mapCategory(state, action.categoryId, (c) => ({
        ...c,
        questions: [...c.questions, ...action.questions],
      }));
    case "removeQuestion":
      return mapCategory(state, action.categoryId, (c) => ({
        ...c,
        questions: c.questions.filter((q) => q.id !== action.questionId),
      }));
    case "updateQuestion":
      return mapCategory(state, action.categoryId, (c) => ({
        ...c,
        questions: c.questions.map((q) =>
          q.id === action.questionId ? { ...q, ...action.changes } : q,
        ),
      }));
    case "moveQuestion":
      return mapCategory(state, action.categoryId, (c) => {
        const index = c.questions.findIndex((q) => q.id === action.questionId);
        const target = index + action.direction;
        if (index === -1 || target < 0 || target >= c.questions.length) return c;
        const questions = [...c.questions];
        const moved = questions.splice(index, 1)[0]!;
        questions.splice(target, 0, moved);
        return { ...c, questions };
      });
    case "setPhase":
      return { ...state, phase: action.phase };
    case "startGame":
      return beginDuel({
        ...state,
        consumedQuestionIds: [],
        currentDuel: null,
        winnerId: null,
        players: state.players.map((p) => ({ ...p, eliminated: false })),
      });
    case "nextDuel":
      return beginDuel(state);
    case "reveal":
      return { ...state, revealed: true };
    case "correct": {
      const duel = state.currentDuel;
      if (!duel || !state.activePlayerId) return state;
      const other =
        state.activePlayerId === duel.challengerId ? duel.defenderId : duel.challengerId;
      const advanced = advanceQuestion({ ...state, revealed: true });
      if (advanced.phase !== "playing") return advanced;
      return { ...advanced, activePlayerId: other };
    }
    case "pass":
      return state.currentDuel ? advanceQuestion(state) : state;
    case "togglePause":
      return { ...state, paused: !state.paused };
    case "tick": {
      const id = state.activePlayerId;
      if (!id || state.paused || state.phase !== "playing") return state;
      const remaining = Math.max(0, (state.timers[id] ?? 0) - action.seconds);
      const next = { ...state, timers: { ...state.timers, [id]: remaining } };
      if (remaining > 0) return next;
      const duel = state.currentDuel!;
      const other = id === duel.challengerId ? duel.defenderId : duel.challengerId;
      return endDuel(next, other);
    }
    case "resetGame":
      return {
        ...state,
        phase: "setup",
        winnerId: null,
        currentDuel: null,
        timers: {},
        consumedQuestionIds: [],
        activePlayerId: null,
        revealed: false,
        paused: false,
        players: state.players.map((p) => ({ ...p, eliminated: false })),
      };

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  survivingPlayers: Player[];
  /** True once the persisted setup has been read from localStorage */
  hydrated: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GameState>;
        if (Array.isArray(parsed.players) && Array.isArray(parsed.categories)) {
          dispatch({
            type: "hydrate",
            state: {
              ...initialState,
              players: parsed.players,
              categories: parsed.categories,
            },
          });
        }
      }
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ players: state.players, categories: state.categories }),
      );
    } catch {
      /* storage full or unavailable */
    }
  }, [hydrated, state.players, state.categories]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      survivingPlayers: state.players.filter((p) => !p.eliminated),
      hydrated,
    }),
    [state, hydrated],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
