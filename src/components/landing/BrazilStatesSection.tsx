import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { MapPin, TrendingUp } from "lucide-react";

const mainStates = [
  { uf: "SP", name: "São Paulo", promos: 847, highlight: true },
  { uf: "RJ", name: "Rio de Janeiro", promos: 634, highlight: true },
  { uf: "MG", name: "Minas Gerais", promos: 412, highlight: true },
  { uf: "RS", name: "Rio Grande do Sul", promos: 389, highlight: true },
  { uf: "PR", name: "Paraná", promos: 334, highlight: true },
  { uf: "SC", name: "Santa Catarina", promos: 312, highlight: true },
  { uf: "BA", name: "Bahia", promos: 298, highlight: true },
  { uf: "CE", name: "Ceará", promos: 243, highlight: true },
  { uf: "PE", name: "Pernambuco", promos: 227, highlight: true },
  { uf: "DF", name: "Distrito Federal", promos: 218, highlight: true },
  { uf: "GO", name: "Goiás", promos: 123, highlight: false },
  { uf: "PA", name: "Pará", promos: 89, highlight: false },
  { uf: "AM", name: "Amazonas", promos: 75, highlight: false },
  { uf: "MA", name: "Maranhão", promos: 62, highlight: false },
  { uf: "ES", name: "Espírito Santo", promos: 58, highlight: false },
  { uf: "MT", name: "Mato Grosso", promos: 46, highlight: false },
  { uf: "MS", name: "Mato Grosso do Sul", promos: 44, highlight: false },
  { uf: "PB", name: "Paraíba", promos: 34, highlight: false },
  { uf: "RN", name: "Rio Grande do Norte", promos: 28, highlight: false },
  { uf: "AL", name: "Alagoas", promos: 23, highlight: false },
  { uf: "PI", name: "Piauí", promos: 16, highlight: false },
  { uf: "SE", name: "Sergipe", promos: 13, highlight: false },
  { uf: "RO", name: "Rondônia", promos: 9, highlight: false },
  { uf: "TO", name: "Tocantins", promos: 7, highlight: false },
  { uf: "AC", name: "Acre", promos: 4, highlight: false },
  { uf: "AP", name: "Amapá", promos: 3, highlight: false },
  { uf: "RR", name: "Roraima", promos: 2, highlight: false },
];

const maxPromos = mainStates[0].promos;

export default function BrazilStatesSection() {
  const totalPromos = mainStates.reduce((acc, s) => acc + s.promos, 0);

  return (
    <section id="brasil" className="relative py-24 px-4 overflow-hidden">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <p className="text-primary font-semibold text-sm uppercase tracking-[0.2em] font-mono">Cobertura nacional</p>
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
            <div className="grid grid-cols-[60px_1fr_100px_1fr] gap-2 px-4 sm:px-6 py-3 border-b border-primary/10" style={{ background: "hsl(199 60% 12% / 0.5)" }}>
              <span className="font-mono text-[9px] font-bold text-primary/50 uppercase tracking-[0.2em]">UF</span>
              <span className="font-mono text-[9px] font-bold text-primary/50 uppercase tracking-[0.2em]">Estado</span>
              <span className="font-mono text-[9px] font-bold text-primary/50 uppercase tracking-[0.2em] text-right">Promos</span>
              <span className="font-mono text-[9px] font-bold text-primary/50 uppercase tracking-[0.2em]">Volume</span>
            </div>

            <div className="divide-y divide-border/5 max-h-[600px] overflow-y-auto">
              {mainStates.map((state, i) => {
                const pct = (state.promos / maxPromos) * 100;
                return (
                  <motion.div
                    key={state.uf}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.02 }}
                    className={`grid grid-cols-[60px_1fr_100px_1fr] gap-2 px-4 sm:px-6 py-2.5 items-center hover:bg-primary/[0.04] transition-colors ${!state.highlight ? "opacity-50" : ""}`}
                  >
                    <span className="font-mono text-sm font-bold text-primary">{state.uf}</span>
                    <span className="text-sm text-foreground/80 truncate">{state.name}</span>
                    <span className="font-mono text-sm text-foreground text-right tabular-nums">{state.promos.toLocaleString("pt-BR")}</span>
                    <div className="relative h-4 bg-muted/20 rounded-sm overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-sm"
                        style={{
                          background: state.highlight
                            ? `linear-gradient(90deg, hsl(193 76% 38% / 0.6), hsl(193 76% 50%))`
                            : `linear-gradient(90deg, hsl(193 76% 38% / 0.2), hsl(193 76% 38% / 0.4))`,
                          boxShadow: state.highlight ? "0 0 8px hsl(193 76% 38% / 0.3)" : "none",
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

            <div className="border-t border-primary/10 px-4 sm:px-6 py-3 flex justify-between items-center" style={{ background: "hsl(199 60% 12% / 0.5)" }}>
              <span className="font-mono text-[10px] text-muted-foreground/60 tracking-wider">27 ESTADOS + DF</span>
              <span className="font-mono text-[10px] text-muted-foreground/60 tracking-wider">ÚLTIMOS 12 MESES</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
