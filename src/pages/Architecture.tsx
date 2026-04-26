import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { ChevronDown, ChevronUp } from "lucide-react";

const SOURCES = ["emails/", "bank/", "briefe/", "rechnungen/", "stammdaten/"];
const AGENTS = ["Repair Triage", "Dunning", "Owner Reports", "Compliance Watch"];

/** Tiny tier label — sits directly above content (mb-2). */
const TierLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
    {children}
  </p>
);

/**
 * Inline arrow + caption used between tiers. A single Lucide chevron is the
 * entire arrow representation — no separate vertical line.
 */
const InlineConnector = ({
  direction,
  caption,
}: {
  direction: "down" | "up";
  caption: string;
}) => {
  const Icon = direction === "down" ? ChevronDown : ChevronUp;
  return (
    <div className="flex items-center justify-center gap-2 py-3 text-gray-500">
      <Icon className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
      <span className="text-sm italic">{caption}</span>
    </div>
  );
};

/** Slim source→engine arrow. Shorter (h-6) and lighter than before. */
const SourceArrowUp = () => (
  <div className="flex flex-col items-center text-slate-400">
    <span className="-mb-0.5 text-[10px] leading-none">▲</span>
    <div className="h-6 w-px bg-slate-300" />
  </div>
);

const FlowDiagram = () => {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      {/* TIER 1 — Agents (light) */}
      <section>
        <TierLabel>Agents</TierLabel>
        <div className="flex flex-wrap justify-center gap-2">
          {AGENTS.map((label) => (
            <div
              key={label}
              className="rounded-md border border-slate-200 bg-gray-50 px-4 py-2 text-center"
            >
              <span className="font-mono text-sm font-medium text-gray-800">
                {label}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-base font-medium text-primary">
          $0.02 per query, every query
        </p>
      </section>

      {/* TIER 2 — read pipeline arrow */}
      <InlineConnector direction="down" caption="READ — many times per day" />

      {/* TIER 3 — Context substrate (visually dominant) */}
      <section>
        <TierLabel>Context Substrate — the product</TierLabel>
        <Card className="border-2 border-primary bg-blue-50/40 p-3 shadow-md">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Property MD — clean single card */}
            <div className="rounded-md border border-primary/30 bg-background px-4 py-4 text-center">
              <span className="font-mono text-sm font-semibold text-primary">
                context.property.LIE-001.md
              </span>
            </div>

            {/* Unit MD — stacked card visualization for the ×52 reality */}
            <div className="relative pr-3 pb-3">
              <div
                className="relative rounded-md border border-primary/30 bg-background px-4 py-4 text-center"
                style={{
                  boxShadow:
                    "4px 4px 0 0 #dbeafe, 8px 8px 0 0 #bfdbfe",
                }}
              >
                <span className="font-mono text-sm font-semibold text-primary">
                  context.unit.EH-019.md
                </span>
                <span className="absolute -top-2 right-2 rounded-full border border-primary/40 bg-background px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  + 51 more
                </span>
              </div>
            </div>
          </div>

          {/* Aggregation Bus capsule with curved accent return arrow */}
          <div className="relative mt-3 flex justify-center">
            <svg
              viewBox="0 0 600 50"
              className="absolute inset-x-0 top-0 mx-auto h-10 w-full max-w-2xl"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="agg-arrow-2"
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
                d="M 540 8 C 540 38, 60 38, 60 8"
                fill="none"
                stroke="hsl(221 83% 53%)"
                strokeWidth={1.5}
                markerEnd="url(#agg-arrow-2)"
              />
            </svg>
            <div className="relative z-10 mt-7 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background px-3 py-1">
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
      <InlineConnector direction="up" caption="BUILD — once per source change" />

      {/* TIER 5 — Engine (light) */}
      <section>
        <TierLabel>Engine</TierLabel>
        <div className="mx-auto max-w-2xl rounded-md bg-gray-50 border border-slate-200 p-3 text-center">
          <p className="font-mono text-base font-semibold text-gray-800">
            Per-Source Extractors → Fact Store → MD Builders
          </p>
          <p className="mt-0.5 text-sm text-gray-500">LLM only on new sources</p>
        </div>
      </section>

      {/* Source → Engine arrows (short, light) */}
      <div className="grid grid-cols-5 gap-2">
        {SOURCES.map((s) => (
          <div key={s} className="flex justify-center">
            <SourceArrowUp />
          </div>
        ))}
      </div>

      {/* TIER 6 — Sources */}
      <section>
        <TierLabel>Sources</TierLabel>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {SOURCES.map((s) => (
            <div
              key={s}
              className="rounded-md border border-slate-200 bg-gray-50 px-3 py-1.5 text-center"
            >
              <span className="font-mono text-sm text-gray-800">{s}</span>
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
];

const Architecture = () => {
  useEffect(() => {
    document.title = "context.md Demo — Architecture";
  }, []);

  return (
    <section className="space-y-10">
      <PageHeader
        eyebrow="Architecture"
        title="How context.md stays cheap as it scales"
      />

      <Card className="border-border bg-card p-4 lg:p-6">
        <FlowDiagram />
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    </section>
  );
};

export default Architecture;