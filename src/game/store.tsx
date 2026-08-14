import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { Category, GamePhase, GameState, Player, Question } from "./types";

const createId = () => Math.random().toString(36).slice(2, 10);

export const createPlayer = (name = ""): Player => ({
  id: createId(),
  name,
  eliminated: false,
});

export const createQuestion = (): Question => ({
  id: createId(),
  photoUrl: "",
  answer: "",
});

export const createCategory = (name = ""): Category => ({
  id: createId(),
  name,
  hint: "",
  questions: [],
});

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
  | { type: "updateCategory"; id: string; changes: Partial<Omit<Category, "id">> }
  | { type: "setPhase"; phase: GamePhase }
  | { type: "startGame" }
  | { type: "resetGame" };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "setPlayerCount": {
      const count = Math.max(2, Math.min(20, action.count));
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
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.id ? { ...c, ...action.changes } : c,
        ),
      };
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
      return { ...initialState, players: [createPlayer(), createPlayer()] };
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  survivingPlayers: Player[];
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(
    () => ({
      state,
      dispatch,
      survivingPlayers: state.players.filter((p) => !p.eliminated),
    }),
    [state],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame musi być użyte wewnątrz GameProvider");
  return ctx;
}
