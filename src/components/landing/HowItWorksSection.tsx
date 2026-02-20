import ScrollReveal from "@/components/ScrollReveal";
import { UserPlus, Bell, ShoppingCart } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Entre na comunidade", desc: "Escolha seu plano e faça parte do clube." },
  { icon: Bell, title: "Receba alertas estratégicos", desc: "Oportunidades reais direto no seu celular." },
  { icon: ShoppingCart, title: "Compre antes que acabe", desc: "Direto na companhia aérea, sem intermediários." },
];

export default function HowItWorksSection() {
  return (
    <section className="relative py-24 px-4 bg-secondary/20">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Simples assim
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-16">
            Como funciona
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <div className="text-center">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <step.icon className="w-9 h-9 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold font-display">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
