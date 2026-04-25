-- Drop existing tables (clean rewrite)
DROP TABLE IF EXISTS public.queries CASCADE;
DROP TABLE IF EXISTS public.context_updates CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;

-- properties
CREATE TABLE public.properties (
  id           UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id  TEXT NOT NULL UNIQUE,
  name         TEXT,
  address      TEXT,
  context_md   TEXT,
  last_run_at  TIMESTAMPTZ
);

-- context_updates
CREATE TABLE public.context_updates (
  id              UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id     TEXT NOT NULL REFERENCES public.properties(property_id) ON DELETE CASCADE,
  source_filename TEXT,
  diff_summary    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- queries
CREATE TABLE public.queries (
  id            UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id   TEXT NOT NULL REFERENCES public.properties(property_id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  answer        TEXT,
  mode          TEXT,
  latency_ms    INT,
  input_tokens  INT,
  output_tokens INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.properties      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read properties"      ON public.properties      FOR SELECT USING (true);
CREATE POLICY "Public can read context_updates" ON public.context_updates FOR SELECT USING (true);
CREATE POLICY "Public can read queries"         ON public.queries         FOR SELECT USING (true);

-- Storage bucket for raw corpus bundles
INSERT INTO storage.buckets (id, name, public)
VALUES ('raw-uploads', 'raw-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Seed
INSERT INTO public.properties (property_id, name, address, context_md, last_run_at)
VALUES (
  'LIE-001',
  'WEG Immanuelkirchstraße 26',
  'Immanuelkirchstraße 26, 10405 Berlin',
  E'# Property Context — LIE-001\n\n_Populated by engine on first run._',
  now()
)
ON CONFLICT (property_id) DO NOTHING;