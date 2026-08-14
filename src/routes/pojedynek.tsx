import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stage } from "@/components/Stage";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/pojedynek")({
  head: () => ({
    meta: [
      { title: "Wynik pojedynku — Podłoga" },
      {
        name: "description",
        content: "Podsumowanie pojedynku: kto wygrał kategorię i kto odpada z gry.",
      },
      { property: "og:title", content: "Wynik pojedynku — Podłoga" },
      { property: "og:description", content: "Podsumowanie pojedynku w grze Podłoga." },
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
      title="Wynik pojedynku"
      subtitle="Ekran podsumowania pojedynku między dwoma graczami."
      actions={
        <>
          <Button variant="secondary" onClick={() => navigate({ to: "/gra" })}>
            Wróć do gry
          </Button>
          <Button onClick={() => navigate({ to: "/zwyciezca" })}>Ekran zwycięzcy</Button>
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
              Zwycięzca: {nameOf(duel.winnerId)}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">Żaden pojedynek nie jest jeszcze rozegrany.</p>
        )}
      </div>
    </Stage>
  );
}
