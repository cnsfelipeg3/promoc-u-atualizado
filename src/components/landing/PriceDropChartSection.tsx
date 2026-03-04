import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, Activity, X, ArrowDown } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";

interface RouteData {
  route: string;
  label: string;
  flag: string;
  basePrice: number;
  promoPrice: number;
  drop: string;
}

const routes: RouteData[] = [
  { route: "GRU → CDG", label: "Paris", flag: "🇫🇷", basePrice: 6890, promoPrice: 2970, drop: "-57%" },
  { route: "GRU → JFK", label: "Nova York", flag: "🇺🇸", basePrice: 5400, promoPrice: 1990, drop: "-63%" },
  { route: "GRU → NRT", label: "Tóquio", flag: "🇯🇵", basePrice: 8200, promoPrice: 3490, drop: "-57%" },
  { route: "GRU → LHR", label: "Londres", flag: "🇬🇧", basePrice: 5800, promoPrice: 2690, drop: "-54%" },
  { route: "GRU → DXB", label: "Dubai", flag: "🇦🇪", basePrice: 7500, promoPrice: 3280, drop: "-56%" },
  { route: "GRU → FCO", label: "Roma", flag: "🇮🇹", basePrice: 5200, promoPrice: 2390, drop: "-54%" },
  { route: "GRU → MIA", label: "Miami", flag: "🇺🇸", basePrice: 3800, promoPrice: 1590, drop: "-58%" },
  { route: "GRU → LIS", label: "Lisboa", flag: "🇵🇹", basePrice: 4800, promoPrice: 2190, drop: "-54%" },
  { route: "GRU → BCN", label: "Barcelona", flag: "🇪🇸", basePrice: 5100, promoPrice: 2290, drop: "-55%" },
];

const months = ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez", "Jan", "Fev"];

function generateHistory(basePrice: number, promoPrice: number) {
  const market: number[] = [];
  const natleva: number[] = [];
  for (let i = 0; i < 12; i++) {
    const variation = 0.85 + Math.random() * 0.3;
    market.push(Math.round(basePrice * variation));
    const promoVariation = 0.8 + Math.random() * 0.4;
    natleva.push(Math.round(promoPrice * promoVariation));
  }
  return { market, natleva };
}

function LiveChart({ basePrice, promoPrice, index }: { basePrice: number; promoPrice: number; index: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<number[]>([]);
  const frameRef = useRef<number>(0);
  const lastPointTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const maxPoints = 60;
    const range = basePrice - promoPrice;

    if (dataRef.current.length === 0) {
      for (let i = 0; i < maxPoints; i++) {
        const progress = i / maxPoints;
        const trend = basePrice - range * progress * 0.8;
        const noise = (Math.random() - 0.5) * range * 0.08;
        dataRef.current.push(trend + noise);
      }
    }

    let animId: number;
    const phaseOffset = index * 1.3;
    const POINT_INTERVAL = 120;

    const draw = (timestamp: number) => {
      frameRef.current++;

      if (timestamp - lastPointTimeRef.current > POINT_INTERVAL) {
        lastPointTimeRef.current = timestamp;
        const t = frameRef.current * 0.008 + phaseOffset;
        const cyclicDrop = Math.sin(t) * range * 0.06;
        const longTrend = Math.max(promoPrice, promoPrice + range * 0.15 * Math.cos(t * 0.3) + cyclicDrop);
        const noise = (Math.random() - 0.5) * range * 0.03;
        dataRef.current.push(longTrend + noise);
        if (dataRef.current.length > maxPoints) dataRef.current.shift();
      }

      const data = dataRef.current;
      const min = Math.min(...data) - range * 0.05;
      const max = Math.max(...data) + range * 0.05;
      const valRange = max - min || 1;

      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "hsla(220, 14%, 30%, 0.15)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 5; i++) {
        const y = (i / 4) * h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Area fill
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "hsla(217, 91%, 60%, 0.12)");
      grad.addColorStop(1, "hsla(217, 91%, 60%, 0)");

      ctx.beginPath();
      data.forEach((val, i) => {
        const x = (i / (maxPoints - 1)) * w;
        const y = ((max - val) / valRange) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      const lastX = ((data.length - 1) / (maxPoints - 1)) * w;
      ctx.lineTo(lastX, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      const lineGrad = ctx.createLinearGradient(0, 0, w, 0);
      lineGrad.addColorStop(0, "hsla(217, 91%, 60%, 0.3)");
      lineGrad.addColorStop(0.7, "hsla(217, 91%, 60%, 0.8)");
      lineGrad.addColorStop(1, "hsla(217, 91%, 60%, 1)");

      ctx.beginPath();
      data.forEach((val, i) => {
        const x = (i / (maxPoints - 1)) * w;
        const y = ((max - val) / valRange) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dot
      const lastVal = data[data.length - 1];
      const dotX = lastX;
      const dotY = ((max - lastVal) / valRange) * h;

      const pulseSize = 6 + Math.sin(frameRef.current * 0.04) * 2;
      const glowGrad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, pulseSize);
      glowGrad.addColorStop(0, "hsla(217, 91%, 60%, 0.5)");
      glowGrad.addColorStop(1, "hsla(217, 91%, 60%, 0)");
      ctx.beginPath();
      ctx.arc(dotX, dotY, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(217, 91%, 60%)";
      ctx.fill();

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [basePrice, promoPrice, index]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={120}
      className="w-full h-28 rounded"
    />
  );
}

function HistoryChart({ route }: { route: RouteData }) {
  const [history] = useState(() => generateHistory(route.basePrice, route.promoPrice));

  const allValues = [...history.market, ...history.natleva];
  const maxVal = Math.max(...allValues) * 1.05;
  const minVal = Math.min(...allValues) * 0.9;
  const range = maxVal - minVal;

  const w = 700;
  const h = 280;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const getX = (i: number) => padL + (i / 11) * chartW;
  const getY = (val: number) => padT + ((maxVal - val) / range) * chartH;

  const marketPath = history.market.map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`).join(" ");
  const natlevaPath = history.natleva.map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <defs>
        <linearGradient id="natlevaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3, 4].map((i) => {
        const y = padT + (i / 4) * chartH;
        const val = maxVal - (i / 4) * range;
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="hsl(220, 14%, 20%)" strokeOpacity="0.3" strokeWidth="0.5" />
            <text x={padL - 8} y={y + 4} textAnchor="end" fill="hsl(220, 14%, 50%)" fontSize="9" fontFamily="monospace">
              {Math.round(val / 1000)}k
            </text>
          </g>
        );
      })}

      {months.map((m, i) => (
        <text key={m} x={getX(i)} y={h - 8} textAnchor="middle" fill="hsl(220, 14%, 50%)" fontSize="9" fontFamily="monospace">
          {m}
        </text>
      ))}

      <path
        d={`${natlevaPath} L ${getX(11)} ${padT + chartH} L ${getX(0)} ${padT + chartH} Z`}
        fill="url(#natlevaFill)"
      />

      <path d={marketPath} fill="none" stroke="hsl(220, 14%, 40%)" strokeWidth="2" strokeDasharray="6 3" opacity="0.5" />
      <path d={natlevaPath} fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="2.5" />

      {history.market.map((v, i) => (
        <circle key={`m-${i}`} cx={getX(i)} cy={getY(v)} r="3" fill="hsl(220, 14%, 40%)" opacity="0.4" />
      ))}
      {history.natleva.map((v, i) => (
        <circle key={`n-${i}`} cx={getX(i)} cy={getY(v)} r="3.5" fill="hsl(217, 91%, 60%)" />
      ))}
    </svg>
  );
}

function ExpandedChart({ route, onClose }: { route: RouteData; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        className="relative z-10 w-full max-w-3xl glass-card-highlight p-6 sm:p-8 overflow-hidden"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{route.flag}</span>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">{route.label}</h3>
            <span className="font-mono text-sm text-muted-foreground">{route.route}</span>
          </div>
          <span className="ml-auto flex items-center gap-1 text-primary text-lg font-bold font-mono">
            <ArrowDown className="w-5 h-5" />
            {route.drop}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Histórico de 12 meses — Preço de mercado vs. Preço PromoCéu
        </p>

        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5" style={{ borderTop: "2px dashed hsl(220, 14%, 40%)" }} />
            <span className="text-xs text-muted-foreground font-mono">Mercado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-primary rounded" />
            <span className="text-xs text-primary font-mono font-bold">PromoCéu</span>
          </div>
        </div>

        <div className="border border-border/30 rounded-lg bg-background/40 p-3">
          <HistoryChart route={route} />
        </div>

        <div className="flex justify-between items-end mt-5 pt-4 border-t border-border/20">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Tarifa média de mercado</p>
            <p className="text-muted-foreground line-through text-lg font-mono">
              R$ {route.basePrice.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Melhor preço PromoCéu</p>
            <p className="text-primary font-bold text-2xl font-display">
              R$ {route.promoPrice.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PriceDropChartSection() {
  const [now, setNow] = useState(new Date());
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="price-charts" className="relative py-24 px-4 overflow-hidden">
      <div className="section-divider w-full absolute top-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Activity className="w-5 h-5 text-primary" />
            </motion.div>
            <p className="text-primary font-semibold text-sm uppercase tracking-widest">
              Monitoramento em tempo real
            </p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Radar de preços <span className="text-gradient-primary">ao vivo</span>
          </h2>
          <p className="text-muted-foreground text-center mb-4 max-w-2xl mx-auto">
            Nosso sistema de inteligência aérea rastreia milhares de rotas em tempo real.
            Clique em qualquer destino para ver o histórico completo de 12 meses.
          </p>
          <p className="text-center mb-12">
            <span className="inline-flex items-center gap-2 font-mono text-xs text-primary/70 bg-primary/5 border border-primary/15 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              LIVE — {now.toLocaleTimeString("pt-BR")}
            </span>
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {routes.map((r, i) => (
            <ScrollReveal key={i} delay={i * 0.07}>
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                className="glass-card p-5 group relative overflow-hidden cursor-pointer"
                onClick={() => setSelectedRoute(r)}
              >
                <div className="absolute bottom-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-primary/50 font-mono">
                  CLIQUE PARA EXPANDIR
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r.flag}</span>
                    <div>
                      <span className="font-mono text-sm font-bold text-foreground">{r.route}</span>
                      <p className="text-xs text-foreground/60">{r.label}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-primary text-sm font-bold font-mono">
                    <TrendingDown className="w-4 h-4" />
                    {r.drop}
                  </span>
                </div>

                <div className="relative rounded overflow-hidden border border-border/20 bg-background/40">
                  <LiveChart basePrice={r.basePrice} promoPrice={r.promoPrice} index={i} />
                </div>

                <div className="flex justify-between items-end mt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-foreground/50 mb-0.5">Tarifa comum</p>
                    <p className="text-foreground/60 line-through text-sm font-mono">
                      R$ {r.basePrice.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-foreground/50 mb-0.5">Alerta PromoCéu</p>
                    <p className="text-primary font-bold text-xl font-display">
                      R$ {r.promoPrice.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedRoute && (
          <ExpandedChart route={selectedRoute} onClose={() => setSelectedRoute(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
