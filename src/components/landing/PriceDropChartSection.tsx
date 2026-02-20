import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { TrendingDown, Activity } from "lucide-react";
import { useEffect, useState, useRef } from "react";

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

function LiveChart({ basePrice, promoPrice, index }: { basePrice: number; promoPrice: number; index: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<number[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const maxPoints = 60;
    const range = basePrice - promoPrice;

    // Seed initial data with a downward trend
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

    const draw = () => {
      frameRef.current++;

      // Add new point with continuous downward oscillation
      const t = frameRef.current * 0.02 + phaseOffset;
      const cyclicDrop = Math.sin(t) * range * 0.06;
      const longTrend = Math.max(promoPrice, promoPrice + range * 0.15 * Math.cos(t * 0.3) + cyclicDrop);
      const noise = (Math.random() - 0.5) * range * 0.03;
      dataRef.current.push(longTrend + noise);
      if (dataRef.current.length > maxPoints) dataRef.current.shift();

      const data = dataRef.current;
      const min = Math.min(...data) - range * 0.05;
      const max = Math.max(...data) + range * 0.05;
      const valRange = max - min || 1;

      ctx.clearRect(0, 0, w, h);

      // Grid lines (futuristic)
      ctx.strokeStyle = "hsla(38, 85%, 55%, 0.06)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 5; i++) {
        const y = (i / 4) * h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Area gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "hsla(38, 85%, 55%, 0.15)");
      grad.addColorStop(1, "hsla(38, 85%, 55%, 0)");

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
      lineGrad.addColorStop(0, "hsla(38, 85%, 55%, 0.3)");
      lineGrad.addColorStop(0.7, "hsla(38, 85%, 55%, 0.9)");
      lineGrad.addColorStop(1, "hsla(38, 85%, 55%, 1)");

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

      // Glow dot at the end
      const lastVal = data[data.length - 1];
      const dotX = lastX;
      const dotY = ((max - lastVal) / valRange) * h;

      // Pulse glow
      const pulseSize = 8 + Math.sin(frameRef.current * 0.1) * 3;
      const glowGrad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, pulseSize);
      glowGrad.addColorStop(0, "hsla(38, 85%, 55%, 0.6)");
      glowGrad.addColorStop(1, "hsla(38, 85%, 55%, 0)");
      ctx.beginPath();
      ctx.arc(dotX, dotY, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Solid dot
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(38, 85%, 55%)";
      ctx.fill();

      // Scanline effect
      const scanY = (frameRef.current * 1.5) % h;
      const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      scanGrad.addColorStop(0, "hsla(38, 85%, 55%, 0)");
      scanGrad.addColorStop(0.5, "hsla(38, 85%, 55%, 0.04)");
      scanGrad.addColorStop(1, "hsla(38, 85%, 55%, 0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 2, w, 4);

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

export default function PriceDropChartSection() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="price-charts" className="relative py-24 px-4 overflow-hidden">
      <div className="section-divider w-full absolute top-0" />

      {/* Background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(38 85% 55% / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(38 85% 55% / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

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
            Os gráficos abaixo refletem a dinâmica de preços monitorada pela PromoCéu.
          </p>
          <p className="text-center mb-12">
            <span className="inline-flex items-center gap-2 font-mono text-xs text-primary/80 bg-primary/5 border border-primary/20 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              LIVE — {now.toLocaleTimeString("pt-BR")}
            </span>
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {routes.map((r, i) => (
            <ScrollReveal key={i} delay={i * 0.07}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                className="glass-card p-5 group relative overflow-hidden"
              >
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                  <div className="absolute top-0 right-0 w-px h-8 bg-gradient-to-b from-primary/40 to-transparent" />
                  <div className="absolute top-0 right-0 h-px w-8 bg-gradient-to-l from-primary/40 to-transparent" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r.flag}</span>
                    <div>
                      <span className="font-mono text-sm font-bold text-foreground">{r.route}</span>
                      <p className="text-xs text-muted-foreground">{r.label}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-primary text-sm font-bold font-mono">
                    <TrendingDown className="w-4 h-4" />
                    {r.drop}
                  </span>
                </div>

                {/* Live Chart */}
                <div className="relative rounded overflow-hidden border border-border/30 bg-background/40">
                  <LiveChart basePrice={r.basePrice} promoPrice={r.promoPrice} index={i} />
                </div>

                {/* Prices */}
                <div className="flex justify-between items-end mt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Tarifa comum</p>
                    <p className="text-muted-foreground line-through text-sm font-mono">
                      R$ {r.basePrice.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Alerta PromoCéu</p>
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
    </section>
  );
}
