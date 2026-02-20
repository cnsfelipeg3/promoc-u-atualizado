import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Radar } from "lucide-react";

const cities: Record<string, [number, number]> = {
  "São Paulo": [340, 370],
  "Paris": [500, 145],
  "New York": [290, 170],
  "Tokyo": [870, 175],
  "London": [490, 135],
  "Dubai": [640, 215],
  "Rome": [525, 160],
  "Miami": [275, 215],
  "Lisbon": [465, 165],
  "Barcelona": [505, 160],
  "Frankfurt": [520, 140],
  "Amsterdam": [510, 130],
  "Doha": [635, 220],
  "Singapore": [785, 305],
  "Buenos Aires": [330, 400],
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
];

const continentPaths = [
  "M 150,80 L 180,75 220,80 260,90 290,120 310,140 300,170 280,200 260,220 240,230 220,210 200,180 180,140 160,120 140,100 Z",
  "M 280,260 L 310,250 340,270 360,310 370,350 360,390 340,420 310,430 290,400 280,360 270,320 Z",
  "M 470,80 L 490,75 520,80 550,90 560,120 550,140 530,160 510,165 490,160 475,140 470,110 Z",
  "M 480,180 L 520,175 560,200 580,250 570,310 550,360 520,380 490,360 470,310 460,260 470,220 Z",
  "M 560,60 L 620,55 700,70 780,90 850,120 880,160 870,200 830,220 780,230 720,220 660,200 620,170 590,140 570,110 Z",
  "M 790,340 L 830,330 870,340 890,370 880,400 850,410 810,400 790,370 Z",
];

// Stable paths generated once
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
      {/* Static faint trail */}
      <path
        d={path}
        fill="none"
        stroke="hsl(185, 85%, 50%)"
        strokeWidth="0.3"
        strokeOpacity="0.08"
      />
      {/* Animated arc */}
      <motion.path
        d={path}
        fill="none"
        stroke="url(#routeGradientCyan)"
        strokeWidth="1.2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.7, 0.7, 0] }}
        transition={{
          duration: 4,
          delay,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut",
        }}
      />
      {/* Traveling dot */}
      <motion.circle
        r="3"
        fill="hsl(185, 85%, 50%)"
        filter="url(#glowCyan)"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          offsetDistance: ["0%", "100%"],
        }}
        transition={{
          duration: 3.5,
          delay: delay + 0.3,
          repeat: Infinity,
          repeatDelay: 3.5,
          ease: "easeInOut",
        }}
        style={{ offsetPath: `path("${path}")` }}
      />
    </g>
  );
}

export default function GlobalMapSection() {
  const [activePulse, setActivePulse] = useState(0);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
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

      {/* Ambient effects */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 35% 75%, hsl(185 85% 50% / 0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, hsl(280 80% 65% / 0.03) 0%, transparent 50%)",
      }} />

      {/* Scanline */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none z-20"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Radar className="w-5 h-5 text-primary" />
            </motion.div>
            <p className="text-primary font-semibold text-sm uppercase tracking-[0.2em] font-mono">
              Alcance global
            </p>
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
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(185 85% 50%) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(185 85% 50%) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
              }}
            />

            {/* HUD corners */}
            <div className="absolute top-3 left-3 w-6 h-6 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-px bg-primary/30" />
              <div className="absolute top-0 left-0 h-full w-px bg-primary/30" />
            </div>
            <div className="absolute top-3 right-3 w-6 h-6 pointer-events-none">
              <div className="absolute top-0 right-0 w-full h-px bg-primary/30" />
              <div className="absolute top-0 right-0 h-full w-px bg-primary/30" />
            </div>
            <div className="absolute bottom-3 left-3 w-6 h-6 pointer-events-none">
              <div className="absolute bottom-0 left-0 w-full h-px bg-primary/30" />
              <div className="absolute bottom-0 left-0 h-full w-px bg-primary/30" />
            </div>
            <div className="absolute bottom-3 right-3 w-6 h-6 pointer-events-none">
              <div className="absolute bottom-0 right-0 w-full h-px bg-primary/30" />
              <div className="absolute bottom-0 right-0 h-full w-px bg-primary/30" />
            </div>

            {/* HUD labels */}
            <div className="absolute top-4 left-10 font-mono text-[9px] text-primary/40 tracking-[0.3em] pointer-events-none z-20">
              GLOBAL TRACKING SYSTEM v3.2
            </div>
            <div className="absolute top-4 right-10 font-mono text-[9px] text-primary/40 tracking-[0.3em] pointer-events-none z-20">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                ● LIVE
              </motion.span>
            </div>

            <svg
              viewBox="0 0 1000 500"
              className="w-full h-auto relative z-10"
              style={{ maxHeight: "500px" }}
            >
              <defs>
                <linearGradient id="routeGradientCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(185, 85%, 50%)" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="hsl(185, 85%, 50%)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(165, 80%, 55%)" stopOpacity="0.3" />
                </linearGradient>
                <filter id="glowCyan">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="softGlowCyan">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="hsl(185, 85%, 50%)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(185, 85%, 50%)" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Continent outlines with cyan glow */}
              {continentPaths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="hsl(185, 85%, 50%)"
                  fillOpacity="0.03"
                  stroke="hsl(185, 85%, 50%)"
                  strokeOpacity="0.1"
                  strokeWidth="0.8"
                />
              ))}

              {/* Latitude/longitude grid lines */}
              {[100, 200, 300, 400].map((y) => (
                <line key={`lat-${y}`} x1="50" y1={y} x2="950" y2={y} stroke="hsl(185, 85%, 50%)" strokeOpacity="0.03" strokeWidth="0.5" strokeDasharray="8 8" />
              ))}
              {[200, 400, 600, 800].map((x) => (
                <line key={`lon-${x}`} x1={x} y1="30" x2={x} y2="470" stroke="hsl(185, 85%, 50%)" strokeOpacity="0.03" strokeWidth="0.5" strokeDasharray="8 8" />
              ))}

              {/* GRU hub glow */}
              <circle cx={cities["São Paulo"][0]} cy={cities["São Paulo"][1]} r="35" fill="url(#hubGlow)" />

              {/* Animated routes */}
              {routePaths.map((path, i) => (
                <AnimatedRoute key={i} path={path} delay={i * 0.5} />
              ))}

              {/* City dots */}
              {cityEntries.map(([name, pos], i) => (
                <g key={name}>
                  {/* Multi-ring pulse */}
                  {i === activePulse && (
                    <>
                      <motion.circle
                        cx={pos[0]} cy={pos[1]} r="12"
                        fill="none" stroke="hsl(185, 85%, 50%)" strokeWidth="0.5"
                        animate={{ opacity: [0, 0.5, 0], scale: [0.5, 2.5, 3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.circle
                        cx={pos[0]} cy={pos[1]} r="8"
                        fill="none" stroke="hsl(185, 85%, 50%)" strokeWidth="0.3"
                        animate={{ opacity: [0, 0.3, 0], scale: [0.8, 2, 2.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      />
                    </>
                  )}

                  {/* Outer ring */}
                  <circle
                    cx={pos[0]} cy={pos[1]}
                    r={name === "São Paulo" ? "6" : "4"}
                    fill="none"
                    stroke="hsl(185, 85%, 50%)"
                    strokeWidth="0.5"
                    opacity={name === "São Paulo" ? 0.6 : 0.2}
                  />

                  {/* Core dot */}
                  <circle
                    cx={pos[0]} cy={pos[1]}
                    r={name === "São Paulo" ? "4" : "2"}
                    fill="hsl(185, 85%, 50%)"
                    filter="url(#softGlowCyan)"
                    opacity={name === "São Paulo" ? 1 : 0.7}
                  />

                  {/* Label */}
                  <text
                    x={pos[0]} y={pos[1] - 10}
                    textAnchor="middle"
                    fill="hsl(200, 20%, 85%)"
                    fontSize="7"
                    fontFamily="'JetBrains Mono', monospace"
                    opacity="0.5"
                    letterSpacing="1"
                  >
                    {name === "São Paulo" ? "GRU" : name.toUpperCase().slice(0, 6)}
                  </text>
                </g>
              ))}

              {/* GRU label */}
              <text
                x={cities["São Paulo"][0]} y={cities["São Paulo"][1] + 18}
                textAnchor="middle"
                fill="hsl(185, 85%, 50%)"
                fontSize="6"
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="bold"
                opacity="0.7"
                letterSpacing="3"
              >
                HUB PRINCIPAL
              </text>
            </svg>

            {/* Stats bar */}
            <div className="flex flex-wrap justify-center gap-8 mt-6 pt-6 border-t border-primary/10">
              {[
                { value: "150+", label: "Destinos" },
                { value: "24/7", label: "Monitoramento" },
                { value: "< 5min", label: "Tempo de alerta" },
                { value: "12", label: "Rotas ativas" },
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
