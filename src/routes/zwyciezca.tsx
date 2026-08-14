import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stage } from "@/components/Stage";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/zwyciezca")({
  head: () => ({
    meta: [
      { title: "Zwycięzca gry — Podłoga" },
      { name: "description", content: "Finałowy ekran ze zwycięzcą całej rozgrywki." },
      { property: "og:title", content: "Zwycięzca gry — Podłoga" },
      { property: "og:description", content: "Finałowy ekran ze zwycięzcą gry Podłoga." },
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
      title="Zwycięzca"
      actions={
        <Button
          size="lg"
          onClick={() => {
            dispatch({ type: "resetGame" });
            navigate({ to: "/" });
          }}
        >
          Nowa gra
        </Button>
      }
    >
      <div className="panel gold-frame mx-auto max-w-3xl p-16 text-center">
        <p className="font-display tracking-[0.4em] text-muted-foreground">MISTRZ PODŁOGI</p>
        <p className="text-gold-shine mt-6 text-6xl font-bold">
          {winner?.name ?? "Jeszcze nie wyłoniony"}
        </p>
      </div>
    </Stage>
  );
}
