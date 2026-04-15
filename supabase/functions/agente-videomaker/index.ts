import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HIGGSFIELD_BASE = "https://platform.higgsfield.ai";

// ── T2V endpoints (priority order) ──────────────────────────
const T2V_ENDPOINTS = [
  {
    name: "Kling 2.1 Pro T2V",
    path: "/api/v1/kling-video/v2.1/pro/text-to-video",
    body: (prompt: string, duration: number) => ({
      prompt, duration: String(duration), aspect_ratio: "9:16", cfg_scale: 0.5,
    }),
  },
  {
    name: "Kling 2.1 Std T2V",
    path: "/api/v1/kling-video/v2.1/standard/text-to-video",
    body: (prompt: string, duration: number) => ({
      prompt, duration: String(duration), aspect_ratio: "9:16", cfg_scale: 0.5,
    }),
  },
  {
    name: "Wan 2.1 T2V",
    path: "/api/v1/wan/v2.1/text-to-video",
    body: (prompt: string, duration: number) => ({
      prompt, resolution: "720p", aspect_ratio: "9:16", duration: String(duration),
    }),
  },
  {
    name: "Seedance 1.0 T2V",
    path: "/api/v1/bytedance/seedance/v1/pro/text-to-video",
    body: (prompt: string, duration: number) => ({
      prompt, duration: String(duration), aspect_ratio: "9:16",
    }),
  },
];

// ── I2V endpoints (fallback) ────────────────────────────────
const I2V_ENDPOINTS = [
  {
    name: "Seedance v1 Pro I2V",
    path: "/api/v1/bytedance/seedance/v1/pro/image-to-video",
    body: (imageUrl: string, prompt: string, duration: number) => ({
      image_url: imageUrl, prompt, duration: String(duration), aspect_ratio: "9:16",
    }),
  },
  {
    name: "Kling 2.1 Pro I2V",
    path: "/api/v1/kling-video/v2.1/pro/image-to-video",
    body: (imageUrl: string, prompt: string, duration: number) => ({
      image_url: imageUrl, prompt, duration: String(duration), aspect_ratio: "9:16",
    }),
  },
];

const IMAGE_ENDPOINT = {
  path: "/api/v1/bytedance/seedream/v4/text-to-image",
  body: (prompt: string) => ({
    prompt, aspect_ratio: "9:16", seed: Math.floor(Math.random() * 999999),
  }),
};

// ── Helpers ─────────────────────────────────────────────────
function extractId(data: Record<string, unknown>): string | null {
  return (data?.id || data?.request_id || (data?.data as Record<string, unknown>)?.id || null) as string | null;
}

function extractVideoUrl(r: Record<string, unknown>): string | null {
  const d = r?.data as Record<string, unknown> | undefined;
  const o = (r?.output || d?.output) as Record<string, unknown> | undefined;
  const res = r?.result as Record<string, unknown> | undefined;
  return (
    (r?.video as Record<string, unknown>)?.url ||
    ((r?.videos as Record<string, unknown>[])?.[0])?.url ||
    d?.video_url || o?.video_url || res?.url || res?.video_url || r?.url || null
  ) as string | null;
}

function extractImageUrl(r: Record<string, unknown>): string | null {
  const d = r?.data as Record<string, unknown> | undefined;
  const o = (r?.output || d?.output) as Record<string, unknown> | undefined;
  const res = r?.result as Record<string, unknown> | undefined;
  return (
    (r?.image as Record<string, unknown>)?.url ||
    ((r?.images as Record<string, unknown>[])?.[0])?.url ||
    d?.image_url || o?.image_url || res?.url || res?.image_url || r?.url || null
  ) as string | null;
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

// ── Discover working T2V endpoint ───────────────────────────
async function discoverT2V(headers: Record<string, string>, logFn: (t: string, m: string) => Promise<void>): Promise<typeof T2V_ENDPOINTS[0] | null> {
  for (const ep of T2V_ENDPOINTS) {
    try {
      await logFn("info", `Testando T2V: ${ep.name}`);
      const r = await fetch(`${HIGGSFIELD_BASE}${ep.path}`, {
        method: "POST", headers,
        body: JSON.stringify(ep.body("Test prompt for model discovery", 5)),
      });
      if (r.ok || r.status === 201 || r.status === 202) {
        await logFn("success", `T2V disponível: ${ep.name}`);
        return ep;
      }
      const err = await r.text();
      await logFn("warn", `T2V ${ep.name} → ${r.status}: ${err.substring(0, 150)}`);
    } catch (e) {
      await logFn("warn", `T2V ${ep.name} erro: ${(e as Error).message}`);
    }
  }
  return null;
}

// ── Submit T2V job ──────────────────────────────────────────
async function submitT2V(ep: typeof T2V_ENDPOINTS[0], prompt: string, duration: number, headers: Record<string, string>): Promise<{ requestId: string; endpoint: string }> {
  const r = await fetch(`${HIGGSFIELD_BASE}${ep.path}`, {
    method: "POST", headers, body: JSON.stringify(ep.body(prompt, duration)),
  });
  if (!r.ok) throw new Error(`T2V ${ep.name} failed: ${r.status} ${(await r.text()).substring(0, 200)}`);
  const data = await r.json();
  const id = extractId(data);
  if (!id) throw new Error(`T2V ${ep.name} no request_id: ${JSON.stringify(data).substring(0, 200)}`);
  return { requestId: id, endpoint: ep.path };
}

// ── Generate image (for I2V fallback) ───────────────────────
async function generateImage(prompt: string, headers: Record<string, string>, supabase: ReturnType<typeof createClient>): Promise<string> {
  await log(supabase, "info", `Gerando imagem: ${prompt.substring(0, 80)}...`);
  const r = await fetch(`${HIGGSFIELD_BASE}${IMAGE_ENDPOINT.path}`, {
    method: "POST", headers, body: JSON.stringify(IMAGE_ENDPOINT.body(prompt)),
  });
  if (!r.ok) throw new Error(`Seedream ${r.status}: ${(await r.text()).substring(0, 200)}`);
  const data = await r.json();
  const reqId = extractId(data);
  if (!reqId) throw new Error("Seedream no request_id");

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const check = await fetch(`${HIGGSFIELD_BASE}${IMAGE_ENDPOINT.path}/${reqId}`, { headers });
    if (!check.ok) continue;
    const result = await check.json();
    const url = extractImageUrl(result);
    if (url) return url;
    const st = ((result.status || result.data?.status || "") as string).toLowerCase();
    if (["failed", "error"].includes(st)) throw new Error("Image gen failed");
  }
  throw new Error("Image gen timeout (90s)");
}

// ── Submit I2V job ──────────────────────────────────────────
async function submitI2V(imageUrl: string, prompt: string, duration: number, headers: Record<string, string>, logFn: (t: string, m: string) => Promise<void>): Promise<{ requestId: string; endpoint: string }> {
  for (const ep of I2V_ENDPOINTS) {
    try {
      await logFn("info", `I2V tentando: ${ep.name}`);
      const r = await fetch(`${HIGGSFIELD_BASE}${ep.path}`, {
        method: "POST", headers, body: JSON.stringify(ep.body(imageUrl, prompt, duration)),
      });
      if (!r.ok) {
        await logFn("warn", `I2V ${ep.name} → ${r.status}`);
        continue;
      }
      const data = await r.json();
      const id = extractId(data);
      if (!id) continue;
      await logFn("success", `I2V aceito: ${ep.name}, ID: ${id}`);
      return { requestId: id, endpoint: ep.path };
    } catch (e) {
      await logFn("warn", `I2V ${ep.name} erro: ${(e as Error).message}`);
    }
  }
  throw new Error("Todos os modelos I2V falharam");
}

// ── ElevenLabs narration ────────────────────────────────────
async function generateNarration(script: string, apiKey: string, supabase: ReturnType<typeof createClient>, promoId: string): Promise<string> {
  const voiceId = "nPczCjzI2devNBz1zQrb";
  await log(supabase, "info", `Gerando narração: ${script.substring(0, 80)}...`);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: script,
      model_id: "eleven_multilingual_v2",
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
    // Track 1: Videos with crossfade
    {
      type: "video", track: 1, source: videoPartAUrl, duration: 15,
      width: "100%", height: "100%", fit: "cover",
      animations: [{ time: "start", duration: 0.5, type: "fade", easing: "linear" }],
    },
    {
      type: "video", track: 1, source: videoPartBUrl, duration: 16,
      width: "100%", height: "100%", fit: "cover",
      animations: [{ time: "start", duration: 1, transition: true, type: "fade", easing: "linear" }],
    },
    // Track 3: Overlays
    { type: "text", track: 3, text: "PromoCéu ✈️", time: 0, duration: 30, x: "50%", y: "6%", width: "60%", height: "auto", x_alignment: "center", y_alignment: "center", fill_color: "#FFFFFF", font_family: "Montserrat", font_weight: 700, font_size: "5.5 vmin", shadow_color: "rgba(0,0,0,0.7)", shadow_blur: 8, shadow_x: 2, shadow_y: 2, opacity: "90%" },
    { type: "text", track: 3, text: ov.desconto + " OFF", time: 1, duration: 8, x: "50%", y: "15%", width: "40%", height: "auto", x_alignment: "center", y_alignment: "center", fill_color: "#FF0000", background_color: "#FFFF00", background_x_padding: "15%", background_y_padding: "10%", background_border_radius: "8", font_family: "Montserrat", font_weight: 900, font_size: "7 vmin", animations: [{ time: "start", duration: 0.6, type: "text-slide", direction: "down", easing: "quadratic-out" }, { time: 7, duration: 0.5, type: "fade", reversed: true }] },
    { type: "text", track: 3, text: ov.destino.toUpperCase(), time: 18, duration: 12, x: "50%", y: "70%", width: "90%", height: "auto", x_alignment: "center", y_alignment: "center", fill_color: "#FFFFFF", font_family: "Montserrat", font_weight: 900, font_size: "10 vmin", shadow_color: "rgba(0,0,0,0.8)", shadow_blur: 12, shadow_x: 3, shadow_y: 3, animations: [{ time: "start", duration: 0.7, type: "text-slide", direction: "up", easing: "quadratic-out" }] },
    { type: "text", track: 3, text: ov.preco, time: 20, duration: 10, x: "50%", y: "80%", width: "80%", height: "auto", x_alignment: "center", y_alignment: "center", fill_color: "#00FF88", font_family: "Montserrat", font_weight: 900, font_size: "12 vmin", shadow_color: "rgba(0,0,0,0.8)", shadow_blur: 10, shadow_x: 2, shadow_y: 2, animations: [{ time: "start", duration: 0.5, type: "fade", easing: "quadratic-out" }] },
    { type: "text", track: 3, text: "de " + ov.preco_normal, time: 20, duration: 10, x: "50%", y: "75%", width: "60%", height: "auto", x_alignment: "center", y_alignment: "center", fill_color: "rgba(255,255,255,0.7)", font_family: "Montserrat", font_weight: 400, font_size: "4.5 vmin", font_style: "normal", text_decoration: "line-through" },
    { type: "text", track: 3, text: ov.cia + " • " + ov.escalas + " • " + ov.tipo, time: 22, duration: 8, x: "50%", y: "88%", width: "85%", height: "auto", x_alignment: "center", y_alignment: "center", fill_color: "#FFFFFF", font_family: "Montserrat", font_weight: 600, font_size: "4 vmin", shadow_color: "rgba(0,0,0,0.6)", shadow_blur: 6, animations: [{ time: "start", duration: 0.4, type: "fade" }] },
    { type: "text", track: 3, text: "🔥 Link na bio • PromoCéu", time: 25, duration: 5, x: "50%", y: "94%", width: "85%", height: "auto", x_alignment: "center", y_alignment: "center", fill_color: "#FFFFFF", background_color: "rgba(0,0,0,0.6)", background_x_padding: "10%", background_y_padding: "8%", background_border_radius: "20", font_family: "Montserrat", font_weight: 700, font_size: "4.5 vmin", animations: [{ time: "start", duration: 0.5, type: "text-slide", direction: "up", easing: "quadratic-out" }] },
  ];

  // Track 2: Narration
  if (narrationUrl) {
    elements.splice(2, 0, {
      type: "audio", track: 2, source: narrationUrl, volume: 85,
      audio_fade_in: 0.3, audio_fade_out: 0.5,
    });
  }

  return { output_format: "mp4" as const, width: 1080, height: 1920, frame_rate: 30, elements };
}

async function composeWithCreatomate(payload: Record<string, unknown>, supabase: ReturnType<typeof createClient>): Promise<string> {
  const key = Deno.env.get("CREATOMATE_API_KEY");
  if (!key) throw new Error("CREATOMATE_API_KEY não configurada");

  await log(supabase, "info", "Submetendo composição Creatomate 1080x1920...");

  const r = await fetch("https://api.creatomate.com/v2/renders", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
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
      headers: { "Authorization": `Bearer ${key}` },
    });
    const st = await check.json();
    if (i % 6 === 0) await log(supabase, "info", `Creatomate poll ${i + 1}/60: ${st.status}`);
    if (st.status === "succeeded") return st.url;
    if (st.status === "failed") throw new Error("Creatomate falhou: " + JSON.stringify(st.error_message || st).substring(0, 300));
  }
  throw new Error("Creatomate timeout (5min)");
}

// ── Polling Higgsfield ──────────────────────────────────────
async function pollHiggsfield(requestId: string, endpointPath: string, headers: Record<string, string>): Promise<{ status: string; videoUrl?: string; error?: string }> {
  const urls = [
    `${HIGGSFIELD_BASE}${endpointPath}/${requestId}`,
    `${HIGGSFIELD_BASE}/api/v1/generation/${requestId}`,
    `${HIGGSFIELD_BASE}/api/v1/generations/${requestId}`,
    `${HIGGSFIELD_BASE}/api/v1/requests/${requestId}/status`,
  ];
  for (const url of urls) {
    try {
      const r = await fetch(url, { headers });
      if (!r.ok) continue;
      const result = await r.json();
      const st = ((result.status || result.data?.status || "") as string).toLowerCase();
      if (["completed", "done", "succeed", "succeeded", "finished"].includes(st)) {
        const v = extractVideoUrl(result);
        if (v) return { status: "completed", videoUrl: v };
      }
      if (["failed", "error"].includes(st)) return { status: "failed", error: JSON.stringify(result).substring(0, 300) };
      return { status: st || "in_progress" };
    } catch (_) { continue; }
  }
  return { status: "in_progress" };
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

    if (!HF_KEY || !HF_SECRET) throw new Error("HF_API_KEY ou HF_API_SECRET não configurados");
    if (!EL_KEY) throw new Error("ELEVENLABS_API_KEY não configurada");
    if (!Deno.env.get("CREATOMATE_API_KEY")) throw new Error("CREATOMATE_API_KEY não configurada");

    const higgsHeaders = { "Authorization": `Key ${HF_KEY}:${HF_SECRET}`, "Content-Type": "application/json" };
    const logFn = (t: string, m: string) => log(supabase, t, m);

    await log(supabase, "info", `VideoMaker v9 iniciando para promo ${promoId}`);

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
      payload: { partA, partB, storyboard },
    }).select().single();
    if (insErr) throw new Error("Insert video: " + insErr.message);
    const videoId = videoRec.id;

    await supabase.from("promocoes").update({ status: "em_producao" }).eq("id", promoId);

    // ═══ FASE 1: Discover T2V or fallback to I2V ═══
    const t2vEndpoint = await discoverT2V(higgsHeaders, logFn);
    let partAJob: { requestId: string; endpoint: string };
    let partBJob: { requestId: string; endpoint: string };
    let useT2V = false;

    if (t2vEndpoint) {
      useT2V = true;
      await log(supabase, "info", `Usando T2V: ${t2vEndpoint.name}`);
      [partAJob, partBJob] = await Promise.all([
        submitT2V(t2vEndpoint, partA.prompt, partA.duration || 10, higgsHeaders),
        submitT2V(t2vEndpoint, partB.prompt, partB.duration || 10, higgsHeaders),
      ]);
      await log(supabase, "success", `T2V submetido — A: ${partAJob.requestId}, B: ${partBJob.requestId}`);
    } else {
      await log(supabase, "info", "Nenhum T2V disponível, usando I2V fallback");
      const [imgA, imgB] = await Promise.all([
        generateImage(partA.prompt, higgsHeaders, supabase),
        generateImage(partB.prompt, higgsHeaders, supabase),
      ]);
      [partAJob, partBJob] = await Promise.all([
        submitI2V(imgA, partA.motion_prompt || partA.prompt, partA.duration || 10, higgsHeaders, logFn),
        submitI2V(imgB, partB.motion_prompt || partB.prompt, partB.duration || 10, higgsHeaders, logFn),
      ]);
      await log(supabase, "success", `I2V submetido — A: ${partAJob.requestId}, B: ${partBJob.requestId}`);
    }

    // ═══ Narration in parallel ═══
    let narrationUrl: string | null = null;
    try {
      narrationUrl = await generateNarration(narrationScript, EL_KEY, supabase, promoId);
    } catch (e) {
      await log(supabase, "warn", `Narração falhou: ${(e as Error).message} — continuando sem`);
    }

    // Save request IDs
    await supabase.from("videos").update({
      status: "aguardando_render",
      narration_url: narrationUrl,
      payload: {
        partA: { ...partA, request_id: partAJob.requestId, endpoint: partAJob.endpoint },
        partB: { ...partB, request_id: partBJob.requestId, endpoint: partBJob.endpoint },
        narration_url: narrationUrl, use_t2v: useT2V,
        overlay_config: storyboard?.overlay_config,
        narration_script: narrationScript,
      },
    }).eq("id", videoId);

    // ═══ FASE 2: Polling (max 4 min) ═══
    const POLL_TIMEOUT = 240000;
    const POLL_INTERVAL = 8000;
    const start = Date.now();
    let videoUrlA: string | null = null;
    let videoUrlB: string | null = null;

    while (Date.now() - start < POLL_TIMEOUT) {
      await new Promise(r => setTimeout(r, POLL_INTERVAL));
      const elapsed = Math.round((Date.now() - start) / 1000);

      if (!videoUrlA) {
        const rA = await pollHiggsfield(partAJob.requestId, partAJob.endpoint, higgsHeaders);
        if (rA.status === "completed") { videoUrlA = rA.videoUrl!; await log(supabase, "success", `[A] Pronta! ${elapsed}s`); }
        else if (rA.status === "failed") throw new Error("[A] Falhou: " + rA.error);
      }
      if (!videoUrlB) {
        const rB = await pollHiggsfield(partBJob.requestId, partBJob.endpoint, higgsHeaders);
        if (rB.status === "completed") { videoUrlB = rB.videoUrl!; await log(supabase, "success", `[B] Pronta! ${elapsed}s`); }
        else if (rB.status === "failed") throw new Error("[B] Falhou: " + rB.error);
      }

      if (videoUrlA && videoUrlB) break;
      if (elapsed % 30 < 10) await log(supabase, "info", `Polling ${elapsed}s — A: ${videoUrlA ? "ok" : "pending"}, B: ${videoUrlB ? "ok" : "pending"}`);
    }

    if (!videoUrlA || !videoUrlB) {
      await supabase.from("videos").update({
        status: "timeout_render",
        payload: {
          partA: { request_id: partAJob.requestId, endpoint: partAJob.endpoint, video_url: videoUrlA },
          partB: { request_id: partBJob.requestId, endpoint: partBJob.endpoint, video_url: videoUrlB },
          narration_url: narrationUrl,
        },
      }).eq("id", videoId);
      await log(supabase, "warn", `Timeout. A: ${videoUrlA ? "ok" : "pending"}, B: ${videoUrlB ? "ok" : "pending"}`);
      return new Response(JSON.stringify({ status: "timeout", videoId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Upload scenes to storage
    const [storedA, storedB] = await Promise.all([
      uploadToStorage(supabase, videoUrlA, `scenes/${promoId}_A_${Date.now()}.mp4`, "video/mp4"),
      uploadToStorage(supabase, videoUrlB, `scenes/${promoId}_B_${Date.now()}.mp4`, "video/mp4"),
    ]);

    await supabase.from("videos").update({ scene_video_url: storedA, status: "compondo" }).eq("id", videoId);

    // ═══ FASE 3: Creatomate composition ═══
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
    const finalUrl = await composeWithCreatomate(creatPayload as unknown as Record<string, unknown>, supabase);
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
