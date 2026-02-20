import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Globe, ChevronRight, X, Star } from "lucide-react";
import { useState } from "react";

interface Airline {
  name: string;
  code: string;
  alliance: string;
  hubs: string;
  routes: number;
  rating: number;
  detail: string;
}

const airlines: Airline[] = [
  { name: "LATAM Airlines", code: "LA", alliance: "oneworld", hubs: "GRU, SCL, LIM", routes: 145, rating: 4.2, detail: "Maior companhia aérea da América Latina, com uma malha extensa conectando o Brasil à Europa, EUA e Oceania. Membro da aliança oneworld, permite acúmulo em programas como Iberia Plus e British Airways." },
  { name: "Emirates", code: "EK", alliance: "Nenhuma", hubs: "DXB", routes: 157, rating: 4.8, detail: "Considerada uma das melhores companhias do mundo, a Emirates oferece serviço premium em todas as classes. Seus voos do Brasil conectam via Dubai com destinos na Ásia, África e Oceania." },
  { name: "Air France", code: "AF", alliance: "SkyTeam", hubs: "CDG", routes: 195, rating: 4.3, detail: "Companhia de bandeira francesa, membro fundadora da SkyTeam. Oferece conexões diretas do Brasil para Paris com conexões para toda a Europa, incluindo cidades menores inacessíveis por outras companhias." },
  { name: "Qatar Airways", code: "QR", alliance: "oneworld", hubs: "DOH", routes: 170, rating: 4.9, detail: "Premiada como melhor companhia aérea do mundo múltiplas vezes, a Qatar Airways conecta Doha com mais de 170 destinos. O hub em Doha é um dos mais modernos do mundo." },
  { name: "Turkish Airlines", code: "TK", alliance: "Star Alliance", hubs: "IST", routes: 340, rating: 4.4, detail: "A companhia que voa para mais países no mundo (130+). O mega-hub de Istambul permite conexões para destinos exóticos na Ásia Central, África e Oriente Médio que nenhuma outra companhia oferece do Brasil." },
  { name: "TAP Air Portugal", code: "TP", alliance: "Star Alliance", hubs: "LIS", routes: 90, rating: 4.0, detail: "A porta de entrada da Europa para brasileiros, com voos diretos para Lisboa e conexões para toda a Europa. Oferece stopover gratuito em Portugal — uma parada extra sem custo adicional." },
  { name: "Lufthansa", code: "LH", alliance: "Star Alliance", hubs: "FRA, MUC", routes: 220, rating: 4.3, detail: "A maior companhia europeia e âncora do grupo Lufthansa (Swiss, Austrian, Brussels). Oferece conexões via Frankfurt para toda a Europa, com pontualidade e serviço alemão de alta qualidade." },
  { name: "Delta Air Lines", code: "DL", alliance: "SkyTeam", hubs: "ATL, JFK", routes: 275, rating: 4.1, detail: "Uma das maiores companhias americanas com presença forte no Brasil. Oferece conexões via Atlanta e Nova York para todo o território americano e Caribe." },
];

function AirlinePopup({ airline, onClose }: { airline: Airline; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-md bg-card rounded-xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="bg-primary/5 border-b border-primary/15 p-6">
          <div className="flex items-center gap-3">
            <img
              src={`https://images.kiwi.com/airlines/64/${airline.code}.png`}
              alt={airline.name}
              className="w-12 h-12 rounded-xl object-contain bg-white/10 p-1.5"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <div>
              <h3 className="font-display font-bold">{airline.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Globe className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{airline.alliance}</span>
              </div>
            </div>
            <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-foreground/80 leading-relaxed text-sm mb-5">{airline.detail}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card p-3 text-center">
              <p className="text-primary font-bold font-display">{airline.routes}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Destinos</p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className="text-primary font-bold font-display">{airline.hubs.split(",").length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hubs</p>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-3 h-3 fill-accent text-accent" />
                <span className="text-primary font-bold font-display">{airline.rating}</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avaliação</p>
            </div>
          </div>
          <button onClick={onClose} className="w-full mt-5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Fechar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AirlinePartnersSection() {
  const [selected, setSelected] = useState<Airline | null>(null);

  return (
    <section className="relative py-24 px-4 bg-secondary/40">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-primary" />
            <p className="text-primary font-semibold text-sm uppercase tracking-widest">
              Companhias monitoradas
            </p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            50+ companhias aéreas <span className="text-gradient-primary">sob radar</span>
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Monitoramos as principais companhias aéreas do mundo. Clique em qualquer uma para saber mais sobre cobertura, alianças e avaliações.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {airlines.map((a, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <motion.div
                whileHover={{ y: -3 }}
                onClick={() => setSelected(a)}
                className="glass-card p-5 cursor-pointer group hover:border-primary/20 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={`https://images.kiwi.com/airlines/64/${a.code}.png`}
                    alt={a.name}
                    className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1"
                    onError={(e) => { e.currentTarget.src = ""; e.currentTarget.className = "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"; }}
                  />
                  <div>
                    <p className="font-display font-semibold text-sm">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.alliance}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{a.routes} destinos</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    <span>{a.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Detalhes</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && <AirlinePopup airline={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}
