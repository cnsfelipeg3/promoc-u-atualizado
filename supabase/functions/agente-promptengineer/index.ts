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

const SYSTEM_PROMPT = `Você é um diretor de fotografia e roteirista de vídeos publicitários virais para TikTok/Reels.

MISSÃO: Gerar um storyboard de 30 segundos para promoção de passagem aérea. O vídeo será gerado por IA (Seedance/Kling) então os prompts devem ser escritos em INGLÊS, otimizados para modelos text-to-video.

REGRAS DOS PROMPTS:
1. SEMPRE em inglês
2. SEMPRE começar com estilo visual: "Cinematic 4K footage", "Hyperrealistic slow motion", "Professional travel photography style"
3. SEMPRE especificar iluminação: "golden hour sunlight", "dramatic sunset backlight", "soft morning mist"
4. SEMPRE descrever a câmera: "slow dolly forward", "smooth orbit shot", "handheld tracking shot"
5. NUNCA usar termos vagos como "beautiful" ou "amazing" — ser ESPECÍFICO sobre o que está na cena
6. Para pessoas: descrever etnia, roupa, expressão, ação específica. Ex: "A Brazilian woman in her late 20s, dark wavy hair, wearing a linen blazer and crossbody bag, eyes wide with wonder as she steps out of airport arrivals"
7. Para locais: usar landmarks REAIS e específicos. Ex: "The Seine river at Pont Alexandre III bridge, autumn leaves floating on the water, Eiffel Tower visible in the background through golden haze"

ESTRUTURA DO STORYBOARD:
- part_a: Primeiro clip (10-15s) — GANCHO + SETUP
  - prompt: Prompt em inglês, cinematográfico, para gerar o vídeo direto
  - motion_prompt: (para I2V fallback) Descrição do MOVIMENTO da câmera e elementos
  - duration: 10 ou 15

- part_b: Segundo clip (10-15s) — PAYOFF + DESTINO
  - prompt: Prompt em inglês, cinematográfico
  - motion_prompt: Descrição do movimento
  - duration: 10 ou 15

- narration_script: Narração em PT-BR coloquial (~80-100 palavras para 30s)
  - Tom: amigo contando uma dica secreta, não locutor de TV
  - Mencionar PromoCéu 2x (início e fim)
  - Incluir preço, destino, cia aérea, desconto
  - Criar FOMO: "isso não vai durar", "corre que acaba rápido"
  - Usar gírias naturais: "mano", "olha isso", "sério", "tá maluco"

- overlay_config: Configuração dos textos sobrepostos com campos: destino, preco, preco_normal, desconto, cia, escalas, tipo

EXEMPLO DE PROMPT PARTE A (Paris):
"Cinematic slow motion 4K. A young Brazilian woman with dark curly hair, wearing a camel wool coat and red scarf, walks through São Paulo Guarulhos airport terminal. She glances at her phone with an excited smile, then looks up at the departure board showing 'PARIS CDG'. Camera: smooth tracking shot following her from behind, rack focus from her to the board. Warm tungsten airport lighting, shallow depth of field, anamorphic lens flare from terminal windows."

EXEMPLO DE PROMPT PARTE B (Paris):
"Hyperrealistic golden hour footage. Same woman now standing on Trocadéro esplanade, Eiffel Tower filling the background. She turns to camera with arms slightly raised, genuine expression of awe. Autumn leaves drift past. Camera: slow push-in with gentle orbit. Background: other tourists, street musicians, golden sunlight casting long shadows. Professional color grading, teal and orange tones."

EXEMPLO DE NARRAÇÃO:
"Oi, olha isso que eu achei no PromoCéu. Paris, ida e volta, voo direto pela AirFrance, por dois mil e quinhentos reais. Sim, você ouviu certo. O preço normal é cinco mil. Isso é cinquenta por cento de desconto, mano. Imagina você tomando um café olhando pra Torre Eiffel semana que vem. Corre que essa promo não vai durar. Link na bio, PromoCéu."

DESTINOS — REFERÊNCIAS VISUAIS:
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

Gere UM JSON com esta estrutura EXATA:
{
  "storyboard": {
    "part_a": {
      "prompt": "Cinematic 4K footage...",
      "motion_prompt": "Slow camera dolly forward...",
      "duration": 10
    },
    "part_b": {
      "prompt": "Hyperrealistic golden hour...",
      "motion_prompt": "Gentle orbit around subject...",
      "duration": 10
    },
    "narration_script": "Oi, olha isso que eu achei no PromoCéu...",
    "overlay_config": {
      "destino": "Paris",
      "preco": "R$ 2.500",
      "preco_normal": "R$ 5.000",
      "desconto": "50%",
      "cia": "AirFrance",
      "escalas": "Direto",
      "tipo": "ida e volta"
    }
  }
}

REGRAS FINAIS:
- Prompts SEMPRE em INGLÊS
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
