import ScrollReveal from "@/components/ScrollReveal";
import { Crown, Star, Armchair } from "lucide-react";
import businessClass from "@/assets/business-class.jpg";

const perks = [
  "Alertas exclusivos de Classe Executiva",
  "Promoções de Primeira Classe",
  "Erros tarifários premium",
  "Conforto por preço de econômica",
];

export default function ExecutiveSection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <ScrollReveal>
            <div className="relative rounded-xl overflow-hidden h-80 lg:h-96">
              <img
                src={businessClass}
                alt="Classe Executiva"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent" />
                <span className="font-display font-semibold text-sm text-accent">
                  Experiência Premium
                </span>
              </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal delay={0.15}>
            <div>
              <p className="text-sm uppercase tracking-widest mb-4 font-semibold text-accent">
                Order Bump
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6 text-balance">
                Voar em classe executiva{" "}
                <span className="text-gradient-primary">pagando menos.</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Adicione alertas exclusivos de Classe Executiva e Primeira Classe. Promoções estratégicas para voar com conforto pagando menos que econômica cheia.
              </p>

              <ul className="space-y-4 mb-8">
                {perks.map((perk, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Star className="w-4 h-4 flex-shrink-0 text-accent" />
                    <span className="text-secondary-foreground">{perk}</span>
                  </li>
                ))}
              </ul>

              <div className="glass-card p-5 inline-flex items-center gap-4">
                <Armchair className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-display font-bold text-lg">+ R$ 14,90<span className="text-muted-foreground text-sm font-normal">/mês</span></p>
                  <p className="text-muted-foreground text-xs">Adicione ao seu plano</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
