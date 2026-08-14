import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stage } from "@/components/Stage";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/gra")({
  head: () => ({
    meta: [
      { title: "Ekran gry — Podłoga" },
      {
        name: "description",
        content: "Plansza rozgrywki: gracze, kategorie i aktualny pojedynek na jednym ekranie.",
      },
      { property: "og:title", content: "Ekran gry — Podłoga" },
      { property: "og:description", content: "Plansza rozgrywki dla imprezowej gry Podłoga." },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  const { state, survivingPlayers } = useGame();
  const navigate = useNavigate();

  return (
    <Stage
      title="Ekran gry"
      subtitle="Tu pojawi się plansza, zdjęcia i pojedynki."
      actions={
        <>
          <Button variant="secondary" onClick={() => navigate({ to: "/" })}>
            Ustawienia
          </Button>
          <Button onClick={() => navigate({ to: "/pojedynek" })}>Wynik pojedynku</Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="panel p-6">
          <h2 className="text-xl font-semibold">Gracze w grze</h2>
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
          <p className="text-muted-foreground">Miejsce na zdjęcie pytania</p>
        </section>
      </div>
      <section className="panel mt-6 p-6">
        <h2 className="text-xl font-semibold">Pula kategorii</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {state.categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak kategorii.</p>
          ) : (
            state.categories.map((c) => (
              <span
                key={c.id}
                className="font-display rounded-md bg-secondary px-4 py-2 text-sm tracking-wide"
              >
                {c.name || "Bez nazwy"}
              </span>
            ))
          )}
        </div>
      </section>
    </Stage>
  );
}
