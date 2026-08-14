import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stage } from "@/components/Stage";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "Game Board — The Floor Party Game" },
      {
        name: "description",
        content: "The live game board: surviving players, the category pool and the photo stage.",
      },
      { property: "og:title", content: "Game Board — The Floor Party Game" },
      { property: "og:description", content: "Live board for the local photo duel party game." },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  const { state, survivingPlayers } = useGame();
  const navigate = useNavigate();

  return (
    <Stage
      title="Game Board"
      subtitle="Duel mechanics come next — this is the board layout."
      actions={
        <>
          <Button variant="secondary" onClick={() => navigate({ to: "/" })}>
            Back to setup
          </Button>
          <Button onClick={() => navigate({ to: "/duel" })}>Duel result</Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="panel p-6">
          <h2 className="text-xl font-semibold">Players in play</h2>
          <ul className="mt-4 space-y-2">
            {survivingPlayers.map((p) => (
              <li
                key={p.id}
                className={`rounded-md px-3 py-2 ${
                  p.id === state.activePlayerId ? "gold-frame" : "bg-secondary"
                }`}
              >
                {p.name || "—"}
              </li>
            ))}
          </ul>
        </section>
        <section className="panel gold-frame flex min-h-80 items-center justify-center p-6">
          <p className="text-muted-foreground">Photo question appears here</p>
        </section>
      </div>
      <section className="panel mt-6 p-6">
        <h2 className="text-xl font-semibold">Category pool</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {state.categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories.</p>
          ) : (
            state.categories.map((c) => (
              <span
                key={c.id}
                className="font-display rounded-md bg-secondary px-4 py-2 text-sm tracking-wide"
              >
                {c.name || "Untitled"} · {c.questions.length}
              </span>
            ))
          )}
        </div>
      </section>
    </Stage>
  );
}
