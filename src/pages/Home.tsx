import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CitationMarkdown, type CitationMap } from "@/components/CitationMarkdown";
import { PageHeader } from "@/components/PageHeader";

type RunStatus = "idle" | "running" | "done";

type AgentSpec = {
  id: "md" | "raw";
  title: string;
  subtitle: string;
  finalCost: number;
  finalLatency: number;
  durationMs: number; // wall-clock duration for the visual run
  // cost waypoints visible to the audience (only used for the slow runner)
  costWaypoints?: number[];
};

const AGENTS: AgentSpec[] = [
  {
    id: "md",
    title: "MD-Agent",
    subtitle: "reads context.md only",
    finalCost: 0.02,
    finalLatency: 1.0,
    durationMs: 4000,
  },
  {
    id: "raw",
    title: "Raw-Claude",
    subtitle: "reads all raw files",
    finalCost: 0.52,
    finalLatency: 18.5,
    durationMs: 25000,
    costWaypoints: [0.1, 0.25, 0.4],
  },
];

const DEFAULT_QUESTION =
  "Is tenant Trub in arrears? Summarize the situation and cite sources.";

const MD_CITATIONS: CitationMap = {
  bank: "bank/kontoauszug_2024_2025.csv (23 monthly Mietzahlungen €1.206)",
  mahn: "briefe/2024-11/20241116_mahnung_LTR-0043.pdf.txt (Stage 1, false-positive)",
  "em-mm": "emails/2025-*/Mietminderung Ankuendigung*.eml (4 mails + 1 reply)",
  "em-ws": "emails/2025-08/Wasserschaden Bad*.eml (3 + 1 reply)",
  "em-sm": "emails/2025-*/Schimmel im Schlafzimmer*.eml (3 + 2 replies)",
};

const MD_ANSWER = `**Tenant:** Frau Jasmin Trub (\`MIE-025\`), unit \`EH-019\` (WE 19, HAUS-14)

**Status:** No active dunning. Lease cancelled by tenant on 2025-07-16; move-out date in negotiation.

**Payment history:** 23 consecutive monthly payments €1.206 (Kaltmiete €1.031 + NK €175) since 2024-01, latest 2025-12-01 [^bank].

**Historical Mahnverfahren:** 1× Stage-1 letter sent 2024-11-16 for Miete 11/2024 [^mahn] — but tenant had paid on 2024-11-01 [^bank] → likely false-positive. Resolved.

**Active concerns (HITL):**

- Mietminderung announced (unilateral) — pending agreement [^em-mm]
- 2 critical open tickets: Wasserschaden + Schimmel — both with Sanitär Schulze [^em-ws][^em-sm]

**Sources:** [^bank], [^mahn], [^em-mm], [^em-ws], [^em-sm] — all in \`context.unit.EH-019.md §5\`
`;

const RAW_ANSWER = `Tenant Jasmin Trub at unit EH-019 (WE 19, building HAUS-14) is currently not in active dunning. The lease was cancelled by the tenant on July 16, 2025, with the move-out date still in negotiation.

Looking at the bank statement: 23 consecutive monthly rent payments of €1,206 — that's a Kaltmiete of €1,031 plus Nebenkosten of €175 — have been received from January 2024 through December 1, 2025.

There is one historical dunning event worth flagging: a Stage-1 reminder letter was sent on November 16, 2024 referencing a missed November 2024 rent. However, looking at the bank record, a payment was actually received on November 1, 2024. This was apparently a false-positive that has since been resolved.

Two active concerns: the tenant has announced a unilateral Mietminderung that is still pending agreement, and there are two critical open repair tickets — water damage in the bathroom and mold in the bedroom — both currently assigned to Sanitär Schulze.
`;

type AgentState = {
  status: RunStatus;
  cost: number;
  latency: number;
  answer: string;
  showAnswer: boolean;
};

const initialState: AgentState = {
  status: "idle",
  cost: 0,
  latency: 0,
  answer: "",
  showAnswer: false,
};

/**
 * Easing curve that lingers around the cost waypoints so the audience can
 * read them, then accelerates past. For agents without waypoints we fall back
 * to a smooth ease-out.
 */
function progressForTime(elapsed: number, duration: number, waypoints?: number[]) {
  const t = Math.min(1, elapsed / duration);
  if (!waypoints || waypoints.length === 0) {
    // ease-out cubic
    return 1 - Math.pow(1 - t, 3);
  }
  // Linear progression — keeps numbers steadily ticking so $0.10/$0.25/$0.40
  // each pass through visibly.
  return t;
}

const Counter = ({
  value,
  prefix,
  suffix,
  digits,
  status,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  digits: number;
  status: RunStatus;
}) => {
  const colorClass =
    status === "idle"
      ? "text-gray-400"
      : status === "running"
        ? "text-gray-900"
        : "text-primary";
  return (
    <div className={cn("font-mono text-3xl font-bold tabular-nums transition-colors", colorClass)}>
      {prefix}
      {value.toFixed(digits)}
      {suffix}
    </div>
  );
};

const StatusDot = ({ status }: { status: RunStatus }) => {
  if (status === "idle") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="h-2 w-2 rounded-full bg-gray-400" />
        <span>Idle</span>
      </div>
    );
  }
  if (status === "running") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span>Running…</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      <span>Done</span>
    </div>
  );
};

const AgentPane = ({
  agent,
  state,
  onReset,
}: {
  agent: AgentSpec;
  state: AgentState;
  onReset: () => void;
}) => {
  return (
    <Card className="relative flex flex-col gap-6 border-border bg-card p-6">
      <button
        type="button"
        onClick={onReset}
        className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-secondary hover:text-foreground"
        aria-label={`Reset ${agent.title}`}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset
      </button>

      <header>
        <h3 className="text-xl font-semibold text-foreground">{agent.title}</h3>
        <p className="mt-0.5 text-xs text-gray-500">{agent.subtitle}</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-md border border-border bg-background p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500">Cost</p>
          <div className="mt-1">
            <Counter value={state.cost} prefix="$" digits={2} status={state.status} />
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500">Latency</p>
          <div className="mt-1">
            <Counter value={state.latency} suffix="s" digits={1} status={state.status} />
          </div>
        </div>
      </div>

      <StatusDot status={state.status} />

       <div className="min-h-[420px] rounded-md border border-border bg-background p-7">
        {state.status !== "done" || !state.answer ? (
          <p className="font-mono text-sm text-gray-400">
            {state.status === "running" ? "Awaiting response…" : "No answer yet."}
          </p>
        ) : (
          <div
            className={cn(
              "prose prose-lg max-w-none text-lg leading-[1.75] text-foreground transition-opacity duration-700",
              "prose-p:my-3 prose-li:my-1.5 prose-headings:text-foreground prose-strong:text-foreground prose-strong:font-semibold",
              state.showAnswer ? "opacity-100" : "opacity-0",
            )}
          >
            {agent.id === "md" ? (
              <CitationMarkdown citations={MD_CITATIONS}>{state.answer}</CitationMarkdown>
            ) : (
              <ReactMarkdown>{state.answer}</ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

const Home = () => {
  const [question, setQuestion] = useState(DEFAULT_QUESTION);
  const [states, setStates] = useState<Record<AgentSpec["id"], AgentState>>({
    md: { ...initialState },
    raw: { ...initialState },
  });
  const intervalsRef = useRef<number[]>([]);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    document.title = "context.md Demo — MD-Agent vs Raw-Claude";
  }, []);

  const stopAnimation = () => {
    intervalsRef.current.forEach((id) => window.clearInterval(id));
    intervalsRef.current = [];
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => () => stopAnimation(), []);

  const handleReset = (id?: AgentSpec["id"]) => {
    stopAnimation();
    setStates((prev) => {
      if (id) return { ...prev, [id]: { ...initialState } };
      return { md: { ...initialState }, raw: { ...initialState } };
    });
  };

  const handleRun = () => {
    stopAnimation();
    setStates({
      md: { ...initialState, status: "running" },
      raw: { ...initialState, status: "running" },
    });

    const startedAt = performance.now();

    // One interval per agent — ticks every 50ms, ramps cost & latency
    // linearly to the final values, then locks and shows the answer.
    AGENTS.forEach((agent) => {
      const intervalId = window.setInterval(() => {
        const elapsed = performance.now() - startedAt;
        if (elapsed >= agent.durationMs) {
          window.clearInterval(intervalId);
          intervalsRef.current = intervalsRef.current.filter((id) => id !== intervalId);
          setStates((prev) => ({
            ...prev,
            [agent.id]: {
              ...prev[agent.id],
              status: "done",
              cost: agent.finalCost,
              latency: agent.finalLatency,
              answer: finalAnswers[agent.id],
            },
          }));
          // Fade in answer shortly after reaching Done
          const fadeTimer = window.setTimeout(() => {
            setStates((prev) => ({
              ...prev,
              [agent.id]: { ...prev[agent.id], showAnswer: true },
            }));
          }, 80);
          timeoutsRef.current.push(fadeTimer);
          return;
        }
        const p = elapsed / agent.durationMs;
        setStates((prev) => ({
          ...prev,
          [agent.id]: {
            ...prev[agent.id],
            status: "running",
            cost: agent.finalCost * p,
            latency: agent.finalLatency * p,
          },
        }));
      }, 50);
      intervalsRef.current.push(intervalId);
    });
  };

  const bothDone = states.md.status === "done" && states.raw.status === "done";
  const anyRunning = states.md.status === "running" || states.raw.status === "running";

  const finalAnswers: Record<AgentSpec["id"], string> = {
    md: MD_ANSWER,
    raw: RAW_ANSWER,
  };

  return (
    <section className="space-y-10">
      <PageHeader
        eyebrow="Benchmark"
        title="Same question. Two approaches. One winner."
      />

      <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="h-11 text-lg"
          aria-label="Question"
        />
        <Button
          onClick={handleRun}
          disabled={anyRunning}
          size="lg"
          className="h-11 shrink-0 px-6 text-base"
        >
          {anyRunning ? "Running…" : "Run benchmark"}
        </Button>
      </div>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
        {AGENTS.map((agent) => (
          <AgentPane
            key={agent.id}
            agent={agent}
            state={states[agent.id]}
            onReset={() => handleReset(agent.id)}
          />
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <p
          className={cn(
            "text-sm italic text-gray-600 transition-opacity duration-500",
            bothDone ? "opacity-100" : "opacity-0",
          )}
        >
          Same answer. ~25× slower. ~26× more expensive. Without citations.
        </p>
        <button
          type="button"
          onClick={() => handleReset()}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset both
        </button>
      </div>
    </section>
  );
};

export default Home;