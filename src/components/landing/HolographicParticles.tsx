import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

export default function HolographicParticles({ count = 20 }: { count?: number }) {
  const particles = useMemo<Particle[]>(() => {
    const colors = [
      "hsl(217, 91%, 60%)",
      "hsl(217, 91%, 70%)",
      "hsl(45, 70%, 58%)",
      "hsl(220, 14%, 50%)",
    ];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
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
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -40, -80, -40, 0],
            x: [0, 15, -8, 10, 0],
            opacity: [0, 0.4, 0.2, 0.5, 0],
            scale: [0.5, 1, 0.7, 0.9, 0.5],
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
