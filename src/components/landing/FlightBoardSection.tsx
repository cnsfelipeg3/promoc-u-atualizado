import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Flight {
  time: string;
  flight: string;
  destination: string;
  gate: string;
  status: "On Time" | "Boarding" | "Departed" | "Promo Alert 🔥";
  promo?: string;
}

const flights: Flight[] = [
  { time: "06:15", flight: "LA8084", destination: "PARIS CDG", gate: "A12", status: "On Time" },
  { time: "07:30", flight: "EK261", destination: "DUBAI DXB", gate: "B04", status: "Boarding" },
  { time: "08:45", flight: "AA930", destination: "NEW YORK JFK", gate: "C21", status: "Promo Alert 🔥", promo: "R$ 1.990" },
  { time: "09:20", flight: "AF457", destination: "PARIS CDG", gate: "A08", status: "Promo Alert 🔥", promo: "R$ 2.970" },
  { time: "10:00", flight: "TP092", destination: "LISBON LIS", gate: "B15", status: "On Time" },
  { time: "10:55", flight: "LH507", destination: "FRANKFURT FRA", gate: "C03", status: "Departed" },
  { time: "11:40", flight: "QR774", destination: "DOHA DOH", gate: "A19", status: "Boarding" },
  { time: "12:10", flight: "KL792", destination: "AMSTERDAM AMS", gate: "B22", status: "Promo Alert 🔥", promo: "R$ 2.490" },
  { time: "13:30", flight: "DL063", destination: "ATLANTA ATL", gate: "C11", status: "On Time" },
  { time: "14:15", flight: "BA248", destination: "LONDON LHR", gate: "A05", status: "Promo Alert 🔥", promo: "R$ 3.190" },
];

function StatusBadge({ status, promo }: { status: Flight["status"]; promo?: string }) {
  if (status === "Promo Alert 🔥") {
    return (
      <motion.span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold bg-primary/20 text-primary border border-primary/30"
        animate={{ opacity: [1, 0.6, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {promo} • ALERTA
      </motion.span>
    );
  }

  const colors: Record<string, string> = {
    "On Time": "text-emerald-400 bg-emerald-400/10",
    Boarding: "text-amber-400 bg-amber-400/10",
    Departed: "text-muted-foreground bg-muted/50",
  };

  return (
    <span className={`inline-flex px-3 py-1 rounded text-xs font-bold ${colors[status] || ""}`}>
      {status === "On Time" ? "NO HORÁRIO" : status === "Boarding" ? "EMBARQUE" : "PARTIU"}
    </span>
  );
}

export default function FlightBoardSection() {
  const [currentTime, setCurrentTime] = useState("06:15:00");

  useEffect(() => {
    const base = new Date();
    const tick = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - base.getTime()) / 100); // 10x speed
      const h = (6 + Math.floor(diff / 3600)) % 24;
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setCurrentTime(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Painel ao vivo
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Terminal de monitoramento <span className="text-gradient-primary">PromoCéu</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Nosso sistema varre centenas de voos em tempo real. Quando uma oportunidade surge, ela aparece instantaneamente no seu painel.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="glass-card overflow-hidden rounded-2xl border border-border/60">
            {/* Board header */}
            <div className="bg-card/90 border-b border-border/50 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-sm font-bold text-foreground tracking-wider">
                  DEPARTURES — GRU INTERNATIONAL
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">HORA LOCAL</span>
                <span className="font-mono text-sm font-bold text-primary tabular-nums">
                  {currentTime}
                </span>
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-5 gap-0 px-6 py-3 bg-card/50 border-b border-border/30 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Horário</span>
              <span>Voo</span>
              <span>Destino</span>
              <span>Portão</span>
              <span className="text-right">Status</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/20">
              <AnimatePresence>
                {flights.map((flight, i) => (
                  <motion.div
                    key={flight.flight}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className={`grid grid-cols-5 gap-0 px-6 py-3.5 items-center transition-colors duration-300 ${
                      flight.status === "Promo Alert 🔥"
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-card/40"
                    }`}
                  >
                    <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                      {flight.time}
                    </span>
                    <span className="font-mono text-sm text-foreground/80">{flight.flight}</span>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {flight.destination}
                    </span>
                    <span className="font-mono text-sm text-foreground/80">{flight.gate}</span>
                    <div className="text-right">
                      <StatusBadge status={flight.status} promo={flight.promo} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="bg-card/70 border-t border-border/40 px-6 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Atualizado a cada 30 segundos • {flights.filter((f) => f.status === "Promo Alert 🔥").length} alertas ativos
              </span>
              <motion.span
                className="text-xs text-primary font-semibold"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ● MONITORANDO
              </motion.span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
