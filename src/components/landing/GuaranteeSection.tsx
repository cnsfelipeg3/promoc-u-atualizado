import ScrollReveal from "@/components/ScrollReveal";
import { ShieldCheck, Award } from "lucide-react";
import certificado from "@/assets/certificado-promoceu.png";

export default function GuaranteeSection() {
  return (
    <section className="relative py-24 px-4 bg-secondary/40">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-4">
                <Award className="w-5 h-5 text-accent" />
                <p className="text-accent font-semibold text-sm uppercase tracking-widest">
                  Reconhecimento
                </p>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                Excelência reconhecida internacionalmente
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                A PromoCéu foi premiada no Tourism Industry Awards 2024 por dedicação
                excepcional e performance na execução de serviços turísticos, estabelecendo
                o benchmark de qualidade e satisfação do cliente.
              </p>

              <div className="flex items-start gap-4 glass-card p-5">
                <ShieldCheck className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="font-display font-semibold mb-1">Transparência total</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Cancelamento simples, sem burocracia, sem fidelidade escondida. 
                    Você pode cancelar quando quiser, sem letras miúdas.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="flex justify-center">
              <img
                src={certificado}
                alt="Certificado Tourism Industry Awards 2024 — PromoCéu"
                className="rounded-xl shadow-lg max-w-sm w-full border border-border"
                loading="lazy"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
