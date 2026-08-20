import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Stage } from "@/components/Stage";

import {
  ACTIVE_MATCH_KEY,
  useGame,
} from "@/game/store";

export const Route = createFileRoute(
  "/category",
)({
  component: CategorySelectionPage,
});

type ActiveMatch = {
  matchId?: string;
  player1Id?: string;
  player2Id?: string;
};

function CategorySelectionPage() {
  const {
    state,
    dispatch,
  } = useGame();

  const navigate =
    useNavigate();

  const [
    player1Category,
    setPlayer1Category,
  ] = useState<string>("");

  const [
    player2Category,
    setPlayer2Category,
  ] = useState<string>("");

  const [
    drawing,
    setDrawing,
  ] = useState(false);

  const [
    drawnCategory,
    setDrawnCategory,
  ] = useState<string>("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<string>("");

  const [
    animationKey,
    setAnimationKey,
  ] = useState(0);

  const activeMatch =
    useMemo<ActiveMatch | null>(() => {
      try {
        const raw =
          sessionStorage.getItem(
            ACTIVE_MATCH_KEY,
          );

        if (!raw) {
          return null;
        }

        return JSON.parse(
          raw,
        ) as ActiveMatch;
      } catch {
        return null;
      }
    }, []);

  const player1 =
    state.players.find(
      (player) =>
        player.id ===
        activeMatch?.player1Id,
    );

  const player2 =
    state.players.find(
      (player) =>
        player.id ===
        activeMatch?.player2Id,
    );

  /*
   * Only show categories that still
   * have at least one unused question.
   */
  const availableCategories =
    useMemo(
      () =>
        state.categories.filter(
          (category) =>
            category.questions.some(
              (question) =>
                !state.consumedQuestionIds.includes(
                  question.id,
                ),
            ),
        ),
      [
        state.categories,
        state.consumedQuestionIds,
      ],
    );

  function getCategoryName(
    categoryId: string,
  ): string {
    return (
      state.categories.find(
        (category) =>
          category.id ===
          categoryId,
      )?.name ?? "—"
    );
  }

  /*
   * =====================================================
   * CATEGORY DRAW
   * =====================================================
   */

  async function drawCategory() {
    if (
      drawing ||
      !player1Category ||
      !player2Category ||
      !activeMatch?.matchId ||
      !activeMatch.player1Id ||
      !activeMatch.player2Id
    ) {
      return;
    }

    setDrawing(true);
    setSelectedCategory("");
    setDrawnCategory("");

    /*
     * Exactly two candidates:
     * one from each player.
     */
    const candidates: string[] = [
      player1Category,
      player2Category,
    ];

    /*
     * Decide the actual winner before
     * starting the visual animation.
     */
    const randomIndex =
      Math.floor(
        Math.random() *
          candidates.length,
      );

    const finalCategory =
      candidates[randomIndex];

    if (!finalCategory) {
      setDrawing(false);
      return;
    }

    /*
     * Categories used during the
     * roulette animation.
     */
    const animationPool: string[] = [
      ...availableCategories
        .map(
          (category) =>
            category.id,
        )
        .sort(
          () =>
            Math.random() -
            0.5,
        )
        .slice(0, 8),

      player1Category,
      player2Category,
    ];

    if (
      animationPool.length === 0
    ) {
      setDrawing(false);
      return;
    }

    /*
     * Fast → slow category roulette.
     */
    for (
      let i = 0;
      i < 14;
      i++
    ) {
      const poolIndex =
        i %
        animationPool.length;

      const categoryId =
        animationPool[poolIndex];

      if (!categoryId) {
        continue;
      }

      setAnimationKey(
        (current) =>
          current + 1,
      );

      setDrawnCategory(
        getCategoryName(
          categoryId,
        ),
      );

      /*
       * Gradually slow the animation.
       */
      const delay =
        90 + i * 30;

      await wait(delay);
    }

    /*
     * Final dramatic landing.
     */
    setAnimationKey(
      (current) =>
        current + 1,
    );

    setDrawnCategory(
      getCategoryName(
        finalCategory,
      ),
    );

    await wait(700);

    setSelectedCategory(
      finalCategory,
    );

    setDrawing(false);
  }

  /*
   * =====================================================
   * CONTINUE TO EXISTING VS SCREEN
   * =====================================================
   */

  function continueToNext() {
    if (
      !selectedCategory ||
      !activeMatch?.matchId ||
      !activeMatch.player1Id ||
      !activeMatch.player2Id
    ) {
      return;
    }

    /*
     * Create the duel using the category
     * selected by the draw.
     *
     * IMPORTANT:
     * This does NOT start /game.
     *
     * It only prepares the duel so that
     * /next can display the VS screen.
     */
    dispatch({
      type:
        "startGameWithCategory",

      matchId:
        activeMatch.matchId,

      challengerId:
        activeMatch.player1Id,

      defenderId:
        activeMatch.player2Id,

      categoryId:
        selectedCategory,
    });

    /*
     * Existing VS screen.
     */
    navigate({
      to: "/next",
    });
  }

  /*
   * =====================================================
   * BACK
   * =====================================================
   */

  function goBack() {
    if (drawing) {
      return;
    }

    navigate({
      to: "/tournament",
    });
  }

  /*
   * =====================================================
   * INVALID MATCH
   * =====================================================
   */

  if (
    !activeMatch?.matchId ||
    !player1 ||
    !player2
  ) {
    return (
      <Stage
        title="Wybór kategorii"
        subtitle="Brak zaplanowanego pojedynku."
      >
        <div className="panel-glass mx-auto max-w-2xl p-10 text-center">
          <Button
            size="lg"
            onClick={() =>
              navigate({
                to: "/tournament",
              })
            }
          >
            WRÓĆ DO TURNIEJU
          </Button>
        </div>
      </Stage>
    );
  }

  /*
   * =====================================================
   * RESULT SCREEN
   * =====================================================
   */

  if (selectedCategory) {
    return (
      <Stage
        eyebrow="THE FLOOR"
        title="Kategoria"
        subtitle="Kategoria pojedynku została wylosowana"
      >
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="panel-glass gold-frame w-full max-w-4xl px-8 py-14 text-center">
            <p className="eyebrow">
              WYLOSOWANO
            </p>

            <p className="text-gold-shine stage-title mt-5 animate-in zoom-in-95 duration-500 text-[clamp(2.5rem,6vw,6rem)]">
              {getCategoryName(
                selectedCategory,
              )}
            </p>

            <div className="mx-auto mt-8 h-px w-40 bg-primary/40" />

            <p className="mt-6 text-sm uppercase tracking-[0.35em] text-muted-foreground">
              {player1.name} ×{" "}
              {player2.name}
            </p>

            <div className="mt-10">
              <Button
                size="lg"
                onClick={
                  continueToNext
                }
                className="px-14 py-7 text-xl tracking-[0.25em]"
              >
                DALEJ
              </Button>
            </div>
          </div>
        </div>
      </Stage>
    );
  }

  /*
   * =====================================================
   * CATEGORY SELECTION SCREEN
   * =====================================================
   */

  return (
    <Stage
      eyebrow="THE FLOOR"
      title="Wybierzcie kategorię"
      subtitle="Każdy gracz wybiera jedną kategorię"
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid items-stretch gap-6 md:grid-cols-[1fr_auto_1fr]">
          <CategoryPicker
            playerName={
              player1.name
            }
            value={
              player1Category
            }
            categories={
              availableCategories
            }
            onChange={
              setPlayer1Category
            }
            disabled={
              drawing
            }
          />

          <div className="flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-background/80 font-display text-xl text-primary shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
              VS
            </div>
          </div>

          <CategoryPicker
            playerName={
              player2.name
            }
            value={
              player2Category
            }
            categories={
              availableCategories
            }
            onChange={
              setPlayer2Category
            }
            disabled={
              drawing
            }
          />
        </div>

        {!drawing && (
          <div className="mt-10 flex flex-col items-center gap-4">
            <Button
              size="lg"
              disabled={
                !player1Category ||
                !player2Category
              }
              onClick={
                drawCategory
              }
              className="px-14 py-7 text-xl tracking-[0.25em]"
            >
              LOSUJ KATEGORIĘ
            </Button>

            <Button
              variant="ghost"
              onClick={
                goBack
              }
            >
              WRÓĆ DO TURNIEJU
            </Button>
          </div>
        )}

        {drawing && (
          <div className="mt-10">
            <div className="panel-glass gold-frame mx-auto max-w-3xl overflow-hidden px-8 py-12 text-center">
              <p className="eyebrow">
                LOSOWANIE
              </p>

              <div
                key={
                  animationKey
                }
                className="mt-6 min-h-[100px] animate-in fade-in zoom-in-95 duration-150"
              >
                <p className="text-gold-shine stage-title text-[clamp(2.2rem,5vw,5rem)]">
                  {drawnCategory}
                </p>
              </div>

              <div className="mx-auto mt-8 flex justify-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:100ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:200ms]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </Stage>
  );
}

/*
 * =========================================================
 * CATEGORY PICKER
 * =========================================================
 */

function CategoryPicker({
  playerName,
  value,
  categories,
  onChange,
  disabled,
}: {
  playerName: string;
  value: string;
  categories: {
    id: string;
    name: string;
  }[];
  onChange: (
    value: string,
  ) => void;
  disabled: boolean;
}) {
  const selected =
    categories.find(
      (category) =>
        category.id ===
        value,
    );

  return (
    <section className="panel-glass gold-frame anim-rise px-6 py-8">
      <p className="text-center text-xs uppercase tracking-[0.4em] text-muted-foreground">
        {playerName}
      </p>

      <p className="text-gold-shine mt-3 text-center font-display text-3xl uppercase">
        TWOJA KATEGORIA
      </p>

      <div className="mt-7">
        <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Wybierz kategorię
        </label>

        <select
          value={value}
          disabled={
            disabled
          }
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="w-full rounded-md border border-primary/30 bg-background px-4 py-4 font-display text-lg uppercase text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">
            — WYBIERZ —
          </option>

          {categories.map(
            (category) => (
              <option
                key={
                  category.id
                }
                value={
                  category.id
                }
              >
                {category.name}
              </option>
            ),
          )}
        </select>
      </div>

      {selected && (
        <div className="mt-5 rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-center animate-in fade-in duration-300">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            WYBRANO
          </p>

          <p className="mt-1 font-display text-xl uppercase text-primary">
            {selected.name}
          </p>
        </div>
      )}
    </section>
  );
}

/*
 * =========================================================
 * DELAY
 * =========================================================
 */

function wait(
  milliseconds: number,
): Promise<void> {
  return new Promise<void>(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}