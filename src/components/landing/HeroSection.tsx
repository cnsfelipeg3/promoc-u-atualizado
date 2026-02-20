import { motion } from "framer-motion";
import heroBg from "@/assets/hero-airport.jpg";
import PromoCeuLogo from "@/components/landing/PromoCeuLogo";

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
            className="text-muted-foreground/40 text-sm font-medium tracking-widest uppercase whitespace-nowrap select-none"
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
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3" />
      </div>

      {/* Subtle geometric light */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 70%)" }}
        animate={{ y: [0, -15, 0], x: [0, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
      >
        {/* Logo */}
        <PromoCeuLogo size={72} className="mb-8" />

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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Quero fazer parte do PromoCéu
        </motion.a>

        <p className="text-muted-foreground/40 text-sm mt-4 font-mono tracking-wider">
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
