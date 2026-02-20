import ScrollReveal from "@/components/ScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { motion } from "framer-motion";
import { TrendingUp, Users, Plane, Globe, Award, BarChart3 } from "lucide-react";

function AnimatedStat({ value, suffix, label, icon: Icon, delay }: { value: number; suffix: string; label: string; icon: typeof TrendingUp; delay: number }) {
  const { ref, isVisible } = useScrollReveal(0.3);
  const count = useCountUp(value, 1500, isVisible);

  return (
    <ScrollReveal delay={delay}>
      <div ref={ref} className="text-center glass-card p-6 h-full">
        <Icon className="w-7 h-7 text-primary mx-auto mb-3" strokeWidth={1.5} />
        <p className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          {count.toLocaleString("pt-BR")}{suffix}
        </p>
        <p className="text-muted-foreground text-sm mt-2">{label}</p>
      </div>
    </ScrollReveal>
  );
}

export default function NumbersSection() {
  return (
    <section className="relative py-24 px-4 bg-secondary/40">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <p className="text-primary font-semibold text-sm uppercase tracking-widest">
              Números que falam
            </p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Resultados comprovados <span className="text-gradient-primary">em escala</span>
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Os números da plataforma PromoCéu refletem o compromisso com tecnologia de ponta e resultados reais para os membros.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatedStat value={2847} suffix="" label="Membros ativos na plataforma" icon={Users} delay={0} />
          <AnimatedStat value={15430} suffix="" label="Viagens realizadas com alertas" icon={Plane} delay={0.08} />
          <AnimatedStat value={150} suffix="+" label="Destinos monitorados globalmente" icon={Globe} delay={0.16} />
          <AnimatedStat value={57} suffix="%" label="Economia média por passagem" icon={TrendingUp} delay={0.24} />
          <AnimatedStat value={98} suffix="%" label="Taxa de satisfação dos membros" icon={Award} delay={0.32} />
          <AnimatedStat value={480} suffix="K" label="Verificações de preço por dia" icon={BarChart3} delay={0.4} />
        </div>
      </div>
    </section>
  );
}
