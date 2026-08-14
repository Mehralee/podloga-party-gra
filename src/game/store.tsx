import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { Category, GamePhase, GameState, Player, Question } from "./types";

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
  winnerId: null,
};

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
    case "addQuestion":
      return mapCategory(state, action.categoryId, (c) => ({
        ...c,
        questions: [...c.questions, createQuestion()],
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
      return {
        ...state,
        phase: "playing",
        consumedQuestionIds: [],
        currentDuel: null,
        winnerId: null,
        activePlayerId: state.players[0]?.id ?? null,
        players: state.players.map((p) => ({ ...p, eliminated: false })),
      };
    case "resetGame":
      return { ...state, phase: "setup", winnerId: null, currentDuel: null, timers: {} };
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
