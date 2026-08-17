import { useMemo } from "react";

/** Lightweight CSS-only confetti rain for the winner screen. */
export function Confetti({ pieces = 80 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 4,
        size: 6 + Math.random() * 8,
        tilt: Math.random() * 360,
        hue: [
          "bg-primary",
          "bg-accent",
          "bg-secondary",
          "bg-primary/70",
          "bg-foreground/60",
        ][i % 5],
      })),
    [pieces],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {bits.map((b) => (
        <span
          key={b.id}
          className={`confetti-piece absolute top-[-10%] ${b.hue}`}
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size * 1.6,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            transform: `rotate(${b.tilt}deg)`,
          }}
        />
      ))}
    </div>
  );
}
