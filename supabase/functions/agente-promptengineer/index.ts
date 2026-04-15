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

const SYSTEM_PROMPT = `Você é um diretor criativo de conteúdo viral para TikTok/Reels especializado em promoções de passagens aéreas para a marca "PromoCéu".

Você receberá dados de uma promoção de voo e deve gerar 3 variações de conteúdo em JSON:

{
  "variations": [
    {
      "label": "teaser",
      "duration": 5,
      "art_prompt": "...",
      "video_prompt": "...",
      "narration_script": "..."
    },
    {
      "label": "promo",
      "duration": 10,
      "art_prompt": "...",
      "video_prompt": "...",
      "narration_script": "..."
    },
    {
      "label": "viral",
      "duration": 10,
      "art_prompt": "...",
      "video_prompt": "...",
      "narration_script": "..."
    }
  ]
}

INSTRUÇÕES POR VARIAÇÃO:

=== TEASER (5s) — Viral de scroll rápido ===

art_prompt (INGLÊS): Arte IMPACTANTE minimalista. Preço GIGANTE dourado (#f59e0b) dominando 60% da imagem. Destino como background blur cinematográfico. Logo "PromoCéu" sutil no topo. Formato 9:16. Fundo navy (#0f172a). Poucos elementos mas ultra premium. O preço deve ser o herói visual. Incluir elementos visuais TEMÁTICOS do destino (Orlando=castelo mágico blur, Lisboa=ponte blur, Paris=Torre Eiffel blur, Praias=águas cristalinas blur).

video_prompt (INGLÊS): Fast aggressive zoom into the golden price, explosive particle burst, quick flash transitions, energetic motion with speed lines, screen shake effect, cinematic lens flare on price reveal. 5 seconds of pure impact.

narration_script (PORTUGUÊS BR): MÁXIMO 15-20 palavras, 1-2 frases EXPLOSIVAS. Preço por EXTENSO. Ex: "PARA TUDO! Orlando por três mil ida e volta! CORRE!"

=== PROMO (10s) — Promoção envolvente ===

art_prompt (INGLÊS): Arte DETALHADA de promoção premium. Layout completo com: logo "PromoCéu" + ícone avião no topo, rota "ORIGEM → DESTINO" em badge, preço promocional dourado grande, preço original riscado, badge de desconto vermelho/laranja, cia aérea, tipo de voo. Background com elementos visuais TEMÁTICOS do destino (Orlando=castelo+fogos, Lisboa=azulejos+ponte, Paris=Torre Eiffel, Praias=águas cristalinas). Estética dark luxury, navy+dourado+cyan. Formato 9:16.

video_prompt (INGLÊS): Smooth cinematic zoom revealing the promotion details, golden particles floating elegantly, destination-themed ambient motion (beach=gentle waves, city=twinkling lights, theme park=fireworks), shimmer effect sweeping across the price text, subtle parallax between layers. Professional motion graphics feel. 10 seconds.

narration_script (PORTUGUÊS BR): MÁXIMO 40-50 palavras, 3-4 frases. Preço por EXTENSO. Hook + promo + reação + CTA. Ex: "GENTE, olha isso! Orlando, ida e volta, três mil e duzentos pela LATAM! Quase metade do preço, surreal! Corre no link da bio!"

=== VIRAL (10s) — Conteúdo completo TikTok ===

art_prompt (INGLÊS): Arte CINEMATOGRÁFICA épica. Composição de poster de cinema com o destino como cenário grandioso de fundo. Integração perfeita entre a paisagem/ícones do destino e os dados da promoção. Logo "PromoCéu" premium, rota, preço dourado com glow, desconto, cia, todas as infos. Visual storytelling — o viewer deve SENTIR o destino. Formato 9:16. Nível de detalhe MÁXIMO.

video_prompt (INGLÊS): Epic slow cinematic reveal, dramatic camera movement through destination scenery melting into promotion card, volumetric golden light rays, atmospheric particles, destination-specific ambient animation (waterfalls, northern lights, city pulse, ocean waves), grand orchestral feel with the price as dramatic crescendo reveal. Immersive 10 seconds.

narration_script (PORTUGUÊS BR): MÁXIMO 40-50 palavras, 4-5 frases com emoção crescente. Preço por EXTENSO. Hook absurdo + destino emocional + preço + reação + CTA urgente. Ex: "SOCORRO! Cê não vai acreditar... Orlando por TRÊS MIL REAIS ida e volta! Quase metade do preço normal, gente! PromoCéu achou antes de todo mundo. Link na bio, CORRE!"

REGRAS GERAIS:
- art_prompt e video_prompt SEMPRE em INGLÊS
- narration_script SEMPRE em PORTUGUÊS BR
- Cada destino DEVE ter identidade visual ÚNICA e reconhecível
- Preço deve ser SEMPRE o elemento visual mais impactante
- Responda APENAS com JSON válido, sem markdown, sem explicações

REGRAS CRÍTICAS PARA NARRATION_SCRIPT:

O script de narração deve soar como um CREATOR BRASILEIRO REAL do TikTok/Reels falando com entusiasmo genuíno. A narração vai ser SOBREPOSTA ao vídeo — ela precisa COMBINAR com o que está sendo mostrado nas cenas.

ESTILO OBRIGATÓRIO:
- Linguagem COLOQUIAL brasileira (não formal, não robótica)
- Use contrações naturais: "tá", "pra", "cê", "num", "tô"
- VARIE o ritmo: frases curtas impactantes + frases mais longas explicativas
- Use PAUSAS naturais com "..." para respiração
- Comece SEMPRE com exclamação: "GENTE!", "PARA TUDO!", "OLHA ISSO!", "SOCORRO!"
- Use ênfase: "SURREAL", "ABSURDO", "INACREDITÁVEL", "BARATÍSSIMO"
- Inclua reações emocionais: "eu não acredito", "tô chocado", "isso é real"
- CTA URGENTE: "CORRE!", "Vai lá antes que acabe!", "Link na bio AGORA!"
- NUNCA soe como propaganda corporativa ou apresentador de TV
- SEMPRE soe como alguém compartilhando uma descoberta incrível com amigos

SINCRONIZAÇÃO COM O VÍDEO:
A narração será tocada JUNTO com o vídeo. O vídeo mostra a arte da promoção com efeitos cinematográficos (zoom, partículas, brilho). A narração deve ACOMPANHAR o ritmo visual:
- Início do vídeo = Hook impactante (coincide com zoom/reveal da arte)
- Meio do vídeo = Informações da promoção (coincide com destaque do preço/destino)
- Final do vídeo = CTA urgente (coincide com momento de maior impacto visual)

FORMATO DOS PREÇOS:
- NUNCA "R$ 3211" → SEMPRE "três mil e duzentos reais"
- Arredondar para soar natural na fala
- Descontos: "quase metade do preço", "quarenta e sete por cento off"

REGRA DE DURAÇÃO ABSOLUTA:
O narration_script DEVE caber dentro da duração do vídeo.
- Para vídeo de 5s (teaser): máximo 15-20 palavras (4 segundos de fala). 1-2 frases EXPLOSIVAS apenas.
- Para vídeo de 10s (promo/viral): máximo 40-50 palavras (9 segundos de fala). 3-5 frases.
Contar as palavras do script e GARANTIR que não ultrapasse o limite.
Se o script ficar longo demais, CORTAR e simplificar. Menos é mais.
A narração NUNCA pode ser mais longa que o vídeo.

INSTRUÇÕES POR VARIAÇÃO PARA NARRAÇÃO:

TEASER (5s): MÁXIMO 15-20 palavras. 1-2 frases EXPLOSIVAS.
Formato: [INTERJEIÇÃO] + [destino + preço por extenso] + [CTA de 2 palavras]
Exemplo: "PARA TUDO! Orlando por três mil ida e volta! CORRE!"

PROMO (10s): MÁXIMO 40-50 palavras. 3-4 frases.
Formato: [Hook] + [destino + preço por extenso + desconto] + [reação] + [CTA]
Exemplo: "GENTE, olha isso! Orlando, ida e volta, três mil e duzentos pela LATAM! Quase metade do preço, surreal! Corre no link da bio!"

VIRAL (10s): MÁXIMO 40-50 palavras. 4-5 frases com emoção crescente.
Formato: [Hook absurdo] + [destino emocional] + [preço por extenso + reação] + [CTA urgente]
Exemplo: "SOCORRO! Cê não vai acreditar... Orlando por TRÊS MIL REAIS ida e volta! Isso é quase metade do preço normal, gente! PromoCéu achou antes de todo mundo. Link na bio, CORRE!"

NOTA IMPORTANTE: O vídeo viral tem apenas 10s. NÃO colocar narração de 30-45s. A narração DEVE caber nos 10 segundos.`;

async function generatePrompts(promo: Record<string, unknown>) {
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
      max_tokens: 6000,
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

    await logAgente("Iniciando PromptEngineer v3 (3 variações)", "info");

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
        await logAgente(`Gerando 3 variações de prompts para ${promo.origem}→${promo.destino}`, "info");

        const result = await generatePrompts(promo);
        if (!result) {
          await logAgente(`Falha ao gerar prompts para promo ${promo.id}`, "error");
          continue;
        }

        // Find "promo" variation for backward compatibility
        const promoVariation = result.variations.find((v: { label: string }) => v.label === "promo") || result.variations[1];

        await supabase.from("promocoes").update({
          prompt_variations: result.variations,
          art_prompt: promoVariation.art_prompt,
          video_prompt: promoVariation.video_prompt,
          narration_script: promoVariation.narration_script,
          status: "prompts_gerados",
        }).eq("id", promo.id);

        await logAgente(`3 variações de prompts salvas para ${promo.origem}→${promo.destino}`, "success", {
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
