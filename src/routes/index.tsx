import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stage } from "@/components/Stage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Podłoga — ustawienia gry imprezowej" },
      {
        name: "description",
        content:
          "Przygotuj rozgrywkę: dodaj graczy i kategorie ze zdjęciami, a potem graj na jednym ekranie.",
      },
      { property: "og:title", content: "Podłoga — ustawienia gry imprezowej" },
      {
        property: "og:description",
        content: "Skonfiguruj graczy i kategorie do imprezowej gry na projektorze.",
      },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const canStart =
    state.players.every((p) => p.name.trim().length > 0) &&
    state.categories.length > 0 &&
    state.categories.every((c) => c.name.trim().length > 0);

  return (
    <Stage
      title="Ustawienia gry"
      subtitle="Wpisz liczbę graczy, ich imiona oraz wspólną pulę kategorii."
      actions={
        <Button
          size="lg"
          disabled={!canStart}
          onClick={() => {
            dispatch({ type: "startGame" });
            navigate({ to: "/gra" });
          }}
        >
          Rozpocznij grę
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <h2 className="text-xl font-semibold">Gracze</h2>
          <div className="mt-4 max-w-40">
            <Label htmlFor="count">Liczba graczy</Label>
            <Input
              id="count"
              type="number"
              min={2}
              max={20}
              value={state.players.length}
              onChange={(e) =>
                dispatch({ type: "setPlayerCount", count: Number(e.target.value) || 2 })
              }
            />
          </div>
          <ul className="mt-5 space-y-3">
            {state.players.map((player, i) => (
              <li key={player.id} className="flex items-center gap-3">
                <span className="font-display text-gold w-8 text-lg">{i + 1}.</span>
                <Input
                  value={player.name}
                  placeholder={`Gracz ${i + 1}`}
                  onChange={(e) =>
                    dispatch({ type: "setPlayerName", id: player.id, name: e.target.value })
                  }
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Kategorie</h2>
            <Button variant="secondary" onClick={() => dispatch({ type: "addCategory" })}>
              Dodaj kategorię
            </Button>
          </div>
          {state.categories.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Brak kategorii. Kategorie należą do wspólnej puli — nie do graczy.
            </p>
          ) : (
            <ul className="mt-5 space-y-4">
              {state.categories.map((category) => (
                <li key={category.id} className="rounded-lg border border-border p-4">
                  <Input
                    value={category.name}
                    placeholder="Nazwa kategorii, np. LINIE LOTNICZE"
                    onChange={(e) =>
                      dispatch({
                        type: "updateCategory",
                        id: category.id,
                        changes: { name: e.target.value },
                      })
                    }
                  />
                  <Input
                    className="mt-2"
                    value={category.hint}
                    placeholder="Podpowiedź"
                    onChange={(e) =>
                      dispatch({
                        type: "updateCategory",
                        id: category.id,
                        changes: { hint: e.target.value },
                      })
                    }
                  />
                  <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Pytania ze zdjęciami: {category.questions.length}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch({ type: "removeCategory", id: category.id })}
                    >
                      Usuń
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Stage>
  );
}
