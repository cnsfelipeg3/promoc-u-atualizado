import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import { Plane, Radar } from "lucide-react";

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
  terminal: string;
}

const initialFlights: Flight[] = [
  { id: "1", time: "06:15", code: "LA8084", destination: "PARIS CDG", gate: "A12", terminal: "T3", status: "DECOLOU", airline: "LATAM", promo: "R$ 2.970" },
  { id: "2", time: "07:30", code: "EK261", destination: "DUBAI DXB", gate: "B04", terminal: "T3", status: "DECOLOU", airline: "EMIRATES" },
  { id: "3", time: "08:45", code: "AA930", destination: "NEW YORK JFK", gate: "C21", terminal: "T1", status: "ALERTA PROMO", promo: "R$ 1.990", airline: "AMERICAN" },
  { id: "4", time: "09:20", code: "AF457", destination: "LISBON LIS", gate: "A08", terminal: "T3", status: "EMBARQUE", airline: "AIR FRANCE" },
  { id: "5", time: "10:00", code: "TP092", destination: "LONDON LHR", gate: "B15", terminal: "T3", status: "ALERTA PROMO", promo: "R$ 2.490", airline: "TAP" },
  { id: "6", time: "10:55", code: "LH507", destination: "FRANKFURT FRA", gate: "C03", terminal: "T1", status: "NO HORÁRIO", airline: "LUFTHANSA" },
  { id: "7", time: "11:40", code: "QR774", destination: "TOKYO NRT", gate: "A19", terminal: "T3", status: "NO HORÁRIO", airline: "QATAR" },
  { id: "8", time: "12:10", code: "KL792", destination: "AMSTERDAM AMS", gate: "B22", terminal: "T3", status: "ALERTA PROMO", promo: "R$ 3.190", airline: "KLM" },
  { id: "9", time: "13:30", code: "DL063", destination: "MIAMI MIA", gate: "C11", terminal: "T1", status: "NO HORÁRIO", airline: "DELTA" },
  { id: "10", time: "14:15", code: "BA248", destination: "BARCELONA BCN", gate: "A05", terminal: "T3", status: "NO HORÁRIO", airline: "BRITISH" },
  { id: "11", time: "15:00", code: "AZ681", destination: "ROME FCO", gate: "B09", terminal: "T3", status: "NO HORÁRIO", airline: "ITA" },
  { id: "12", time: "16:20", code: "SQ027", destination: "SINGAPORE SIN", gate: "C17", terminal: "T1", status: "NO HORÁRIO", airline: "SINGAPORE" },
];

const statusFlow: FlightStatus[] = ["NO HORÁRIO", "EMBARQUE", "DECOLOU"];
const promos = ["R$ 1.990", "R$ 2.290", "R$ 2.490", "R$ 2.970", "R$ 3.190", "R$ 1.590"];

// Split-flap character with enhanced styling
function SplitFlapChar({ char, delay = 0 }: { char: string; delay?: number }) {
  if (char === " ") return <span className="inline-block" style={{ width: "0.25ch" }}>&nbsp;</span>;
  return (
    <motion.span
      key={char}
      initial={{ rotateX: -90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      exit={{ rotateX: 90, opacity: 0 }}
      transition={{ duration: 0.12, delay }}
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
          <SplitFlapChar key={`${i}-${char}`} char={char} delay={i * 0.015} />
        ))}
      </AnimatePresence>
    </span>
  );
}

function StatusBadge({ status, promo }: { status: FlightStatus; promo?: string }) {
  if (status === "ALERTA PROMO") {
    return (
      <motion.div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-primary/10 border border-primary/30 relative overflow-hidden"
        animate={{
          boxShadow: [
            "0 0 0px hsl(38 85% 55% / 0)",
            "0 0 15px hsl(38 85% 55% / 0.25)",
            "0 0 0px hsl(38 85% 55% / 0)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Internal scanline */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(transparent 50%, hsl(38 85% 55% / 0.03) 50%)", backgroundSize: "100% 4px" }}
        />
        <span className="text-primary font-bold text-xs font-mono relative z-10">{promo}</span>
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-primary relative z-10"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>
    );
  }

  const config: Record<string, { bg: string; text: string; dot: string }> = {
    "NO HORÁRIO": { bg: "bg-emerald-500/8 border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
    "EMBARQUE": { bg: "bg-amber-500/8 border-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
    "DECOLOU": { bg: "bg-muted/20 border-border/20", text: "text-muted-foreground/70", dot: "bg-muted-foreground/50" },
  };

  const c = config[status] || config["DECOLOU"];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[10px] font-bold font-mono tracking-wider ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <AnimatePresence mode="popLayout">
        <SplitFlapText text={status} />
      </AnimatePresence>
    </span>
  );
}

// HUD-style radar animation
function HudRadar() {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 border border-primary/20 rounded-full"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-1 border border-primary/15 rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
      />
      <Radar className="w-5 h-5 text-primary" />
    </div>
  );
}

export default function FlightBoardSection() {
  const [flights, setFlights] = useState(initialFlights);
  const [currentTime, setCurrentTime] = useState("");
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [flashRow, setFlashRow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleTimeString("pt-BR"));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const advanceFlight = useCallback(() => {
    setFlights((prev) => {
      const mutable = prev.filter((f) => f.status !== "DECOLOU" && f.status !== "ALERTA PROMO");
      if (mutable.length === 0) {
        return prev.map((f, i) => (i % 3 === 0 ? { ...f, status: "NO HORÁRIO" as FlightStatus } : f));
      }
      const target = mutable[Math.floor(Math.random() * mutable.length)];
      const currentIdx = statusFlow.indexOf(target.status);
      const nextStatus = statusFlow[Math.min(currentIdx + 1, statusFlow.length - 1)];
      setFlashRow(target.id);
      setTimeout(() => setFlashRow(null), 800);
      return prev.map((f) => (f.id === target.id ? { ...f, status: nextStatus } : f));
    });
    setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
  }, []);

  const addPromoAlert = useCallback(() => {
    setFlights((prev) => {
      const nonPromo = prev.filter((f) => f.status !== "ALERTA PROMO");
      if (nonPromo.length === 0) return prev;
      const target = nonPromo[Math.floor(Math.random() * nonPromo.length)];
      const promo = promos[Math.floor(Math.random() * promos.length)];
      setFlashRow(target.id);
      setTimeout(() => setFlashRow(null), 800);
      return prev.map((f) => (f.id === target.id ? { ...f, status: "ALERTA PROMO" as FlightStatus, promo } : f));
    });
  }, []);

  useEffect(() => {
    const statusInterval = setInterval(advanceFlight, 4000);
    const promoInterval = setInterval(addPromoAlert, 7000);
    return () => { clearInterval(statusInterval); clearInterval(promoInterval); };
  }, [advanceFlight, addPromoAlert]);

  const activeAlerts = flights.filter((f) => f.status === "ALERTA PROMO").length;

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 30%, hsl(38 85% 55% / 0.03) 0%, transparent 60%)",
      }} />

      {/* Multiple scanlines */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent pointer-events-none z-20"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none z-20"
        animate={{ top: ["100%", "0%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />

      {/* HUD corner marks */}
      <div className="absolute top-8 left-8 w-8 h-8 pointer-events-none hidden lg:block">
        <div className="absolute top-0 left-0 w-full h-px bg-primary/20" />
        <div className="absolute top-0 left-0 h-full w-px bg-primary/20" />
      </div>
      <div className="absolute top-8 right-8 w-8 h-8 pointer-events-none hidden lg:block">
        <div className="absolute top-0 right-0 w-full h-px bg-primary/20" />
        <div className="absolute top-0 right-0 h-full w-px bg-primary/20" />
      </div>
      <div className="absolute bottom-8 left-8 w-8 h-8 pointer-events-none hidden lg:block">
        <div className="absolute bottom-0 left-0 w-full h-px bg-primary/20" />
        <div className="absolute bottom-0 left-0 h-full w-px bg-primary/20" />
      </div>
      <div className="absolute bottom-8 right-8 w-8 h-8 pointer-events-none hidden lg:block">
        <div className="absolute bottom-0 right-0 w-full h-px bg-primary/20" />
        <div className="absolute bottom-0 right-0 h-full w-px bg-primary/20" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-3 mb-4">
            <HudRadar />
            <p className="text-primary font-semibold text-sm uppercase tracking-[0.2em] font-mono">
              Painel de controle
            </p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Terminal de monitoramento <span className="text-gradient-primary">PromoCéu</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Dados atualizados em tempo real. Quando uma oportunidade aparece, ela pisca no seu painel instantaneamente.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="rounded-xl overflow-hidden border border-primary/10 bg-card/60 backdrop-blur-md shadow-2xl shadow-primary/5 relative">
            {/* Holographic scanline overlay on the board */}
            <div className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(38 85% 55% / 0.008) 2px, hsl(38 85% 55% / 0.008) 4px)",
              }}
            />

            {/* Board header */}
            <div className="bg-background/90 border-b border-primary/15 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-20">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-2.5 h-2.5 rounded-full bg-primary"
                  animate={{
                    boxShadow: [
                      "0 0 0px hsl(38 85% 55% / 0)",
                      "0 0 12px hsl(38 85% 55% / 0.6)",
                      "0 0 0px hsl(38 85% 55% / 0)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-primary/60" />
                  <span className="font-mono text-sm font-bold text-foreground tracking-[0.15em]">
                    DEPARTURES
                  </span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground/70 hidden sm:inline tracking-widest">
                  GRU — GUARULHOS INTL
                </span>
              </div>
              <div className="flex items-center gap-4">
                {activeAlerts > 0 && (
                  <motion.span
                    className="font-mono text-[10px] text-primary bg-primary/8 px-2.5 py-1 rounded-sm border border-primary/15 tracking-wider"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ⚡ {activeAlerts} ALERTA{activeAlerts > 1 ? "S" : ""}
                  </motion.span>
                )}
                <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-sm border border-border/30">
                  <span className="font-mono text-[9px] text-muted-foreground/60 uppercase tracking-widest">BRT</span>
                  <span className="font-mono text-sm font-bold text-primary tabular-nums tracking-[0.1em]">
                    {currentTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-7 gap-0 px-4 sm:px-6 py-2 bg-background/40 border-b border-primary/8 relative z-20">
              {["HORA", "VOO", "CIA", "DESTINO", "TERM", "PORTÃO", "STATUS"].map((h) => (
                <span key={h} className={`font-mono text-[9px] font-bold text-primary/40 uppercase tracking-[0.2em] ${h === "STATUS" ? "text-right" : ""}`}>
                  {h}
                </span>
              ))}
            </div>

            {/* Flight rows */}
            <div className="divide-y divide-border/5 relative z-20">
              {flights.map((flight) => (
                <motion.div
                  key={flight.id}
                  layout
                  className={`grid grid-cols-7 gap-0 px-4 sm:px-6 py-3 items-center transition-all duration-500 ${
                    flight.status === "ALERTA PROMO"
                      ? "bg-primary/[0.03]"
                      : flight.status === "DECOLOU"
                      ? "opacity-40"
                      : ""
                  } ${flashRow === flight.id ? "!bg-primary/[0.08]" : ""}`}
                >
                  <span className="font-mono text-sm font-semibold text-foreground tabular-nums tracking-wider">
                    <SplitFlapText text={flight.time} />
                  </span>
                  <span className="font-mono text-sm text-foreground/80 tracking-wider">
                    <SplitFlapText text={flight.code} />
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/70 tracking-wider">
                    {flight.airline}
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground tracking-wider">
                    <SplitFlapText text={flight.destination} />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground/50 tabular-nums">
                    {flight.terminal}
                  </span>
                  <span className="font-mono text-sm text-foreground/60 tabular-nums">
                    {flight.gate}
                  </span>
                  <div className="text-right">
                    <StatusBadge status={flight.status} promo={flight.promo} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer — telemetry bar */}
            <div className="bg-background/60 border-t border-primary/10 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 relative z-20">
              <div className="flex items-center gap-6">
                <span className="text-[10px] text-muted-foreground/50 font-mono tracking-wider">
                  {flights.length} VOOS
                </span>
                <span className="text-[10px] text-muted-foreground/50 font-mono tracking-wider">
                  SYS: ONLINE
                </span>
                {lastUpdate && (
                  <span className="text-[10px] text-muted-foreground/50 font-mono tracking-wider">
                    UPD: {lastUpdate}
                  </span>
                )}
              </div>
              <motion.div
                className="flex items-center gap-2"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] text-primary font-bold font-mono tracking-[0.2em]">
                  LIVE FEED
                </span>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
