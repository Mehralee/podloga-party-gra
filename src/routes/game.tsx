import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/store";
import { useImageUrl } from "@/game/useImageUrl";
import { DEFAULT_DUEL_TIME } from "@/game/types";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "Game Board — The Floor Party Game" },
      {
        name: "description",
        content: "The live duel board: both timers, the category hint and the current photo.",
      },
      { property: "og:title", content: "Game Board — The Floor Party Game" },
      { property: "og:description", content: "Live board for the local photo duel party game." },
    ],
  }),
  component: GamePage,
});

const TICK_MS = 100;

function GamePage() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [transition, setTransition] = useState<null | "correct" | "pass">(null);
  const [timeUp, setTimeUp] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const duel = state.currentDuel;
  const category = state.categories.find((c) => c.id === duel?.categoryId);
  const question = category?.questions.find((q) => q.id === duel?.questionId);
  const imageUrl = useImageUrl(question?.imageId);

  // Leave the board as soon as the duel is decided — after a short dramatic beat.
  useEffect(() => {
    if (state.phase === "setup") {
      navigate({ to: "/" });
      return;
    }
    if (state.phase !== "duel-result") return;
    setTimeUp(true);
    const id = window.setTimeout(() => navigate({ to: "/duel" }), 1600);
    return () => window.clearTimeout(id);
  }, [state.phase, navigate]);

  // Only the active player's timer runs; frozen while paused or during a
  // "correct" transition.
  useEffect(() => {
    if (state.phase !== "playing" || state.paused || transition === "correct") return;
    const id = window.setInterval(() => dispatch({ type: "tick", seconds: TICK_MS / 1000 }), TICK_MS);
    return () => window.clearInterval(id);
  }, [state.phase, state.paused, transition, dispatch]);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  const reveal = useCallback(() => dispatch({ type: "reveal" }), [dispatch]);

  const correct = useCallback(() => {
    if (transition) return;
    dispatch({ type: "reveal" });
    setTransition("correct");
    timeoutRef.current = window.setTimeout(() => {
      dispatch({ type: "correct" });
      setTransition(null);
    }, 500);
  }, [dispatch, transition]);

  const pass = useCallback(() => {
    if (transition) return;
    setTransition("pass");
    timeoutRef.current = window.setTimeout(() => {
      dispatch({ type: "pass" });
      setTransition(null);
    }, 1000);
  }, [dispatch, transition]);

  const togglePause = useCallback(() => dispatch({ type: "togglePause" }), [dispatch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      const key = e.key.toLowerCase();
      if (key === "a") reveal();
      else if (key === "c") correct();
      else if (key === "p") pass();
      else if (e.code === "Space") {
        e.preventDefault();
        togglePause();
      } else return;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reveal, correct, pass, togglePause]);

  if (!duel || !category) {
    return (
      <div className="stage-shell flex items-center justify-center">
        <div className="stage-vignette" aria-hidden />
        <div className="panel-glass relative z-10 max-w-2xl p-12 text-center">
          <p className="eyebrow">THE FLOOR</p>
          <h1 className="text-gold-shine stage-title mt-3 text-5xl">No duel is running</h1>
          <Button className="mt-8" size="lg" onClick={() => navigate({ to: "/" })}>
            Back to setup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-shell flex h-screen flex-col">
      <div className="stage-vignette" aria-hidden />
      <div className="stage-grid-lines" aria-hidden />

      {/* Category banner */}
      <header className="anim-drop relative z-10 px-8 pt-5 text-center">
        <p className="eyebrow">CATEGORY</p>
        <h1 className="text-gold-shine stage-title mt-1 text-[clamp(1.6rem,3vw,3.2rem)]">
          {category.name || "Category"}
        </h1>
        {category.hint ? (
          <p className="mt-1 text-[clamp(0.95rem,1.3vw,1.4rem)] text-muted-foreground">
            {category.hint}
          </p>
        ) : null}
        <div className="gold-rule mx-auto mt-3 w-2/3 max-w-4xl" />
      </header>

      {/* Stage: podium — photo — podium */}
      <main className="relative z-10 grid flex-1 items-center gap-6 overflow-hidden px-8 py-4 lg:grid-cols-[minmax(0,17rem)_1fr_minmax(0,17rem)]">
        <PlayerPodium playerId={duel.challengerId} />

        <section className="flex h-full flex-col items-center justify-center gap-4">
          <div
            className={`panel-glass gold-frame flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden p-4 transition-all duration-500 ${
              transition === "pass"
                ? "scale-95 opacity-0"
                : transition === "correct"
                  ? "scale-[1.02] opacity-0"
                  : "scale-100 opacity-100"
            }`}
          >
            {imageUrl ? (
              <img
                key={question?.id}
                src={imageUrl}
                alt={`Photo question in category ${category.name}`}
                className="anim-rise max-h-full w-auto max-w-full rounded-md object-contain"
              />
            ) : (
              <p className="text-muted-foreground">Photo unavailable</p>
            )}
          </div>

          <div className="flex min-h-[4.5rem] items-center justify-center">
            {state.revealed ? (
              <p className="text-gold-shine stage-title anim-slam text-[clamp(2rem,4vw,4rem)]">
                {question?.answer || "—"}
              </p>
            ) : (
              <p className="text-[clamp(1.5rem,3vw,3rem)] tracking-[0.5em] text-muted-foreground/60">
                • • • • •
              </p>
            )}
          </div>
        </section>

        <PlayerPodium playerId={duel.defenderId} />
      </main>

      {/* Host controls — deliberately secondary */}
      <footer className="host-bar relative z-10 flex items-center justify-center gap-2 px-8 pb-4 pt-3 opacity-70 transition-opacity duration-300 hover:opacity-100">
        <Button variant="ghost" size="sm" onClick={reveal}>
          Reveal · A
        </Button>
        <Button variant="ghost" size="sm" onClick={correct}>
          Correct · C
        </Button>
        <Button variant="ghost" size="sm" onClick={pass}>
          Pass · P
        </Button>
        <Button variant="ghost" size="sm" onClick={togglePause}>
          {state.paused ? "Resume · Space" : "Pause · Space"}
        </Button>
      </footer>

      {/* Overlays */}
      {state.paused ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <p className="text-gold-shine stage-title anim-slam text-[clamp(3rem,9vw,9rem)]">
            PAUSED
          </p>
        </div>
      ) : null}

      {transition === "correct" ? (
        <div className="anim-flash pointer-events-none absolute inset-0 z-30 bg-primary/40" />
      ) : null}

      {timeUp ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/85 backdrop-blur-md">
          <p className="stage-title anim-slam text-[clamp(3rem,10vw,10rem)] text-destructive">
            TIME&apos;S UP
          </p>
        </div>
      ) : null}
    </div>
  );
}

function PlayerPodium({ playerId }: { playerId: string }) {
  const { state } = useGame();
  const player = state.players.find((p) => p.id === playerId);
  const active = state.activePlayerId === playerId;
  const seconds = state.timers[playerId] ?? DEFAULT_DUEL_TIME;
  const low = active && seconds <= 10;

  return (
    <section
      className={`panel-glass player-podium px-5 py-8 text-center ${
        active ? "podium-active" : "podium-idle"
      }`}
      aria-current={active ? "true" : undefined}
    >
      <p className="stage-title text-[clamp(1.2rem,1.9vw,2.1rem)]">{player?.name || "—"}</p>
      <p
        className={`timer-digits mt-5 text-[clamp(3rem,6vw,6rem)] ${
          low ? "timer-danger text-destructive" : active ? "text-gold-shine" : "text-foreground/70"
        }`}
      >
        {seconds.toFixed(1)}
      </p>
      <p className="mt-4 text-[0.7rem] tracking-[0.4em] text-muted-foreground">
        {active ? "ON THE CLOCK" : "FROZEN"}
      </p>
    </section>
  );
}
