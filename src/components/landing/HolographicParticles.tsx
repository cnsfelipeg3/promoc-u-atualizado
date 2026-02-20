import { motion } from "framer-motion";
import { useMemo } from "react";

export default function HolographicParticles({ count = 12 }: { count?: number }) {
  const particles = useMemo(() => {
    const colors = [
      "hsl(217, 80%, 46%)",
      "hsl(217, 80%, 60%)",
      "hsl(28, 80%, 52%)",
    ];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: 0.12,
          }}
          animate={{
            y: [0, -30, -60, -30, 0],
            opacity: [0, 0.15, 0.08, 0.12, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
