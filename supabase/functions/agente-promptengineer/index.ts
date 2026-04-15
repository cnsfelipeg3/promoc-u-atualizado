import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function logAgente(mensagem: string, tipo = "info", payload = {}) {
  console.log(`[promptengineer][${tipo}] ${mensagem}`, JSON.stringify(payload));
  await supabase.from("logs_agentes").insert({ agente: "promptengineer", mensagem, tipo, payload });
}

const SYSTEM_PROMPT = `Você é um diretor de vídeos virais do TikTok especializado em promoções de passagens aéreas para a comunidade PromoCéu.

Para cada promoção você gera 3 variações de vídeo CINEMATOGRÁFICO. Os vídeos devem parecer conteúdo profissional de travel creator — NÃO são artes com preço, são CENAS REAIS de destinos com pessoas.

Você receberá dados de uma promoção de voo e deve gerar 3 variações em JSON:

{
  "variations": [
    {
      "label": "teaser",
      "duration": 5,
      "scene_prompt": "...",
      "camera_control": "...",
      "narration_script": "...",
      "overlay_config": { "overlays": [...] }
    },
    {
      "label": "promo",
      "duration": 10,
      "scene_prompt": "...",
      "camera_control": "...",
      "narration_script": "...",
      "overlay_config": { "overlays": [...] }
    },
    {
      "label": "viral",
      "duration": 10,
      "scene_prompt": "...",
      "camera_control": "...",
      "narration_script": "...",
      "overlay_config": { "overlays": [...] }
    }
  ]
}

PARA CADA VARIAÇÃO, GERE:

### scene_prompt (INGLÊS)
Prompt para gerar um VÍDEO cinematográfico via text-to-video. Deve descrever uma CENA com:
- Uma pessoa (homem ou mulher jovem, casual/estiloso) num cenário icônico do DESTINO
- Emoção genuína (alegria, surpresa, admiração)
- Iluminação cinematográfica (golden hour, neon, dramatic)
- Formato vertical 9:16
- NUNCA inclua texto, preço, ou logo na cena — esses vão como overlays
- Seja ESPECÍFICO com o destino:
  - Orlando: pessoa no Magic Kingdom com castelo ao fundo, fogos de artifício, expressão maravilhada
  - Lisboa: pessoa num mirante com ponte 25 de Abril ao fundo, azulejos, luz dourada
  - Paris: pessoa com Torre Eiffel ao fundo, café parisiense, outono
  - Praias (Cancún, Maldivas): pessoa na beira do mar cristalino, areia branca, pôr do sol
  - Nova York: pessoa na Times Square, luzes neon, energia urbana
  - Para outros destinos: use o ícone mais reconhecível e crie cena com ele

### camera_control (INGLÊS)
Instrução de câmera. Escolher entre:
- "slow dolly forward" — aproximação cinematográfica
- "orbit left" — câmera circulando o sujeito
- "tilt up" — revelação de baixo para cima
- "zoom in" — zoom dramático
- "tracking shot" — câmera acompanhando movimento

### narration_script (PORTUGUÊS BR)
Script de narração estilo creator VIRAL do TikTok. REGRAS OBRIGATÓRIAS:
- Linguagem COLOQUIAL brasileira: "tá", "pra", "cê", "num", "tô", "gente"
- Comece com exclamação: "GENTE!", "PARA TUDO!", "SOCORRO!", "OLHA ISSO!"
- Reações genuínas: "eu não acredito", "tô chocado", "isso é real"
- CTA urgente: "CORRE!", "Link na bio!", "Vai antes que acabe!"
- Preços por extenso: "três mil e duzentos reais" (NUNCA "R$ 3211")
- MENCIONAR "PromoCéu" nas variações promo e viral
- NUNCA soe corporativo ou robótico
- Soe como alguém compartilhando descoberta incrível com amigos

REGRA DE DURAÇÃO ABSOLUTA:
- Vídeo de 5s (teaser): máximo 15-20 palavras (4 segundos de fala). 1-2 frases EXPLOSIVAS.
- Vídeo de 10s (promo/viral): máximo 40-50 palavras (9 segundos de fala). 3-5 frases.
CONTAR as palavras e GARANTIR que cabe na duração do vídeo.
A narração NUNCA pode ser mais longa que o vídeo.

### overlay_config (JSON)
Configuração dos textos que aparecem SOBRE o vídeo. Cada overlay tem:
- text: o texto a mostrar
- start: segundo em que aparece
- end: segundo em que some
- position: "top", "center", "bottom", "below_price"
- style: "destination" (grande, bold), "price" (dourado, gigante), "detail" (menor, info), "cta" (urgente, pulsante), "discount" (badge vermelho), "logo" (PromoCéu pequeno)

Os overlays devem sincronizar com a narração:
- Quando a narração fala o destino → overlay do destino aparece
- Quando fala o preço → overlay do preço aparece com efeito
- Quando fala desconto → badge de desconto aparece
- Final → CTA + logo PromoCéu

=== VARIAÇÃO TEASER (5s) ===
- scene_prompt: Cena RÁPIDA e impactante. Close-up da pessoa com expressão surpresa, destino desfocado ao fundo. Movimento rápido.
- camera_control: "zoom in" ou "dolly forward"
- narration_script: MAX 20 palavras. Interjeição + destino + preço por extenso + CTA curto.
- overlays: Destino flash (0-2s), Preço GRANDE (1.5-4s), CTA (3.5-5s)

=== VARIAÇÃO PROMO (10s) ===
- scene_prompt: Cena ENVOLVENTE. Pessoa no destino, curtindo o momento, olha pra câmera. Cenário bonito e reconhecível.
- camera_control: "slow dolly forward" ou "orbit left"
- narration_script: MAX 50 palavras. Hook + destino + preço por extenso + desconto + PromoCéu + CTA.
- overlays: Logo PromoCéu sutil (0-10s), Destino (1-4s), Preço + desconto (3-7s), Detalhes cia aérea (5-8s), CTA (8-10s)

=== VARIAÇÃO VIRAL (10s) ===
- scene_prompt: Cena ÉPICA e cinematográfica. Pessoa com cenário grandioso, lighting dramático, emoção intensa. Parece trailer de filme.
- camera_control: "tilt up" revelação dramática ou "tracking shot" épico
- narration_script: MAX 50 palavras. Hook absurdo + destino emocional + preço por extenso com reação + PromoCéu + CTA urgente.
- overlays: Hook text (0-2s), Destino grandioso (2-4s), Preço com glow (4-7s), Badge desconto (5-7s), PromoCéu + CTA (8-10s)

REGRAS GERAIS:
- scene_prompt e camera_control SEMPRE em INGLÊS
- narration_script SEMPRE em PORTUGUÊS BR
- Responda APENAS com JSON válido, sem markdown, sem explicações`;

async function generatePrompts(promo: Record<string, unknown>) {
  const precoCliente = promo.preco_cliente || promo.preco;
  const precoNormal = promo.preco_normal || promo.preco;
  const desconto = promo.pct_desconto ? `${promo.pct_desconto}%` : "N/A";
  const ciaAerea = promo.cia_aerea || "N/A";
  const tipoVoo = promo.tipo_voo === "ida_volta" ? "ida e volta" : "só ida";

  const userMessage = `Dados da promoção:
- Origem: ${promo.origem}
- Destino: ${promo.destino}
- Preço promocional: R$ ${precoCliente}
- Preço original: R$ ${precoNormal}
- Desconto: ${desconto}
- Cia Aérea: ${ciaAerea}
- Tipo de voo: ${tipoVoo}

Gere as 3 variações (teaser, promo, viral) em JSON.`;

  await logAgente(`Chamando Claude para promo ${promo.id}: ${promo.origem}→${promo.destino}`, "info");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    await logAgente(`Claude API error: ${response.status} - ${errText}`, "error");
    return null;
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) {
    await logAgente("Claude retornou resposta vazia", "error");
    return null;
  }

  await logAgente(`Claude response recebida (${text.length} chars)`, "info");

  const parsed = JSON.parse(text);
  if (!parsed.variations || parsed.variations.length !== 3) {
    await logAgente(`Claude retornou JSON inválido: ${text.substring(0, 200)}`, "error");
    return null;
  }

  return parsed;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!anthropicKey) {
      const msg = "ANTHROPIC_API_KEY não configurada";
      await logAgente(msg, "error");
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await logAgente("Iniciando PromptEngineer v6 (cenas cinematográficas + overlays)", "info");

    const { data: config } = await supabase
      .from("config_agentes")
      .select("*")
      .eq("agente", "promptengineer")
      .single();

    if (!config?.ativo) {
      await logAgente("Agente PromptEngineer está desativado", "warn");
      return new Response(JSON.stringify({ message: "Agente desativado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let promoId: string | null = null;
    try {
      const body = await req.json();
      promoId = body?.promocao_id || null;
    } catch { /* no body */ }

    let query = supabase.from("promocoes").select("*").eq("status", "aprovada");
    if (promoId) {
      query = supabase.from("promocoes").select("*").eq("id", promoId);
    }

    const { data: promos, error } = await query.limit(10);
    if (error) throw error;

    if (!promos?.length) {
      await logAgente("Nenhuma promoção aprovada para gerar prompts", "info");
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await logAgente(`Encontradas ${promos.length} promoções para processar`, "info");
    let processed = 0;

    for (const promo of promos) {
      try {
        await logAgente(`Gerando prompts cinematográficos para ${promo.origem}→${promo.destino}`, "info");

        const result = await generatePrompts(promo);
        if (!result) {
          await logAgente(`Falha ao gerar prompts para promo ${promo.id}`, "error");
          continue;
        }

        // Find "promo" variation for backward compatibility
        const promoVariation = result.variations.find((v: { label: string }) => v.label === "promo") || result.variations[1];

        // Extract overlay_config from promo variation
        const overlayConfig = promoVariation.overlay_config || null;

        await supabase.from("promocoes").update({
          prompt_variations: result.variations,
          overlay_config: overlayConfig,
          // Backward compatibility: scene_prompt → art_prompt, camera_control → video_prompt
          art_prompt: promoVariation.scene_prompt,
          video_prompt: promoVariation.camera_control,
          narration_script: promoVariation.narration_script,
          status: "prompts_gerados",
        }).eq("id", promo.id);

        await logAgente(`Prompts cinematográficos salvos para ${promo.origem}→${promo.destino}`, "success", {
          promoId: promo.id,
          labels: result.variations.map((v: { label: string }) => v.label),
        });

        // Auto-trigger VideoMaker
        try {
          await fetch(`${supabaseUrl}/functions/v1/agente-videomaker`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ promocao_id: promo.id }),
          });
          await logAgente(`VideoMaker disparado automaticamente para promo ${promo.id}`, "success");
        } catch (chainErr) {
          await logAgente(`Erro ao disparar VideoMaker: ${chainErr instanceof Error ? chainErr.message : String(chainErr)}`, "error");
        }

        processed++;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        await logAgente(`Erro ao processar promo ${promo.id}: ${errMsg}`, "error");
      }
    }

    await logAgente(`PromptEngineer v6 finalizado: ${processed} processadas`, "success");

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
