import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";

interface PricePoint {
  day: string;
  price: number;
}

const routes = [
  {
    route: "GRU → CDG",
    label: "São Paulo → Paris",
    flag: "🇫🇷",
    data: [
      { day: "Seg", price: 6890 },
      { day: "Ter", price: 6450 },
      { day: "Qua", price: 5900 },
      { day: "Qui", price: 4800 },
      { day: "Sex", price: 3950 },
      { day: "Sáb", price: 3200 },
      { day: "Dom", price: 2970 },
    ],
    drop: "-57%",
  },
  {
    route: "GRU → JFK",
    label: "São Paulo → Nova York",
    flag: "🇺🇸",
    data: [
      { day: "Seg", price: 5400 },
      { day: "Ter", price: 5100 },
      { day: "Qua", price: 4600 },
      { day: "Qui", price: 3800 },
      { day: "Sex", price: 3100 },
      { day: "Sáb", price: 2400 },
      { day: "Dom", price: 1990 },
    ],
    drop: "-63%",
  },
  {
    route: "GRU → NRT",
    label: "São Paulo → Tóquio",
    flag: "🇯🇵",
    data: [
      { day: "Seg", price: 8200 },
      { day: "Ter", price: 7800 },
      { day: "Qua", price: 6900 },
      { day: "Qui", price: 5500 },
      { day: "Sex", price: 4800 },
      { day: "Sáb", price: 4100 },
      { day: "Dom", price: 3490 },
    ],
    drop: "-57%",
  },
];

function MiniChart({ data, animate }: { data: PricePoint[]; animate: boolean }) {
  const max = Math.max(...data.map((d) => d.price));
  const min = Math.min(...data.map((d) => d.price));
  const range = max - min || 1;
  const w = 280;
  const h = 100;
  const pad = 8;

  const points = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: pad + (1 - (d.price - min) / range) * (h - pad * 2),
  }));

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(38 85% 55%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(38 85% 55%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#chartGrad)"
        initial={{ opacity: 0 }}
        animate={animate ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.5 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="hsl(38 85% 55%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={animate ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      {/* End dot */}
      <motion.circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="4"
        fill="hsl(38 85% 55%)"
        initial={{ scale: 0 }}
        animate={animate ? { scale: 1 } : {}}
        transition={{ delay: 1.5, duration: 0.3 }}
      />
    </svg>
  );
}

export default function PriceDropChartSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    const el = document.getElementById("price-charts");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="price-charts" className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Monitoramento em tempo real
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Veja os preços caindo <span className="text-gradient-primary">ao vivo</span>
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Nosso sistema rastreia milhares de rotas diariamente. Quando identificamos uma queda significativa, você é o primeiro a saber.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {routes.map((r, i) => (
            <ScrollReveal key={i} delay={i * 0.12}>
              <div className="glass-card p-6 group hover:-translate-y-1.5 transition-all duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r.flag}</span>
                    <span className="font-mono text-sm font-bold text-foreground">{r.route}</span>
                  </div>
                  <span className="flex items-center gap-1 text-primary text-sm font-bold">
                    <TrendingDown className="w-4 h-4" />
                    {r.drop}
                  </span>
                </div>

                {/* Chart */}
                <MiniChart data={r.data} animate={visible} />

                {/* Price labels */}
                <div className="flex justify-between items-baseline mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">De</p>
                    <p className="text-muted-foreground line-through text-sm">
                      R$ {r.data[0].price.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Por</p>
                    <p className="text-primary font-bold text-xl font-display">
                      R$ {r.data[r.data.length - 1].price.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>

                {/* Day labels */}
                <div className="flex justify-between mt-2">
                  {r.data.map((d, di) => (
                    <span key={di} className="text-[10px] text-muted-foreground">
                      {d.day}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
