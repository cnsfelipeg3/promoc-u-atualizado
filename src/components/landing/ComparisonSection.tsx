import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";

const rows = [
  { feature: "Monitoramento 24/7 de tarifas", promoceu: true, manual: false, agencia: false },
  { feature: "Alertas em tempo real (< 5 min)", promoceu: true, manual: false, agencia: false },
  { feature: "Compra direto na companhia aérea", promoceu: true, manual: true, agencia: false },
  { feature: "Sem taxa de intermediação", promoceu: true, manual: true, agencia: false },
  { feature: "Acesso a erros tarifários", promoceu: true, manual: false, agencia: false },
  { feature: "Análise de histórico de preços", promoceu: true, manual: false, agencia: false },
  { feature: "Suporte e comunidade exclusiva", promoceu: true, manual: false, agencia: true },
  { feature: "Cancelamento sem burocracia", promoceu: true, manual: true, agencia: false },
  { feature: "Cobertura de 150+ destinos", promoceu: true, manual: false, agencia: true },
  { feature: "Módulo de classe executiva", promoceu: true, manual: false, agencia: false },
];

function CellIcon({ value, animate }: { value: boolean; animate?: boolean }) {
  return value ? (
    <motion.div
      initial={animate ? { scale: 0, opacity: 0 } : undefined}
      whileInView={animate ? { scale: 1, opacity: 1 } : undefined}
      viewport={{ once: true }}
      transition={{ type: "spring", damping: 15 }}
    >
      <Check className="w-5 h-5 text-signal-green mx-auto" />
    </motion.div>
  ) : (
    <X className="w-5 h-5 text-signal-red/50 mx-auto" />
  );
}

export default function ComparisonSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">Comparativo</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Por que a PromoCéu é diferente?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Compare as opções e veja por que milhares de viajantes escolheram nossa plataforma.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="glass-card overflow-hidden" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <div className="grid grid-cols-4 gap-0 border-b border-primary/15" style={{ background: "hsl(199 60% 12% / 0.7)" }}>
              <div className="p-4 text-xs font-semibold text-foreground/60 uppercase tracking-wider">Feature</div>
              <div className="p-4 text-center" style={{ background: "hsl(193 76% 38% / 0.08)", borderLeft: "1px solid hsl(193 76% 38% / 0.2)", borderRight: "1px solid hsl(193 76% 38% / 0.2)", boxShadow: "inset 0 0 20px hsl(193 76% 38% / 0.05)" }}>
                <p className="text-primary font-bold text-xs tracking-wider">PROMOCÉU</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-muted-foreground text-xs">MANUAL</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-muted-foreground text-xs">AGÊNCIAS</p>
              </div>
            </div>

            <div className="divide-y divide-border/10">
              {rows.map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-4 gap-0 hover:bg-primary/[0.03] transition-colors"
                >
                  <div className="p-4 text-xs text-foreground/70">{row.feature}</div>
                  <div className="p-4" style={{ background: "hsl(193 76% 38% / 0.03)", borderLeft: "1px solid hsl(193 76% 38% / 0.1)", borderRight: "1px solid hsl(193 76% 38% / 0.1)" }}>
                    <CellIcon value={row.promoceu} animate />
                  </div>
                  <div className="p-4"><CellIcon value={row.manual} /></div>
                  <div className="p-4"><CellIcon value={row.agencia} /></div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-0 border-t border-primary/15" style={{ background: "hsl(199 60% 12% / 0.7)" }}>
              <div className="p-4" />
              <div className="p-4 text-center" style={{ background: "hsl(193 76% 38% / 0.08)", borderLeft: "1px solid hsl(193 76% 38% / 0.2)", borderRight: "1px solid hsl(193 76% 38% / 0.2)" }}>
                <motion.a href="#planos" className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline" whileHover={{ x: 4 }}>
                  Assinar <ArrowRight className="w-3 h-3" />
                </motion.a>
              </div>
              <div className="p-4" />
              <div className="p-4" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
