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
  await supabase.from("logs_agentes").insert({
    agente: "promptengineer",
    mensagem,
    tipo,
    payload,
  });
}

const SYSTEM_PROMPT = `Você é um diretor criativo de conteúdo viral para TikTok/Reels especializado em promoções de passagens aéreas para a marca "PromoCéu".

Você receberá dados de uma promoção de voo e deve gerar 3 outputs em JSON:

1. **art_prompt** (em INGLÊS): Prompt detalhado para text-to-image no Higgsfield Seedream v4, formato 9:16 vertical.
   - DEVE incluir: logo "PromoCéu" no topo com ícone de avião, rota (origem→destino), preço promocional grande e dourado, preço original riscado, desconto em badge, cia aérea, tipo de voo
   - Estética: dark luxury com fundo navy (#0f172a), acentos dourados (#f59e0b), cyan (#06b6d4)
   - IMPORTANTE: incluir elementos visuais ÚNICOS do DESTINO. Exemplos:
     - Orlando = castelo mágico, fogos de artifício, parques temáticos
     - Lisboa = azulejos portugueses, Ponte 25 de Abril, bondes
     - Paris = Torre Eiffel, luzes douradas, café parisiense
     - Praias (Cancún, Maldivas) = águas cristalinas, palmeiras, pôr do sol
     - Nova York = skyline, Times Square, luzes neon
   - Cada destino deve ter identidade visual única e reconhecível
   - Texto deve ser legível, preço como elemento visual dominante

2. **video_prompt** (em INGLÊS): Prompt para image-to-video no Kling v2.1 Pro.
   - Movimentos cinematográficos temáticos por destino:
     - Praia = ondas suaves quebrando, brisa movendo palmeiras
     - Cidade = luzes urbanas piscando, carros em movimento ao fundo
     - Parque temático = fogos de artifício explodindo, luzes coloridas
     - Europa = nuvens passando, reflexos na água
   - Sempre incluir: zoom dramático no preço, partículas douradas flutuantes, efeito shimmer/brilho no texto do preço
   - Duração: 10 segundos de animação fluida

3. **narration_script** (em PORTUGUÊS BR): Script completo para TTS (ElevenLabs).
   Estrutura OBRIGATÓRIA:
   - HOOK (3s): Frase de impacto que faz parar o scroll. Ex: "Gente, isso é REAL?" ou "Para TUDO que essa promoção é ABSURDA!" ou "Você NÃO vai acreditar nesse preço!"
   - PROMO (8-12s): Apresentar a promoção com entusiasmo — destino, preço, desconto, cia aérea. Contextualizar o destino (ex: "Imagina você passeando nos parques de Orlando com a família...")
   - COMUNIDADE (5-8s): Falar da PromoCéu — "A gente monitora milhares de rotas todo dia pra achar promoções assim antes de todo mundo"
   - CTA (3-5s): "Link na bio pra assinar o grupo VIP no WhatsApp! Promoções exclusivas todo dia direto no seu celular. Corre que vaga tá acabando!"

Responda APENAS com JSON válido, sem markdown, sem explicações. Formato:
{
  "art_prompt": "...",
  "video_prompt": "...",
  "narration_script": "..."
}`;

async function generatePrompts(promo: Record<string, unknown>): Promise<{
  art_prompt: string;
  video_prompt: string;
  narration_script: string;
} | null> {
  const precoCliente = promo.preco_cliente || promo.preco;
  const precoNormal = promo.preco_normal || promo.preco;
  const desconto = promo.pct_desconto ? `${promo.pct_desconto}%` : "N/A";
  const ciaAerea = promo.cia_aerea || "N/A";
  const escalas = promo.escalas || "N/A";
  const bagagem = promo.bagagem || "N/A";
  const tipoVoo = promo.tipo_voo === "ida_volta" ? "ida e volta" : "só ida";

  const userMessage = `Dados da promoção:
- Origem: ${promo.origem}
- Destino: ${promo.destino}
- Preço promocional: R$ ${precoCliente}
- Preço normal: R$ ${precoNormal}
- Desconto: ${desconto}
- Cia Aérea: ${ciaAerea}
- Tipo de voo: ${tipoVoo}
- Escalas: ${escalas}
- Bagagem: ${bagagem}

Gere os 3 prompts (art_prompt, video_prompt, narration_script) em JSON.`;

  await logAgente(`Chamando Claude para promo ${promo.id}: ${promo.origem}→${promo.destino}`, "info");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
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
    if (!parsed.art_prompt || !parsed.video_prompt || !parsed.narration_script) {
      await logAgente(`Claude retornou JSON incompleto: ${text.substring(0, 200)}`, "error");
      return null;
    }

    return parsed;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await logAgente(`Erro ao chamar Claude: ${errMsg}`, "error");
    return null;
  }
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

    await logAgente("Iniciando PromptEngineer", "info");

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
        await logAgente(`Gerando prompts para ${promo.origem}→${promo.destino}`, "info");

        const result = await generatePrompts(promo);
        if (!result) {
          await logAgente(`Falha ao gerar prompts para promo ${promo.id}`, "error");
          continue;
        }

        await supabase.from("promocoes").update({
          art_prompt: result.art_prompt,
          video_prompt: result.video_prompt,
          narration_script: result.narration_script,
          status: "prompts_gerados",
        }).eq("id", promo.id);

        await logAgente(`Prompts salvos para ${promo.origem}→${promo.destino}`, "success", {
          promoId: promo.id,
          artPromptLength: result.art_prompt.length,
          videoPromptLength: result.video_prompt.length,
          narrationLength: result.narration_script.length,
        });

        processed++;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        await logAgente(`Erro ao processar promo ${promo.id}: ${errMsg}`, "error");
      }
    }

    await logAgente(`PromptEngineer finalizado: ${processed} processadas`, "success");

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
