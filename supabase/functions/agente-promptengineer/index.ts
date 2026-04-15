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

const SYSTEM_PROMPT = `Você é um diretor de vídeos virais do TikTok especializado em TURISMO e promoções de passagens aéreas para a comunidade PromoCéu.

Para cada promoção você gera um STORYBOARD de 30 segundos dividido em 2 PARTES de 15s cada. Cada parte contém um prompt multi-shot detalhado no formato que o modelo Seedance 2.0 entende — com SHOT numerados, descrição de câmera e SFX.

O vídeo final é um mini-filme de viagem que faz a pessoa SONHAR com o destino e CORRER pra comprar a passagem.

GERE UM JSON com esta estrutura:

{
  "storyboard": {
    "title": "Título interno do vídeo",
    "total_duration": 30,
    "character_description": "Descrição FIXA do personagem principal (mesma pessoa em TODAS as cenas)",
    "destination_vibe": "A essência visual/emocional do destino",
    "part_a": {
      "duration": 15,
      "prompt": "O prompt multi-shot completo para Seedance 2.0 (PARTE A, primeiros 15s)"
    },
    "part_b": {
      "duration": 15,
      "prompt": "O prompt multi-shot completo para Seedance 2.0 (PARTE B, últimos 15s)"
    },
    "narration_script": "Narração completa de 30s em PT-BR",
    "overlay_config": {
      "overlays": [...]
    },
    "music_mood": "travel_dreamy"
  }
}

=== REGRAS DO PERSONAGEM ===

Definir UM personagem que aparece em TODOS os shots:
- Gênero: alternar entre masculino e feminino a cada promoção (baseado no hash do destino)
- Etnia: brasileiro(a) — pele morena, cabelo escuro
- Idade: 20-30 anos
- Roupa: casual de viagem (de acordo com o destino)
  - Praia: roupa leve, chapéu, óculos de sol
  - Europa: jaqueta leve, mochila, estilo urbano
  - Disney/Orlando: camiseta divertida, boné, estilo descontraído
  - Inverno: casaco, cachecol, botas

A MESMA descrição do personagem deve aparecer em TODOS os shots de ambas as partes.

=== ESTRUTURA NARRATIVA DO VÍDEO DE 30s ===

**PARTE A (0-15s) — SONHO + DESTINO**

SHOT 01 (0-3s) — HOOK / GANCHO
- Close-up do personagem com expressão de CHOQUE/SURPRESA olhando o celular
- Ambiente neutro (casa, café)
- Câmera: zoom in rápido no rosto
- SFX: notificação de celular, gasp

SHOT 02 (3-7s) — TRANSIÇÃO MÁGICA
- Transição do personagem para o DESTINO
- Efeito de "teletransporte" visual
- Personagem agora está NO destino, maravilhado
- Câmera: whip pan
- SFX: whoosh, som mágico

SHOT 03 (7-11s) — DESTINO EM TODA SUA GLÓRIA
- Wide shot do personagem no local mais ICÔNICO do destino
- Personagem curtindo: braços abertos, sorrindo, tirando selfie
- Cenário deslumbrante com iluminação cinematográfica
- Câmera: slow orbit ou tilt up
- SFX: som ambiente do local

SHOT 04 (11-15s) — MOMENTO EMOCIONAL
- Medium shot do personagem vivendo momento ESPECIAL do destino
- Câmera: dolly forward suave
- SFX: música emocional sutil

**PARTE B (15-30s) — REVELAÇÃO + URGÊNCIA + CTA**

SHOT 05 (0-4s) — LIFESTYLE NO DESTINO
- Personagem vivendo OUTRA experiência marcante
- Câmera: tracking shot dinâmico
- SFX: risadas, sons do ambiente

SHOT 06 (4-8s) — REAÇÃO AO PREÇO
- Close-up com expressão de CHOQUE TOTAL
- Boca aberta, mãos na cabeça
- Câmera: zoom in dramático
- SFX: bass drop

SHOT 07 (8-12s) — PROVA / CREDIBILIDADE
- Personagem falando pra câmera (estilo vlog)
- Gesticulando com entusiasmo
- Câmera: medium shot estável, handheld
- SFX: som ambiente suave

SHOT 08 (12-15s) — CTA URGENTE
- Personagem apontando PARA BAIXO (link na bio)
- Expressão urgente
- Câmera: dolly forward rápido
- SFX: urgência, heartbeat

=== FORMATO DO PROMPT MULTI-SHOT PARA SEEDANCE 2.0 ===

CADA PARTE (A e B) é UM TEXTO ÚNICO:

Cinematic travel video, vertical 9:16 format, hyper-realistic, professional travel content.
Main character: [DESCRIÇÃO FIXA do personagem]

SHOT 01 (0-3s)
[descrição detalhada]
camera: [tipo]
SFX: [efeitos]

SHOT 02 (3-7s)
...etc

=== REGRAS PARA NARRATION_SCRIPT (PT-BR, 30 segundos, ~100-120 palavras) ===

- [0-3s] Hook: "GENTE!" / "PARA TUDO!" / "SOCORRO!"
- [3-7s] Transição: "Imagina tu em [destino]..."
- [7-15s] Destino emocional: descrever o cenário, emoção
- [15-20s] Mais experiências
- [20-24s] Preço por EXTENSO + reação
- [24-27s] Prova: "PromoCéu monitora milhares de rotas..."
- [27-30s] CTA: "CORRE! Link na bio AGORA!"

TOM: creator brasileiro real. Linguagem COLOQUIAL: "tá", "pra", "cê", "num", "tô".
Preços por EXTENSO: "dois mil e novecentos reais". Mencionar "PromoCéu" 2x.

=== REGRAS PARA OVERLAY_CONFIG ===

Overlays sincronizados com narração e cenas, 30s de duração total:
- Logo PromoCéu (0-30s, top_left, style logo)
- Destino (3-10s, top, style destination)
- Subtítulo local (7-14s, center, style subtitle)
- Preço (20-27s, center, style price)
- "ida e volta" (21-27s, below_price, style detail)
- Desconto badge (21-27s, top_right, style discount)
- Info cia aérea (24-28s, center, style detail)
- CTA (27-30s, bottom, style cta)
- Segue @PromoCéu (28-30s, center, style follow)

=== DESTINOS — REFERÊNCIAS VISUAIS ===

ORLANDO: Cinderella Castle, Magic Kingdom, Universal, montanha-russa, resort, fogos
PARIS: Torre Eiffel, café parisiense, Champs-Élysées, Sena, outono dourado
LISBOA: Ponte 25 de Abril, azulejos, bonde 28, mirante, pastel de Belém
CANCÚN: mar cristalino, areia branca, ruínas maias, cenote, pôr do sol
NOVA YORK: Times Square, Central Park, Brooklyn Bridge, pizza
BUENOS AIRES: La Boca, tango, Recoleta, churrasco, Obelisco
SANTIAGO: Andes nevados, vinícolas, mercado, Plaza de Armas
MIAMI: South Beach, Ocean Drive, art déco, praia, conversível
ROMA: Coliseu, Fontana di Trevi, gelato, vespa
LONDRES: Big Ben, Tower Bridge, pub inglês, telefone vermelho
Para OUTROS destinos: ícone mais reconhecível + cenário fotogênico

REGRAS GERAIS:
- Prompts multi-shot SEMPRE em INGLÊS
- narration_script SEMPRE em PORTUGUÊS BR
- Responda APENAS com JSON válido, sem markdown, sem explicações`;

async function generateStoryboard(promo: Record<string, unknown>) {
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
- Bagagem: ${promo.bagagem || "N/A"}
- Escalas: ${promo.escalas || "N/A"}
- Validade: ${promo.validade || "N/A"}

Gere o storyboard de 30s (2 partes de 15s) em JSON.`;

  await logAgente(`Chamando Claude para storyboard ${promo.id}: ${promo.origem}→${promo.destino}`, "info");

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

  const cleanText = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(cleanText);
  if (!parsed.storyboard?.part_a?.prompt || !parsed.storyboard?.part_b?.prompt) {
    await logAgente(`Claude retornou JSON sem storyboard válido: ${text.substring(0, 300)}`, "error");
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

    await logAgente("Iniciando PromptEngineer v8 (Seedance 2.0 storyboard 30s)", "info");

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
      await logAgente("Nenhuma promoção aprovada para gerar storyboard", "info");
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await logAgente(`Encontradas ${promos.length} promoções para processar`, "info");
    let processed = 0;

    for (const promo of promos) {
      try {
        await logAgente(`Gerando storyboard 30s para ${promo.origem}→${promo.destino}`, "info");

        const result = await generateStoryboard(promo);
        if (!result) {
          await logAgente(`Falha ao gerar storyboard para promo ${promo.id}`, "error");
          continue;
        }

        const storyboard = result.storyboard;

        await supabase.from("promocoes").update({
          prompt_variations: result,
          overlay_config: storyboard.overlay_config,
          art_prompt: storyboard.part_a.prompt,
          video_prompt: storyboard.part_b.prompt,
          narration_script: storyboard.narration_script,
          status: "prompts_gerados",
        }).eq("id", promo.id);

        await logAgente(`Storyboard 30s salvo para ${promo.origem}→${promo.destino}`, "success", {
          promoId: promo.id,
          title: storyboard.title,
          character: storyboard.character_description?.substring(0, 80),
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

    await logAgente(`PromptEngineer v8 finalizado: ${processed} processadas`, "success");

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
