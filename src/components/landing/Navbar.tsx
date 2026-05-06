import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import logoWhite from "@/assets/logo-promoceu-branco.png";

/* Itens de menu desabilitados em 2026-05-06 — manter para futura reativação
const navLinks = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Tecnologia", href: "#tecnologia" },
  {
    label: "Destinos",
    href: "#destinos",
    sub: [
      { label: "Internacionais", href: "#destinos" },
      { label: "Nacionais", href: "#brasil" },
      { label: "Radar ao vivo", href: "#price-charts" },
    ],
  },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Planos", href: "#planos" },
  { label: "FAQ", href: "#faq" },
];
*/

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed left-0 right-0 z-50 transition-all duration-300"
      style={{ top: "36px" }}
    >
      <div className={`transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5 group">
            <img
              src={logoWhite}
              alt="PromoCéu"
              className={`h-8 w-auto ${isDark ? "" : "brightness-0"}`}
            />
          </a>

          <a href="#planos" className="glow-button text-sm !px-5 !py-2.5 flex items-center gap-2">
            <Plane className="w-4 h-4" />
            Assinar agora
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
