import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Bell, ShoppingCart, CheckCircle, Smartphone, BarChart3, ChevronRight, X } from "lucide-react";
import { useState } from "react";

interface Step {
  icon: typeof UserPlus;
  title: string;
  desc: string;
  detail: string;
  tips: string[];
}

const steps: Step[] = [
  {
    icon: UserPlus,
    title: "Escolha seu plano",
    desc: "Selecione a assinatura ideal para o seu perfil de viagem e prioridades.",
    detail: "Oferecemos 3 modalidades de assinatura pensadas para diferentes perfis. O plano mensal é ideal para testar o serviço. O semestral oferece economia de 20%. E o anual é o mais vantajoso, com economia de 33% e acesso prioritário a erros tarifários.",
    tips: [
      "Comece pelo mensal se tem dúvidas — a economia da primeira viagem já paga a assinatura",
      "Planos anuais recebem alertas com 2-3 minutos de antecedência sobre os demais",
      "Você pode fazer upgrade ou downgrade a qualquer momento",
    ],
  },
  {
    icon: Bell,
    title: "Receba alertas qualificados",
    desc: "Oportunidades verificadas com dados de mercado chegam direto no seu celular.",
    detail: "Cada alerta passa por uma tríplice validação antes de chegar até você. Incluímos: rota completa, preço atual vs. histórico de 90 dias, companhia aérea, janela de datas, e link direto para compra. Sem spam, sem falsos positivos.",
    tips: [
      "Ative notificações para não perder alertas urgentes (erros tarifários duram em média 4h)",
      "Configure preferências de destino para receber alertas mais relevantes",
      "Alertas de classe executiva são exclusivos para membros com módulo premium",
    ],
  },
  {
    icon: ShoppingCart,
    title: "Compre direto na companhia",
    desc: "Sem intermediários, sem taxas extras. A compra é 100% direta e segura.",
    detail: "A PromoCéu não é uma agência de viagens. Nós informamos, você decide. O link do alerta leva direto ao site oficial da companhia aérea. Você mantém total controle sobre sua reserva, com acesso às políticas de cancelamento e flexibilidade originais.",
    tips: [
      "Use cartão de crédito com bom acúmulo de milhas para maximizar o benefício",
      "Verifique as políticas de bagagem e cancelamento no momento da compra",
      "Considere fazer a reserva e depois pesquisar hospedagem — a passagem é o que mais varia",
    ],
  },
  {
    icon: Smartphone,
    title: "Acompanhe suas economias",
    desc: "Veja em tempo real quanto você já economizou com a plataforma.",
    detail: "Nosso dashboard mostra sua economia acumulada, viagens realizadas e oportunidades aproveitadas. É a prova tangível do retorno sobre o investimento da assinatura.",
    tips: [
      "A economia média por viagem dos nossos membros é de R$ 2.400",
      "Membros que ficam 12+ meses economizam em média R$ 8.700 por ano",
      "O módulo executivo tem ROI médio de 14x o valor da assinatura",
    ],
  },
];

function StepPopup({ step, index, onClose }: { step: Step; index: number; onClose: () => void }) {
  const Icon = step.icon;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-lg bg-card rounded-xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="bg-primary/5 border-b border-primary/15 p-6 flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {index + 1}
            </span>
          </div>
          <h3 className="font-display font-bold text-lg flex-1">{step.title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-foreground/80 leading-relaxed mb-6">{step.detail}</p>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Dicas importantes</p>
            {step.tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="flex gap-3 text-sm"
              >
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-foreground/70">{tip}</p>
              </motion.div>
            ))}
          </div>
          <button onClick={onClose} className="w-full mt-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Fechar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  const [selected, setSelected] = useState<{ step: Step; index: number } | null>(null);

  return (
    <section className="relative py-24 px-4 bg-secondary/40">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Processo simples
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Como funciona na prática
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Em 4 passos simples, você passa a ter acesso às melhores oportunidades do mercado aéreo. Clique em qualquer etapa para ver dicas detalhadas.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => setSelected({ step, index: i })}
                className="text-center cursor-pointer group glass-card p-6 h-full"
              >
                <div className="relative mx-auto mb-5 w-fit">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <step.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold font-display">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                <div className="flex items-center justify-center gap-1 mt-4 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Ver dicas</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <StepPopup step={selected.step} index={selected.index} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
