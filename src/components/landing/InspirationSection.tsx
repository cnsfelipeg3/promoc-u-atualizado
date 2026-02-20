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
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/40 to-foreground/70" />

        <ScrollReveal className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-primary-foreground/80 font-semibold text-sm uppercase tracking-widest mb-6">
            Uma nova forma de viajar
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance text-white">
            Informação é o ativo mais valioso{" "}
            <span className="text-primary-foreground/90">para quem quer voar mais.</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            O PromoCéu transforma dados de mercado em economia real para sua próxima viagem.
          </p>
          <motion.a
            href="#planos"
            className="glow-button text-base inline-block"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Começar agora
          </motion.a>
        </ScrollReveal>
      </div>
    </section>
  );
}
