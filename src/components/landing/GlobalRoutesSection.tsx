import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { Globe, Radar, Zap } from "lucide-react";

const stats = [
  { icon: Globe, value: "150+", label: "Destinos monitorados" },
  { icon: Radar, value: "24/7", label: "Monitoramento contínuo" },
  { icon: Zap, value: "< 5min", label: "Tempo médio de alerta" },
];

const routes = [
  { from: "GRU", to: "CDG", label: "Paris" },
  { from: "GRU", to: "JFK", label: "Nova York" },
  { from: "GRU", to: "LIS", label: "Lisboa" },
  { from: "GRU", to: "NRT", label: "Tóquio" },
  { from: "GRU", to: "DXB", label: "Dubai" },
  { from: "GRU", to: "LHR", label: "Londres" },
  { from: "GRU", to: "FCO", label: "Roma" },
  { from: "GRU", to: "MIA", label: "Miami" },
];

export default function GlobalRoutesSection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="section-divider w-full absolute top-0" />

      {/* Animated background dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + i * 14}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.7,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Cobertura global
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-6 text-balance">
            Monitoramento em escala global
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Nossa inteligência aérea rastreia as melhores oportunidades em centenas de rotas ao redor do mundo, 24 horas por dia.
          </p>
        </ScrollReveal>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-16">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Route pills */}
        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap justify-center gap-3">
            {routes.map((route, i) => (
              <motion.div
                key={i}
                className="glass-card px-5 py-3 flex items-center gap-3 text-sm"
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-primary font-mono font-bold">{route.from}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono font-bold">{route.to}</span>
                <span className="text-muted-foreground text-xs">{route.label}</span>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
