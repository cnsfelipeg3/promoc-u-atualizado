import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HIGGSFIELD_BASE = "https://platform.higgsfield.ai";

// ── T2I endpoints (priority order) ──────────────────────────
const T2I_ENDPOINTS = [
  {
    name: "Seedream v4",
    path: "/bytedance/seedream/v4/text-to-image",
    body: (prompt: string) => ({ prompt, aspect_ratio: "9:16", seed: Math.floor(Math.random() * 999999) }),
  },
  {
    name: "Soul",
    path: "/v1/text2image/soul",
    body: (prompt: string) => ({ params: { prompt, aspect_ratio: "9:16" } }),
  },
  {
    name: "Flux Pro",
    path: "/flux-pro/kontext/max/text-to-image",
    body: (prompt: string) => ({ prompt, aspect_ratio: "9:16" }),
  },
];

// ── I2V endpoints (priority order) ──────────────────────────
const I2V_ENDPOINTS = [
  {
    name: "DoP Turbo",
    path: "/v1/image2video/dop",
    body: (imageUrl: string, prompt: string) => ({ params: { model: "dop-turbo", prompt, input_images: [{ type: "image_url", image_url: imageUrl }] } }),
  },
  {
    name: "Kling 2.1 Pro",
    path: "/kling-video/v2.1/pro/image-to-video",
    body: (imageUrl: string, prompt: string) => ({ prompt, image_url: imageUrl, duration: "5", aspect_ratio: "9:16" }),
  },
  {
    name: "DoP Standard",
    path: "/v1/image2video/dop",
    body: (imageUrl: string, prompt: string) => ({ params: { model: "dop-standard", prompt, input_images: [{ type: "image_url", image_url: imageUrl }] } }),
  },
  {
    name: "DoP Lite",
    path: "/v1/image2video/dop",
    body: (imageUrl: string, prompt: string) => ({ params: { model: "dop-lite", prompt, input_images: [{ type: "image_url", image_url: imageUrl }] } }),
  },
];

// ── Helpers ─────────────────────────────────────────────────
function extractId(data: Record<string, unknown>): string | null {
  return (data?.request_id || data?.id || (data?.data as Record<string, unknown>)?.id || null) as string | null;
}

async function log(supabase: ReturnType<typeof createClient>, tipo: string, msg: string, payload: Record<string, unknown> = {}) {
  console.log(`[videomaker][${tipo}] ${msg}`, JSON.stringify(payload));
  try { await supabase.from("logs_agentes").insert({ agente: "videomaker", mensagem: msg, tipo, payload }); } catch (_) { /* */ }
}

async function uploadToStorage(supabase: ReturnType<typeof createClient>, url: string, path: string, ct: string): Promise<string> {
  const res = await fetch(url);
  const buf = new Uint8Array(await res.arrayBuffer());
  const { error } = await supabase.storage.from("videos").upload(path, buf, { contentType: ct, upsert: true });
  if (error) {
    await supabase.storage.createBucket("videos", { public: true }).catch(() => {});
    const r2 = await supabase.storage.from("videos").upload(path, buf, { contentType: ct, upsert: true });
    if (r2.error) throw r2.error;
  }
  return supabase.storage.from("videos").getPublicUrl(path).data.publicUrl;
}

// ── Polling — GET /requests/{id}/status ─────────────────────
async function pollHiggsfield(requestId: string, authHeader: string): Promise<{ status: string; videoUrl?: string; imageUrl?: string; error?: string }> {
  try {
    const resp = await fetch(`${HIGGSFIELD_BASE}/requests/${requestId}/status`, {
      headers: { "Authorization": authHeader },
    });
    if (!resp.ok) return { status: "in_progress" };
    const data = await resp.json();
    const status = ((data.status || "") as string).toLowerCase();

    if (status === "completed") {
      const videoUrl = data?.video?.url || data?.videos?.[0]?.url || null;
      const imageUrl = data?.images?.[0]?.url || data?.image?.url || null;
      return { status: "completed", videoUrl, imageUrl };
    }
    if (status === "failed") return { status: "failed", error: JSON.stringify(data).substring(0, 300) };
    if (status === "nsfw") return { status: "failed", error: "Conteúdo bloqueado (NSFW)" };
    return { status: status || "in_progress" };
  } catch (_) {
    return { status: "in_progress" };
  }
}

// ── Submit to Higgsfield ────────────────────────────────────
async function submitToHiggsfield(path: string, body: unknown, headers: Record<string, string>): Promise<string> {
  const resp = await fetch(`${HIGGSFIELD_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Submit ${path} falhou: ${resp.status} — ${errText.substring(0, 300)}`);
  }
  const data = await resp.json();
  const requestId = extractId(data);
  if (!requestId) throw new Error("Sem request_id: " + JSON.stringify(data).substring(0, 200));
  return requestId;
}

// ── Discover working T2I endpoint ───────────────────────────
async function discoverT2I(headers: Record<string, string>, logFn: (t: string, m: string) => Promise<void>): Promise<typeof T2I_ENDPOINTS[0] | null> {
  for (const ep of T2I_ENDPOINTS) {
    try {
      await logFn("info", `Testando T2I: ${ep.name} (${ep.path})`);
      const r = await fetch(`${HIGGSFIELD_BASE}${ep.path}`, {
        method: "POST", headers,
        body: JSON.stringify(ep.body("A beautiful tropical beach at sunset, 9:16 vertical format")),
      });
      if (r.ok || r.status === 201 || r.status === 202) {
        const testData = await r.json();
        const testReqId = extractId(testData);
        await logFn("success", `T2I disponível: ${ep.name}`);
        // Cancel test request
        if (testReqId) {
          try { await fetch(`${HIGGSFIELD_BASE}/requests/${testReqId}/cancel`, { method: "POST", headers }); } catch (_) {}
        }
        return ep;
      }
      const err = await r.text();
      await logFn("warn", `T2I ${ep.name} → ${r.status}: ${err.substring(0, 150)}`);
    } catch (e) {
      await logFn("warn", `T2I ${ep.name} erro: ${(e as Error).message}`);
    }
  }
  return null;
}

// ── Discover working I2V endpoint ───────────────────────────
async function discoverI2V(imageUrl: string, motionPrompt: string, headers: Record<string, string>, logFn: (t: string, m: string) => Promise<void>): Promise<{ endpoint: typeof I2V_ENDPOINTS[0]; requestId: string } | null> {
  for (const ep of I2V_ENDPOINTS) {
    try {
      await logFn("info", `Testando I2V: ${ep.name} (${ep.path})`);
      const r = await fetch(`${HIGGSFIELD_BASE}${ep.path}`, {
        method: "POST", headers,
        body: JSON.stringify(ep.body(imageUrl, motionPrompt)),
      });
      if (r.ok || r.status === 201 || r.status === 202) {
        const data = await r.json();
        const reqId = extractId(data);
        if (reqId) {
          await logFn("success", `I2V disponível: ${ep.name} — request ${reqId}`);
          return { endpoint: ep, requestId: reqId };
        }
      }
      const err = await r.text();
      await logFn("warn", `I2V ${ep.name} → ${r.status}: ${err.substring(0, 150)}`);
    } catch (e) {
      await logFn("warn", `I2V ${ep.name} erro: ${(e as Error).message}`);
    }
  }
  return null;
}

// ── ElevenLabs narration ────────────────────────────────────
async function generateNarration(script: string, apiKey: string, supabase: ReturnType<typeof createClient>, promoId: string): Promise<string> {
  const voiceId = "nPczCjzI2devNBz1zQrb";
  await log(supabase, "info", `Gerando narração: ${script.substring(0, 80)}...`);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: script, model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.25, similarity_boost: 0.85, style: 1.0, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).substring(0, 300)}`);

  const buf = new Uint8Array(await res.arrayBuffer());
  const fileName = `narrations/${promoId}_${Date.now()}.mp3`;
  const { error } = await supabase.storage.from("videos").upload(fileName, buf, { contentType: "audio/mpeg", upsert: true });
  if (error) {
    await supabase.storage.createBucket("videos", { public: true }).catch(() => {});
    const r2 = await supabase.storage.from("videos").upload(fileName, buf, { contentType: "audio/mpeg", upsert: true });
    if (r2.error) throw r2.error;
  }
  const url = supabase.storage.from("videos").getPublicUrl(fileName).data.publicUrl;
  await log(supabase, "success", `Narração salva: ${url}`);
  return url;
}

// ── Creatomate composition ──────────────────────────────────
function buildCreatomatePayload(
  videoPartAUrl: string, videoPartBUrl: string, narrationUrl: string | null,
  ov: { destino: string; preco: string; preco_normal: string; desconto: string; cia: string; escalas: string; tipo: string }
) {
  const elements: Record<string, unknown>[] = [
    { type: "video", track: 1, source: videoPartAUrl, duration: 15, width: "100%", height: "100%", fit: "cover", animations: [{ time: "start", duration: 0.5, type: "fade", easing: "linear" }] },
    { type: "video", track: 1, source: videoPartBUrl, duration: 16, width: "100%", height: "100%", fit: "cover", animations: [{ time: "start", duration: 1, transition: true, type: "fade", easing: "linear" }] },
    { type: "text", track: 3, text: "PromoCéu ✈️", time: 0, duration: 30, x: "50%", y: "6%", width: "60%", height: "auto", x_alignment: 50, y_alignment: 50, fill_color: "#FFFFFF", font_family: "Montserrat", font_weight: 700, font_size: "5.5 vmin", shadow_color: "rgba(0,0,0,0.7)", shadow_blur: 8, shadow_x: 2, shadow_y: 2, opacity: "90%" },
    { type: "text", track: 3, text: ov.desconto + " OFF", time: 1, duration: 8, x: "50%", y: "15%", width: "40%", height: "auto", x_alignment: 50, y_alignment: 50, fill_color: "#FF0000", background_color: "#FFFF00", background_x_padding: "15%", background_y_padding: "10%", background_border_radius: "8", font_family: "Montserrat", font_weight: 900, font_size: "7 vmin", animations: [{ time: "start", duration: 0.6, type: "text-slide", direction: "down", easing: "quadratic-out" }, { time: 7, duration: 0.5, type: "fade", reversed: true }] },
    { type: "text", track: 3, text: ov.destino.toUpperCase(), time: 18, duration: 12, x: "50%", y: "70%", width: "90%", height: "auto", x_alignment: 50, y_alignment: 50, fill_color: "#FFFFFF", font_family: "Montserrat", font_weight: 900, font_size: "10 vmin", shadow_color: "rgba(0,0,0,0.8)", shadow_blur: 12, shadow_x: 3, shadow_y: 3, animations: [{ time: "start", duration: 0.7, type: "text-slide", direction: "up", easing: "quadratic-out" }] },
    { type: "text", track: 3, text: ov.preco, time: 20, duration: 10, x: "50%", y: "80%", width: "80%", height: "auto", x_alignment: 50, y_alignment: 50, fill_color: "#00FF88", font_family: "Montserrat", font_weight: 900, font_size: "12 vmin", shadow_color: "rgba(0,0,0,0.8)", shadow_blur: 10, shadow_x: 2, shadow_y: 2, animations: [{ time: "start", duration: 0.5, type: "fade", easing: "quadratic-out" }] },
    { type: "text", track: 3, text: "de " + ov.preco_normal, time: 20, duration: 10, x: "50%", y: "75%", width: "60%", height: "auto", x_alignment: 50, y_alignment: 50, fill_color: "rgba(255,255,255,0.7)", font_family: "Montserrat", font_weight: 400, font_size: "4.5 vmin", font_style: "normal", text_decoration: "line-through" },
    { type: "text", track: 3, text: ov.cia + " • " + ov.escalas + " • " + ov.tipo, time: 22, duration: 8, x: "50%", y: "88%", width: "85%", height: "auto", x_alignment: 50, y_alignment: 50, fill_color: "#FFFFFF", font_family: "Montserrat", font_weight: 600, font_size: "4 vmin", shadow_color: "rgba(0,0,0,0.6)", shadow_blur: 6, animations: [{ time: "start", duration: 0.4, type: "fade" }] },
    { type: "text", track: 3, text: "🔥 Link na bio • PromoCéu", time: 25, duration: 5, x: "50%", y: "94%", width: "85%", height: "auto", x_alignment: 50, y_alignment: 50, fill_color: "#FFFFFF", background_color: "rgba(0,0,0,0.6)", background_x_padding: "10%", background_y_padding: "8%", background_border_radius: "20", font_family: "Montserrat", font_weight: 700, font_size: "4.5 vmin", animations: [{ time: "start", duration: 0.5, type: "text-slide", direction: "up", easing: "quadratic-out" }] },
  ];

  if (narrationUrl) {
    elements.splice(2, 0, { type: "audio", track: 2, source: narrationUrl, volume: 85, audio_fade_in: 0.3, audio_fade_out: 0.5 });
  }

  return { output_format: "mp4" as const, width: 1080, height: 1920, frame_rate: 30, elements };
}

async function composeWithCreatomate(payload: Record<string, unknown>, apiKey: string, supabase: ReturnType<typeof createClient>): Promise<string> {
  await log(supabase, "info", "Submetendo composição Creatomate 1080x1920...");

  const r = await fetch("https://api.creatomate.com/v2/renders", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Creatomate ${r.status}: ${err.substring(0, 500)}`);
  }

  const renders = await r.json();
  const render = Array.isArray(renders) ? renders[0] : renders;
  if (render.status === "succeeded" && render.url) return render.url;

  const renderId = render.id;
  if (!renderId) throw new Error("Creatomate sem render ID");

  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const check = await fetch(`https://api.creatomate.com/v2/renders/${renderId}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });
    const st = await check.json();
    if (i % 6 === 0) await log(supabase, "info", `Creatomate poll ${i + 1}/60: ${st.status}`);
    if (st.status === "succeeded") return st.url;
    if (st.status === "failed") throw new Error("Creatomate falhou: " + JSON.stringify(st.error_message || st).substring(0, 300));
  }
  throw new Error("Creatomate timeout (5min)");
}

// ── MAIN ────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json().catch(() => ({}));
    const promoId = body?.promocao_id || body?.promoId;
    if (!promoId) throw new Error("promocao_id é obrigatório");

    const HF_KEY = Deno.env.get("HF_API_KEY");
    const HF_SECRET = Deno.env.get("HF_API_SECRET");
    const EL_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const CREAT_KEY = Deno.env.get("CREATOMATE_API_KEY");

    if (!HF_KEY || !HF_SECRET) throw new Error("HF_API_KEY ou HF_API_SECRET não configurados");
    if (!EL_KEY) throw new Error("ELEVENLABS_API_KEY não configurada");
    if (!CREAT_KEY) throw new Error("CREATOMATE_API_KEY não configurada");

    const higgsAuth = `Key ${HF_KEY}:${HF_SECRET}`;
    const higgsHeaders = { "Authorization": higgsAuth, "Content-Type": "application/json" };
    const logFn = (t: string, m: string) => log(supabase, t, m);

    await log(supabase, "info", `VideoMaker v10 iniciando para promo ${promoId}`);

    // Load promo
    const { data: promo, error: pErr } = await supabase.from("promocoes").select("*").eq("id", promoId).single();
    if (pErr || !promo) throw new Error("Promo não encontrada: " + pErr?.message);

    // Parse storyboard
    const pv = promo.prompt_variations as Record<string, unknown> | null;
    const storyboard = (pv?.storyboard || pv) as Record<string, unknown>;
    const partA = (storyboard?.part_a || (storyboard?.parts as unknown[])?.[0]) as { prompt: string; motion_prompt?: string; duration?: number } | undefined;
    const partB = (storyboard?.part_b || (storyboard?.parts as unknown[])?.[1]) as { prompt: string; motion_prompt?: string; duration?: number } | undefined;
    const narrationScript = (storyboard?.narration_script || pv?.narration_script) as string | undefined;

    if (!partA?.prompt || !partB?.prompt) throw new Error("Storyboard incompleto: part_a.prompt e part_b.prompt obrigatórios");
    if (!narrationScript) throw new Error("narration_script ausente");

    // Create video record
    const { data: videoRec, error: insErr } = await supabase.from("videos").insert({
      promocao_id: promoId, variation_label: "Story 30s", status: "gerando",
      storyboard: storyboard,
      payload: { partA, partB },
    }).select().single();
    if (insErr) throw new Error("Insert video: " + insErr.message);
    const videoId = videoRec.id;

    await supabase.from("promocoes").update({ status: "em_producao" }).eq("id", promoId);

    // ═══ FASE 1: Discover T2I and generate images ═══
    const t2iEndpoint = await discoverT2I(higgsHeaders, logFn);
    if (!t2iEndpoint) throw new Error("Nenhum modelo T2I disponível no Higgsfield. Verifique créditos e API key.");

    await log(supabase, "info", `Gerando imagens via ${t2iEndpoint.name}...`);

    const [imgReqA, imgReqB] = await Promise.all([
      submitToHiggsfield(t2iEndpoint.path, t2iEndpoint.body(partA.prompt), higgsHeaders),
      submitToHiggsfield(t2iEndpoint.path, t2iEndpoint.body(partB.prompt), higgsHeaders),
    ]);

    await log(supabase, "success", `T2I submetido — A: ${imgReqA}, B: ${imgReqB}`);

    // Poll images (timeout 90s)
    const imgStart = Date.now();
    let imageUrlA: string | null = null;
    let imageUrlB: string | null = null;

    while (Date.now() - imgStart < 90000) {
      await new Promise(r => setTimeout(r, 3000));

      if (!imageUrlA) {
        const rA = await pollHiggsfield(imgReqA, higgsAuth);
        if (rA.status === "completed" && rA.imageUrl) imageUrlA = rA.imageUrl;
        if (rA.status === "failed") throw new Error("Imagem A falhou: " + rA.error);
      }
      if (!imageUrlB) {
        const rB = await pollHiggsfield(imgReqB, higgsAuth);
        if (rB.status === "completed" && rB.imageUrl) imageUrlB = rB.imageUrl;
        if (rB.status === "failed") throw new Error("Imagem B falhou: " + rB.error);
      }
      if (imageUrlA && imageUrlB) break;
    }

    if (!imageUrlA || !imageUrlB) throw new Error(`Timeout T2I (90s). A: ${imageUrlA ? "ok" : "pendente"}, B: ${imageUrlB ? "ok" : "pendente"}`);
    await log(supabase, "success", `Imagens prontas!`);

    // ═══ FASE 2: Discover I2V and animate images ═══
    const motionA = partA.motion_prompt || "Slow cinematic dolly forward through the scene, subtle ambient motion";
    const motionB = partB.motion_prompt || "Smooth orbit camera movement around the subject, gentle ambient motion";

    // Discover I2V using image A — this first request IS Part A
    const i2vDiscovery = await discoverI2V(imageUrlA, motionA, higgsHeaders, logFn);
    if (!i2vDiscovery) throw new Error("Nenhum modelo I2V disponível. Testados: " + I2V_ENDPOINTS.map(e => e.name).join(", "));

    const partAVideoReqId = i2vDiscovery.requestId;
    const i2vEp = i2vDiscovery.endpoint;

    // Submit Part B with same endpoint
    const partBVideoReqId = await submitToHiggsfield(i2vEp.path, i2vEp.body(imageUrlB, motionB), higgsHeaders);
    await log(supabase, "success", `I2V submetido via ${i2vEp.name} — A: ${partAVideoReqId}, B: ${partBVideoReqId}`);

    // Generate narration in parallel
    let narrationUrl: string | null = null;
    try {
      narrationUrl = await generateNarration(narrationScript, EL_KEY, supabase, promoId);
    } catch (e) {
      await log(supabase, "warn", `Narração falhou: ${(e as Error).message} — continuando sem`);
    }

    // Save state
    await supabase.from("videos").update({
      status: "aguardando_render",
      narration_url: narrationUrl,
      payload: {
        provider: "higgsfield",
        t2i_model: t2iEndpoint.name,
        i2v_model: i2vEp.name,
        partA: { ...partA, image_url: imageUrlA, request_id: partAVideoReqId },
        partB: { ...partB, image_url: imageUrlB, request_id: partBVideoReqId },
        narration_url: narrationUrl,
        overlay_config: storyboard?.overlay_config,
        narration_script: narrationScript,
      },
    }).eq("id", videoId);

    // ═══ FASE 3: Poll videos (timeout 240s) ═══
    const vidStart = Date.now();
    let videoUrlA: string | null = null;
    let videoUrlB: string | null = null;

    await log(supabase, "info", `Polling vídeos I2V (timeout: 240s)...`);

    while (Date.now() - vidStart < 240000) {
      await new Promise(r => setTimeout(r, 8000));
      const elapsed = Math.round((Date.now() - vidStart) / 1000);

      if (!videoUrlA) {
        const rA = await pollHiggsfield(partAVideoReqId, higgsAuth);
        if (rA.status === "completed" && rA.videoUrl) { videoUrlA = rA.videoUrl; await log(supabase, "success", `[A] Vídeo pronto! ${elapsed}s`); }
        else if (rA.status === "failed") throw new Error("[A] I2V falhou: " + rA.error);
      }
      if (!videoUrlB) {
        const rB = await pollHiggsfield(partBVideoReqId, higgsAuth);
        if (rB.status === "completed" && rB.videoUrl) { videoUrlB = rB.videoUrl; await log(supabase, "success", `[B] Vídeo pronto! ${elapsed}s`); }
        else if (rB.status === "failed") throw new Error("[B] I2V falhou: " + rB.error);
      }

      if (videoUrlA && videoUrlB) break;
      if (elapsed % 30 < 10) await log(supabase, "info", `Polling ${elapsed}s — A: ${videoUrlA ? "✅" : "⏳"}, B: ${videoUrlB ? "✅" : "⏳"}`);
    }

    if (!videoUrlA || !videoUrlB) {
      await supabase.from("videos").update({
        status: "timeout_render",
        payload: {
          partA: { request_id: partAVideoReqId, video_url: videoUrlA },
          partB: { request_id: partBVideoReqId, video_url: videoUrlB },
          narration_url: narrationUrl,
        },
      }).eq("id", videoId);
      await log(supabase, "warn", `Timeout. A: ${videoUrlA ? "ok" : "pendente"}, B: ${videoUrlB ? "ok" : "pendente"}`);
      return new Response(JSON.stringify({ status: "timeout", videoId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Upload scenes to storage
    const [storedA, storedB] = await Promise.all([
      uploadToStorage(supabase, videoUrlA, `scenes/${promoId}_A_${Date.now()}.mp4`, "video/mp4"),
      uploadToStorage(supabase, videoUrlB, `scenes/${promoId}_B_${Date.now()}.mp4`, "video/mp4"),
    ]);

    await supabase.from("videos").update({ scene_video_url: storedA, status: "compondo" }).eq("id", videoId);

    // ═══ FASE 4: Creatomate composition ═══
    await log(supabase, "info", "Compondo vídeo final 1080x1920...");

    const overlayData = {
      destino: (promo.destino as string)?.split("(")?.[0]?.trim() || promo.destino || "",
      preco: `R$ ${Number(promo.preco_cliente || promo.preco).toLocaleString("pt-BR")}`,
      preco_normal: `R$ ${Number(promo.preco_normal || promo.preco).toLocaleString("pt-BR")}`,
      desconto: promo.pct_desconto ? `${promo.pct_desconto}%` : `${Math.round((1 - Number(promo.preco) / Number(promo.preco_normal || promo.preco)) * 100)}%`,
      cia: (promo.cia_aerea as string) || "",
      escalas: (promo.escalas as string) || "Direto",
      tipo: (promo.tipo_voo as string) || "ida e volta",
    };

    const creatPayload = buildCreatomatePayload(storedA, storedB, narrationUrl, overlayData);
    const finalUrl = await composeWithCreatomate(creatPayload as unknown as Record<string, unknown>, CREAT_KEY, supabase);
    const storedFinal = await uploadToStorage(supabase, finalUrl, `finals/${promoId}_${Date.now()}.mp4`, "video/mp4");

    await supabase.from("videos").update({
      video_url: storedA, video_final_url: storedFinal, narration_url: narrationUrl,
      status: "pronto", erro_detalhes: null,
    }).eq("id", videoId);
    await supabase.from("promocoes").update({ status: "video_pronto" }).eq("id", promoId);
    await log(supabase, "success", `✅ Vídeo PRONTO: ${storedFinal}`);

    return new Response(JSON.stringify({ status: "pronto", videoId, videoUrl: storedFinal }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = (error as Error).message;
    console.error("VIDEOMAKER CRASH:", msg);
    await log(supabase, "error", `CRASH: ${msg}`);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
