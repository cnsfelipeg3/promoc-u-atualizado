import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-airport.jpg";

export default function FinalCTASection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-10" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/90" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <ScrollReveal>
          <h2 className="font-display text-3xl sm:text-5xl font-bold mb-6 text-balance">
            Sua próxima viagem pode custar{" "}
            <span className="text-gradient-primary">muito menos.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Junte-se a mais de 2.000 viajantes que já economizam com inteligência de mercado.
          </p>
          <motion.a
            href="#planos"
            className="glow-button text-lg inline-block"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Quero fazer parte
          </motion.a>
        </ScrollReveal>
      </div>
    </section>
  );
}
