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
            className="text-foreground/30 text-sm font-medium tracking-widest uppercase whitespace-nowrap select-none"
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
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
      >
        <PromoCeuLogo size={72} className="mb-8" />

        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance text-foreground">
          Passagens aéreas com{" "}
          <span className="text-gradient-primary">inteligência de mercado.</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 text-balance">
          Monitoramos milhares de rotas diariamente para você acessar tarifas promocionais antes que esgotem. Sem intermediários.
        </p>

        <motion.a
          href="#planos"
          className="glow-button text-base sm:text-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Conhecer planos
        </motion.a>

        <p className="text-muted-foreground/60 text-sm mt-4 tracking-wide">
          Mais de 2.000 membros ativos monitorando oportunidades
        </p>
      </motion.div>

      <div className="relative z-10 w-full max-w-5xl mt-16 space-y-1">
        <MarqueeRow items={airlines} />
        <MarqueeRow items={airlines2} reverse />
      </div>
    </section>
  );
}
