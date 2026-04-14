import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const hfApiKey = Deno.env.get("HF_API_KEY")!;
const hfApiSecret = Deno.env.get("HF_API_SECRET")!;
const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

async function logAgente(mensagem: string, tipo = "info", payload = {}) {
  console.log(`[videomaker][${tipo}] ${mensagem}`, JSON.stringify(payload));
  await supabase.from("logs_agentes").insert({ agente: "videomaker", mensagem, tipo, payload });
}

const hfHeaders = { "hf-api-key": hfApiKey, "hf-secret": hfApiSecret, "Content-Type": "application/json" };
const hfPollHeaders = { "hf-api-key": hfApiKey, "hf-secret": hfApiSecret };

// ── UPLOAD HELPER ─────────────────────────────────────────────
async function uploadToStorage(url: string, path: string, contentType: string): Promise<string> {
  const res = await fetch(url);
  const buffer = new Uint8Array(await res.arrayBuffer());
  const { error } = await supabase.storage.from("videos").upload(path, buffer, { contentType });
  if (error) {
    // Try creating bucket if it doesn't exist
    await supabase.storage.createBucket("videos", { public: true });
    const { error: retry } = await supabase.storage.from("videos").upload(path, buffer, { contentType });
    if (retry) throw retry;
  }
  const { data } = supabase.storage.from("videos").getPublicUrl(path);
  return data.publicUrl;
}

// ── POLLING HELPER ────────────────────────────────────────────
async function pollStatus(statusUrl: string, label: string, maxAttempts: number): Promise<Record<string, unknown> | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const res = await fetch(statusUrl, { headers: hfPollHeaders });
    const data = JSON.parse(await res.text());
    const status = data.status || data.state;
    if (i % 6 === 0) await logAgente(`Polling ${label} tentativa ${i + 1}/${maxAttempts}`, "info");
    if (status === "completed") return data;
    if (status === "failed") { await logAgente(`${label} falhou`, "error"); return null; }
  }
  await logAgente(`Timeout: ${label}`, "error");
  return null;
}

// ── GENERATE ART ──────────────────────────────────────────────
async function generateArt(prompt: string, label: string): Promise<string | null> {
  await logAgente(`Gerando arte [${label}]`, "info");
  try {
    const res = await fetch("https://platform.higgsfield.ai/bytedance/seedream/v4/text-to-image", {
      method: "POST", headers: hfHeaders,
      body: JSON.stringify({ prompt, aspect_ratio: "9:16", resolution: "2K" }),
    });
    if (!res.ok) throw new Error(`Art API ${res.status}: ${await res.text()}`);
    const data = JSON.parse(await res.text());
    const statusUrl = data.status_url || data.request_url;
    if (!statusUrl) throw new Error("No status_url for art");

    const result = await pollStatus(statusUrl, `arte-${label}`, 60);
    if (!result) return null;
    const url = result.images?.[0]?.url || (result.output as Record<string, unknown>)?.image_url || (result.result as Record<string, unknown>)?.url;
    await logAgente(`Arte [${label}] gerada: ${url}`, "success");
    return url as string;
  } catch (err) {
    await logAgente(`Erro arte [${label}]: ${err instanceof Error ? err.message : String(err)}`, "error");
    return null;
  }
}

// ── GENERATE NARRATION ────────────────────────────────────────
async function generateNarration(script: string, label: string): Promise<string | null> {
  if (!elevenLabsKey) { await logAgente("ELEVENLABS_API_KEY não configurada", "error"); return null; }
  await logAgente(`Gerando narração [${label}]: ${script.substring(0, 60)}...`, "info");
  try {
    const voiceId = "EXAVITQu4vr4xnSDxMaL";
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": elevenLabsKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.45, similarity_boost: 0.85, style: 0.7, use_speaker_boost: true },
      }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
    const buffer = new Uint8Array(await res.arrayBuffer());
    const fileName = `narrations/${Date.now()}_${label}.mp3`;
    const { error } = await supabase.storage.from("videos").upload(fileName, buffer, { contentType: "audio/mpeg" });
    if (error) {
      await supabase.storage.createBucket("videos", { public: true });
      const { error: retry } = await supabase.storage.from("videos").upload(fileName, buffer, { contentType: "audio/mpeg" });
      if (retry) throw retry;
    }
    const { data } = supabase.storage.from("videos").getPublicUrl(fileName);
    await logAgente(`Narração [${label}] pronta: ${data.publicUrl}`, "success");
    return data.publicUrl;
  } catch (err) {
    await logAgente(`Erro narração [${label}]: ${err instanceof Error ? err.message : String(err)}`, "error");
    return null;
  }
}

// ── GENERATE VIDEO ────────────────────────────────────────────
async function generateVideo(arteUrl: string, prompt: string, duration: number, label: string): Promise<string | null> {
  await logAgente(`Gerando vídeo [${label}] (${duration}s)`, "info");
  try {
    const res = await fetch("https://platform.higgsfield.ai/kling-video/v2.1/pro/image-to-video", {
      method: "POST", headers: hfHeaders,
      body: JSON.stringify({ image_url: arteUrl, prompt, duration }),
    });
    if (!res.ok) throw new Error(`Video API ${res.status}: ${await res.text()}`);
    const data = JSON.parse(await res.text());
    const statusUrl = data.status_url || data.request_url;
    if (!statusUrl) { await logAgente(`Sem status_url para vídeo [${label}]`, "warn"); return null; }

    const result = await pollStatus(statusUrl, `video-${label}`, 120);
    if (!result) return null;
    const videoUrl = (result.videos as Array<{url: string}>)?.[0]?.url || (result.video as Record<string, unknown>)?.url ||
      (result.images as Array<{url: string}>)?.[0]?.url || (result.output as Record<string, unknown>)?.video_url ||
      (result.output as Record<string, unknown>)?.url || (result.result as Record<string, unknown>)?.url ||
      result.video_url || result.url;
    await logAgente(`Vídeo [${label}] gerado: ${videoUrl}`, "success");
    return videoUrl as string;
  } catch (err) {
    await logAgente(`Erro vídeo [${label}]: ${err instanceof Error ? err.message : String(err)}`, "error");
    return null;
  }
}

// ── FALLBACK PROMPTS ──────────────────────────────────────────
function buildFallback(promo: Record<string, unknown>) {
  const precoCliente = promo.preco_cliente || promo.preco;
  const precoNormal = promo.preco_normal || promo.preco;
  const desconto = promo.pct_desconto ? `${promo.pct_desconto}%` : "";
  const ciaAerea = promo.cia_aerea || "";
  return {
    label: "promo",
    duration: 10,
    art_prompt: `Ultra-professional premium travel promotion poster 9:16. "PromoCéu" logo top. Route: "${promo.origem} → ${promo.destino}". Golden price "R$ ${precoCliente}". Strike-through "R$ ${precoNormal}". ${desconto ? `Discount badge "-${desconto}"` : ""} ${ciaAerea}. Dark navy #0f172a, gold #f59e0b, cyan #06b6d4. Floating particles, glass-morphism.`,
    video_prompt: "Dramatic cinematic zoom, golden particles floating, price shimmer reveal, premium motion graphics",
    narration_script: `Atenção viajantes! Promoção ABSURDA! Voo de ${promo.origem} pra ${promo.destino}, ida e volta, por apenas ${Math.floor(Number(precoCliente))} reais! ${desconto ? `Isso é ${desconto} de desconto!` : ""} Corre que vaga tá acabando! Link na bio!`,
  };
}

// ── PROCESS ONE VARIATION ─────────────────────────────────────
async function processVariation(
  promo: Record<string, unknown>,
  variation: { label: string; duration: number; art_prompt: string; video_prompt: string; narration_script: string },
) {
  const { label, duration, art_prompt, video_prompt, narration_script } = variation;
  const promoId = promo.id as string;
  const ts = Date.now();

  await logAgente(`=== Processando variação [${label}] para ${promo.origem}→${promo.destino} ===`, "info");

  // Insert video record
  const { data: videoRecord, error: insertErr } = await supabase
    .from("videos")
    .insert({ promocao_id: promoId, status: "gerando_arte", variation_label: label })
    .select()
    .single();
  if (insertErr) throw insertErr;
  const videoId = videoRecord.id;

  // 1. ARTE
  const arteUrl = await generateArt(art_prompt, label);
  if (!arteUrl) {
    await supabase.from("videos").update({ status: "erro", erro_detalhes: "Falha ao gerar arte" }).eq("id", videoId);
    return false;
  }
  let storedArteUrl = arteUrl;
  try { storedArteUrl = await uploadToStorage(arteUrl, `arts/${promoId}_${label}_${ts}.png`, "image/png"); } catch { /* use original */ }
  await supabase.from("videos").update({ arte_url: storedArteUrl, status: "com_arte" }).eq("id", videoId);

  // 2. NARRAÇÃO
  const narrationUrl = await generateNarration(narration_script, label);
  if (narrationUrl) {
    await supabase.from("videos").update({ narration_url: narrationUrl, status: "com_narracao" }).eq("id", videoId);
  }

  // 3. VÍDEO
  await supabase.from("videos").update({ status: "gerando_video" }).eq("id", videoId);
  const videoUrl = await generateVideo(arteUrl, video_prompt, duration, label);

  if (videoUrl) {
    let finalUrl = videoUrl;
    try { finalUrl = await uploadToStorage(videoUrl, `finals/${promoId}_${label}_${ts}.mp4`, "video/mp4"); } catch { /* use original */ }
    await supabase.from("videos").update({
      video_url: videoUrl,
      video_final_url: finalUrl,
      status: "pronto",
    }).eq("id", videoId);
    await logAgente(`✅ Variação [${label}] PRONTA para ${promo.origem}→${promo.destino}`, "success");
    return true;
  } else {
    await supabase.from("videos").update({ status: "erro", erro_detalhes: "Vídeo não ficou pronto (timeout ou falha)" }).eq("id", videoId);
    return false;
  }
}

// ── MAIN ──────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!hfApiKey || !hfApiSecret) {
      const msg = "HF_API_KEY ou HF_API_SECRET não definidos";
      await logAgente(msg, "error");
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await logAgente("Iniciando VideoMaker v3 (3 variações por promo)", "info");

    const { data: config } = await supabase.from("config_agentes").select("*").eq("agente", "videomaker").single();
    if (!config?.ativo) {
      await logAgente("Agente VideoMaker está desativado", "warn");
      return new Response(JSON.stringify({ message: "Agente desativado" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let promoId: string | null = null;
    try { const body = await req.json(); promoId = body?.promocao_id || null; } catch { /* no body */ }

    let query;
    if (promoId) {
      query = supabase.from("promocoes").select("*").eq("id", promoId);
    } else {
      query = supabase.from("promocoes").select("*").in("status", ["prompts_gerados", "aprovada"]);
    }

    const { data: promos, error } = await query.limit(5);
    if (error) throw error;

    if (!promos?.length) {
      await logAgente("Nenhuma promoção para produção de vídeo", "info");
      return new Response(JSON.stringify({ processed: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await logAgente(`Encontradas ${promos.length} promoções para processar`, "info");
    let processed = 0;

    for (const promo of promos) {
      try {
        await logAgente(`Processando promo ${promo.id}: ${promo.origem}→${promo.destino}`, "info");
        await supabase.from("promocoes").update({ status: "em_producao" }).eq("id", promo.id);

        // Get variations from prompt_variations or fallback
        const variations: Array<{ label: string; duration: number; art_prompt: string; video_prompt: string; narration_script: string }> =
          (promo.prompt_variations as Array<{ label: string; duration: number; art_prompt: string; video_prompt: string; narration_script: string }>) ||
          [buildFallback(promo)];

        await logAgente(`${variations.length} variações para processar`, "info");

        let allDone = true;
        for (const variation of variations) {
          try {
            const ok = await processVariation(promo, variation);
            if (!ok) allDone = false;
          } catch (varErr) {
            allDone = false;
            await logAgente(`Erro variação [${variation.label}]: ${varErr instanceof Error ? varErr.message : String(varErr)}`, "error");
          }
        }

        if (allDone) {
          await supabase.from("promocoes").update({ status: "video_pronto" }).eq("id", promo.id);
          await logAgente(`🎉 Todas as variações prontas para ${promo.origem}→${promo.destino}!`, "success");
        } else {
          await logAgente(`Algumas variações falharam para ${promo.origem}→${promo.destino}`, "warn");
        }

        processed++;
      } catch (err) {
        await logAgente(`Erro promo ${promo.id}: ${err instanceof Error ? err.message : String(err)}`, "error");
      }
    }

    await logAgente(`VideoMaker v3 finalizado: ${processed} promoções processadas`, "success");
    return new Response(JSON.stringify({ processed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await logAgente(`Erro fatal: ${errMsg}`, "error");
    return new Response(JSON.stringify({ error: errMsg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
