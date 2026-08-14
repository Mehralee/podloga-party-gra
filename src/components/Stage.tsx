import type { ReactNode } from "react";

export function Stage({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="text-center">
        <p className="font-display text-sm tracking-[0.5em] text-muted-foreground">THE FLOOR</p>
        <h1 className="text-gold-shine mt-2 text-5xl font-bold">{title}</h1>
        {subtitle ? <p className="mt-3 text-muted-foreground">{subtitle}</p> : null}
      </header>
      <div className="flex-1">{children}</div>
      {actions ? <div className="flex justify-center gap-4 pb-4">{actions}</div> : null}
    </main>
  );
}
