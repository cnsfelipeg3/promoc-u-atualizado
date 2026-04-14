import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Play, Bot, Search, Tag, Video, Shield } from "lucide-react";

interface AgentConfig {
  id: string;
  agente: string;
  ativo: boolean;
  config: Record<string, unknown> | null;
  updated_at: string;
}

interface AgentMeta {
  name: string;
  description: string;
  icon: typeof Bot;
  functionName: string;
}

const agentMeta: Record<string, AgentMeta> = {
  cacador: { name: "Caçador", description: "Busca promoções em sites especializados", icon: Search, functionName: "agente-cacador" },
  precificador: { name: "Precificador", description: "Avalia e precifica promoções com IA", icon: Tag, functionName: "agente-precificador" },
  videomaker: { name: "VideoMaker", description: "Gera arte, narração e vídeo para promoções", icon: Video, functionName: "agente-videomaker" },
  aprovador: { name: "Aprovador", description: "Gerencia aprovação automática e manual", icon: Shield, functionName: "" },
};

const Agentes = () => {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [todayLogs, setTodayLogs] = useState<Record<string, { total: number; errors: number; lastRun: string }>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const fetchAgents = async () => {
    const { data } = await supabase.from("config_agentes").select("*");
    if (data) setAgents(data.map(d => ({ ...d, config: (d.config || {}) as Record<string, unknown> })));
  };

  const fetchTodayLogs = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data } = await supabase.from("logs_agentes").select("*").gte("created_at", today.toISOString());
    if (!data) return;

    const stats: Record<string, { total: number; errors: number; lastRun: string }> = {};
    for (const log of data) {
      if (!stats[log.agente]) stats[log.agente] = { total: 0, errors: 0, lastRun: "" };
      stats[log.agente].total++;
      if (log.tipo === "error") stats[log.agente].errors++;
      if (!stats[log.agente].lastRun || log.created_at > stats[log.agente].lastRun) {
        stats[log.agente].lastRun = log.created_at;
      }
    }
    setTodayLogs(stats);
  };

  useEffect(() => {
    fetchAgents();
    fetchTodayLogs();
  }, []);

  const toggleAgent = async (agent: AgentConfig) => {
    await supabase.from("config_agentes").update({ ativo: !agent.ativo }).eq("id", agent.id);
    toast.success(`${agentMeta[agent.agente]?.name || agent.agente} ${!agent.ativo ? "ativado" : "desativado"}`);
    fetchAgents();
  };

  const forceRun = async (agent: AgentConfig) => {
    const meta = agentMeta[agent.agente];
    if (!meta?.functionName) {
      toast.error("Este agente não pode ser executado manualmente");
      return;
    }
    setLoading(agent.agente);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${meta.functionName}`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      toast.success(`${meta.name} executado com sucesso!`);
    } catch (err) {
      toast.error(`Erro ao executar ${meta.name}`);
    }
    setLoading(null);
    fetchTodayLogs();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Central dos Agentes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const meta = agentMeta[agent.agente] || { name: agent.agente, description: "", icon: Bot, functionName: "" };
          const Icon = meta.icon;
          const stats = todayLogs[agent.agente];

          return (
            <Card key={agent.id} className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Icon className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{meta.name}</CardTitle>
                      <p className="text-xs text-slate-400">{meta.description}</p>
                    </div>
                  </div>
                  <Switch checked={agent.ativo} onCheckedChange={() => toggleAgent(agent)} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={agent.ativo ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                    {agent.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-slate-400">Execuções hoje</p>
                    <p className="text-lg font-bold text-white">{stats?.total || 0}</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-slate-400">Erros hoje</p>
                    <p className="text-lg font-bold text-red-400">{stats?.errors || 0}</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-slate-400">Última exec.</p>
                    <p className="text-xs font-medium text-slate-300">
                      {stats?.lastRun ? new Date(stats.lastRun).toLocaleTimeString("pt-BR") : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Config display */}
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Configuração Atual</p>
                  <pre className="text-xs text-slate-300 overflow-auto max-h-[100px]">
                    {JSON.stringify(agent.config, null, 2)}
                  </pre>
                </div>

                {meta.functionName && (
                  <Button
                    onClick={() => forceRun(agent)}
                    disabled={loading === agent.agente || !agent.ativo}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {loading === agent.agente ? "Executando..." : "Forçar Execução"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Agentes;
