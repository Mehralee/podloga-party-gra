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
  const { state } = useGame();
  const navigate = useNavigate();
  const duel = state.currentDuel;
  const nameOf = (id?: string | null) => state.players.find((p) => p.id === id)?.name ?? "—";

  return (
    <Stage
      title="Duel Result"
      subtitle="Summary of the head-to-head round."
      actions={
        <>
          <Button variant="secondary" onClick={() => navigate({ to: "/game" })}>
            Back to board
          </Button>
          <Button onClick={() => navigate({ to: "/winner" })}>Winner screen</Button>
        </>
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
          </>
        ) : (
          <p className="text-muted-foreground">No duel has been played yet.</p>
        )}
      </div>
    </Stage>
  );
}
