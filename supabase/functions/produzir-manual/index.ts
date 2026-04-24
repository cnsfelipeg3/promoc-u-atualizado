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

    const { data: promo, error: errFetch } = await supabase
      .from("promocoes").select("*").eq("id", promocao_id).maybeSingle();

    if (errFetch || !promo) return json({ error: "Promo não encontrada" }, 404);

    if (!promo.narration_script || !promo.video_prompt) {
      return json({
        error: "Pacote criativo incompleto",
        faltando: {
          narration_script: !promo.narration_script,
          video_prompt: !promo.video_prompt,
        },
      }, 400);
    }

    // Marca como aprovada e em produção
    await supabase.from("promocoes").update({ status: "aprovada" }).eq("id", promocao_id);

    await supabase.from("logs_agentes").insert({
      agente: "orquestrador",
      tipo: "info",
      mensagem: `▶️ Produção manual disparada para ${promo.origem}→${promo.destino}`,
      payload: { promocao_id },
    });

    // Background tasks
    // @ts-ignore
    EdgeRuntime.waitUntil(dispararProducao(supabase, promocao_id, promo));

    return json({ ok: true, promocao_id, message: "Produção iniciada" });
  } catch (err: any) {
    console.error("Erro produzir-manual:", err);
    return json({ error: err?.message ?? "Erro interno" }, 500);
  }
});

async function dispararProducao(supabase: any, promocaoId: string, promo: any) {
  const tasks: Promise<any>[] = [];

  if (Deno.env.get("ELEVENLABS_API_KEY") && promo.narration_script && !promo.audio_narracao_url) {
    tasks.push(gerarNarracao(supabase, promocaoId, promo.narration_script));
  }

  tasks.push(
    supabase.functions.invoke("agente-videomaker", { body: { promocao_id: promocaoId } })
      .then(({ error }: any) => {
        if (error) return log(supabase, "produzir-manual", "error", "Falha videomaker", { error: error.message });
        return log(supabase, "produzir-manual", "success", "agente-videomaker disparado");
      })
      .catch((e: any) => log(supabase, "produzir-manual", "error", "Exceção videomaker", { erro: e?.message }))
  );

  await Promise.allSettled(tasks);
}

async function gerarNarracao(supabase: any, promocaoId: string, script: string) {
  try {
    const { data: configRow } = await supabase
      .from("config_agentes").select("config").eq("agente", "orquestrador").maybeSingle();
    const voiceId = (configRow?.config as any)?.elevenlabs_voice ?? "21m00Tcm4TlvDq8ikWAM";

    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": Deno.env.get("ELEVENLABS_API_KEY")!, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.6, use_speaker_boost: true },
      }),
    });

    if (!resp.ok) {
      await log(supabase, "elevenlabs", "error", `Narração falhou: ${resp.status}`);
      return;
    }

    const audioBuf = new Uint8Array(await resp.arrayBuffer());
    const filename = `narracao_${promocaoId}_${Date.now()}.mp3`;

    const { error: upErr } = await supabase.storage.from("audios")
      .upload(filename, audioBuf, { contentType: "audio/mpeg", upsert: true });
    if (upErr) { await log(supabase, "elevenlabs", "error", "Upload falhou", { upErr: upErr.message }); return; }

    const { data: urlData } = supabase.storage.from("audios").getPublicUrl(filename);
    await supabase.from("promocoes").update({ audio_narracao_url: urlData.publicUrl }).eq("id", promocaoId);
    await log(supabase, "elevenlabs", "success", `Narração gerada: ${urlData.publicUrl}`);
  } catch (err: any) {
    await log(supabase, "elevenlabs", "error", "Exceção narração", { erro: err?.message });
  }
}

async function log(supabase: any, agente: string, tipo: string, mensagem: string, payload: any = {}) {
  try { await supabase.from("logs_agentes").insert({ agente, tipo, mensagem, payload }); }
  catch (e) { console.error("Log falhou:", e); }
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
