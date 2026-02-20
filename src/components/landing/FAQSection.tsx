import ScrollReveal from "@/components/ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Como recebo os alertas?",
    a: "Você recebe alertas em tempo real pelo nosso grupo exclusivo e notificações diretas no celular.",
  },
  {
    q: "Quantas promoções por dia vocês enviam?",
    a: "Depende do dia, mas monitoramos milhares de rotas diariamente. Promoções reais podem surgir a qualquer momento.",
  },
  {
    q: "É garantido que vou encontrar passagem barata?",
    a: "Não garantimos viagem, mas garantimos acesso estratégico às melhores oportunidades antes que esgotem.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Cancelamento simples, sem burocracia e sem taxas escondidas.",
  },
  {
    q: "Vocês vendem passagens?",
    a: "Não. A PromoCéu monitora e alerta. Você compra diretamente na companhia aérea.",
  },
  {
    q: "O que é o alerta de Classe Executiva?",
    a: "Um complemento que dá acesso a promoções exclusivas de Classe Executiva e Primeira Classe por um valor adicional acessível.",
  },
];

export default function FAQSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Dúvidas frequentes
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-12">
            Perguntas comuns
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass-card px-6 border-none"
              >
                <AccordionTrigger className="font-display font-semibold text-left hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}
