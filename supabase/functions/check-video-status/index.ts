import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const hfApiKey = Deno.env.get("HF_API_KEY")!;
const hfApiSecret = Deno.env.get("HF_API_SECRET")!;

const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { data: pendingVideos } = await supabase
      .from("videos")
      .select("id, higgsfield_request_id, promocao_id, promocoes(origem, destino)")
      .eq("status", "gerando_video")
      .not("higgsfield_request_id", "is", null);

    if (!pendingVideos?.length) {
      return new Response(JSON.stringify({ message: "Nenhum vídeo pendente", checked: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ id: string; requestId: string; newStatus: string }> = [];

    for (const video of pendingVideos) {
      const requestId = video.higgsfield_request_id;
      const statusUrl = `https://platform.higgsfield.ai/requests/${requestId}/status`;

      try {
        const res = await fetch(statusUrl, {
          headers: { "hf-api-key": hfApiKey, "hf-secret": hfApiSecret },
        });
        const rawBody = await res.text();
        console.log(`[check] Video ${video.id} request ${requestId}: status=${res.status}, body=${rawBody.substring(0, 500)}`);
        const data = JSON.parse(rawBody);
        const status = data.status || data.state;

        if (status === "completed") {
          const videoUrl = data.video?.url || data.videos?.[0]?.url || data.images?.[0]?.url ||
            data.output?.video_url || data.output?.url || data.output?.[0]?.url || data.result?.url;

          if (videoUrl) {
            // Try to download and store
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
            } catch {
              // Fallback: save external URL directly
              await supabase.from("videos").update({
                video_url: videoUrl,
                status: "pronto",
              }).eq("id", video.id);
            }

            await supabase.from("promocoes").update({ status: "video_pronto" }).eq("id", video.promocao_id);
            results.push({ id: video.id, requestId, newStatus: "pronto" });

            await supabase.from("logs_agentes").insert({
              agente: "videomaker",
              mensagem: `Vídeo pronto (via polling) para ${(video as any).promocoes?.origem}→${(video as any).promocoes?.destino}`,
              tipo: "success",
              payload: { videoId: video.id, requestId, videoUrl },
            });
          }
        } else if (status === "failed") {
          await supabase.from("videos").update({
            status: "erro",
            erro_detalhes: data.error || "Video generation failed",
          }).eq("id", video.id);
          results.push({ id: video.id, requestId, newStatus: "erro" });
        } else {
          results.push({ id: video.id, requestId, newStatus: `still_${status}` });
        }
      } catch (err) {
        console.error(`[check] Error checking video ${video.id}: ${String(err)}`);
        results.push({ id: video.id, requestId, newStatus: `check_error: ${String(err)}` });
      }
    }

    return new Response(JSON.stringify({ checked: pendingVideos.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
