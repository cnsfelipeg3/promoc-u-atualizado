import { motion } from "framer-motion";
import heroBg from "@/assets/hero-airport.jpg";
import PromoCeuLogo from "@/components/landing/PromoCeuLogo";
import { ArrowDown, Shield, Clock, TrendingDown } from "lucide-react";

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
            className="text-foreground/20 text-sm font-medium tracking-widest uppercase whitespace-nowrap select-none"
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
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-16">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-15" loading="eager" />
        <div className="absolute inset-0 bg-background" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
      >
        <PromoCeuLogo size={64} className="mb-6" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full px-4 py-1.5 mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
          <span className="text-xs font-medium text-primary tracking-wider uppercase">
            Plataforma de inteligência aérea #1 do Brasil
          </span>
        </motion.div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance text-foreground leading-[1.1]">
          Passagens aéreas com{" "}
          <span className="text-gradient-primary">inteligência de mercado.</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-5 text-balance leading-relaxed">
          Monitoramos milhares de rotas diariamente para você acessar tarifas promocionais antes que esgotem. Sem intermediários. Sem taxas escondidas. Compra direta na companhia aérea.
        </p>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
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
              className="flex items-center gap-2 text-sm text-foreground/60"
            >
              <item.icon className="w-4 h-4 text-primary" />
              <span>{item.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <motion.a
            href="#planos"
            className="glow-button text-base sm:text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Começar a economizar
          </motion.a>
          <motion.a
            href="#tecnologia"
            className="px-6 py-4 text-sm font-semibold text-foreground/70 hover:text-primary transition-colors border border-border rounded-lg hover:border-primary/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Como funciona →
          </motion.a>
        </div>

        <p className="text-muted-foreground/60 text-sm mt-4 tracking-wide">
          Mais de 2.800 membros ativos · R$ 2 milhões+ em economias geradas
        </p>
      </motion.div>

      <div className="relative z-10 w-full max-w-5xl mt-12 space-y-1">
        <MarqueeRow items={airlines} />
        <MarqueeRow items={airlines2} reverse />
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowDown className="w-5 h-5 text-muted-foreground/40" />
      </motion.div>
    </section>
  );
}
