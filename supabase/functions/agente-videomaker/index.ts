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
    if (status === "completed" || status === "done") return data;
    if (status === "failed") { await logAgente(`${label} falhou: ${JSON.stringify(data)}`, "error"); return null; }
  }
  await logAgente(`Timeout: ${label}`, "error");
  return null;
}

// ── GENERATE SCENE (Text-to-Video) ────────────────────────────
async function generateScene(scenePrompt: string, cameraControl: string, duration: number, label: string): Promise<string | null> {
  await logAgente(`Gerando cena [${label}] via text-to-video (${duration}s)`, "info");
  
  const fullPrompt = `${scenePrompt}. Camera movement: ${cameraControl}`;
  
  // Try text-to-video first
  const endpoints = [
    "https://platform.higgsfield.ai/api/v1/kling-video/v2.1/pro/text-to-video",
    "https://platform.higgsfield.ai/kling-video/v2.1/pro/text-to-video",
  ];
  
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: hfHeaders,
        body: JSON.stringify({
          prompt: fullPrompt,
          duration: duration,
          aspect_ratio: "9:16",
          cfg_scale: 0.6,
        }),
      });
      
      if (!res.ok) {
        await logAgente(`Text-to-video endpoint ${endpoint} retornou ${res.status}`, "warn");
        continue;
      }
      
      const data = JSON.parse(await res.text());
      const statusUrl = data.status_url || data.request_url;
      if (!statusUrl) {
        await logAgente(`Sem status_url do endpoint ${endpoint}`, "warn");
        continue;
      }
      
      await logAgente(`Text-to-video [${label}] submetido, polling...`, "info");
      const result = await pollStatus(statusUrl, `cena-${label}`, 120);
      if (!result) return null;
      
      const videoUrl = (result.videos as Array<{ url: string }>)?.[0]?.url ||
        (result.video as Record<string, unknown>)?.url ||
        (result.output as Record<string, unknown>)?.video_url ||
        (result.output as Record<string, unknown>)?.url ||
        result.video_url || result.url;
      
      if (videoUrl) {
        await logAgente(`Cena [${label}] gerada com sucesso via text-to-video`, "success");
        return videoUrl as string;
      }
    } catch (err) {
      await logAgente(`Erro text-to-video endpoint ${endpoint}: ${err instanceof Error ? err.message : String(err)}`, "warn");
    }
  }
  
  // FALLBACK: Generate image + image-to-video
  await logAgente(`Text-to-video falhou para [${label}], usando fallback image→video`, "warn");
  return await generateSceneFallback(scenePrompt, cameraControl, duration, label);
}

// ── FALLBACK: Image → Video ───────────────────────────────────
async function generateSceneFallback(scenePrompt: string, cameraControl: string, duration: number, label: string): Promise<string | null> {
  // 1. Generate image from scene prompt
  try {
    const imgRes = await fetch("https://platform.higgsfield.ai/bytedance/seedream/v4/text-to-image", {
      method: "POST",
      headers: hfHeaders,
      body: JSON.stringify({ prompt: scenePrompt, aspect_ratio: "9:16", resolution: "2K" }),
    });
    if (!imgRes.ok) throw new Error(`Art API ${imgRes.status}`);
    const imgData = JSON.parse(await imgRes.text());
    const imgStatusUrl = imgData.status_url || imgData.request_url;
    if (!imgStatusUrl) throw new Error("No status_url for image");

    const imgResult = await pollStatus(imgStatusUrl, `cena-img-${label}`, 60);
    if (!imgResult) return null;
    const imageUrl = (imgResult.images as Array<{ url: string }>)?.[0]?.url ||
      (imgResult.output as Record<string, unknown>)?.image_url;
    if (!imageUrl) return null;

    // 2. Animate image to video
    const vidRes = await fetch("https://platform.higgsfield.ai/kling-video/v2.1/pro/image-to-video", {
      method: "POST",
      headers: hfHeaders,
      body: JSON.stringify({ image_url: imageUrl, prompt: `Camera: ${cameraControl}. Cinematic motion.`, duration }),
    });
    if (!vidRes.ok) throw new Error(`Video API ${vidRes.status}`);
    const vidData = JSON.parse(await vidRes.text());
    const vidStatusUrl = vidData.status_url || vidData.request_url;
    if (!vidStatusUrl) return null;

    const vidResult = await pollStatus(vidStatusUrl, `cena-vid-${label}`, 120);
    if (!vidResult) return null;
    const videoUrl = (vidResult.videos as Array<{ url: string }>)?.[0]?.url ||
      (vidResult.video as Record<string, unknown>)?.url ||
      (vidResult.output as Record<string, unknown>)?.video_url;
    
    if (videoUrl) {
      await logAgente(`Cena [${label}] gerada via fallback (image→video)`, "success");
      return videoUrl as string;
    }
    return null;
  } catch (err) {
    await logAgente(`Fallback falhou [${label}]: ${err instanceof Error ? err.message : String(err)}`, "error");
    return null;
  }
}

// ── GENERATE NARRATION ────────────────────────────────────────
async function generateNarration(script: string, promoId: string, label: string): Promise<string | null> {
  if (!elevenLabsKey) { await logAgente("ELEVENLABS_API_KEY não configurada", "error"); return null; }
  await logAgente(`Gerando narração [${label}]: ${script.substring(0, 60)}...`, "info");
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
    const fileName = `narrations/${promoId}_${label}_${Date.now()}.mp3`;
    const { error } = await supabase.storage.from("videos").upload(fileName, buffer, { contentType: "audio/mpeg" });
    if (error) {
      await supabase.storage.createBucket("videos", { public: true });
      const { error: retry } = await supabase.storage.from("videos").upload(fileName, buffer, { contentType: "audio/mpeg" });
      if (retry) throw retry;
    }
    const { data } = supabase.storage.from("videos").getPublicUrl(fileName);
    await logAgente(`Narração [${label}] pronta`, "success");
    return data.publicUrl;
  } catch (err) {
    await logAgente(`Erro narração [${label}]: ${err instanceof Error ? err.message : String(err)}`, "error");
    return null;
  }
}

// ── COMPOSE VIDEO (Creatomate) ────────────────────────────────
async function composeVideo(
  sceneVideoUrl: string,
  narrationUrl: string | null,
  overlayConfig: Record<string, unknown> | null,
  duration: number,
  promoId: string,
  label: string,
): Promise<string | null> {
  if (!creatomateKey) {
    await logAgente("CREATOMATE_API_KEY não configurada, pulando composição", "warn");
    return null;
  }

  await logAgente(`Compondo vídeo final [${label}] via Creatomate`, "info");

  const elements: Record<string, unknown>[] = [
    { type: "video", source: sceneVideoUrl, duration: duration },
  ];

  // Narration audio
  if (narrationUrl) {
    elements.push({ type: "audio", source: narrationUrl, duration: duration, volume: "100%" });
  }

  // Background music (low volume)
  elements.push({
    type: "audio",
    source: "https://cdn.pixabay.com/audio/2024/11/04/audio_2460e0e59a.mp3",
    duration: duration,
    volume: "15%",
    audio_fade_out: 1.0,
  });

  // Text overlays
  const overlays = (overlayConfig as { overlays?: Array<{ text: string; start: number; end: number; position: string; style: string }> })?.overlays;
  if (overlays) {
    for (const ov of overlays) {
      elements.push({
        type: "text",
        text: ov.text,
        time: ov.start,
        duration: ov.end - ov.start,
        y: getYPosition(ov.position),
        width: "90%",
        x_alignment: "50%",
        font_family: "Montserrat",
        font_weight: "800",
        color: getTextColor(ov.style),
        font_size: getFontSize(ov.style),
        background_color: getBackgroundColor(ov.style),
        background_x_padding: "5%",
        background_y_padding: "3%",
        background_border_radius: "8",
        enter: { type: "scale", duration: 0.3, easing: "back-out" },
        exit: { type: "fade", duration: 0.2 },
      });
    }
  }

  // Logo PromoCéu
  elements.push({
    type: "text",
    text: "✈ PromoCéu",
    time: 0,
    duration: duration,
    x: "50%",
    y: "5%",
    font_family: "Montserrat",
    font_weight: "700",
    font_size: "3.5 vmin",
    color: "#ffffff",
    background_color: "rgba(15,23,42,0.7)",
    background_x_padding: "4%",
    background_y_padding: "2%",
    background_border_radius: "20",
  });

  try {
    const renderResponse = await fetch("https://api.creatomate.com/v1/renders", {
      method: "POST",
      headers: { "Authorization": `Bearer ${creatomateKey}`, "Content-Type": "application/json" },
      body: JSON.stringify([{
        output_format: "mp4",
        width: 1080,
        height: 1920,
        duration: duration,
        elements: elements,
      }]),
    });

    if (!renderResponse.ok) {
      const errText = await renderResponse.text();
      throw new Error(`Creatomate ${renderResponse.status}: ${errText}`);
    }

    const renders = await renderResponse.json();
    const renderId = renders[0]?.id;
    if (!renderId) throw new Error("Creatomate sem render ID: " + JSON.stringify(renders));

    await logAgente(`Creatomate render ${renderId} iniciado para [${label}]`, "info");

    // Poll Creatomate
    let finalUrl = "";
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const check = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
        headers: { "Authorization": `Bearer ${creatomateKey}` },
      });
      const result = await check.json();
      if (result.status === "succeeded") { finalUrl = result.url; break; }
      if (result.status === "failed") throw new Error("Composição falhou: " + (result.error_message || JSON.stringify(result)));
      if (i % 6 === 0) await logAgente(`Polling composição [${label}] ${i + 1}/60`, "info");
    }

    if (!finalUrl) throw new Error("Timeout na composição Creatomate");

    // Upload to Storage
    const storedUrl = await uploadToStorage(finalUrl, `finals/${promoId}_${label}_final_${Date.now()}.mp4`, "video/mp4");
    await logAgente(`Vídeo composto [${label}] salvo no Storage`, "success");
    return storedUrl;
  } catch (err) {
    await logAgente(`Erro composição [${label}]: ${err instanceof Error ? err.message : String(err)}`, "error");
    return null;
  }
}

function getYPosition(position: string): string {
  switch (position) {
    case "top": return "12%";
    case "center": return "45%";
    case "below_price": return "55%";
    case "bottom": return "85%";
    default: return "50%";
  }
}
function getTextColor(style: string): string {
  switch (style) {
    case "price": return "#f59e0b";
    case "discount": case "cta": case "destination": case "logo": return "#ffffff";
    case "detail": return "#e2e8f0";
    default: return "#ffffff";
  }
}
function getFontSize(style: string): string {
  switch (style) {
    case "price": return "12 vmin";
    case "destination": return "8 vmin";
    case "discount": case "cta": return "5 vmin";
    case "detail": return "3.5 vmin";
    case "logo": return "3 vmin";
    default: return "4 vmin";
  }
}
function getBackgroundColor(style: string): string {
  switch (style) {
    case "price": return "rgba(15,23,42,0.8)";
    case "discount": return "rgba(239,68,68,0.9)";
    case "cta": return "rgba(245,158,11,0.9)";
    case "destination": return "rgba(15,23,42,0.7)";
    case "detail": return "rgba(15,23,42,0.6)";
    default: return "rgba(0,0,0,0.5)";
  }
}

// ── PROCESS ONE VARIATION ─────────────────────────────────────
interface Variation {
  label: string;
  duration: number;
  scene_prompt?: string;
  camera_control?: string;
  narration_script?: string;
  overlay_config?: Record<string, unknown>;
  // Legacy fields
  art_prompt?: string;
  video_prompt?: string;
}

async function processVariation(promo: Record<string, unknown>, variation: Variation) {
  const { label, duration } = variation;
  const promoId = promo.id as string;
  const scenePrompt = variation.scene_prompt || variation.art_prompt || "";
  const cameraControl = variation.camera_control || variation.video_prompt || "slow dolly forward";
  const narrationScript = variation.narration_script || "";
  const overlayConfig = variation.overlay_config || null;

  await logAgente(`=== Processando variação [${label}] para ${promo.origem}→${promo.destino} ===`, "info");

  // Insert video record
  const { data: videoRecord, error: insertErr } = await supabase
    .from("videos")
    .insert({ promocao_id: promoId, status: "gerando_cena", variation_label: label })
    .select()
    .single();
  if (insertErr) throw insertErr;
  const videoId = videoRecord.id;

  try {
    // 1. SCENE (text-to-video with fallback)
    const sceneUrl = await generateScene(scenePrompt, cameraControl, duration, label);
    if (!sceneUrl) {
      await supabase.from("videos").update({ status: "erro", erro_detalhes: "Falha ao gerar cena" }).eq("id", videoId);
      return false;
    }
    let storedSceneUrl = sceneUrl;
    try { storedSceneUrl = await uploadToStorage(sceneUrl, `scenes/${promoId}_${label}_${Date.now()}.mp4`, "video/mp4"); } catch { /* use original */ }
    await supabase.from("videos").update({ scene_video_url: storedSceneUrl, status: "com_cena" }).eq("id", videoId);

    // 2. NARRATION
    let narrationUrl: string | null = null;
    if (narrationScript) {
      await supabase.from("videos").update({ status: "gerando_narracao" }).eq("id", videoId);
      narrationUrl = await generateNarration(narrationScript, promoId, label);
      if (narrationUrl) {
        await supabase.from("videos").update({ narration_url: narrationUrl, status: "com_narracao" }).eq("id", videoId);
      }
    }

    // 3. COMPOSE (Creatomate: scene + narration + overlays + music)
    await supabase.from("videos").update({ status: "compondo_video" }).eq("id", videoId);
    const finalUrl = await composeVideo(sceneUrl, narrationUrl, overlayConfig, duration, promoId, label);

    if (finalUrl) {
      await supabase.from("videos").update({
        video_url: storedSceneUrl,
        video_final_url: finalUrl,
        status: "pronto",
      }).eq("id", videoId);
      await logAgente(`✅ Variação [${label}] PRONTA (com composição)`, "success");
      return true;
    } else {
      // No Creatomate → save scene as final (without audio overlay)
      await supabase.from("videos").update({
        video_url: storedSceneUrl,
        video_final_url: storedSceneUrl,
        status: "pronto",
      }).eq("id", videoId);
      await logAgente(`⚠ Variação [${label}] pronta SEM composição (Creatomate indisponível)`, "warn");
      return true;
    }
  } catch (err) {
    await supabase.from("videos").update({
      status: "erro",
      erro_detalhes: err instanceof Error ? err.message : String(err),
    }).eq("id", videoId);
    throw err;
  }
}

// ── LEGACY FALLBACK ───────────────────────────────────────────
function buildLegacyFallback(promo: Record<string, unknown>): Variation {
  const precoCliente = promo.preco_cliente || promo.preco;
  return {
    label: "promo",
    duration: 10,
    scene_prompt: `Young Brazilian traveler standing at a famous landmark in ${promo.destino}, looking amazed and turning to camera with genuine excitement. Golden hour lighting, cinematic shallow depth of field. Casual stylish summer outfit. Vertical 9:16 format. Hyper-realistic, photorealistic quality.`,
    camera_control: "slow dolly forward",
    narration_script: `GENTE, olha isso! Voo de ${promo.origem} pra ${promo.destino}, ida e volta, por apenas ${Math.floor(Number(precoCliente))} reais! Promoção ABSURDA que a PromoCéu achou! Corre no link da bio!`,
    overlay_config: {
      overlays: [
        { text: String(promo.destino), start: 1, end: 4, position: "top", style: "destination" },
        { text: `R$ ${precoCliente}`, start: 3, end: 8, position: "center", style: "price" },
        { text: "ida e volta", start: 4, end: 7, position: "below_price", style: "detail" },
        { text: "Link na bio 🔥", start: 7, end: 10, position: "bottom", style: "cta" },
      ],
    },
  };
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

    await logAgente("Iniciando VideoMaker v6 (cenas cinematográficas + Creatomate)", "info");

    const { data: config } = await supabase.from("config_agentes").select("*").eq("agente", "videomaker").single();
    if (!config?.ativo) {
      await logAgente("Agente VideoMaker está desativado", "warn");
      return new Response(JSON.stringify({ message: "Agente desativado" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let promoId: string | null = null;
    let singleVariation: string | null = null;
    try {
      const body = await req.json();
      promoId = body?.promocao_id || null;
      singleVariation = body?.single_variation || null;
    } catch { /* no body */ }

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

        // Get variations
        let variations: Variation[] = (promo.prompt_variations as Variation[]) || [buildLegacyFallback(promo)];

        // Filter to single variation if requested
        if (singleVariation) {
          variations = variations.filter(v => v.label === singleVariation);
          await logAgente(`Modo single_variation: processando apenas [${singleVariation}]`, "info");
        }

        await logAgente(`${variations.length} variação(ões) para processar`, "info");

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

    await logAgente(`VideoMaker v6 finalizado: ${processed} promoções processadas`, "success");
    return new Response(JSON.stringify({ processed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await logAgente(`Erro fatal: ${errMsg}`, "error");
    return new Response(JSON.stringify({ error: errMsg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
