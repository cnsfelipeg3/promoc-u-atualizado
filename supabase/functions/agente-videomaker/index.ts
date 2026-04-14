import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

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

async function generateArt(promo: Record<string, unknown>): Promise<string | null> {
  const precoCliente = promo.preco_cliente || promo.preco;
  const precoNormal = promo.preco_normal || promo.preco;
  const desconto = promo.pct_desconto ? `${promo.pct_desconto}%` : "";
  const ciaAerea = promo.cia_aerea || "";
  const escalas = promo.escalas || "";
  const bagagem = promo.bagagem || "";
  const tipoVoo = promo.tipo_voo === "ida_volta" ? "ida e volta" : "só ida";

  const prompt = `Ultra-professional premium travel promotion poster for Instagram Stories/Reels (9:16 vertical format).

BRAND: "PromoCéu" logo text prominently displayed at the top with a small airplane icon integrated into the logo. Clean modern sans-serif typography.

COLOR PALETTE: Deep navy blue background (#0f172a), golden accents (#f59e0b) for price highlights and decorative elements, cyan (#06b6d4) for secondary accents and route indicators.

LAYOUT (top to bottom):
- Top: "PromoCéu" brand logo in white/gold with airplane icon
- Route badge: "${promo.origem} → ${promo.destino}" in bold white text with cyan arrow
- Center hero: Large golden price "R$ ${precoCliente}" per person, bold typography with shimmer effect
- Strike-through original price "R$ ${precoNormal}" in faded gray above the golden price
${desconto ? `- Discount badge: "-${desconto} OFF" in a vibrant red/gold badge` : ""}
- Info pills below price: "${ciaAerea}" • "${escalas}" • "${bagagem}" • "${tipoVoo}"
- Bottom footer: "Promoção exclusiva PromoCéu • Link na bio" in small white text

STYLE: Dark luxury aesthetic, floating golden particles, subtle airplane silhouette in background, professional gradient overlays, glass-morphism card effects, premium travel agency advertisement quality. Modern bold typography throughout.

IMPORTANT: All text must be clearly legible. The price must be the dominant visual element. Clean composition with proper hierarchy.`;

  const url = "https://platform.higgsfield.ai/bytedance/seedream/v4/text-to-image";

  await logAgente(`Chamando Higgsfield API: ${url} com headers: hf-api-key presente: ${!!hfApiKey}, hf-secret presente: ${!!hfApiSecret}`, "info");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "hf-api-key": hfApiKey!,
        "hf-secret": hfApiSecret!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: "9:16",
        resolution: "2K",
      }),
    });

    const responseBody = await response.text();
    await logAgente(`Higgsfield text-to-image response: status=${response.status}, body=${responseBody}`, response.ok ? "info" : "error");

    if (!response.ok) {
      throw new Error(`Higgsfield image API error: ${response.status} - ${responseBody}`);
    }

    const data = JSON.parse(responseBody);
    const statusUrl = data.status_url || data.request_url;

    if (!statusUrl) {
      await logAgente(`Higgsfield não retornou status_url. Resposta completa: ${responseBody}`, "error");
      throw new Error("No status_url returned from Higgsfield");
    }

    await logAgente(`Polling status_url: ${statusUrl}`, "info");

    let result = null;
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000));

      const pollUrl = statusUrl;
      await logAgente(`Polling Higgsfield status (tentativa ${i + 1}/60): ${pollUrl}`, "info");

      const statusRes = await fetch(pollUrl, {
        headers: { "hf-api-key": hfApiKey!, "hf-secret": hfApiSecret! },
      });

      const statusBody = await statusRes.text();
      await logAgente(`Polling response: status=${statusRes.status}, body=${statusBody}`, "info");

      const statusData = JSON.parse(statusBody);

      if (statusData.status === "completed" || statusData.state === "completed") {
        result = statusData.output?.image_url || statusData.result?.url || statusData.output?.[0]?.url;
        await logAgente(`Arte gerada com sucesso! URL: ${result}`, "success");
        break;
      }
      if (statusData.status === "failed" || statusData.state === "failed") {
        await logAgente(`Geração de arte falhou: ${statusBody}`, "error");
        throw new Error(`Image generation failed: ${statusBody}`);
      }
    }

    if (!result) {
      await logAgente("Timeout: arte não ficou pronta após 5 minutos de polling", "error");
    }

    return result;
  } catch (err) {
    const errMsg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    await logAgente(`Erro ao gerar arte: ${errMsg}`, "error");
    return null;
  }
}

async function generateNarration(promo: Record<string, unknown>): Promise<string | null> {
  if (!elevenLabsKey) {
    await logAgente("ELEVENLABS_API_KEY não configurada", "error");
    return null;
  }

  const precoCliente = promo.preco_cliente || promo.preco;
  const desconto = promo.pct_desconto ? `quase ${promo.pct_desconto}% de desconto` : "um preço incrível";
  const escalas = promo.escalas ? String(promo.escalas).toLowerCase() : "";
  const bagagem = promo.bagagem ? `, com ${String(promo.bagagem).toLowerCase()},` : "";
  const ciaAerea = promo.cia_aerea ? ` com a ${promo.cia_aerea}` : "";
  const isDirecto = escalas.includes("direto");

  const text = `Atenção viajantes! Achamos uma promoção ABSURDA! ${isDirecto ? "Voo direto de" : "Voo de"} ${promo.origem} pra ${promo.destino}, ida e volta${bagagem}, por apenas ${Math.floor(Number(precoCliente))} reais! Isso é ${desconto}${ciaAerea}! Corre que vaga tá acabando! Link na bio!`;

  const voiceId = "EXAVITQu4vr4xnSDxMaL";
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

  await logAgente(`Chamando ElevenLabs TTS: voiceId=${voiceId}, texto=${text.substring(0, 100)}...`, "info");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      await logAgente(`ElevenLabs error: status=${response.status}, body=${errText}`, "error");
      throw new Error(`ElevenLabs error: ${response.status} - ${errText}`);
    }

    await logAgente(`ElevenLabs TTS response: status=${response.status}, ok`, "info");

    const audioBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(audioBuffer);

    const fileName = `narrations/${promo.id}_${Date.now()}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, uint8Array, { contentType: "audio/mpeg" });

    if (uploadError) {
      await logAgente(`Upload falhou, tentando criar bucket: ${uploadError.message}`, "warn");
      await supabase.storage.createBucket("videos", { public: true });
      const { error: retryError } = await supabase.storage
        .from("videos")
        .upload(fileName, uint8Array, { contentType: "audio/mpeg" });
      if (retryError) {
        await logAgente(`Upload retry falhou: ${retryError.message}`, "error");
        throw retryError;
      }
    }

    const { data: urlData } = supabase.storage.from("videos").getPublicUrl(fileName);
    await logAgente(`Narração uploaded: ${urlData.publicUrl}`, "success");
    return urlData.publicUrl;
  } catch (err) {
    const errMsg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    await logAgente(`Erro ao gerar narração: ${errMsg}`, "error");
    return null;
  }
}

async function generateVideo(arteUrl: string, promoId: string): Promise<string | null> {
  const webhookUrl = `${supabaseUrl}/functions/v1/webhook-higgsfield`;
  const url = `https://platform.higgsfield.ai/kling-video/v2.1/pro/image-to-video?hf_webhook=${encodeURIComponent(webhookUrl)}`;

  await logAgente(`Chamando Higgsfield video API: ${url} com headers: hf-api-key presente: ${!!hfApiKey}, hf-secret presente: ${!!hfApiSecret}`, "info");

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
        prompt: "Dramatic cinematic zoom in, golden particles floating, airplane silhouette flying across frame, price text revealing with shimmer effect, premium luxury feel, smooth professional motion graphics",
        duration: 5,
      }),
    });

    const responseBody = await response.text();
    await logAgente(`Higgsfield video response: status=${response.status}, body=${responseBody}`, response.ok ? "info" : "error");

    if (!response.ok) {
      throw new Error(`Higgsfield video API error: ${response.status} - ${responseBody}`);
    }

    const data = JSON.parse(responseBody);
    const requestId = data.request_id || data.id || null;
    await logAgente(`Higgsfield video request_id: ${requestId}`, "info");
    return requestId;
  } catch (err) {
    const errMsg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    await logAgente(`Erro ao iniciar geração de vídeo: ${errMsg}`, "error");
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // === VALIDAÇÃO DE SECRETS ===
    if (!hfApiKey || hfApiKey.trim() === "") {
      const msg = "ERRO: HF_API_KEY não está definido nos secrets do Supabase";
      console.error(msg);
      await logAgente(msg, "error");
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!hfApiSecret || hfApiSecret.trim() === "") {
      const msg = "ERRO: HF_API_SECRET não está definido nos secrets do Supabase";
      console.error(msg);
      await logAgente(msg, "error");
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await logAgente("Iniciando execução do VideoMaker. Secrets OK: HF_API_KEY presente, HF_API_SECRET presente, ELEVENLABS_API_KEY presente: " + !!elevenLabsKey, "info");

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
    } catch {
      // No body
    }

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

    await logAgente(`Encontradas ${promos.length} promoções para processar`, "info");
    let processed = 0;

    for (const promo of promos) {
      try {
        await logAgente(`Processando promo ${promo.id}: ${promo.origem}→${promo.destino}`, "info");
        await supabase.from("promocoes").update({ status: "em_producao" }).eq("id", promo.id);

        const { data: videoRecord, error: videoInsertError } = await supabase
          .from("videos")
          .insert({ promocao_id: promo.id, status: "gerando_arte" })
          .select()
          .single();

        if (videoInsertError) {
          await logAgente(`Erro ao inserir registro de vídeo: ${videoInsertError.message}`, "error");
          throw videoInsertError;
        }

        await logAgente(`Registro de vídeo criado: ${videoRecord.id}. Gerando arte...`, "info");
        const arteUrl = await generateArt(promo);

        if (!arteUrl) {
          await supabase.from("videos").update({ status: "erro", erro_detalhes: "Falha ao gerar arte" }).eq("id", videoRecord.id);
          await logAgente(`Arte falhou para promo ${promo.id}, pulando`, "error");
          continue;
        }

        await supabase.from("videos").update({ arte_url: arteUrl, status: "com_arte" }).eq("id", videoRecord.id);
        await logAgente(`Arte salva: ${arteUrl}`, "success");

        await logAgente(`Gerando narração para ${promo.origem}→${promo.destino}`, "info");
        const narrationUrl = await generateNarration(promo);

        if (narrationUrl) {
          await supabase.from("videos").update({ narration_url: narrationUrl, status: "com_narracao" }).eq("id", videoRecord.id);
          await logAgente(`Narração salva: ${narrationUrl}`, "success");
        } else {
          await logAgente("Narração falhou, continuando sem narração", "warn");
        }

        await logAgente(`Iniciando geração de vídeo para ${promo.origem}→${promo.destino}`, "info");
        await supabase.from("videos").update({ status: "gerando_video" }).eq("id", videoRecord.id);
        const requestId = await generateVideo(arteUrl, promo.id);

        if (requestId) {
          await supabase.from("videos").update({ higgsfield_request_id: requestId }).eq("id", videoRecord.id);
          await logAgente(`Vídeo em produção (request: ${requestId})`, "success");
        } else {
          await supabase.from("videos").update({ status: "erro", erro_detalhes: "Falha ao iniciar geração de vídeo" }).eq("id", videoRecord.id);
          await logAgente(`Geração de vídeo falhou para promo ${promo.id}`, "error");
        }

        processed++;
      } catch (err) {
        const errMsg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
        await logAgente(`Erro ao processar vídeo para promo ${promo.id}: ${errMsg}`, "error");
      }
    }

    await logAgente(`VideoMaker finalizado: ${processed} processadas`, "success");

    return new Response(
      JSON.stringify({ processed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const errMsg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    await logAgente(`Erro fatal no VideoMaker: ${errMsg}`, "error");
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
