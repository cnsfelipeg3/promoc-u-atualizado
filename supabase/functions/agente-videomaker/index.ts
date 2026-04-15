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
const creatomateKey = Deno.env.get("CREATOMATE_API_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

const hfAuthHeader = `Key ${hfApiKey}:${hfApiSecret}`;
const hfHeaders: Record<string, string> = { "Authorization": hfAuthHeader, "Content-Type": "application/json", "Accept": "application/json" };
const hfPollHeaders: Record<string, string> = { "Authorization": hfAuthHeader };

async function logAgente(mensagem: string, tipo = "info", payload: Record<string, unknown> = {}) {
  console.log(`[videomaker][${tipo}] ${mensagem}`, JSON.stringify(payload));
  await supabase.from("logs_agentes").insert({ agente: "videomaker", mensagem, tipo, payload });
}

// ── UPLOAD HELPER ─────────────────────────────────────────────
async function uploadToStorage(url: string, path: string, contentType: string): Promise<string> {
  const res = await fetch(url);
  const buffer = new Uint8Array(await res.arrayBuffer());
  const { error } = await supabase.storage.from("videos").upload(path, buffer, { contentType });
  if (error) {
    await supabase.storage.createBucket("videos", { public: true }).catch(() => {});
    const { error: retry } = await supabase.storage.from("videos").upload(path, buffer, { contentType });
    if (retry) throw retry;
  }
  const { data } = supabase.storage.from("videos").getPublicUrl(path);
  return data.publicUrl;
}

// ── POLLING HELPER ────────────────────────────────────────────
async function pollForVideo(statusUrl: string, label: string, maxAttempts = 90): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const res = await fetch(statusUrl, { headers: hfPollHeaders });
    const data = JSON.parse(await res.text());
    const status = (data.status || data.state || "").toLowerCase();

    if (i % 6 === 0) await logAgente(`Polling ${label} ${i + 1}/${maxAttempts}: ${status}`, "info");

    if (["completed", "done", "succeed", "succeeded"].includes(status)) {
      const url = data.videos?.[0]?.url || data.video?.url || data.data?.video_url ||
        data.output?.video_url || data.output?.url || data.video_url || data.url;
      if (!url) {
        await logAgente(`${label} pronto mas sem URL: ${JSON.stringify(data).substring(0, 300)}`, "error");
        return null;
      }
      return url as string;
    }
    if (["failed", "error"].includes(status)) {
      await logAgente(`${label} falhou: ${JSON.stringify(data).substring(0, 300)}`, "error");
      return null;
    }
  }
  await logAgente(`Timeout: ${label}`, "error");
  return null;
}

// ── SEEDANCE 2.0 — Text-to-Video Multi-Shot ──────────────────
const SEEDANCE_ENDPOINTS = [
  "https://platform.higgsfield.ai/bytedance/seedance/v2/pro/text-to-video",
  "https://platform.higgsfield.ai/bytedance/seedance/v2/text-to-video",
  "https://platform.higgsfield.ai/bytedance/seedance/v2.0/text-to-video",
];

async function generateSeedanceVideo(prompt: string, label: string): Promise<string | null> {
  await logAgente(`[${label}] Gerando 15s via Seedance 2.0...`, "info");

  for (const endpoint of SEEDANCE_ENDPOINTS) {
    try {
      await logAgente(`[${label}] Tentando: ${endpoint}`, "info");
      const res = await fetch(endpoint, {
        method: "POST",
        headers: hfHeaders,
        body: JSON.stringify({
          prompt,
          duration: 15,
          aspect_ratio: "9:16",
          generate_audio: true,
          quality: "high",
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        await logAgente(`[${label}] ${endpoint} → ${res.status}: ${err.substring(0, 200)}`, "warn");
        continue;
      }

      const data = JSON.parse(await res.text());
      await logAgente(`[${label}] Aceito via ${endpoint}`, "success", { response: JSON.stringify(data).substring(0, 500) });
      const statusUrl = data.status_url ||
        `https://platform.higgsfield.ai/requests/${data.request_id || data.id}/status`;
      return await pollForVideo(statusUrl, `seedance-${label}`);
    } catch (e) {
      await logAgente(`[${label}] Erro ${endpoint}: ${e instanceof Error ? e.message : String(e)}`, "warn");
    }
  }

  // FALLBACK: Kling text-to-video
  await logAgente(`[${label}] Seedance falhou, tentando Kling fallback...`, "warn");
  return await generateKlingFallback(prompt, label);
}

async function generateKlingFallback(prompt: string, label: string): Promise<string | null> {
  const cleanPrompt = prompt
    .replace(/SHOT \d+ \(\d+-\d+s\)\n?/g, "")
    .replace(/camera:.*\n?/gi, "")
    .replace(/SFX:.*\n?/gi, "")
    .substring(0, 500);

  const endpoint = "https://platform.higgsfield.ai/kling-video/v2.1/pro/text-to-video";

  try {
    await logAgente(`[${label}] Kling fallback tentando: ${endpoint}`, "info");
    const res = await fetch(endpoint, {
      method: "POST",
      headers: hfHeaders,
      body: JSON.stringify({ prompt: cleanPrompt, duration: 10, aspect_ratio: "9:16", cfg_scale: 0.6 }),
    });
    if (!res.ok) {
      const err = await res.text();
      await logAgente(`[${label}] Kling ${res.status}: ${err.substring(0, 200)}`, "warn");
    } else {
      const data = JSON.parse(await res.text());
      const statusUrl = data.status_url ||
        `https://platform.higgsfield.ai/requests/${data.request_id || data.id}/status`;
      await logAgente(`[${label}] Kling fallback aceito`, "success", { response: JSON.stringify(data).substring(0, 300) });
      return await pollForVideo(statusUrl, `kling-${label}`, 120);
    }
  } catch (e) {
    await logAgente(`[${label}] Kling erro: ${e instanceof Error ? e.message : String(e)}`, "error");
  }

  await logAgente(`[${label}] Kling fallback também falhou`, "error");
  return null;
}

// ── ELEVENLABS — Narração PT-BR viral ─────────────────────────
async function generateNarration(script: string, promoId: string): Promise<string | null> {
  if (!elevenLabsKey) {
    await logAgente("ELEVENLABS_API_KEY não configurada", "error");
    return null;
  }
  await logAgente(`Gerando narração 30s: ${script.substring(0, 80)}...`, "info");
  try {
    const voiceId = "nPczCjzI2devNBz1zQrb"; // Brian
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": elevenLabsKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.25, similarity_boost: 0.80, style: 1.0, use_speaker_boost: true },
      }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
    const buffer = new Uint8Array(await res.arrayBuffer());
    const fileName = `narrations/${promoId}_30s_${Date.now()}.mp3`;
    const url = await uploadToStorage(
      URL.createObjectURL ? "" : "", // we upload buffer directly
      fileName, "audio/mpeg"
    ).catch(async () => {
      // Direct upload since we already have the buffer
      const { error } = await supabase.storage.from("videos").upload(fileName, buffer, { contentType: "audio/mpeg" });
      if (error) {
        await supabase.storage.createBucket("videos", { public: true }).catch(() => {});
        await supabase.storage.from("videos").upload(fileName, buffer, { contentType: "audio/mpeg" });
      }
      const { data } = supabase.storage.from("videos").getPublicUrl(fileName);
      return data.publicUrl;
    });
    // Direct upload
    const { error } = await supabase.storage.from("videos").upload(fileName, buffer, { contentType: "audio/mpeg" });
    if (error) {
      await supabase.storage.createBucket("videos", { public: true }).catch(() => {});
      await supabase.storage.from("videos").upload(fileName, buffer, { contentType: "audio/mpeg" });
    }
    const { data } = supabase.storage.from("videos").getPublicUrl(fileName);
    await logAgente("Narração 30s pronta", "success");
    return data.publicUrl;
  } catch (err) {
    await logAgente(`Erro narração: ${err instanceof Error ? err.message : String(err)}`, "error");
    return null;
  }
}

// ── CREATOMATE — Composição Final 30s ─────────────────────────
function getY(pos: string): string {
  return { top_left: "5%", top: "8%", top_right: "5%", center: "45%", below_price: "55%", bottom: "88%" }[pos] || "50%";
}
function getX(pos: string): string {
  return { top_left: "10%", top_right: "90%" }[pos] || "50%";
}
function getFontSize(s: string): string {
  return { price: "72", destination: "56", cta: "48", discount: "42", detail: "32", subtitle: "36", logo: "22", follow: "36" }[s] || "36";
}
function getColor(s: string): string {
  return { price: "#FFD700", cta: "#FFFFFF", discount: "#FFFFFF", logo: "#FFFFFFAA" }[s] || "#FFFFFF";
}
function getBg(s: string): string | null {
  return { price: "#00000066", discount: "#FF0000CC", cta: "#FF6600CC", follow: "#7C3AEDCC", logo: undefined }[s] || "#00000055";
}

async function composeInCreatomate(
  partAUrl: string,
  partBUrl: string | null,
  narrationUrl: string | null,
  overlayConfig: { overlays?: Array<{ text: string; start: number; end: number; position: string; style: string }> } | null,
  promoId: string,
): Promise<string | null> {
  if (!creatomateKey) {
    await logAgente("CREATOMATE_API_KEY não configurada, pulando composição", "warn");
    return null;
  }

  await logAgente("Compondo vídeo final 30s via Creatomate...", "info");

  const elements: Record<string, unknown>[] = [
    // Part A (0-15s)
    { type: "video", track: 1, source: partAUrl, time: 0, duration: 15, fit: "cover" },
  ];

  // Part B (14.5-30s with crossfade)
  if (partBUrl) {
    elements.push({
      type: "video", track: 1, source: partBUrl, time: 14.5, duration: 15.5, fit: "cover",
      transition: { type: "crossfade", duration: 0.5 },
    });
  }

  // Narration (full 30s, volume high)
  if (narrationUrl) {
    elements.push({ type: "audio", track: 2, source: narrationUrl, time: 0, duration: 30, volume: "90%" });
  }

  // Background music (low volume)
  elements.push({
    type: "audio", track: 3,
    source: "https://cdn.pixabay.com/audio/2024/11/04/audio_2460e0e59a.mp3",
    time: 0, duration: 30, volume: "12%", audio_fade_out: 2.0,
  });

  // Text overlays
  const overlays = overlayConfig?.overlays;
  if (overlays) {
    for (let i = 0; i < overlays.length; i++) {
      const ov = overlays[i];
      elements.push({
        type: "text", track: 10 + i, text: ov.text,
        time: ov.start, duration: ov.end - ov.start,
        x: getX(ov.position), y: getY(ov.position), width: "90%",
        font_family: "Montserrat",
        font_weight: ov.style === "price" ? "900" : "700",
        font_size: getFontSize(ov.style),
        fill_color: getColor(ov.style),
        stroke_color: "#000000AA", stroke_width: "2",
        text_alignment: "center",
        background_color: getBg(ov.style),
        background_x_padding: "15", background_y_padding: "8", background_border_radius: "8",
        enter: { type: "scale", duration: 0.3 },
        exit: { type: "fade", duration: 0.3 },
      });
    }
  }

  try {
    const renderResponse = await fetch("https://api.creatomate.com/v1/renders", {
      method: "POST",
      headers: { "Authorization": `Bearer ${creatomateKey}`, "Content-Type": "application/json" },
      body: JSON.stringify([{
        output_format: "mp4", width: 1080, height: 1920, duration: 30, elements,
      }]),
    });

    if (!renderResponse.ok) {
      throw new Error(`Creatomate ${renderResponse.status}: ${await renderResponse.text()}`);
    }

    const renders = await renderResponse.json();
    const renderId = renders[0]?.id;
    if (!renderId) throw new Error("Creatomate sem render ID");

    await logAgente(`Creatomate render ${renderId} iniciado`, "info");

    // Poll
    for (let i = 0; i < 120; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const check = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
        headers: { "Authorization": `Bearer ${creatomateKey}` },
      });
      const result = await check.json();
      if (result.status === "succeeded") {
        const storedUrl = await uploadToStorage(result.url, `finals/${promoId}_30s_${Date.now()}.mp4`, "video/mp4");
        await logAgente("Vídeo 30s composto e salvo!", "success");
        return storedUrl;
      }
      if (result.status === "failed") throw new Error("Creatomate falhou: " + (result.error_message || ""));
      if (i % 6 === 0) await logAgente(`Polling composição ${i + 1}/120`, "info");
    }
    throw new Error("Creatomate timeout");
  } catch (err) {
    await logAgente(`Erro composição: ${err instanceof Error ? err.message : String(err)}`, "error");
    return null;
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

    await logAgente("Iniciando VideoMaker v8 (Seedance 2.0, storytelling 30s)", "info");

    const { data: config } = await supabase.from("config_agentes").select("*").eq("agente", "videomaker").single();
    if (!config?.ativo) {
      await logAgente("Agente VideoMaker está desativado", "warn");
      return new Response(JSON.stringify({ message: "Agente desativado" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let promoId: string | null = null;
    try {
      const body = await req.json();
      promoId = body?.promocao_id || null;
    } catch { /* no body */ }

    let query;
    if (promoId) {
      query = supabase.from("promocoes").select("*").eq("id", promoId);
    } else {
      query = supabase.from("promocoes").select("*").in("status", ["prompts_gerados"]);
    }

    const { data: promos, error } = await query.limit(5);
    if (error) throw error;

    if (!promos?.length) {
      await logAgente("Nenhuma promoção para produção de vídeo", "info");
      return new Response(JSON.stringify({ processed: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let processed = 0;

    for (const promo of promos) {
      try {
        await logAgente(`Processando: ${promo.origem}→${promo.destino} (${promo.id})`, "info");
        await supabase.from("promocoes").update({ status: "em_producao" }).eq("id", promo.id);

        // Extract storyboard from prompt_variations
        const rawData = promo.prompt_variations as Record<string, unknown> | null;
        const storyboard = rawData?.storyboard as Record<string, unknown> | undefined;

        if (!storyboard?.part_a || !storyboard?.part_b) {
          await logAgente(`Storyboard incompleto para promo ${promo.id}, tentando formato legado`, "warn");
          // Legacy format: try old variations array
          const legacyVariations = Array.isArray(rawData) ? rawData :
            (rawData?.variations as unknown[] | undefined);
          if (legacyVariations) {
            await logAgente("Formato legado detectado — pulando (precisa re-gerar prompts)", "warn");
          }
          continue;
        }

        const partA = storyboard.part_a as { prompt: string; duration: number };
        const partB = storyboard.part_b as { prompt: string; duration: number };
        const narrationScript = storyboard.narration_script as string || promo.narration_script || "";
        const overlayConfig = storyboard.overlay_config as { overlays: Array<{ text: string; start: number; end: number; position: string; style: string }> } | null;

        // Create video record
        const { data: videoRec, error: insErr } = await supabase.from("videos").insert({
          promocao_id: promo.id,
          variation_label: "storytelling_30s",
          status: "gerando_cena",
          payload: { storyboard },
        }).select().single();
        if (insErr) throw new Error("Insert vídeo: " + insErr.message);
        const videoId = videoRec.id;

        try {
          // ── STEP 1: Generate Part A & Part B in parallel ──
          await logAgente("Gerando 2 clips de 15s em paralelo...", "info");
          const [partAUrl, partBUrl] = await Promise.all([
            generateSeedanceVideo(partA.prompt, "Parte_A"),
            generateSeedanceVideo(partB.prompt, "Parte_B"),
          ]);

          if (!partAUrl) {
            await supabase.from("videos").update({ status: "erro", erro_detalhes: "Parte A falhou" }).eq("id", videoId);
            continue;
          }

          // Store scene URLs
          let storedPartA = partAUrl;
          try { storedPartA = await uploadToStorage(partAUrl, `scenes/${promo.id}_partA_${Date.now()}.mp4`, "video/mp4"); } catch { /* use original */ }
          let storedPartB = partBUrl;
          if (partBUrl) {
            try { storedPartB = await uploadToStorage(partBUrl, `scenes/${promo.id}_partB_${Date.now()}.mp4`, "video/mp4"); } catch { /* use original */ }
          }

          await supabase.from("videos").update({
            scene_video_url: storedPartA,
            status: "com_cena",
            payload: { storyboard, part_a_url: storedPartA, part_b_url: storedPartB },
          }).eq("id", videoId);

          await logAgente(`Cenas prontas: A=${!!storedPartA}, B=${!!storedPartB}`, "success");

          // ── STEP 2: Generate narration ──
          await supabase.from("videos").update({ status: "gerando_narracao" }).eq("id", videoId);
          const narrationUrl = await generateNarration(narrationScript, promo.id);
          if (narrationUrl) {
            await supabase.from("videos").update({ narration_url: narrationUrl, status: "com_narracao" }).eq("id", videoId);
          }

          // ── STEP 3: Compose final video ──
          await supabase.from("videos").update({ status: "compondo_video" }).eq("id", videoId);
          const finalUrl = await composeInCreatomate(
            storedPartA!, storedPartB || null, narrationUrl, overlayConfig, promo.id,
          );

          if (finalUrl) {
            await supabase.from("videos").update({
              video_url: storedPartA,
              video_final_url: finalUrl,
              status: "pronto",
            }).eq("id", videoId);
            await logAgente(`✅ Vídeo 30s PRONTO para ${promo.origem}→${promo.destino}!`, "success");
          } else {
            // No composition — save Part A as final
            await supabase.from("videos").update({
              video_url: storedPartA,
              video_final_url: storedPartA,
              status: "pronto",
            }).eq("id", videoId);
            await logAgente(`⚠ Vídeo salvo SEM composição (apenas Parte A)`, "warn");
          }

          await supabase.from("promocoes").update({ status: "video_pronto" }).eq("id", promo.id);
          processed++;

        } catch (err) {
          await supabase.from("videos").update({
            status: "erro",
            erro_detalhes: err instanceof Error ? err.message : String(err),
          }).eq("id", videoId);
          await logAgente(`Erro pipeline: ${err instanceof Error ? err.message : String(err)}`, "error");
        }
      } catch (err) {
        await logAgente(`Erro promo ${promo.id}: ${err instanceof Error ? err.message : String(err)}`, "error");
      }
    }

    await logAgente(`VideoMaker v8 finalizado: ${processed} processadas`, "success");
    return new Response(JSON.stringify({ processed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await logAgente(`Erro fatal: ${errMsg}`, "error");
    return new Response(JSON.stringify({ error: errMsg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
