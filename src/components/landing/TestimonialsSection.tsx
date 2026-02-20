import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, MapPin, Plane } from "lucide-react";
import { useState } from "react";

interface Testimonial {
  name: string;
  role: string;
  location: string;
  text: string;
  savings: string;
  destination: string;
  rating: number;
  detail: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Carolina Mendes",
    role: "Executiva de Marketing",
    location: "São Paulo, SP",
    text: "Economizei R$ 4.200 em uma viagem para Paris que eu planejava há anos. O alerta chegou às 6h da manhã e em 20 minutos eu já tinha comprado.",
    savings: "R$ 4.200",
    destination: "Paris",
    rating: 5,
    detail: "A passagem que eu monitorava há meses por R$ 6.800 apareceu por R$ 2.600 num alerta da PromoCéu. Comprei direto no site da Air France. A viagem foi incrível — 10 dias explorando Paris e sul da França. Sem a PromoCéu, teria pago o dobro ou nem teria ido.",
  },
  {
    name: "Ricardo Almeida",
    role: "Engenheiro de Software",
    location: "Curitiba, PR",
    text: "Já fiz 5 viagens internacionais em 18 meses graças aos alertas. Antes, viajava uma vez por ano no máximo.",
    savings: "R$ 12.800",
    destination: "Nova York, Tóquio, Lisboa",
    rating: 5,
    detail: "Com a PromoCéu, mudou minha relação com viagens. Aproveitei um erro tarifário para Tóquio (R$ 1.900 ida e volta!) e promoções incríveis para NY e Lisboa. A assinatura se paga na primeira viagem. O ROI é absurdo.",
  },
  {
    name: "Fernanda Costa",
    role: "Médica",
    location: "Belo Horizonte, MG",
    text: "Classe executiva para Dubai por R$ 6.400 ao invés de R$ 18.000. Parecia impossível até eu receber o alerta.",
    savings: "R$ 11.600",
    destination: "Dubai",
    rating: 5,
    detail: "Sempre quis voar de executiva, mas os preços eram proibitivos. Com o módulo executivo da PromoCéu, recebi um alerta de business class para Dubai pela Emirates. Confirmei em 15 minutos. O voo, a comida, o lounge — tudo impecável. E por 1/3 do preço normal.",
  },
  {
    name: "Thiago Nascimento",
    role: "Empreendedor Digital",
    location: "Florianópolis, SC",
    text: "Levei a família inteira para Orlando gastando menos do que eu gastaria sozinho em época normal.",
    savings: "R$ 8.900",
    destination: "Orlando",
    rating: 5,
    detail: "4 passagens para Orlando por R$ 1.100 cada, ida e volta. A tarifa normal era R$ 3.400. Os alertas da PromoCéu são cirúrgicos — chegam com tempo suficiente para você decidir, mas rápido o bastante para não perder a oportunidade.",
  },
  {
    name: "Juliana Ribeiro",
    role: "Professora Universitária",
    location: "Porto Alegre, RS",
    text: "Ceticismo total no início. Depois do primeiro alerta aproveitado, virei evangelista. Já indiquei para 15 colegas.",
    savings: "R$ 3.600",
    destination: "Santiago",
    rating: 5,
    detail: "Achei que era bom demais pra ser verdade. Assinei o plano mensal pra testar. Na primeira semana, apareceu Santiago por R$ 380 ida e volta. Normalmente custa R$ 1.400. Comprei na hora. Hoje estou no plano anual e já economizei mais de R$ 3.600 em 4 viagens.",
  },
  {
    name: "André Oliveira",
    role: "Advogado",
    location: "Brasília, DF",
    text: "A transparência me conquistou. Sem letras miúdas, sem intermediação. A compra é sempre direto na companhia.",
    savings: "R$ 5.200",
    destination: "Roma e Barcelona",
    rating: 5,
    detail: "Como advogado, eu fico atento a pegadinhas. A PromoCéu é extremamente transparente: os alertas vêm com link direto para a companhia aérea. Não há taxa escondida, não há intermediação. Fiz Roma e Barcelona num único roteiro por R$ 2.800 ida e volta. O normal seria R$ 5.500+.",
  },
];

function TestimonialCard({ t, onClick }: { t: Testimonial; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="glass-card p-6 cursor-pointer group hover:shadow-md hover:border-primary/20 transition-all h-full flex flex-col"
    >
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
        ))}
      </div>

      <Quote className="w-6 h-6 text-primary/20 mb-2" />
      <p className="text-foreground/80 leading-relaxed flex-1 text-sm">"{t.text}"</p>

      <div className="mt-5 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display font-semibold text-sm">{t.name}</p>
            <p className="text-muted-foreground text-xs">{t.role}</p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t.location}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Economizou</p>
            <p className="text-primary font-bold font-display">{t.savings}</p>
          </div>
        </div>
      </div>

      <p className="text-primary text-xs font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        Clique para ler a história completa →
      </p>
    </motion.div>
  );
}

function TestimonialPopup({ t, onClose }: { t: Testimonial; onClose: () => void }) {
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
        <div className="bg-primary/5 border-b border-primary/15 px-6 py-4">
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-accent text-accent" />
            ))}
          </div>
          <h3 className="font-display font-bold text-lg">{t.name}</h3>
          <p className="text-muted-foreground text-sm">{t.role} · {t.location}</p>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground">Economia total</p>
              <p className="text-primary font-bold text-2xl font-display">{t.savings}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Plane className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{t.destination}</span>
            </div>
          </div>

          <Quote className="w-8 h-8 text-primary/15 mb-3" />
          <p className="text-foreground/80 leading-relaxed mb-4">{t.detail}</p>

          <motion.a
            href="#planos"
            onClick={onClose}
            className="glow-button text-sm w-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Quero economizar também
          </motion.a>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const [selected, setSelected] = useState<Testimonial | null>(null);

  return (
    <section id="depoimentos" className="relative py-24 px-4 bg-secondary/40">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Histórias reais
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            O que nossos membros dizem
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Mais de 2.000 viajantes já transformaram a forma como compram passagens aéreas. Clique em qualquer depoimento para ler a história completa.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <TestimonialCard t={t} onClick={() => setSelected(t)} />
            </ScrollReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && <TestimonialPopup t={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}
