import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollText, X } from "lucide-react";

interface LogEntry {
  id: string;
  agente: string;
  mensagem: string;
  tipo: string;
  payload: Record<string, unknown>;
  created_at: string;
}

const tipoColors: Record<string, string> = {
  info: "text-blue-400 bg-blue-500/10",
  warn: "text-amber-400 bg-amber-500/10",
  error: "text-red-400 bg-red-500/10",
  success: "text-emerald-400 bg-emerald-500/10",
};

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agenteFilter, setAgenteFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    let query = supabase.from("logs_agentes").select("*").order("created_at", { ascending: false }).limit(200);
    if (agenteFilter !== "all") query = query.eq("agente", agenteFilter);
    if (tipoFilter !== "all") query = query.eq("tipo", tipoFilter);
    const { data } = await query;
    if (data) setLogs(data);
  };

  useEffect(() => {
    fetchLogs();
    const channel = supabase.channel("logs-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "logs_agentes" }, (payload) => {
        const newLog = payload.new as LogEntry;
        if (agenteFilter !== "all" && newLog.agente !== agenteFilter) return;
        if (tipoFilter !== "all" && newLog.tipo !== tipoFilter) return;
        setLogs((prev) => [newLog, ...prev].slice(0, 200));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [agenteFilter, tipoFilter]);

  const clearFilters = () => {
    setAgenteFilter("all");
    setTipoFilter("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ScrollText className="h-6 w-6" /> Logs
        </h1>
        {(agenteFilter !== "all" || tipoFilter !== "all") && (
          <Button size="sm" variant="ghost" onClick={clearFilters} className="text-slate-400">
            <X className="h-4 w-4 mr-1" /> Limpar filtros
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        <Select value={agenteFilter} onValueChange={setAgenteFilter}>
          <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Agente" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e293b] border-white/10">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="cacador">Caçador</SelectItem>
            <SelectItem value="precificador">Precificador</SelectItem>
            <SelectItem value="videomaker">VideoMaker</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e293b] border-white/10">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warn</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="success">Success</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white/5 border-white/10">
        <div ref={scrollRef} className="max-h-[70vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#0f172a]">
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-slate-400 font-medium w-[140px]">Hora</th>
                <th className="text-left p-3 text-slate-400 font-medium w-[100px]">Tipo</th>
                <th className="text-left p-3 text-slate-400 font-medium w-[120px]">Agente</th>
                <th className="text-left p-3 text-slate-400 font-medium">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-slate-500 font-mono text-xs">
                    {new Date(log.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </td>
                  <td className="p-3">
                    <Badge className={tipoColors[log.tipo] || "text-slate-400 bg-slate-500/10"}>
                      {log.tipo}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span className="text-slate-300 capitalize">{log.agente}</span>
                  </td>
                  <td className="p-3 text-slate-300">{log.mensagem}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum log encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Logs;
