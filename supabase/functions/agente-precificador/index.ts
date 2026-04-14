import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

async function logAgente(mensagem: string, tipo = "info", payload = {}) {
  await supabase.from("logs_agentes").insert({
    agente: "precificador",
    mensagem,
    tipo,
    payload,
  });
}

async function scoreWithClaude(promo: Record<string, unknown>): Promise<{ score: number; justificativa: string }> {
  if (!anthropicKey) {
    return { score: 5, justificativa: "ANTHROPIC_API_KEY não configurada, score padrão aplicado" };
  }

  const prompt = `Analise esta promoção de passagem aérea e dê um score de 0 a 10.

Dados da promoção:
- Origem: ${promo.origem}
- Destino: ${promo.destino}
- Preço promocional: R$ ${promo.preco}
- Preço normal: R$ ${promo.preco_normal || "N/A"}
- Desconto: ${promo.pct_desconto || "N/A"}%
- Cia Aérea: ${promo.cia_aerea || "N/A"}
- Tipo de voo: ${promo.tipo_voo || "ida_volta"}
- Classe: ${promo.classe || "economica"}
- Validade: ${promo.validade || "N/A"}
- Bagagem: ${promo.bagagem || "N/A"}
- Escalas: ${promo.escalas || "N/A"}

Critérios de avaliação (em ordem de peso):
1. Percentual de desconto (peso ALTO) - descontos acima de 40% são excelentes
2. Destino popular/procurado (peso MÉDIO)
3. Cia aérea confiável (peso MÉDIO) - LATAM, GOL, Azul, TAP são bem avaliadas
4. Validade razoável (peso BAIXO) - promos com pelo menos 1 semana são melhores
5. Classe e bagagem incluída (peso BAIXO)

Responda APENAS com JSON no formato: {"score": <number 0-10>, "justificativa": "<texto curto explicando>"}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(10, Math.max(0, Number(parsed.score) || 5)),
        justificativa: String(parsed.justificativa || ""),
      };
    }
    return { score: 5, justificativa: "Não foi possível extrair score do Claude" };
  } catch (err) {
    await logAgente(`Erro ao chamar Claude: ${err}`, "error");
    return { score: 5, justificativa: `Erro na IA: ${err}` };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    await logAgente("Iniciando execução do Precificador", "info");

    // Check if agent is active
    const { data: config } = await supabase
      .from("config_agentes")
      .select("*")
      .eq("agente", "precificador")
      .single();

    if (!config?.ativo) {
      await logAgente("Agente Precificador está desativado", "warn");
      return new Response(JSON.stringify({ message: "Agente desativado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const margemPadrao = config?.config?.margem_padrao || 10;
    const scoreAutoAprovacao = config?.config?.score_minimo_aprovacao || 7;

    // Get body if called with specific promo ID
    let promoId: string | null = null;
    try {
      const body = await req.json();
      promoId = body?.promocao_id || body?.record?.id || null;
    } catch {
      // No body, process all pending
    }

    // Get pending promos
    let query = supabase.from("promocoes").select("*").eq("status", "pendente");
    if (promoId) {
      query = supabase.from("promocoes").select("*").eq("id", promoId);
    }

    const { data: promos, error } = await query.limit(50);
    if (error) throw error;

    if (!promos?.length) {
      await logAgente("Nenhuma promoção pendente para precificar", "info");
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    let autoApproved = 0;

    for (const promo of promos) {
      try {
        // Calculate client price
        const margem = promo.margem_pct || margemPadrao;
        const precoCliente = Math.ceil(promo.preco * (1 + margem / 100));

        // Get AI score
        const { score, justificativa } = await scoreWithClaude(promo);

        // Check auto-approval config
        const { data: aprovadorConfig } = await supabase
          .from("config_agentes")
          .select("config")
          .eq("agente", "aprovador")
          .single();
        const scoreAutoAprov = aprovadorConfig?.config?.score_auto_aprovacao || 9;

        const newStatus = score >= scoreAutoAprov ? "aprovada" : "precificada";
        if (score >= scoreAutoAprov) autoApproved++;

        const { error: updateError } = await supabase
          .from("promocoes")
          .update({
            preco_cliente: precoCliente,
            score,
            score_justificativa: justificativa,
            status: newStatus,
          })
          .eq("id", promo.id);

        if (updateError) {
          await logAgente(`Erro ao atualizar promo ${promo.id}: ${updateError.message}`, "error");
        } else {
          processed++;
          await logAgente(
            `Promo ${promo.origem}→${promo.destino} precificada: R$${precoCliente}, score ${score}${newStatus === "aprovada" ? " (auto-aprovada)" : ""}`,
            "success",
            { promoId: promo.id, score, precoCliente, status: newStatus }
          );
        }
      } catch (err) {
        await logAgente(`Erro ao processar promo ${promo.id}: ${err}`, "error");
      }
    }

    await logAgente(
      `Precificador finalizado: ${processed} processadas, ${autoApproved} auto-aprovadas`,
      "success"
    );

    return new Response(
      JSON.stringify({ processed, autoApproved }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    await logAgente(`Erro fatal no Precificador: ${err}`, "error");
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
