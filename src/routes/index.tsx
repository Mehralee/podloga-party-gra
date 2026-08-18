import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stage } from "@/components/Stage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createQuestion, newImageId, useGame } from "@/game/store";
import { deleteImage, putImage, releaseImageUrl } from "@/game/imageStore";
import { useImageUrl } from "@/game/useImageUrl";
import type { Category, Question } from "@/game/types";
import { useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Game Setup — The Floor Party Game" },
      {
        name: "description",
        content:
          "Set up players and the shared category pool for The Floor party game.",
      },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const { state, dispatch, hydrated } = useGame();
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
      title="Game Setup"
      subtitle="Add your players and build the shared category pool."
      actions={
        <Button
        size="lg"
        disabled={!canStart}
        onClick={() => {
          console.log("START GAME CLICKED");
          navigate({ to: "/tournament" });
          }
          }
>
  Start game
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
          Every player needs a name. Every category needs a name, hint and
          answered photo.
        </p>
      )}
    </Stage>
  );
}

function PlayersPanel() {
  const { state, dispatch } = useGame();

  return (
    <section className="panel p-6">
      <h2 className="text-xl font-semibold">Players</h2>

      <div className="mt-4 max-w-40">
        <Label htmlFor="count">Number of players</Label>
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
              placeholder={`Player ${i + 1}`}
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
  const { state, dispatch } = useGame();

  return (
    <section className="panel p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Category Pool</h2>
          <p className="text-sm text-muted-foreground">
            Shared by the whole game.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => dispatch({ type: "addCategory" })}
        >
          + Add category
        </Button>
      </div>

      {state.categories.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Add your first category.
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          {state.categories.map((category, index) => (
            <CategoryEditor
              key={category.id}
              category={category}
              index={index}
            />
          ))}
        </div>
      )}
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
  const { dispatch } = useGame();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <div className="flex items-center gap-3">
        <span className="font-display text-lg text-primary">
          {index + 1}.
        </span>

        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <Input
            value={category.name}
            placeholder="Category name"
            onChange={(e) =>
              dispatch({
                type: "updateCategory",
                id: category.id,
                changes: { name: e.target.value },
              })
            }
          />

          <Input
            value={category.hint}
            placeholder="Hint shown during duel"
            onChange={(e) =>
              dispatch({
                type: "updateCategory",
                id: category.id,
                changes: { hint: e.target.value },
              })
            }
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          title={collapsed ? "Expand photos" : "Collapse photos"}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? "▸" : "▾"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            dispatch({
              type: "removeCategory",
              id: category.id,
            })
          }
        >
          Delete
        </Button>
      </div>

      {collapsed ? (
        <div className="mt-2 pl-8 text-sm text-muted-foreground">
          {category.name || "Unnamed category"}
          {category.hint ? ` — ${category.hint}` : ""}
          <span className="ml-2 opacity-60">
            ({category.questions.length} photos)
          </span>
        </div>
      ) : (
        <QuestionsEditor category={category} />
      )}
    </div>
  );
}

function QuestionsEditor({ category }: { category: Category }) {
  const { dispatch } = useGame();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((f) =>
      f.type.startsWith("image/"),
    );

    if (!files.length) return;

    setUploading(true);

    try {
      const questions: Question[] = [];

      for (const file of files) {
        const imageId = newImageId();

        await putImage(imageId, file);

        questions.push(
          createQuestion(imageId, file.name),
        );
      }

      dispatch({
        type: "addQuestions",
        categoryId: category.id,
        questions,
      });
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="mt-4 pl-0 sm:pl-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Photo bank
          </p>

          <p className="text-sm text-muted-foreground">
            {category.questions.length} photo
            {category.questions.length === 1 ? "" : "s"}
          </p>
        </div>

        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />

          <Button
            variant="secondary"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Adding…" : "+ Add photos"}
          </Button>
        </div>
      </div>

      {category.questions.length > 0 && (
        <div className="mt-4 max-h-[32rem] overflow-y-auto rounded-lg border border-border bg-background/30 p-3">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {category.questions.map((question, index) => (
              <CompactQuestion
                key={question.id}
                categoryId={category.id}
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
  categoryId,
  question,
  index,
}: {
  categoryId: string;
  question: Question;
  index: number;
}) {
  const { dispatch } = useGame();
  const url = useImageUrl(question.imageId);

  return (
    <div className="group relative overflow-hidden rounded-md border border-border bg-secondary">
      <div className="aspect-square">
        {url ? (
          <img
            src={url}
            alt={question.answer || `Photo ${index + 1}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            ?
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-background/90 p-1">
        <Input
          value={question.answer}
          placeholder={`#${index + 1} answer`}
          className="h-7 border-0 bg-transparent px-1 text-xs"
          onChange={(e) =>
            dispatch({
              type: "updateQuestion",
              categoryId,
              questionId: question.id,
              changes: { answer: e.target.value },
            })
          }
        />
      </div>

      <button
        type="button"
        className="absolute right-1 top-1 hidden h-6 w-6 rounded-full bg-destructive text-xs text-destructive-foreground group-hover:block"
        onClick={() => {
          dispatch({
            type: "removeQuestion",
            categoryId,
            questionId: question.id,
          });

          releaseImageUrl(question.imageId);
          void deleteImage(question.imageId);
        }}
      >
        ×
      </button>
    </div>
  );
}