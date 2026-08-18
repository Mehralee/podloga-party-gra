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

  // The loser is still in the survivor list until the host confirms.
  const survivorsAfter = survivingPlayers.filter((p) => p.id !== duel?.loserId).length;

  const eliminate = () => {
  dispatch({ type: "confirmElimination" });

  if (survivorsAfter <= 1) {
    navigate({ to: "/winner" });
    return;
  }

  navigate({ to: "/tournament" });
};

  if (!duel || !duel.winnerId) {
    return (
      <Stage title="Duel Result" subtitle="No duel has been played yet.">
        <div className="panel mx-auto max-w-2xl p-10 text-center">
          <Button onClick={() => navigate({ to: "/" })}>Back to setup</Button>
        </div>
      </Stage>
    );
  }

  return (
    <Stage
      title="Duel Result"
      actions={
        <Button size="lg" onClick={eliminate}>
          ELIMINATE {nameOf(duel.loserId).toUpperCase()}
        </Button>
      }
    >
      <div className="panel gold-frame mx-auto max-w-4xl px-10 py-16 text-center">
        <p className="text-gold-shine font-display animate-in fade-in zoom-in-95 text-7xl font-bold uppercase duration-500 md:text-8xl">
          {nameOf(duel.winnerId)} wins!
        </p>
        <div className="mt-14">
          <p className="font-display text-4xl uppercase text-muted-foreground md:text-5xl">
            {nameOf(duel.loserId)}
          </p>
          <p className="mt-2 text-sm font-semibold tracking-[0.5em] text-destructive">ELIMINATED</p>
        </div>
        <p className="mt-14 text-sm text-muted-foreground">
          {survivorsAfter <= 1
            ? "This is the last duel — the champion is decided."
            : `Players still in the game after this elimination: ${survivorsAfter}`}
        </p>
      </div>
    </Stage>
  );
}
