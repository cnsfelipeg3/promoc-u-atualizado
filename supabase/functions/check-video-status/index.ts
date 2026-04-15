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

type SceneJob = {
  image_url?: string;
  label?: string;
  model?: string;
  prompt?: string;
  request_id?: string;
  status?: string;
  status_url?: string;
  video_url?: string;
  stored_url?: string;
  error?: string;
};

type VideoPayload = {
  storyboard?: Record<string, unknown>;
  narration_script?: string;
  overlay_config?: { overlays?: Array<{ text: string; start: number; end: number; position: string; style: string }> } | null;
  part_a?: SceneJob | null;
  part_b?: SceneJob | null;
  part_a_url?: string;
  part_b_url?: string | null;
};

async function hydrateLegacySceneJobs(video: { created_at?: string | null }, payload: VideoPayload): Promise<VideoPayload> {
  if (payload.part_a || payload.part_b || !payload.storyboard || !video.created_at) return payload;

  const storyboard = payload.storyboard as {
    part_a?: { prompt?: string };
    part_b?: { prompt?: string };
    narration_script?: string;
    overlay_config?: VideoPayload["overlay_config"];
  };

  const { data: logs } = await supabase
    .from("logs_agentes")
    .select("mensagem, payload, created_at")
    .eq("agente", "videomaker")
    .like("mensagem", "%I2V aceito via%")
    .gte("created_at", video.created_at)
    .order("created_at", { ascending: true })
    .limit(10);

  let partA = payload.part_a ?? null;
  let partB = payload.part_b ?? null;

  for (const log of logs || []) {
    const responseString = typeof (log.payload as any)?.response === "string" ? (log.payload as any).response : null;
    if (!responseString) continue;

    try {
      const parsed = JSON.parse(responseString);
      const requestId = parsed.request_id || parsed.id;
      const statusUrl = parsed.status_url || (requestId ? `https://platform.higgsfield.ai/requests/${requestId}/status` : null);
      if (!requestId || !statusUrl) continue;

      if (log.mensagem.includes("[Parte_A]")) {
        partA = {
          label: "Parte_A",
          prompt: storyboard.part_a?.prompt,
          request_id: requestId,
          status_url: statusUrl,
          status: "queued",
        };
      }

      if (log.mensagem.includes("[Parte_B]")) {
        partB = {
          label: "Parte_B",
          prompt: storyboard.part_b?.prompt,
          request_id: requestId,
          status_url: statusUrl,
          status: "queued",
        };
      }
    } catch {
      continue;
    }
  }

  return {
    ...payload,
    narration_script: payload.narration_script || storyboard.narration_script,
    overlay_config: payload.overlay_config || storyboard.overlay_config || null,
    part_a: partA,
    part_b: partB,
  };
}

async function logAgente(mensagem: string, tipo = "info", payload: Record<string, unknown> = {}) {
  console.log(`[check-video-status][${tipo}] ${mensagem}`, JSON.stringify(payload));
  await supabase.from("logs_agentes").insert({ agente: "videomaker", mensagem, tipo, payload });
}

function extractVideoUrl(data: any): string | null {
  return data?.video?.url || data?.videos?.[0]?.url || data?.images?.[0]?.url ||
    data?.output?.video_url || data?.output?.url || data?.output?.[0]?.url ||
    data?.result?.url || data?.data?.video_url || data?.video_url || data?.url || null;
}

async function uploadToStorage(url: string, path: string, contentType: string): Promise<string> {
  const videoRes = await fetch(url);
  const buffer = new Uint8Array(await videoRes.arrayBuffer());
  const upload = await supabase.storage.from("videos").upload(path, buffer, { contentType, upsert: true });
  if (upload.error) {
    await supabase.storage.createBucket("videos", { public: true }).catch(() => {});
    const retry = await supabase.storage.from("videos").upload(path, buffer, { contentType, upsert: true });
    if (retry.error) throw retry.error;
  }
  const { data } = supabase.storage.from("videos").getPublicUrl(path);
  return data.publicUrl;
}

async function generateNarration(script: string, promoId: string): Promise<string | null> {
  if (!elevenLabsKey || !script?.trim()) return null;
  try {
    const voiceId = "nPczCjzI2devNBz1zQrb";
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
    const upload = await supabase.storage.from("videos").upload(fileName, buffer, { contentType: "audio/mpeg", upsert: true });
    if (upload.error) {
      await supabase.storage.createBucket("videos", { public: true }).catch(() => {});
      const retry = await supabase.storage.from("videos").upload(fileName, buffer, { contentType: "audio/mpeg", upsert: true });
      if (retry.error) throw retry.error;
    }

    const { data } = supabase.storage.from("videos").getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err) {
    await logAgente(`Erro narração no checker: ${err instanceof Error ? err.message : String(err)}`, "error");
    return null;
  }
}

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
  if (!creatomateKey) return null;

  const elements: Record<string, unknown>[] = [
    { type: "video", track: 1, source: partAUrl, time: 0, duration: 15, fit: "cover" },
  ];

  if (partBUrl) {
    elements.push({
      type: "video", track: 1, source: partBUrl, time: 14.5, duration: 15.5, fit: "cover",
      transition: { type: "crossfade", duration: 0.5 },
    });
  }

  if (narrationUrl) {
    elements.push({ type: "audio", track: 2, source: narrationUrl, time: 0, duration: 30, volume: "90%" });
  }

  elements.push({
    type: "audio", track: 3,
    source: "https://cdn.pixabay.com/audio/2024/11/04/audio_2460e0e59a.mp3",
    time: 0, duration: 30, volume: "12%", audio_fade_out: 2.0,
  });

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
    const renderBody = {
      output_format: "mp4",
      width: 1080,
      height: 1920,
      duration: 30,
      elements,
    };
    await logAgente(`Creatomate: iniciando composição para ${promoId}`, "info", {
      partAUrl, partBUrl: partBUrl || "none", narrationUrl: narrationUrl || "none",
      overlayCount: overlayConfig?.overlays?.length || 0,
      elementCount: elements.length,
    });

    const renderResponse = await fetch("https://api.creatomate.com/v2/renders", {
      method: "POST",
      headers: { "Authorization": `Bearer ${creatomateKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(renderBody),
    });

    const responseText = await renderResponse.text();
    if (!renderResponse.ok) {
      await logAgente(`Creatomate HTTP ${renderResponse.status}: ${responseText.substring(0, 500)}`, "error");
      throw new Error(`Creatomate ${renderResponse.status}: ${responseText}`);
    }

    const renders = JSON.parse(responseText);
    const renderId = Array.isArray(renders) ? renders[0]?.id : renders?.id;
    if (!renderId) throw new Error("Creatomate sem render ID: " + responseText.substring(0, 200));
    await logAgente(`Creatomate render submetido: ${renderId}`, "info");

    // Poll for up to 10 minutes (120 x 5s)
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const check = await fetch(`https://api.creatomate.com/v2/renders/${renderId}`, {
        headers: { "Authorization": `Bearer ${creatomateKey}` },
      });
      const result = await check.json();
      if (result.status === "succeeded") {
        await logAgente(`Creatomate render ${renderId} succeeded!`, "success");
        return await uploadToStorage(result.url, `finals/${promoId}_30s_${Date.now()}.mp4`, "video/mp4");
      }
      if (result.status === "failed") throw new Error("Creatomate falhou: " + (result.error_message || ""));
    }

    throw new Error("Creatomate timeout (10min)");
  } catch (err) {
    await logAgente(`Erro composição Creatomate: ${err instanceof Error ? err.message : String(err)}`, "error", {
      partAUrl, partBUrl, narrationUrl,
    });
    return null;
  }
}

async function checkSceneJob(job: SceneJob | null | undefined, promoId: string, label: string): Promise<SceneJob | null> {
  if (!job?.request_id && !job?.status_url) return job ?? null;

  const statusUrl = job.status_url || `https://platform.higgsfield.ai/requests/${job.request_id}/status`;
  const res = await fetch(statusUrl, {
    headers: { "Authorization": hfAuthHeader },
  });
  const rawBody = await res.text();
  const data = JSON.parse(rawBody);
  const status = (data.status || data.state || "unknown").toLowerCase();

  if (["completed", "done", "succeed", "succeeded"].includes(status)) {
    const externalUrl = extractVideoUrl(data);
    if (!externalUrl) {
      return { ...job, status: "erro", error: "completed_sem_url" };
    }
    let storedUrl = externalUrl;
    try {
      storedUrl = await uploadToStorage(externalUrl, `scenes/${promoId}_${label}_${Date.now()}.mp4`, "video/mp4");
    } catch {
      storedUrl = externalUrl;
    }
    return { ...job, status: "completed", video_url: externalUrl, stored_url: storedUrl };
  }

  if (["failed", "error"].includes(status)) {
    return { ...job, status: "failed", error: data.error || data.message || "scene_failed" };
  }

  return { ...job, status };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { data: pendingVideos } = await supabase
      .from("videos")
      .select("id, created_at, higgsfield_request_id, promocao_id, video_url, video_final_url, narration_url, payload, status, promocoes(origem, destino)")
      .in("status", ["gerando_video", "gerando_cena", "gerando_narracao", "compondo_video"]);

    if (!pendingVideos?.length) {
      return new Response(JSON.stringify({ message: "Nenhum vídeo pendente", checked: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ id: string; requestId: string; newStatus: string }> = [];

    for (const video of pendingVideos) {
      let payload = (video.payload ?? {}) as VideoPayload;
      payload = await hydrateLegacySceneJobs(video, payload);
      const legacyRequestId = video.higgsfield_request_id;
      const requestId = payload.part_a?.request_id || legacyRequestId || "-";

      try {
        if (payload.part_a || payload.part_b) {
          const checkedPartA = await checkSceneJob(payload.part_a, video.promocao_id, "partA");
          const checkedPartB = await checkSceneJob(payload.part_b, video.promocao_id, "partB");

          const nextPayload: VideoPayload = {
            ...payload,
            part_a: checkedPartA,
            part_b: checkedPartB,
            part_a_url: checkedPartA?.stored_url || payload.part_a_url,
            part_b_url: checkedPartB?.stored_url || payload.part_b_url || null,
          };

          const hasFailure = checkedPartA?.status === "failed" || checkedPartB?.status === "failed";
          const partAReady = !!checkedPartA?.stored_url;
          const partBReady = !payload.part_b || !!checkedPartB?.stored_url;

          if (hasFailure) {
            const errorMessage = checkedPartA?.error || checkedPartB?.error || "Falha ao gerar cenas";
            await supabase.from("videos").update({
              status: "erro",
              erro_detalhes: errorMessage,
              payload: nextPayload,
            }).eq("id", video.id);
            results.push({ id: video.id, requestId, newStatus: "erro" });
            continue;
          }

          if (!partAReady || !partBReady) {
            await supabase.from("videos").update({
              status: "gerando_cena",
              payload: nextPayload,
            }).eq("id", video.id);
            results.push({ id: video.id, requestId, newStatus: `still_${checkedPartA?.status || checkedPartB?.status || "queued"}` });
            continue;
          }

          let narrationUrl = video.narration_url;
          if (!narrationUrl) {
            await supabase.from("videos").update({ status: "gerando_narracao", payload: nextPayload }).eq("id", video.id);
            narrationUrl = await generateNarration(payload.narration_script || "", video.promocao_id);
          }

          let finalUrl = video.video_final_url;
          if (!finalUrl) {
            await supabase.from("videos").update({
              scene_video_url: checkedPartA?.stored_url || null,
              narration_url: narrationUrl,
              status: "compondo_video",
              payload: nextPayload,
            }).eq("id", video.id);

            finalUrl = await composeInCreatomate(
              checkedPartA!.stored_url!,
              checkedPartB?.stored_url || null,
              narrationUrl,
              payload.overlay_config || null,
              video.promocao_id,
            );
          }

          // CRITICAL: Only mark as "pronto" if Creatomate composed successfully
          // Never save raw scene as video_final_url — audio MUST be baked in
          if (finalUrl) {
            await supabase.from("videos").update({
              scene_video_url: checkedPartA?.stored_url || null,
              video_url: checkedPartA?.stored_url || checkedPartA?.video_url || null,
              video_final_url: finalUrl,
              narration_url: narrationUrl,
              status: "pronto",
              payload: nextPayload,
              erro_detalhes: null,
            }).eq("id", video.id);

            await supabase.from("promocoes").update({ status: "video_pronto" }).eq("id", video.promocao_id);
            results.push({ id: video.id, requestId, newStatus: "pronto" });
            await logAgente(`Vídeo COMPOSTO pronto para ${(video as any).promocoes?.origem}→${(video as any).promocoes?.destino}`, "success", {
              videoId: video.id, requestId, finalUrl,
            });
          } else {
            // Creatomate failed — save scene + narration but DON'T mark as pronto
            await supabase.from("videos").update({
              scene_video_url: checkedPartA?.stored_url || null,
              video_url: checkedPartA?.stored_url || checkedPartA?.video_url || null,
              video_final_url: null,
              narration_url: narrationUrl,
              status: "compondo_video",
              payload: nextPayload,
              erro_detalhes: "Composição Creatomate falhou — será retentada no próximo check",
            }).eq("id", video.id);
            results.push({ id: video.id, requestId, newStatus: "compondo_video_retry" });
            await logAgente(`Creatomate falhou para ${(video as any).promocoes?.origem}→${(video as any).promocoes?.destino}, ficará em compondo_video para retry`, "warn", {
              videoId: video.id, requestId,
            });
          }
          continue;
        }

        if (!legacyRequestId) {
          results.push({ id: video.id, requestId, newStatus: "sem_request_id" });
          continue;
        }

        const statusUrl = `https://platform.higgsfield.ai/requests/${legacyRequestId}/status`;
        const res = await fetch(statusUrl, {
          headers: { "Authorization": hfAuthHeader },
        });
        const rawBody = await res.text();
        console.log(`[check] Video ${video.id} request ${legacyRequestId}: status=${res.status}, body=${rawBody.substring(0, 500)}`);
        const data = JSON.parse(rawBody);
        const status = (data.status || data.state || "").toLowerCase();

        if (["completed", "done", "succeed", "succeeded"].includes(status)) {
          const videoUrl = extractVideoUrl(data);

          if (videoUrl) {
            let finalUrl = videoUrl;
            try {
              finalUrl = await uploadToStorage(videoUrl, `finals/${video.promocao_id}_${Date.now()}.mp4`, "video/mp4");
            } catch {
              finalUrl = videoUrl;
            }

            await supabase.from("videos").update({
              video_url: videoUrl,
              video_final_url: finalUrl,
              status: "pronto",
              erro_detalhes: null,
            }).eq("id", video.id);

            await supabase.from("promocoes").update({ status: "video_pronto" }).eq("id", video.promocao_id);
            results.push({ id: video.id, requestId: legacyRequestId, newStatus: "pronto" });

            await logAgente(`Vídeo pronto (via polling) para ${(video as any).promocoes?.origem}→${(video as any).promocoes?.destino}`, "success", {
              videoId: video.id,
              requestId: legacyRequestId,
              videoUrl: finalUrl,
            });
          } else {
            results.push({ id: video.id, requestId: legacyRequestId, newStatus: "completed_sem_url" });
          }
        } else if (["failed", "error"].includes(status)) {
          await supabase.from("videos").update({
            status: "erro",
            erro_detalhes: data.error || "Video generation failed",
          }).eq("id", video.id);
          results.push({ id: video.id, requestId: legacyRequestId, newStatus: "erro" });
        } else {
          results.push({ id: video.id, requestId: legacyRequestId, newStatus: `still_${status}` });
        }
      } catch (err) {
        console.error(`[check] Error checking video ${video.id}: ${String(err)}`);
        results.push({ id: video.id, requestId, newStatus: `check_error: ${String(err)}` });
      }
    }

    return new Response(JSON.stringify({ checked: pendingVideos.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
