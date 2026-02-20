import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";

const features = [
  "Alertas de promoções nacionais",
  "Alertas de promoções internacionais",
  "Erros tarifários exclusivos",
  "Oportunidades com milhas",
  "Suporte da comunidade",
];

type BillingCycle = "monthly" | "annual";

interface Plan {
  name: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  annualTotal: number;
  sempiTotal?: number;
  highlight?: boolean;
  badge?: string;
  period: string;
}

const plans: Plan[] = [
  {
    name: "Mensal",
    monthlyPrice: 29.9,
    annualMonthlyPrice: 29.9,
    annualTotal: 0,
    period: "/mês",
  },
  {
    name: "Semestral",
    monthlyPrice: 23.9,
    annualMonthlyPrice: 23.9,
    annualTotal: 0,
    sempiTotal: 143.4,
    period: "/mês",
  },
  {
    name: "Anual",
    monthlyPrice: 19.9,
    annualMonthlyPrice: 19.9,
    annualTotal: 238.8,
    highlight: true,
    badge: "Mais vantajoso",
    period: "/mês",
  },
];

export default function PlansSection() {
  const [executiva, setExecutiva] = useState(false);

  return (
    <section id="planos" className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Planos
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Escolha o seu acesso
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            Quanto mais tempo, mais oportunidades você aproveita — e menos paga.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-2xl p-8 h-full flex flex-col ${
                  plan.highlight
                    ? "glass-card-highlight border-glow"
                    : "glass-card"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1.5">
                    <Crown className="w-3 h-3" />
                    {plan.badge}
                  </span>
                )}

                <h3 className="font-display text-xl font-semibold mb-1">{plan.name}</h3>
                
                <div className="mb-6">
                  <span className="font-display text-4xl font-bold">
                    R$ {plan.monthlyPrice.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>

                {plan.annualTotal > 0 && (
                  <p className="text-muted-foreground text-sm mb-4 -mt-4">
                    Cobrança única de R$ {plan.annualTotal.toFixed(2).replace(".", ",")}
                  </p>
                )}
                {plan.sempiTotal && (
                  <p className="text-muted-foreground text-sm mb-4 -mt-4">
                    Cobrança única de R$ {plan.sempiTotal.toFixed(2).replace(".", ",")}
                  </p>
                )}

                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-secondary-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                    plan.highlight
                      ? "glow-button"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  Assinar agora
                </motion.button>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Order Bump */}
        <ScrollReveal>
          <div className="glass-card max-w-lg mx-auto p-6">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={executiva}
                onChange={() => setExecutiva(!executiva)}
                className="mt-1 w-5 h-5 accent-primary rounded"
              />
              <div>
                <p className="font-display font-semibold text-base mb-1">
                  🥇 Adicionar alertas de Classe Executiva
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Promoções estratégicas para voar com conforto pagando menos que econômica cheia.
                </p>
                <p className="text-primary font-bold mt-2">+ R$ 14,90/mês</p>
              </div>
            </label>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
