import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const hfApiKey = Deno.env.get("HF_API_KEY");
const hfApiSecret = Deno.env.get("HF_API_SECRET");
const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

async function logAgente(mensagem: string, tipo = "info", payload = {}) {
  await supabase.from("logs_agentes").insert({
    agente: "videomaker",
    mensagem,
    tipo,
    payload,
  });
}

async function generateArt(promo: Record<string, unknown>): Promise<string | null> {
  if (!hfApiKey || !hfApiSecret) {
    await logAgente("HF_API_KEY ou HF_API_SECRET não configurados", "error");
    return null;
  }

  const prompt = `Professional dark premium travel promotion poster. Route: ${promo.origem} to ${promo.destino}. Original price: R$${promo.preco_normal || promo.preco} crossed out. Promotional price: R$${promo.preco_cliente || promo.preco} highlighted in gold. ${promo.pct_desconto ? `${promo.pct_desconto}% OFF badge.` : ""} Airline: ${promo.cia_aerea || ""}. Style: dark navy blue background (#0f172a), golden accents (#f59e0b), airplane silhouette, modern bold typography, luxury travel aesthetic. Brand: PromoCéu logo. Aspect ratio 9:16 for Instagram Stories/Reels.`;

  try {
    const response = await fetch(
      "https://platform.higgsfield.ai/bytedance/seedream/v4/text-to-image",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${hfApiKey}:${hfApiSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio: "9:16",
          resolution: "2K",
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Higgsfield image API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const statusUrl = data.status_url || data.request_url;
    const requestId = data.request_id || data.id;

    if (!statusUrl) {
      throw new Error("No status_url returned from Higgsfield");
    }

    // Poll for completion
    let result = null;
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(statusUrl, {
        headers: { Authorization: `Key ${hfApiKey}:${hfApiSecret}` },
      });
      const statusData = await statusRes.json();

      if (statusData.status === "completed" || statusData.state === "completed") {
        result = statusData.output?.image_url || statusData.result?.url || statusData.output?.[0]?.url;
        break;
      }
      if (statusData.status === "failed" || statusData.state === "failed") {
        throw new Error(`Image generation failed: ${JSON.stringify(statusData)}`);
      }
    }

    return result;
  } catch (err) {
    await logAgente(`Erro ao gerar arte: ${err}`, "error");
    return null;
  }
}

async function generateNarration(promo: Record<string, unknown>): Promise<string | null> {
  if (!elevenLabsKey) {
    await logAgente("ELEVENLABS_API_KEY não configurada", "error");
    return null;
  }

  const text = `Promoção imperdível! Voo de ${promo.origem} para ${promo.destino} por apenas ${promo.preco_cliente || promo.preco} reais! ${promo.pct_desconto ? `Isso é ${promo.pct_desconto}% de desconto` : "Preço incrível"} com a ${promo.cia_aerea || "companhia aérea"}! Corre que é por tempo limitado! Link na bio.`;

  try {
    // Use a Brazilian Portuguese voice
    const voiceId = "EXAVITQu4vr4xnSDxMaL"; // Sarah
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.4,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ElevenLabs error: ${response.status} - ${errText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(audioBuffer);

    // Upload to Supabase Storage
    const fileName = `narrations/${promo.id}_${Date.now()}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, uint8Array, { contentType: "audio/mpeg" });

    if (uploadError) {
      // Try creating bucket first
      await supabase.storage.createBucket("videos", { public: true });
      const { error: retryError } = await supabase.storage
        .from("videos")
        .upload(fileName, uint8Array, { contentType: "audio/mpeg" });
      if (retryError) throw retryError;
    }

    const { data: urlData } = supabase.storage.from("videos").getPublicUrl(fileName);
    return urlData.publicUrl;
  } catch (err) {
    await logAgente(`Erro ao gerar narração: ${err}`, "error");
    return null;
  }
}

async function generateVideo(arteUrl: string, promoId: string): Promise<string | null> {
  if (!hfApiKey || !hfApiSecret) return null;

  const webhookUrl = `${supabaseUrl}/functions/v1/webhook-higgsfield`;

  try {
    const response = await fetch(
      `https://platform.higgsfield.ai/kling-video/v2.1/pro/image-to-video?hf_webhook=${encodeURIComponent(webhookUrl)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${hfApiKey}:${hfApiSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: arteUrl,
          prompt: "Smooth cinematic zoom, golden shimmer effect, airplane flying across, professional motion graphics, luxury travel vibes",
          duration: 5,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Higgsfield video API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.request_id || data.id || null;
  } catch (err) {
    await logAgente(`Erro ao iniciar geração de vídeo: ${err}`, "error");
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    await logAgente("Iniciando execução do VideoMaker", "info");

    // Check if agent is active
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

    // Get body if called with specific promo ID
    let promoId: string | null = null;
    try {
      const body = await req.json();
      promoId = body?.promocao_id || body?.record?.id || null;
    } catch {
      // No body
    }

    // Get approved promos
    let query = supabase.from("promocoes").select("*").eq("status", "aprovada");
    if (promoId) {
      query = supabase.from("promocoes").select("*").eq("id", promoId);
    }

    const { data: promos, error } = await query.limit(5);
    if (error) throw error;

    if (!promos?.length) {
      await logAgente("Nenhuma promoção aprovada para produção de vídeo", "info");
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;

    for (const promo of promos) {
      try {
        // Update status
        await supabase.from("promocoes").update({ status: "em_producao" }).eq("id", promo.id);

        // Create video record
        const { data: videoRecord, error: videoInsertError } = await supabase
          .from("videos")
          .insert({ promocao_id: promo.id, status: "gerando_arte" })
          .select()
          .single();

        if (videoInsertError) throw videoInsertError;

        // Step 1: Generate art
        await logAgente(`Gerando arte para ${promo.origem}→${promo.destino}`, "info");
        const arteUrl = await generateArt(promo);

        if (!arteUrl) {
          await supabase.from("videos").update({ status: "erro", erro_detalhes: "Falha ao gerar arte" }).eq("id", videoRecord.id);
          continue;
        }

        await supabase.from("videos").update({ arte_url: arteUrl, status: "com_arte" }).eq("id", videoRecord.id);
        await logAgente(`Arte gerada para ${promo.origem}→${promo.destino}`, "success");

        // Step 2: Generate narration
        await logAgente(`Gerando narração para ${promo.origem}→${promo.destino}`, "info");
        const narrationUrl = await generateNarration(promo);

        if (narrationUrl) {
          await supabase.from("videos").update({ narration_url: narrationUrl, status: "com_narracao" }).eq("id", videoRecord.id);
          await logAgente(`Narração gerada para ${promo.origem}→${promo.destino}`, "success");
        }

        // Step 3: Generate video (async via webhook)
        await logAgente(`Iniciando geração de vídeo para ${promo.origem}→${promo.destino}`, "info");
        await supabase.from("videos").update({ status: "gerando_video" }).eq("id", videoRecord.id);
        const requestId = await generateVideo(arteUrl, promo.id);

        if (requestId) {
          await supabase.from("videos").update({ higgsfield_request_id: requestId }).eq("id", videoRecord.id);
          await logAgente(`Vídeo em produção (request: ${requestId})`, "info");
        } else {
          await supabase.from("videos").update({ status: "erro", erro_detalhes: "Falha ao iniciar geração de vídeo" }).eq("id", videoRecord.id);
        }

        processed++;
      } catch (err) {
        await logAgente(`Erro ao processar vídeo para promo ${promo.id}: ${err}`, "error");
      }
    }

    await logAgente(`VideoMaker finalizado: ${processed} em produção`, "success");

    return new Response(
      JSON.stringify({ processed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    await logAgente(`Erro fatal no VideoMaker: ${err}`, "error");
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
