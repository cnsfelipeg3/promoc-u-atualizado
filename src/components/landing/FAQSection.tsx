import ScrollReveal from "@/components/ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Como recebo os alertas de promoção?",
    a: "Você recebe notificações em tempo real pelo nosso grupo exclusivo e alertas diretos no celular. Cada alerta inclui rota, preço, companhia e janela de datas disponíveis.",
  },
  {
    q: "Quantas promoções vocês detectam por dia?",
    a: "O volume varia conforme o mercado, mas nosso sistema monitora milhares de rotas continuamente. Em média, detectamos entre 5 e 15 oportunidades relevantes por dia, filtrando apenas as que representam economia real.",
  },
  {
    q: "Vocês garantem que vou encontrar passagem barata?",
    a: "Não garantimos uma passagem específica, mas garantimos acesso estratégico e antecipado às melhores oportunidades do mercado. Quanto mais tempo como membro, maior a probabilidade de aproveitar uma tarifa excepcional.",
  },
  {
    q: "Posso cancelar a assinatura quando quiser?",
    a: "Sim, sem burocracia. O cancelamento é imediato e sem taxas. Não há período mínimo de fidelidade nem cobrança de multa.",
  },
  {
    q: "Vocês vendem passagens aéreas?",
    a: "Não. O PromoCéu é uma plataforma de inteligência de mercado. Monitoramos, analisamos e alertamos. A compra é feita por você, diretamente no site da companhia aérea.",
  },
  {
    q: "O que é o módulo de Classe Executiva?",
    a: "É um complemento opcional que dá acesso a promoções exclusivas de Classe Executiva e Primeira Classe. Ideal para quem busca conforto premium com economia significativa.",
  },
];

export default function FAQSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Perguntas frequentes
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-12">
            Tire suas dúvidas
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
                <AccordionTrigger className="font-display font-semibold text-left hover:no-underline py-5 text-foreground">
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
