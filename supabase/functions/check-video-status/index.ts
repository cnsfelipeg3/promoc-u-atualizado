import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HIGGSFIELD_BASE = "https://platform.higgsfield.ai";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const hfApiKey = Deno.env.get("HF_API_KEY")!;
const hfApiSecret = Deno.env.get("HF_API_SECRET")!;
const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");
const creatomateKey = Deno.env.get("CREATOMATE_API_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);
const hfAuth = `Key ${hfApiKey}:${hfApiSecret}`;

async function logAgente(msg: string, tipo = "info", payload: Record<string, unknown> = {}) {
  console.log(`[check-video][${tipo}] ${msg}`);
  try { await supabase.from("logs_agentes").insert({ agente: "videomaker", mensagem: msg, tipo, payload }); } catch (_) {}
}

async function uploadToStorage(url: string, path: string, ct: string): Promise<string> {
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
async function pollScene(requestId: string): Promise<{ status: string; videoUrl?: string; error?: string }> {
  try {
    const resp = await fetch(`${HIGGSFIELD_BASE}/requests/${requestId}/status`, {
      headers: { "Authorization": hfAuth },
    });
    if (!resp.ok) return { status: "in_progress" };
    const data = await resp.json();
    const status = ((data.status || "") as string).toLowerCase();

    if (status === "completed") {
      const videoUrl = data?.video?.url || data?.videos?.[0]?.url || null;
      if (videoUrl) return { status: "completed", videoUrl };
    }
    if (status === "failed") return { status: "failed", error: JSON.stringify(data).substring(0, 300) };
    if (status === "nsfw") return { status: "failed", error: "Conteúdo bloqueado (NSFW)" };
    return { status: status || "in_progress" };
  } catch (_) {
    return { status: "in_progress" };
  }
}

async function generateNarration(script: string, promoId: string): Promise<string | null> {
  if (!elevenLabsKey || !script?.trim()) return null;
  try {
    const voiceId = "nPczCjzI2devNBz1zQrb";
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": elevenLabsKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: script, model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.25, similarity_boost: 0.85, style: 1.0, use_speaker_boost: true },
      }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    const fileName = `narrations/${promoId}_${Date.now()}.mp3`;
    const { error } = await supabase.storage.from("videos").upload(fileName, buf, { contentType: "audio/mpeg", upsert: true });
    if (error) {
      await supabase.storage.createBucket("videos", { public: true }).catch(() => {});
      await supabase.storage.from("videos").upload(fileName, buf, { contentType: "audio/mpeg", upsert: true });
    }
    return supabase.storage.from("videos").getPublicUrl(fileName).data.publicUrl;
  } catch (e) {
    await logAgente(`Narração falhou: ${(e as Error).message}`, "error");
    return null;
  }
}

function buildCreatomatePayload(
  partAUrl: string, partBUrl: string, narrationUrl: string | null,
  ov: { destino: string; preco: string; preco_normal: string; desconto: string; cia: string; escalas: string; tipo: string }
) {
  const elements: Record<string, unknown>[] = [
    { type: "video", track: 1, source: partAUrl, duration: 15, width: "100%", height: "100%", fit: "cover", animations: [{ time: "start", duration: 0.5, type: "fade", easing: "linear" }] },
    { type: "video", track: 1, source: partBUrl, duration: 16, width: "100%", height: "100%", fit: "cover", animations: [{ time: "start", duration: 1, transition: true, type: "fade", easing: "linear" }] },
    { type: "text", track: 3, text: "PromoCéu ✈️", time: 0, duration: 30, x: "50%", y: "6%", width: "60%", height: "auto", x_alignment: "center", y_alignment: "center", fill_color: "#FFFFFF", font_family: "Montserrat", font_weight: 700, font_size: "5.5 vmin", shadow_color: "rgba(0,0,0,0.7)", shadow_blur: 8, opacity: "90%" },
    { type: "text", track: 3, text: ov.desconto + " OFF", time: 1, duration: 8, x: "50%", y: "15%", width: "40%", height: "auto", x_alignment: "center", fill_color: "#FF0000", background_color: "#FFFF00", background_x_padding: "15%", background_y_padding: "10%", background_border_radius: "8", font_family: "Montserrat", font_weight: 900, font_size: "7 vmin", animations: [{ time: "start", duration: 0.6, type: "text-slide", direction: "down", easing: "quadratic-out" }] },
    { type: "text", track: 3, text: ov.destino.toUpperCase(), time: 18, duration: 12, x: "50%", y: "70%", width: "90%", height: "auto", x_alignment: "center", fill_color: "#FFFFFF", font_family: "Montserrat", font_weight: 900, font_size: "10 vmin", shadow_color: "rgba(0,0,0,0.8)", shadow_blur: 12 },
    { type: "text", track: 3, text: ov.preco, time: 20, duration: 10, x: "50%", y: "80%", width: "80%", height: "auto", x_alignment: "center", fill_color: "#00FF88", font_family: "Montserrat", font_weight: 900, font_size: "12 vmin", shadow_color: "rgba(0,0,0,0.8)", shadow_blur: 10 },
    { type: "text", track: 3, text: "de " + ov.preco_normal, time: 20, duration: 10, x: "50%", y: "75%", width: "60%", height: "auto", x_alignment: "center", fill_color: "rgba(255,255,255,0.7)", font_family: "Montserrat", font_weight: 400, font_size: "4.5 vmin", text_decoration: "line-through" },
    { type: "text", track: 3, text: ov.cia + " • " + ov.escalas + " • " + ov.tipo, time: 22, duration: 8, x: "50%", y: "88%", width: "85%", height: "auto", x_alignment: "center", fill_color: "#FFFFFF", font_family: "Montserrat", font_weight: 600, font_size: "4 vmin" },
    { type: "text", track: 3, text: "🔥 Link na bio • PromoCéu", time: 25, duration: 5, x: "50%", y: "94%", width: "85%", height: "auto", x_alignment: "center", fill_color: "#FFFFFF", background_color: "rgba(0,0,0,0.6)", background_x_padding: "10%", background_y_padding: "8%", background_border_radius: "20", font_family: "Montserrat", font_weight: 700, font_size: "4.5 vmin" },
  ];
  if (narrationUrl) {
    elements.splice(2, 0, { type: "audio", track: 2, source: narrationUrl, volume: 85, audio_fade_in: 0.3, audio_fade_out: 0.5 });
  }
  return { output_format: "mp4", width: 1080, height: 1920, frame_rate: 30, elements };
}

async function composeCreatomate(payload: Record<string, unknown>, promoId: string): Promise<string | null> {
  if (!creatomateKey) return null;
  try {
    const r = await fetch("https://api.creatomate.com/v2/renders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${creatomateKey}` },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`Creatomate ${r.status}: ${(await r.text()).substring(0, 500)}`);
    const renders = await r.json();
    const render = Array.isArray(renders) ? renders[0] : renders;
    if (render.status === "succeeded" && render.url) {
      return await uploadToStorage(render.url, `finals/${promoId}_${Date.now()}.mp4`, "video/mp4");
    }
    const renderId = render.id;
    for (let i = 0; i < 120; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const check = await fetch(`https://api.creatomate.com/v2/renders/${renderId}`, { headers: { "Authorization": `Bearer ${creatomateKey}` } });
      const st = await check.json();
      if (st.status === "succeeded") return await uploadToStorage(st.url, `finals/${promoId}_${Date.now()}.mp4`, "video/mp4");
      if (st.status === "failed") throw new Error("Creatomate falhou: " + (st.error_message || ""));
    }
    throw new Error("Creatomate timeout");
  } catch (e) {
    await logAgente(`Creatomate erro: ${(e as Error).message}`, "error");
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { data: pending } = await supabase.from("videos")
      .select("id, promocao_id, status, payload, narration_url, video_url, video_final_url, scene_video_url, promocoes(origem, destino, preco, preco_cliente, preco_normal, pct_desconto, cia_aerea, escalas, tipo_voo)")
      .in("status", ["gerando", "aguardando_render", "gerando_cena", "gerando_video", "compondo_video", "compondo", "timeout_render"]);

    if (!pending?.length) {
      return new Response(JSON.stringify({ checked: 0, message: "Nenhum pendente" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const results: { id: string; newStatus: string }[] = [];

    for (const video of pending) {
      const payload = (video.payload || {}) as Record<string, any>;
      const partA = payload.partA || payload.part_a;
      const partB = payload.partB || payload.part_b;

      if (!partA?.request_id) {
        results.push({ id: video.id, newStatus: "sem_request_id" });
        continue;
      }

      try {
        // Check Part A
        let partAUrl = partA.stored_url || partA.video_url || null;
        if (!partAUrl) {
          const rA = await pollScene(partA.request_id);
          if (rA.status === "completed" && rA.videoUrl) {
            partAUrl = await uploadToStorage(rA.videoUrl, `scenes/${video.promocao_id}_A_${Date.now()}.mp4`, "video/mp4");
            await logAgente(`[${video.id}] Parte A pronta`, "success");
          } else if (rA.status === "failed") {
            await supabase.from("videos").update({ status: "erro", erro_detalhes: "Parte A falhou: " + rA.error }).eq("id", video.id);
            results.push({ id: video.id, newStatus: "erro" });
            continue;
          } else {
            await supabase.from("videos").update({ status: "gerando_cena" }).eq("id", video.id);
            results.push({ id: video.id, newStatus: "still_" + rA.status });
            continue;
          }
        }

        // Check Part B
        let partBUrl = partB?.stored_url || partB?.video_url || null;
        if (partB?.request_id && !partBUrl) {
          const rB = await pollScene(partB.request_id);
          if (rB.status === "completed" && rB.videoUrl) {
            partBUrl = await uploadToStorage(rB.videoUrl, `scenes/${video.promocao_id}_B_${Date.now()}.mp4`, "video/mp4");
            await logAgente(`[${video.id}] Parte B pronta`, "success");
          } else if (rB.status === "failed") {
            await supabase.from("videos").update({ status: "erro", erro_detalhes: "Parte B falhou: " + rB.error }).eq("id", video.id);
            results.push({ id: video.id, newStatus: "erro" });
            continue;
          } else {
            await supabase.from("videos").update({ status: "gerando_cena" }).eq("id", video.id);
            results.push({ id: video.id, newStatus: "still_" + rB.status });
            continue;
          }
        }

        // Narration
        let narrationUrl = video.narration_url;
        if (!narrationUrl && payload.narration_script) {
          narrationUrl = await generateNarration(payload.narration_script, video.promocao_id);
          if (narrationUrl) await supabase.from("videos").update({ narration_url: narrationUrl }).eq("id", video.id);
        }

        // Compose
        if (!video.video_final_url) {
          await supabase.from("videos").update({ scene_video_url: partAUrl, video_url: partAUrl, status: "compondo_video" }).eq("id", video.id);

          const promo = (video as any).promocoes || {};
          const overlayData = {
            destino: (promo.destino || "").split("(")?.[0]?.trim() || promo.destino || "",
            preco: `R$ ${Number(promo.preco_cliente || promo.preco || 0).toLocaleString("pt-BR")}`,
            preco_normal: `R$ ${Number(promo.preco_normal || promo.preco || 0).toLocaleString("pt-BR")}`,
            desconto: promo.pct_desconto ? `${promo.pct_desconto}%` : "N/A",
            cia: promo.cia_aerea || "",
            escalas: promo.escalas || "Direto",
            tipo: promo.tipo_voo || "ida e volta",
          };

          const creatPayload = buildCreatomatePayload(partAUrl, partBUrl || partAUrl, narrationUrl, overlayData);
          const finalUrl = await composeCreatomate(creatPayload, video.promocao_id);

          if (finalUrl) {
            await supabase.from("videos").update({
              video_final_url: finalUrl, scene_video_url: partAUrl, video_url: partAUrl,
              narration_url: narrationUrl, status: "pronto", erro_detalhes: null,
              payload: { ...payload, partA: { ...partA, stored_url: partAUrl }, partB: { ...partB, stored_url: partBUrl } },
            }).eq("id", video.id);
            await supabase.from("promocoes").update({ status: "video_pronto" }).eq("id", video.promocao_id);
            await logAgente(`✅ Vídeo PRONTO: ${finalUrl}`, "success");
            results.push({ id: video.id, newStatus: "pronto" });
          } else {
            await supabase.from("videos").update({ status: "compondo_video", erro_detalhes: "Composição Creatomate falhou — retentando" }).eq("id", video.id);
            results.push({ id: video.id, newStatus: "compondo_retry" });
          }
        } else {
          results.push({ id: video.id, newStatus: "already_done" });
        }
      } catch (e) {
        await logAgente(`Erro check ${video.id}: ${(e as Error).message}`, "error");
        results.push({ id: video.id, newStatus: "check_error" });
      }
    }

    return new Response(JSON.stringify({ checked: pending.length, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    await logAgente(`CRASH: ${(e as Error).message}`, "error");
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
