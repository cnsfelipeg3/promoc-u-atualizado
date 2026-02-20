import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function FlipDigit({ digit, prev }: { digit: string; prev: string }) {
  const changed = digit !== prev;
  return (
    <span className="relative inline-block w-[1ch] text-center overflow-hidden">
      {changed ? (
        <motion.span
          key={digit}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-block"
        >
          {digit}
        </motion.span>
      ) : (
        <span>{digit}</span>
      )}
    </span>
  );
}

function AnalogCounter({ value, prevValue }: { value: string; prevValue: string }) {
  const maxLen = Math.max(value.length, prevValue.length);
  const padded = value.padStart(maxLen);
  const paddedPrev = prevValue.padStart(maxLen);

  return (
    <div className="flex items-baseline justify-center">
      <span className="text-muted-foreground text-2xl sm:text-3xl font-display mr-1">R$</span>
      <div className="font-mono font-bold text-4xl sm:text-5xl md:text-6xl text-foreground tabular-nums tracking-tight">
        {padded.split("").map((char, i) => (
          <FlipDigit key={i} digit={char} prev={paddedPrev[i] || " "} />
        ))}
      </div>
    </div>
  );
}

export default function SavingsCounterSection() {
  const BASE = 2000012.32;
  const [total, setTotal] = useState(BASE);
  const [prevFormatted, setPrevFormatted] = useState(formatBRL(BASE));

  useEffect(() => {
    const interval = setInterval(() => {
      setTotal((prev) => {
        setPrevFormatted(formatBRL(prev));
        const increment = 12 + Math.random() * 3;
        return prev + increment;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatted = formatBRL(total);

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="section-divider w-full absolute top-0" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.04) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="glass-card-highlight p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none">
              <div className="absolute top-0 left-0 w-px h-6 bg-gradient-to-b from-primary/40 to-transparent" />
              <div className="absolute top-0 left-0 h-px w-6 bg-gradient-to-r from-primary/40 to-transparent" />
            </div>
            <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none">
              <div className="absolute top-0 right-0 w-px h-6 bg-gradient-to-b from-primary/40 to-transparent" />
              <div className="absolute top-0 right-0 h-px w-6 bg-gradient-to-l from-primary/40 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 w-12 h-12 pointer-events-none">
              <div className="absolute bottom-0 left-0 w-px h-6 bg-gradient-to-t from-primary/40 to-transparent" />
              <div className="absolute bottom-0 left-0 h-px w-6 bg-gradient-to-r from-primary/40 to-transparent" />
            </div>
            <div className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none">
              <div className="absolute bottom-0 right-0 w-px h-6 bg-gradient-to-t from-primary/40 to-transparent" />
              <div className="absolute bottom-0 right-0 h-px w-6 bg-gradient-to-l from-primary/40 to-transparent" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <TrendingUp className="w-6 h-6 text-primary" />
              </motion.div>
              <p className="text-primary font-semibold text-sm uppercase tracking-widest font-mono">
                Total gerado em economias
              </p>
            </div>

            <AnalogCounter value={formatted} prevValue={prevFormatted} />

            <div className="mt-6 flex items-center justify-center gap-2">
              <motion.span
                className="w-2 h-2 rounded-full bg-primary"
                animate={{
                  boxShadow: [
                    "0 0 0px hsl(var(--primary) / 0)",
                    "0 0 8px hsl(var(--primary) / 0.5)",
                    "0 0 0px hsl(var(--primary) / 0)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                Atualizando ao vivo
              </span>
            </div>

            <p className="text-muted-foreground text-sm mt-4 max-w-md mx-auto">
              Valor total economizado pelos membros da PromoCéu desde o lançamento da plataforma.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
