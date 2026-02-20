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
      {/* Circle bg */}
      <div
        className="absolute inset-0 rounded-full bg-primary"
        style={{ opacity: 0.08 }}
      />

      {/* SVG */}
      <svg
        viewBox="0 0 100 100"
        className="relative z-10"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <defs>
          <linearGradient id="corpLogo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(217, 80%, 46%)" />
            <stop offset="100%" stopColor="hsl(28, 80%, 52%)" />
          </linearGradient>
        </defs>

        <g>
          <path
            d="M 50 15 L 55 30 L 75 45 L 55 42 L 53 60 L 62 72 L 53 68 L 50 80 L 47 68 L 38 72 L 47 60 L 45 42 L 25 45 L 45 30 Z"
            fill="url(#corpLogo)"
          />
        </g>

        <ellipse
          cx="50" cy="50" rx="40" ry="14"
          fill="none"
          stroke="url(#corpLogo)"
          strokeWidth="0.8"
          opacity="0.2"
          transform="rotate(-25 50 50)"
        />
      </svg>
    </motion.div>
  );
}
