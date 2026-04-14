import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, RefreshCw, Play, Image as ImageIcon, Search } from "lucide-react";

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
  promocoes?: {
    origem: string;
    destino: string;
    preco: number;
    preco_cliente: number | null;
    cia_aerea: string | null;
  };
}

const videoStatusColors: Record<string, string> = {
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

const Videos = () => {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchVideos = async () => {
    let query = supabase.from("videos").select("*, promocoes(origem, destino, preco, preco_cliente, cia_aerea)").order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;
    if (data) setVideos(data as unknown as VideoRecord[]);
  };

  useEffect(() => {
    fetchVideos();
    const channel = supabase.channel("videos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "videos" }, () => fetchVideos())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [statusFilter]);

  const handleRegenerate = async (video: VideoRecord) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agente-videomaker`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      body: JSON.stringify({ promocao_id: video.promocao_id }),
    });
    toast.success("Regeneração de vídeo iniciada");
  };

  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-video-status`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      const data = await res.json();
      const prontos = data.results?.filter((r: any) => r.newStatus === "pronto").length || 0;
      if (prontos > 0) {
        toast.success(`${prontos} vídeo(s) ficaram prontos!`);
      } else {
        toast.info(`Verificados ${data.checked || 0} vídeos. Nenhum pronto ainda.`);
      }
      fetchVideos();
    } catch {
      toast.error("Erro ao verificar status");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Vídeos</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckStatus}
            disabled={checking}
            className="border-white/20 text-white hover:bg-white/10"
          >
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="bg-white/5 border-white/10 overflow-hidden">
            {/* Thumbnail */}
            <div className="aspect-[9/16] max-h-[300px] bg-slate-800 relative overflow-hidden">
              {video.arte_url ? (
                <img src={video.arte_url} alt="Arte" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-slate-600" />
                </div>
              )}
              {video.video_final_url || video.video_url ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <a href={video.video_final_url || video.video_url || "#"} target="_blank" rel="noopener noreferrer">
                    <Play className="h-12 w-12 text-white" />
                  </a>
                </div>
              ) : null}
            </div>

            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium text-sm">
                  {video.promocoes?.origem} → {video.promocoes?.destino}
                </span>
                <Badge className={videoStatusColors[video.status] || ""}>
                  {video.status}
                </Badge>
              </div>

              {video.promocoes && (
                <p className="text-amber-400 font-bold">
                  R$ {video.promocoes.preco_cliente || video.promocoes.preco}
                  <span className="text-slate-500 text-xs ml-2">{video.promocoes.cia_aerea}</span>
                </p>
              )}

              {video.erro_detalhes && (
                <p className="text-red-400 text-xs">{video.erro_detalhes}</p>
              )}

              <div className="text-xs text-slate-500 space-y-1">
                {video.arte_url && <p>✓ Arte gerada</p>}
                {video.narration_url && <p>✓ Narração gerada</p>}
                {(video.video_final_url || video.video_url) && <p>✓ Vídeo pronto</p>}
              </div>

              <div className="flex gap-2">
                {(video.video_final_url || video.video_url) && (
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                    <a href={video.video_final_url || video.video_url || "#"} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-3 w-3 mr-1" /> Download
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => handleRegenerate(video)} className="text-slate-400 hover:text-white">
                  <RefreshCw className="h-3 w-3 mr-1" /> Regenerar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {videos.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">Nenhum vídeo encontrado</div>
        )}
      </div>
    </div>
  );
};

export default Videos;
