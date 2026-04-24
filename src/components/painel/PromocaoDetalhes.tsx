import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Copy, Check, RefreshCw, Sparkles, X, Save, Download, Loader2,
  Mic, Image as ImageIcon, Film, Hash, MessageSquare,
} from "lucide-react";

interface Props {
  promocaoId: string | null;
  open: boolean;
  onClose: () => void;
  onChange?: () => void;
}

interface Promocao {
  id: string;
  origem: string;
  destino: string;
  preco: number;
  preco_normal: number | null;
  pct_desconto: number | null;
  cia_aerea: string | null;
  status: string;
  score: number | null;
  score_justificativa: string | null;
  titulo_video: string | null;
  hooks: any;
  narration_script: string | null;
  art_prompt: string | null;
  video_prompt: string | null;
  video_prompts: any;
  text_overlays: any;
  cta_text: string | null;
  hashtags: any;
  audio_narracao_url: string | null;
  higgsfield_request_id: string | null;
  duracao_narracao_s: number | null;
  clipes_urls: any;
  clipes_total: number | null;
  clipes_recebidos: number | null;
  video_final_url: string | null;
}

const statusColors: Record<string, string> = {
  pendente: "bg-slate-500/20 text-slate-300",
  precificada: "bg-blue-500/20 text-blue-400",
  aprovada: "bg-green-500/20 text-green-400",
  rejeitada: "bg-red-500/20 text-red-400",
  em_producao: "bg-amber-500/20 text-amber-400",
  video_pronto: "bg-emerald-500/20 text-emerald-400",
  publicada: "bg-purple-500/20 text-purple-400",
};

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button size="sm" variant="ghost" onClick={handle} className="h-7 px-2 text-slate-400 hover:text-white">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {label && <span className="ml-1 text-xs">{label}</span>}
    </Button>
  );
}

export default function PromocaoDetalhes({ promocaoId, open, onClose, onChange }: Props) {
  const [promo, setPromo] = useState<Promocao | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [editScript, setEditScript] = useState("");
  const [editCta, setEditCta] = useState("");
  const [editOverlays, setEditOverlays] = useState<Array<{ tempo_s: number; texto: string }>>([]);
  const [video, setVideo] = useState<{ video_final_url: string | null; status: string | null } | null>(null);

  const fetchData = async () => {
    if (!promocaoId) return;
    setLoading(true);
    const { data } = await supabase.from("promocoes").select("*").eq("id", promocaoId).maybeSingle();
    if (data) {
      setPromo(data as any);
      setEditScript(data.narration_script ?? "");
      setEditCta(data.cta_text ?? "");
      setEditOverlays(Array.isArray(data.text_overlays) ? (data.text_overlays as any) : []);
    }
    const { data: vid } = await supabase
      .from("videos").select("video_final_url, status")
      .eq("promocao_id", promocaoId)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    setVideo(vid as any);
    setLoading(false);
  };

  useEffect(() => {
    if (open && promocaoId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, promocaoId]);

  // Realtime: refresh quando status/audio mudam
  useEffect(() => {
    if (!open || !promocaoId) return;
    const ch = supabase.channel(`promo-detail-${promocaoId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "promocoes", filter: `id=eq.${promocaoId}` }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "videos", filter: `promocao_id=eq.${promocaoId}` }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, promocaoId]);

  if (!promo && !loading) return null;

  const handleSave = async () => {
    if (!promo) return;
    setBusy("save");
    const { error } = await supabase.from("promocoes").update({
      narration_script: editScript,
      cta_text: editCta,
      text_overlays: editOverlays as any,
    }).eq("id", promo.id);
    setBusy(null);
    if (error) toast.error("Erro ao salvar", { description: error.message });
    else { toast.success("Alterações salvas"); onChange?.(); }
  };

  const handleRegenerar = async () => {
    if (!promo) return;
    if (!confirm("Isso vai apagar o pacote atual e gerar um novo. Confirma?")) return;
    setBusy("regenerar");
    const { data, error } = await supabase.functions.invoke("regerar-pacote", {
      body: { promocao_id: promo.id },
    });
    setBusy(null);
    if (error || !data?.ok) {
      toast.error("Falha ao regenerar", { description: error?.message ?? data?.error });
      return;
    }
    toast.success("Pacote regenerado", { description: `Score: ${data.score}/100` });
    fetchData();
    onChange?.();
  };

  const handleProduzir = async () => {
    if (!promo) return;
    setBusy("produzir");
    const { data, error } = await supabase.functions.invoke("produzir-manual", {
      body: { promocao_id: promo.id },
    });
    setBusy(null);
    if (error || !data?.ok) {
      toast.error("Falha", { description: error?.message ?? data?.error });
      return;
    }
    toast.success("Produção iniciada", { description: "Narração e vídeo rodando em background" });
    fetchData();
    onChange?.();
  };

  const handleRejeitar = async () => {
    if (!promo) return;
    setBusy("rejeitar");
    await supabase.from("promocoes").update({ status: "rejeitada" }).eq("id", promo.id);
    setBusy(null);
    toast.success("Promoção rejeitada");
    onChange?.();
    onClose();
  };

  const updateOverlay = (i: number, field: "tempo_s" | "texto", value: string) => {
    setEditOverlays((prev) => prev.map((ov, idx) =>
      idx === i ? { ...ov, [field]: field === "tempo_s" ? Number(value) : value } : ov
    ));
  };

  const removeOverlay = (i: number) => {
    setEditOverlays((prev) => prev.filter((_, idx) => idx !== i));
  };

  const addOverlay = () => {
    setEditOverlays((prev) => [...prev, { tempo_s: 0, texto: "" }]);
  };

  const hooks = Array.isArray(promo?.hooks) ? promo!.hooks : [];
  const hashtags = Array.isArray(promo?.hashtags) ? promo!.hashtags : [];
  const hashtagsString = hashtags.map((h: string) => `#${h}`).join(" ");
  const podeAprovar = promo && ["precificada", "pendente"].includes(promo.status) && promo.narration_script;
  const charCount = editScript.length;
  const charClass = charCount < 200 ? "text-amber-400" : charCount > 600 ? "text-red-400" : "text-emerald-400";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#0f172a] border-white/10 text-white max-w-4xl max-h-[92vh] overflow-auto">
        {loading || !promo ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-xl mb-1">
                    {promo.titulo_video || `${promo.origem} → ${promo.destino}`}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={statusColors[promo.status] || "bg-slate-500/20"}>{promo.status}</Badge>
                    <span className="text-xs text-slate-400">{promo.origem} → {promo.destino}</span>
                    {promo.cia_aerea && <span className="text-xs text-slate-400">• {promo.cia_aerea}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-3xl font-black leading-none ${
                    (promo.score ?? 0) >= 75 ? "text-emerald-400" : (promo.score ?? 0) >= 50 ? "text-amber-400" : "text-red-400"
                  }`}>
                    {promo.score ?? "—"}<span className="text-base text-slate-500">/100</span>
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Score</div>
                </div>
              </div>
              {promo.score_justificativa && (
                <p className="text-sm text-slate-400 mt-2 italic">{promo.score_justificativa}</p>
              )}
            </DialogHeader>

            <div className="space-y-5 mt-2">
              {/* Preço */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-white/5 border-white/10 p-3">
                  <p className="text-[10px] text-slate-500 uppercase">Preço normal</p>
                  <p className="text-lg font-bold text-slate-400 line-through">R$ {promo.preco_normal ?? "—"}</p>
                </Card>
                <Card className="bg-white/5 border-white/10 p-3">
                  <p className="text-[10px] text-slate-500 uppercase">Preço promo</p>
                  <p className="text-lg font-bold text-amber-400">R$ {promo.preco}</p>
                </Card>
                <Card className="bg-white/5 border-white/10 p-3">
                  <p className="text-[10px] text-slate-500 uppercase">Desconto</p>
                  <p className="text-lg font-bold text-emerald-400">{promo.pct_desconto ? `${promo.pct_desconto}%` : "—"}</p>
                </Card>
              </div>

              {/* Hooks */}
              {hooks.length > 0 && (
                <Section icon={<MessageSquare className="h-4 w-4" />} title="Hooks (variações de abertura)">
                  <div className="space-y-2">
                    {hooks.map((h: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded bg-white/5 border border-white/10">
                        <span className="text-xs text-amber-400 font-mono mt-0.5">#{i + 1}</span>
                        <p className="flex-1 text-sm text-slate-200">{h}</p>
                        <CopyButton text={h} />
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Narração */}
              <Section
                icon={<Mic className="h-4 w-4" />}
                title="Narração (script)"
                action={<span className={`text-xs font-mono ${charClass}`}>{charCount} chars</span>}
              >
                <Textarea
                  value={editScript}
                  onChange={(e) => setEditScript(e.target.value)}
                  rows={5}
                  className="bg-white/5 border-white/10 text-white text-sm resize-none"
                  placeholder="Roteiro da narração…"
                />
                {promo.audio_narracao_url ? (
                  <div className="flex items-center gap-2 mt-2">
                    <audio controls src={promo.audio_narracao_url} className="flex-1 h-9" />
                    <Button asChild size="sm" variant="ghost" className="text-slate-400">
                      <a href={promo.audio_narracao_url} download target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-2 italic">Áudio ainda não gerado</p>
                )}
              </Section>

              {/* Prompts visuais */}
              {(promo.art_prompt || promo.video_prompt) && (
                <div className="grid md:grid-cols-2 gap-3">
                  {promo.art_prompt && (
                    <Section icon={<ImageIcon className="h-4 w-4" />} title="Art Prompt" action={<CopyButton text={promo.art_prompt} />}>
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap bg-black/40 p-3 rounded font-mono leading-relaxed max-h-48 overflow-auto">
                        {promo.art_prompt}
                      </pre>
                    </Section>
                  )}
                  {promo.video_prompt && (
                    <Section icon={<Film className="h-4 w-4" />} title="Video Prompt" action={<CopyButton text={promo.video_prompt} />}>
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap bg-black/40 p-3 rounded font-mono leading-relaxed max-h-48 overflow-auto">
                        {promo.video_prompt}
                      </pre>
                    </Section>
                  )}
                </div>
              )}

              {/* Text Overlays */}
              {editOverlays.length > 0 && (
                <Section
                  icon={<MessageSquare className="h-4 w-4" />}
                  title={`Text Overlays (${editOverlays.length})`}
                  action={<Button size="sm" variant="ghost" onClick={addOverlay} className="h-7 text-xs text-amber-400">+ Adicionar</Button>}
                >
                  <div className="space-y-2">
                    {editOverlays.map((ov, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={ov.tempo_s}
                          onChange={(e) => updateOverlay(i, "tempo_s", e.target.value)}
                          className="w-20 bg-white/5 border-white/10 text-white text-xs"
                          placeholder="seg"
                        />
                        <Input
                          value={ov.texto}
                          onChange={(e) => updateOverlay(i, "texto", e.target.value)}
                          className="flex-1 bg-white/5 border-white/10 text-white text-xs uppercase"
                          placeholder="TEXTO DO OVERLAY"
                        />
                        <Button size="sm" variant="ghost" onClick={() => removeOverlay(i)} className="h-9 w-9 p-0 text-slate-500 hover:text-red-400">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* CTA */}
              <Section icon={<Sparkles className="h-4 w-4" />} title="Call-to-action">
                <Input
                  value={editCta}
                  onChange={(e) => setEditCta(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Comente EU QUERO pra receber…"
                />
              </Section>

              {/* Hashtags */}
              {hashtags.length > 0 && (
                <Section
                  icon={<Hash className="h-4 w-4" />}
                  title={`Hashtags (${hashtags.length})`}
                  action={<CopyButton text={hashtagsString} label="Copiar tudo" />}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {hashtags.map((h: string, i: number) => (
                      <Badge key={i} variant="outline" className="border-white/10 text-slate-300 bg-white/5">
                        #{h}
                      </Badge>
                    ))}
                  </div>
                </Section>
              )}

              {/* Vídeo gerado */}
              {(video?.video_final_url || promo.higgsfield_request_id) && (
                <Section icon={<Film className="h-4 w-4" />} title="Vídeo final">
                  {video?.video_final_url ? (
                    <div className="space-y-2">
                      <video controls src={video.video_final_url} className="w-full max-h-96 rounded bg-black" />
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <a href={video.video_final_url} download target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4 mr-2" /> Download
                          </a>
                        </Button>
                        <Badge className="bg-emerald-500/20 text-emerald-400 self-center">{video.status}</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                      Vídeo em produção (request: {promo.higgsfield_request_id?.slice(0, 12)}…)
                    </div>
                  )}
                </Section>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-white/10 sticky bottom-0 bg-[#0f172a]">
              <Button onClick={handleSave} disabled={busy === "save"} className="bg-amber-600 hover:bg-amber-700">
                {busy === "save" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar alterações
              </Button>

              {podeAprovar && (
                <Button onClick={handleProduzir} disabled={!!busy} className="bg-emerald-600 hover:bg-emerald-700">
                  {busy === "produzir" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Aprovar e Produzir
                </Button>
              )}

              <Button onClick={handleRegenerar} disabled={!!busy} variant="destructive">
                {busy === "regenerar" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Regenerar pacote
              </Button>

              {promo.status !== "rejeitada" && (
                <Button onClick={handleRejeitar} disabled={!!busy} variant="ghost" className="text-slate-400 hover:text-red-400">
                  Rejeitar
                </Button>
              )}

              <div className="flex-1" />
              <Button onClick={onClose} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ icon, title, action, children }: { icon: React.ReactNode; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
          {icon} {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}
