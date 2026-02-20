import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-airport.jpg";
import { ArrowRight, Shield, Users, TrendingDown } from "lucide-react";

export default function FinalCTASection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-10" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/90" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <ScrollReveal>
          <h2 className="font-display text-3xl sm:text-5xl font-bold mb-6 text-balance leading-tight">
            Sua próxima viagem pode custar{" "}
            <span className="text-gradient-primary">muito menos.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-xl mx-auto leading-relaxed">
            Enquanto você hesita, nossos membros estão aproveitando oportunidades que economizam milhares de reais. A pergunta não é se vale a pena — é quanto você vai continuar perdendo.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {[
              { icon: TrendingDown, text: "57% de economia média" },
              { icon: Users, text: "2.800+ membros ativos" },
              { icon: Shield, text: "Cancele quando quiser" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-foreground/60">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.a
              href="#planos"
              className="glow-button text-lg inline-flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Quero fazer parte
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </div>

          <p className="text-muted-foreground/50 text-xs mt-6">
            Sem compromisso. Sem fidelidade. Cancele a qualquer momento.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
