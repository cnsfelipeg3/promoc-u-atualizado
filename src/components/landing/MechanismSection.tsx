import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, ShieldCheck, CreditCard, BarChart3, Globe, ChevronRight } from "lucide-react";
import { useState } from "react";

const items = [
  {
    icon: Radar,
    title: "Monitoramento contínuo de rotas",
    desc: "Rastreamos milhares de tarifas diariamente em companhias nacionais e internacionais.",
    detail: "Nossa tecnologia varre mais de 50 companhias aéreas e centenas de combinações de origem/destino a cada hora. Quando identificamos uma tarifa significativamente abaixo da média de mercado, um alerta é gerado automaticamente para os membros. Cada rota tem um perfil histórico que contextualiza a qualidade da oportunidade.",
  },
  {
    icon: ShieldCheck,
    title: "Compra direta e transparente",
    desc: "Você compra direto na companhia aérea. Sem taxas adicionais, sem intermediários.",
    detail: "Não somos uma agência de viagens. Não vendemos passagens. Nós informamos e você decide. A compra acontece diretamente no site da companhia aérea, garantindo total transparência, segurança e acesso às políticas de cancelamento originais. Você mantém 100% do controle sobre sua reserva.",
  },
  {
    icon: CreditCard,
    title: "Alertas qualificados, não spam",
    desc: "Receba oportunidades verificadas e contextualizadas. Sem pressão, sem ruído.",
    detail: "Cada alerta inclui informações detalhadas: rota, companhia, preço atual vs. histórico, janela de datas e orientações para maximizar seu aproveitamento. Filtramos o ruído — você recebe apenas oportunidades que realmente valem a pena. A decisão é sempre sua.",
  },
  {
    icon: BarChart3,
    title: "Análise de mercado em tempo real",
    desc: "Contextualizamos cada preço com dados históricos de 90 dias e tendências de mercado.",
    detail: "Quando você recebe um alerta, ele vem acompanhado de contexto: qual é o preço médio daquela rota nos últimos 90 dias, qual a tendência de curto prazo, e qual a probabilidade de o preço subir nas próximas horas. Isso permite decisões informadas, não impulsivas.",
  },
  {
    icon: Globe,
    title: "Cobertura global, foco brasileiro",
    desc: "150+ destinos monitorados com foco em rotas com maior demanda brasileira.",
    detail: "Monitoramos rotas de todos os principais aeroportos brasileiros (Guarulhos, Galeão, Confins, Salvador, Curitiba, Porto Alegre, Recife, Fortaleza, Brasília) para destinos nos 5 continentes. A prioridade são as rotas com maior demanda e maior potencial de economia para o viajante brasileiro.",
  },
];

export default function MechanismSection() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section className="relative py-24 px-4 bg-secondary/40">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Nossa metodologia
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4 text-balance">
            Inteligência de mercado aplicada a passagens aéreas
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Uma plataforma que combina tecnologia proprietária com análise de dados em tempo real para encontrar as melhores oportunidades do mercado aéreo. Clique em cada item para entender o mecanismo.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                layout
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="text-center cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/15 transition-colors">
                  <item.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>

                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-border text-left">
                        <p className="text-sm text-foreground/70 leading-relaxed">{item.detail}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-center gap-1 mt-4 text-primary text-sm font-medium">
                  <span>{expanded === i ? "Fechar" : "Entender melhor"}</span>
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
