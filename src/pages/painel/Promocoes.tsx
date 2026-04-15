import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, CheckCircle, XCircle, RefreshCw, Video, Eye, Plus, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Json } from "@/integrations/supabase/types";

interface Promo {
  id: string;
  origem: string;
  destino: string;
  preco: number;
  preco_normal: number | null;
  pct_desconto: number | null;
  preco_cliente: number | null;
  cia_aerea: string | null;
  tipo_voo: string;
  classe: string;
  validade: string | null;
  bagagem: string | null;
  escalas: string | null;
  score: number | null;
  score_justificativa: string | null;
  status: string;
  fonte: string | null;
  created_at: string;
  prompt_variations: Json | null;
  overlay_config: Json | null;
  narration_script: string | null;
  art_prompt: string | null;
  video_prompt: string | null;
}

const statusColors: Record<string, string> = {
  pendente: "bg-slate-500/20 text-slate-300",
  precificada: "bg-blue-500/20 text-blue-400",
  aprovada: "bg-green-500/20 text-green-400",
  rejeitada: "bg-red-500/20 text-red-400",
  em_producao: "bg-amber-500/20 text-amber-400",
  video_pronto: "bg-emerald-500/20 text-emerald-400",
  publicada: "bg-purple-500/20 text-purple-400",
  arquivada: "bg-gray-500/20 text-gray-400",
};

const emptyForm = {
  origem: "", destino: "", preco: "", preco_normal: "", pct_desconto: "",
  cia_aerea: "", tipo_voo: "ida_volta", classe: "economica", validade: "",
  bagagem: "", escalas: "", fonte: "manual",
};

const Promocoes = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInsert, setShowInsert] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showPartA, setShowPartA] = useState(false);
  const [showPartB, setShowPartB] = useState(false);
  const [showNarration, setShowNarration] = useState(false);
  const [showOverlays, setShowOverlays] = useState(false);

  const fetchPromos = async () => {
    let query = supabase.from("promocoes").select("*").order("created_at", { ascending: false }).limit(200);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;
    if (data) setPromos(data);
  };

  useEffect(() => {
    fetchPromos();
    const channel = supabase.channel("promos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "promocoes" }, () => fetchPromos())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [statusFilter]);

  const filtered = promos.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.origem.toLowerCase().includes(s) || p.destino.toLowerCase().includes(s) || (p.cia_aerea || "").toLowerCase().includes(s);
  });

  const handleApprove = async (id: string) => {
    setLoading(true);
    await supabase.from("promocoes").update({ status: "aprovada" }).eq("id", id);
    toast.success("Promoção aprovada!");
    setSelected(null);
    setLoading(false);
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    await supabase.from("promocoes").update({ status: "rejeitada" }).eq("id", id);
    toast.success("Promoção rejeitada");
    setSelected(null);
    setLoading(false);
  };

  const handleReprocess = async (id: string) => {
    setLoading(true);
    await supabase.from("promocoes").update({ status: "pendente", score: 0, score_justificativa: null, preco_cliente: null }).eq("id", id);
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agente-precificador`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      body: JSON.stringify({ promocao_id: id }),
    });
    toast.success("Reenviado para precificação");
    setLoading(false);
  };

  const handleGenerateVideo = async (id: string) => {
    setLoading(true);
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agente-videomaker`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      body: JSON.stringify({ promocao_id: id }),
    });
    toast.success("Produção de vídeo iniciada");
    setLoading(false);
  };

  const handleInsertPromo = async () => {
    if (!form.origem || !form.destino || !form.preco) {
      toast.error("Preencha pelo menos origem, destino e preço");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("promocoes").insert({
      origem: form.origem,
      destino: form.destino,
      preco: Number(form.preco),
      preco_normal: form.preco_normal ? Number(form.preco_normal) : null,
      pct_desconto: form.pct_desconto ? Number(form.pct_desconto) : null,
      cia_aerea: form.cia_aerea || null,
      tipo_voo: form.tipo_voo,
      classe: form.classe,
      validade: form.validade || null,
      bagagem: form.bagagem || null,
      escalas: form.escalas || null,
      fonte: form.fonte || "manual",
      status: "pendente",
    });
    if (error) {
      toast.error("Erro ao inserir promoção");
    } else {
      toast.success("Promoção inserida com sucesso!");
      setForm(emptyForm);
      setShowInsert(false);
    }
    setLoading(false);
  };

  const updateForm = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Promoções</h1>
        <Button onClick={() => setShowInsert(true)} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="h-4 w-4 mr-2" /> Inserir Promoção
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por origem, destino ou cia aérea..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e293b] border-white/10">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="precificada">Precificada</SelectItem>
            <SelectItem value="aprovada">Aprovada</SelectItem>
            <SelectItem value="rejeitada">Rejeitada</SelectItem>
            <SelectItem value="em_producao">Em Produção</SelectItem>
            <SelectItem value="video_pronto">Vídeo Pronto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-white/5 border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-slate-400 font-medium">Rota</th>
                <th className="text-left p-3 text-slate-400 font-medium">Preço</th>
                <th className="text-left p-3 text-slate-400 font-medium hidden md:table-cell">Desconto</th>
                <th className="text-left p-3 text-slate-400 font-medium hidden md:table-cell">CIA</th>
                <th className="text-left p-3 text-slate-400 font-medium">Score</th>
                <th className="text-left p-3 text-slate-400 font-medium">Status</th>
                <th className="text-left p-3 text-slate-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 text-white font-medium">{p.origem} → {p.destino}</td>
                  <td className="p-3">
                    <span className="text-amber-400 font-bold">R$ {p.preco_cliente || p.preco}</span>
                    {p.preco_normal && <span className="text-slate-500 text-xs line-through ml-2">R$ {p.preco_normal}</span>}
                  </td>
                  <td className="p-3 text-emerald-400 hidden md:table-cell">{p.pct_desconto ? `${p.pct_desconto}%` : "-"}</td>
                  <td className="p-3 text-slate-300 hidden md:table-cell">{p.cia_aerea || "-"}</td>
                  <td className="p-3">
                    <span className={`font-bold ${(p.score || 0) >= 7 ? "text-emerald-400" : (p.score || 0) >= 4 ? "text-amber-400" : "text-slate-400"}`}>
                      {p.score || "-"}
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge className={statusColors[p.status] || "bg-slate-500/20 text-slate-300"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(p)} className="text-slate-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Nenhuma promoção encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insert Modal */}
      <Dialog open={showInsert} onOpenChange={setShowInsert}>
        <DialogContent className="bg-[#1e293b] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Inserir Promoção Manual</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400">Origem *</Label>
              <Input value={form.origem} onChange={e => updateForm("origem", e.target.value)} placeholder="Ex: Guarulhos (GRU)" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-slate-400">Destino *</Label>
              <Input value={form.destino} onChange={e => updateForm("destino", e.target.value)} placeholder="Ex: Orlando (MCO)" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-slate-400">Preço (R$) *</Label>
              <Input type="number" value={form.preco} onChange={e => updateForm("preco", e.target.value)} placeholder="2919" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-slate-400">Preço Normal (R$)</Label>
              <Input type="number" value={form.preco_normal} onChange={e => updateForm("preco_normal", e.target.value)} placeholder="5500" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-slate-400">Desconto (%)</Label>
              <Input type="number" value={form.pct_desconto} onChange={e => updateForm("pct_desconto", e.target.value)} placeholder="47" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-slate-400">Cia Aérea</Label>
              <Input value={form.cia_aerea} onChange={e => updateForm("cia_aerea", e.target.value)} placeholder="LATAM" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-slate-400">Tipo de Voo</Label>
              <Select value={form.tipo_voo} onValueChange={v => updateForm("tipo_voo", v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-white/10">
                  <SelectItem value="ida_volta">Ida e Volta</SelectItem>
                  <SelectItem value="ida">Só Ida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400">Classe</Label>
              <Select value={form.classe} onValueChange={v => updateForm("classe", v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-white/10">
                  <SelectItem value="economica">Econômica</SelectItem>
                  <SelectItem value="executiva">Executiva</SelectItem>
                  <SelectItem value="primeira">Primeira</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400">Validade</Label>
              <Input value={form.validade} onChange={e => updateForm("validade", e.target.value)} placeholder="10/05 a 18/05/2026" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-slate-400">Bagagem</Label>
              <Input value={form.bagagem} onChange={e => updateForm("bagagem", e.target.value)} placeholder="Bagagem despachada inclusa" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-slate-400">Escalas</Label>
              <Input value={form.escalas} onChange={e => updateForm("escalas", e.target.value)} placeholder="Voo direto" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-slate-400">Fonte</Label>
              <Input value={form.fonte} onChange={e => updateForm("fonte", e.target.value)} placeholder="manual" className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowInsert(false)} className="border-white/20 text-white hover:bg-white/10">Cancelar</Button>
            <Button onClick={handleInsertPromo} disabled={loading} className="bg-amber-600 hover:bg-amber-700">
              {loading ? "Inserindo..." : "Inserir Promoção"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-[#1e293b] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selected?.origem} → {selected?.destino}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-slate-400">Preço Original</p>
                  <p className="text-lg font-bold text-slate-300">R$ {selected.preco_normal || selected.preco}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-slate-400">Preço Cliente</p>
                  <p className="text-lg font-bold text-amber-400">R$ {selected.preco_cliente || selected.preco}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-slate-400">Desconto</p>
                  <p className="text-lg font-bold text-emerald-400">{selected.pct_desconto ? `${selected.pct_desconto}%` : "N/A"}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-slate-400">Score IA</p>
                  <p className="text-lg font-bold text-blue-400">{selected.score || "N/A"}/10</p>
                </div>
              </div>

              {selected.score_justificativa && (
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Justificativa do Score</p>
                  <p className="text-sm text-slate-300">{selected.score_justificativa}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "CIA Aérea", value: selected.cia_aerea },
                  { label: "Tipo de Voo", value: selected.tipo_voo },
                  { label: "Classe", value: selected.classe },
                  { label: "Validade", value: selected.validade },
                  { label: "Bagagem", value: selected.bagagem },
                  { label: "Escalas", value: selected.escalas },
                  { label: "Fonte", value: selected.fonte },
                  { label: "Status", value: selected.status },
                ].map((item) => (
                  <div key={item.label}>
                    <span className="text-slate-500">{item.label}:</span>{" "}
                    <span className="text-slate-300">{item.value || "N/A"}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {selected.status === "precificada" && (
                  <>
                    <Button onClick={() => handleApprove(selected.id)} disabled={loading} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" /> Aprovar
                    </Button>
                    <Button onClick={() => handleReject(selected.id)} disabled={loading} variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" /> Rejeitar
                    </Button>
                  </>
                )}
                <Button onClick={() => handleReprocess(selected.id)} disabled={loading} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <RefreshCw className="h-4 w-4 mr-2" /> Reavaliar
                </Button>
                {(selected.status === "aprovada" || selected.status === "precificada") && (
                  <Button onClick={() => handleGenerateVideo(selected.id)} disabled={loading} className="bg-amber-600 hover:bg-amber-700">
                    <Video className="h-4 w-4 mr-2" /> Gerar Vídeo
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Promocoes;
