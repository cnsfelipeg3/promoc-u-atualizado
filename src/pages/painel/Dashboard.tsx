import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, CheckCircle, Video, XCircle, Clock, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface KPIs {
  pendentes: number;
  precificadas: number;
  aprovadas: number;
  em_producao: number;
  video_pronto: number;
  rejeitadas: number;
}

interface LogEntry {
  id: string;
  agente: string;
  mensagem: string;
  tipo: string;
  created_at: string;
}

interface AgentStatus {
  agente: string;
  ativo: boolean;
  lastLog?: LogEntry;
}

const kpiConfig = [
  { key: "pendentes", label: "Pendentes", icon: Clock, color: "text-slate-400" },
  { key: "precificadas", label: "Precificadas", icon: TrendingUp, color: "text-blue-400" },
  { key: "aprovadas", label: "Aprovadas", icon: CheckCircle, color: "text-green-400" },
  { key: "em_producao", label: "Em Produção", icon: Video, color: "text-amber-400" },
  { key: "video_pronto", label: "Vídeos Prontos", icon: Video, color: "text-emerald-400" },
  { key: "rejeitadas", label: "Rejeitadas", icon: XCircle, color: "text-red-400" },
] as const;

const Dashboard = () => {
  const [kpis, setKpis] = useState<KPIs>({ pendentes: 0, precificadas: 0, aprovadas: 0, em_producao: 0, video_pronto: 0, rejeitadas: 0 });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [chartData, setChartData] = useState<{ date: string; total: number }[]>([]);
  const [metrics, setMetrics] = useState({ precoMedio: 0, descontoMedio: 0, scoreMedio: 0, totalVideos: 0 });

  const fetchKPIs = async () => {
    const statuses = ["pendente", "precificada", "aprovada", "em_producao", "video_pronto", "rejeitada"];
    const results: Record<string, number> = {};
    for (const s of statuses) {
      const { count } = await supabase.from("promocoes").select("*", { count: "exact", head: true }).eq("status", s);
      results[s === "pendente" ? "pendentes" : s === "precificada" ? "precificadas" : s === "aprovada" ? "aprovadas" : s === "rejeitada" ? "rejeitadas" : s] = count || 0;
    }
    setKpis(results as unknown as KPIs);
  };

  const fetchLogs = async () => {
    const { data } = await supabase.from("logs_agentes").select("*").order("created_at", { ascending: false }).limit(20);
    if (data) setLogs(data);
  };

  const fetchAgents = async () => {
    const { data: configs } = await supabase.from("config_agentes").select("*");
    if (!configs) return;
    const agentStatuses: AgentStatus[] = [];
    for (const c of configs) {
      const { data: lastLog } = await supabase.from("logs_agentes").select("*").eq("agente", c.agente).order("created_at", { ascending: false }).limit(1);
      agentStatuses.push({ agente: c.agente, ativo: c.ativo, lastLog: lastLog?.[0] });
    }
    setAgents(agentStatuses);
  };

  const fetchChart = async () => {
    const { data } = await supabase.from("promocoes").select("created_at");
    if (!data) return;
    const byDay: Record<string, number> = {};
    data.forEach((p) => {
      const day = new Date(p.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      byDay[day] = (byDay[day] || 0) + 1;
    });
    setChartData(Object.entries(byDay).map(([date, total]) => ({ date, total })).slice(-30));
  };

  const fetchMetrics = async () => {
    const { data } = await supabase.from("promocoes").select("preco, pct_desconto, score");
    if (!data?.length) return;
    const precoMedio = data.reduce((a, b) => a + (b.preco || 0), 0) / data.length;
    const withDiscount = data.filter((d) => d.pct_desconto);
    const descontoMedio = withDiscount.length ? withDiscount.reduce((a, b) => a + (b.pct_desconto || 0), 0) / withDiscount.length : 0;
    const withScore = data.filter((d) => d.score && d.score > 0);
    const scoreMedio = withScore.length ? withScore.reduce((a, b) => a + (b.score || 0), 0) / withScore.length : 0;
    const { count } = await supabase.from("videos").select("*", { count: "exact", head: true });
    setMetrics({ precoMedio: Math.round(precoMedio), descontoMedio: Math.round(descontoMedio), scoreMedio: Math.round(scoreMedio * 10) / 10, totalVideos: count || 0 });
  };

  useEffect(() => {
    fetchKPIs();
    fetchLogs();
    fetchAgents();
    fetchChart();
    fetchMetrics();

    // Realtime
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "logs_agentes" }, () => {
        fetchLogs();
        fetchAgents();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "promocoes" }, () => {
        fetchKPIs();
        fetchChart();
        fetchMetrics();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "videos" }, () => {
        fetchMetrics();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const agentStatusColor = (agent: AgentStatus) => {
    if (!agent.ativo) return "bg-red-500";
    if (!agent.lastLog) return "bg-yellow-500";
    if (agent.lastLog.tipo === "error") return "bg-red-500";
    return "bg-green-500";
  };

  const logTypeColor = (tipo: string) => {
    switch (tipo) {
      case "error": return "text-red-400";
      case "warn": return "text-amber-400";
      case "success": return "text-emerald-400";
      default: return "text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiConfig.map(({ key, label, icon: Icon, color }) => (
          <Card key={key} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{kpis[key as keyof KPIs]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Promos Capturadas (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#f59e0b" }} />
                <Area type="monotone" dataKey="total" stroke="#f59e0b" fill="#f59e0b20" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Status */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Status dos Agentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agents.map((agent) => (
              <div key={agent.agente} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${agentStatusColor(agent)} animate-pulse`} />
                  <span className="text-white font-medium capitalize">{agent.agente}</span>
                </div>
                <Badge variant={agent.ativo ? "default" : "destructive"} className={agent.ativo ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
                  {agent.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Métricas Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Preço Médio", value: `R$ ${metrics.precoMedio}` },
                { label: "Desconto Médio", value: `${metrics.descontoMedio}%` },
                { label: "Score Médio", value: metrics.scoreMedio.toFixed(1) },
                { label: "Total Vídeos", value: metrics.totalVideos },
              ].map((m) => (
                <div key={m.label} className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-slate-400">{m.label}</p>
                  <p className="text-xl font-bold text-amber-400">{m.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Atividade em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[280px] overflow-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3 p-2 bg-white/5 rounded text-sm">
                  <span className={`font-mono text-xs ${logTypeColor(log.tipo)} shrink-0`}>
                    {new Date(log.created_at).toLocaleTimeString("pt-BR")}
                  </span>
                  <Badge variant="outline" className="text-xs shrink-0 border-white/20 text-slate-300">
                    {log.agente}
                  </Badge>
                  <span className="text-slate-300 truncate">{log.mensagem}</span>
                </div>
              ))}
              {logs.length === 0 && <p className="text-slate-500 text-center py-4">Nenhuma atividade ainda</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
