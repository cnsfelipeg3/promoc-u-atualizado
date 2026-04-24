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
    body: (imageUrl: string, prompt: string) => ({ params: { model: "dop-turbo", prompt, aspect_ratio: "9:16", input_images: [{ type: "image_url", image_url: imageUrl }] } }),
  },
  {
    name: "Kling 2.1 Pro",
    path: "/kling-video/v2.1/pro/image-to-video",
    body: (imageUrl: string, prompt: string) => ({ prompt, image_url: imageUrl, duration: "5", aspect_ratio: "9:16" }),
  },
  {
    name: "DoP Standard",
    path: "/v1/image2video/dop",
    body: (imageUrl: string, prompt: string) => ({ params: { model: "dop-standard", prompt, aspect_ratio: "9:16", input_images: [{ type: "image_url", image_url: imageUrl }] } }),
  },
  {
    name: "DoP Lite",
    path: "/v1/image2video/dop",
    body: (imageUrl: string, prompt: string) => ({ params: { model: "dop-lite", prompt, aspect_ratio: "9:16", input_images: [{ type: "image_url", image_url: imageUrl }] } }),
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

// ── ElevenLabs narration (PT-BR natural) ────────────────────
async function generateNarration(script: string, apiKey: string, supabase: ReturnType<typeof createClient>, promoId: string, voiceId: string): Promise<{ url: string; durationS: number }> {
  await log(supabase, "info", `Gerando narração PT-BR (voice ${voiceId.slice(0, 8)}...): ${script.substring(0, 80)}...`);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: script,
      model_id: "eleven_turbo_v2_5",
      language_code: "pt",
      voice_settings: { stability: 0.35, similarity_boost: 0.80, style: 0.85, use_speaker_boost: true, speed: 1.0 },
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
  // Estimate duration: ~14 chars/sec in PT-BR informal speech with marcações
  const durationS = Math.max(15, Math.min(50, script.length / 14));
  await log(supabase, "success", `Narração salva: ${url} (~${durationS.toFixed(1)}s)`);
  return { url, durationS };
}

// ── Creatomate composition (DYNAMIC: N clipes, narração-driven duration) ──
function buildCreatomatePayload(
  clipUrls: string[],
  narrationUrl: string | null,
  totalDurationS: number,
  ov: { destino: string; preco: string; preco_normal: string; desconto: string; cia: string; escalas: string; tipo: string },
  textOverlays: Array<{ tempo_s: number; texto: string }>,
) {
  const N = clipUrls.length;
  const CLIP_LEN = 5;            // cada clipe Higgsfield = 5s
  const FADE = 0.5;              // crossfade entre clipes
  const STEP = CLIP_LEN - FADE;  // intervalo entre starts

  // Track 1: vídeos com crossfade
  const videoElements = clipUrls.map((url, i) => {
    const isLast = i === N - 1;
    const time = i * STEP;
    // último clipe estende pra cobrir até o fim da narração se necessário
    const duration = isLast ? Math.max(CLIP_LEN, totalDurationS - time) : CLIP_LEN;
    return {
      type: "video", track: 1, time, duration, source: url, fit: "cover",
      ...(i > 0 ? { transition: { type: "fade", duration: FADE } } : {}),
      animations: [{ type: "scale", start_scale: "100%", end_scale: "108%", time: 0, duration, easing: "linear" }],
    };
  });

  // Track 2: narração (volume 100, começa em 0.5s pra dar respiro)
  const audioElements = narrationUrl ? [{
    type: "audio", track: 2, time: 0.5, source: narrationUrl, volume: 100, duration: totalDurationS - 0.5,
  }] : [];

  // Track 3: overlays — header fixo + dinâmicos do roteiro + CTA final
  const overlayElements: Array<Record<string, unknown>> = [
    // Logo/marca topo
    {
      type: "text", track: 3, time: 0, duration: totalDurationS, text: "PromoCéu ✈️",
      font_family: "Montserrat", font_weight: "800", font_size: 52,
      fill_color: "#FFFFFF", shadow_color: "rgba(0,0,0,0.6)", shadow_blur: 8,
      x_alignment: 50, y_alignment: 8, width: 100, height: 10,
      x_padding: 2, y_padding: 1,
      background_color: "rgba(0,0,0,0.3)", background_border_radius: 12,
    },
    // Destino
    {
      type: "text", track: 3, time: 1, duration: Math.max(4, totalDurationS - 6), text: ov.destino.toUpperCase(),
      font_family: "Montserrat", font_weight: "900", font_size: 72,
      fill_color: "#FFFFFF", stroke_color: "#000000", stroke_width: 3,
      x_alignment: 50, y_alignment: 25, width: 90, height: 15,
    },
    // Badge desconto
    {
      type: "text", track: 3, time: 2, duration: Math.max(4, totalDurationS - 8), text: `-${ov.desconto} OFF`,
      font_family: "Montserrat", font_weight: "800", font_size: 36,
      fill_color: "#FFFFFF", background_color: "#FF3B30", background_border_radius: 20,
      x_alignment: 82, y_alignment: 18, width: 30, height: 6, x_padding: 3, y_padding: 1.5,
    },
    // Preço promo
    {
      type: "text", track: 3, time: 3, duration: Math.max(4, totalDurationS - 9), text: ov.preco,
      font_family: "Montserrat", font_weight: "900", font_size: 96,
      fill_color: "#00FF88", stroke_color: "#003322", stroke_width: 4,
      x_alignment: 50, y_alignment: 72, width: 90, height: 12,
    },
    // Preço normal riscado
    {
      type: "text", track: 3, time: 3, duration: Math.max(4, totalDurationS - 9), text: `de ${ov.preco_normal}`,
      font_family: "Montserrat", font_weight: "600", font_size: 32,
      fill_color: "rgba(255,255,255,0.6)", text_decoration: "line-through",
      x_alignment: 50, y_alignment: 66, width: 60, height: 5,
    },
    // Cia + escalas
    {
      type: "text", track: 3, time: 4, duration: Math.max(4, totalDurationS - 10),
      text: `${ov.cia} • ${ov.tipo} • ${ov.escalas}`,
      font_family: "Montserrat", font_weight: "600", font_size: 28,
      fill_color: "#FFFFFF", background_color: "rgba(0,0,0,0.5)", background_border_radius: 8,
      x_alignment: 50, y_alignment: 82, width: 85, height: 5, x_padding: 2, y_padding: 1,
    },
    // CTA final (últimos 6s)
    {
      type: "text", track: 3, time: Math.max(0, totalDurationS - 6), duration: 6,
      text: "🔥 ENTRE NO GRUPO PROMOCÉU 🔥",
      font_family: "Montserrat", font_weight: "800", font_size: 40,
      fill_color: "#FFFFFF", background_color: "#FF3B30", background_border_radius: 16,
      x_alignment: 50, y_alignment: 90, width: 90, height: 8, x_padding: 3, y_padding: 2,
      animations: [{ type: "scale", start_scale: "80%", end_scale: "100%", time: 0, duration: 0.5, easing: "ease-out" }],
    },
  ];

  // Overlays dinâmicos do roteiro (capados em totalDurationS)
  for (const ov2 of textOverlays.slice(0, 6)) {
    if (ov2.tempo_s >= totalDurationS - 1) continue;
    overlayElements.push({
      type: "text", track: 4, time: ov2.tempo_s, duration: 3,
      text: ov2.texto.toUpperCase(),
      font_family: "Montserrat", font_weight: "900", font_size: 56,
      fill_color: "#FFFF00", stroke_color: "#000000", stroke_width: 3,
      x_alignment: 50, y_alignment: 50, width: 90, height: 10,
      animations: [{ type: "scale", start_scale: "70%", end_scale: "100%", time: 0, duration: 0.4, easing: "ease-out" }],
    });
  }

  return {
    output_format: "mp4", width: 1080, height: 1920, frame_rate: 30,
    source: {
      output_format: "mp4", width: 1080, height: 1920, frame_rate: 30,
      duration: totalDurationS,
      elements: [...videoElements, ...audioElements, ...overlayElements],
    },
  };
}

async function composeWithCreatomate(payload: Record<string, unknown>, apiKey: string, supabase: ReturnType<typeof createClient>): Promise<string> {
  await log(supabase, "info", "Submetendo composição Creatomate 1080x1920...");

  const r = await fetch("https://api.creatomate.com/v2/renders", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify([payload]),
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

    await log(supabase, "info", `VideoMaker v11 iniciando para promo ${promoId}`);

    // Load promo
    const { data: promo, error: pErr } = await supabase.from("promocoes").select("*").eq("id", promoId).single();
    if (pErr || !promo) throw new Error("Promo não encontrada: " + pErr?.message);

    // Load voice config
    const { data: cfgRow } = await supabase.from("config_agentes").select("config").eq("agente", "orquestrador").maybeSingle();
    const voiceId = ((cfgRow?.config as Record<string, unknown>)?.elevenlabs_voice as string) || "nPczCjzI2devNBz1zQrb";

    // Parse storyboard / video_prompts
    const pv = promo.prompt_variations as Record<string, unknown> | null;
    const storyboard = (pv?.storyboard || pv) as Record<string, unknown>;
    const videoPromptsArr = (promo.video_prompts || pv?.video_prompts || null) as string[] | null;
    const partA = (storyboard?.part_a || (storyboard?.parts as unknown[])?.[0]) as { prompt: string; motion_prompt?: string } | undefined;
    const partB = (storyboard?.part_b || (storyboard?.parts as unknown[])?.[1]) as { prompt: string; motion_prompt?: string } | undefined;
    const narrationScript = (promo.narration_script || storyboard?.narration_script || pv?.narration_script) as string | undefined;

    if (!narrationScript) throw new Error("narration_script ausente");

    // Create video record
    const { data: videoRec, error: insErr } = await supabase.from("videos").insert({
      promocao_id: promoId, variation_label: "Story dinâmico", status: "gerando_narracao",
      storyboard, payload: { partA, partB, video_prompts: videoPromptsArr },
    }).select().single();
    if (insErr) throw new Error("Insert video: " + insErr.message);
    const videoId = videoRec.id;

    await supabase.from("promocoes").update({ status: "em_producao" }).eq("id", promoId);

    // ═══ FASE 0: Narração PRIMEIRO (define duração total) ═══
    let narrationUrl: string | null = null;
    let totalDuration = 30;
    try {
      const nar = await generateNarration(narrationScript, EL_KEY, supabase, promoId, voiceId);
      narrationUrl = nar.url;
      totalDuration = nar.durationS;
      await supabase.from("promocoes").update({
        audio_narracao_url: narrationUrl,
        duracao_narracao_s: totalDuration,
      }).eq("id", promoId);
    } catch (e) {
      await log(supabase, "warn", `Narração falhou: ${(e as Error).message} — usando 30s default`);
    }

    // ═══ Calcular N de clipes (cap 4 pra caber em ~150s timeout) ═══
    // N=2 cobre até ~10s, N=3 até ~14.5s, N=4 até ~19s. Estende último clipe pra cobrir resto.
    const N = Math.min(4, Math.max(2, Math.ceil(totalDuration / 9)));
    await log(supabase, "info", `Narração ${totalDuration.toFixed(1)}s → ${N} clipes Higgsfield`);

    // ═══ Resolver lista de prompts ═══
    let prompts: Array<{ prompt: string; motion: string }> = [];
    if (videoPromptsArr && videoPromptsArr.length >= N) {
      prompts = videoPromptsArr.slice(0, N).map((p, i) => ({
        prompt: p,
        motion: i === 0 ? "Slow cinematic dolly forward, subtle ambient motion"
          : i === N - 1 ? "Slow zoom out reveal, dreamy atmosphere"
          : "Smooth tracking camera, gentle parallax",
      }));
    } else if (partA?.prompt && partB?.prompt) {
      // fallback: repete part_a/part_b alternando
      for (let i = 0; i < N; i++) {
        const src = i % 2 === 0 ? partA : partB;
        prompts.push({
          prompt: src.prompt,
          motion: src.motion_prompt || (i % 2 === 0 ? "Slow dolly forward" : "Smooth orbit"),
        });
      }
    } else {
      throw new Error("Sem video_prompts[] nem storyboard.part_a/part_b — regenere o pacote");
    }

    await supabase.from("promocoes").update({ clipes_total: N, clipes_recebidos: 0 }).eq("id", promoId);

    // ═══ FASE 1: Discover T2I e gerar N imagens em paralelo ═══
    await supabase.from("videos").update({ status: "gerando_arte" }).eq("id", videoId);
    const t2iEndpoint = await discoverT2I(higgsHeaders, logFn);
    if (!t2iEndpoint) throw new Error("Nenhum modelo T2I disponível no Higgsfield. Verifique créditos.");

    await log(supabase, "info", `Submetendo ${N} imagens via ${t2iEndpoint.name}...`);
    const imgReqIds = await Promise.all(
      prompts.map(p => submitToHiggsfield(t2iEndpoint.path, t2iEndpoint.body(p.prompt), higgsHeaders))
    );
    await log(supabase, "success", `T2I submetido: ${imgReqIds.length} requests`);

    // Poll imagens (timeout 120s)
    const imgStart = Date.now();
    const imageUrls: (string | null)[] = new Array(N).fill(null);
    while (Date.now() - imgStart < 120000) {
      await new Promise(r => setTimeout(r, 3500));
      await Promise.all(imgReqIds.map(async (rid, i) => {
        if (imageUrls[i]) return;
        const r = await pollHiggsfield(rid, higgsAuth);
        if (r.status === "completed" && r.imageUrl) imageUrls[i] = r.imageUrl;
        else if (r.status === "failed") throw new Error(`Imagem #${i + 1} falhou: ${r.error}`);
      }));
      if (imageUrls.every(Boolean)) break;
    }
    if (!imageUrls.every(Boolean)) {
      throw new Error(`Timeout T2I (120s). Prontas: ${imageUrls.filter(Boolean).length}/${N}`);
    }
    await log(supabase, "success", `${N} imagens prontas`);

    // ═══ FASE 2: Discover I2V (1ª submissão) + submeter restantes ═══
    await supabase.from("videos").update({ status: "gerando_video" }).eq("id", videoId);
    const disc = await discoverI2V(imageUrls[0]!, prompts[0].motion, higgsHeaders, logFn);
    if (!disc) throw new Error("Nenhum I2V disponível. Testados: " + I2V_ENDPOINTS.map(e => e.name).join(", "));

    const videoReqIds: string[] = [disc.requestId];
    const i2vEp = disc.endpoint;
    for (let i = 1; i < N; i++) {
      const rid = await submitToHiggsfield(i2vEp.path, i2vEp.body(imageUrls[i]!, prompts[i].motion), higgsHeaders);
      videoReqIds.push(rid);
    }
    await log(supabase, "success", `I2V submetido (${i2vEp.name}): ${videoReqIds.length} requests`);

    // Poll vídeos (timeout 240s)
    const vidStart = Date.now();
    const videoUrls: (string | null)[] = new Array(N).fill(null);
    await log(supabase, "info", `Polling ${N} vídeos I2V (timeout: 240s)...`);

    while (Date.now() - vidStart < 240000) {
      await new Promise(r => setTimeout(r, 8000));
      const elapsed = Math.round((Date.now() - vidStart) / 1000);
      await Promise.all(videoReqIds.map(async (rid, i) => {
        if (videoUrls[i]) return;
        const r = await pollHiggsfield(rid, higgsAuth);
        if (r.status === "completed" && r.videoUrl) {
          videoUrls[i] = r.videoUrl;
          await log(supabase, "success", `[clipe ${i + 1}] pronto em ${elapsed}s`);
          await supabase.from("promocoes").update({ clipes_recebidos: videoUrls.filter(Boolean).length }).eq("id", promoId);
        } else if (r.status === "failed") {
          throw new Error(`[clipe ${i + 1}] I2V falhou: ${r.error}`);
        }
      }));
      if (videoUrls.every(Boolean)) break;
      if (elapsed % 30 < 10) {
        const ready = videoUrls.filter(Boolean).length;
        await log(supabase, "info", `Polling ${elapsed}s — ${ready}/${N} prontos`);
      }
    }
    if (!videoUrls.every(Boolean)) {
      const ready = videoUrls.filter(Boolean).length;
      throw new Error(`Timeout I2V (240s). Prontos: ${ready}/${N}`);
    }

    // Upload clipes pro storage
    const storedClipes = await Promise.all(
      videoUrls.map((url, i) => uploadToStorage(supabase, url!, `scenes/${promoId}_${i}_${Date.now()}.mp4`, "video/mp4"))
    );
    await supabase.from("promocoes").update({ clipes_urls: storedClipes }).eq("id", promoId);
    await supabase.from("videos").update({ scene_video_url: storedClipes[0], status: "compondo" }).eq("id", videoId);

    // ═══ FASE 4: Creatomate dinâmico ═══
    await log(supabase, "info", `Compondo vídeo final 1080x1920 com ${N} clipes + narração ${totalDuration.toFixed(1)}s...`);

    const overlayData = {
      destino: (promo.destino as string)?.split("(")?.[0]?.trim() || promo.destino || "",
      preco: `R$ ${Number(promo.preco_cliente || promo.preco).toLocaleString("pt-BR")}`,
      preco_normal: `R$ ${Number(promo.preco_normal || promo.preco).toLocaleString("pt-BR")}`,
      desconto: promo.pct_desconto ? `${promo.pct_desconto}%` : `${Math.round((1 - Number(promo.preco) / Number(promo.preco_normal || promo.preco)) * 100)}%`,
      cia: (promo.cia_aerea as string) || "",
      escalas: (promo.escalas as string) || "Direto",
      tipo: (promo.tipo_voo as string) || "ida e volta",
    };
    const textOverlaysArr = Array.isArray(promo.text_overlays) ? (promo.text_overlays as Array<{ tempo_s: number; texto: string }>) : [];

    const creatPayload = buildCreatomatePayload(storedClipes, narrationUrl, totalDuration, overlayData, textOverlaysArr);
    const finalUrl = await composeWithCreatomate(creatPayload as unknown as Record<string, unknown>, CREAT_KEY, supabase);
    const storedFinal = await uploadToStorage(supabase, finalUrl, `finals/${promoId}_${Date.now()}.mp4`, "video/mp4");

    await supabase.from("videos").update({
      video_url: storedClipes[0], video_final_url: storedFinal, narration_url: narrationUrl,
      status: "pronto", erro_detalhes: null,
    }).eq("id", videoId);
    await supabase.from("promocoes").update({
      status: "video_pronto",
      video_final_url: storedFinal,
    }).eq("id", promoId);
    await log(supabase, "success", `✅ Vídeo PRONTO (${N} clipes, ${totalDuration.toFixed(1)}s): ${storedFinal}`);

    return new Response(JSON.stringify({ status: "pronto", videoId, videoUrl: storedFinal, duration: totalDuration, clipes: N }), {
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
