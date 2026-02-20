import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, Zap } from "lucide-react";

export default function MidCTASection() {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="glass-card-highlight p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }} />

            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 relative z-10">
              Cada minuto sem monitoramento é uma oportunidade perdida
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 relative z-10">
              Enquanto você lê isso, nosso sistema já detectou novas oportunidades de economia. A pergunta é: você vai continuar pagando caro?
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-8 relative z-10">
              {[
                { icon: Zap, text: "Alertas em < 5 min" },
                { icon: Shield, text: "Sem intermediários" },
                { icon: Clock, text: "Cancele quando quiser" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground/70">
                  <item.icon className="w-4 h-4 text-primary" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <motion.a
              href="#planos"
              className="glow-button text-base inline-flex items-center gap-2 relative z-10"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Ver planos e começar agora
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
