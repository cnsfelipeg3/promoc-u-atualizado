import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, MapPin, Plane, X } from "lucide-react";
import { useState } from "react";

import destParis from "@/assets/dest-paris.jpg";
import destNY from "@/assets/dest-newyork.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destSantorini from "@/assets/dest-santorini.jpg";
import destLisbon from "@/assets/dest-lisbon.jpg";
import destTokyo from "@/assets/dest-tokyo.jpg";

interface Testimonial {
  name: string;
  role: string;
  location: string;
  text: string;
  savings: string;
  destination: string;
  rating: number;
  detail: string;
  bgImage: string;
}

const testimonials: Testimonial[] = [
  { name: "Carolina Mendes", role: "Executiva de Marketing", location: "São Paulo, SP", text: "Economizei R$ 4.200 em uma viagem para Paris que eu planejava há anos.", savings: "R$ 4.200", destination: "Paris", rating: 5, detail: "A passagem que eu monitorava há meses por R$ 6.800 apareceu por R$ 2.600 num alerta da PromoCéu. Comprei direto no site da Air France.", bgImage: destParis },
  { name: "Ricardo Almeida", role: "Engenheiro de Software", location: "Curitiba, PR", text: "Já fiz 5 viagens internacionais em 18 meses graças aos alertas.", savings: "R$ 12.800", destination: "Nova York, Tóquio, Lisboa", rating: 5, detail: "Com a PromoCéu, mudou minha relação com viagens. Aproveitei um erro tarifário para Tóquio (R$ 1.900 ida e volta!).", bgImage: destNY },
  { name: "Fernanda Costa", role: "Médica", location: "Belo Horizonte, MG", text: "Classe executiva para Dubai por R$ 6.400 ao invés de R$ 18.000.", savings: "R$ 11.600", destination: "Dubai", rating: 5, detail: "Com o módulo executivo da PromoCéu, recebi um alerta de business class para Dubai pela Emirates.", bgImage: destDubai },
  { name: "Thiago Nascimento", role: "Empreendedor Digital", location: "Florianópolis, SC", text: "Levei a família inteira para Orlando gastando menos do que eu gastaria sozinho.", savings: "R$ 8.900", destination: "Orlando", rating: 5, detail: "4 passagens para Orlando por R$ 1.100 cada, ida e volta. A tarifa normal era R$ 3.400.", bgImage: destSantorini },
  { name: "Juliana Ribeiro", role: "Professora Universitária", location: "Porto Alegre, RS", text: "Ceticismo total no início. Depois do primeiro alerta aproveitado, virei evangelista.", savings: "R$ 3.600", destination: "Santiago", rating: 5, detail: "Na primeira semana, apareceu Santiago por R$ 380 ida e volta. Normalmente custa R$ 1.400.", bgImage: destLisbon },
  { name: "André Oliveira", role: "Advogado", location: "Brasília, DF", text: "A transparência me conquistou. Sem letras miúdas, sem intermediação.", savings: "R$ 5.200", destination: "Roma e Barcelona", rating: 5, detail: "Fiz Roma e Barcelona num único roteiro por R$ 2.800 ida e volta. O normal seria R$ 5.500+.", bgImage: destTokyo },
];

function TestimonialCard({ t, onClick }: { t: Testimonial; onClick: () => void }) {
  return (
    <motion.div whileHover={{ y: -4 }} onClick={onClick}
      className="relative overflow-hidden rounded-xl cursor-pointer group h-full flex flex-col"
      style={{ minHeight: "280px" }}
    >
      <img src={t.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(199 60% 12% / 0.85) 0%, hsl(199 60% 12% / 0.95) 100%)" }} />
      <div className="relative z-10 p-6 flex flex-col h-full" style={{ backdropFilter: "blur(8px)", border: "1px solid hsl(193 76% 38% / 0.12)", borderRadius: "0.75rem" }}>
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-accent text-accent" />
          ))}
        </div>
        <Quote className="w-6 h-6 text-primary/20 mb-2" />
        <p className="text-foreground/80 leading-relaxed flex-1 text-sm">"{t.text}"</p>
        <div className="mt-5 pt-4" style={{ borderTop: "1px solid hsl(193 76% 38% / 0.1)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display font-semibold text-sm text-foreground">{t.name}</p>
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
      </div>
    </motion.div>
  );
}

function TestimonialPopup({ t, onClose }: { t: Testimonial; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        style={{ background: "hsl(199 60% 12% / 0.95)", border: "1px solid hsl(193 76% 38% / 0.2)" }}
        initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
      >
        <div className="relative h-32 overflow-hidden">
          <img src={t.bgImage} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, hsl(199 60% 12%))" }} />
          <button onClick={onClose} className="absolute top-3 right-3 text-foreground/60 hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 -mt-8 relative">
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-accent text-accent" />
            ))}
          </div>
          <h3 className="font-display font-bold text-lg">{t.name}</h3>
          <p className="text-muted-foreground text-sm">{t.role} · {t.location}</p>
          <div className="flex items-center gap-4 my-5 pb-5" style={{ borderBottom: "1px solid hsl(193 76% 38% / 0.1)" }}>
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
          <motion.a href="#planos" onClick={onClose} className="glow-button text-sm w-full flex items-center justify-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Quero economizar também
          </motion.a>
          <button onClick={onClose} className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Fechar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const [selected, setSelected] = useState<Testimonial | null>(null);

  return (
    <section id="depoimentos" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">Histórias reais</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">O que nossos membros dizem</h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Mais de 2.000 viajantes já transformaram a forma como compram passagens aéreas.
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
