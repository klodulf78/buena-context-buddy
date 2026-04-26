import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { ChevronDown, ChevronUp, Play, Pause } from "lucide-react";

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

          {/* Aggregation Bus — clean U-bracket connecting the two MD cards */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <svg
              width="100%"
              height="32"
              viewBox="0 0 400 32"
              preserveAspectRatio="none"
              className="max-w-2xl"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="agg-arrowhead"
                  markerWidth="8"
                  markerHeight="8"
                  refX="4"
                  refY="4"
                  orient="auto"
                >
                  <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" />
                </marker>
              </defs>
              <path
                d="M 380 4 L 380 20 L 20 20 L 20 4"
                stroke="#2563eb"
                strokeWidth="1.5"
                fill="none"
                markerEnd="url(#agg-arrowhead)"
                strokeLinejoin="round"
              />
            </svg>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs">
              <span className="font-semibold text-blue-600">Aggregation Bus</span>
              <span className="text-gray-500">· deterministic events · ~80% no LLM</span>
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

  const [animOn, setAnimOn] = useState(false);

  return (
    <section className="space-y-10">
      <PageHeader
        eyebrow="Architecture"
        title="How context.md stays cheap as it scales"
      />

      <Card className="border-border bg-card p-4 lg:p-6 relative">
        {/* Additive overlay: animation toggle. Positioned outside the diagram. */}
        <button
          type="button"
          onClick={() => setAnimOn((v) => !v)}
          className="absolute right-4 top-4 z-10 text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 bg-white"
          aria-pressed={animOn}
        >
          {animOn ? (
            <Pause className="w-3.5 h-3.5" strokeWidth={1.75} />
          ) : (
            <Play className="w-3.5 h-3.5" strokeWidth={1.75} />
          )}
          {animOn ? "Stop animation" : "Play animation"}
        </button>

        {/* Additive overlay: keyframes that activate only when .arch-anim-on
            wraps the diagram. Targets are matched via structural selectors so
            no existing element's className is modified. */}
        <style>{`
          @keyframes arch-ring-soft {
            0%   { box-shadow: 0 0 0 0 hsl(221 83% 53% / 0); }
            30%  { box-shadow: 0 0 0 4px hsl(221 83% 53% / 0.55); }
            100% { box-shadow: 0 0 0 0 hsl(221 83% 53% / 0); }
          }
          @keyframes arch-ring-strong {
            0%   { box-shadow: 0 0 0 0 hsl(221 83% 53% / 0); }
            30%  { box-shadow: 0 0 0 6px hsl(221 83% 53% / 0.6); }
            100% { box-shadow: 0 0 0 0 hsl(221 83% 53% / 0); }
          }
          /* Agent ring: pulse occupies first ~8% of a 2400ms cycle (~200ms),
             then stays transparent for the rest. Per-agent delays produce the
             round-robin effect. */
          @keyframes arch-ring-agent {
            0%   { box-shadow: 0 0 0 0 hsl(221 83% 53% / 0); }
            4%   { box-shadow: 0 0 0 3px hsl(221 83% 53% / 0.7); }
            8%   { box-shadow: 0 0 0 0 hsl(221 83% 53% / 0); }
            100% { box-shadow: 0 0 0 0 hsl(221 83% 53% / 0); }
          }
          /* Annotation flash: matches the same 2400ms cycle, dimming briefly
             whenever an agent rings (4 quick dips per cycle). */
          @keyframes arch-flash-anno {
            0%, 24%, 26%, 49%, 51%, 74%, 76%, 99% { opacity: 1; }
            25%, 50%, 75%, 100% { opacity: 0.5; }
          }

          /* BUILD pulse — runs once: source → engine → substrate.
             Total cycle 3s, then we let the agent loop continue indefinitely. */

          /* First source pill (emails/) */
          .arch-anim-on > div > section:last-child > div > div:first-child {
            animation: arch-ring-soft 600ms ease-out 0ms 1;
          }

          /* Engine box */
          .arch-anim-on > div > section:nth-last-child(3) > div {
            animation: arch-ring-soft 600ms ease-out 900ms 1;
          }

          /* Substrate Card (Tier 3) */
          .arch-anim-on > div > section:nth-child(3) > div {
            animation: arch-ring-strong 700ms ease-out 1800ms 1;
          }

          /* READ pulses — each agent rings in turn on a shared 2400ms loop,
             starting after the build sequence (delay 2700ms). */
          .arch-anim-on > div > section:first-child > div > div:nth-child(1) {
            animation: arch-ring-agent 2400ms linear 2700ms infinite;
          }
          .arch-anim-on > div > section:first-child > div > div:nth-child(2) {
            animation: arch-ring-agent 2400ms linear 3300ms infinite;
          }
          .arch-anim-on > div > section:first-child > div > div:nth-child(3) {
            animation: arch-ring-agent 2400ms linear 3900ms infinite;
          }
          .arch-anim-on > div > section:first-child > div > div:nth-child(4) {
            animation: arch-ring-agent 2400ms linear 4500ms infinite;
          }

          /* "$0.02 per query…" annotation flashes on every agent ring */
          .arch-anim-on > div > section:first-child > p {
            animation: arch-flash-anno 2400ms linear 2700ms infinite;
          }
        `}</style>

        {animOn ? (
          <div className="arch-anim-on">
            <FlowDiagram />
          </div>
        ) : (
          <FlowDiagram />
        )}
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