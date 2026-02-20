import ScrollReveal from "@/components/ScrollReveal";
import { ShieldCheck } from "lucide-react";

export default function GuaranteeSection() {
  return (
    <section className="relative py-24 px-4 bg-secondary/20">
      <div className="max-w-3xl mx-auto text-center">
        <ScrollReveal>
          <ShieldCheck className="w-14 h-14 text-primary mx-auto mb-6" strokeWidth={1.5} />
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
            Transparência total
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
            Cancelamento simples, sem burocracia. Você pode cancelar quando quiser.
            Sem fidelidade escondida. Sem letras miúdas.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
