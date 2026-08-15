import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stage } from "@/components/Stage";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/duel")({
  head: () => ({
    meta: [
      { title: "Duel Result — The Floor Party Game" },
      { name: "description", content: "Shows who won the duel and which player leaves the game." },
      { property: "og:title", content: "Duel Result — The Floor Party Game" },
      { property: "og:description", content: "Duel summary screen for the photo duel party game." },
    ],
  }),
  component: DuelResultPage,
});

function DuelResultPage() {
  const { state, dispatch, survivingPlayers } = useGame();
  const navigate = useNavigate();
  const duel = state.currentDuel;
  const nameOf = (id?: string | null) => state.players.find((p) => p.id === id)?.name ?? "—";
  const gameOver = survivingPlayers.length <= 1;

  return (
    <Stage
      title="Duel Result"
      subtitle="Summary of the head-to-head round."
      actions={
        gameOver ? (
          <Button size="lg" onClick={() => navigate({ to: "/winner" })}>
            Winner screen
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              onClick={() => {
                dispatch({ type: "nextDuel" });
                navigate({ to: "/game" });
              }}
            >
              Next duel
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                dispatch({ type: "resetGame" });
                navigate({ to: "/" });
              }}
            >
              Back to setup
            </Button>
          </>
        )
      }
    >
      <div className="panel gold-frame mx-auto max-w-3xl p-10 text-center">
        {duel ? (
          <>
            <p className="font-display text-3xl">
              {nameOf(duel.challengerId)} vs {nameOf(duel.defenderId)}
            </p>
            <p className="text-gold-shine mt-6 text-4xl font-bold">
              Winner: {nameOf(duel.winnerId)}
            </p>
            <p className="mt-3 text-muted-foreground">
              Eliminated: {nameOf(duel.loserId)} — ran out of time or lost the duel.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              Players still in the game: {survivingPlayers.length}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">No duel has been played yet.</p>
        )}
      </div>
    </Stage>
  );
}
