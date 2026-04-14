import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings, Save, Key } from "lucide-react";

interface ConfigState {
  margem_padrao: number;
  score_auto_aprovacao: number;
  intervalo_cacador: number;
  modelo_imagem: string;
  modelo_video: string;
  elevenlabs_voice: string;
  fontes: string;
}

const Configuracoes = () => {
  const [config, setConfig] = useState<ConfigState>({
    margem_padrao: 10,
    score_auto_aprovacao: 9,
    intervalo_cacador: 30,
    modelo_imagem: "",
    modelo_video: "",
    elevenlabs_voice: "default",
    fontes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadConfigs = async () => {
      const { data } = await supabase.from("config_agentes").select("*");
      if (!data) return;

      const cacador = data.find((d) => d.agente === "cacador");
      const precificador = data.find((d) => d.agente === "precificador");
      const videomaker = data.find((d) => d.agente === "videomaker");
      const aprovador = data.find((d) => d.agente === "aprovador");

      setConfig({
        margem_padrao: (precificador?.config as Record<string, unknown>)?.margem_padrao as number || 10,
        score_auto_aprovacao: (aprovador?.config as Record<string, unknown>)?.score_auto_aprovacao as number || 9,
        intervalo_cacador: (cacador?.config as Record<string, unknown>)?.intervalo_min as number || 30,
        modelo_imagem: (videomaker?.config as Record<string, unknown>)?.modelo_imagem as string || "",
        modelo_video: (videomaker?.config as Record<string, unknown>)?.modelo_video as string || "",
        elevenlabs_voice: (videomaker?.config as Record<string, unknown>)?.elevenlabs_voice as string || "default",
        fontes: ((cacador?.config as Record<string, unknown>)?.fontes as string[] || []).join(", "),
      });
    };
    loadConfigs();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from("config_agentes").update({
        config: { margem_padrao: config.margem_padrao, score_minimo_aprovacao: 7 },
      }).eq("agente", "precificador");

      await supabase.from("config_agentes").update({
        config: { modo: "misto", score_auto_aprovacao: config.score_auto_aprovacao },
      }).eq("agente", "aprovador");

      await supabase.from("config_agentes").update({
        config: {
          intervalo_min: config.intervalo_cacador,
          fontes: config.fontes.split(",").map((f) => f.trim()).filter(Boolean),
        },
      }).eq("agente", "cacador");

      await supabase.from("config_agentes").update({
        config: {
          modelo_imagem: config.modelo_imagem,
          modelo_video: config.modelo_video,
          elevenlabs_voice: config.elevenlabs_voice,
        },
      }).eq("agente", "videomaker");

      toast.success("Configurações salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Settings className="h-6 w-6" /> Configurações
      </h1>

      {/* API Keys Info */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-amber-400 text-lg flex items-center gap-2">
            <Key className="h-5 w-5" /> API Keys Necessárias
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-200/80 space-y-2">
          <p>As seguintes chaves precisam ser configuradas como secrets do backend:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>ANTHROPIC_API_KEY</strong> — Chave da API Anthropic (Claude) para scoring de promoções</li>
            <li><strong>HF_API_KEY</strong> — Chave da API Higgsfield para geração de imagens e vídeos</li>
            <li><strong>HF_API_SECRET</strong> — Secret da API Higgsfield</li>
            <li><strong>APIFY_TOKEN</strong> — Token do Apify para scraping de sites</li>
            <li><strong>ELEVENLABS_API_KEY</strong> — Chave da API ElevenLabs para narração</li>
          </ul>
          <p className="text-xs text-amber-200/60 mt-3">
            Configure no painel do Lovable Cloud → Secrets. Os agentes funcionarão com funcionalidade limitada sem as chaves.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pricing Config */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Precificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Margem padrão (%)</label>
              <Input
                type="number"
                value={config.margem_padrao}
                onChange={(e) => setConfig({ ...config, margem_padrao: Number(e.target.value) })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Score mínimo para auto-aprovação (0-10)</label>
              <Input
                type="number"
                min={0}
                max={10}
                value={config.score_auto_aprovacao}
                onChange={(e) => setConfig({ ...config, score_auto_aprovacao: Number(e.target.value) })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Crawler Config */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Caçador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Intervalo de execução (minutos)</label>
              <Input
                type="number"
                value={config.intervalo_cacador}
                onChange={(e) => setConfig({ ...config, intervalo_cacador: Number(e.target.value) })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Fontes (separadas por vírgula)</label>
              <Input
                value={config.fontes}
                onChange={(e) => setConfig({ ...config, fontes: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="site1.com, site2.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* VideoMaker Config */}
        <Card className="bg-white/5 border-white/10 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white text-lg">VideoMaker</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Modelo de Imagem (Higgsfield)</label>
              <Input
                value={config.modelo_imagem}
                onChange={(e) => setConfig({ ...config, modelo_imagem: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Modelo de Vídeo (Higgsfield)</label>
              <Input
                value={config.modelo_video}
                onChange={(e) => setConfig({ ...config, modelo_video: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Voz ElevenLabs</label>
              <Input
                value={config.elevenlabs_voice}
                onChange={(e) => setConfig({ ...config, elevenlabs_voice: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
        <Save className="h-4 w-4 mr-2" />
        {saving ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  );
};

export default Configuracoes;
