import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Shield, BarChart3, Bell, Database, Cpu, X } from "lucide-react";
import { useState } from "react";

interface TechFeature {
  icon: typeof Brain;
  title: string;
  desc: string;
  detail: string;
  stats: { label: string; value: string }[];
}

const features: TechFeature[] = [
  {
    icon: Brain,
    title: "Inteligência Artificial Preditiva",
    desc: "Algoritmos de machine learning analisam padrões históricos e preveem quedas de preço antes que aconteçam.",
    detail: "Nossos modelos de IA são treinados com mais de 50 milhões de registros históricos de tarifas aéreas. Eles identificam padrões sazonais, correlações com eventos globais e anomalias de precificação que indicam quedas iminentes.",
    stats: [{ label: "Registros analisados", value: "50M+" }, { label: "Precisão preditiva", value: "92%" }, { label: "Modelos ativos", value: "340+" }],
  },
  {
    icon: Zap,
    title: "Monitoramento em Tempo Real",
    desc: "Verificações a cada 3 minutos em mais de 50 companhias aéreas e 12.000 rotas simultaneamente.",
    detail: "Nossa infraestrutura de monitoramento opera em nuvem distribuída com servidores em 4 continentes.",
    stats: [{ label: "Verificações/dia", value: "480K" }, { label: "Companhias", value: "50+" }, { label: "Velocidade de Detecção", value: "< 60s" }],
  },
  {
    icon: Shield,
    title: "Validação Anti-Fraude",
    desc: "Cada tarifa é validada contra múltiplas fontes antes de virar alerta, eliminando falsos positivos.",
    detail: "Antes de enviar um alerta, nosso sistema faz uma tríplice validação.",
    stats: [{ label: "Taxa de validação", value: "98%" }, { label: "Fontes cruzadas", value: "3+" }, { label: "Falsos positivos", value: "< 2%" }],
  },
  {
    icon: BarChart3,
    title: "Análise Comparativa de Mercado",
    desc: "Cada preço é contextualizado com médias históricas, sazonais e projeções de tendência.",
    detail: "Nosso sistema calcula a média ponderada de 30, 60 e 90 dias para cada rota, ajustada por sazonalidade.",
    stats: [{ label: "Janela de análise", value: "90 dias" }, { label: "Desconto mínimo", value: "35%" }, { label: "Rotas com histórico", value: "12K+" }],
  },
  {
    icon: Bell,
    title: "Sistema de Notificação Inteligente",
    desc: "Alertas priorizados por relevância pessoal, com informações completas para decisão rápida.",
    detail: "Cada alerta inclui: rota completa, companhia aérea, preço atual vs. histórico, janela de datas e link direto para compra.",
    stats: [{ label: "Tempo médio decisão", value: "12 min" }, { label: "Taxa de aproveitamento", value: "34%" }, { label: "Alertas/dia", value: "5-15" }],
  },
  {
    icon: Database,
    title: "Oportunidades Catalogadas por IA",
    desc: "O maior banco de dados de tarifas aéreas do Brasil, com atualizações em tempo real.",
    detail: "Mantemos um repositório proprietário com mais de 2 bilhões de registros de tarifas.",
    stats: [{ label: "Registros totais", value: "2B+" }, { label: "Crescimento/mês", value: "180M" }, { label: "Rotas cobertas", value: "12K+" }],
  },
];

function TechPopup({ feature, onClose }: { feature: TechFeature; onClose: () => void }) {
  const Icon = feature.icon;
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl glass-card-highlight"
        initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="p-6 flex items-center gap-4 border-b border-primary/15">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-display font-bold text-lg text-foreground">{feature.title}</h3>
          <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-foreground/80 leading-relaxed mb-6">{feature.detail}</p>
          <div className="grid grid-cols-3 gap-3">
            {feature.stats.map((s, i) => (
              <div key={i} className="text-center neon-card p-3">
                <p className="text-primary font-bold font-display text-lg">{s.value}</p>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-full mt-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Fechar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TechnologySection() {
  const [selected, setSelected] = useState<TechFeature | null>(null);

  return (
    <section id="tecnologia" className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-primary" />
            <p className="text-primary font-semibold text-sm uppercase tracking-widest">Infraestrutura tecnológica</p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            A tecnologia por trás dos <span className="text-gradient-primary">melhores alertas</span>
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Uma stack proprietária de inteligência de dados que combina machine learning, big data e monitoramento distribuído em tempo real.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <ScrollReveal key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  onClick={() => setSelected(f)}
                  className="neon-card p-6 cursor-pointer group h-full"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-16 glass-card-highlight p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "99.97%", label: "Sistema Online 24/7" },
              { value: "< 3min", label: "Intervalo de verificação" },
              { value: "4", label: "Continentes com servidores" },
              { value: "2B+", label: "Oportunidades Catalogadas por IA" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-primary font-bold font-display text-2xl sm:text-3xl">{s.value}</p>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>

      <AnimatePresence>
        {selected && <TechPopup feature={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}
