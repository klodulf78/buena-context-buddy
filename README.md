# buena-context-buddy

A **demo UI** for the `context.md` substrate — a pre-built Markdown layer that lets property-management AI agents answer questions about a unit or property without re-reading every raw source file each time.

This repo is the front-end story. The pipeline that actually produces and updates the `context.*.md` files lives in a separate backend:

> **Backend:** [`zengzengzenghuy/property-context-resolver`](https://github.com/zengzengzenghuy/property-context-resolver)

The UI here is currently driven by hard-coded fixtures (the MD answer, the diff, the engine log lines). It mirrors what the resolver does in production — the wiring between this UI and the resolver is the next piece of work.

## The two halves

```
   ┌────────────────────────────┐        ┌────────────────────────────────┐
   │ property-context-resolver  │        │       buena-context-buddy      │
   │ (Python pipeline, backend) │        │     (this repo, React/Vite)    │
   │                            │        │                                │
   │  raw/ → events → facts →   │ ─────▶ │  reads context.*.md            │
   │  PropertyMerger /          │        │  shows answers + citations     │
   │  UnitMerger → context.md   │        │  visualizes diffs + arch       │
   └────────────────────────────┘        └────────────────────────────────┘
```

### What the backend does (assumed by this UI)

From the resolver's pipeline — `Sources → Extraction → Fact Store → Aggregation → Rendering → LLM Summary`:

1. **SourceLoader / connectors** ingest stammdaten, emails, briefe, rechnungen, bank statements.
2. **IdentityResolver** deduplicates entities (exact match on email/IBAN/phone, fuzzy name match at 0.86).
3. **NoiseFilter + FactExtractor** drop auto-acks, attach identity, emit facts with `source_ref`.
4. **FactStore** (append-only JSONL) buckets `(entity_id, key)` and resolves conflicts at a 0.7 confidence floor.
5. **DunningReconciler** reconciles tenant ledgers against lease obligations (anchored on §286 / §288 BGB).
6. **PropertyAggregator** rolls unit-level state up into property-scoped facts.
7. **PropertyMerger / UnitMerger** surgically rewrite **only** `<!-- auto:NAME -->` blocks in `context.property.*.md` and `context.unit.*.md`. Human notes and prose outside auto-blocks survive every run.
8. **Summarizer** (Anthropic) produces short German triage summaries inside `<!-- auto:*.summary -->`.

Result: a set of `context.property.LIE-XXX.md` and `context.unit.EH-XXX.md` files where every line is auditable to the byte via `source_ref`. The agent layer reads these, never the raw sources.

### What this UI assumes

The frontend treats the resolver's outputs as the substrate it queries against. The mental model behind each page:

- **`/` — Benchmark.** Two agents answer the same tenant question. **MD-Agent** loads one `context.unit.EH-019.md` (the resolver's output); **Raw-Claude** would scan all raw files. Cost / latency / citations are the things the substrate buys you. *Today this page is animated from fixtures; live wiring would call a Supabase edge function (see `supabase/functions/answer_question`) that loads the MD file and prompts an LLM.*
- **`/diff` — Surgical update.** A new source file (a Kündigung PDF) lands in `incremental/`. The resolver re-runs and patches one line — `cancellation_status: none` becomes `cancellation_status: by_tenant [^k1]` with three new sub-fields under it — inside the `<!-- auto:lease -->` block of `context.unit.EH-019.md`. Everything outside the auto-block (Human Notes, free-form prose) is untouched. The page visualizes that backend behavior.
- **`/arch` — Architecture.** The tier diagram (Sources → Engine → Context Substrate → Agents) and the aggregation bus correspond directly to the resolver's pipeline stages above.
- **`/gallery` — Use-case gallery.** Each tile is an agent that, in production, would read the same MD substrate. Only Payment & Dunning is wired today.

## Wiring this UI to the resolver

The intended flow, once connected:

1. The resolver runs on a schedule or on `incremental/` change → writes `context.*.md` files to a known location (object store, repo, or DB).
2. A Supabase edge function (e.g. `answer_question`) loads the relevant `context.unit.*.md`, hands it to an LLM with the user's question, and returns answer + citation map.
3. The frontend `Home` page swaps the fixture (`MD_ANSWER`, `MD_CITATIONS` in `src/pages/Home.tsx`) for the live response.
4. The `Diff` page subscribes to merger events from the resolver to render real surgical patches instead of the scripted demo.

## Stack

- Vite + React 18 + TypeScript
- Tailwind + shadcn/ui (Radix primitives)
- TanStack Query, React Router, react-markdown
- Supabase edge functions (`answer_question`, `answer_question_raw`) + SQL migrations
- Vitest + Testing Library

## Develop

```bash
bun install        # or npm install
bun run dev        # vite dev server
bun run build      # production build
bun run lint
bun run test       # vitest run
```

## Environment

Copy the values you need into a local `.env` (gitignored). The Supabase client is wired up under `src/integrations/`; the two edge functions in `supabase/functions/` are the seam where the resolver's MD outputs will eventually be read at query time.

## Layout

```
src/
  pages/         Home, Diff, Architecture, Gallery, NotFound
  components/    SiteLayout, PageHeader, CitationMarkdown, NavLink, ui/*
  integrations/  Supabase client
  hooks/  lib/  test/
supabase/
  functions/     answer_question, answer_question_raw
  migrations/    SQL schema
```

## See also

- Backend pipeline: <https://github.com/zengzengzenghuy/property-context-resolver>
