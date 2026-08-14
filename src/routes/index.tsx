import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stage } from "@/components/Stage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGame } from "@/game/store";
import type { Category } from "@/game/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Game Setup — The Floor Party Game" },
      {
        name: "description",
        content:
          "Set up a local party game: add players and build a shared pool of photo categories with hints.",
      },
      { property: "og:title", content: "Game Setup — The Floor Party Game" },
      {
        property: "og:description",
        content: "Add players and build the shared category pool for your projector party game.",
      },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const { state, dispatch, hydrated } = useGame();
  const navigate = useNavigate();

  const namedPlayers = state.players.every((p) => p.name.trim().length > 0);
  const validCategories =
    state.categories.length > 0 &&
    state.categories.every(
      (c) =>
        c.name.trim().length > 0 &&
        c.hint.trim().length > 0 &&
        c.questions.some((q) => q.answer.trim().length > 0),
    );
  const canStart = namedPlayers && validCategories;

  return (
    <Stage
      title="Game Setup"
      subtitle="Add your players, then build the shared pool of photo categories."
      actions={
        <Button
          size="lg"
          disabled={!canStart}
          onClick={() => {
            dispatch({ type: "startGame" });
            navigate({ to: "/game" });
          }}
        >
          Start game
        </Button>
      }
    >
      {!hydrated ? null : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <PlayersPanel />
          <CategoriesPanel />
        </div>
      )}
      {!canStart && hydrated ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Every player needs a name, and every category needs a name, a hint and at least one photo
          answer.
        </p>
      ) : null}
    </Stage>
  );
}

function PlayersPanel() {
  const { state, dispatch } = useGame();

  return (
    <section className="panel p-6">
      <h2 className="text-xl font-semibold">Players</h2>
      <div className="mt-4 max-w-40">
        <Label htmlFor="count">Number of players</Label>
        <Input
          id="count"
          type="number"
          min={2}
          max={24}
          value={state.players.length}
          onChange={(e) => dispatch({ type: "setPlayerCount", count: Number(e.target.value) || 2 })}
        />
      </div>
      <ul className="mt-5 space-y-3">
        {state.players.map((player, i) => (
          <li key={player.id} className="flex items-center gap-3">
            <span className="font-display w-8 text-lg text-primary">{i + 1}.</span>
            <Input
              value={player.name}
              placeholder={`Player ${i + 1}`}
              onChange={(e) =>
                dispatch({ type: "setPlayerName", id: player.id, name: e.target.value })
              }
            />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">
        Setup is saved in this browser automatically.
      </p>
    </section>
  );
}

function CategoriesPanel() {
  const { state, dispatch } = useGame();

  return (
    <section className="panel p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Category pool</h2>
          <p className="text-sm text-muted-foreground">
            Shared by the whole game — categories are not assigned to players.
          </p>
        </div>
        <Button variant="secondary" onClick={() => dispatch({ type: "addCategory" })}>
          Add category
        </Button>
      </div>

      {state.categories.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No categories yet. Add your first one to get started.
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {state.categories.map((category, index) => (
            <CategoryEditor key={category.id} category={category} index={index} />
          ))}
        </ul>
      )}
    </section>
  );
}

function CategoryEditor({ category, index }: { category: Category; index: number }) {
  const { dispatch } = useGame();

  return (
    <li className="rounded-lg border border-border bg-secondary/40 p-4">
      <div className="flex items-start gap-3">
        <span className="font-display mt-2 text-lg text-primary">{index + 1}.</span>
        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <Input
            value={category.name}
            placeholder="Category name (e.g. AIRLINES)"
            onChange={(e) =>
              dispatch({
                type: "updateCategory",
                id: category.id,
                changes: { name: e.target.value },
              })
            }
          />
          <Input
            value={category.hint}
            placeholder="Hint shown to players"
            onChange={(e) =>
              dispatch({
                type: "updateCategory",
                id: category.id,
                changes: { hint: e.target.value },
              })
            }
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "removeCategory", id: category.id })}
        >
          Delete
        </Button>
      </div>

      <div className="mt-4 space-y-2 pl-0 sm:pl-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Photo questions ({category.questions.length})
        </p>
        {category.questions.map((question, qIndex) => (
          <div key={question.id} className="flex items-center gap-2">
            <span className="w-6 text-sm text-muted-foreground">{qIndex + 1}</span>
            <Input
              className="flex-1"
              value={question.photoUrl}
              placeholder="Photo URL"
              onChange={(e) =>
                dispatch({
                  type: "updateQuestion",
                  categoryId: category.id,
                  questionId: question.id,
                  changes: { photoUrl: e.target.value },
                })
              }
            />
            <Input
              className="flex-1"
              value={question.answer}
              placeholder="Correct answer"
              onChange={(e) =>
                dispatch({
                  type: "updateQuestion",
                  categoryId: category.id,
                  questionId: question.id,
                  changes: { answer: e.target.value },
                })
              }
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Move question up"
              onClick={() =>
                dispatch({
                  type: "moveQuestion",
                  categoryId: category.id,
                  questionId: question.id,
                  direction: -1,
                })
              }
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Move question down"
              onClick={() =>
                dispatch({
                  type: "moveQuestion",
                  categoryId: category.id,
                  questionId: question.id,
                  direction: 1,
                })
              }
            >
              ↓
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete question"
              onClick={() =>
                dispatch({
                  type: "removeQuestion",
                  categoryId: category.id,
                  questionId: question.id,
                })
              }
            >
              ✕
            </Button>
          </div>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => dispatch({ type: "addQuestion", categoryId: category.id })}
        >
          Add photo question
        </Button>
      </div>
    </li>
  );
}
