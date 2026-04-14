import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const requestId = body.request_id || body.id;
    const status = body.status || body.state;
    const videoUrl = body.videos?.[0]?.url || body.images?.[0]?.url || body.output?.video_url || body.output?.url || body.output?.[0]?.url || body.result?.url;

    if (!requestId) {
      return new Response(JSON.stringify({ error: "No request_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: video } = await supabase
      .from("videos")
      .select("*, promocoes(*)")
      .eq("higgsfield_request_id", requestId)
      .single();

    if (!video) {
      return new Response(JSON.stringify({ error: "Video not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (status === "completed" && videoUrl) {
      try {
        const videoRes = await fetch(videoUrl);
        const videoBuffer = new Uint8Array(await videoRes.arrayBuffer());
        const fileName = `finals/${video.promocao_id}_${Date.now()}.mp4`;

        await supabase.storage.createBucket("videos", { public: true }).catch(() => {});
        await supabase.storage.from("videos").upload(fileName, videoBuffer, { contentType: "video/mp4" });

        const { data: urlData } = supabase.storage.from("videos").getPublicUrl(fileName);

        await supabase.from("videos").update({
          video_url: videoUrl,
          video_final_url: urlData.publicUrl,
          status: "pronto",
        }).eq("id", video.id);

        await supabase.from("promocoes").update({ status: "video_pronto" }).eq("id", video.promocao_id);

        await supabase.from("logs_agentes").insert({
          agente: "videomaker",
          mensagem: `Vídeo pronto para ${video.promocoes?.origem}→${video.promocoes?.destino}`,
          tipo: "success",
          payload: { videoId: video.id, promoId: video.promocao_id, requestId, status, videoUrl },
        });
      } catch (storageErr) {
        await supabase.from("videos").update({
          video_url: videoUrl,
          status: "pronto",
        }).eq("id", video.id);

        await supabase.from("promocoes").update({ status: "video_pronto" }).eq("id", video.promocao_id);
      }
    } else if (status === "failed") {
      await supabase.from("videos").update({
        status: "erro",
        erro_detalhes: body.error || "Video generation failed",
      }).eq("id", video.id);

      await supabase.from("logs_agentes").insert({
        agente: "videomaker",
        mensagem: `Erro na geração de vídeo: ${body.error || "unknown"}`,
        tipo: "error",
        payload: { videoId: video.id, requestId, status, videoUrl, body },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
