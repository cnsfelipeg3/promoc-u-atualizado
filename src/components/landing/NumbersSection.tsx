import ScrollReveal from "@/components/ScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Users, Plane, Globe, Award, BarChart3, X } from "lucide-react";
import { useState } from "react";

interface StatData {
  value: number;
  suffix: string;
  label: string;
  icon: typeof TrendingUp;
  detail: string;
}

const stats: StatData[] = [
  { value: 2847, suffix: "", label: "Membros ativos na plataforma", icon: Users, detail: "Nossa comunidade cresce a cada dia com viajantes que descobrem o poder do monitoramento inteligente de tarifas aéreas. Cada membro recebe alertas personalizados e acesso a oportunidades exclusivas." },
  { value: 15430, suffix: "", label: "Viagens realizadas com alertas", icon: Plane, detail: "Mais de 15 mil viagens foram realizadas a partir de alertas enviados pela plataforma. Isso representa milhões em economia acumulada para nossos membros." },
  { value: 150, suffix: "+", label: "Destinos monitorados globalmente", icon: Globe, detail: "Monitoramos rotas de todos os principais aeroportos brasileiros para mais de 150 destinos nos 5 continentes, 24 horas por dia." },
  { value: 57, suffix: "%", label: "Economia média por passagem", icon: TrendingUp, detail: "Nossos membros economizam em média 57% comparado com o preço de mercado. Em alguns casos, a economia pode chegar a 70% ou mais, especialmente em erros tarifários." },
  { value: 98, suffix: "%", label: "Taxa de satisfação dos membros", icon: Award, detail: "98% dos nossos membros se dizem satisfeitos com o serviço. A transparência, velocidade dos alertas e qualidade das oportunidades são os fatores mais citados." },
  { value: 480, suffix: "K", label: "Verificações de preço por dia", icon: BarChart3, detail: "Nosso sistema realiza quase meio milhão de verificações de preço por dia, varrendo mais de 50 companhias aéreas e 12.000 rotas simultaneamente." },
];

function AnimatedStat({ stat, delay, onClick }: { stat: StatData; delay: number; onClick: () => void }) {
  const { ref, isVisible } = useScrollReveal(0.3);
  const count = useCountUp(stat.value, 1500, isVisible);
  const Icon = stat.icon;

  return (
    <ScrollReveal delay={delay}>
      <div
        ref={ref}
        onClick={onClick}
        className="text-center neon-card p-6 h-full cursor-pointer group hover:border-primary/40 transition-all"
      >
        <Icon className="w-7 h-7 text-primary mx-auto mb-3" strokeWidth={1.5} />
        <p className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          {count.toLocaleString("pt-BR")}{stat.suffix}
        </p>
        <p className="text-muted-foreground text-sm mt-2">{stat.label}</p>
      </div>
    </ScrollReveal>
  );
}

function StatModal({ stat, onClose }: { stat: StatData; onClose: () => void }) {
  const Icon = stat.icon;
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-md rounded-xl overflow-hidden glass-card-highlight"
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
      >
        <div className="p-6 flex items-center gap-4 border-b border-primary/15">
          <Icon className="w-8 h-8 text-primary" />
          <h3 className="font-display font-bold text-lg flex-1">{stat.label}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <p className="text-foreground/80 leading-relaxed">{stat.detail}</p>
          <button onClick={onClose} className="w-full mt-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Fechar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function NumbersSection() {
  const [selected, setSelected] = useState<StatData | null>(null);

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <p className="text-primary font-semibold text-sm uppercase tracking-widest">Números que falam</p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Resultados comprovados <span className="text-gradient-primary">em escala</span>
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Clique em qualquer número para mais detalhes.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <AnimatedStat key={i} stat={stat} delay={i * 0.08} onClick={() => setSelected(stat)} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && <StatModal stat={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}
