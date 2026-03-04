import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { UserPlus, Bell, ShoppingCart, Smartphone, ArrowRight } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Escolha seu plano", desc: "Selecione a assinatura ideal para o seu perfil de viagem." },
  { icon: Bell, title: "Receba alertas", desc: "Oportunidades verificadas chegam direto no seu celular." },
  { icon: ShoppingCart, title: "Compre direto", desc: "Sem intermediários. A compra é 100% direta na companhia." },
  { icon: Smartphone, title: "Economize", desc: "Acompanhe suas economias em tempo real." },
];

export default function HowItWorksSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">Processo simples</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Como funciona na prática
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Em 4 passos simples, você passa a ter acesso às melhores oportunidades do mercado aéreo.
          </p>
        </ScrollReveal>

        <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={i * 0.15} className="flex-1 flex items-stretch">
              <div className="flex items-center w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="neon-card p-6 text-center flex-1 relative"
                >
                  <div className="relative mx-auto mb-4 w-fit">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20">
                      <step.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold font-display shadow-lg">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </motion.div>

                {i < steps.length - 1 && (
                  <motion.div
                    className="hidden lg:flex items-center px-2"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.2 }}
                  >
                    <ArrowRight className="w-5 h-5 text-primary/40" />
                  </motion.div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
