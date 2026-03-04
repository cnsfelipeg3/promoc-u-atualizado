import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "🔴 3 promoções ativas agora no grupo — última atualização há 4 minutos",
  "✈️ Última promoção enviada: São Paulo → Lisboa por R$ 1.890",
  "⚡ Grupo ativo agora — nova promoção pode chegar a qualquer momento",
];

export default function UrgencyBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-9 flex items-center justify-center overflow-hidden bg-primary/90 backdrop-blur-md border-b border-primary/30">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="text-primary-foreground text-xs sm:text-sm font-medium tracking-wide text-center px-4"
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
