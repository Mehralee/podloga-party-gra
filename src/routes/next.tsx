import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stage } from "@/components/Stage";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/store";
import { DEFAULT_DUEL_TIME } from "@/game/types";

export const Route = createFileRoute("/next")({
  head: () => ({
    meta: [
      { title: "Next Duel — The Floor Party Game" },
      {
        name: "description",
        content: "Announces the two randomly drawn players and the category of the coming duel.",
      },
      { property: "og:title", content: "Next Duel — The Floor Party Game" },
      {
        property: "og:description",
        content: "The dramatic matchup announcement before each photo duel.",
      },
    ],
  }),
  component: NextDuelPage,
});

function NextDuelPage() {
  const { state, survivingPlayers } = useGame();
  const navigate = useNavigate();
  const duel = state.currentDuel;
  const category = state.categories.find((c) => c.id === duel?.categoryId);
  const nameOf = (id?: string | null) => state.players.find((p) => p.id === id)?.name ?? "—";

  if (!duel) {
    return (
      <Stage title="Następny pojedynek" subtitle="Brak zaplanowanego pojedynku.">
        <div className="panel-glass mx-auto max-w-2xl p-10 text-center">
          <Button size="lg" onClick={() => navigate({ to: "/" })}>
            Wróć do ustawień
          </Button>
        </div>
      </Stage>
    );
  }

  return (
    <Stage
      eyebrow="THE FLOOR"
      title="Następny pojedynek"
      subtitle={`${survivingPlayers.length} graczy w grze`}
      actions={
        <Button
          size="lg"
          className="anim-rise delay-3 px-12 py-7 text-xl tracking-[0.3em]"
          onClick={() => navigate({ to: "/game" })}
        >
          ROZPOCZNIJ POJEDYNEK
        </Button>
      }
    >
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <ContenderCard name={nameOf(duel.challengerId)} label="PIERWSZY NA ZEGARZE" delay="" />
          <p className="text-gold-shine stage-title anim-slam delay-2 text-center text-[clamp(2rem,4vw,4rem)]">
            VS
          </p>
          <ContenderCard name={nameOf(duel.defenderId)} label="DRUGI" delay="delay-1" />
        </div>

        <div className="panel-glass anim-rise delay-3 mx-auto mt-10 max-w-4xl px-10 py-8 text-center">
          <p className="eyebrow">KATEGORIA</p>
          <p className="text-gold-shine stage-title mt-2 text-[clamp(1.8rem,3.4vw,3.4rem)]">
            {category?.name || "—"}
          </p>
          {category?.hint ? (
            <p className="mt-3 text-[clamp(1rem,1.5vw,1.6rem)] text-muted-foreground">
              {category.hint}
            </p>
          ) : null}
          <p className="mt-6 text-sm tracking-[0.4em] text-muted-foreground">
            {DEFAULT_DUEL_TIME} SEKUND NA GRACZA
          </p>
        </div>
      </div>
    </Stage>
  );
}

function ContenderCard({
  name,
  label,
  delay,
}: {
  name: string;
  label: string;
  delay: string;
}) {
  return (
    <section className={`panel-glass gold-frame anim-rise ${delay} px-8 py-12 text-center`}>
      <p className="stage-title text-gold-shine text-[clamp(2rem,4.2vw,4.5rem)]">{name}</p>
      <p className="mt-4 text-xs tracking-[0.45em] text-muted-foreground">{label}</p>
    </section>
  );
}
