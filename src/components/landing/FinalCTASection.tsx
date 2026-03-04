import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import bgGalactic from "@/assets/bg-galactic.jpg";
import { ArrowRight, Shield, Users, TrendingDown } from "lucide-react";

export default function FinalCTASection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 dark:block hidden">
        <img src={bgGalactic} alt="" className="w-full h-full object-cover opacity-30" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/90" />
      </div>
      <div className="absolute inset-0 dark:hidden block bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <ScrollReveal>
          <h2 className="font-display text-3xl sm:text-5xl font-bold mb-6 text-balance leading-tight">
            Sua próxima viagem pode custar{" "}
            <span className="text-gradient-primary">muito menos.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-xl mx-auto leading-relaxed">
            Enquanto você hesita, nossos membros estão aproveitando oportunidades que economizam milhares de reais.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10">
            {[
              { icon: TrendingDown, text: "57% de economia média" },
              { icon: Users, text: "2.800+ membros ativos" },
              { icon: Shield, text: "Cancele quando quiser" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <motion.a href="#planos" className="glow-button text-lg inline-flex items-center justify-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Quero fazer parte<ArrowRight className="w-5 h-5" />
          </motion.a>
          <p className="text-muted-foreground/50 text-xs mt-6">Sem compromisso. Sem fidelidade. Cancele a qualquer momento.</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
