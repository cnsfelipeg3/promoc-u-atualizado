import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Simplified world map coordinates (mercator-ish projection)
// Format: [x%, y%] on a 1000x500 canvas
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

// Simplified world map outline paths (continents)
const continentPaths = [
  // North America
  "M 150,80 L 180,75 220,80 260,90 290,120 310,140 300,170 280,200 260,220 240,230 220,210 200,180 180,140 160,120 140,100 Z",
  // South America
  "M 280,260 L 310,250 340,270 360,310 370,350 360,390 340,420 310,430 290,400 280,360 270,320 Z",
  // Europe
  "M 470,80 L 490,75 520,80 550,90 560,120 550,140 530,160 510,165 490,160 475,140 470,110 Z",
  // Africa
  "M 480,180 L 520,175 560,200 580,250 570,310 550,360 520,380 490,360 470,310 460,260 470,220 Z",
  // Asia
  "M 560,60 L 620,55 700,70 780,90 850,120 880,160 870,200 830,220 780,230 720,220 660,200 620,170 590,140 570,110 Z",
  // Australia
  "M 790,340 L 830,330 870,340 890,370 880,400 850,410 810,400 790,370 Z",
];

function AnimatedRoute({ from, to, delay, index }: { from: [number, number]; to: [number, number]; delay: number; index: number }) {
  const midX = (from[0] + to[0]) / 2;
  const midY = Math.min(from[1], to[1]) - 40 - Math.random() * 30;
  const path = `M ${from[0]} ${from[1]} Q ${midX} ${midY} ${to[0]} ${to[1]}`;

  return (
    <g>
      {/* Route arc */}
      <motion.path
        d={path}
        fill="none"
        stroke="url(#routeGradient)"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.6, 0.6, 0] }}
        transition={{
          duration: 4,
          delay: delay,
          repeat: Infinity,
          repeatDelay: routes.length * 0.5,
          ease: "easeInOut",
        }}
      />
      {/* Traveling dot */}
      <motion.circle
        r="2.5"
        fill="hsl(38, 85%, 55%)"
        filter="url(#glow)"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          offsetDistance: ["0%", "100%"],
        }}
        transition={{
          duration: 3,
          delay: delay + 0.5,
          repeat: Infinity,
          repeatDelay: routes.length * 0.5 + 1,
          ease: "easeInOut",
        }}
        style={{
          offsetPath: `path("${path}")`,
        }}
      />
    </g>
  );
}

export default function GlobalMapSection() {
  const [activePulse, setActivePulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePulse((prev) => (prev + 1) % Object.keys(cities).length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const cityEntries = Object.entries(cities);

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="section-divider w-full absolute top-0" />

      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Alcance global
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Monitoramento <span className="text-gradient-primary">em escala mundial</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Rastreamos oportunidades em mais de 150 destinos ao redor do mundo, 24 horas por dia, 7 dias por semana.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="relative glass-card p-4 sm:p-8 overflow-hidden">
            {/* Grid background */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(38 85% 55%) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(38 85% 55%) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
              }}
            />

            <svg
              viewBox="0 0 1000 500"
              className="w-full h-auto relative z-10"
              style={{ maxHeight: "500px" }}
            >
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(38, 85%, 55%)" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="hsl(38, 85%, 55%)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(38, 85%, 55%)" stopOpacity="0.2" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="softGlow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Continent outlines */}
              {continentPaths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="hsl(38, 85%, 55%)"
                  fillOpacity="0.04"
                  stroke="hsl(38, 85%, 55%)"
                  strokeOpacity="0.12"
                  strokeWidth="0.8"
                />
              ))}

              {/* Animated routes */}
              {routes.map((route, i) => (
                <AnimatedRoute
                  key={i}
                  index={i}
                  from={cities[route.from]}
                  to={cities[route.to]}
                  delay={i * 0.6}
                />
              ))}

              {/* City dots */}
              {cityEntries.map(([name, pos], i) => (
                <g key={name}>
                  {/* Pulse ring */}
                  <motion.circle
                    cx={pos[0]}
                    cy={pos[1]}
                    r="8"
                    fill="none"
                    stroke="hsl(38, 85%, 55%)"
                    strokeWidth="0.5"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={
                      i === activePulse
                        ? { opacity: [0, 0.6, 0], scale: [0.5, 2, 2.5] }
                        : { opacity: 0 }
                    }
                    transition={{ duration: 2, repeat: i === activePulse ? Infinity : 0 }}
                  />
                  {/* Dot */}
                  <circle
                    cx={pos[0]}
                    cy={pos[1]}
                    r={name === "São Paulo" ? "4" : "2.5"}
                    fill="hsl(38, 85%, 55%)"
                    filter="url(#softGlow)"
                    opacity={name === "São Paulo" ? 1 : 0.7}
                  />
                  {/* Label */}
                  <text
                    x={pos[0]}
                    y={pos[1] - 10}
                    textAnchor="middle"
                    fill="hsl(40, 20%, 92%)"
                    fontSize="8"
                    fontFamily="monospace"
                    opacity="0.6"
                  >
                    {name === "São Paulo" ? "GRU" : name.toUpperCase().slice(0, 6)}
                  </text>
                </g>
              ))}

              {/* GRU label enhanced */}
              <text
                x={cities["São Paulo"][0]}
                y={cities["São Paulo"][1] + 18}
                textAnchor="middle"
                fill="hsl(38, 85%, 55%)"
                fontSize="7"
                fontFamily="monospace"
                fontWeight="bold"
                opacity="0.8"
              >
                HUB PRINCIPAL
              </text>
            </svg>

            {/* Stats bar */}
            <div className="flex flex-wrap justify-center gap-6 mt-6 pt-6 border-t border-border/20">
              {[
                { value: "150+", label: "Destinos" },
                { value: "24/7", label: "Monitoramento" },
                { value: "< 5min", label: "Tempo de alerta" },
                { value: "12", label: "Rotas ativas" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="font-display text-lg sm:text-xl font-bold text-primary">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
