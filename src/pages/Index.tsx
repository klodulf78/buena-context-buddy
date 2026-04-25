import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { relativeTime } from "@/lib/relativeTime";

type Property = {
  id: string;
  name: string;
  address: string;
  last_run_at: string | null;
};

const Index = () => {
  const [properties, setProperties] = useState<Property[] | null>(null);

  useEffect(() => {
    document.title = "Buena Context Engine — Properties";
    supabase
      .from("properties")
      .select("id, name, address, last_run_at")
      .order("name")
      .then(({ data }) => setProperties(data ?? []));
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Buena
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Context Engine
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your properties, indexed and queryable.
          </p>
        </header>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Properties
          </h2>

          {properties === null ? (
            <div className="rounded-[var(--radius)] border border-border bg-card p-5">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-64 animate-pulse rounded bg-muted" />
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-[var(--radius)] border border-border bg-card p-5 text-sm text-muted-foreground">
              No properties yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {properties.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/property/${p.id}`}
                    className="group flex items-center justify-between rounded-[var(--radius)] border border-border bg-card px-5 py-4 transition-colors hover:bg-secondary"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {p.name}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {p.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-4">
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        Updated {relativeTime(p.last_run_at)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default Index;
