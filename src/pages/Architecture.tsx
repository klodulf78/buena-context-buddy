import { useEffect } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SOURCES = ["emails/", "bank/", "briefe/", "rechnungen/", "stammdaten/"];
const AGENTS = ["Repair Triage", "Dunning", "Owner Reports", "Compliance Watch"];

/** Small label that sits above each tier. */
const TierLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-center font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500">
    {children}
  </p>
);

/**
 * Vertical connector between two tiers. `variant="read"` is accent-colored
 * (substrate → agents); `variant="build"` is subtle grey (sources → engine →
 * substrate). The caption sits to the right of the arrow.
 */
const TierConnector = ({
  variant,
  direction,
  caption,
}: {
  variant: "read" | "build";
  direction: "down" | "up";
  caption: string;
}) => {
  const colorClass =
    variant === "read" ? "text-primary" : "text-gray-400";
  const Icon = direction === "down" ? ArrowDown : ArrowUp;
  return (
    <div className="flex items-center justify-center gap-3">
      <div className={cn("flex flex-col items-center", colorClass)}>
        <div
          className={cn(
            "h-8 w-px",
            variant === "read" ? "bg-primary/60" : "bg-gray-300",
          )}
        />
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <span className="text-sm italic text-gray-600">{caption}</span>
    </div>
  );
};

/**
 * Build-pipeline arrow: a slim vertical line with a small arrowhead, used to
 * connect each source up into the engine box. Pure CSS so it scales with the
 * surrounding flex layout.
 */
const BuildArrowUp = () => (
  <div className="flex flex-col items-center text-gray-400">
    <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
    <div className="h-6 w-px bg-gray-300" />
  </div>
);

const FlowDiagram = () => {
  return (
    <div className="flex flex-col gap-10">
      {/* TIER 1 — Agents */}
      <section className="space-y-4">
        <TierLabel>Agents</TierLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {AGENTS.map((label) => (
            <div
              key={label}
              className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-center"
            >
              <span className="font-mono text-sm font-medium text-primary">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm italic text-gray-600">
          $0.02 per query, every query
        </p>
      </section>

      {/* TIER 2 — read pipeline arrow (accent) */}
      <TierConnector variant="read" direction="down" caption="READ (many times per day)" />

      {/* TIER 3 — Context substrate (the product, visually dominant) */}
      <section className="space-y-4">
        <TierLabel>Context Substrate — the product</TierLabel>
        <Card className="border-2 border-primary/60 bg-primary/[0.04] p-8 lg:p-10 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-lg border border-primary/30 bg-background px-5 py-5 text-center">
              <span className="font-mono text-lg font-semibold text-primary">
                context.property.LIE-001.md
              </span>
            </div>
            <div className="rounded-lg border border-primary/30 bg-background px-5 py-5 text-center">
              <span className="font-mono text-lg font-semibold text-primary">
                context.unit.EH-019.md ×52
              </span>
            </div>
          </div>

          {/* Aggregation Bus — sits below the two MD boxes with a curved
              accent arrow flowing from unit (right) back up to property (left). */}
          <div className="relative mt-8 flex justify-center">
            <svg
              viewBox="0 0 600 70"
              className="absolute inset-x-0 top-0 mx-auto h-16 w-full max-w-2xl"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="agg-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(221 83% 53%)" />
                </marker>
              </defs>
              <path
                d="M 540 8 C 540 50, 60 50, 60 12"
                fill="none"
                stroke="hsl(221 83% 53%)"
                strokeWidth={1.5}
                markerEnd="url(#agg-arrow)"
              />
            </svg>
            <div className="relative z-10 mt-12 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background px-4 py-1.5">
              <span className="font-mono text-xs font-medium text-primary">
                Aggregation Bus
              </span>
              <span className="text-xs text-gray-500">
                · deterministic events · ~80% no LLM
              </span>
            </div>
          </div>
        </Card>
      </section>

      {/* TIER 4 — build pipeline arrow up into substrate */}
      <TierConnector variant="build" direction="up" caption="BUILD (once per source change)" />

      {/* TIER 5 — Engine */}
      <section className="space-y-4">
        <TierLabel>Engine</TierLabel>
        <div className="mx-auto max-w-3xl rounded-xl bg-primary px-8 py-6 text-center">
          <p className="font-mono text-base font-semibold text-primary-foreground sm:text-lg">
            Per-Source Extractors → Fact Store → MD Builders
          </p>
          <p className="mt-1.5 text-sm text-primary-foreground/75">
            LLM only on new sources
          </p>
        </div>
      </section>

      {/* Build-pipeline arrows from sources up into the engine */}
      <div className="grid grid-cols-5 gap-3">
        {SOURCES.map((s) => (
          <div key={s} className="flex justify-center">
            <BuildArrowUp />
          </div>
        ))}
      </div>

      {/* TIER 6 — Sources */}
      <section className="space-y-4">
        <TierLabel>Sources</TierLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {SOURCES.map((s) => (
            <div
              key={s}
              className="rounded-lg border border-border bg-secondary px-3 py-3 text-center"
            >
              <span className="font-mono text-sm text-foreground">{s}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const STATS: { value: string; label: string; sub: string }[] = [
  {
    value: "$0.02",
    label: "Per agent query",
    sub: "vs $0.47 raw-data baseline",
  },
  {
    value: "27×",
    label: "Cheaper per query",
    sub: "measured at our benchmark",
  },
  {
    value: "$8M+",
    label: "Annual savings at 1,000 properties",
    sub: "vs raw-data approach",
  },
  {
    value: "Flat",
    label: "Per-query cost as data grows",
    sub: "raw-data scales with history — we don't",
  },
];

const Architecture = () => {
  useEffect(() => {
    document.title = "context.md Demo — Architecture";
  }, []);

  return (
    <section className="space-y-12">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Architecture</h1>
        <p className="text-sm text-gray-500">How context.md stays cheap as it scales</p>
      </header>

      <Card className="border-border bg-card p-6 lg:p-10">
        <FlowDiagram />
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <Card
            key={s.label}
            className="flex flex-col gap-3 border-border bg-card p-8 text-center"
          >
            <div className="font-mono text-5xl font-bold tabular-nums text-primary">
              {s.value}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-700">
              {s.label}
            </div>
            <div className="mt-2 text-xs italic text-gray-500">{s.sub}</div>
          </Card>
        ))}
      </div>

      <p className="text-base italic text-gray-600">
        Cost per query stays constant as the platform grows. Every year of data makes raw-data
        approaches more expensive. MD-Agent stays at two cents.
      </p>
    </section>
  );
};

export default Architecture;