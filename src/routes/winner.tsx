import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stage } from "@/components/Stage";
import { Confetti } from "@/components/Confetti";
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
    <>
      {winner ? <Confetti /> : null}
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
        <div className="panel gold-frame relative mx-auto max-w-4xl px-10 py-20 text-center">
          <p className="text-gold-shine font-display text-4xl font-bold tracking-[0.3em]">
            ZWYCIĘZCA!
          </p>
          <p className="text-gold-shine animate-in fade-in zoom-in-95 mt-8 text-7xl font-bold uppercase duration-700 md:text-8xl">
            {winner?.name ?? "Not decided yet"}
          </p>
        </div>
      </Stage>
    </>
  );
}
