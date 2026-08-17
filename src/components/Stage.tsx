import type { ReactNode } from "react";

export function Stage({
  title,
  subtitle,
  children,
  actions,
  eyebrow = "THE FLOOR",
  compact = false,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
  compact?: boolean;
}) {
  return (
    <div className="stage-shell flex flex-col">
      <div className="stage-vignette" aria-hidden />
      <div className="stage-grid-lines" aria-hidden />

      <main
        className={`relative z-10 mx-auto flex w-full max-w-[1800px] flex-1 flex-col ${
          compact ? "gap-4 px-8 py-5" : "gap-8 px-10 py-10"
        }`}
      >
        {title ? (
          <header className="anim-drop text-center">
            <p className="eyebrow">{eyebrow}</p>
            <h1
              className={`text-gold-shine stage-title mt-2 ${
                compact ? "text-[clamp(1.8rem,3.2vw,3.4rem)]" : "text-[clamp(2.5rem,5vw,5rem)]"
              }`}
            >
              {title}
            </h1>
            <div className="gold-rule mx-auto mt-3 w-2/3 max-w-3xl" />
            {subtitle ? (
              <p
                className={`mx-auto mt-3 max-w-4xl text-muted-foreground ${
                  compact
                    ? "text-[clamp(1rem,1.4vw,1.5rem)]"
                    : "text-[clamp(1rem,1.6vw,1.75rem)]"
                }`}
              >
                {subtitle}
              </p>
            ) : null}
          </header>
        ) : null}

        <div className="flex flex-1 flex-col justify-center">{children}</div>
      </main>

      {actions ? (
        <div className="host-bar relative z-10 flex flex-wrap items-center justify-center gap-3 px-8 pb-6 pt-4">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
