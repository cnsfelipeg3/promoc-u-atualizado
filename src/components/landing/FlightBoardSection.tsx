import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";

type FlightStatus = "NO HORÁRIO" | "EMBARQUE" | "DECOLOU" | "ALERTA PROMO";

interface Flight {
  id: string;
  time: string;
  code: string;
  destination: string;
  gate: string;
  status: FlightStatus;
  promo?: string;
  airline: string;
}

const initialFlights: Flight[] = [
  { id: "1", time: "06:15", code: "LA8084", destination: "PARIS CDG", gate: "A12", status: "DECOLOU", airline: "LATAM", promo: "R$ 2.970" },
  { id: "2", time: "07:30", code: "EK261", destination: "DUBAI DXB", gate: "B04", status: "DECOLOU", airline: "EMIRATES" },
  { id: "3", time: "08:45", code: "AA930", destination: "NEW YORK JFK", gate: "C21", status: "ALERTA PROMO", promo: "R$ 1.990", airline: "AMERICAN" },
  { id: "4", time: "09:20", code: "AF457", destination: "LISBON LIS", gate: "A08", status: "EMBARQUE", airline: "AIR FRANCE" },
  { id: "5", time: "10:00", code: "TP092", destination: "LONDON LHR", gate: "B15", status: "ALERTA PROMO", promo: "R$ 2.490", airline: "TAP" },
  { id: "6", time: "10:55", code: "LH507", destination: "FRANKFURT FRA", gate: "C03", status: "NO HORÁRIO", airline: "LUFTHANSA" },
  { id: "7", time: "11:40", code: "QR774", destination: "TOKYO NRT", gate: "A19", status: "NO HORÁRIO", airline: "QATAR" },
  { id: "8", time: "12:10", code: "KL792", destination: "AMSTERDAM AMS", gate: "B22", status: "ALERTA PROMO", promo: "R$ 3.190", airline: "KLM" },
  { id: "9", time: "13:30", code: "DL063", destination: "MIAMI MIA", gate: "C11", status: "NO HORÁRIO", airline: "DELTA" },
  { id: "10", time: "14:15", code: "BA248", destination: "BARCELONA BCN", gate: "A05", status: "NO HORÁRIO", airline: "BRITISH" },
  { id: "11", time: "15:00", code: "AZ681", destination: "ROME FCO", gate: "B09", status: "NO HORÁRIO", airline: "ITA" },
  { id: "12", time: "16:20", code: "SQ027", destination: "SINGAPORE SIN", gate: "C17", status: "NO HORÁRIO", airline: "SINGAPORE" },
];

const statusFlow: FlightStatus[] = ["NO HORÁRIO", "EMBARQUE", "DECOLOU"];
const promos = ["R$ 1.990", "R$ 2.290", "R$ 2.490", "R$ 2.970", "R$ 3.190", "R$ 1.590"];

// Split-flap character animation
function SplitFlapChar({ char, delay = 0 }: { char: string; delay?: number }) {
  if (char === " ") return <span className="inline-block" style={{ width: "0.3ch" }}>&nbsp;</span>;
  return (
    <motion.span
      key={char}
      initial={{ rotateX: -90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      exit={{ rotateX: 90, opacity: 0 }}
      transition={{ duration: 0.15, delay }}
      className="inline-block"
      style={{ perspective: "100px" }}
    >
      {char}
    </motion.span>
  );
}

function SplitFlapText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={className}>
      <AnimatePresence mode="popLayout">
        {text.split("").map((char, i) => (
          <SplitFlapChar key={`${i}-${char}`} char={char} delay={i * 0.02} />
        ))}
      </AnimatePresence>
    </span>
  );
}

function StatusBadge({ status, promo }: { status: FlightStatus; promo?: string }) {
  if (status === "ALERTA PROMO") {
    return (
      <motion.div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary/15 border border-primary/30"
        animate={{ 
          boxShadow: [
            "0 0 0px hsl(38 85% 55% / 0)",
            "0 0 12px hsl(38 85% 55% / 0.3)",
            "0 0 0px hsl(38 85% 55% / 0)",
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-primary font-bold text-xs font-mono">{promo}</span>
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-primary"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>
    );
  }

  const config: Record<string, { bg: string; text: string; dot: string }> = {
    "NO HORÁRIO": { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
    "EMBARQUE": { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
    "DECOLOU": { bg: "bg-muted/30 border-border/30", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  };

  const c = config[status] || config["DECOLOU"];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-bold font-mono ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <AnimatePresence mode="popLayout">
        <SplitFlapText text={status} />
      </AnimatePresence>
    </span>
  );
}

export default function FlightBoardSection() {
  const [flights, setFlights] = useState(initialFlights);
  const [currentTime, setCurrentTime] = useState("");
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const tickRef = useRef(0);

  // Real clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("pt-BR"));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Status cycling - advance one random flight every 4 seconds
  const advanceFlight = useCallback(() => {
    setFlights((prev) => {
      const mutable = prev.filter((f) => f.status !== "DECOLOU" && f.status !== "ALERTA PROMO");
      if (mutable.length === 0) {
        // Reset cycle — bring some flights back
        return prev.map((f, i) => {
          if (i % 3 === 0) return { ...f, status: "NO HORÁRIO" as FlightStatus };
          return f;
        });
      }

      const target = mutable[Math.floor(Math.random() * mutable.length)];
      const currentIdx = statusFlow.indexOf(target.status);
      const nextStatus = statusFlow[Math.min(currentIdx + 1, statusFlow.length - 1)];

      return prev.map((f) =>
        f.id === target.id ? { ...f, status: nextStatus } : f
      );
    });
    setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
  }, []);

  // Randomly add promo alerts
  const addPromoAlert = useCallback(() => {
    setFlights((prev) => {
      const nonPromo = prev.filter((f) => f.status !== "ALERTA PROMO");
      if (nonPromo.length === 0) return prev;
      const target = nonPromo[Math.floor(Math.random() * nonPromo.length)];
      const promo = promos[Math.floor(Math.random() * promos.length)];
      return prev.map((f) =>
        f.id === target.id ? { ...f, status: "ALERTA PROMO" as FlightStatus, promo } : f
      );
    });
  }, []);

  useEffect(() => {
    const statusInterval = setInterval(advanceFlight, 4000);
    const promoInterval = setInterval(addPromoAlert, 7000);
    return () => {
      clearInterval(statusInterval);
      clearInterval(promoInterval);
    };
  }, [advanceFlight, addPromoAlert]);

  const activeAlerts = flights.filter((f) => f.status === "ALERTA PROMO").length;

  return (
    <section className="relative py-24 px-4 bg-secondary/30 overflow-hidden">
      {/* Scanline effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none z-20"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Painel ao vivo
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Terminal de monitoramento <span className="text-gradient-primary">PromoCéu</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Dados atualizados em tempo real. Quando uma oportunidade aparece, ela pisca no seu painel instantaneamente.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="rounded-2xl overflow-hidden border border-border/60 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/5">
            {/* Board header — dark strip */}
            <div className="bg-background border-b border-primary/10 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-3 h-3 rounded-full bg-primary"
                  animate={{ 
                    boxShadow: [
                      "0 0 0px hsl(38 85% 55% / 0)",
                      "0 0 10px hsl(38 85% 55% / 0.5)",
                      "0 0 0px hsl(38 85% 55% / 0)",
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="font-mono text-sm font-bold text-foreground tracking-wider">
                  DEPARTURES
                </span>
                <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
                  — GRU INTERNATIONAL AIRPORT
                </span>
              </div>
              <div className="flex items-center gap-4">
                {activeAlerts > 0 && (
                  <motion.span
                    className="font-mono text-xs text-primary bg-primary/10 px-2.5 py-1 rounded border border-primary/20"
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {activeAlerts} ALERTA{activeAlerts > 1 ? "S" : ""} ATIVO{activeAlerts > 1 ? "S" : ""}
                  </motion.span>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">Local</span>
                  <span className="font-mono text-sm font-bold text-primary tabular-nums tracking-widest">
                    {currentTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-6 gap-0 px-4 sm:px-6 py-2.5 bg-background/60 border-b border-border/20">
              {["HORA", "VOO", "CIA", "DESTINO", "PORTÃO", "STATUS"].map((h) => (
                <span key={h} className={`font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest ${h === "STATUS" ? "text-right" : ""}`}>
                  {h}
                </span>
              ))}
            </div>

            {/* Flight rows */}
            <div className="divide-y divide-border/10">
              {flights.map((flight, i) => (
                <motion.div
                  key={flight.id}
                  layout
                  className={`grid grid-cols-6 gap-0 px-4 sm:px-6 py-3 items-center transition-colors duration-500 ${
                    flight.status === "ALERTA PROMO"
                      ? "bg-primary/[0.04]"
                      : flight.status === "DECOLOU"
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                    <SplitFlapText text={flight.time} />
                  </span>
                  <span className="font-mono text-sm text-foreground/80">
                    <SplitFlapText text={flight.code} />
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {flight.airline}
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    <SplitFlapText text={flight.destination} />
                  </span>
                  <span className="font-mono text-sm text-foreground/70 tabular-nums">
                    {flight.gate}
                  </span>
                  <div className="text-right">
                    <StatusBadge status={flight.status} promo={flight.promo} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-background/80 border-t border-border/30 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-muted-foreground font-mono">
                  {flights.length} VOOS MONITORADOS
                </span>
                {lastUpdate && (
                  <span className="text-[11px] text-muted-foreground font-mono">
                    LAST UPDATE: {lastUpdate}
                  </span>
                )}
              </div>
              <motion.div
                className="flex items-center gap-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[11px] text-primary font-bold font-mono tracking-wider">
                  LIVE MONITORING
                </span>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
