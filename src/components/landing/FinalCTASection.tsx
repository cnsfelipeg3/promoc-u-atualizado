import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-airport.jpg";

export default function FinalCTASection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-15" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/80" />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.06) 0%, transparent 60%)",
        }}
      />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <ScrollReveal>
          <h2 className="font-display text-3xl sm:text-5xl font-bold mb-6 text-balance">
            As melhores oportunidades não esperam.{" "}
            <span className="text-gradient-primary">Você vai esperar?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Entre para o clube de inteligência aérea e comece a voar pagando menos.
          </p>
          <motion.a
            href="#planos"
            className="glow-button text-lg inline-block"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Entrar para o PromoCéu agora
          </motion.a>
        </ScrollReveal>
      </div>
    </section>
  );
}
