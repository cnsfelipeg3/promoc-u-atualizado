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
  annualTotal: number;
  sempiTotal?: number;
  highlight?: boolean;
  badge?: string;
  period: string;
}

const plans: Plan[] = [
  { name: "Mensal", monthlyPrice: 29.9, annualTotal: 0, period: "/mês" },
  { name: "Semestral", monthlyPrice: 23.9, annualTotal: 0, sempiTotal: 143.4, period: "/mês" },
  { name: "Anual", monthlyPrice: 19.9, annualTotal: 238.8, highlight: true, badge: "Mais vantajoso", period: "/mês" },
];

const executivePerks = [
  "Alertas de Classe Executiva e Primeira Classe",
  "Promoções exclusivas de lounges VIP",
  "Rotas premium com até 70% de desconto",
  "Prioridade máxima nos alertas",
];

function OrderBumpPopup({ plan, onClose, onContinue }: { plan: Plan; onClose: () => void; onContinue: (withBump: boolean) => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
      >
        {/* Top banner — urgency */}
        <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-center gap-2">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </motion.div>
          <span className="text-primary font-mono text-xs font-bold tracking-widest uppercase">
            Oferta exclusiva — apenas no checkout
          </span>
        </div>

        <div className="bg-card p-6 sm:p-8">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-5">
            <motion.div
              className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
              animate={{
                boxShadow: [
                  "0 0 0px hsl(185 85% 50% / 0)",
                  "0 0 25px hsl(185 85% 50% / 0.2)",
                  "0 0 0px hsl(185 85% 50% / 0)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Plane className="w-8 h-8 text-primary" />
            </motion.div>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-bold text-center mb-2">
            Quer voar de <span className="text-gradient-primary">Classe Executiva</span>?
          </h3>

          <p className="text-muted-foreground text-center text-sm mb-6">
            Membros que adicionam o módulo Executivo economizam em média{" "}
            <span className="text-primary font-bold">R$ 8.400/ano</span> em voos premium.
          </p>

          {/* Perks */}
          <div className="glass-card p-5 mb-6 relative overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none">
              <div className="absolute top-0 left-0 w-px h-4 bg-gradient-to-b from-primary/30 to-transparent" />
              <div className="absolute top-0 left-0 h-px w-4 bg-gradient-to-r from-primary/30 to-transparent" />
            </div>

            <ul className="space-y-3">
              {executivePerks.map((perk, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-center gap-2.5 text-sm text-foreground"
                >
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {perk}
                </motion.li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-mono">MÓDULO EXECUTIVO</span>
              <div className="text-right">
                <span className="text-primary font-display text-xl font-bold">+R$ 14,90</span>
                <span className="text-muted-foreground text-xs">/mês</span>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onContinue(true)}
            className="w-full glow-button text-base mb-3 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Sim, quero Classe Executiva!
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <button
            onClick={() => onContinue(false)}
            className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono tracking-wider"
          >
            Não obrigado, continuar sem Executiva
          </button>

          <p className="text-center text-[10px] text-muted-foreground/50 mt-3 font-mono">
            Pode cancelar o módulo a qualquer momento
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PlansSection() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const handleSubscribe = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = (withBump: boolean) => {
    // Here you would redirect to checkout
    console.log(`Checkout: ${selectedPlan?.name}, executive: ${withBump}`);
    setSelectedPlan(null);
  };

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
                  onClick={() => handleSubscribe(plan)}
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
      </div>

      {/* Order Bump Popup */}
      <AnimatePresence>
        {selectedPlan && (
          <OrderBumpPopup
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
            onContinue={handleContinue}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
