import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, RefreshCw, Play, Image as ImageIcon, Search, Volume2 } from "lucide-react";

interface VideoRecord {
  id: string;
  promocao_id: string;
  arte_url: string | null;
  video_url: string | null;
  narration_url: string | null;
  video_final_url: string | null;
  status: string;
  erro_detalhes: string | null;
  created_at: string;
  variation_label: string | null;
  promocoes?: {
    origem: string;
    destino: string;
    preco: number;
    preco_cliente: number | null;
    cia_aerea: string | null;
  };
}

interface GroupedPromo {
  promocao_id: string;
  origem: string;
  destino: string;
  preco: number;
  preco_cliente: number | null;
  cia_aerea: string | null;
  videos: VideoRecord[];
}

const statusColors: Record<string, string> = {
  pendente: "bg-slate-500/20 text-slate-300",
  gerando_arte: "bg-blue-500/20 text-blue-400",
  com_arte: "bg-cyan-500/20 text-cyan-400",
  gerando_video: "bg-amber-500/20 text-amber-400",
  com_video: "bg-orange-500/20 text-orange-400",
  gerando_narracao: "bg-purple-500/20 text-purple-400",
  com_narracao: "bg-violet-500/20 text-violet-400",
  pronto: "bg-emerald-500/20 text-emerald-400",
  erro: "bg-red-500/20 text-red-400",
};

const variationBadges: Record<string, { icon: string; label: string; color: string }> = {
  teaser: { icon: "⚡", label: "Teaser 5s", color: "bg-yellow-500/20 text-yellow-300" },
  promo: { icon: "📢", label: "Promo 10s", color: "bg-blue-500/20 text-blue-300" },
  viral: { icon: "🔥", label: "Viral 10s", color: "bg-red-500/20 text-red-300" },
};

const Videos = () => {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [checking, setChecking] = useState(false);

  const fetchVideos = async () => {
    let query = supabase
      .from("videos")
      .select("*, promocoes(origem, destino, preco, preco_cliente, cia_aerea)")
      .order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;
    if (data) setVideos(data as unknown as VideoRecord[]);
  };

  useEffect(() => {
    fetchVideos();
    const channel = supabase
      .channel("videos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "videos" }, () => fetchVideos())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [statusFilter]);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-video-status`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      const data = await res.json();
      const prontos = data.results?.filter((r: { newStatus: string }) => r.newStatus === "pronto").length || 0;
      if (prontos > 0) toast.success(`${prontos} vídeo(s) ficaram prontos!`);
      else toast.info(`Verificados ${data.checked || 0} vídeos. Nenhum pronto ainda.`);
      fetchVideos();
    } catch {
      toast.error("Erro ao verificar status");
    } finally {
      setChecking(false);
    }
  };

  const handleRegenerate = async (video: VideoRecord) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agente-videomaker`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      body: JSON.stringify({ promocao_id: video.promocao_id }),
    });
    toast.success("Regeneração iniciada");
  };

  // Group videos by promocao_id
  const grouped: GroupedPromo[] = [];
  const map = new Map<string, GroupedPromo>();
  for (const v of videos) {
    const pid = v.promocao_id;
    if (!map.has(pid)) {
      map.set(pid, {
        promocao_id: pid,
        origem: v.promocoes?.origem || "?",
        destino: v.promocoes?.destino || "?",
        preco: v.promocoes?.preco || 0,
        preco_cliente: v.promocoes?.preco_cliente || null,
        cia_aerea: v.promocoes?.cia_aerea || null,
        videos: [],
      });
    }
    map.get(pid)!.videos.push(v);
  }
  map.forEach((g) => grouped.push(g));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Vídeos</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCheckStatus} disabled={checking} className="border-white/20 text-white hover:bg-white/10">
            <Search className="h-4 w-4 mr-1" />
            {checking ? "Verificando..." : "Verificar Status"}
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-white/10">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="gerando_arte">Gerando Arte</SelectItem>
              <SelectItem value="com_arte">Com Arte</SelectItem>
              <SelectItem value="gerando_video">Gerando Vídeo</SelectItem>
              <SelectItem value="pronto">Pronto</SelectItem>
              <SelectItem value="erro">Erro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {grouped.length === 0 && (
        <div className="text-center py-12 text-slate-500">Nenhum vídeo encontrado</div>
      )}

      {grouped.map((group) => {
        const allPronto = group.videos.every((v) => v.status === "pronto");
        const anyError = group.videos.some((v) => v.status === "erro");

        return (
          <Card key={group.promocao_id} className="bg-white/5 border-white/10">
            <CardContent className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg">{group.origem} → {group.destino}</span>
                  <span className="text-amber-400 font-bold">R$ {group.preco_cliente || group.preco}</span>
                  {group.cia_aerea && <span className="text-slate-500 text-sm">{group.cia_aerea}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={allPronto ? "bg-emerald-500/20 text-emerald-400" : anyError ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}>
                    {allPronto ? "✅ Todos prontos" : anyError ? "⚠ Com erros" : "⏳ Em produção"}
                  </Badge>
                  <span className="text-xs text-slate-500">{group.videos.length} vídeo(s)</span>
                </div>
              </div>

              {/* Variation cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {group.videos.map((video) => {
                  const vLabel = video.variation_label || "promo";
                  const badge = variationBadges[vLabel] || variationBadges.promo;

                  return (
                    <div key={video.id} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                      {/* Variation badge */}
                      <div className="p-2 border-b border-white/10 flex items-center justify-between">
                        <Badge className={badge.color}>{badge.icon} {badge.label}</Badge>
                        <Badge className={statusColors[video.status] || ""}>{video.status}</Badge>
                      </div>

                      {/* Arte thumbnail */}
                      <div className="aspect-[9/16] max-h-[240px] bg-slate-800 relative overflow-hidden">
                        {video.arte_url ? (
                          <img src={video.arte_url} alt="Arte" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-slate-600" />
                          </div>
                        )}
                        {(video.video_final_url || video.video_url) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <a href={video.video_final_url || video.video_url || "#"} target="_blank" rel="noopener noreferrer">
                              <Play className="h-10 w-10 text-white" />
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="p-3 space-y-2">
                        {/* Video player */}
                        {(video.video_final_url || video.video_url) && (
                          <video
                            src={video.video_final_url || video.video_url || undefined}
                            controls
                            className="w-full rounded-md"
                            style={{ maxHeight: 160 }}
                          />
                        )}

                        {/* Audio player */}
                        {video.narration_url && (
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-3 w-3 text-purple-400 shrink-0" />
                            <audio src={video.narration_url} controls className="w-full h-8" style={{ minWidth: 0 }} />
                          </div>
                        )}

                        {video.erro_detalhes && (
                          <p className="text-red-400 text-xs">{video.erro_detalhes}</p>
                        )}

                        {/* Status checklist */}
                        <div className="text-xs text-slate-500 space-y-0.5">
                          {video.arte_url && <p>✓ Arte</p>}
                          {video.narration_url && <p>✓ Narração</p>}
                          {(video.video_final_url || video.video_url) && <p>✓ Vídeo</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 flex-wrap">
                          {(video.video_final_url || video.video_url) && (
                            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-xs h-7 px-2" asChild>
                              <a href={video.video_final_url || video.video_url || "#"} download target="_blank" rel="noopener noreferrer">
                                <Download className="h-3 w-3 mr-1" /> Vídeo
                              </a>
                            </Button>
                          )}
                          {video.narration_url && (
                            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-xs h-7 px-2" asChild>
                              <a href={video.narration_url} download target="_blank" rel="noopener noreferrer">
                                <Download className="h-3 w-3 mr-1" /> Áudio
                              </a>
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleRegenerate(video)} className="text-slate-400 hover:text-white text-xs h-7 px-2">
                            <RefreshCw className="h-3 w-3 mr-1" /> Regen
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Videos;
