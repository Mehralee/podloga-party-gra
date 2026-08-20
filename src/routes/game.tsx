import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ACTIVE_MATCH_KEY,
  useGame,
} from "@/game/store";

import { Button } from "@/components/ui/button";
import { DEFAULT_DUEL_TIME } from "@/game/types";

export const Route = createFileRoute(
  "/game",
)({
  head: () => ({
    meta: [
      {
        title:
          "Game Board — The Floor Party Game",
      },
      {
        name: "description",
        content:
          "The live duel board.",
      },
    ],
  }),
  component: GamePage,
});

const TICK_MS = 100;

const BRACKET_KEY =
  "the-floor-tournament-bracket-v1";

const RESULT_KEY =
  `${ACTIVE_MATCH_KEY}-result`;

function GamePage() {
  const { state, dispatch } =
    useGame();

  const navigate =
    useNavigate();

  const initializedMatchRef =
    useRef<string | null>(null);

  const resultSentRef =
    useRef(false);

  const [transition, setTransition] =
    useState<
      null | "correct" | "pass"
    >(null);

  const [timeUp, setTimeUp] =
    useState(false);

  const [winnerName, setWinnerName] =
    useState("");

  const [isFinal, setIsFinal] =
    useState(false);

  const timeoutRef =
    useRef<number | null>(null);

  /*
   * =====================================================
   * INITIALIZE EXACT MATCH
   * =====================================================
   */

  useEffect(() => {
    const raw =
      sessionStorage.getItem(
        ACTIVE_MATCH_KEY,
      );

    if (!raw) {
      return;
    }

    try {
      const match =
        JSON.parse(raw) as {
          matchId?: string;
          player1Id?: string;
          player2Id?: string;
        };

      if (
        !match.matchId ||
        !match.player1Id ||
        !match.player2Id
      ) {
        return;
      }

      if (
        initializedMatchRef.current ===
        match.matchId
      ) {
        return;
      }

      /*
       * If this exact match is already alive
       * in the store, do not restart it.
       */
      if (
        state.activeMatchId ===
          match.matchId &&
        state.currentDuel &&
        state.phase === "playing"
      ) {
        initializedMatchRef.current =
          match.matchId;

        return;
      }

      initializedMatchRef.current =
        match.matchId;

      resultSentRef.current =
        false;

      setTimeUp(false);
      setWinnerName("");
      setIsFinal(false);
      setTransition(null);

      if (
        timeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          timeoutRef.current,
        );

        timeoutRef.current =
          null;
      }

      /*
       * Start this exact match.
       */
      dispatch({
        type: "startGame",
        matchId:
          match.matchId,
        challengerId:
          match.player1Id,
        defenderId:
          match.player2Id,
      });
    } catch {
      // Ignore invalid session data.
    }
  }, [
    dispatch,
    state.activeMatchId,
    state.currentDuel,
    state.phase,
  ]);

  const duel =
    state.currentDuel;

  const category =
    state.categories.find(
      (c) =>
        c.id ===
        duel?.categoryId,
    );

  const question =
    category?.questions.find(
      (q) =>
        q.id ===
        duel?.questionId,
    );

  const imageUrl =
    question?.imageId ??
    null;

  /*
   * =====================================================
   * DUEL RESULT
   * =====================================================
   */

  useEffect(() => {
    if (
      state.phase !==
      "duel-result"
    ) {
      return;
    }

    if (
      !duel?.winnerId ||
      !state.activeMatchId ||
      resultSentRef.current
    ) {
      return;
    }

    const activeRaw =
      sessionStorage.getItem(
        ACTIVE_MATCH_KEY,
      );

    if (!activeRaw) {
      return;
    }

    try {
      const active =
        JSON.parse(
          activeRaw,
        ) as {
          matchId?: string;
          player1Id?: string;
          player2Id?: string;
        };

      if (
        !active.matchId ||
        active.matchId !==
          state.activeMatchId
      ) {
        return;
      }

      /*
       * Winner MUST belong to this exact duel.
       */
      const winnerIsPlayer =
        duel.winnerId ===
          active.player1Id ||
        duel.winnerId ===
          active.player2Id;

      if (!winnerIsPlayer) {
        return;
      }

      /*
       * Mark result as handled only now.
       */
      resultSentRef.current =
        true;

      const winner =
        state.players.find(
          (p) =>
            p.id ===
            duel.winnerId,
        );

      setWinnerName(
        winner?.name ??
          "ZWYCIĘZCA",
      );

      /*
       * Determine whether this exact
       * match is the final.
       */
      let final = false;

      const bracketRaw =
        sessionStorage.getItem(
          BRACKET_KEY,
        );

      if (bracketRaw) {
        try {
          const bracket =
            JSON.parse(
              bracketRaw,
            ) as Array<{
              id: string;
              round: number;
            }>;

          if (
            bracket.length > 0
          ) {
            const maxRound =
              Math.max(
                ...bracket.map(
                  (m) =>
                    m.round,
                ),
              );

            const activeMatch =
              bracket.find(
                (m) =>
                  m.id ===
                  state.activeMatchId,
              );

            final =
              activeMatch?.round ===
              maxRound;
          }
        } catch {
          final = false;
        }
      }

      setIsFinal(final);

      /*
       * Save exact match result.
       */
      sessionStorage.setItem(
        RESULT_KEY,
        JSON.stringify({
          matchId:
            state.activeMatchId,
          winnerId:
            duel.winnerId,
        }),
      );

      setTimeUp(true);
    } catch {
      // Ignore malformed data.
    }
  }, [
    state.phase,
    state.activeMatchId,
    state.players,
    duel?.winnerId,
  ]);

  /*
   * =====================================================
   * TIMER
   * =====================================================
   *
   * Explicitly stop the timer once a duel ends.
   */

  useEffect(() => {
    if (
      state.phase !==
        "playing" ||
      state.paused ||
      transition === "correct" ||
      !state.activePlayerId
    ) {
      return;
    }

    const id =
      window.setInterval(
        () => {
          dispatch({
            type: "tick",
            seconds:
              TICK_MS / 1000,
          });
        },
        TICK_MS,
      );

    return () =>
      window.clearInterval(id);
  }, [
    state.phase,
    state.paused,
    state.activePlayerId,
    transition,
    dispatch,
  ]);

  /*
   * =====================================================
   * CLEANUP
   * =====================================================
   */

  useEffect(
    () => () => {
      if (
        timeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          timeoutRef.current,
        );
      }
    },
    [],
  );

  /*
   * =====================================================
   * CONTROLS
   * =====================================================
   */

  const reveal =
    useCallback(() => {
      if (
        state.phase !==
        "playing"
      ) {
        return;
      }

      dispatch({
        type: "reveal",
      });
    }, [
      dispatch,
      state.phase,
    ]);

  const correct =
    useCallback(() => {
      if (
        state.phase !==
          "playing" ||
        transition
      ) {
        return;
      }

      dispatch({
        type: "reveal",
      });

      setTransition(
        "correct",
      );

      timeoutRef.current =
        window.setTimeout(
          () => {
            dispatch({
              type: "correct",
            });

            setTransition(
              null,
            );

            timeoutRef.current =
              null;
          },
          500,
        );
    }, [
      dispatch,
      state.phase,
      transition,
    ]);

  const pass =
    useCallback(() => {
      if (
        state.phase !==
          "playing" ||
        transition
      ) {
        return;
      }

      /*
       * Pass shows the answer first.
       */
      dispatch({
        type: "reveal",
      });

      setTransition("pass");

      timeoutRef.current =
        window.setTimeout(
          () => {
            dispatch({
              type: "pass",
            });

            setTransition(
              null,
            );

            timeoutRef.current =
              null;
          },
          1000,
        );
    }, [
      dispatch,
      state.phase,
      transition,
    ]);

  const togglePause =
    useCallback(() => {
      if (
        state.phase !==
        "playing"
      ) {
        return;
      }

      dispatch({
        type: "togglePause",
      });
    }, [
      dispatch,
      state.phase,
    ]);

  /*
   * =====================================================
   * KEYBOARD
   * =====================================================
   */

  useEffect(() => {
    const onKey = (
      e: KeyboardEvent,
    ) => {
      const target =
        e.target as
          | HTMLElement
          | null;

      if (
        target &&
        /^(INPUT|TEXTAREA)$/.test(
          target.tagName,
        )
      ) {
        return;
      }

      const key =
        e.key.toLowerCase();

      if (key === "a") {
        reveal();
      } else if (
        key === "c"
      ) {
        correct();
      } else if (
        key === "p"
      ) {
        pass();
      } else if (
        e.code === "Space"
      ) {
        e.preventDefault();

        togglePause();
      }
    };

    window.addEventListener(
      "keydown",
      onKey,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKey,
      );
  }, [
    reveal,
    correct,
    pass,
    togglePause,
  ]);

  /*
   * =====================================================
   * WINNER SCREEN
   * =====================================================
   */

  if (
    timeUp &&
    winnerName &&
    state.phase ===
      "duel-result"
  ) {
    return (
      <div className="stage-shell relative flex h-screen items-center justify-center overflow-hidden">
        <div
          className="stage-vignette"
          aria-hidden
        />

        <div
          className="stage-grid-lines"
          aria-hidden
        />

        <div className="relative z-10 flex w-full max-w-6xl flex-col items-center justify-center px-8 text-center">
          <p className="eyebrow anim-rise">
            THE FLOOR
          </p>

          <p className="mt-6 font-display text-2xl uppercase tracking-[0.5em] text-primary">
            {isFinal
              ? "MISTRZ TURNIEJU"
              : "ZWYCIĘZCA POJEDYNKU"}
          </p>

          <h1
            className={`text-gold-shine mt-6 font-display text-[clamp(4rem,12vw,11rem)] uppercase leading-none ${
              isFinal
                ? "anim-slam"
                : "anim-rise"
            }`}
          >
            ZWYCIĘZCA
          </h1>

          <h2
            className={`mt-4 font-display text-[clamp(3rem,9vw,8rem)] uppercase leading-none ${
              isFinal
                ? "text-gold-shine anim-slam"
                : "text-foreground anim-rise"
            }`}
          >
            {winnerName}!
          </h2>

          {isFinal ? (
            <>
              <div className="mt-10 flex items-center justify-center gap-4">
                <div className="h-px w-20 bg-primary/50" />
                <span className="text-3xl text-primary">
                  ★
                </span>
                <div className="h-px w-20 bg-primary/50" />
              </div>

              <p className="mt-6 text-lg uppercase tracking-[0.35em] text-muted-foreground">
                MISTRZ THE FLOOR
              </p>

              <div className="mt-12 flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() =>
                    navigate({
                      to: "/",
                    })
                  }
                >
                  WRÓĆ DO STARTU
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    sessionStorage.removeItem(
                      BRACKET_KEY,
                    );

                    sessionStorage.removeItem(
                      ACTIVE_MATCH_KEY,
                    );

                    sessionStorage.removeItem(
                      RESULT_KEY,
                    );

                    navigate({
                      to: "/tournament",
                    });
                  }}
                >
                  RESETUJ TURNIEJ
                </Button>
              </div>
            </>
          ) : (
            <Button
              className="mt-12"
              size="lg"
              onClick={() =>
                navigate({
                  to: "/tournament",
                })
              }
            >
              KONTYNUUJ TURNIEJ
            </Button>
          )}
        </div>

        {isFinal ? (
          <>
            <div className="pointer-events-none absolute left-[10%] top-[20%] animate-pulse text-5xl text-primary/40">
              ★
            </div>

            <div className="pointer-events-none absolute right-[12%] top-[30%] animate-pulse text-4xl text-primary/30">
              ★
            </div>

            <div className="pointer-events-none absolute bottom-[20%] left-[20%] animate-pulse text-3xl text-primary/30">
              ★
            </div>

            <div className="pointer-events-none absolute bottom-[25%] right-[20%] animate-pulse text-5xl text-primary/40">
              ★
            </div>
          </>
        ) : null}
      </div>
    );
  }

  /*
   * =====================================================
   * STARTING
   * =====================================================
   */

  if (
    !duel ||
    !category
  ) {
    return (
      <div className="stage-shell flex items-center justify-center">
        <div
          className="stage-vignette"
          aria-hidden
        />

        <div className="panel-glass relative z-10 max-w-2xl p-12 text-center">
          <p className="eyebrow">
            THE FLOOR
          </p>

          <h1 className="text-gold-shine stage-title mt-3 text-5xl">
            Rozpoczynanie pojedynku...
          </h1>

          <p className="mt-4 text-muted-foreground">
            Przygotowywanie graczy i
            pierwszego pytania.
          </p>

          <Button
            className="mt-8"
            size="lg"
            onClick={() =>
              navigate({
                to: "/tournament",
              })
            }
          >
            Wróć do turnieju
          </Button>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * GAME BOARD
   * =====================================================
   */

  return (
    <div className="stage-shell flex h-screen flex-col">
      <div
        className="stage-vignette"
        aria-hidden
      />

      <div
        className="stage-grid-lines"
        aria-hidden
      />

      {/* COMPACT CATEGORY HEADER */}
      <header className="anim-drop relative z-10 px-6 pt-2 text-center">
        <p className="eyebrow text-xs">
          KATEGORIA
        </p>

        <h1 className="text-gold-shine stage-title mt-0.5 text-[clamp(1.25rem,2.2vw,2.3rem)]">
          {category.name ||
            "Kategoria"}
        </h1>

        {category.hint ? (
          <p className="mt-0.5 text-[clamp(0.75rem,1vw,1rem)] text-muted-foreground">
            {category.hint}
          </p>
        ) : null}

        <div className="gold-rule mx-auto mt-1.5 w-1/2 max-w-2xl" />
      </header>

      {/* MAIN DUEL AREA */}
      <main className="relative z-10 grid min-h-0 flex-1 grid-rows-[1fr] items-center gap-4 overflow-hidden px-5 py-2 lg:grid-cols-[minmax(0,13rem)_1fr_minmax(0,13rem)]">
        {/* LEFT PLAYER */}
        <PlayerPodium
          playerId={
            duel.challengerId
          }
        />

        {/* CENTER IMAGE + ANSWER */}
        <section className="flex h-full min-h-0 flex-col items-center justify-center gap-2">
          <div
            className={`panel-glass gold-frame flex aspect-[612/431] max-h-[calc(100%-3.5rem)] max-w-full min-h-0 w-full items-center justify-center overflow-hidden p-3 transition-all duration-500 ${
              transition === "pass"
                ? "scale-95 opacity-0"
                : transition ===
                    "correct"
                  ? "scale-[1.02] opacity-0"
                  : "scale-100 opacity-100"
            }`}
          >
            {imageUrl ? (
              <img
                key={
                  question?.id
                }
                src={imageUrl}
                alt={`Zdjęcie z kategorii ${category.name}`}
                className="anim-rise h-full w-full rounded-md object-contain"
              />
            ) : (
              <p className="text-muted-foreground">
                Zdjęcie niedostępne
              </p>
            )}
          </div>

          {/* SMALLER ANSWER */}
          <div className="flex min-h-[3rem] items-center justify-center">
            {state.revealed ? (
              <p className="text-gold-shine stage-title anim-slam text-[clamp(1.3rem,2.4vw,2.5rem)]">
                {question?.answer ||
                  "—"}
              </p>
            ) : (
              <p className="text-[clamp(1rem,2vw,2rem)] tracking-[0.5em] text-muted-foreground/60">
                • • • • •
              </p>
            )}
          </div>
        </section>

        {/* RIGHT PLAYER */}
        <PlayerPodium
          playerId={
            duel.defenderId
          }
        />
      </main>

      <footer className="host-bar relative z-10 flex items-center justify-center gap-2 px-8 pb-3 pt-2 opacity-70 transition-opacity duration-300 hover:opacity-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={reveal}
        >
          Reveal · A
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={correct}
        >
          Correct · C
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={pass}
        >
          Pass · P
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={
            togglePause
          }
        >
          {state.paused
            ? "Resume · Space"
            : "Pause · Space"}
        </Button>
      </footer>

      {state.paused ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <p className="text-gold-shine stage-title anim-slam text-[clamp(3rem,9vw,9rem)]">
            PAUSED
          </p>
        </div>
      ) : null}

      {transition ===
      "correct" ? (
        <div className="anim-flash pointer-events-none absolute inset-0 z-30 bg-primary/40" />
      ) : null}
    </div>
  );
}

function PlayerPodium({
  playerId,
}: {
  playerId: string;
}) {
  const { state } =
    useGame();

  const player =
    state.players.find(
      (p) =>
        p.id === playerId,
    );

  const active =
    state.activePlayerId ===
    playerId;

  const seconds =
    state.timers[
      playerId
    ] ??
    DEFAULT_DUEL_TIME;

  const low =
    active &&
    seconds <= 10;

  return (
    <section
      className={`panel-glass player-podium flex h-fit max-h-full min-h-0 flex-col items-center justify-center overflow-hidden px-3 py-4 text-center ${
        active
          ? "podium-active"
          : "podium-idle"
      }`}
      aria-current={
        active
          ? "true"
          : undefined
      }
    >
      {/* PLAYER NAME */}
      <p className="stage-title text-[clamp(0.9rem,1.35vw,1.5rem)]">
        {player?.name ||
          "—"}
      </p>

      {/* SMALLER TIMER */}
      <p
        className={`timer-digits mt-2 text-[clamp(1.6rem,3vw,3rem)] ${
          low
            ? "timer-danger text-destructive"
            : active
              ? "text-gold-shine"
              : "text-foreground/70"
        }`}
      >
        {seconds.toFixed(1)}
      </p>

      <p className="mt-1 text-[0.55rem] tracking-[0.3em] text-muted-foreground">
        {active
          ? "ON THE CLOCK"
          : "FROZEN"}
      </p>
    </section>
  );
}