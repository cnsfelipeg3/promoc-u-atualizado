import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, TrendingDown, AlertTriangle, Search, DollarSign, ChevronRight } from "lucide-react";
import { useState } from "react";

const pains = [
  {
    icon: TrendingDown,
    title: "Pagou mais caro do que deveria",
    desc: "Dias depois, a mesma passagem custava metade. Acontece com frequência — e não é coincidência.",
    detail: "Companhias aéreas ajustam preços centenas de vezes por dia usando algoritmos de precificação dinâmica. Sem monitoramento ativo, você paga a tarifa do momento — não a melhor tarifa disponível. O PromoCéu rastreia essas variações em tempo real e avisa quando o preço cai significativamente. A diferença entre quem monitora e quem não monitora pode chegar a R$ 4.000 por viagem.",
  },
  {
    icon: Clock,
    title: "As melhores tarifas duram poucas horas",
    desc: "Promoções reais surgem e desaparecem antes de você sequer ficar sabendo. A janela de oportunidade é minúscula.",
    detail: "Erros tarifários, promoções relâmpago e quedas súbitas de preço são corrigidos rapidamente pelas companhias. Um alerta enviado 2 horas atrasado pode significar a diferença entre R$ 2.000 e R$ 6.000. O sistema PromoCéu detecta e notifica em menos de 5 minutos. Nossos membros têm em média 47 minutos de vantagem sobre quem busca manualmente.",
  },
  {
    icon: AlertTriangle,
    title: "Falta de acesso, não de dinheiro",
    desc: "O problema real é não ter a informação certa no momento certo. A maioria das pessoas nem sabe que existem promoções assim.",
    detail: "Pesquisar manualmente em dezenas de sites e companhias consome horas e ainda assim você pode perder a oportunidade. O PromoCéu automatiza esse trabalho com tecnologia de monitoramento contínuo em mais de 150 destinos, 24 horas por dia. É como ter um analista de mercado trabalhando exclusivamente para suas próximas viagens.",
  },
  {
    icon: Search,
    title: "Informação fragmentada",
    desc: "Blogs, grupos de Facebook, sites de milhas... informação espalhada e desatualizada.",
    detail: "O mercado de promoções aéreas é dominado por informação fragmentada e desatualizada. Blogs publicam promoções horas depois de serem detectadas. Grupos de Facebook misturam spam com conteúdo real. Sites de milhas focam apenas em programas de fidelidade. A PromoCéu consolida tudo em uma única plataforma inteligente, com alertas verificados e contextualizados.",
  },
  {
    icon: DollarSign,
    title: "Agências cobram taxas desnecessárias",
    desc: "Intermediários adicionam margens de 15-30% sobre o preço da companhia aérea.",
    detail: "Agências de viagem operam com margens que podem chegar a 30% sobre a tarifa original. Além disso, muitas impõem políticas de cancelamento mais restritivas que as próprias companhias aéreas. Com a PromoCéu, você compra diretamente no site da companhia, sem intermediação, com acesso às políticas de cancelamento e flexibilidade originais.",
  },
];

export default function PainSection() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            O desafio
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4 text-balance">
            Por que a maioria das pessoas paga mais caro<br className="hidden sm:block" /> do que deveria em passagens aéreas?
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            O mercado aéreo é projetado para maximizar o lucro das companhias — não para você economizar. Entenda os 5 maiores obstáculos e como a PromoCéu resolve cada um deles.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pains.map((p, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                layout
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="glass-card p-7 h-full cursor-pointer group hover:shadow-md hover:border-primary/20 transition-all duration-300"
              >
                <p.icon className="w-10 h-10 text-primary mb-5" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-semibold mb-3">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>

                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-foreground/70 leading-relaxed">{p.detail}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium">
                  <span>{expanded === i ? "Fechar" : "Saiba mais"}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${expanded === i ? "rotate-90" : ""}`} />
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
