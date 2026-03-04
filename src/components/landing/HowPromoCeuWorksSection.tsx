import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { Radar, ShieldCheck, CreditCard, BarChart3, Globe, Zap } from "lucide-react";

const steps = [
  {
    icon: Radar,
    title: "Motor de Monitoramento",
    desc: "Rastreamos milhares de tarifas por hora em mais de 50 companhias aéreas, 24 horas por dia.",
    stat: "480K verificações/dia",
  },
  {
    icon: Zap,
    title: "Velocidade de Detecção",
    desc: "Quando o preço cai significativamente, nosso sistema detecta e dispara o alerta em menos de 60 segundos.",
    stat: "< 60s de latência",
  },
  {
    icon: BarChart3,
    title: "Oportunidades Catalogadas por IA",
    desc: "Inteligência artificial analisa padrões históricos de 90 dias para contextualizar cada oportunidade.",
    stat: "2B+ registros",
  },
  {
    icon: ShieldCheck,
    title: "Validação Anti-Fraude",
    desc: "Cada tarifa é validada contra múltiplas fontes antes de virar alerta. 98% dos alertas são compráveis.",
    stat: "98% de precisão",
  },
  {
    icon: CreditCard,
    title: "Compra Direta e Segura",
    desc: "Você compra direto no site da companhia aérea. Sem intermediários, sem taxas extras.",
    stat: "100% transparente",
  },
  {
    icon: Globe,
    title: "Sistema Online 24/7",
    desc: "Infraestrutura distribuída em 4 continentes garante monitoramento ininterrupto.",
    stat: "99.97% uptime",
  },
];

export default function HowPromoCeuWorksSection() {
  return (
    <section id="como-funciona" className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Metodologia
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4 text-balance">
            Como a PromoCéu <span className="text-gradient-primary">funciona</span>
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Combinamos tecnologia proprietária de monitoramento com inteligência artificial para encontrar as melhores oportunidades do mercado aéreo em tempo real.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                className="neon-card p-6 h-full group"
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-primary/10 border border-primary/20">
                  <step.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{step.desc}</p>
                <span className="inline-block text-xs font-mono text-primary/80 bg-primary/5 border border-primary/15 rounded-full px-3 py-1">
                  {step.stat}
                </span>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
