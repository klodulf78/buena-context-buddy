
-- Properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  context_md TEXT,
  last_run_at TIMESTAMPTZ
);

-- Context updates
CREATE TABLE public.context_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  source_filename TEXT,
  diff_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Queries
CREATE TABLE public.queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  latency_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;

-- No-auth demo: allow public read on properties and context_updates; queries inserted via edge function (service role bypasses RLS).
CREATE POLICY "Public can read properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Public can read context_updates" ON public.context_updates FOR SELECT USING (true);
CREATE POLICY "Public can read queries" ON public.queries FOR SELECT USING (true);

-- Private storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Seed one demo property
INSERT INTO public.properties (name, address, context_md, last_run_at)
VALUES (
  'Demo Property',
  'Sample Address',
  E'# Property Context — Demo\n\n_Populated by backend_',
  now()
);
