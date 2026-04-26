import { useEffect, useRef, useState } from "react";
import { RotateCcw, Inbox, FileText, Check, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";

type Phase = "idle" | "logs" | "diff" | "done";

const SOURCE_LETTER = `Sehr geehrte Damen und Herren,

hiermit kündige ich den Mietvertrag für die Wohnung WE 19 (Immanuelkirchstraße 26, 10405 Berlin) fristgerecht zum nächstmöglichen Termin.

Bitte bestätigen Sie mir den Kündigungstermin schriftlich. Einen Übergabe-Termin können wir gerne vereinbaren.

Mit freundlichen Grüßen

Jasmin Trub

WE 19, MIE-025

Datum: 2025-07-16`;

const LOG_LINES = [
  "detected change in incremental/",
  "routing to context.unit.EH-019.md → §2",
  "patched 1 line, +3 added · human-edits preserved",
];

type DiffLine =
  | { kind: "context"; lineNo: number; text: string }
  | { kind: "remove"; lineNo: number; text: string }
  | { kind: "add"; lineNo: number; text: string };

const DIFF_LINES: DiffLine[] = [
  { kind: "context", lineNo: 132, text: "lease:" },
  { kind: "context", lineNo: 133, text: "  start_date: 2024-01-01" },
  { kind: "context", lineNo: 134, text: "  contract_type: unbefristet" },
  { kind: "context", lineNo: 135, text: "  rent_components:" },
  { kind: "context", lineNo: 136, text: "    - kaltmiete: €1.031" },
  { kind: "context", lineNo: 137, text: "    - betriebskosten_vorauszahlung: €175" },
  { kind: "context", lineNo: 138, text: "    - total_warmmiete: €1.206" },
  { kind: "context", lineNo: 139, text: "  deposit: €3.093 (3× Kaltmiete)" },
  { kind: "remove", lineNo: 140, text: "  cancellation_status: none" },
  { kind: "add", lineNo: 140, text: "  cancellation_status: by_tenant [^k1]" },
  { kind: "add", lineNo: 141, text: "    - notice_date: 2025-07-16" },
  { kind: "add", lineNo: 142, text: "    - move_out_date: TBD (Übergabe in Verhandlung)" },
  { kind: "add", lineNo: 143, text: "    - remaining_rents: TBD" },
  { kind: "context", lineNo: 144, text: "  special_agreements: []" },
  { kind: "context", lineNo: 145, text: "  subletting: { permitted: case-by-case }" },
];

const DiffRow = ({
  line,
  highlight,
}: {
  line: DiffLine;
  highlight: boolean;
}) => {
  const isChange = line.kind !== "context";
  const showHighlight = highlight && isChange;

  const bg = !showHighlight
    ? "bg-transparent"
    : line.kind === "remove"
      ? "bg-red-50"
      : "bg-emerald-50";

  const sign = line.kind === "remove" ? "-" : line.kind === "add" ? "+" : " ";
  const signColor =
    line.kind === "remove"
      ? "text-red-600"
      : line.kind === "add"
        ? "text-emerald-600"
        : "text-gray-300";
  const textColor =
    !showHighlight
      ? "text-gray-500"
      : line.kind === "remove"
        ? "text-red-900 line-through decoration-red-400"
        : line.kind === "add"
          ? "text-emerald-900"
          : "text-gray-700";

  return (
    <div
      className={cn(
        "grid grid-cols-[2.5rem_1rem_1fr] items-start transition-colors duration-500",
        bg,
        showHighlight && line.kind === "add" && "animate-fade-in",
      )}
    >
      <span className="select-none px-2 py-0.5 text-right text-[10px] tabular-nums text-gray-400">
        {line.lineNo}
      </span>
      <span className={cn("select-none py-0.5 text-xs font-bold", signColor)}>
        {sign}
      </span>
      <span className={cn("py-0.5 pr-3 text-xs leading-relaxed", textColor)}>
        {line.text}
      </span>
    </div>
  );
};

const StatusPill = ({ extracted }: { extracted: boolean }) =>
  extracted ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
      <Check className="h-3 w-3" />
      Extracted
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-gray-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Pending
    </span>
  );

const Diff = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [visibleLogs, setVisibleLogs] = useState(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    document.title = "context.md Demo — Surgical Update";
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const handleProcess = () => {
    clearTimers();
    setPhase("logs");
    setVisibleLogs(0);

    LOG_LINES.forEach((_, i) => {
      const t = window.setTimeout(
        () => setVisibleLogs((n) => Math.max(n, i + 1)),
        200 + i * 280,
      );
      timersRef.current.push(t);
    });

    timersRef.current.push(
      window.setTimeout(() => setPhase("diff"), 1200),
      window.setTimeout(() => setPhase("done"), 2400),
    );
  };

  const handleReset = () => {
    clearTimers();
    setPhase("idle");
    setVisibleLogs(0);
  };

  const extracted = phase === "done";
  const showDiff = phase === "diff" || phase === "done";
  const isRunning = phase === "logs" || phase === "diff";

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Surgical Update"
        title="A new file dropped — only one line changed."
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT — Incoming source file */}
        <Card className="flex flex-col overflow-hidden border-border bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/60 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Inbox className="h-3.5 w-3.5 shrink-0 text-gray-500" />
              <span className="truncate font-mono text-sm text-foreground">
                incremental/20250716_kuendigung_LTR-0231.pdf
              </span>
            </div>
            <StatusPill extracted={extracted} />
          </div>
          <div className="whitespace-pre-wrap p-4 font-serif text-sm leading-relaxed text-gray-700">
            {SOURCE_LETTER}
          </div>
        </Card>

        {/* RIGHT — context.unit MD file */}
        <Card className="flex flex-col overflow-hidden border-border bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/60 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-3.5 w-3.5 shrink-0 text-gray-500" />
              <span className="truncate font-mono text-sm text-foreground">
                context.unit.EH-019.md
              </span>
            </div>
            <span className="font-mono text-[11px] text-gray-500">§2 lease</span>
          </div>
          <div className="font-mono">
            {DIFF_LINES.map((line, i) => (
              <DiffRow key={i} line={line} highlight={showDiff} />
            ))}
          </div>
          <p className="border-t border-border bg-secondary/30 px-4 py-2 text-xs italic text-gray-500">
            …300 more lines unchanged…
          </p>
        </Card>
      </div>

      {/* CENTER — controls + engine log */}
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleProcess}
            disabled={isRunning}
            size="lg"
            className="h-11 px-6 text-base"
          >
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? "Processing…" : "Process incoming file"}
          </Button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs text-gray-600 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        {phase !== "idle" && (
          <Card className="w-full max-w-2xl border-border bg-card p-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-gray-500">
              engine log
            </p>
            <div className="space-y-1 font-mono text-xs leading-relaxed">
              {LOG_LINES.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-gray-600",
                    i < visibleLogs ? "animate-fade-in" : "invisible opacity-0",
                  )}
                >
                  <span className="text-gray-400">→</span> {line}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </section>
  );
};

export default Diff;

type DiffLine =
  | { kind: "context"; lineNo: number; text: string }
  | { kind: "remove"; lineNo: number; text: string }
  | { kind: "add"; lineNo: number; text: string }
  | { kind: "hunk"; text?: string };

/**
 * Unified diff for context.unit.EH-019.md §2.
 * Line numbers reflect the file as the user provided them in the spec.
 */
const DIFF_LINES: DiffLine[] = [
  { kind: "context", lineNo: 117, text: "household_size: 2 (Annahme — keine Bewohnerzahl in Stammdaten)" },
  { kind: "context", lineNo: 118, text: "rent_components:" },
  { kind: "context", lineNo: 119, text: "    - kaltmiete: €1.031" },
  { kind: "context", lineNo: 120, text: "    - betriebskosten_vorauszahlung: €175" },
  { kind: "context", lineNo: 121, text: "    - total_warmmiete: €1.206" },
  { kind: "hunk" },
  { kind: "remove", lineNo: 140, text: "cancellation_status: none" },
  { kind: "add", lineNo: 140, text: "cancellation_status: by_tenant [^k1]" },
  { kind: "add", lineNo: 141, text: "    - notice_date: 2025-07-16" },
  { kind: "add", lineNo: 142, text: "    - move_out_date: TBD (Übergabe-Termin in Verhandlung)" },
  { kind: "add", lineNo: 143, text: "    - remaining_rents: TBD" },
  { kind: "hunk" },
  { kind: "context", lineNo: 158, text: "  - special_agreements: []" },
  { kind: "context", lineNo: 159, text: "  - subletting: { permitted: case-by-case, current_status: denied }" },
];

const LOG_LINES = [
  "2026-04-25T18:42:01 → detected change in incremental/",
  "2026-04-25T18:42:02 → routing to context.unit.EH-019.md → §2 lease.cancellation_status",
  "2026-04-25T18:42:03 → patched 1 line, +3 lines added · human-edits preserved · 0 conflicts",
];

const DiffRow = ({ line }: { line: DiffLine }) => {
  if (line.kind === "hunk") {
    return (
      <div className="grid grid-cols-[3.5rem_1.25rem_1fr] items-center text-gray-400">
        <span className="select-none px-2 text-right text-xs">⋯</span>
        <span />
        <span className="text-xs">⋯</span>
      </div>
    );
  }

  const bg =
    line.kind === "remove"
      ? "bg-red-50"
      : line.kind === "add"
        ? "bg-emerald-50"
        : "bg-transparent";
  const gutterBg =
    line.kind === "remove"
      ? "bg-red-100/70 text-red-700"
      : line.kind === "add"
        ? "bg-emerald-100/70 text-emerald-700"
        : "bg-secondary/60 text-gray-500";
  const sign = line.kind === "remove" ? "-" : line.kind === "add" ? "+" : " ";
  const signColor =
    line.kind === "remove"
      ? "text-red-600"
      : line.kind === "add"
        ? "text-emerald-600"
        : "text-gray-400";
  const textColor =
    line.kind === "remove"
      ? "text-red-900"
      : line.kind === "add"
        ? "text-emerald-900"
        : "text-foreground";

  return (
    <div className={cn("grid grid-cols-[3.5rem_1.25rem_1fr] items-start", bg)}>
      <span
        className={cn(
          "select-none border-r border-border px-2 py-1 text-right text-xs font-medium tabular-nums",
          gutterBg,
        )}
      >
        {line.lineNo}
      </span>
      <span className={cn("select-none py-1 pl-2 text-base font-bold", signColor)}>
        {sign}
      </span>
      <span className={cn("py-1 pr-3 text-base leading-relaxed", textColor)}>{line.text}</span>
    </div>
  );
};

const Diff = () => {
  const [runId, setRunId] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState(0);
  const [pulseBadge, setPulseBadge] = useState(false);

  useEffect(() => {
    document.title = "context.md Demo — Surgical Update";
  }, []);

  // Re-run animations whenever runId changes (mount + Replay).
  useEffect(() => {
    setVisibleLogs(0);
    setPulseBadge(true);
    const pulseOff = window.setTimeout(() => setPulseBadge(false), 1500);
    // Stagger log lines across ~2s.
    const timers = LOG_LINES.map((_, i) =>
      window.setTimeout(() => setVisibleLogs((n) => Math.max(n, i + 1)), 350 + i * 600),
    );
    return () => {
      window.clearTimeout(pulseOff);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [runId]);

  const replay = () => setRunId((n) => n + 1);

  return (
    <section className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          eyebrow="Surgical Update"
          title="A new file dropped — only one line changed."
        />
        <button
          type="button"
          onClick={replay}
          className="mt-2 inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Replay
        </button>
      </div>

      {/* Watched-folder bar */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/60 px-4 py-3">
        <div className="flex items-center gap-2 font-mono text-base text-foreground">
          <FolderOpen className="h-4 w-4 text-gray-500" />
          incremental/
        </div>
        <div
          key={runId}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-sm font-medium text-primary",
            pulseBadge && "animate-pulse-once",
          )}
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          New file: 20250716_kuendigung_LTR-0231.pdf
        </div>
      </div>

      {/* Engine log */}
      <Card className="border-border bg-card p-5">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-gray-500">
          engine log
        </p>
        <div className="space-y-1.5 font-mono text-base leading-relaxed">
          {LOG_LINES.map((line, i) => (
            <div
              key={`${runId}-${i}`}
              className={cn(
                "text-foreground",
                i < visibleLogs ? "animate-fade-in-up" : "invisible opacity-0",
              )}
            >
              <span className="text-gray-400">$</span> <span>{line}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Diff card */}
      <Card className="overflow-hidden border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-4 py-2.5">
          <span className="font-mono text-sm text-foreground">context.unit.EH-019.md</span>
          <span className="font-mono text-xs text-gray-500">§2 lease.cancellation_status</span>
        </div>
        <div className="font-mono text-sm">
          {DIFF_LINES.map((line, i) => (
            <DiffRow key={i} line={line} />
          ))}
        </div>
      </Card>

      {/* Footnote callout */}
      <Card className="border-primary/30 bg-primary/5 p-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-primary/80">
          new provenance pointer
        </p>
        <p className="mt-1.5 font-mono text-base leading-relaxed text-foreground">
          <span className="rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-sm font-medium text-primary">
            [^k1]
          </span>{" "}
          emails/2025-07/Kuendigung Mietvertrag_*.eml (received 2025-07-16, classified as
          legal-retention)
        </p>
      </Card>

      <p className="text-sm italic text-gray-500">
        180 other lines unchanged. Human-added comments preserved.
      </p>
    </section>
  );
};

export default Diff;