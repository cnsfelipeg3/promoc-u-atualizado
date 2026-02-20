import ScrollReveal from "@/components/ScrollReveal";
import { Radar, ShieldCheck, CreditCard } from "lucide-react";

const items = [
  {
    icon: Radar,
    title: "Monitoramos milhares de rotas",
    desc: "Nosso sistema rastreia oportunidades diariamente em companhias nacionais e internacionais.",
  },
  {
    icon: ShieldCheck,
    title: "Sem intermediários",
    desc: "Você compra direto na companhia aérea. Sem taxas escondidas. Sem dependência.",
  },
  {
    icon: CreditCard,
    title: "Nós avisamos, você decide",
    desc: "Quando surge uma oportunidade real, avisamos antes que esgote. A decisão é sua.",
  },
];

export default function MechanismSection() {
  return (
    <section className="relative py-24 px-4 bg-secondary/20">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Como a PromoCéu funciona
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-16 text-balance">
            Inteligência aérea a seu favor
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.12}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
