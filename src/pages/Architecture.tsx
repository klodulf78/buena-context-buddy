import { useEffect } from "react";

const Architecture = () => {
  useEffect(() => {
    document.title = "context.md Demo — Architecture";
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="font-mono text-sm uppercase tracking-[0.14em] text-muted-foreground">/ arch</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
          Architecture & cost
        </h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Placeholder for the architecture diagram with cost numbers. Spec coming next.
        </p>
      </header>

      <div className="rounded-lg border border-border bg-card p-10">
        <p className="font-mono text-lg text-muted-foreground">[ diagram placeholder ]</p>
      </div>
    </section>
  );
};

export default Architecture;