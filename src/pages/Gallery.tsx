import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TileStatus = "live" | "soon";

type Tile = {
  emoji: string;
  title: string;
  description: string;
  status: TileStatus;
  to?: string;
};

const TILES: Tile[] = [
  {
    emoji: "📊",
    title: "Payment & Dunning",
    description: "Detect arrears, draft Mahnungen, and cite every payment.",
    status: "live",
    to: "/",
  },
  {
    emoji: "🔧",
    title: "Repair Triage",
    description: "Route maintenance tickets to the right Handwerker, track SLA.",
    status: "soon",
  },
  {
    emoji: "🧾",
    title: "NK-Abrechnung Q&A",
    description: "Answer tenant questions about Nebenkostenabrechnungen with sources.",
    status: "soon",
  },
  {
    emoji: "🏠",
    title: "Tenant Onboarding",
    description: "Generate Mietverträge, collect docs, schedule move-in.",
    status: "soon",
  },
  {
    emoji: "🚪",
    title: "Move-out Coordinator",
    description: "Übergabe-Termine, deposit settlement, final invoices.",
    status: "soon",
  },
  {
    emoji: "📅",
    title: "Maintenance Calendar",
    description: "Recurring inspections, Wartungsverträge, due-date alerts.",
    status: "soon",
  },
  {
    emoji: "📨",
    title: "Owner Reporting",
    description: "Monthly owner statements drafted from the MD substrate.",
    status: "soon",
  },
  {
    emoji: "⚖️",
    title: "ETV Beschluss-Prep",
    description: "Prepare Eigentümerversammlung resolutions with full context.",
    status: "soon",
  },
  {
    emoji: "🏢",
    title: "Vacancy Listing",
    description: "Auto-generate listings from unit MD, sync to portals.",
    status: "soon",
  },
  {
    emoji: "💰",
    title: "Insurance Claim Drafting",
    description: "Compile incident timelines and supporting evidence.",
    status: "soon",
  },
  {
    emoji: "📑",
    title: "Mietspiegel Benchmarking",
    description: "Compare current Kaltmiete against local Mietspiegel bands.",
    status: "soon",
  },
  {
    emoji: "🛡️",
    title: "Compliance Watch",
    description: "Track Rauchmelder, Heizung, and statutory deadlines.",
    status: "soon",
  },
];

const StatusBadge = ({ status }: { status: TileStatus }) => {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-gray-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Coming soon
    </span>
  );
};

const TileBody = ({ tile }: { tile: Tile }) => (
  <>
    <div className="flex items-start justify-between">
      <div className="text-3xl leading-none">{tile.emoji}</div>
      {tile.status === "live" && (
        <ArrowUpRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </div>
    <div className="mt-5 space-y-1.5">
      <h3 className="text-lg font-semibold text-foreground">{tile.title}</h3>
      <p className="text-sm text-gray-600">{tile.description}</p>
    </div>
    <div className="mt-6 flex justify-end">
      <StatusBadge status={tile.status} />
    </div>
  </>
);

const TileCard = ({ tile }: { tile: Tile }) => {
  const baseClasses =
    "group flex h-full flex-col border-border bg-card p-6 transition-all";

  if (tile.status === "live" && tile.to) {
    return (
      <Link to={tile.to} className="block h-full focus:outline-none">
        <Card
          className={cn(
            baseClasses,
            "cursor-pointer hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40",
          )}
        >
          <TileBody tile={tile} />
        </Card>
      </Link>
    );
  }

  return (
    <Card
      className={cn(
        baseClasses,
        "cursor-not-allowed opacity-80 hover:bg-secondary/40",
      )}
      aria-disabled="true"
    >
      <TileBody tile={tile} />
    </Card>
  );
};

const Gallery = () => {
  useEffect(() => {
    document.title = "context.md Demo — Use-Case Gallery";
  }, []);

  const liveCount = TILES.filter((t) => t.status === "live").length;
  const soonCount = TILES.length - liveCount;

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Use-Case Gallery
        </h1>
        <p className="text-sm text-gray-500">
          Every workflow runs on the same context.md substrate.
        </p>
      </header>

      <p className="font-mono text-sm text-gray-500">
        {liveCount} of {TILES.length} live · {soonCount} in roadmap
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((tile) => (
          <TileCard key={tile.title} tile={tile} />
        ))}
      </div>
    </section>
  );
};

export default Gallery;