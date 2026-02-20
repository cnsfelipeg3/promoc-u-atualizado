import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import airportTerminal from "@/assets/airport-terminal.jpg";

export default function InspirationSection() {
  return (
    <section className="relative py-0 overflow-hidden">
      <div className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
        <img
          src={airportTerminal}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
        <div className="absolute inset-0 bg-primary/5" />

        <ScrollReveal className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-6">
            Acredite
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance">
            Você não precisa pagar caro{" "}
            <span className="text-gradient-primary">para viver o mundo.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            A PromoCéu transforma informação em vantagem. Acesso estratégico para quem quer voar mais, pagando menos.
          </p>
          <motion.a
            href="#planos"
            className="glow-button text-base inline-block"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Começar agora
          </motion.a>
        </ScrollReveal>
      </div>
    </section>
  );
}
