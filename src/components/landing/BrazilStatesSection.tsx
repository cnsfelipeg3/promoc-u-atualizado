import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { MapPin, TrendingUp } from "lucide-react";

const states = [
  { uf: "SP", name: "São Paulo", promos: 1847 },
  { uf: "RJ", name: "Rio de Janeiro", promos: 1234 },
  { uf: "MG", name: "Minas Gerais", promos: 892 },
  { uf: "BA", name: "Bahia", promos: 756 },
  { uf: "RS", name: "Rio Grande do Sul", promos: 689 },
  { uf: "PR", name: "Paraná", promos: 634 },
  { uf: "PE", name: "Pernambuco", promos: 587 },
  { uf: "CE", name: "Ceará", promos: 543 },
  { uf: "SC", name: "Santa Catarina", promos: 512 },
  { uf: "DF", name: "Distrito Federal", promos: 498 },
  { uf: "GO", name: "Goiás", promos: 423 },
  { uf: "PA", name: "Pará", promos: 389 },
  { uf: "AM", name: "Amazonas", promos: 345 },
  { uf: "MA", name: "Maranhão", promos: 312 },
  { uf: "ES", name: "Espírito Santo", promos: 298 },
  { uf: "MT", name: "Mato Grosso", promos: 276 },
  { uf: "MS", name: "Mato Grosso do Sul", promos: 254 },
  { uf: "PB", name: "Paraíba", promos: 234 },
  { uf: "RN", name: "Rio Grande do Norte", promos: 218 },
  { uf: "AL", name: "Alagoas", promos: 198 },
  { uf: "PI", name: "Piauí", promos: 176 },
  { uf: "SE", name: "Sergipe", promos: 156 },
  { uf: "RO", name: "Rondônia", promos: 134 },
  { uf: "TO", name: "Tocantins", promos: 118 },
  { uf: "AC", name: "Acre", promos: 87 },
  { uf: "AP", name: "Amapá", promos: 76 },
  { uf: "RR", name: "Roraima", promos: 62 },
];

const maxPromos = states[0].promos;

export default function BrazilStatesSection() {
  const totalPromos = states.reduce((acc, s) => acc + s.promos, 0);

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="section-divider w-full absolute top-0" />

      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <p className="text-primary font-semibold text-sm uppercase tracking-[0.2em] font-mono">
              Cobertura nacional
            </p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Promoções por <span className="text-gradient-primary">estado</span>
          </h2>
          <p className="text-muted-foreground text-center mb-4 max-w-2xl mx-auto">
            Total de promoções detectadas nos últimos 12 meses, por estado de origem.
          </p>
          <p className="text-center mb-12">
            <span className="inline-flex items-center gap-2 font-mono text-xs text-primary/80 bg-primary/5 border border-primary/20 rounded-full px-4 py-1.5">
              <TrendingUp className="w-3 h-3" />
              {totalPromos.toLocaleString("pt-BR")} promoções no total
            </span>
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[60px_1fr_100px_1fr] gap-2 px-4 sm:px-6 py-3 bg-background/60 border-b border-primary/10">
              <span className="font-mono text-[9px] font-bold text-primary/50 uppercase tracking-[0.2em]">UF</span>
              <span className="font-mono text-[9px] font-bold text-primary/50 uppercase tracking-[0.2em]">Estado</span>
              <span className="font-mono text-[9px] font-bold text-primary/50 uppercase tracking-[0.2em] text-right">Promos</span>
              <span className="font-mono text-[9px] font-bold text-primary/50 uppercase tracking-[0.2em]">Volume</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/5 max-h-[600px] overflow-y-auto">
              {states.map((state, i) => {
                const pct = (state.promos / maxPromos) * 100;
                return (
                  <motion.div
                    key={state.uf}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-[60px_1fr_100px_1fr] gap-2 px-4 sm:px-6 py-2.5 items-center hover:bg-primary/[0.03] transition-colors"
                  >
                    <span className="font-mono text-sm font-bold text-primary">{state.uf}</span>
                    <span className="text-sm text-foreground/80 truncate">{state.name}</span>
                    <span className="font-mono text-sm text-foreground text-right tabular-nums">
                      {state.promos.toLocaleString("pt-BR")}
                    </span>
                    <div className="relative h-4 bg-muted/30 rounded-sm overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-sm"
                        style={{
                          background: `linear-gradient(90deg, hsl(var(--primary) / 0.6), hsl(var(--primary)))`,
                        }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.02 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="bg-background/60 border-t border-primary/10 px-4 sm:px-6 py-3 flex justify-between items-center">
              <span className="font-mono text-[10px] text-muted-foreground/60 tracking-wider">
                27 ESTADOS + DF
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/60 tracking-wider">
                ÚLTIMOS 12 MESES
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
