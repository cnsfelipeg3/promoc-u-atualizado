import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Radar } from "lucide-react";
import worldMap from "@/assets/world-map-dark.jpg";

// Equirectangular projection: x = (lon+180)/360*1000, y = (90-lat)/180*500
const cities: Record<string, [number, number]> = {
  "São Paulo": [370, 315],
  "Paris": [506, 114],
  "New York": [294, 137],
  "Tokyo": [888, 151],
  "London": [500, 107],
  "Dubai": [654, 180],
  "Rome": [535, 134],
  "Miami": [277, 178],
  "Lisbon": [475, 142],
  "Barcelona": [506, 135],
  "Frankfurt": [524, 111],
  "Amsterdam": [514, 104],
  "Doha": [643, 180],
  "Singapore": [789, 246],
  "Buenos Aires": [338, 346],
  "Cancún": [259, 191],
  "Lima": [286, 283],
  "Cairo": [587, 167],
  "Johannesburg": [578, 323],
  "Sydney": [920, 344],
};

const routes = [
  { from: "São Paulo", to: "Paris" },
  { from: "São Paulo", to: "New York" },
  { from: "São Paulo", to: "Tokyo" },
  { from: "São Paulo", to: "London" },
  { from: "São Paulo", to: "Dubai" },
  { from: "São Paulo", to: "Rome" },
  { from: "São Paulo", to: "Miami" },
  { from: "São Paulo", to: "Lisbon" },
  { from: "São Paulo", to: "Barcelona" },
  { from: "São Paulo", to: "Frankfurt" },
  { from: "São Paulo", to: "Amsterdam" },
  { from: "São Paulo", to: "Singapore" },
  { from: "São Paulo", to: "Sydney" },
  { from: "São Paulo", to: "Buenos Aires" },
  { from: "São Paulo", to: "Lima" },
];

function useRoutePaths() {
  return useMemo(() => {
    return routes.map((route) => {
      const from = cities[route.from];
      const to = cities[route.to];
      const midX = (from[0] + to[0]) / 2;
      const midY = Math.min(from[1], to[1]) - 40 - (Math.abs(to[0] - from[0]) * 0.08);
      return `M ${from[0]} ${from[1]} Q ${midX} ${midY} ${to[0]} ${to[1]}`;
    });
  }, []);
}

function AnimatedRoute({ path, delay }: { path: string; delay: number }) {
  return (
    <g>
      <path d={path} fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="0.5" strokeOpacity="0.08" />
      <motion.path
        d={path}
        fill="none"
        stroke="url(#routeGradCorp)"
        strokeWidth="1.2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.7, 0.7, 0] }}
        transition={{ duration: 4, delay, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      />
      <motion.circle
        r="3"
        fill="hsl(217, 91%, 60%)"
        filter="url(#glowCorp)"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0], offsetDistance: ["0%", "100%"] }}
        transition={{ duration: 3.5, delay: delay + 0.3, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
        style={{ offsetPath: `path("${path}")` }}
      />
    </g>
  );
}

export default function GlobalMapSection() {
  const [activePulse, setActivePulse] = useState(0);
  const routePaths = useRoutePaths();

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePulse((prev) => (prev + 1) % Object.keys(cities).length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const cityEntries = Object.entries(cities);

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="section-divider w-full absolute top-0" />

      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
              <Radar className="w-5 h-5 text-primary" />
            </motion.div>
            <p className="text-primary font-semibold text-sm uppercase tracking-[0.2em] font-mono">Alcance global</p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Monitoramento <span className="text-gradient-primary">em escala mundial</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Rastreamos oportunidades em mais de 150 destinos, 24 horas por dia, 7 dias por semana.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="relative glass-card p-2 sm:p-4 overflow-hidden rounded-xl">
            {/* HUD labels */}
            <div className="absolute top-4 left-6 font-mono text-[9px] text-primary/40 tracking-[0.3em] pointer-events-none z-20">
              GLOBAL TRACKING SYSTEM v4.0
            </div>
            <div className="absolute top-4 right-6 font-mono text-[9px] text-primary/40 tracking-[0.3em] pointer-events-none z-20">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>● LIVE</motion.span>
            </div>

            {/* Real world map container */}
            <div className="relative rounded-lg overflow-hidden">
              {/* Real world map background */}
              <img
                src={worldMap}
                alt="World map"
                className="w-full h-auto block opacity-40"
                style={{ maxHeight: "500px", objectFit: "cover", objectPosition: "center" }}
                loading="lazy"
              />

              {/* SVG overlay with routes and cities */}
              <svg
                viewBox="0 0 1000 500"
                className="absolute inset-0 w-full h-full z-10"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <linearGradient id="routeGradCorp" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="hsl(45, 70%, 58%)" stopOpacity="0.4" />
                  </linearGradient>
                  <filter id="glowCorp">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="softGlowCorp">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <radialGradient id="hubGlowCorp" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* GRU hub glow */}
                <circle cx={cities["São Paulo"][0]} cy={cities["São Paulo"][1]} r="40" fill="url(#hubGlowCorp)" />

                {/* Animated routes */}
                {routePaths.map((path, i) => (
                  <AnimatedRoute key={i} path={path} delay={i * 0.5} />
                ))}

                {/* City dots */}
                {cityEntries.map(([name, pos], i) => (
                  <g key={name}>
                    {i === activePulse && (
                      <motion.circle
                        cx={pos[0]} cy={pos[1]} r="14"
                        fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="0.6"
                        animate={{ opacity: [0, 0.5, 0], scale: [0.5, 2.5, 3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <circle
                      cx={pos[0]} cy={pos[1]}
                      r={name === "São Paulo" ? "6" : "3.5"}
                      fill="none"
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth="0.6"
                      opacity={name === "São Paulo" ? 0.6 : 0.2}
                    />
                    <circle
                      cx={pos[0]} cy={pos[1]}
                      r={name === "São Paulo" ? "3.5" : "2"}
                      fill={name === "São Paulo" ? "hsl(217, 91%, 60%)" : "hsl(45, 70%, 58%)"}
                      filter="url(#softGlowCorp)"
                      opacity={name === "São Paulo" ? 1 : 0.7}
                    />
                    <text
                      x={pos[0]} y={pos[1] - 10}
                      textAnchor="middle"
                      fill="hsl(210, 20%, 85%)"
                      fontSize="8"
                      fontFamily="'JetBrains Mono', monospace"
                      opacity="0.6"
                      letterSpacing="1"
                    >
                      {name === "São Paulo" ? "GRU" : name.toUpperCase().slice(0, 6)}
                    </text>
                  </g>
                ))}

                <text
                  x={cities["São Paulo"][0]} y={cities["São Paulo"][1] + 20}
                  textAnchor="middle"
                  fill="hsl(217, 91%, 60%)"
                  fontSize="7"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="bold"
                  opacity="0.6"
                  letterSpacing="3"
                >
                  HUB PRINCIPAL
                </text>
              </svg>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap justify-center gap-8 mt-6 pt-6 border-t border-border/30">
              {[
                { value: "150+", label: "Destinos" },
                { value: "24/7", label: "Monitoramento" },
                { value: "< 5min", label: "Tempo de alerta" },
                { value: "15", label: "Rotas ativas" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="font-display text-lg sm:text-xl font-bold text-primary">{stat.value}</p>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-mono">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
