import { useEffect, useState } from "react";
import { RotateCcw, FolderOpen, FilePlus2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Surgical Update
          </h1>
          <p className="text-sm text-gray-500">
            A new file was dropped into the watch folder. The engine updated only the affected line.
          </p>
        </div>
        <button
          type="button"
          onClick={replay}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Replay
        </button>
      </header>

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