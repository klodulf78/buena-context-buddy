import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    document.title = "context.md Demo — Home";
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="font-mono text-sm uppercase tracking-[0.14em] text-muted-foreground">/ home</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
          Split-screen comparison
        </h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Placeholder for the side-by-side comparison view. Spec coming next.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-8">
          <p className="font-mono text-sm text-muted-foreground">left panel</p>
          <p className="mt-3 text-lg text-foreground">Placeholder content.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-8">
          <p className="font-mono text-sm text-muted-foreground">right panel</p>
          <p className="mt-3 text-lg text-foreground">Placeholder content.</p>
        </div>
      </div>
    </section>
  );
};

export default Home;