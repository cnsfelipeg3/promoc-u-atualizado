// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `Você é o diretor criativo da Promoceu — um clube de assinatura brasileiro que avisa sobre promoções relâmpago de passagens aéreas.

Sua missão: receber dados de uma promoção e devolver um PACOTE CRIATIVO COMPLETO pra virar um vídeo viral no TikTok que leva a pessoa a comentar "EU QUERO" pra receber o link de assinatura no DM.

# ARQUITETURA DO VÍDEO FINAL (IMPORTANTE)

O vídeo tem EXATAMENTE 2 partes contínuas, ~30 segundos total:
- PART_A (0-15s): intro + hook visual, estabelece o destino e a promoção
- PART_B (15-30s): desenvolvimento, mostra o destino em detalhes, termina com CTA

Cada parte é gerada separadamente por IA (imagem → vídeo) e depois composta. Pense como um storyboard de 2 cenas que se conectam visualmente.

# FORMATO DO OUTPUT (obrigatório)

Responda APENAS um JSON válido, sem markdown, sem explicação. Schema:

{
  "score": number (0-100),
  "score_justificativa": string (1 frase),
  "titulo_video": string (até 60 chars, chamativo, SEM emoji),
  "hooks": [string (3 hooks diferentes, até 10 palavras cada)],
  "storyboard": {
    "part_a": {
      "prompt": string (inglês, imagem cinematográfica do destino — ESTABELECIMENTO, cena ampla ou hero shot, 9:16),
      "motion_prompt": string (inglês, como a câmera move — ex: "Slow dolly push-in through the scene"),
      "duration": 15
    },
    "part_b": {
      "prompt": string (inglês, imagem cinematográfica do destino — DETALHE íntimo, experiência, MESMA paleta que part_a, 9:16),
      "motion_prompt": string (inglês, ex: "Smooth orbit camera around the subject"),
      "duration": 15
    },
    "narration_script": string (80-100 palavras, 25-30s falado, ver REGRAS abaixo)
  },
  "video_prompts": [string] (8-10 prompts EM INGLÊS, cinematográficos, 5s cada, 9:16, SEM texto — fallback pro modo dinâmico),
  "text_overlays": [{"tempo_s": number, "texto": string (MAIÚSCULO, até 6 palavras)}],
  "cta_text": string (até 15 palavras),
  "hashtags": [string] (8-12, sem #)
}

# CRITÉRIOS DE SCORE (seja crítico)

- 90-100: desconto >=50% OU destino top (Paris, Maldivas, Japão, Dubai, Bali) OU preço absurdo internacional
- 75-89: desconto 30-50% em destino médio, ou nacional <R$400 ida e volta
- 50-74: desconto 15-30% OU destino obscuro — humano decide
- <50: não vale vídeo

# REGRAS DE NARRAÇÃO (CRÍTICO — define se soa humana ou robô)

- Duração alvo: 25-30 segundos quando falado (80-100 palavras) — NÃO estoure
- HOOK que quebra o scroll (nunca "Olá", "Bem-vindos", "Atenção")
- Português brasileiro INFORMAL, tom influencer TikTok, não locutor corporativo
- Gírias OK: "cara", "mano", "gente", "tipo", "sério", "juro", "ó", "para tudo"
- Segunda pessoa ("você")
- Zero jargão técnico (IATA, RT, OW)

# MARCAÇÕES DE ENTONAÇÃO (OBRIGATÓRIAS — ElevenLabs lê melhor)

- RETICÊNCIAS (...) pra pausas dramáticas: "1847 reais... pra Paris. Cara..."
- MAIÚSCULAS pra ênfase: "o preço normal é QUASE SEIS MIL"
- Vírgulas extras pra ritmo: "ó, isso aqui, é promoção de verdade"
- Travessão (—) pra aposto: "Air France — a francesa mesmo"
- "?" e "!" pra variar tom: "Sério que isso é real? É!"
- Números cruciais SEMPRE por extenso ("mil oitocentos e quarenta e sete" > "1847")
- CTA final intimado: "comenta EU QUERO aí embaixo que eu te mando o link no direct"

# REGRAS DE STORYBOARD VISUAL

- part_a.prompt e part_b.prompt sempre em INGLÊS
- Sempre vertical 9:16
- Vocabulário cinematográfico: "cinematic", "golden hour", "anamorphic lens flare", "shallow depth of field", "teal and orange color grade", "handheld feel"
- part_a = plano amplo / estabelecimento (ex: "Wide aerial shot of Paris...")
- part_b = detalhe íntimo / experiência (ex: "Close-up of Parisian café terrace...")
- MESMA paleta de cores e estética entre A e B pra parecer 1 filme
- Sem texto na imagem (texto é overlay do Creatomate)
- video_prompts[] (fallback): 8-10 clipes contando uma JORNADA — estabelecer → detalhes → atmosfera → climax. NUNCA repita o mesmo shot.

# EXEMPLO CALIBRADO (siga esse formato exato)

Input: { "origem": "São Paulo", "destino": "Paris", "preco": 1847, "preco_normal": 5890, "cia_aerea": "Air France" }

storyboard.narration_script esperado:
"Mil oitocentos e quarenta e sete reais... pra PARIS. Ida e volta, cara. Com Air France. Ó, o preço normal disso é QUASE SEIS MIL. Alguns dias do ano a companhia libera preços absurdos e... ninguém fica sabendo. Eu caço essas promoções TODO dia e jogo no meu grupo fechado. Quer entrar? Comenta EU QUERO aqui embaixo que eu te mando o link da Promoceu no direct."

Note: reticências, MAIÚSCULAS, "cara", "ó", "sério" — é isso que transforma robô em humano.

Agora gere o pacote pra promoção que vou te passar.`;

// Allowed promocoes statuses (validate_promocao_status trigger):
// pendente, precificada, aprovada, rejeitada, prompts_gerados, em_producao, video_pronto, publicada, arquivada

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { promocao_id } = await req.json();
    if (!promocao_id) return json({ error: "promocao_id obrigatório" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: promo, error: errFetch } = await supabase
      .from("promocoes").select("*").eq("id", promocao_id).maybeSingle();

    if (errFetch || !promo) {
      await log(supabase, "orquestrador", "error", `Promo não encontrada: ${promocao_id}`);
      return json({ error: "Promoção não encontrada" }, 404);
    }

    const { data: configRow } = await supabase
      .from("config_agentes").select("config").eq("agente", "orquestrador").maybeSingle();

    const cfg = (configRow?.config ?? {}) as Record<string, any>;
    const autoApproveThreshold = Number(cfg.score_auto_aprovacao ?? 75);
    const margem = Number(cfg.margem_padrao ?? 0);

    // Mark as em_producao while we work
    await supabase.from("promocoes").update({ status: "em_producao" }).eq("id", promocao_id);

    const userPrompt = `Gere o pacote criativo pra essa promoção:\n\n${JSON.stringify({
      origem: promo.origem,
      destino: promo.destino,
      preco: promo.preco,
      preco_normal: promo.preco_normal,
      pct_desconto: promo.pct_desconto,
      cia_aerea: promo.cia_aerea,
      tipo_voo: promo.tipo_voo,
      classe: promo.classe,
      validade: promo.validade,
      bagagem: promo.bagagem,
      escalas: promo.escalas,
      fonte: promo.fonte,
    }, null, 2)}`;

    const aiResp = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: LOVABLE_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      await log(supabase, "orquestrador", "error", `Lovable AI falhou: ${aiResp.status}`, { errText });
      await supabase.from("promocoes").update({ status: "pendente" }).eq("id", promocao_id);
      if (aiResp.status === 429) return json({ error: "Rate limit excedido, tente em alguns segundos" }, 429);
      if (aiResp.status === 402) return json({ error: "Créditos Lovable AI esgotados" }, 402);
      return json({ error: "IA indisponível", detail: errText }, 502);
    }

    const aiJson = await aiResp.json();
    const raw = aiJson.choices?.[0]?.message?.content;
    if (!raw) {
      await supabase.from("promocoes").update({ status: "pendente" }).eq("id", promocao_id);
      return json({ error: "IA não retornou conteúdo" }, 502);
    }

    let pacote: any;
    try { pacote = JSON.parse(raw); }
    catch {
      await log(supabase, "orquestrador", "error", "JSON inválido", { raw });
      await supabase.from("promocoes").update({ status: "pendente" }).eq("id", promocao_id);
      return json({ error: "JSON inválido", raw }, 502);
    }

    const obrigatorios = ["score", "titulo_video", "storyboard", "text_overlays"];
    const faltando = obrigatorios.filter(c => !(c in pacote));

    // Validação extra do storyboard
    if (pacote.storyboard) {
      if (!pacote.storyboard.part_a?.prompt) faltando.push("storyboard.part_a.prompt");
      if (!pacote.storyboard.part_b?.prompt) faltando.push("storyboard.part_b.prompt");
      if (!pacote.storyboard.narration_script) faltando.push("storyboard.narration_script");
    }

    if (faltando.length > 0) {
      await supabase.from("promocoes").update({ status: "pendente" }).eq("id", promocao_id);
      return json({ error: "Pacote incompleto", faltando }, 502);
    }

    const precoFinal = margem > 0 ? Math.round(promo.preco * (1 + margem / 100)) : promo.preco;

    // Map to allowed statuses (trigger validates: pendente/precificada/aprovada/rejeitada/...)
    let novoStatus: string;
    let statusLabel: string;
    if (pacote.score >= autoApproveThreshold) {
      novoStatus = "aprovada";
      statusLabel = "aprovada";
    } else if (pacote.score < 50) {
      novoStatus = "rejeitada";
      statusLabel = "rejeitada";
    } else {
      novoStatus = "precificada"; // aguardando revisão humana
      statusLabel = "revisao";
    }

    const { error: errUpdate } = await supabase.from("promocoes").update({
      score: pacote.score,
      score_justificativa: pacote.score_justificativa,
      titulo_video: pacote.titulo_video,
      hooks: pacote.hooks,
      // Lê do storyboard (novo schema), com fallback pro schema antigo
      narration_script: pacote.storyboard?.narration_script ?? pacote.narration_script,
      art_prompt: pacote.storyboard?.part_a?.prompt ?? pacote.art_prompt,
      video_prompt: pacote.storyboard?.part_b?.motion_prompt ?? pacote.video_prompt,
      video_prompts: pacote.video_prompts ?? null,
      text_overlays: pacote.text_overlays,
      cta_text: pacote.cta_text,
      hashtags: pacote.hashtags,
      preco_final: precoFinal,
      preco_cliente: precoFinal,
      status: novoStatus,
      prompt_variations: pacote, // pacote inteiro — videomaker lê .storyboard.part_a/part_b daqui
    }).eq("id", promocao_id);

    if (errUpdate) {
      await log(supabase, "orquestrador", "error", "Falha ao salvar pacote", { errUpdate });
      return json({ error: "Falha ao salvar", detail: errUpdate }, 500);
    }

    await log(supabase, "orquestrador", "success",
      `Promo ${promo.origem}→${promo.destino} processada. Score: ${pacote.score}. Status: ${statusLabel}`);

    // Dispara produção em background se foi aprovada
    if (novoStatus === "aprovada") {
      // @ts-ignore — EdgeRuntime disponível no Supabase
      EdgeRuntime.waitUntil(dispararProducao(supabase, promocao_id, pacote));
    }

    return json({ ok: true, promocao_id, status: statusLabel, score: pacote.score, pacote });

  } catch (err: any) {
    console.error("Erro:", err);
    return json({ error: err?.message ?? "Erro interno" }, 500);
  }
});

async function dispararProducao(supabase: any, promocaoId: string, pacote: any) {
  const tasks: Promise<any>[] = [];

  if (Deno.env.get("ELEVENLABS_API_KEY") && pacote.narration_script) {
    tasks.push(gerarNarracao(supabase, promocaoId, pacote.narration_script));
  }

  // Reutiliza o agente-videomaker existente (já integra Higgsfield + webhook)
  tasks.push(
    supabase.functions.invoke("agente-videomaker", { body: { promocao_id: promocaoId } })
      .then(({ error }: any) => {
        if (error) return log(supabase, "orquestrador", "error", "Falha ao invocar agente-videomaker", { error });
        return log(supabase, "orquestrador", "success", "agente-videomaker disparado");
      })
      .catch((e: any) => log(supabase, "orquestrador", "error", "Exceção ao invocar agente-videomaker", { erro: e?.message }))
  );

  await Promise.allSettled(tasks);
}

async function gerarNarracao(supabase: any, promocaoId: string, script: string) {
  try {
    const { data: configRow } = await supabase
      .from("config_agentes").select("config").eq("agente", "orquestrador").maybeSingle();
    const voiceId = (configRow?.config as any)?.elevenlabs_voice ?? "21m00Tcm4TlvDq8ikWAM";

    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: {
        "xi-api-key": Deno.env.get("ELEVENLABS_API_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.6, use_speaker_boost: true },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      await log(supabase, "elevenlabs", "error", `Falha narração: ${resp.status}`, { errText });
      return;
    }

    const audioBuf = new Uint8Array(await resp.arrayBuffer());
    const filename = `narracao_${promocaoId}_${Date.now()}.mp3`;

    const { error: upErr } = await supabase.storage.from("audios")
      .upload(filename, audioBuf, { contentType: "audio/mpeg", upsert: true });
    if (upErr) {
      await log(supabase, "elevenlabs", "error", "Falha upload narração", { upErr });
      return;
    }

    const { data: urlData } = supabase.storage.from("audios").getPublicUrl(filename);
    await supabase.from("promocoes")
      .update({ audio_narracao_url: urlData.publicUrl }).eq("id", promocaoId);
    await log(supabase, "elevenlabs", "success", `Narração gerada: ${urlData.publicUrl}`);
  } catch (err: any) {
    await log(supabase, "elevenlabs", "error", "Exceção narração", { erro: err?.message });
  }
}

async function log(supabase: any, agente: string, tipo: string, mensagem: string, payload: any = {}) {
  try { await supabase.from("logs_agentes").insert({ agente, tipo, mensagem, payload }); }
  catch (e) { console.error("Log falhou:", e); }
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
