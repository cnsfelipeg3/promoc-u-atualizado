import { motion } from "framer-motion";
import logo from "@/assets/logo-promoceu.png";

const airlines = [
  "LATAM", "Emirates", "Air France", "Lufthansa", "Qatar Airways",
  "American Airlines", "TAP", "KLM", "Delta", "British Airways",
];

const airlines2 = [
  "Azul", "GOL", "Turkish Airlines", "Singapore Airlines", "Iberia",
  "Swiss", "United", "Copa Airlines", "Avianca", "Ethiopian",
];

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-fade overflow-hidden py-3">
      <div className={reverse ? "marquee-track-reverse" : "marquee-track"}>
        {doubled.map((name, i) => (
          <span
            key={i}
            className="text-muted-foreground/60 text-sm font-medium tracking-widest uppercase whitespace-nowrap select-none"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30 pointer-events-none" />
      
      {/* Subtle radial glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(217 91% 60% / 0.06) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
      >
        {/* Logo */}
        <motion.img
          src={logo}
          alt="PromoCéu"
          className="w-20 h-20 mb-8 invert opacity-90"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.9, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />

        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
          Viaje pagando menos.{" "}
          <span className="text-gradient-primary">Com inteligência.</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 text-balance">
          Acesso antecipado às melhores promoções nacionais e internacionais antes que esgotem.
        </p>

        <motion.a
          href="#planos"
          className="glow-button text-base sm:text-lg"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Quero fazer parte do PromoCéu
        </motion.a>

        <p className="text-muted-foreground/50 text-sm mt-4">
          +2.000 membros monitorando oportunidades
        </p>
      </motion.div>

      {/* Airline marquee */}
      <div className="relative z-10 w-full max-w-5xl mt-16 space-y-1">
        <MarqueeRow items={airlines} />
        <MarqueeRow items={airlines2} reverse />
      </div>
    </section>
  );
}
