import { useEffect } from "react";
import { Card } from "@/components/ui/card";

const SOURCES = ["emails/", "bank/", "briefe/", "rechnungen/", "stammdaten/"];

/**
 * Inline SVG flow diagram. Coordinates are designed for a 1100x620 viewBox so
 * the layout stays precise regardless of container size (preserveAspectRatio).
 */
const FlowDiagram = () => {
  // Layout constants for the source-row boxes
  const sourceY = 90;
  const sourceH = 56;
  const sourceW = 150;
  const sourceGap = 28;
  const totalSourcesW = SOURCES.length * sourceW + (SOURCES.length - 1) * sourceGap;
  const sourcesStartX = (1100 - totalSourcesW) / 2;

  // Engine box — wider so the long subtitle line fits comfortably
  const engineW = 560;
  const engineH = 130;
  const engineX = (1100 - engineW) / 2; // centered
  const engineY = 240;

  // Output row — pushed further down and spread apart so the curved
  // "Aggregation Bus" arrow + label has clear vertical space and doesn't
  // overlap the tiles or arrows.
  const outY = 540;
  const outH = 70;
  const outW = 320;
  const propX = 70;
  const unitX = 1100 - 70 - outW; // 710

  return (
    <svg
      viewBox="0 0 1100 700"
      className="w-full"
      role="img"
      aria-label="context.md architecture diagram"
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(220 9% 46%)" />
        </marker>
        <marker
          id="arrow-accent"
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

      {/* Sources row */}
      <text
        x="550"
        y="50"
        textAnchor="middle"
        className="fill-gray-500"
        style={{ font: "500 13px 'JetBrains Mono', monospace", letterSpacing: "0.14em" }}
      >
        SOURCES
      </text>
      {SOURCES.map((label, i) => {
        const x = sourcesStartX + i * (sourceW + sourceGap);
        return (
          <g key={label}>
            <rect
              x={x}
              y={sourceY}
              width={sourceW}
              height={sourceH}
              rx={10}
              className="fill-secondary stroke-border"
              strokeWidth={1}
            />
            <text
              x={x + sourceW / 2}
              y={sourceY + sourceH / 2 + 5}
              textAnchor="middle"
              className="fill-foreground"
              style={{ font: "500 15px 'JetBrains Mono', monospace" }}
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Arrows from each source down toward the engine */}
      {SOURCES.map((_, i) => {
        const sx = sourcesStartX + i * (sourceW + sourceGap) + sourceW / 2;
        const sy = sourceY + sourceH;
        const tx = engineX + engineW / 2;
        const ty = engineY;
        // Curved path: drop straight then converge
        const midY = (sy + ty) / 2;
        return (
          <path
            key={`src-arrow-${i}`}
            d={`M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty - 6}`}
            fill="none"
            stroke="hsl(220 9% 46%)"
            strokeWidth={1.25}
            markerEnd="url(#arrow)"
            opacity={0.55}
          />
        );
      })}

      {/* Engine box */}
      <rect
        x={engineX}
        y={engineY}
        width={engineW}
        height={engineH}
        rx={14}
        className="fill-primary"
      />
      <text
        x={engineX + engineW / 2}
        y={engineY + 28}
        textAnchor="middle"
        className="fill-primary-foreground"
        style={{ font: "600 13px 'JetBrains Mono', monospace", letterSpacing: "0.12em" }}
      >
        ENGINE
      </text>
      <text
        x={engineX + engineW / 2}
        y={engineY + 58}
        textAnchor="middle"
        className="fill-primary-foreground"
        style={{ font: "500 17px 'JetBrains Mono', monospace" }}
      >
        Per-Source Extractors → Fact Store → MD Builders
      </text>
      <text
        x={engineX + engineW / 2}
        y={engineY + 88}
        textAnchor="middle"
        className="fill-primary-foreground/75"
        style={{ font: "400 13px Inter, sans-serif" }}
      >
        LLM only on new sources
      </text>

      {/* Arrow engine → outputs (split into two) */}
      <path
        d={`M ${engineX + engineW / 2} ${engineY + engineH} C ${engineX + engineW / 2} ${engineY + engineH + 50}, ${propX + outW / 2} ${outY - 50}, ${propX + outW / 2} ${outY - 6}`}
        fill="none"
        stroke="hsl(220 9% 46%)"
        strokeWidth={1.25}
        markerEnd="url(#arrow)"
        opacity={0.65}
      />
      <path
        d={`M ${engineX + engineW / 2} ${engineY + engineH} C ${engineX + engineW / 2} ${engineY + engineH + 50}, ${unitX + outW / 2} ${outY - 50}, ${unitX + outW / 2} ${outY - 6}`}
        fill="none"
        stroke="hsl(220 9% 46%)"
        strokeWidth={1.25}
        markerEnd="url(#arrow)"
        opacity={0.65}
      />

      {/* Output: property MD */}
      <rect
        x={propX}
        y={outY}
        width={outW}
        height={outH}
        rx={12}
        className="fill-primary/10 stroke-primary/30"
        strokeWidth={1.25}
      />
      <text
        x={propX + outW / 2}
        y={outY + outH / 2 + 5}
        textAnchor="middle"
        className="fill-primary"
        style={{ font: "600 16px 'JetBrains Mono', monospace" }}
      >
        context.property.LIE-001.md
      </text>

      {/* Output: unit MD */}
      <rect
        x={unitX}
        y={outY}
        width={outW}
        height={outH}
        rx={12}
        className="fill-primary/10 stroke-primary/30"
        strokeWidth={1.25}
      />
      <text
        x={unitX + outW / 2}
        y={outY + outH / 2 + 5}
        textAnchor="middle"
        className="fill-primary"
        style={{ font: "600 16px 'JetBrains Mono', monospace" }}
      >
        context.unit.EH-019.md  ×52
      </text>

      {/* Aggregation bus: curved arrow from unit MD up to property MD */}
      {(() => {
        const startX = unitX + 30;
        const startY = outY;
        const endX = propX + outW - 30;
        const endY = outY;
        // The label sits as its own card; the arc sits BELOW the label
        // so both are fully visible and don't overlap.
        const labelW = 320;
        const labelH = 56;
        const labelCx = 1100 / 2;
        const labelTop = 395; // engine ends at 370 → small gap
        const labelBottom = labelTop + labelH; // 451
        // Arc apex sits a bit below the label bottom.
        const apexY = labelBottom + 30; // 481
        const ctrlY = apexY - 50;
        return (
          <>
            {/* Curved arrow first so the label card paints on top if they
                ever brush each other. */}
            <path
              d={`M ${startX} ${startY} C ${startX - 50} ${ctrlY}, ${endX + 50} ${ctrlY}, ${endX} ${endY - 4}`}
              fill="none"
              stroke="hsl(221 83% 53%)"
              strokeWidth={1.5}
              markerEnd="url(#arrow-accent)"
            />
            {/* Label card — sits above the arc so they never overlap. */}
            <rect
              x={labelCx - labelW / 2}
              y={labelTop}
              width={labelW}
              height={labelH}
              rx={10}
              className="fill-primary/10 stroke-primary/30"
              strokeWidth={1}
            />
            <text
              x={labelCx}
              y={labelTop + 22}
              textAnchor="middle"
              className="fill-primary"
              style={{ font: "600 15px Inter, sans-serif" }}
            >
              Aggregation Bus
            </text>
            <text
              x={labelCx}
              y={labelTop + 42}
              textAnchor="middle"
              className="fill-gray-500"
              style={{ font: "400 13px Inter, sans-serif" }}
            >
              deterministic events · ~80% no LLM
            </text>
          </>
        );
      })()}
    </svg>
  );
};

const STATS = [
  { value: "$0.05", label: "Per property per day" },
  { value: "$50", label: "At 1,000 properties per day" },
  { value: "40–100×", label: "Cheaper than naive re-extract" },
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {STATS.map((s) => (
          <Card
            key={s.label}
            className="flex flex-col gap-3 border-border bg-card p-8 text-center"
          >
            <div className="font-mono text-5xl font-bold tabular-nums text-primary">
              {s.value}
            </div>
            <div className="text-sm uppercase tracking-wide text-gray-500">{s.label}</div>
          </Card>
        ))}
      </div>

      <p className="text-base italic text-gray-600">
        Cost stays flat as the platform grows. The MD file is the product.
      </p>
    </section>
  );
};

export default Architecture;