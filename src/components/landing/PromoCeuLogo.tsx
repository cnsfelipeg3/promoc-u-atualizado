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
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, hsl(142 72% 46% / 0.3), hsl(199 89% 48% / 0.2), hsl(38 92% 55% / 0.3), hsl(142 72% 46% / 0.3))",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner circle */}
      <div
        className="absolute rounded-full"
        style={{
          inset: 3,
          background: "hsl(222, 47%, 6%)",
        }}
      />

      {/* SVG logo */}
      <svg
        viewBox="0 0 100 100"
        className="relative z-10"
        style={{ width: size * 0.65, height: size * 0.65 }}
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(142, 72%, 50%)" />
            <stop offset="50%" stopColor="hsl(199, 89%, 55%)" />
            <stop offset="100%" stopColor="hsl(38, 92%, 60%)" />
          </linearGradient>
          <filter id="logoGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Airplane body */}
        <g filter="url(#logoGlow)">
          {/* Main fuselage as arrow/plane pointing up-right */}
          <path
            d="M 25 75 L 50 20 L 55 25 L 38 68 L 65 55 L 55 25 L 60 20 L 80 50 L 60 65 L 38 72 Z"
            fill="url(#logoGrad)"
            stroke="none"
          />
          {/* Tail wing */}
          <path
            d="M 25 75 L 20 60 L 35 65 Z"
            fill="url(#logoGrad)"
            opacity="0.8"
          />
          {/* Contrail dots */}
          <circle cx="18" cy="78" r="2" fill="hsl(142, 72%, 50%)" opacity="0.5" />
          <circle cx="13" cy="82" r="1.5" fill="hsl(142, 72%, 50%)" opacity="0.3" />
          <circle cx="9" cy="85" r="1" fill="hsl(142, 72%, 50%)" opacity="0.15" />
        </g>

        {/* Orbit ring */}
        <ellipse
          cx="50" cy="50" rx="42" ry="16"
          fill="none"
          stroke="url(#logoGrad)"
          strokeWidth="1"
          opacity="0.3"
          transform="rotate(-30 50 50)"
        />
      </svg>

      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/30"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}
