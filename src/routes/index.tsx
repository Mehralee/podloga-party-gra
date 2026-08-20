import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useState,
} from "react";

import { Stage } from "@/components/Stage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useGame } from "@/game/store";
import type { Category } from "@/game/types";

export const Route = createFileRoute(
  "/",
)({
  head: () => ({
    meta: [
      {
        title:
          "Urodzinowa gra Asi — The Floor",
      },
      {
        name: "description",
        content:
          "Urodzinowa gra Asi — przygotujcie się na pojedynek!",
      },
    ],
  }),

  component: SetupPage,
});

function SetupPage() {
  const {
    state,
    hydrated,
  } = useGame();

  const navigate =
    useNavigate();

  const namedPlayers =
    state.players.every(
      (p) =>
        p.name.trim(),
    );

  const validCategories =
    state.categories.length >
      0 &&
    state.categories.every(
      (c) =>
        c.name.trim() &&
        c.hint.trim() &&
        c.questions.some(
          (q) =>
            q.answer.trim(),
        ),
    );

  const canStart =
    namedPlayers &&
    validCategories;

  return (
    <Stage
      title="The Floor"
      subtitle="Urodzinowa gra Asi"
      actions={
        <Button
          size="lg"
          disabled={!canStart}
          onClick={() => {
            navigate({
              to: "/tournament",
            });
          }}
        >
          ROZPOCZNIJ GRĘ
        </Button>
      }
    >
      {!hydrated ? null : (
        <div className="space-y-8">

          {/* =====================================================
              WELCOME HERO
             ===================================================== */}

          <section className="relative min-h-[280px] overflow-hidden rounded-xl border border-primary/20 bg-background/40 px-6 py-10 sm:px-10">

            {/* =================================================
                🎆 BIRTHDAY CELEBRATION
               ================================================= */}

            <BirthdayCelebration />


            <div className="relative z-10 max-w-3xl">

              <p className="eyebrow">
                URODZINY ASI
              </p>

              <h1 className="text-gold-shine mt-3 font-display text-5xl uppercase leading-none sm:text-7xl">
                Witajcie na
                <br />
                urodzinowej
                <br />
                grze Asi!
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Przygotujcie się na
                serię pojedynków,
                trudnych kategorii
                i jeszcze trudniejszych
                odpowiedzi.
              </p>

              <p className="mt-3 font-display text-lg uppercase tracking-[0.2em] text-primary">
                Kto zostanie królem
                lub królową podłogi?
              </p>

            </div>


            {/* Decorative floor line */}

            <div className="absolute bottom-16 left-0 right-0 h-px bg-primary/20" />


            {/* =================================================
                🦝 BIRTHDAY RACCOON
               ================================================= */}

            <Raccoon />


            {/* Small decorative lights */}

            <div className="absolute right-8 top-8 z-10 flex gap-2 opacity-50">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:600ms]" />

            </div>

          </section>


          {/* =====================================================
              PLAYERS
             ===================================================== */}

          <PlayersPanel />


          {/* =====================================================
              CATEGORIES
             ===================================================== */}

          <CategoriesPanel />

        </div>
      )}

      {!canStart &&
        hydrated && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Każdy gracz musi mieć
            nazwę, a kategorie muszą
            zawierać zdjęcia.
          </p>
        )}

    </Stage>
  );
}


/* =============================================================
   🎆 BIRTHDAY CELEBRATION
   ============================================================= */

function BirthdayCelebration() {
  const confetti = Array.from(
    { length: 34 },
    (_, i) => ({
      id: i,

      left:
        (i * 31.7) % 100,

      delay:
        -((i * 0.73) % 8),

      duration:
        6 + ((i * 1.37) % 5),

      rotation:
        (i * 47) % 360,

      width:
        4 + (i % 3),

      height:
        7 + (i % 4),
    }),
  );

  return (
    <div
      className="birthday-celebration"
      aria-hidden="true"
    >

      {/* =====================================================
          CONFETTI
         ===================================================== */}

      <div className="birthday-confetti">

        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece"
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              width: `${piece.width}px`,
              height: `${piece.height}px`,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        ))}

      </div>


      {/* =====================================================
          FIREWORK 1
         ===================================================== */}

      <div className="firework firework-one">

        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />

      </div>


      {/* =====================================================
          FIREWORK 2
         ===================================================== */}

      <div className="firework firework-two">

        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />

      </div>


      {/* =====================================================
          FIREWORK 3
         ===================================================== */}

      <div className="firework firework-three">

        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />

      </div>

    </div>
  );
}


/* =============================================================
   🦝 BIRTHDAY RACCOON
   ============================================================= */

function Raccoon() {
  return (
    <div
      className="pointer-events-none absolute bottom-7 left-0 z-20"
      aria-hidden="true"
    >

      <div className="raccoon-walk">

        <svg
          className="raccoon-character"
          viewBox="0 0 180 125"
          xmlns="http://www.w3.org/2000/svg"
          role="presentation"
        >

          {/* =================================================
              SHADOW
             ================================================= */}

          <ellipse
            cx="82"
            cy="113"
            rx="45"
            ry="5"
            fill="oklch(0.08 0.03 264 / 0.45)"
          />


          {/* =================================================
              BIRTHDAY BALLOON
             ================================================= */}

          <g className="raccoon-balloon">

            {/* Balloon */}

            <path
              d="
                M121 8
                C109 8, 102 17, 103 28
                C104 40, 112 48, 121 51
                C130 48, 138 40, 139 28
                C140 17, 133 8, 121 8
                Z
              "
              fill="var(--gold)"
              stroke="var(--gold-bright)"
              strokeWidth="2"
            />

            {/* Balloon shine */}

            <ellipse
              cx="114"
              cy="19"
              rx="4"
              ry="7"
              fill="oklch(1 0 0 / 0.55)"
              transform="rotate(-25 114 19)"
            />

            {/* Balloon knot */}

            <path
              d="
                M117 50
                L121 55
                L125 50
                Z
              "
              fill="var(--gold-bright)"
            />

            {/* String */}

            <path
              d="
                M121 55
                C116 67, 124 76, 119 88
                C116 94, 120 100, 116 106
              "
              fill="none"
              stroke="var(--gold)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

          </g>


          {/* =================================================
              TAIL
             ================================================= */}

          <g className="raccoon-tail">

            <path
              d="
                M108 72
                C127 62, 149 66, 153 80
                C157 94, 141 101, 126 92
                C116 87, 111 80, 108 72
              "
              fill="var(--raccoon-body)"
              stroke="var(--raccoon-dark)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Tail stripes */}

            <path
              d="
                M126 68
                C130 75, 130 84, 126 92
              "
              fill="none"
              stroke="var(--raccoon-dark)"
              strokeWidth="6"
              strokeLinecap="round"
            />

            <path
              d="
                M140 70
                C144 77, 144 85, 140 90
              "
              fill="none"
              stroke="var(--raccoon-dark)"
              strokeWidth="6"
              strokeLinecap="round"
            />

          </g>


          {/* =================================================
              BACK LEG
             ================================================= */}

          <g className="raccoon-leg-back">

            <path
              d="M67 83 L64 104"
              fill="none"
              stroke="var(--raccoon-dark)"
              strokeWidth="8"
              strokeLinecap="round"
            />

            <ellipse
              cx="63"
              cy="106"
              rx="7"
              ry="3.5"
              fill="var(--raccoon-black)"
            />

          </g>


          {/* =================================================
              BODY
             ================================================= */}

          <g className="raccoon-body">

            {/* Main body */}

            <ellipse
              cx="82"
              cy="68"
              rx="34"
              ry="26"
              fill="var(--raccoon-body)"
              stroke="var(--raccoon-dark)"
              strokeWidth="2.5"
            />

            {/* Belly */}

            <ellipse
              cx="87"
              cy="72"
              rx="19"
              ry="16"
              fill="var(--raccoon-belly)"
            />


            {/* =================================================
                BACK ARM
               ================================================= */}

            <g className="raccoon-arm-back">

              <path
                d="M62 57 L51 75"
                fill="none"
                stroke="var(--raccoon-body)"
                strokeWidth="8"
                strokeLinecap="round"
              />

              <circle
                cx="50"
                cy="76"
                r="4"
                fill="var(--raccoon-dark)"
              />

            </g>


            {/* =================================================
                FRONT LEG
               ================================================= */}

            <g className="raccoon-leg-front">

              <path
                d="M89 83 L95 104"
                fill="none"
                stroke="var(--raccoon-body)"
                strokeWidth="8"
                strokeLinecap="round"
              />

              <ellipse
                cx="96"
                cy="106"
                rx="7"
                ry="3.5"
                fill="var(--raccoon-black)"
              />

            </g>


            {/* =================================================
                FRONT ARM
               ================================================= */}

            <g className="raccoon-arm-front">

              <path
                d="M101 57 L113 75"
                fill="none"
                stroke="var(--raccoon-body)"
                strokeWidth="8"
                strokeLinecap="round"
              />

              <circle
                cx="114"
                cy="76"
                r="4"
                fill="var(--raccoon-dark)"
              />

            </g>

          </g>


          {/* =================================================
              HEAD
             ================================================= */}

          <g>

            {/* Neck */}

            <ellipse
              cx="56"
              cy="55"
              rx="14"
              ry="15"
              fill="var(--raccoon-dark)"
            />


            {/* Head */}

            <ellipse
              cx="45"
              cy="39"
              rx="29"
              ry="25"
              fill="var(--raccoon-body)"
              stroke="var(--raccoon-dark)"
              strokeWidth="2.5"
            />


            {/* =================================================
                EARS
               ================================================= */}

            <g className="raccoon-ear raccoon-ear-left">

              <circle
                cx="25"
                cy="17"
                r="9.5"
                fill="var(--raccoon-body)"
                stroke="var(--raccoon-dark)"
                strokeWidth="2.5"
              />

              <circle
                cx="25"
                cy="17"
                r="4"
                fill="var(--raccoon-pink)"
              />

            </g>


            <g className="raccoon-ear raccoon-ear-right">

              <circle
                cx="65"
                cy="17"
                r="9.5"
                fill="var(--raccoon-body)"
                stroke="var(--raccoon-dark)"
                strokeWidth="2.5"
              />

              <circle
                cx="65"
                cy="17"
                r="4"
                fill="var(--raccoon-pink)"
              />

            </g>


            {/* =================================================
                FACE MASK
               ================================================= */}

            <path
              d="
                M18 37
                C24 27, 35 26, 45 31
                C55 26, 66 27, 72 37
                C66 49, 55 51, 45 46
                C35 51, 24 49, 18 37
                Z
              "
              fill="var(--raccoon-dark)"
            />


            {/* =================================================
                EYES
               ================================================= */}

            <ellipse
              cx="33"
              cy="37"
              rx="4"
              ry="5"
              fill="var(--raccoon-black)"
            />

            <ellipse
              cx="57"
              cy="37"
              rx="4"
              ry="5"
              fill="var(--raccoon-black)"
            />


            {/* Eye highlights */}

            <circle
              cx="34"
              cy="35"
              r="1.4"
              fill="white"
            />

            <circle
              cx="58"
              cy="35"
              r="1.4"
              fill="white"
            />


            {/* =================================================
                MUZZLE
               ================================================= */}

            <ellipse
              cx="45"
              cy="47"
              rx="13"
              ry="8.5"
              fill="var(--raccoon-light)"
            />


            {/* Nose */}

            <ellipse
              cx="45"
              cy="44"
              rx="4"
              ry="3"
              fill="var(--raccoon-black)"
            />


            {/* Smile */}

            <path
              d="M45 47 C43 50, 40 50, 38 49"
              fill="none"
              stroke="var(--raccoon-black)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            <path
              d="M45 47 C47 50, 50 50, 52 49"
              fill="none"
              stroke="var(--raccoon-black)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

          </g>

        </svg>

      </div>

    </div>
  );
}


/* =============================================================
   PLAYERS
   ============================================================= */

function PlayersPanel() {
  const {
    state,
    dispatch,
  } = useGame();

  return (
    <section className="panel p-6">

      <div className="flex items-center justify-between gap-4">

        <div>

          <p className="eyebrow">
            GRACZE
          </p>

          <h2 className="mt-1 text-2xl font-display uppercase text-primary">
            Kto bierze udział?
          </h2>

        </div>

      </div>


      <div className="mt-5 max-w-40">

        <Label htmlFor="count">
          Liczba graczy
        </Label>

        <Input
          id="count"
          type="number"
          min={2}
          max={24}
          value={
            state.players.length
          }
          onChange={(e) =>
            dispatch({
              type:
                "setPlayerCount",
              count:
                Number(
                  e.target.value,
                ) || 2,
            })
          }
        />

      </div>


      <ul className="mt-5 space-y-3">

        {state.players.map(
          (player, i) => (
            <li
              key={player.id}
              className="flex items-center gap-3"
            >

              <span className="w-8 font-display text-lg text-primary">
                {i + 1}.
              </span>

              <Input
                value={
                  player.name
                }
                placeholder={`Gracz ${
                  i + 1
                }`}
                onChange={(e) =>
                  dispatch({
                    type:
                      "setPlayerName",
                    id: player.id,
                    name:
                      e.target
                        .value,
                  })
                }
              />

            </li>
          ),
        )}

      </ul>

    </section>
  );
}


/* =============================================================
   CATEGORIES
   ============================================================= */

function CategoriesPanel() {
  const { state } =
    useGame();

  return (
    <section className="panel p-6">

      <div>

        <p className="eyebrow">
          PULA GRY
        </p>

        <h2 className="mt-1 text-2xl font-display uppercase text-primary">
          Kategorie
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Wszystkie kategorie
          dostępne podczas
          pojedynków.
        </p>

      </div>


      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {state.categories.map(
          (category, index) => (
            <CategoryCard
              key={
                category.id
              }
              category={
                category
              }
              index={index}
            />
          ),
        )}

      </div>

    </section>
  );
}


/* =============================================================
   CATEGORY CARD
   ============================================================= */

function CategoryCard({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-secondary/30 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-secondary/50">

      {/* Number */}

      <div className="absolute right-4 top-3 font-display text-4xl text-primary/10 transition-colors duration-300 group-hover:text-primary/20">
        {String(
          index + 1,
        ).padStart(2, "0")}
      </div>


      {/* Category */}

      <p className="relative font-display text-2xl uppercase text-primary">
        {category.name ||
          "Bez nazwy"}
      </p>


      {/* Hint */}

      {category.hint && (
        <p className="relative mt-1 text-sm text-muted-foreground">
          {category.hint}
        </p>
      )}


      {/* Stats */}

      <div className="relative mt-5 flex items-center justify-between border-t border-border/60 pt-4">

        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Zdjęcia
        </span>

        <span className="font-display text-xl text-foreground">
          {
            category
              .questions
              .length
          }
        </span>

      </div>


      {/* Bottom accent */}

      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-full" />

    </div>
  );
}