import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Plane, Radar, X, MapPin } from "lucide-react";
import worldMap from "@/assets/world-map-dark.jpg";

// Types
type FlightStatus = "NO HORÁRIO" | "EMBARQUE" | "DECOLOU" | "ALERTA PROMO";

interface Flight {
  id: string;
  time: string;
  code: string;
  destination: string;
  destinationCode: string;
  gate: string;
  status: FlightStatus;
  promo?: string;
  airline: string;
  terminal: string;
}

const initialFlights: Flight[] = [
  { id: "1", time: "06:15", code: "LA8084", destination: "PARIS CDG", destinationCode: "CDG", gate: "A12", terminal: "T3", status: "DECOLOU", airline: "LATAM", promo: "R$ 2.970" },
  { id: "2", time: "07:30", code: "EK261", destination: "DUBAI DXB", destinationCode: "DXB", gate: "B04", terminal: "T3", status: "DECOLOU", airline: "EMIRATES" },
  { id: "3", time: "08:45", code: "AA930", destination: "NEW YORK JFK", destinationCode: "JFK", gate: "C21", terminal: "T1", status: "ALERTA PROMO", promo: "R$ 1.990", airline: "AMERICAN" },
  { id: "4", time: "09:20", code: "AF457", destination: "LISBON LIS", destinationCode: "LIS", gate: "A08", terminal: "T3", status: "EMBARQUE", airline: "AIR FRANCE" },
  { id: "5", time: "10:00", code: "TP092", destination: "LONDON LHR", destinationCode: "LHR", gate: "B15", terminal: "T3", status: "ALERTA PROMO", promo: "R$ 2.490", airline: "TAP" },
  { id: "6", time: "10:55", code: "LH507", destination: "FRANKFURT FRA", destinationCode: "FRA", gate: "C03", terminal: "T1", status: "NO HORÁRIO", airline: "LUFTHANSA" },
  { id: "7", time: "11:40", code: "QR774", destination: "TOKYO NRT", destinationCode: "NRT", gate: "A19", terminal: "T3", status: "NO HORÁRIO", airline: "QATAR" },
  { id: "8", time: "12:10", code: "KL792", destination: "AMSTERDAM AMS", destinationCode: "AMS", gate: "B22", terminal: "T3", status: "ALERTA PROMO", promo: "R$ 3.190", airline: "KLM" },
  { id: "9", time: "13:30", code: "DL063", destination: "MIAMI MIA", destinationCode: "MIA", gate: "C11", terminal: "T1", status: "NO HORÁRIO", airline: "DELTA" },
  { id: "10", time: "14:15", code: "BA248", destination: "BARCELONA BCN", destinationCode: "BCN", gate: "A05", terminal: "T3", status: "NO HORÁRIO", airline: "BRITISH" },
  { id: "11", time: "15:00", code: "AZ681", destination: "ROME FCO", destinationCode: "FCO", gate: "B09", terminal: "T3", status: "NO HORÁRIO", airline: "ITA" },
  { id: "12", time: "16:20", code: "SQ027", destination: "SINGAPORE SIN", destinationCode: "SIN", gate: "C17", terminal: "T1", status: "NO HORÁRIO", airline: "SINGAPORE" },
];

const statusFlow: FlightStatus[] = ["NO HORÁRIO", "EMBARQUE", "DECOLOU"];
const promos = ["R$ 1.990", "R$ 2.290", "R$ 2.490", "R$ 2.970", "R$ 3.190", "R$ 1.590"];

// Equirectangular: x=(lon+180)/360*100, y=(90-lat)/180*80
const airportCoords: Record<string, [number, number]> = {
  GRU: [37, 50], CDG: [50.6, 18.3], DXB: [65.4, 28.8], JFK: [29.4, 21.9],
  LIS: [47.5, 22.8], LHR: [50, 17.1], FRA: [52.4, 17.7], NRT: [88.8, 24.1],
  AMS: [51.4, 16.7], MIA: [27.7, 28.6], BCN: [50.6, 21.6], FCO: [53.5, 21.4], SIN: [78.9, 39.3],
};

const airlineLogos: Record<string, string> = {
  "LATAM": "LA", "EMIRATES": "EK", "AMERICAN": "AA", "AIR FRANCE": "AF",
  "TAP": "TP", "LUFTHANSA": "LH", "QATAR": "QR", "KLM": "KL",
  "DELTA": "DL", "BRITISH": "BA", "ITA": "AZ", "SINGAPORE": "SQ",
};

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
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-primary/10 border border-primary/25"
        animate={{
          boxShadow: [
            "0 0 0px hsl(var(--primary) / 0)",
            "0 0 12px hsl(var(--primary) / 0.2)",
            "0 0 0px hsl(var(--primary) / 0)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
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
    "NO HORÁRIO": { bg: "bg-signal-green/8 border-signal-green/20", text: "text-signal-green", dot: "bg-signal-green" },
    "EMBARQUE": { bg: "bg-signal-amber/8 border-signal-amber/20", text: "text-signal-amber", dot: "bg-signal-amber" },
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

function FlightRoutePopup({ flight, onClose }: { flight: Flight; onClose: () => void }) {
  const from = airportCoords.GRU;
  const to = airportCoords[flight.destinationCode] || [50, 50];
  const midX = (from[0] + to[0]) / 2;
  const midY = Math.min(from[1], to[1]) - 15;
  const arcPath = `M ${from[0]} ${from[1]} Q ${midX} ${midY} ${to[0]} ${to[1]}`;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-background/85 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-2xl glass-card-highlight p-6 sm:p-8 overflow-hidden"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <img
            src={`https://images.kiwi.com/airlines/64/${airlineLogos[flight.airline] || "XX"}.png`}
            alt={flight.airline}
            className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div>
            <h3 className="font-display text-xl font-bold">{flight.code} — {flight.airline}</h3>
            <span className="font-mono text-sm text-muted-foreground">GRU → {flight.destinationCode}</span>
          </div>
          <div className="ml-auto">
            <StatusBadge status={flight.status} promo={flight.promo} />
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Rota real: Guarulhos (GRU) → {flight.destination}
        </p>

        <div className="border border-border/30 rounded-lg bg-background/60 relative overflow-hidden">
          {/* Real world map background */}
          <img src={worldMap} alt="" className="w-full h-auto block opacity-30" style={{ maxHeight: 300, objectFit: "cover" }} />
          
          <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.3" />
                <stop offset="50%" stopColor="hsl(217, 91%, 60%)" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(45, 70%, 58%)" stopOpacity="0.8" />
              </linearGradient>
              <filter id="dotGlow">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <path d={arcPath} fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="0.3" strokeOpacity="0.2" />
            <motion.path
              d={arcPath}
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="0.8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            <motion.circle
              r="1.2"
              fill="hsl(217, 91%, 60%)"
              filter="url(#dotGlow)"
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: "100%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ offsetPath: `path("${arcPath}")` }}
            />

            <circle cx={from[0]} cy={from[1]} r="2" fill="hsl(217, 91%, 60%)" filter="url(#dotGlow)" />
            <text x={from[0]} y={from[1] + 5} textAnchor="middle" fill="hsl(217, 91%, 60%)" fontSize="3.5" fontFamily="monospace" fontWeight="bold">GRU</text>

            <circle cx={to[0]} cy={to[1]} r="2" fill="hsl(45, 70%, 58%)" filter="url(#dotGlow)" />
            <text x={to[0]} y={to[1] - 4} textAnchor="middle" fill="hsl(45, 70%, 58%)" fontSize="3.5" fontFamily="monospace" fontWeight="bold">{flight.destinationCode}</text>
          </svg>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-5 pt-4 border-t border-border/20">
          {[
            { label: "Partida", value: flight.time },
            { label: "Terminal", value: flight.terminal },
            { label: "Portão", value: flight.gate },
            { label: "Status", value: flight.status },
          ].map((d, i) => (
            <div key={i} className="text-center">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1 font-mono">{d.label}</p>
              <p className="font-mono text-sm font-bold text-foreground">{d.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FlightBoardSection() {
  const [flights, setFlights] = useState(initialFlights);
  const [currentTime, setCurrentTime] = useState("");
  const [flashRow, setFlashRow] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

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
      <div className="max-w-6xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 border border-primary/15 rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <Radar className="w-5 h-5 text-primary" />
            </div>
            <p className="text-primary font-semibold text-sm uppercase tracking-[0.2em] font-mono">
              Painel de controle
            </p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Terminal de monitoramento <span className="text-gradient-primary">PromoCéu</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Clique em qualquer voo para ver a rota real no mapa interativo.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="rounded-xl overflow-hidden border border-border/40 bg-card/70 backdrop-blur-md shadow-2xl relative">
            {/* Board header */}
            <div className="bg-background/90 border-b border-border/30 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-20">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{
                    boxShadow: [
                      "0 0 0px hsl(var(--primary) / 0)",
                      "0 0 8px hsl(var(--primary) / 0.5)",
                      "0 0 0px hsl(var(--primary) / 0)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-primary/60" />
                  <span className="font-mono text-sm font-bold text-foreground tracking-[0.15em]">DEPARTURES</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground/60 hidden sm:inline tracking-widest">GRU — GUARULHOS INTL</span>
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
                  <span className="font-mono text-sm font-bold text-primary tabular-nums tracking-[0.1em]">{currentTime}</span>
                </div>
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-7 gap-0 px-4 sm:px-6 py-2 bg-background/40 border-b border-border/20 relative z-20">
              {["HORA", "VOO", "CIA", "DESTINO", "TERM", "PORTÃO", "STATUS"].map((h) => (
                <span key={h} className={`font-mono text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] ${h === "STATUS" ? "text-right" : ""}`}>
                  {h}
                </span>
              ))}
            </div>

            {/* Flight rows */}
            <div className="divide-y divide-border/10 relative z-20">
              {flights.map((flight) => (
                <motion.div
                  key={flight.id}
                  layout
                  onClick={() => setSelectedFlight(flight)}
                  className={`grid grid-cols-7 gap-0 px-4 sm:px-6 py-3 items-center transition-all duration-500 cursor-pointer hover:bg-primary/[0.04] ${
                    flight.status === "ALERTA PROMO" ? "bg-primary/[0.02]"
                      : flight.status === "DECOLOU" ? "opacity-40" : ""
                  } ${flashRow === flight.id ? "!bg-primary/[0.06]" : ""}`}
                >
                  <span className="font-mono text-sm font-semibold text-foreground tabular-nums tracking-wider">
                    <SplitFlapText text={flight.time} />
                  </span>
                  <span className="font-mono text-sm text-foreground/80 tracking-wider">
                    <SplitFlapText text={flight.code} />
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/60 tracking-wider flex items-center gap-1.5">
                    <img
                      src={`https://images.kiwi.com/airlines/64/${airlineLogos[flight.airline] || "XX"}.png`}
                      alt={flight.airline}
                      className="w-4 h-4 rounded-sm object-contain"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    {flight.airline}
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary/30 hidden sm:inline" />
                    <SplitFlapText text={flight.destination} />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground/40 tabular-nums">{flight.terminal}</span>
                  <span className="font-mono text-sm text-foreground/50 tabular-nums">{flight.gate}</span>
                  <div className="text-right">
                    <StatusBadge status={flight.status} promo={flight.promo} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-background/60 border-t border-border/20 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 relative z-20">
              <div className="flex items-center gap-6">
                <span className="text-[10px] text-muted-foreground/40 font-mono tracking-wider">{flights.length} VOOS</span>
                <span className="text-[10px] text-muted-foreground/40 font-mono tracking-wider">SYS: ONLINE</span>
                <span className="text-[10px] text-muted-foreground/40 font-mono tracking-wider hidden sm:inline">CLIQUE PARA VER ROTA</span>
              </div>
              <motion.div className="flex items-center gap-2" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] text-primary font-bold font-mono tracking-[0.2em]">LIVE FEED</span>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <AnimatePresence>
        {selectedFlight && (
          <FlightRoutePopup flight={selectedFlight} onClose={() => setSelectedFlight(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
