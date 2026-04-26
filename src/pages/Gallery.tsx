import { useEffect } from "react";

const Gallery = () => {
  useEffect(() => {
    document.title = "context.md Demo — Gallery";
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="font-mono text-sm uppercase tracking-[0.14em] text-muted-foreground">/ gallery</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
          Use-case gallery
        </h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Placeholder tile grid for property-management use cases. Spec coming next.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6">
            <p className="font-mono text-sm text-muted-foreground">card {i + 1}</p>
            <p className="mt-2 text-lg text-foreground">Placeholder use case</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;