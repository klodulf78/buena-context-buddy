-- Schema for the property-context-resolver demo.
-- Source of truth: ../property-context-resolver/final_execution.md "Supabase schema".
-- The Python engine (extractor/sb.py) and both Edge Functions look up by the
-- text identifier `property_id` (e.g. "LIE-001"), not by uuid — so every FK
-- below references properties.property_id, not properties.id.

-- properties --------------------------------------------------------------

CREATE TABLE public.properties (
  id           UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id  TEXT NOT NULL UNIQUE,                  -- e.g. 'LIE-001'
  name         TEXT,
  address      TEXT,
  context_md   TEXT,
  last_run_at  TIMESTAMPTZ
);

-- context_updates ---------------------------------------------------------

CREATE TABLE public.context_updates (
  id              UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id     TEXT NOT NULL REFERENCES public.properties(property_id) ON DELETE CASCADE,
  source_filename TEXT,
  diff_summary    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- queries -----------------------------------------------------------------

CREATE TABLE public.queries (
  id            UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id   TEXT NOT NULL REFERENCES public.properties(property_id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  answer        TEXT,
  mode          TEXT,                                  -- 'context_md' | 'raw_data'
  latency_ms    INT,
  input_tokens  INT,
  output_tokens INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS — no-auth demo: public read on all three tables. Writes go through
-- service-role (engine + Edge Functions), which bypasses RLS.

ALTER TABLE public.properties      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read properties"      ON public.properties      FOR SELECT USING (true);
CREATE POLICY "Public can read context_updates" ON public.context_updates FOR SELECT USING (true);
CREATE POLICY "Public can read queries"         ON public.queries         FOR SELECT USING (true);

-- Storage bucket consumed by `answer_question_raw` (the benchmark function).
-- Bundle is uploaded by `scripts/upload_raw_bundle.py` to:
--   raw-uploads/<property_id>/raw_bundle.txt
INSERT INTO storage.buckets (id, name, public)
VALUES ('raw-uploads', 'raw-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Seed: LIE-001 row so the engine can upsert into it on first run and Lovable
-- has something to render before `python run.py raw/` ever fires.
INSERT INTO public.properties (property_id, name, address, context_md, last_run_at)
VALUES (
  'LIE-001',
  'WEG Immanuelkirchstraße 26',
  'Immanuelkirchstraße 26, 10405 Berlin',
  E'# Property Context — LIE-001\n\n_Populated by engine on first run._',
  now()
)
ON CONFLICT (property_id) DO NOTHING;
