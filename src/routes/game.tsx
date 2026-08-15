import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Stage } from "@/components/Stage";
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
  const timeoutRef = useRef<number | null>(null);

  const duel = state.currentDuel;
  const category = state.categories.find((c) => c.id === duel?.categoryId);
  const question = category?.questions.find((q) => q.id === duel?.questionId);
  const imageUrl = useImageUrl(question?.imageId);

  // Leave the board as soon as the duel is decided.
  useEffect(() => {
    if (state.phase === "duel-result") navigate({ to: "/duel" });
    if (state.phase === "setup") navigate({ to: "/" });
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
      <Stage title="Game Board" subtitle="No duel is running.">
        <div className="panel mx-auto max-w-2xl p-10 text-center">
          <p className="text-muted-foreground">Start a game from the setup screen.</p>
          <Button className="mt-6" onClick={() => navigate({ to: "/" })}>
            Back to setup
          </Button>
        </div>
      </Stage>
    );
  }

  return (
    <Stage
      title={category.name || "Category"}
      subtitle={category.hint}
      actions={
        <>
          <Button variant="secondary" onClick={reveal}>
            Reveal (A)
          </Button>
          <Button onClick={correct}>Correct (C)</Button>
          <Button variant="secondary" onClick={pass}>
            Pass (P)
          </Button>
          <Button variant="outline" onClick={togglePause}>
            {state.paused ? "Resume (Space)" : "Pause (Space)"}
          </Button>
        </>
      }
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,14rem)_1fr_minmax(0,14rem)]">
        <PlayerCard playerId={duel.challengerId} />
        <section className="panel gold-frame flex min-h-96 flex-col items-center justify-center gap-6 p-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Photo question in category ${category.name}`}
              className={`max-h-[26rem] w-auto rounded-md object-contain transition-opacity duration-300 ${
                transition ? "opacity-0" : "opacity-100"
              }`}
            />
          ) : (
            <p className="text-muted-foreground">Photo unavailable</p>
          )}
          <p className="font-display min-h-10 text-3xl">
            {state.revealed ? (
              <span className="text-gold-shine">{question?.answer || "—"}</span>
            ) : (
              <span className="text-muted-foreground tracking-[0.4em]">• • • • •</span>
            )}
          </p>
        </section>
        <PlayerCard playerId={duel.defenderId} />
      </div>
      {state.paused ? (
        <p className="font-display mt-6 text-center text-2xl text-primary">PAUSED</p>
      ) : null}
    </Stage>
  );
}

function PlayerCard({ playerId }: { playerId: string }) {
  const { state } = useGame();
  const player = state.players.find((p) => p.id === playerId);
  const active = state.activePlayerId === playerId;
  const seconds = state.timers[playerId] ?? DEFAULT_DUEL_TIME;

  return (
    <section
      className={`panel p-6 text-center ${active ? "gold-frame" : "opacity-70"}`}
      aria-current={active ? "true" : undefined}
    >
      <p className="font-display text-2xl">{player?.name || "—"}</p>
      <p className={`mt-4 text-5xl font-bold tabular-nums ${active ? "text-gold-shine" : ""}`}>
        {seconds.toFixed(1)}
      </p>
      <p className="mt-3 text-xs tracking-[0.3em] text-muted-foreground">
        {active ? "ON THE CLOCK" : "FROZEN"}
      </p>
    </section>
  );
}
