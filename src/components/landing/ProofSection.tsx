import ScrollReveal from "@/components/ScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, X, MapPin, Camera, Utensils, Landmark } from "lucide-react";
import { useState } from "react";

import destParis from "@/assets/dest-paris.jpg";
import destNY from "@/assets/dest-newyork.jpg";
import destSalvador from "@/assets/dest-salvador.jpg";
import destTokyo from "@/assets/dest-tokyo.jpg";
import destLisbon from "@/assets/dest-lisbon.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destSantorini from "@/assets/dest-santorini.jpg";
import destMachuPicchu from "@/assets/dest-machupicchu.jpg";
import destMaldives from "@/assets/dest-maldives.jpg";

interface Deal {
  route: string;
  city: string;
  original: string;
  promo: string;
  flag: string;
  image: string;
  label: string;
  bestTime: string;
  highlights: string[];
  itinerary: string[];
}

const deals: Deal[] = [
  { route: "São Paulo → Paris", city: "Paris", original: "R$ 6.890", promo: "R$ 2.970", flag: "🇫🇷", image: destParis, label: "Oportunidade real", bestTime: "Abril a Junho e Setembro a Outubro", highlights: ["Torre Eiffel e Champs-Élysées", "Museu do Louvre", "Gastronomia de classe mundial"], itinerary: ["Dia 1–2: Marais, Notre-Dame e Île de la Cité", "Dia 3: Louvre e Jardim das Tulherias", "Dia 4: Versalhes (bate-volta)", "Dia 5: Montmartre e Sacré-Cœur", "Dia 6–7: Compras e gastronomia local"] },
  { route: "São Paulo → Nova York", city: "Nova York", original: "R$ 5.400", promo: "R$ 1.990", flag: "🇺🇸", image: destNY, label: "Promoção recente", bestTime: "Abril a Junho e Setembro a Novembro", highlights: ["Central Park e Times Square", "Museus de classe mundial", "Broadway e vida noturna"], itinerary: ["Dia 1–2: Manhattan — Times Square, Central Park, MoMA", "Dia 3: Estátua da Liberdade e Brooklyn Bridge", "Dia 4: Metropolitan Museum e Upper East Side", "Dia 5: SoHo, Greenwich Village e Chelsea Market", "Dia 6–7: Broadway, compras e gastronomia"] },
  { route: "São Paulo → Salvador", city: "Salvador", original: "R$ 1.100", promo: "R$ 399", flag: "🇧🇷", image: destSalvador, label: "Oportunidade real", bestTime: "Dezembro a Março", highlights: ["Pelourinho e cultura afro-brasileira", "Praias paradisíacas", "Culinária baiana autêntica"], itinerary: ["Dia 1: Pelourinho e Elevador Lacerda", "Dia 2: Praia do Forte e Projeto Tamar", "Dia 3: Itapuã e gastronomia no Rio Vermelho", "Dia 4: Ilha de Itaparica"] },
  { route: "São Paulo → Tóquio", city: "Tóquio", original: "R$ 8.200", promo: "R$ 3.490", flag: "🇯🇵", image: destTokyo, label: "Erro tarifário", bestTime: "Março a Maio e Outubro a Novembro", highlights: ["Shibuya e tecnologia de ponta", "Templos e jardins tradicionais", "Gastronomia japonesa inigualável"], itinerary: ["Dia 1–2: Shibuya, Harajuku e Shinjuku", "Dia 3: Asakusa, Senso-ji e Akihabara", "Dia 4: Monte Fuji e Hakone", "Dia 5: Tsukiji Market e Ginza", "Dia 6–7: Nikko ou Kamakura"] },
  { route: "São Paulo → Lisboa", city: "Lisboa", original: "R$ 4.800", promo: "R$ 2.190", flag: "🇵🇹", image: destLisbon, label: "Promoção recente", bestTime: "Abril a Outubro", highlights: ["Bairros históricos e pastéis de nata", "Sintra e arquitetura mourisca", "Vida noturna no Bairro Alto"], itinerary: ["Dia 1: Alfama e Castelo de São Jorge", "Dia 2: Belém — Torre e Mosteiro dos Jerónimos", "Dia 3: Sintra e Cascais", "Dia 4: Bairro Alto, Chiado e compras", "Dia 5: Gastronomia e vinhos do Douro"] },
  { route: "São Paulo → Dubai", city: "Dubai", original: "R$ 7.500", promo: "R$ 3.280", flag: "🇦🇪", image: destDubai, label: "Oportunidade real", bestTime: "Novembro a Março", highlights: ["Burj Khalifa e arquitetura futurista", "Desert safari e souks tradicionais", "Compras e luxo acessível"], itinerary: ["Dia 1: Burj Khalifa e Dubai Mall", "Dia 2: Palm Jumeirah e Atlantis", "Dia 3: Desert Safari e jantar no deserto", "Dia 4: Gold Souk e Dubai Creek", "Dia 5: Abu Dhabi (bate-volta)"] },
  { route: "São Paulo → Santorini", city: "Santorini", original: "R$ 7.200", promo: "R$ 3.150", flag: "🇬🇷", image: destSantorini, label: "Erro tarifário", bestTime: "Maio a Outubro", highlights: ["Pôr do sol em Oia", "Praias vulcânicas", "Gastronomia mediterrânea"], itinerary: ["Dia 1: Fira — explorar a capital", "Dia 2: Oia e o famoso pôr do sol", "Dia 3: Praia Vermelha e Akrotiri", "Dia 4: Vinícolas e gastronomia", "Dia 5: Passeio de barco pela caldeira"] },
  { route: "São Paulo → Machu Picchu", city: "Machu Picchu", original: "R$ 3.400", promo: "R$ 1.290", flag: "🇵🇪", image: destMachuPicchu, label: "Promoção recente", bestTime: "Abril a Outubro", highlights: ["Cidadela Inca a 2.430m", "Cusco e Vale Sagrado", "Culinária peruana premiada"], itinerary: ["Dia 1–2: Cusco — aclimatação e centro histórico", "Dia 3: Vale Sagrado — Ollantaytambo e Pisac", "Dia 4: Machu Picchu (trem panorâmico)", "Dia 5: Trilha alternativa ou Moray"] },
  { route: "São Paulo → Maldivas", city: "Maldivas", original: "R$ 9.800", promo: "R$ 4.190", flag: "🇲🇻", image: destMaldives, label: "Oportunidade real", bestTime: "Novembro a Abril", highlights: ["Bungalows sobre a água", "Mergulho com vida marinha", "Praias de areia branca"], itinerary: ["Dia 1: Chegada e instalação no resort", "Dia 2: Snorkeling no recife da ilha", "Dia 3: Excursão de barco e pesca", "Dia 4: Spa e relaxamento", "Dia 5: Mergulho com tubarões-baleia", "Dia 6–7: Passeio de dhoni e pôr do sol"] },
];

function DestinationPopup({ deal, onClose }: { deal: Deal; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: "hsl(199 60% 10% / 0.95)", border: "1px solid hsl(193 76% 38% / 0.2)" }}
        initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
      >
        <div className="relative h-56">
          <img src={deal.image} alt={deal.city} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(199 95% 8%) 0%, transparent 100%)" }} />
          <button onClick={onClose} className="absolute top-4 right-4 bg-background/60 backdrop-blur-sm rounded-full p-2 hover:bg-background/80 transition-colors">
            <X className="w-5 h-5 text-foreground" />
          </button>
          <div className="absolute bottom-4 left-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{deal.flag}</span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary text-primary-foreground neon-tag">{deal.label}</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">{deal.city}</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-baseline gap-3 mb-6 pb-6" style={{ borderBottom: "1px solid hsl(193 76% 38% / 0.15)" }}>
            <span className="text-muted-foreground line-through text-lg">{deal.original}</span>
            <span className="text-primary font-bold text-3xl font-display">{deal.promo}</span>
            <span className="text-xs text-signal-green bg-signal-green/10 px-2 py-0.5 rounded-full font-semibold">ida e volta</span>
          </div>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-semibold">Melhor época</p>
            <p className="text-foreground font-medium">{deal.bestTime}</p>
          </div>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-semibold">Destaques</p>
            <div className="grid gap-2">
              {deal.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                  {i === 0 ? <Camera className="w-4 h-4 text-primary flex-shrink-0" /> : i === 1 ? <Landmark className="w-4 h-4 text-primary flex-shrink-0" /> : <Utensils className="w-4 h-4 text-primary flex-shrink-0" />}
                  {h}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-semibold">Sugestão de roteiro</p>
            <div className="space-y-2">
              {deal.itinerary.map((day, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p className="text-foreground/80">{day}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.a href="#planos" onClick={onClose} className="glow-button text-sm w-full mt-6 flex items-center justify-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Plane className="w-4 h-4" />
            Quero receber alertas para {deal.city}
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CounterStat() {
  const { ref, isVisible } = useScrollReveal(0.3);
  const count = useCountUp(70, 1200, isVisible);
  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-5xl sm:text-6xl font-bold text-primary">{count}%</p>
      <p className="text-muted-foreground mt-2">de economia média em rotas monitoradas</p>
    </div>
  );
}

export default function ProofSection() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  return (
    <section id="destinos" className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Últimas promoções do grupo
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            Promoções reais que passaram pelo grupo
          </h2>
          <p className="text-muted-foreground text-center mb-6 max-w-2xl mx-auto">
            Clique em qualquer destino para ver detalhes e roteiro sugerido.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mb-16"><CounterStat /></div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <motion.div whileHover={{ y: -4 }} onClick={() => setSelectedDeal(deal)} className="dest-card group h-72 cursor-pointer">
                <img src={deal.image} alt={deal.route} className="absolute inset-0" loading="lazy" />
                <div className="overlay" />
                <div className="absolute top-4 right-4 z-10">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/90 text-primary-foreground backdrop-blur-sm neon-tag">
                    {deal.label}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{deal.flag}</span>
                    <Plane className="w-4 h-4 text-white/70" />
                  </div>
                  <p className="font-display font-semibold text-lg mb-3 text-white">{deal.route}</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/50 line-through text-sm">{deal.original}</span>
                    <span className="text-white font-bold text-2xl">{deal.promo}</span>
                  </div>
                  <p className="text-white/50 text-xs mt-2">Clique para ver roteiro →</p>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedDeal && <DestinationPopup deal={selectedDeal} onClose={() => setSelectedDeal(null)} />}
      </AnimatePresence>
    </section>
  );
}
