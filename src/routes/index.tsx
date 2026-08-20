import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stage } from "@/components/Stage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGame } from "@/game/store";
import type { Category, Question } from "@/game/types";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ustawienia gry — The Floor" },
      {
        name: "description",
        content:
          "Dodaj graczy przed rozpoczęciem gry The Floor.",
      },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const { state, hydrated } = useGame();
  const navigate = useNavigate();

  const namedPlayers = state.players.every((p) => p.name.trim());

  const validCategories =
    state.categories.length > 0 &&
    state.categories.every(
      (c) =>
        c.name.trim() &&
        c.hint.trim() &&
        c.questions.some((q) => q.answer.trim()),
    );

  const canStart = namedPlayers && validCategories;

  return (
    <Stage
      title="Ustawienia gry"
      subtitle="Dodaj graczy i sprawdź pulę kategorii."
      actions={
        <Button
        size="lg"
        disabled={!canStart}
        onClick={() => {
          navigate({ to: "/tournament" });
          }
          }
>
  Rozpocznij grę
</Button>
      }
    >
      {!hydrated ? null : (
        <div className="grid items-start gap-6 lg:grid-cols-[22rem_1fr]">
          <PlayersPanel />
          <CategoriesPanel />
        </div>
      )}

      {!canStart && hydrated && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Każdy gracz musi mieć nazwę.
        </p>
      )}
    </Stage>
  );
}

function PlayersPanel() {
  const { state, dispatch } = useGame();

  return (
    <section className="panel p-6">
      <h2 className="text-xl font-semibold">Gracze</h2>

      <div className="mt-4 max-w-40">
        <Label htmlFor="count">Liczba graczy</Label>
        <Input
          id="count"
          type="number"
          min={2}
          max={24}
          value={state.players.length}
          onChange={(e) =>
            dispatch({
              type: "setPlayerCount",
              count: Number(e.target.value) || 2,
            })
          }
        />
      </div>

      <ul className="mt-5 space-y-3">
        {state.players.map((player, i) => (
          <li key={player.id} className="flex items-center gap-3">
            <span className="w-8 font-display text-lg text-primary">
              {i + 1}.
            </span>

            <Input
              value={player.name}
              placeholder={`Gracz ${i + 1}`}
              onChange={(e) =>
                dispatch({
                  type: "setPlayerName",
                  id: player.id,
                  name: e.target.value,
                })
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CategoriesPanel() {
  const { state } = useGame();

  return (
    <section className="panel p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Pula kategorii</h2>
          <p className="text-sm text-muted-foreground">
            Wspólna dla całej gry.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {state.categories.map((category, index) => (
          <CategoryEditor
            key={category.id}
            category={category}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryEditor({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <div className="flex items-center gap-3">
        <span className="font-display text-lg text-primary">
          {index + 1}.
        </span>

        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <Input value={category.name} readOnly disabled />

          <Input value={category.hint} readOnly disabled />
        </div>

        <Button
          variant="ghost"
          size="icon"
          title={collapsed ? "Rozwiń zdjęcia" : "Zwiń zdjęcia"}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? "▸" : "▾"}
        </Button>
      </div>

      {collapsed ? (
        <div className="mt-2 pl-8 text-sm text-muted-foreground">
          {category.name || "Bez nazwy"}
          {category.hint ? ` — ${category.hint}` : ""}
          <span className="ml-2 opacity-60">
            ({category.questions.length} zdjęć)
          </span>
        </div>
      ) : (
        <QuestionsEditor category={category} />
      )}
    </div>
  );
}

function QuestionsEditor({ category }: { category: Category }) {
  return (
    <div className="mt-4 pl-0 sm:pl-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Bank zdjęć
          </p>

          <p className="text-sm text-muted-foreground">
            {category.questions.length}{" "}
            {category.questions.length === 1 ? "zdjęcie" : "zdjęć"}
          </p>
        </div>
      </div>

      {category.questions.length > 0 && (
        <div className="mt-4 max-h-[32rem] overflow-y-auto rounded-lg border border-border bg-background/30 p-3">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {category.questions.map((question, index) => (
              <CompactQuestion
                key={question.id}
                question={question}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompactQuestion({
  question,
  index,
}: {
  question: Question;
  index: number;
}) {
  return (
    <div className="group relative overflow-hidden rounded-md border border-border bg-secondary">
      <div className="aspect-square">
        <img
          src={question.imageId}
          alt={question.answer || `Zdjęcie ${index + 1}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 truncate bg-background/90 px-2 py-1 text-xs text-foreground">
        {question.answer || `#${index + 1}`}
      </div>
    </div>
  );
}