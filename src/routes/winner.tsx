import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stage } from "@/components/Stage";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/winner")({
  head: () => ({
    meta: [
      { title: "Final Winner — The Floor Party Game" },
      { name: "description", content: "The final screen crowning the winner of the whole game." },
      { property: "og:title", content: "Final Winner — The Floor Party Game" },
      { property: "og:description", content: "Crown the champion of your photo duel party game." },
    ],
  }),
  component: WinnerPage,
});

function WinnerPage() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const winner = state.players.find((p) => p.id === state.winnerId);

  return (
    <Stage
      title="Final Winner"
      actions={
        <Button
          size="lg"
          onClick={() => {
            dispatch({ type: "resetGame" });
            navigate({ to: "/" });
          }}
        >
          New game
        </Button>
      }
    >
      <div className="panel gold-frame mx-auto max-w-3xl p-16 text-center">
        <p className="font-display tracking-[0.4em] text-muted-foreground">CHAMPION</p>
        <p className="text-gold-shine mt-6 text-6xl font-bold">
          {winner?.name ?? "Not decided yet"}
        </p>
      </div>
    </Stage>
  );
}
