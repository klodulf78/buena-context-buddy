// supabase/functions/answer_question_raw/index.ts
//
// Benchmark companion to `answer_question`. Same prompt, same model, but the
// LLM gets the *raw* corpus instead of the engine-rendered context.md.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.30.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const RAW_BUCKET = "raw-uploads";
const RAW_BUNDLE_KEY = (property_id: string) => `${property_id}/raw_bundle.txt`;

const SYSTEM_PROMPT = `You answer property-management questions using ONLY the
provided raw corpus (stammdaten JSON, bank CSV rows, scanned letters,
invoices, emails). Never invent facts. If the answer is not in the corpus,
reply "Not in raw corpus" and name the source you'd expect it in.

When you cite a number, point to the source file and a row/line/section so a
human can verify (e.g. "kontoauszug_2024_2025.csv row TX-01552",
"briefe/.../20250717_mahnung_LTR-0132.pdf"). Answer in the same language as
the question (de or en). Keep answers under 6 sentences unless asked for
detail.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { property_id, question } = await req.json();

    if (!property_id || !question || typeof question !== "string") {
      return new Response(
        JSON.stringify({ error: "property_id and question are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const { data: blob, error: downloadErr } = await supabase.storage
      .from(RAW_BUCKET)
      .download(RAW_BUNDLE_KEY(property_id));

    if (downloadErr || !blob) {
      const msg = downloadErr?.message ?? "bundle missing";
      return new Response(
        JSON.stringify({
          error: `Raw bundle not found at ${RAW_BUCKET}/${RAW_BUNDLE_KEY(property_id)}: ${msg}.`,
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const bundle = await blob.text();

    const t0 = Date.now();
    const msg = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        } as any,
      ],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `# Raw corpus for ${property_id}\n\n${bundle}`,
              cache_control: { type: "ephemeral" },
            } as any,
            {
              type: "text",
              text: `# Question\n\n${question}`,
            },
          ],
        },
      ],
    });
    const latency_ms = Date.now() - t0;

    const answer = msg.content
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("")
      .trim();

    const usage = msg.usage as {
      input_tokens: number;
      output_tokens: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };

    const { error: insertErr } = await supabase.from("queries").insert({
      property_id,
      question,
      answer,
      mode: "raw_data",
      latency_ms,
      input_tokens:
        usage.input_tokens +
        (usage.cache_creation_input_tokens ?? 0) +
        (usage.cache_read_input_tokens ?? 0),
      output_tokens: usage.output_tokens,
    });

    if (insertErr) {
      console.error("Insert query failed:", insertErr);
    }

    return new Response(
      JSON.stringify({
        answer,
        latency_ms,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
        cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
        bundle_chars: bundle.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("answer_question_raw error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});