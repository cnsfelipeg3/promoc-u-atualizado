import ScrollReveal from "@/components/ScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Plane } from "lucide-react";

const deals = [
  { route: "São Paulo → Paris", original: "R$ 6.200", promo: "R$ 2.870", flag: "🇫🇷" },
  { route: "São Paulo → Nova York", original: "R$ 5.400", promo: "R$ 1.990", flag: "🇺🇸" },
  { route: "São Paulo → Salvador", original: "R$ 1.100", promo: "R$ 399", flag: "🇧🇷" },
];

function CounterStat() {
  const { ref, isVisible } = useScrollReveal(0.3);
  const count = useCountUp(70, 1200, isVisible);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-5xl sm:text-6xl font-bold text-primary">
        {count}%
      </p>
      <p className="text-muted-foreground mt-2">de economia média em rotas selecionadas</p>
    </div>
  );
}

export default function ProofSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Resultados reais
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-6">
            Oportunidades que nossos membros acessaram
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mb-16">
            <CounterStat />
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {deals.map((deal, i) => (
            <ScrollReveal key={i} delay={i * 0.12}>
              <div className="glass-card p-6 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{deal.flag}</span>
                  <Plane className="w-4 h-4 text-primary" />
                </div>
                <p className="font-display font-semibold text-lg mb-3">{deal.route}</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-muted-foreground line-through text-sm">{deal.original}</span>
                  <span className="text-primary font-bold text-2xl">{deal.promo}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
