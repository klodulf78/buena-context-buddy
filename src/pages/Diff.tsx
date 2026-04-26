import { useEffect } from "react";

const Diff = () => {
  useEffect(() => {
    document.title = "context.md Demo — Diff";
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="font-mono text-sm uppercase tracking-[0.14em] text-muted-foreground">/ diff</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
          Markdown diff
        </h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Placeholder for the markdown diff view. Spec coming next.
        </p>
      </header>

      <pre className="overflow-x-auto rounded-lg border border-border bg-card p-6 font-mono text-lg leading-relaxed text-foreground">
{`- old line
+ new line`}
      </pre>
    </section>
  );
};

export default Diff;