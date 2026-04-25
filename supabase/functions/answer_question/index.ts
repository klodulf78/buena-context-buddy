// supabase/functions/answer_question/index.ts
//
// Replaces the Lovable scaffold stub. Answers a property-management question
// using ONLY the rendered context.md for that property, then logs the Q&A to
// `queries` with mode=context_md so the Hour 7-8 benchmark slide can compare
// it against `answer_question_raw`.
//
// Required env (Supabase project secrets):
//   SUPABASE_URL              auto-injected
//   SUPABASE_SERVICE_ROLE_KEY service-role key — never ship to UI
//   ANTHROPIC_API_KEY         Anthropic console key

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.30.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ANTHROPIC_MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You answer property-management questions using ONLY the
provided context.md. The file uses <!-- auto:section --> blocks with inline
citations of the form [(source)](url). When you cite, copy those exact source
links into your answer so the user can click through to the underlying PDF /
email / bank row.

Rules:
- Never invent facts. If a fact is not in context.md, reply "Not in current
  context.md" and name the section it would belong in (e.g. "Node:
  Maintenance"). Do not extrapolate from related facts.
- The "Status" line in "Node: Legal / Disputes" is the canonical answer for
  any "ist X im Verzug" question. Cite it verbatim.
- When you mention a number (Mahnstufe, offener Betrag, Verzugszinsen, Monate
  im Verzug, Kaltmiete, etc.), include the matching [(source)](url) link from
  context.md on the same line.
- Answer in the same language the question was asked in (de or en). Match
  the user's tone — terse questions get terse answers.
- Keep answers under 6 sentences unless the user asks for detail.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { property_id, question } = await req.json();

    if (!property_id || !question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "property_id and question are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const { data: row, error: rowErr } = await supabase
      .from("properties")
      .select("context_md")
      .eq("property_id", property_id)
      .maybeSingle();

    if (rowErr) {
      return new Response(JSON.stringify({ error: `Supabase read failed: ${rowErr.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!row || !row.context_md) {
      return new Response(JSON.stringify({ error: `No context_md found for property_id=${property_id}` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const t0 = Date.now();
    const msg = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      // Cache the system prompt — static across calls, every request after
      // the first hits the cheaper cache-read rate.
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
          content: `# context.md\n\n${row.context_md}\n\n# Question\n\n${question}`,
        },
      ],
    });
    const latency_ms = Date.now() - t0;

    const answer = msg.content
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("")
      .trim();

    const { error: insertErr } = await supabase.from("queries").insert({
      property_id,
      question,
      answer,
      mode: "context_md",
      latency_ms,
      input_tokens: msg.usage.input_tokens,
      output_tokens: msg.usage.output_tokens,
    });

    if (insertErr) {
      console.error("Insert query failed:", insertErr);
    }

    return new Response(
      JSON.stringify({
        answer,
        latency_ms,
        input_tokens: msg.usage.input_tokens,
        output_tokens: msg.usage.output_tokens,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    console.error("answer_question error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
