import { motion } from "framer-motion";
import heroPlane from "@/assets/hero-plane-bg.jpg";
import logoWhite from "@/assets/logo-promoceu-branco.png";
import { ArrowDown, Shield, Clock, TrendingDown } from "lucide-react";

const airlineLogos = [
  { name: "LATAM", code: "LA" },
  { name: "GOL", code: "G3" },
  { name: "Azul", code: "AD" },
  { name: "American Airlines", code: "AA" },
  { name: "Iberia", code: "IB" },
  { name: "TAP", code: "TP" },
  { name: "Emirates", code: "EK" },
  { name: "Air France", code: "AF" },
  { name: "Copa Airlines", code: "CM" },
  { name: "United Airlines", code: "UA" },
];

function AirlineLogoMarquee() {
  const doubled = [...airlineLogos, ...airlineLogos];
  return (
    <div className="marquee-fade overflow-hidden py-4">
      <div className="marquee-track" style={{ gap: "2.5rem" }}>
        {doubled.map((a, i) => (
          <img
            key={i}
            src={`https://images.kiwi.com/airlines/64x64/${a.code}.png`}
            alt={a.name}
            className="h-8 sm:h-10 object-contain opacity-50 hover:opacity-80 transition-opacity dark:brightness-0 dark:invert"
            loading="lazy"
            style={{ background: "transparent" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-24">
      {/* Dark theme: show bg image */}
      <div className="absolute inset-0 dark:block hidden">
        <img src={heroPlane} alt="" className="w-full h-full object-cover opacity-50" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      </div>
      {/* Light theme: subtle tech pattern */}
      <div className="absolute inset-0 dark:hidden block">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }} />
      </div>

      {/* Star particles (dark only) */}
      <div className="absolute inset-0 pointer-events-none dark:block hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full bg-white"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
      >
        <img src={logoWhite} alt="PromoCéu" className="h-12 sm:h-16 w-auto mb-6 dark:brightness-100 brightness-0" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 bg-primary/10 border border-primary/25"
        >
          <span className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
          <span className="text-xs font-medium text-primary tracking-wider uppercase">
            Plataforma de inteligência aérea #1 do Brasil
          </span>
        </motion.div>

        <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance leading-[1.1]">
          Passagens aéreas com{" "}
          <span className="text-gradient-primary">inteligência de mercado.</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mb-5 text-balance leading-relaxed px-2">
          Monitoramos milhares de rotas diariamente para você acessar tarifas promocionais antes que esgotem. Sem intermediários. Sem taxas escondidas. Compra direta na companhia aérea.
        </p>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8">
          {[
            { icon: TrendingDown, text: "Até 70% de economia" },
            { icon: Shield, text: "Compra direta e segura" },
            { icon: Clock, text: "Alertas em < 5 minutos" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <item.icon className="w-4 h-4 text-primary" />
              <span>{item.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <motion.a href="#planos" className="glow-button text-base sm:text-lg w-full sm:w-auto text-center" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Começar a economizar
          </motion.a>
          <motion.a href="#como-funciona" className="px-6 py-4 text-sm font-semibold text-foreground/70 hover:text-primary transition-colors border border-border rounded-lg hover:border-primary/30 w-full sm:w-auto text-center" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Como funciona →
          </motion.a>
        </div>

        <p className="text-muted-foreground/60 text-sm mt-4 tracking-wide">
          Mais de 2.800 membros ativos · R$ 2 milhões+ em economias geradas
        </p>
      </motion.div>

      <div className="relative z-10 w-full max-w-5xl mt-12">
        <AirlineLogoMarquee />
      </div>

      <motion.div className="absolute bottom-8 z-10" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        <ArrowDown className="w-5 h-5 text-muted-foreground/40" />
      </motion.div>
    </section>
  );
}
