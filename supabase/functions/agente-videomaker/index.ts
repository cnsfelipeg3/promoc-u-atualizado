import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const hfApiKey = Deno.env.get("HF_API_KEY");
const hfApiSecret = Deno.env.get("HF_API_SECRET");
const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

async function logAgente(mensagem: string, tipo = "info", payload = {}) {
  console.log(`[videomaker][${tipo}] ${mensagem}`, JSON.stringify(payload));
  await supabase.from("logs_agentes").insert({
    agente: "videomaker",
    mensagem,
    tipo,
    payload,
  });
}

// ── GENERATE ART ──────────────────────────────────────────────
async function generateArt(promo: Record<string, unknown>): Promise<string | null> {
  // Use PromptEngineer's art_prompt if available, otherwise fallback
  const prompt = (promo.art_prompt as string) || buildFallbackArtPrompt(promo);

  const url = "https://platform.higgsfield.ai/bytedance/seedream/v4/text-to-image";
  await logAgente(`Gerando arte via Higgsfield. Prompt personalizado: ${!!promo.art_prompt}`, "info");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "hf-api-key": hfApiKey!,
        "hf-secret": hfApiSecret!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, aspect_ratio: "9:16", resolution: "2K" }),
    });

    const responseBody = await response.text();
    await logAgente(`Higgsfield art response: status=${response.status}`, response.ok ? "info" : "error");

    if (!response.ok) throw new Error(`Higgsfield image API error: ${response.status} - ${responseBody}`);

    const data = JSON.parse(responseBody);
    const statusUrl = data.status_url || data.request_url;
    if (!statusUrl) {
      await logAgente(`Sem status_url na resposta: ${responseBody.substring(0, 300)}`, "error");
      throw new Error("No status_url returned");
    }

    await logAgente(`Polling arte: ${statusUrl}`, "info");

    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(statusUrl, {
        headers: { "hf-api-key": hfApiKey!, "hf-secret": hfApiSecret! },
      });
      const statusBody = await statusRes.text();
      if (i % 6 === 0) await logAgente(`Polling arte tentativa ${i + 1}/60`, "info");

      const statusData = JSON.parse(statusBody);
      if (statusData.status === "completed" || statusData.state === "completed") {
        const result = statusData.images?.[0]?.url || statusData.output?.image_url || statusData.result?.url;
        await logAgente(`Arte gerada! URL: ${result}`, "success");
        return result;
      }
      if (statusData.status === "failed" || statusData.state === "failed") {
        await logAgente(`Arte falhou: ${statusBody}`, "error");
        throw new Error(`Image generation failed`);
      }
    }

    await logAgente("Timeout: arte não ficou pronta após 5 min", "error");
    return null;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await logAgente(`Erro ao gerar arte: ${errMsg}`, "error");
    return null;
  }
}

function buildFallbackArtPrompt(promo: Record<string, unknown>): string {
  const precoCliente = promo.preco_cliente || promo.preco;
  const precoNormal = promo.preco_normal || promo.preco;
  const desconto = promo.pct_desconto ? `${promo.pct_desconto}%` : "";
  const ciaAerea = promo.cia_aerea || "";
  const escalas = promo.escalas || "";
  const bagagem = promo.bagagem || "";
  const tipoVoo = promo.tipo_voo === "ida_volta" ? "ida e volta" : "só ida";

  return `Ultra-professional premium travel promotion poster for Instagram Stories/Reels (9:16 vertical format).
BRAND: "PromoCéu" logo text prominently displayed at the top with a small airplane icon. Clean modern sans-serif typography.
COLOR PALETTE: Deep navy blue background (#0f172a), golden accents (#f59e0b), cyan (#06b6d4).
LAYOUT: Top: "PromoCéu" brand logo. Route badge: "${promo.origem} → ${promo.destino}". Center: Large golden price "R$ ${precoCliente}" per person. Strike-through "R$ ${precoNormal}".
${desconto ? `Discount badge: "-${desconto} OFF"` : ""}
Info: "${ciaAerea}" • "${escalas}" • "${bagagem}" • "${tipoVoo}"
STYLE: Dark luxury aesthetic, floating golden particles, subtle airplane silhouette, glass-morphism card effects. All text must be clearly legible. Price is dominant visual element.`;
}

// ── GENERATE NARRATION ────────────────────────────────────────
async function generateNarration(promo: Record<string, unknown>): Promise<string | null> {
  if (!elevenLabsKey) {
    await logAgente("ELEVENLABS_API_KEY não configurada", "error");
    return null;
  }

  // Use PromptEngineer's narration_script if available
  const text = (promo.narration_script as string) || buildFallbackNarration(promo);

  const voiceId = "EXAVITQu4vr4xnSDxMaL";
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

  await logAgente(`TTS: ${text.substring(0, 80)}... Script personalizado: ${!!promo.narration_script}`, "info");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": elevenLabsKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.5, use_speaker_boost: true },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      await logAgente(`ElevenLabs error: ${response.status} - ${errText}`, "error");
      throw new Error(`ElevenLabs error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(audioBuffer);
    const fileName = `narrations/${promo.id}_${Date.now()}.mp3`;

    const { error: uploadError } = await supabase.storage.from("videos").upload(fileName, uint8Array, { contentType: "audio/mpeg" });
    if (uploadError) {
      await supabase.storage.createBucket("videos", { public: true });
      const { error: retryError } = await supabase.storage.from("videos").upload(fileName, uint8Array, { contentType: "audio/mpeg" });
      if (retryError) throw retryError;
    }

    const { data: urlData } = supabase.storage.from("videos").getPublicUrl(fileName);
    await logAgente(`Narração uploaded: ${urlData.publicUrl}`, "success");
    return urlData.publicUrl;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await logAgente(`Erro narração: ${errMsg}`, "error");
    return null;
  }
}

function buildFallbackNarration(promo: Record<string, unknown>): string {
  const precoCliente = promo.preco_cliente || promo.preco;
  const desconto = promo.pct_desconto ? `quase ${promo.pct_desconto}% de desconto` : "um preço incrível";
  const escalas = promo.escalas ? String(promo.escalas).toLowerCase() : "";
  const bagagem = promo.bagagem ? `, com ${String(promo.bagagem).toLowerCase()},` : "";
  const ciaAerea = promo.cia_aerea ? ` com a ${promo.cia_aerea}` : "";
  const isDirecto = escalas.includes("direto");
  return `Atenção viajantes! Achamos uma promoção ABSURDA! ${isDirecto ? "Voo direto de" : "Voo de"} ${promo.origem} pra ${promo.destino}, ida e volta${bagagem}, por apenas ${Math.floor(Number(precoCliente))} reais! Isso é ${desconto}${ciaAerea}! Corre que vaga tá acabando! Link na bio!`;
}

// ── GENERATE VIDEO (WITH POLLING) ─────────────────────────────
async function generateVideo(arteUrl: string, promo: Record<string, unknown>): Promise<{ requestId: string | null; videoUrl: string | null }> {
  // Use PromptEngineer's video_prompt if available
  const videoPrompt = (promo.video_prompt as string) || "Dramatic cinematic zoom in, golden particles floating, airplane silhouette flying across frame, price text revealing with shimmer effect, premium luxury feel, smooth professional motion graphics";

  const url = "https://platform.higgsfield.ai/kling-video/v2.1/pro/image-to-video";
  await logAgente(`Gerando vídeo via Higgsfield. Prompt personalizado: ${!!promo.video_prompt}`, "info");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "hf-api-key": hfApiKey!,
        "hf-secret": hfApiSecret!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: arteUrl,
        prompt: videoPrompt,
        duration: 10,
      }),
    });

    const responseBody = await response.text();
    await logAgente(`Higgsfield video response: status=${response.status}`, response.ok ? "info" : "error");

    if (!response.ok) throw new Error(`Higgsfield video API error: ${response.status} - ${responseBody}`);

    const data = JSON.parse(responseBody);
    const requestId = data.request_id || data.id || null;
    const statusUrl = data.status_url || data.request_url;

    if (!statusUrl) {
      await logAgente(`Sem status_url para vídeo. request_id: ${requestId}`, "warn");
      return { requestId, videoUrl: null };
    }

    await logAgente(`Polling vídeo: ${statusUrl} (request_id: ${requestId})`, "info");

    // Poll every 5s, up to 120 attempts (10 min), log every 30s (6 attempts)
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(statusUrl, {
        headers: { "hf-api-key": hfApiKey!, "hf-secret": hfApiSecret! },
      });
      const statusBody = await statusRes.text();

      if (i % 6 === 0) await logAgente(`Polling vídeo tentativa ${i + 1}/120`, "info");

      const statusData = JSON.parse(statusBody);
      const status = statusData.status || statusData.state;

      if (status === "completed") {
        const videoUrl = statusData.videos?.[0]?.url || statusData.video?.url ||
          statusData.images?.[0]?.url || statusData.output?.video_url ||
          statusData.output?.url || statusData.result?.url ||
          statusData.video_url || statusData.url;
        await logAgente(`Vídeo gerado! URL: ${videoUrl}`, "success");
        return { requestId, videoUrl };
      }

      if (status === "failed") {
        await logAgente(`Vídeo falhou: ${statusBody.substring(0, 300)}`, "error");
        return { requestId, videoUrl: null };
      }
    }

    await logAgente("Timeout: vídeo não ficou pronto após 10 min", "error");
    return { requestId, videoUrl: null };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await logAgente(`Erro ao gerar vídeo: ${errMsg}`, "error");
    return { requestId: null, videoUrl: null };
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
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await logAgente("Iniciando VideoMaker", "info");

    const { data: config } = await supabase
      .from("config_agentes")
      .select("*")
      .eq("agente", "videomaker")
      .single();

    if (!config?.ativo) {
      await logAgente("Agente VideoMaker está desativado", "warn");
      return new Response(JSON.stringify({ message: "Agente desativado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let promoId: string | null = null;
    try {
      const body = await req.json();
      promoId = body?.promocao_id || body?.record?.id || null;
    } catch { /* no body */ }

    // Buscar promos com prompts_gerados (pipeline novo) OU aprovada (fallback)
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
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await logAgente(`Encontradas ${promos.length} promoções para processar`, "info");
    let processed = 0;

    for (const promo of promos) {
      try {
        await logAgente(`Processando promo ${promo.id}: ${promo.origem}→${promo.destino} (status: ${promo.status})`, "info");
        await supabase.from("promocoes").update({ status: "em_producao" }).eq("id", promo.id);

        const { data: videoRecord, error: videoInsertError } = await supabase
          .from("videos")
          .insert({ promocao_id: promo.id, status: "gerando_arte" })
          .select()
          .single();

        if (videoInsertError) throw videoInsertError;

        // ── ARTE ──
        await logAgente(`Gerando arte para ${promo.origem}→${promo.destino}`, "info");
        const arteUrl = await generateArt(promo);

        if (!arteUrl) {
          await supabase.from("videos").update({ status: "erro", erro_detalhes: "Falha ao gerar arte" }).eq("id", videoRecord.id);
          continue;
        }

        await supabase.from("videos").update({ arte_url: arteUrl, status: "com_arte" }).eq("id", videoRecord.id);

        // ── NARRAÇÃO ──
        await logAgente(`Gerando narração para ${promo.origem}→${promo.destino}`, "info");
        const narrationUrl = await generateNarration(promo);
        if (narrationUrl) {
          await supabase.from("videos").update({ narration_url: narrationUrl, status: "com_narracao" }).eq("id", videoRecord.id);
        }

        // ── VÍDEO (com polling!) ──
        await logAgente(`Gerando vídeo para ${promo.origem}→${promo.destino}`, "info");
        await supabase.from("videos").update({ status: "gerando_video" }).eq("id", videoRecord.id);
        const { requestId, videoUrl } = await generateVideo(arteUrl, promo);

        if (requestId) {
          await supabase.from("videos").update({ higgsfield_request_id: requestId }).eq("id", videoRecord.id);
        }

        if (videoUrl) {
          // Download and store in Supabase Storage
          let finalUrl = videoUrl;
          try {
            const videoRes = await fetch(videoUrl);
            const videoBuffer = new Uint8Array(await videoRes.arrayBuffer());
            const fileName = `finals/${promo.id}_${Date.now()}.mp4`;
            await supabase.storage.from("videos").upload(fileName, videoBuffer, { contentType: "video/mp4" });
            const { data: urlData } = supabase.storage.from("videos").getPublicUrl(fileName);
            finalUrl = urlData.publicUrl;
            await logAgente(`Vídeo salvo no Storage: ${finalUrl}`, "success");
          } catch (storageErr) {
            await logAgente(`Storage falhou, usando URL externa: ${videoUrl}`, "warn");
          }

          await supabase.from("videos").update({
            video_url: videoUrl,
            video_final_url: finalUrl,
            status: "pronto",
          }).eq("id", videoRecord.id);

          await supabase.from("promocoes").update({ status: "video_pronto" }).eq("id", promo.id);
          await logAgente(`Vídeo PRONTO para ${promo.origem}→${promo.destino}!`, "success");
        } else if (!requestId) {
          await supabase.from("videos").update({
            status: "erro",
            erro_detalhes: "Falha ao iniciar geração de vídeo",
          }).eq("id", videoRecord.id);
        }
        // If requestId but no videoUrl, video stays in gerando_video for webhook/manual check

        processed++;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        await logAgente(`Erro promo ${promo.id}: ${errMsg}`, "error");
      }
    }

    await logAgente(`VideoMaker finalizado: ${processed} processadas`, "success");
    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await logAgente(`Erro fatal: ${errMsg}`, "error");
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
