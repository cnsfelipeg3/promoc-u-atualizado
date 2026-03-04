import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const notifications = [
  "👤 Mariana de São Paulo acabou de assinar",
  "👤 Carlos do Rio de Janeiro acabou de assinar",
  "✈️ Pedro economizou R$ 1.200 em uma passagem para Orlando",
  "👤 Fernanda de Belo Horizonte acabou de assinar",
  "✈️ Lucas economizou R$ 2.400 em uma passagem para Paris",
  "👤 Julia de Curitiba acabou de assinar",
  "👤 Thiago de Porto Alegre acabou de assinar",
  "✈️ Amanda economizou R$ 890 em uma passagem para Buenos Aires",
  "👤 Rafael de Salvador acabou de assinar",
  "👤 Beatriz de Brasília acabou de assinar",
  "✈️ Diego economizou R$ 3.100 em uma passagem para Tóquio",
  "👤 Camila de Recife acabou de assinar",
  "👤 André de Florianópolis acabou de assinar",
  "✈️ Priscila economizou R$ 1.800 em uma passagem para Lisboa",
  "👤 Roberto de Fortaleza acabou de assinar",
];

export default function SocialProofNotifications() {
  const [current, setCurrent] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  const showNext = useCallback(() => {
    setCurrent(notifications[idx % notifications.length]);
    setIdx((p) => p + 1);
    setTimeout(() => setCurrent(null), 4000);
  }, [idx]);

  useEffect(() => {
    const delay = 25000 + Math.random() * 20000;
    const timer = setTimeout(showNext, delay);
    return () => clearTimeout(timer);
  }, [idx, showNext]);

  // Show first one after 8 seconds
  useEffect(() => {
    const initial = setTimeout(showNext, 8000);
    return () => clearTimeout(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="max-w-sm px-4 py-3 rounded-xl text-sm text-foreground"
            style={{
              background: "hsl(199 60% 12% / 0.8)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid hsl(193 76% 38% / 0.3)",
              boxShadow: "0 0 20px hsl(193 76% 38% / 0.1)",
            }}
          >
            {current}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
