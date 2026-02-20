import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Calendar, CreditCard, Luggage, Clock, Globe, ChevronRight, X } from "lucide-react";
import { useState } from "react";

interface Tip {
  icon: typeof Lightbulb;
  title: string;
  preview: string;
  content: string[];
}

const tips: Tip[] = [
  {
    icon: Calendar,
    title: "Quando comprar passagens",
    preview: "O timing é tudo. Descubra os melhores momentos para comprar.",
    content: [
      "Pesquisas mostram que o 'sweet spot' para comprar passagens internacionais é entre 3 e 6 semanas antes da viagem para destinos populares, e 2 a 4 meses para alta temporada.",
      "Terças e quartas-feiras historicamente apresentam preços 8-12% menores que finais de semana, mas esse padrão tem se tornado menos confiável com a precificação algorítmica.",
      "O mais importante: monitore ativamente. Preços flutuam centenas de vezes por dia. Uma queda de 40% pode durar apenas 4 horas.",
      "Com a PromoCéu, você não precisa se preocupar com timing — nosso sistema monitora 24/7 e avisa quando o preço está excepcionalmente baixo.",
    ],
  },
  {
    icon: CreditCard,
    title: "Como pagar menos com milhas",
    preview: "Estratégias inteligentes para acumular e usar milhas com eficiência.",
    content: [
      "Concentre todos os gastos do dia a dia em um cartão com bom acúmulo de pontos. Cartões premium podem render 2-4 pontos por dólar gasto.",
      "Transfira pontos para programas de fidelidade durante promoções de transferência bonificada (30-100% de bônus).",
      "Use milhas para voos de longa distância em classe executiva — é onde o valor por milha é mais alto (até R$ 0,12 por ponto vs. R$ 0,02 em econômica).",
      "Combine: use a PromoCéu para encontrar tarifas em dinheiro E fique atento aos alertas de milhas para maximizar cada viagem.",
    ],
  },
  {
    icon: Luggage,
    title: "Como viajar mais por menos",
    preview: "Dicas práticas para multiplicar suas viagens sem multiplicar o orçamento.",
    content: [
      "Seja flexível com datas. Uma diferença de 2-3 dias pode significar 40-60% de economia na passagem.",
      "Considere aeroportos alternativos. Voar de Guarulhos para Milão pode ser mais barato do que para Roma, e o trem entre as duas cidades custa R$ 80.",
      "Aproveite stopover gratuitos. TAP oferece stopover em Lisboa, Turkish em Istambul, Icelandair na Islândia — tudo sem custo adicional na passagem.",
      "Monte roteiros multi-city. Às vezes, GRU→LIS + LIS→CDG + CDG→GRU custa menos que GRU→CDG ida e volta.",
    ],
  },
  {
    icon: Clock,
    title: "Erros tarifários: o que são?",
    preview: "Entenda como funcionam os famosos 'glitches' de preço e como aproveitá-los.",
    content: [
      "Erros tarifários acontecem quando uma companhia aérea publica um preço significativamente abaixo do pretendido, geralmente por erro de câmbio, digit errado ou falha de sistema.",
      "Exemplos reais: classe executiva para Dubai por R$ 2.400 (preço normal R$ 18.000), Nova York por R$ 800 ida e volta.",
      "Nem todos são honrados. Companhias podem cancelar reservas de erros tarifários, mas a maioria honra — especialmente quando o passageiro já tem reservas de hotel e comprova boa-fé.",
      "A PromoCéu detecta erros tarifários em média 12 minutos após publicação — muito antes de blogs e fóruns públicos.",
    ],
  },
  {
    icon: Globe,
    title: "Destinos com melhor custo-benefício",
    preview: "Os destinos que oferecem a melhor relação entre preço da passagem e experiência.",
    content: [
      "América do Sul: Buenos Aires, Santiago e Lima oferecem experiências incríveis com passagens frequentemente abaixo de R$ 800 ida e volta.",
      "Europa: Portugal e Espanha são consistentemente os destinos europeus mais acessíveis para brasileiros, com tarifas regulares abaixo de R$ 2.500.",
      "Ásia: Turquia e Egito oferecem experiências exóticas com custo de vida muito baixo, compensando passagens mais caras.",
      "Dica PromoCéu: os destinos com maior volatilidade de preço (e portanto maior potencial de economia) são Dubai, Tóquio e Nova York.",
    ],
  },
  {
    icon: Lightbulb,
    title: "Segredos da precificação aérea",
    preview: "Como as companhias definem preços e como usar isso a seu favor.",
    content: [
      "Companhias usam 'yield management' — um sistema que divide cada voo em até 26 classes tarifárias (letras de A a Z), cada uma com preço diferente.",
      "O preço que você vê depende de: quantos assentos restam na classe mais barata, demanda histórica para aquele voo, dia da semana, proximidade da data e até o país de onde você pesquisa.",
      "Quando uma classe tarifária se esgota, o preço salta para a próxima — às vezes R$ 500+ de diferença de um dia para o outro.",
      "É por isso que monitoramento contínuo é essencial. A PromoCéu detecta quando classes baratas reabrem ou quando há erro no sistema de precificação.",
    ],
  },
];

function TipPopup({ tip, onClose }: { tip: Tip; onClose: () => void }) {
  const Icon = tip.icon;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-lg bg-card rounded-xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="bg-primary/5 border-b border-primary/15 p-6 flex items-center gap-4 sticky top-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display font-bold text-lg flex-1">{tip.title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {tip.content.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="text-foreground/80 leading-relaxed text-sm"
            >
              {p}
            </motion.p>
          ))}
          <button onClick={onClose} className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Fechar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TravelTipsSection() {
  const [selected, setSelected] = useState<Tip | null>(null);

  return (
    <section id="como-funciona" className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-accent" />
            <p className="text-accent font-semibold text-sm uppercase tracking-widest">
              Base de conhecimento
            </p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Aprenda a viajar <span className="text-gradient-primary">com inteligência</span>
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Conteúdo exclusivo sobre o mercado aéreo para você tomar decisões melhores. Clique em qualquer artigo para ler o conteúdo completo.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <ScrollReveal key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  onClick={() => setSelected(tip)}
                  className="glass-card p-6 cursor-pointer group hover:shadow-md hover:border-primary/20 transition-all h-full flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{tip.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">{tip.preview}</p>
                  <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium">
                    <span>Ler artigo</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && <TipPopup tip={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}
