import ScrollReveal from "@/components/ScrollReveal";
import { Plane } from "lucide-react";

const airlines = [
  { name: "LATAM Airlines", code: "LA" },
  { name: "GOL", code: "G3" },
  { name: "Azul", code: "AD" },
  { name: "American Airlines", code: "AA" },
  { name: "Iberia", code: "IB" },
  { name: "TAP", code: "TP" },
  { name: "Emirates", code: "EK" },
  { name: "Air France", code: "AF" },
  { name: "Copa Airlines", code: "CM" },
  { name: "United Airlines", code: "UA" },
  { name: "British Airways", code: "BA" },
  { name: "KLM", code: "KL" },
  { name: "Lufthansa", code: "LH" },
];

function LogoMarquee({ reverse = false }: { reverse?: boolean }) {
  const doubled = [...airlines, ...airlines];
  return (
    <div className="marquee-fade overflow-hidden py-6">
      <div className={reverse ? "marquee-track-reverse" : "marquee-track"} style={{ gap: "3rem" }}>
        {doubled.map((a, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <img
              src={`https://images.kiwi.com/airlines/64/${a.code}.png`}
              alt={a.name}
              className="h-8 sm:h-10 object-contain brightness-0 invert opacity-60 hover:opacity-100 transition-opacity"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <span className="text-foreground/30 text-sm font-medium tracking-wider uppercase whitespace-nowrap hidden sm:inline">
              {a.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AirlinePartnersSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-primary" />
            <p className="text-primary font-semibold text-sm uppercase tracking-widest">Companhias monitoradas</p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            50+ companhias aéreas <span className="text-gradient-primary">sob radar</span>
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Monitoramos as principais companhias aéreas do mundo em tempo real.
          </p>
        </ScrollReveal>

        <LogoMarquee />
        <LogoMarquee reverse />
      </div>
    </section>
  );
}
