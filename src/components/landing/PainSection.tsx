import ScrollReveal from "@/components/ScrollReveal";
import { Clock, TrendingDown, AlertTriangle } from "lucide-react";

const pains = [
  {
    icon: TrendingDown,
    title: "Você pagou caro demais",
    desc: "E dias depois, a mesma passagem custava metade do preço.",
  },
  {
    icon: Clock,
    title: "As melhores tarifas duram horas",
    desc: "Promoções reais aparecem e somem antes de você saber.",
  },
  {
    icon: AlertTriangle,
    title: "Quem chega tarde, paga mais",
    desc: "O problema não é falta de dinheiro. É falta de acesso no momento certo.",
  },
];

export default function PainSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            O problema
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-16 text-balance">
            Você já pagou caro por uma passagem e depois<br className="hidden sm:block" /> descobriu que ela ficou pela metade do preço?
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {pains.map((p, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <div className="glass-card p-8 h-full group hover:-translate-y-1.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <p.icon className="w-10 h-10 text-primary mb-5" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-semibold mb-3">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
