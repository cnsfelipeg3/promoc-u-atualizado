import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Radar } from "lucide-react";

const continentPaths = [
  "M 80,80 L 120,65 160,70 200,80 230,95 250,120 260,155 240,175 220,180 200,195 180,210 160,215 140,200 120,175 100,150 85,120 75,100 Z",
  "M 210,230 L 235,225 260,245 275,280 285,320 290,360 280,390 265,410 245,420 225,415 215,390 210,360 205,320 200,280 200,250 Z",
  "M 440,65 L 460,60 490,65 520,75 540,90 545,110 535,130 520,140 505,150 490,148 475,140 460,125 450,105 445,85 Z",
  "M 450,165 L 480,155 520,170 545,200 555,250 550,310 535,360 510,390 480,395 460,375 445,340 435,300 430,250 435,210 440,180 Z",
  "M 530,50 L 580,40 650,45 730,60 790,80 840,110 870,140 880,175 860,200 820,220 780,230 730,225 680,210 640,185 600,160 570,130 550,100 540,70 Z",
  "M 770,310 L 820,300 870,310 900,340 895,375 870,400 840,410 800,395 775,365 765,340 Z",
  "M 845,85 L 860,80 870,90 868,110 860,120 850,115 845,100 Z",
  "M 750,270 L 780,265 810,275 830,285 820,295 790,290 760,280 Z",
];

const cities: Record<string, [number, number]> = {
  "São Paulo": [255, 360],
  "Paris": [490, 105],
  "New York": [210, 140],
  "Tokyo": [860, 100],
  "London": [475, 90],
  "Dubai": [620, 195],
  "Rome": [510, 120],
  "Miami": [210, 195],
  "Lisbon": [445, 125],
  "Barcelona": [485, 118],
  "Frankfurt": [505, 95],
  "Amsterdam": [490, 85],
  "Doha": [615, 205],
  "Singapore": [770, 280],
  "Buenos Aires": [245, 400],
  "Cancún": [175, 190],
  "Lima": [195, 310],
  "Cairo": [540, 175],
  "Johannesburg": [525, 370],
  "Sydney": [870, 380],
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
      <path d={path} fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="0.3" strokeOpacity="0.06" />
      <motion.path
        d={path}
        fill="none"
        stroke="url(#routeGradCorp)"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.6, 0.6, 0] }}
        transition={{ duration: 4, delay, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      />
      <motion.circle
        r="2.5"
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
          <div className="relative glass-card p-4 sm:p-8 overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
              backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }} />

            {/* HUD labels */}
            <div className="absolute top-4 left-6 font-mono text-[9px] text-primary/30 tracking-[0.3em] pointer-events-none z-20">
              GLOBAL TRACKING SYSTEM v4.0
            </div>
            <div className="absolute top-4 right-6 font-mono text-[9px] text-primary/30 tracking-[0.3em] pointer-events-none z-20">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>● LIVE</motion.span>
            </div>

            <svg viewBox="0 0 1000 500" className="w-full h-auto relative z-10" style={{ maxHeight: "500px" }}>
              <defs>
                <linearGradient id="routeGradCorp" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="hsl(45, 70%, 58%)" stopOpacity="0.3" />
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
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Continent outlines */}
              {continentPaths.map((d, i) => (
                <path key={i} d={d} fill="hsl(217, 91%, 60%)" fillOpacity="0.03" stroke="hsl(217, 91%, 60%)" strokeOpacity="0.1" strokeWidth="0.8" />
              ))}

              {/* Grid lines */}
              {[100, 200, 300, 400].map((y) => (
                <line key={`lat-${y}`} x1="50" y1={y} x2="950" y2={y} stroke="hsl(220, 14%, 30%)" strokeOpacity="0.15" strokeWidth="0.3" strokeDasharray="8 8" />
              ))}
              {[200, 400, 600, 800].map((x) => (
                <line key={`lon-${x}`} x1={x} y1="30" x2={x} y2="470" stroke="hsl(220, 14%, 30%)" strokeOpacity="0.15" strokeWidth="0.3" strokeDasharray="8 8" />
              ))}

              {/* GRU hub glow */}
              <circle cx={cities["São Paulo"][0]} cy={cities["São Paulo"][1]} r="35" fill="url(#hubGlowCorp)" />

              {/* Animated routes */}
              {routePaths.map((path, i) => (
                <AnimatedRoute key={i} path={path} delay={i * 0.5} />
              ))}

              {/* City dots */}
              {cityEntries.map(([name, pos], i) => (
                <g key={name}>
                  {i === activePulse && (
                    <motion.circle
                      cx={pos[0]} cy={pos[1]} r="12"
                      fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="0.5"
                      animate={{ opacity: [0, 0.4, 0], scale: [0.5, 2.5, 3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <circle
                    cx={pos[0]} cy={pos[1]}
                    r={name === "São Paulo" ? "5" : "3"}
                    fill="none"
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth="0.5"
                    opacity={name === "São Paulo" ? 0.5 : 0.15}
                  />
                  <circle
                    cx={pos[0]} cy={pos[1]}
                    r={name === "São Paulo" ? "3" : "1.5"}
                    fill={name === "São Paulo" ? "hsl(217, 91%, 60%)" : "hsl(45, 70%, 58%)"}
                    filter="url(#softGlowCorp)"
                    opacity={name === "São Paulo" ? 1 : 0.6}
                  />
                  <text
                    x={pos[0]} y={pos[1] - 10}
                    textAnchor="middle"
                    fill="hsl(220, 14%, 70%)"
                    fontSize="7"
                    fontFamily="'JetBrains Mono', monospace"
                    opacity="0.4"
                    letterSpacing="1"
                  >
                    {name === "São Paulo" ? "GRU" : name.toUpperCase().slice(0, 6)}
                  </text>
                </g>
              ))}

              <text
                x={cities["São Paulo"][0]} y={cities["São Paulo"][1] + 18}
                textAnchor="middle"
                fill="hsl(217, 91%, 60%)"
                fontSize="6"
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="bold"
                opacity="0.5"
                letterSpacing="3"
              >
                HUB PRINCIPAL
              </text>
            </svg>

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
