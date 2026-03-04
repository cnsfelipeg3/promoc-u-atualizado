import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Plane, X, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";

const features = [
  "Alertas de promoções nacionais",
  "Alertas de promoções internacionais",
  "Erros tarifários exclusivos",
  "Oportunidades com milhas",
  "Suporte da comunidade",
];

interface Plan {
  name: string;
  monthlyPrice: number;
  total: number;
  highlight?: boolean;
  badge?: string;
  period: string;
  link: string;
}

const plans: Plan[] = [
  { name: "Mensal", monthlyPrice: 29.9, total: 0, period: "/mês", link: "https://pay.hub.la/wln7ZWBhtZhbZwbx9vtW" },
  { name: "Semestral", monthlyPrice: 23.9, total: 143.4, period: "/mês", link: "https://pay.hub.la/k2FZaZQi6pT3FdeRFQst" },
  { name: "Anual", monthlyPrice: 14.9, total: 178.8, highlight: true, badge: "Mais vantajoso", period: "/mês", link: "https://pay.hub.la/q1Nu9kztj6xjJdFzfHmN" },
];

const executivePerks = [
  "Alertas de Classe Executiva e Primeira Classe",
  "Promoções exclusivas de lounges VIP",
  "Rotas premium com até 70% de desconto",
  "Prioridade máxima nos alertas",
];

function OrderBumpPopup({ plan, onClose, onContinue }: { plan: Plan; onClose: () => void; onContinue: (withBump: boolean) => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl"
        style={{ background: "hsl(199 60% 12% / 0.95)", border: "1px solid hsl(193 76% 38% / 0.2)" }}
        initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
      >
        <div className="px-6 py-3 flex items-center justify-center gap-2" style={{ borderBottom: "1px solid hsl(193 76% 38% / 0.15)", background: "hsl(193 76% 38% / 0.05)" }}>
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-primary text-xs font-bold tracking-widest uppercase">Oferta exclusiva — apenas no checkout</span>
        </div>
        <div className="p-6 sm:p-8">
          <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors z-20"><X className="w-5 h-5" /></button>
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "hsl(193 76% 38% / 0.1)", border: "1px solid hsl(193 76% 38% / 0.2)" }}>
              <Plane className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-center mb-2">
            Adicionar <span className="text-gradient-primary">Classe Executiva</span>?
          </h3>
          <p className="text-muted-foreground text-center text-sm mb-6">
            Membros com o módulo Executivo economizam em média <span className="text-primary font-bold">R$ 8.400/ano</span> em voos premium.
          </p>
          <div className="neon-card p-5 mb-6">
            <ul className="space-y-3">
              {executivePerks.map((perk, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />{perk}
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid hsl(193 76% 38% / 0.15)" }}>
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Módulo Executivo</span>
              <div className="text-right">
                <span className="text-primary font-display text-xl font-bold">+R$ 14,90</span>
                <span className="text-muted-foreground text-xs">/mês</span>
              </div>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onContinue(true)} className="w-full glow-button text-base mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />Sim, quero Classe Executiva!<ArrowRight className="w-4 h-4" />
          </motion.button>
          <button onClick={() => onContinue(false)} className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Não, continuar sem Executiva
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PlansSection() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const handleContinue = (withBump: boolean) => {
    if (selectedPlan) {
      window.open(selectedPlan.link, "_blank");
    }
    setSelectedPlan(null);
  };

  return (
    <section id="planos" className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">Planos</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">Escolha o plano ideal para você</h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            Quanto maior o período, mais oportunidades você aproveita — e menor o custo mensal.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className={`relative rounded-xl p-8 h-full flex flex-col ${plan.highlight ? "border-glow" : ""}`}
                style={{
                  background: "hsl(199 60% 12% / 0.6)",
                  backdropFilter: "blur(16px)",
                  border: plan.highlight ? "1px solid hsl(193 76% 38% / 0.4)" : "1px solid hsl(193 76% 38% / 0.12)",
                  boxShadow: plan.highlight ? "0 0 30px hsl(193 76% 38% / 0.1)" : "none",
                  overflow: "visible",
                }}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-[30] bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap"
                    style={{ boxShadow: "0 0 15px hsl(193 76% 38% / 0.5)", position: "relative" }}
                  >
                    <Crown className="w-3 h-3" />{plan.badge}
                  </span>
                )}

                <h3 className="font-display text-xl font-semibold mb-1 text-foreground">{plan.name}</h3>
                <div className="mb-6">
                  <span className="font-display text-4xl font-bold text-foreground">
                    R$ {plan.monthlyPrice.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>

                {plan.total > 0 && (
                  <p className="text-muted-foreground text-sm mb-4 -mt-4">
                    Cobrança única de R$ {plan.total.toFixed(2).replace(".", ",")}
                  </p>
                )}

                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-foreground/70">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full py-3.5 rounded-lg font-semibold transition-all duration-300 ${
                    plan.highlight ? "glow-button" : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  Assinar agora
                </motion.button>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <OrderBumpPopup plan={selectedPlan} onClose={() => setSelectedPlan(null)} onContinue={handleContinue} />
        )}
      </AnimatePresence>
    </section>
  );
}
