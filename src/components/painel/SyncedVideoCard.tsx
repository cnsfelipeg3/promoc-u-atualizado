import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Play, Image as ImageIcon } from "lucide-react";

interface VideoRecord {
  id: string;
  promocao_id: string;
  arte_url: string | null;
  video_url: string | null;
  narration_url: string | null;
  video_final_url: string | null;
  status: string;
  erro_detalhes: string | null;
  variation_label: string | null;
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

interface Props {
  video: VideoRecord;
  onRegenerate: (video: VideoRecord) => void;
}

const SyncedVideoCard = ({ video, onRegenerate }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const vLabel = video.variation_label || "promo";
  const badge = variationBadges[vLabel] || variationBadges.promo;
  const videoSrc = video.video_final_url || video.video_url;

  const handlePlay = () => {
    if (audioRef.current && videoRef.current) {
      audioRef.current.currentTime = videoRef.current.currentTime;
      audioRef.current.play();
    }
  };

  const handlePause = () => {
    audioRef.current?.pause();
  };

  const handleSeeked = () => {
    if (audioRef.current && videoRef.current) {
      audioRef.current.currentTime = videoRef.current.currentTime;
    }
  };

  const handleEnded = () => {
    audioRef.current?.pause();
  };

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      {/* Header badges */}
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
        {videoSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Play className="h-10 w-10 text-white" />
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        {/* Synced video + hidden audio */}
        {videoSrc && (
          <>
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              className="w-full rounded-md"
              style={{ maxHeight: 160 }}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeeked={handleSeeked}
              onEnded={handleEnded}
            />
            {video.narration_url && (
              <audio ref={audioRef} src={video.narration_url} preload="auto" />
            )}
            <p className="text-[10px] text-emerald-400/70">🔊 Narração sincronizada com o vídeo</p>
          </>
        )}

        {/* Standalone audio if no video yet */}
        {!videoSrc && video.narration_url && (
          <audio src={video.narration_url} controls className="w-full h-8" style={{ minWidth: 0 }} />
        )}

        {video.erro_detalhes && (
          <p className="text-red-400 text-xs">{video.erro_detalhes}</p>
        )}

        {/* Status checklist */}
        <div className="text-xs text-slate-500 space-y-0.5">
          {video.arte_url && <p>✓ Arte</p>}
          {video.narration_url && <p>✓ Narração</p>}
          {videoSrc && <p>✓ Vídeo</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-1 flex-wrap">
          {videoSrc && (
            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-xs h-7 px-2" asChild>
              <a href={videoSrc} download target="_blank" rel="noopener noreferrer">
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
          <Button size="sm" variant="ghost" onClick={() => onRegenerate(video)} className="text-slate-400 hover:text-white text-xs h-7 px-2">
            <RefreshCw className="h-3 w-3 mr-1" /> Regen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SyncedVideoCard;
