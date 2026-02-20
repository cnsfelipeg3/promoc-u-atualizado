import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Search, Plane, Calendar, MapPin, TrendingDown, ArrowRight,
  Sparkles, X, Clock, AlertTriangle, ChevronDown
} from "lucide-react";

// Major airports data
const airports = [
  // Brazil
  { code: "GRU", city: "São Paulo", name: "Guarulhos", country: "Brasil", flag: "🇧🇷" },
  { code: "CGH", city: "São Paulo", name: "Congonhas", country: "Brasil", flag: "🇧🇷" },
  { code: "GIG", city: "Rio de Janeiro", name: "Galeão", country: "Brasil", flag: "🇧🇷" },
  { code: "SDU", city: "Rio de Janeiro", name: "Santos Dumont", country: "Brasil", flag: "🇧🇷" },
  { code: "BSB", city: "Brasília", name: "Juscelino Kubitschek", country: "Brasil", flag: "🇧🇷" },
  { code: "CNF", city: "Belo Horizonte", name: "Confins", country: "Brasil", flag: "🇧🇷" },
  { code: "SSA", city: "Salvador", name: "Dep. Luís Eduardo Magalhães", country: "Brasil", flag: "🇧🇷" },
  { code: "REC", city: "Recife", name: "Guararapes", country: "Brasil", flag: "🇧🇷" },
  { code: "FOR", city: "Fortaleza", name: "Pinto Martins", country: "Brasil", flag: "🇧🇷" },
  { code: "POA", city: "Porto Alegre", name: "Salgado Filho", country: "Brasil", flag: "🇧🇷" },
  { code: "CWB", city: "Curitiba", name: "Afonso Pena", country: "Brasil", flag: "🇧🇷" },
  { code: "FLN", city: "Florianópolis", name: "Hercílio Luz", country: "Brasil", flag: "🇧🇷" },
  { code: "BEL", city: "Belém", name: "Val de Cans", country: "Brasil", flag: "🇧🇷" },
  { code: "MAO", city: "Manaus", name: "Eduardo Gomes", country: "Brasil", flag: "🇧🇷" },
  { code: "NAT", city: "Natal", name: "Gov. Aluízio Alves", country: "Brasil", flag: "🇧🇷" },
  { code: "MCZ", city: "Maceió", name: "Zumbi dos Palmares", country: "Brasil", flag: "🇧🇷" },
  { code: "VCP", city: "Campinas", name: "Viracopos", country: "Brasil", flag: "🇧🇷" },
  { code: "CGB", city: "Cuiabá", name: "Marechal Rondon", country: "Brasil", flag: "🇧🇷" },
  { code: "GYN", city: "Goiânia", name: "Santa Genoveva", country: "Brasil", flag: "🇧🇷" },
  { code: "VIT", city: "Vitória", name: "Eurico de Aguiar Salles", country: "Brasil", flag: "🇧🇷" },
  // Americas
  { code: "JFK", city: "Nova York", name: "John F. Kennedy", country: "EUA", flag: "🇺🇸" },
  { code: "EWR", city: "Newark", name: "Liberty", country: "EUA", flag: "🇺🇸" },
  { code: "LAX", city: "Los Angeles", name: "International", country: "EUA", flag: "🇺🇸" },
  { code: "MIA", city: "Miami", name: "International", country: "EUA", flag: "🇺🇸" },
  { code: "MCO", city: "Orlando", name: "International", country: "EUA", flag: "🇺🇸" },
  { code: "ORD", city: "Chicago", name: "O'Hare", country: "EUA", flag: "🇺🇸" },
  { code: "SFO", city: "São Francisco", name: "International", country: "EUA", flag: "🇺🇸" },
  { code: "ATL", city: "Atlanta", name: "Hartsfield-Jackson", country: "EUA", flag: "🇺🇸" },
  { code: "DFW", city: "Dallas", name: "Fort Worth", country: "EUA", flag: "🇺🇸" },
  { code: "IAH", city: "Houston", name: "George Bush", country: "EUA", flag: "🇺🇸" },
  { code: "YYZ", city: "Toronto", name: "Pearson", country: "Canadá", flag: "🇨🇦" },
  { code: "YUL", city: "Montreal", name: "Trudeau", country: "Canadá", flag: "🇨🇦" },
  { code: "MEX", city: "Cidade do México", name: "Benito Juárez", country: "México", flag: "🇲🇽" },
  { code: "CUN", city: "Cancún", name: "International", country: "México", flag: "🇲🇽" },
  { code: "EZE", city: "Buenos Aires", name: "Ezeiza", country: "Argentina", flag: "🇦🇷" },
  { code: "SCL", city: "Santiago", name: "Arturo Merino Benítez", country: "Chile", flag: "🇨🇱" },
  { code: "BOG", city: "Bogotá", name: "El Dorado", country: "Colômbia", flag: "🇨🇴" },
  { code: "LIM", city: "Lima", name: "Jorge Chávez", country: "Peru", flag: "🇵🇪" },
  { code: "PTY", city: "Cidade do Panamá", name: "Tocumen", country: "Panamá", flag: "🇵🇦" },
  // Europe
  { code: "LIS", city: "Lisboa", name: "Humberto Delgado", country: "Portugal", flag: "🇵🇹" },
  { code: "OPO", city: "Porto", name: "Francisco Sá Carneiro", country: "Portugal", flag: "🇵🇹" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "França", flag: "🇫🇷" },
  { code: "LHR", city: "Londres", name: "Heathrow", country: "Reino Unido", flag: "🇬🇧" },
  { code: "LGW", city: "Londres", name: "Gatwick", country: "Reino Unido", flag: "🇬🇧" },
  { code: "MAD", city: "Madri", name: "Barajas", country: "Espanha", flag: "🇪🇸" },
  { code: "BCN", city: "Barcelona", name: "El Prat", country: "Espanha", flag: "🇪🇸" },
  { code: "FCO", city: "Roma", name: "Fiumicino", country: "Itália", flag: "🇮🇹" },
  { code: "MXP", city: "Milão", name: "Malpensa", country: "Itália", flag: "🇮🇹" },
  { code: "FRA", city: "Frankfurt", name: "International", country: "Alemanha", flag: "🇩🇪" },
  { code: "MUC", city: "Munique", name: "Franz Josef Strauss", country: "Alemanha", flag: "🇩🇪" },
  { code: "AMS", city: "Amsterdã", name: "Schiphol", country: "Holanda", flag: "🇳🇱" },
  { code: "ZRH", city: "Zurique", name: "Airport", country: "Suíça", flag: "🇨🇭" },
  { code: "IST", city: "Istambul", name: "Airport", country: "Turquia", flag: "🇹🇷" },
  { code: "ATH", city: "Atenas", name: "Eleftherios Venizelos", country: "Grécia", flag: "🇬🇷" },
  { code: "PRG", city: "Praga", name: "Václav Havel", country: "Tchéquia", flag: "🇨🇿" },
  { code: "VIE", city: "Viena", name: "Schwechat", country: "Áustria", flag: "🇦🇹" },
  { code: "CPH", city: "Copenhague", name: "Kastrup", country: "Dinamarca", flag: "🇩🇰" },
  { code: "DUB", city: "Dublin", name: "Airport", country: "Irlanda", flag: "🇮🇪" },
  // Middle East & Africa
  { code: "DXB", city: "Dubai", name: "International", country: "Emirados Árabes", flag: "🇦🇪" },
  { code: "DOH", city: "Doha", name: "Hamad", country: "Catar", flag: "🇶🇦" },
  { code: "JNB", city: "Joanesburgo", name: "O.R. Tambo", country: "África do Sul", flag: "🇿🇦" },
  { code: "CPT", city: "Cidade do Cabo", name: "International", country: "África do Sul", flag: "🇿🇦" },
  { code: "CAI", city: "Cairo", name: "International", country: "Egito", flag: "🇪🇬" },
  { code: "ADD", city: "Adis Abeba", name: "Bole", country: "Etiópia", flag: "🇪🇹" },
  // Asia & Oceania
  { code: "NRT", city: "Tóquio", name: "Narita", country: "Japão", flag: "🇯🇵" },
  { code: "HND", city: "Tóquio", name: "Haneda", country: "Japão", flag: "🇯🇵" },
  { code: "ICN", city: "Seul", name: "Incheon", country: "Coreia do Sul", flag: "🇰🇷" },
  { code: "PEK", city: "Pequim", name: "Capital", country: "China", flag: "🇨🇳" },
  { code: "PVG", city: "Xangai", name: "Pudong", country: "China", flag: "🇨🇳" },
  { code: "HKG", city: "Hong Kong", name: "International", country: "China", flag: "🇭🇰" },
  { code: "SIN", city: "Singapura", name: "Changi", country: "Singapura", flag: "🇸🇬" },
  { code: "BKK", city: "Bangkok", name: "Suvarnabhumi", country: "Tailândia", flag: "🇹🇭" },
  { code: "DEL", city: "Nova Delhi", name: "Indira Gandhi", country: "Índia", flag: "🇮🇳" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji", country: "Índia", flag: "🇮🇳" },
  { code: "SYD", city: "Sydney", name: "Kingsford Smith", country: "Austrália", flag: "🇦🇺" },
  { code: "AKL", city: "Auckland", name: "International", country: "Nova Zelândia", flag: "🇳🇿" },
  { code: "MLE", city: "Malé", name: "Velana", country: "Maldivas", flag: "🇲🇻" },
];

interface PromoResult {
  airline: string;
  originCode: string;
  destCode: string;
  marketPrice: number;
  promoPrice: number;
  discount: number;
  departDate: string;
  returnDate: string;
  stops: number;
  seats: number;
  type: string;
  duration: string;
}

function generatePromos(originCode: string, destCode: string, dateStr: string): PromoResult[] {
  const airlinesByRoute: Record<string, string[]> = {
    default: ["LATAM", "GOL", "Azul", "TAP", "Emirates", "Air France", "KLM", "Lufthansa", "American Airlines", "United"],
  };
  const allAirlines = airlinesByRoute.default;

  const baseDate = dateStr ? new Date(dateStr) : new Date(Date.now() + 30 * 86400000);

  // Deterministic but varied pricing based on route
  const hash = (originCode + destCode).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const isDomestic = airports.find(a => a.code === originCode)?.country === "Brasil" && airports.find(a => a.code === destCode)?.country === "Brasil";
  const baseMarket = isDomestic ? 800 + (hash % 1200) : 2800 + (hash % 6000);

  const results: PromoResult[] = [];
  const numResults = 5 + (hash % 4);

  for (let i = 0; i < numResults; i++) {
    const airline = allAirlines[(hash + i * 3) % allAirlines.length];
    const discountPct = 25 + ((hash + i * 7) % 50);
    const market = baseMarket + (i * 200 - 400);
    const promo = Math.round(market * (1 - discountPct / 100));
    const daysOffset = i * 2 - 2;
    const depart = new Date(baseDate.getTime() + daysOffset * 86400000);
    const returnD = new Date(depart.getTime() + (5 + (hash + i) % 10) * 86400000);
    const stops = isDomestic ? (i % 3 === 0 ? 0 : 1) : (i % 4 === 0 ? 0 : i % 3 === 0 ? 2 : 1);
    const hours = isDomestic ? 2 + (hash + i) % 4 : 8 + (hash + i) % 16;

    const types = ["Promoção relâmpago", "Erro tarifário", "Tarifa especial", "Oferta sazonal", "Último minuto"];

    results.push({
      airline,
      originCode,
      destCode,
      marketPrice: Math.max(market, promo + 200),
      promoPrice: Math.max(promo, 199),
      discount: discountPct,
      departDate: depart.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      returnDate: returnD.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      stops,
      seats: 2 + ((hash + i) % 8),
      type: types[(hash + i) % types.length],
      duration: `${hours}h${(hash + i * 13) % 60}min`,
    });
  }

  return results.sort((a, b) => a.promoPrice - b.promoPrice);
}

function AirportAutocomplete({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
  icon: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    return airports
      .filter(a =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query]);

  const selected = airports.find(a => a.code === value);

  return (
    <div className="flex-1 min-w-[220px]">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="relative">
        <div className="flex items-center gap-2 border border-border rounded-lg bg-card px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
          {icon}
          <input
            type="text"
            placeholder={selected ? `${selected.flag} ${selected.city} (${selected.code})` : placeholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); onChange(""); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
          />
          {selected && !query && (
            <button onClick={() => { onChange(""); setQuery(""); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {open && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto"
            >
              {filtered.map((airport) => (
                <button
                  key={airport.code}
                  onMouseDown={(e) => { e.preventDefault(); onChange(airport.code); setQuery(""); setOpen(false); }}
                  className="w-full text-left px-3 py-2.5 hover:bg-primary/5 transition-colors flex items-center gap-3 border-b border-border/50 last:border-0"
                >
                  <span className="text-lg">{airport.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{airport.city} ({airport.code})</p>
                    <p className="text-xs text-muted-foreground truncate">{airport.name} · {airport.country}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PromoResultCard({ result, index }: { result: PromoResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const savings = result.marketPrice - result.promoPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{result.airline}</p>
              <p className="text-xs text-muted-foreground">{result.originCode} → {result.destCode}</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-signal-green/10 text-signal-green">
            -{result.discount}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-muted-foreground line-through text-sm">R$ {result.marketPrice.toLocaleString("pt-BR")}</span>
            <span className="text-primary font-bold text-xl font-display">R$ {result.promoPrice.toLocaleString("pt-BR")}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{result.departDate} — {result.returnDate}</p>
            <p className="text-xs text-muted-foreground">{result.stops === 0 ? "Direto" : `${result.stops} parada${result.stops > 1 ? "s" : ""}`} · {result.duration}</p>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tipo</p>
                  <p className="font-medium text-foreground">{result.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Economia</p>
                  <p className="font-medium text-signal-green">R$ {savings.toLocaleString("pt-BR")} economizados</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Disponibilidade</p>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-signal-amber" />
                    <p className="font-medium text-signal-amber">{result.seats} assento{result.seats > 1 ? "s" : ""} restante{result.seats > 1 ? "s" : ""}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  💡 Esta tarifa foi detectada pela nossa IA e pode expirar a qualquer momento. Membros PromoCéu recebem alertas instantâneos antes da publicação.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 py-2 bg-muted/30 flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        {expanded ? "Menos detalhes" : "Ver detalhes"}
      </div>
    </motion.div>
  );
}

export default function FlightSearchSection() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<PromoResult[] | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!origin || !destination) return;
    setSearching(true);
    setResults(null);
    // Simulate AI search delay
    setTimeout(() => {
      setResults(generatePromos(origin, destination, date));
      setSearching(false);
    }, 1800);
  };

  const originAirport = airports.find(a => a.code === origin);
  const destAirport = airports.find(a => a.code === destination);
  const totalSavings = results ? results.reduce((sum, r) => sum + (r.marketPrice - r.promoPrice), 0) / results.length : 0;

  return (
    <section id="simulador" className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Simulador inteligente</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Descubra promoções para o seu destino
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Nossa inteligência artificial monitora milhares de tarifas em tempo real. Insira sua rota e veja as melhores oportunidades detectadas — com descontos que chegam a 70% em relação ao preço de mercado.
            </p>
          </div>
        </ScrollReveal>

        {/* Search form */}
        <ScrollReveal delay={0.1}>
          <div className="glass-card-highlight p-6 sm:p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <AirportAutocomplete
                label="Origem"
                value={origin}
                onChange={setOrigin}
                placeholder="De onde você sai?"
                icon={<MapPin className="w-4 h-4 text-primary flex-shrink-0" />}
              />
              <div className="hidden lg:flex items-end pb-3">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
              <AirportAutocomplete
                label="Destino"
                value={destination}
                onChange={setDestination}
                placeholder="Para onde quer ir?"
                icon={<Plane className="w-4 h-4 text-primary flex-shrink-0" />}
              />
              <div className="min-w-[180px]">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Data aproximada</label>
                <div className="flex items-center gap-2 border border-border rounded-lg bg-card px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent outline-none text-sm text-foreground w-full"
                  />
                </div>
              </div>
            </div>
            <motion.button
              onClick={handleSearch}
              disabled={!origin || !destination || searching}
              className="glow-button w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {searching ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Buscando promoções com IA...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Buscar promoções
                </>
              )}
            </motion.button>
          </div>
        </ScrollReveal>

        {/* Results */}
        <AnimatePresence mode="wait">
          {searching && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full mx-auto mb-4"
                style={{ borderWidth: 3 }}
              />
              <p className="text-muted-foreground text-sm">Analisando tarifas em tempo real...</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Comparando preços de {originAirport?.city} para {destAirport?.city}</p>
            </motion.div>
          )}

          {results && !searching && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Summary banner */}
              <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-signal-green/10 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-signal-green" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{results.length} promoções encontradas</p>
                    <p className="text-xs text-muted-foreground">{originAirport?.city} ({origin}) → {destAirport?.city} ({destination})</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-signal-green/10 rounded-full px-4 py-2">
                  <Clock className="w-4 h-4 text-signal-green" />
                  <span className="text-sm font-semibold text-signal-green">Economia média de R$ {Math.round(totalSavings).toLocaleString("pt-BR")}</span>
                </div>
              </div>

              {/* Result cards */}
              <div className="grid gap-4">
                {results.map((result, i) => (
                  <PromoResultCard key={i} result={result} index={i} />
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8 text-center">
                <p className="text-muted-foreground text-sm mb-4">
                  ⚡ Essas tarifas são detectadas pela nossa IA e podem expirar em minutos. Assine o PromoCéu para receber alertas em tempo real.
                </p>
                <motion.a
                  href="#planos"
                  className="glow-button inline-flex items-center gap-2 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plane className="w-4 h-4" />
                  Quero receber alertas instantâneos
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
