import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const apifyToken = Deno.env.get("APIFY_TOKEN");

const supabase = createClient(supabaseUrl, supabaseKey);

async function logAgente(mensagem: string, tipo = "info", payload = {}) {
  await supabase.from("logs_agentes").insert({
    agente: "cacador",
    mensagem,
    tipo,
    payload,
  });
}

interface PromoData {
  origem: string;
  destino: string;
  preco: number;
  preco_normal?: number;
  pct_desconto?: number;
  cia_aerea?: string;
  tipo_voo?: string;
  classe?: string;
  validade?: string;
  bagagem?: string;
  escalas?: string;
  fonte?: string;
  url_fonte?: string;
}

function normalizePromo(raw: Record<string, unknown>, fonte: string): PromoData | null {
  try {
    const origem = String(raw.origem || raw.origin || raw.from || "").trim();
    const destino = String(raw.destino || raw.destination || raw.to || "").trim();
    const preco = parseFloat(String(raw.preco || raw.price || raw.valor || "0").replace(/[^\d.,]/g, "").replace(",", "."));

    if (!origem || !destino || !preco || preco <= 0) return null;

    const precoNormal = raw.preco_normal || raw.original_price || raw.preco_original;
    const precoNormalNum = precoNormal ? parseFloat(String(precoNormal).replace(/[^\d.,]/g, "").replace(",", ".")) : undefined;
    const pctDesconto = precoNormalNum && precoNormalNum > preco
      ? Math.round(((precoNormalNum - preco) / precoNormalNum) * 100)
      : (raw.pct_desconto || raw.discount ? parseFloat(String(raw.pct_desconto || raw.discount)) : undefined);

    return {
      origem,
      destino,
      preco,
      preco_normal: precoNormalNum,
      pct_desconto: pctDesconto,
      cia_aerea: String(raw.cia_aerea || raw.airline || raw.companhia || "").trim() || undefined,
      tipo_voo: String(raw.tipo_voo || raw.trip_type || "ida_volta"),
      classe: String(raw.classe || raw.class || "economica"),
      validade: raw.validade || raw.validity ? String(raw.validade || raw.validity) : undefined,
      bagagem: raw.bagagem || raw.baggage ? String(raw.bagagem || raw.baggage) : undefined,
      escalas: raw.escalas || raw.stops ? String(raw.escalas || raw.stops) : undefined,
      fonte,
      url_fonte: raw.url || raw.link ? String(raw.url || raw.link) : undefined,
    };
  } catch {
    return null;
  }
}

async function scrapeWithApify(fonte: string): Promise<PromoData[]> {
  if (!apifyToken) {
    await logAgente(`APIFY_TOKEN não configurado, pulando ${fonte}`, "warn");
    return [];
  }

  try {
    // Use Apify web scraper actor
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~web-scraper/runs?token=${apifyToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startUrls: [{ url: `https://${fonte}` }],
          pageFunction: `async function pageFunction(context) {
            const { $, request } = context;
            const results = [];
            $('article, .promo, .deal, .post, [class*="promo"], [class*="deal"]').each((i, el) => {
              const $el = $(el);
              const text = $el.text();
              const priceMatch = text.match(/R\\$\\s*([\\d.,]+)/);
              const routeMatch = text.match(/([A-ZÀ-Ú][a-zà-ú]+(?:\\s[A-ZÀ-Ú][a-zà-ú]+)*)\\s*(?:para|→|>|-)\\s*([A-ZÀ-Ú][a-zà-ú]+(?:\\s[A-ZÀ-Ú][a-zà-ú]+)*)/);
              if (priceMatch && routeMatch) {
                results.push({
                  origem: routeMatch[1],
                  destino: routeMatch[2],
                  preco: priceMatch[1],
                  url: $el.find('a').attr('href') || request.url,
                  cia_aerea: text.match(/(LATAM|GOL|Azul|Avianca|Copa|TAP|Emirates|American|United|Delta)/i)?.[1] || '',
                });
              }
            });
            return results;
          }`,
          maxPagesPerCrawl: 5,
          maxRequestsPerCrawl: 10,
        }),
      }
    );

    if (!runResponse.ok) {
      await logAgente(`Erro ao iniciar scraping de ${fonte}: ${runResponse.status}`, "error");
      return [];
    }

    const runData = await runResponse.json();
    const runId = runData.data?.id;
    if (!runId) return [];

    // Wait for run to complete (max 2 minutes)
    let status = "RUNNING";
    let attempts = 0;
    while (status === "RUNNING" && attempts < 24) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`);
      const statusData = await statusRes.json();
      status = statusData.data?.status || "FAILED";
      attempts++;
    }

    if (status !== "SUCCEEDED") {
      await logAgente(`Scraping de ${fonte} terminou com status: ${status}`, "warn");
      return [];
    }

    // Get results
    const datasetRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyToken}`
    );
    const items = await datasetRes.json();
    const promos: PromoData[] = [];

    for (const item of (Array.isArray(items) ? items : [])) {
      const normalized = normalizePromo(item, fonte);
      if (normalized) promos.push(normalized);
    }

    return promos;
  } catch (err) {
    await logAgente(`Erro no scraping de ${fonte}: ${err}`, "error");
    return [];
  }
}

async function isDuplicate(promo: PromoData): Promise<boolean> {
  const { data } = await supabase
    .from("promocoes")
    .select("id")
    .eq("origem", promo.origem)
    .eq("destino", promo.destino)
    .eq("preco", promo.preco)
    .eq("cia_aerea", promo.cia_aerea || "")
    .limit(1);
  return (data?.length || 0) > 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    await logAgente("Iniciando execução do Caçador", "info");

    // Check if agent is active
    const { data: config } = await supabase
      .from("config_agentes")
      .select("*")
      .eq("agente", "cacador")
      .single();

    if (!config?.ativo) {
      await logAgente("Agente Caçador está desativado", "warn");
      return new Response(JSON.stringify({ message: "Agente desativado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fontes = config?.config?.fontes || [
      "passagensimperdiveis.com.br",
      "melhoresdestinos.com.br",
      "viagenspromos.com.br",
    ];

    let totalInseridas = 0;
    let totalDuplicadas = 0;

    for (const fonte of fontes) {
      const promos = await scrapeWithApify(fonte);
      await logAgente(`${promos.length} promos encontradas em ${fonte}`, "info");

      for (const promo of promos) {
        const dup = await isDuplicate(promo);
        if (dup) {
          totalDuplicadas++;
          continue;
        }

        const { error } = await supabase.from("promocoes").insert({
          ...promo,
          status: "pendente",
        });

        if (error) {
          await logAgente(`Erro ao inserir promo: ${error.message}`, "error", { promo });
        } else {
          totalInseridas++;
        }
      }
    }

    await logAgente(
      `Caçador finalizado: ${totalInseridas} inseridas, ${totalDuplicadas} duplicadas`,
      "success",
      { totalInseridas, totalDuplicadas }
    );

    return new Response(
      JSON.stringify({ totalInseridas, totalDuplicadas }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    await logAgente(`Erro fatal no Caçador: ${err}`, "error");
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
