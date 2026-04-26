import { useEffect, useRef, useState } from "react";
import { RotateCcw, Inbox, FileText, Check, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";

type Phase = "idle" | "running" | "done";

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

type LineKind = "context" | "remove" | "add";

type MdLine = {
  key: string;
  lineNo: number;
  text: string;
  kind: LineKind;
  // visual stage for animated rows
  flash?: boolean; // brief yellow flash before settling
};

const BASE_LINES: MdLine[] = [
  { key: "l132", lineNo: 132, text: "lease_id: LEASE-MIE-025", kind: "context" },
  { key: "l133", lineNo: 133, text: "lease:", kind: "context" },
  { key: "l134", lineNo: 134, text: "  start_date: 2022-07-13", kind: "context" },
  { key: "l135", lineNo: 135, text: "  term_type: unbefristet", kind: "context" },
  { key: "l136", lineNo: 136, text: "  rent_components:", kind: "context" },
  { key: "l137", lineNo: 137, text: "    - kaltmiete: €1.031", kind: "context" },
  { key: "l138", lineNo: 138, text: "    - betriebskosten_vorauszahlung: €175", kind: "context" },
  { key: "l139", lineNo: 139, text: "    - total_warmmiete: €1.206", kind: "context" },
  { key: "l140", lineNo: 140, text: "  kaution: { amount: €3.093, form: tbd, paid_status: paid }", kind: "context" },
  { key: "l141", lineNo: 141, text: "  cancellation_status: none", kind: "context" },
  { key: "l142", lineNo: 142, text: "  special_agreements: []", kind: "context" },
  { key: "l143", lineNo: 143, text: "  subletting: { permitted: case-by-case, current_status: denied }", kind: "context" },
];

const Row = ({ line, animateIn }: { line: MdLine; animateIn: boolean }) => {
  const sign = line.kind === "remove" ? "-" : line.kind === "add" ? "+" : " ";
  const signColor =
    line.kind === "remove"
      ? "text-red-600"
      : line.kind === "add"
        ? "text-emerald-600"
        : "text-transparent";

  const bg = line.flash
    ? "bg-yellow-100"
    : line.kind === "remove"
      ? "bg-red-50"
      : line.kind === "add"
        ? "bg-emerald-50"
        : "bg-transparent";

  const textColor =
    line.kind === "remove"
      ? "text-red-900 line-through decoration-red-400"
      : line.kind === "add"
        ? "text-emerald-900"
        : "text-gray-700";

  return (
    <div
      className={cn(
        "grid grid-cols-[2.5rem_1rem_1fr] items-start transition-all duration-500 ease-out",
        bg,
        animateIn && "animate-fade-in",
      )}
    >
      <span className="select-none px-2 py-0.5 text-right text-[11px] tabular-nums text-gray-400">
        {line.lineNo}
      </span>
      <span className={cn("select-none py-0.5 text-sm font-bold leading-relaxed", signColor)}>
        {sign}
      </span>
      <span className={cn("py-0.5 pr-3 text-sm leading-relaxed", textColor)}>
        {line.text}
      </span>
    </div>
  );
};

const StatusPill = ({ extracted, pulse }: { extracted: boolean; pulse: boolean }) =>
  extracted ? (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 transition-all duration-300",
        pulse && "scale-105",
      )}
    >
      <Check className="h-3 w-3" />
      Extracted
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-gray-500 transition-all duration-300">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Pending
    </span>
  );

const Diff = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [visibleLogs, setVisibleLogs] = useState(0);
  const [lines, setLines] = useState<MdLine[]>(BASE_LINES);
  const [extracted, setExtracted] = useState(false);
  const [pillPulse, setPillPulse] = useState(false);
  const [animatedKeys, setAnimatedKeys] = useState<Set<string>>(new Set());
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    document.title = "context.md Demo — Surgical Update";
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const schedule = (ms: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  const handleProcess = () => {
    clearTimers();
    setPhase("running");
    setVisibleLogs(0);
    setLines(BASE_LINES);
    setExtracted(false);
    setPillPulse(false);
    setAnimatedKeys(new Set());

    // Engine log lines
    schedule(200, () => setVisibleLogs(1));
    schedule(700, () => setVisibleLogs(2));
    schedule(1200, () => setVisibleLogs(3));

    // t=1600ms — flash line 141 yellow
    schedule(1600, () => {
      setLines((prev) =>
        prev.map((l) => (l.key === "l141" ? { ...l, flash: true } : l)),
      );
    });

    // t=1900ms — turn line 141 into a "remove" + insert 3 new "add" lines below it
    schedule(1900, () => {
      setLines((prev) => {
        const out: MdLine[] = [];
        for (const l of prev) {
          if (l.key === "l141") {
            out.push({ ...l, flash: false, kind: "remove" });
            out.push({
              key: "n141",
              lineNo: 141,
              text: "  cancellation_status: by_tenant [^k1]",
              kind: "add",
            });
            out.push({
              key: "n142",
              lineNo: 142,
              text: "    - notice_date: 2025-07-16",
              kind: "add",
            });
            out.push({
              key: "n143",
              lineNo: 143,
              text: "    - move_out_date: TBD (Übergabe in Verhandlung)",
              kind: "add",
            });
            out.push({
              key: "n144",
              lineNo: 144,
              text: "    - remaining_rents: TBD",
              kind: "add",
            });
          } else if (l.key === "l142") {
            out.push({ ...l, lineNo: 145 });
          } else if (l.key === "l143") {
            out.push({ ...l, lineNo: 146 });
          } else {
            out.push(l);
          }
        }
        return out;
      });
      setAnimatedKeys(new Set(["n141", "n142", "n143", "n144"]));
    });

    // t=2600ms — pill becomes Extracted with pulse
    schedule(2600, () => {
      setExtracted(true);
      setPillPulse(true);
    });
    schedule(3000, () => {
      setPillPulse(false);
      setPhase("done");
    });
  };

  const handleReset = () => {
    clearTimers();
    setPhase("idle");
    setVisibleLogs(0);
    setLines(BASE_LINES);
    setExtracted(false);
    setPillPulse(false);
    setAnimatedKeys(new Set());
  };

  const isRunning = phase === "running";
  const logVisible = phase !== "idle";

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
            <StatusPill extracted={extracted} pulse={pillPulse} />
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
          <div className="flex flex-1 flex-col">
            <div className="min-h-[360px] font-mono">
              {lines.map((line) => (
                <Row
                  key={line.key}
                  line={line}
                  animateIn={animatedKeys.has(line.key)}
                />
              ))}
            </div>
            <p className="mt-auto border-t border-border bg-secondary/30 px-4 py-2 text-xs italic text-gray-500">
              …300 more lines unchanged…
            </p>
          </div>
        </Card>
      </div>

      {/* CENTER — controls + engine log */}
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleProcess}
            disabled={isRunning}
            size="lg"
            className={cn(
              "h-11 px-6 text-base",
              isRunning && "cursor-not-allowed opacity-50",
            )}
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

        {/* Engine log — reserved space, fades in */}
        <div
          className={cn(
            "w-full max-w-2xl rounded-lg border border-gray-200 bg-gray-50 p-4 transition-opacity duration-300",
            logVisible ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-gray-500">
            engine log
          </p>
          <div className="space-y-1 font-mono text-xs leading-relaxed">
            {LOG_LINES.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "text-gray-700 transition-all duration-300 ease-out",
                  i < visibleLogs
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-2 opacity-0",
                )}
              >
                <span className="text-gray-400">→</span> {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Diff;
