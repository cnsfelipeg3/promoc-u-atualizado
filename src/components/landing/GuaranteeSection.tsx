import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { Shield, Award } from "lucide-react";
import certificado from "@/assets/certificado-promoceu.png";

export default function GuaranteeSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="glass-card-highlight p-8 sm:p-12 text-center mb-16 relative overflow-hidden">
            <motion.div
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center relative bg-primary/10 border-2 border-primary/30"
              animate={{
                boxShadow: [
                  "0 0 40px hsl(193 76% 38% / 0.15), inset 0 0 20px hsl(193 76% 38% / 0.05)",
                  "0 0 60px hsl(193 76% 38% / 0.25), inset 0 0 30px hsl(193 76% 38% / 0.08)",
                  "0 0 40px hsl(193 76% 38% / 0.15), inset 0 0 20px hsl(193 76% 38% / 0.05)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Shield className="w-12 h-12 text-primary" strokeWidth={1.5} />
            </motion.div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 text-foreground">
              Garantia de <span className="text-gradient-primary">7 dias</span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-xl mx-auto mb-2 leading-relaxed">
              Assine sem risco. Se em 7 dias você não encontrar valor, devolvemos 100% do seu dinheiro.
            </p>
            <p className="text-muted-foreground text-sm">
              Sem perguntas, sem burocracia.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-4">
                <Award className="w-5 h-5 text-accent" />
                <p className="text-accent font-semibold text-sm uppercase tracking-widest">Reconhecimento</p>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6 text-foreground">
                Excelência reconhecida internacionalmente
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                A PromoCéu foi premiada no Tourism Industry Awards 2024 por dedicação excepcional e performance na execução de serviços turísticos.
              </p>
              <div className="flex items-start gap-4 neon-card p-5">
                <Shield className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="font-display font-semibold mb-1 text-foreground">Transparência total</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Cancelamento simples, sem burocracia, sem fidelidade escondida.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="flex justify-center">
              <img src={certificado} alt="Certificado Tourism Industry Awards 2024" className="rounded-xl shadow-lg max-w-sm w-full border border-border/30" loading="lazy" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
