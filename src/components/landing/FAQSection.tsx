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
    a: "Você recebe notificações em tempo real pelo nosso grupo exclusivo e alertas diretos no celular. Cada alerta inclui rota, preço, companhia e janela de datas disponíveis. Os alertas são enviados em menos de 5 minutos após a detecção da oportunidade.",
  },
  {
    q: "Quantas promoções vocês detectam por dia?",
    a: "O volume varia conforme o mercado, mas nosso sistema monitora milhares de rotas continuamente. Em média, detectamos entre 5 e 15 oportunidades relevantes por dia, filtrando apenas as que representam economia real de pelo menos 35% em relação à média de mercado.",
  },
  {
    q: "Vocês garantem que vou encontrar passagem barata?",
    a: "Não garantimos uma passagem específica, mas garantimos acesso estratégico e antecipado às melhores oportunidades do mercado. Quanto mais tempo como membro, maior a probabilidade de aproveitar uma tarifa excepcional.",
  },
  {
    q: "Posso cancelar a assinatura quando quiser?",
    a: "Sim, sem burocracia. O cancelamento é imediato e sem taxas. Não há período mínimo de fidelidade nem cobrança de multa. Acreditamos que você deve ficar porque o serviço vale, não porque está preso a um contrato.",
  },
  {
    q: "Vocês vendem passagens aéreas?",
    a: "Não. O PromoCéu é uma plataforma de inteligência de mercado. Monitoramos, analisamos e alertamos. A compra é feita por você, diretamente no site da companhia aérea, sem intermediários e sem taxas adicionais.",
  },
  {
    q: "O que é o módulo de Classe Executiva?",
    a: "É um complemento opcional que dá acesso a promoções exclusivas de Classe Executiva e Primeira Classe. Ideal para quem busca conforto premium com economia significativa — nossos membros economizam em média R$ 8.400/ano em voos premium.",
  },
  {
    q: "Qual a diferença entre a PromoCéu e blogs de promoções?",
    a: "Blogs publicam promoções com atraso de horas (às vezes a promoção já expirou). A PromoCéu detecta e notifica em menos de 5 minutos. Além disso, cada alerta é validado contra múltiplas fontes e contextualizado com dados históricos.",
  },
  {
    q: "Funciona para voos nacionais também?",
    a: "Sim! Monitoramos todas as rotas nacionais das principais companhias (LATAM, GOL, Azul). Já detectamos passagens como São Paulo → Salvador por R$ 99, Rio → Recife por R$ 149 e muito mais.",
  },
  {
    q: "Como funciona a tecnologia de monitoramento?",
    a: "Utilizamos uma stack proprietária de inteligência artificial que combina machine learning, big data e monitoramento distribuído em nuvem. São mais de 480 mil verificações de preço por dia, em 50+ companhias aéreas e 150+ destinos.",
  },
  {
    q: "Uma viagem já paga a assinatura?",
    a: "Na maioria dos casos, sim. Uma única passagem encontrada pelo PromoCéu já cobre meses ou até o ano inteiro de assinatura. Nossos membros relatam economias médias de R$ 800 a R$ 2.000 por viagem.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">Perguntas frequentes</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">Tire suas dúvidas</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Reunimos as perguntas mais comuns dos nossos membros e potenciais assinantes.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="glass-card px-6 border-none">
                <AccordionTrigger className="font-display font-semibold text-left hover:no-underline py-5 text-foreground text-sm sm:text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm">
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
