import { motion } from "framer-motion";

export default function PromoCeuLogo({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Outer ring — clean corporate */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, hsl(217 91% 60% / 0.4), hsl(220 14% 20% / 0.1), hsl(45 70% 58% / 0.3), hsl(217 91% 60% / 0.4))",
        }}
      />

      {/* Inner circle */}
      <div
        className="absolute rounded-full"
        style={{
          inset: 2,
          background: "hsl(220, 16%, 7%)",
        }}
      />

      {/* SVG logo — refined airplane */}
      <svg
        viewBox="0 0 100 100"
        className="relative z-10"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <defs>
          <linearGradient id="corpLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(217, 91%, 65%)" />
            <stop offset="60%" stopColor="hsl(217, 91%, 55%)" />
            <stop offset="100%" stopColor="hsl(45, 70%, 62%)" />
          </linearGradient>
          <filter id="corpLogoGlow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#corpLogoGlow)">
          {/* Streamlined aircraft silhouette */}
          <path
            d="M 50 15 L 55 30 L 75 45 L 55 42 L 53 60 L 62 72 L 53 68 L 50 80 L 47 68 L 38 72 L 47 60 L 45 42 L 25 45 L 45 30 Z"
            fill="url(#corpLogoGrad)"
            stroke="none"
          />
        </g>

        {/* Orbit arc */}
        <ellipse
          cx="50" cy="50" rx="40" ry="14"
          fill="none"
          stroke="url(#corpLogoGrad)"
          strokeWidth="0.8"
          opacity="0.2"
          transform="rotate(-25 50 50)"
        />
      </svg>

      {/* Subtle pulse */}
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/20"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.div>
  );
}
