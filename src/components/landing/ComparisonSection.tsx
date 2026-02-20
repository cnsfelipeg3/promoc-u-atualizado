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

function CellIcon({ value }: { value: boolean }) {
  return value ? (
    <Check className="w-5 h-5 text-signal-green mx-auto" />
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
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Comparativo
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Por que a PromoCéu é diferente?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Compare as opções e veja por que milhares de viajantes escolheram nossa plataforma.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-0 bg-background/60 border-b border-border">
              <div className="p-4 text-sm font-semibold text-foreground">Funcionalidade</div>
              <div className="p-4 text-center bg-primary/5 border-x border-primary/15">
                <p className="text-primary font-bold font-display text-sm">PromoCéu</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-muted-foreground text-sm font-medium">Busca manual</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-muted-foreground text-sm font-medium">Agências</p>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/30">
              {rows.map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-4 gap-0 hover:bg-primary/[0.02] transition-colors"
                >
                  <div className="p-4 text-sm text-foreground/80">{row.feature}</div>
                  <div className="p-4 bg-primary/[0.02] border-x border-primary/10">
                    <CellIcon value={row.promoceu} />
                  </div>
                  <div className="p-4">
                    <CellIcon value={row.manual} />
                  </div>
                  <div className="p-4">
                    <CellIcon value={row.agencia} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="grid grid-cols-4 gap-0 bg-background/60 border-t border-border">
              <div className="p-4" />
              <div className="p-4 text-center bg-primary/5 border-x border-primary/15">
                <motion.a
                  href="#planos"
                  className="inline-flex items-center gap-1 text-primary text-sm font-semibold hover:underline"
                  whileHover={{ x: 4 }}
                >
                  Assinar agora <ArrowRight className="w-4 h-4" />
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
