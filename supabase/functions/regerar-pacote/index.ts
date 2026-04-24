// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { promocao_id } = await req.json();
    if (!promocao_id) return json({ error: "promocao_id obrigatório" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Limpa campos criativos
    const { error: errClear } = await supabase.from("promocoes").update({
      score: 0,
      score_justificativa: null,
      titulo_video: null,
      hooks: null,
      narration_script: null,
      art_prompt: null,
      video_prompt: null,
      text_overlays: null,
      cta_text: null,
      hashtags: null,
      audio_narracao_url: null,
      higgsfield_request_id: null,
      prompt_variations: null,
      status: "pendente",
    }).eq("id", promocao_id);

    if (errClear) {
      return json({ error: "Falha ao limpar pacote", detail: errClear.message }, 500);
    }

    await supabase.from("logs_agentes").insert({
      agente: "orquestrador",
      tipo: "info",
      mensagem: `🔁 Regeneração disparada para promo ${promocao_id}`,
      payload: { promocao_id, acao: "regenerar" },
    });

    // Reinvoca o orquestrador
    const { data, error } = await supabase.functions.invoke("agente-orquestrador", {
      body: { promocao_id },
    });

    if (error) {
      return json({ error: "Orquestrador falhou", detail: error.message }, 502);
    }

    return json({ ok: true, regenerado: true, ...data });
  } catch (err: any) {
    console.error("Erro regerar-pacote:", err);
    return json({ error: err?.message ?? "Erro interno" }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
