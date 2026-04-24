import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  promocaoId: string;
  statusAtual?: string;
  onSuccess?: () => void;
}

export default function BotaoGerarVideo({ promocaoId, statusAtual, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const jaGerando = statusAtual === "em_producao";
  const jaProduzido = ["video_pronto", "publicada", "publicado"].includes(statusAtual ?? "");

  const handleClick = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("agente-orquestrador", {
        body: { promocao_id: promocaoId },
      });
      if (error) throw error;

      if (data?.ok) {
        const labels: Record<string, string> = {
          aprovada: "Pacote gerado e aprovado — vídeo rodando em background",
          revisao: "Pacote gerado — aguardando revisão humana",
          rejeitada: "Pacote gerado mas rejeitado (score baixo)",
        };
        const label = labels[data.status as string] ?? "Processado";
        toast.success(label, { description: `Score: ${data.score}/100` });
        onSuccess?.();
      } else {
        toast.error("Falha", { description: data?.error ?? "Erro desconhecido" });
      }
    } catch (err: any) {
      toast.error("Erro", { description: err?.message ?? "Erro desconhecido" });
    } finally {
      setLoading(false);
    }
  };

  if (jaProduzido) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        Pacote pronto
      </Button>
    );
  }

  return (
    <Button onClick={handleClick} disabled={loading || jaGerando} size="sm" className="gap-2 bg-amber-600 hover:bg-amber-700">
      {loading || jaGerando ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {jaGerando ? "Gerando..." : "Processando..."}
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Gerar Vídeo Viral
        </>
      )}
    </Button>
  );
}
