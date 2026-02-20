import ScrollReveal from "@/components/ScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Plane } from "lucide-react";

import destParis from "@/assets/dest-paris.jpg";
import destNY from "@/assets/dest-newyork.jpg";
import destSalvador from "@/assets/dest-salvador.jpg";
import destTokyo from "@/assets/dest-tokyo.jpg";
import destLisbon from "@/assets/dest-lisbon.jpg";
import destDubai from "@/assets/dest-dubai.jpg";

const deals = [
  { route: "São Paulo → Paris", original: "R$ 6.890", promo: "R$ 2.970", flag: "🇫🇷", image: destParis, label: "Oportunidade real" },
  { route: "São Paulo → Nova York", original: "R$ 5.400", promo: "R$ 1.990", flag: "🇺🇸", image: destNY, label: "Promoção recente" },
  { route: "São Paulo → Salvador", original: "R$ 1.100", promo: "R$ 399", flag: "🇧🇷", image: destSalvador, label: "Oportunidade real" },
  { route: "São Paulo → Tóquio", original: "R$ 8.200", promo: "R$ 3.490", flag: "🇯🇵", image: destTokyo, label: "Erro tarifário" },
  { route: "São Paulo → Lisboa", original: "R$ 4.800", promo: "R$ 2.190", flag: "🇵🇹", image: destLisbon, label: "Promoção recente" },
  { route: "São Paulo → Dubai", original: "R$ 7.500", promo: "R$ 3.280", flag: "🇦🇪", image: destDubai, label: "Oportunidade real" },
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
      <div className="max-w-6xl mx-auto">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="dest-card group h-72 cursor-pointer">
                <img
                  src={deal.image}
                  alt={deal.route}
                  className="absolute inset-0"
                  loading="lazy"
                />
                <div className="overlay" />
                
                {/* Label */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/20 text-primary backdrop-blur-sm border border-primary/20">
                    {deal.label}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{deal.flag}</span>
                    <Plane className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-display font-semibold text-lg mb-3">{deal.route}</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-muted-foreground line-through text-sm">{deal.original}</span>
                    <span className="text-primary font-bold text-2xl">{deal.promo}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
