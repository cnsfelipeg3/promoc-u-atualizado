import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Plane } from "lucide-react";
import logoWhite from "@/assets/logo-promoceu-branco.png";

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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
      className={`fixed left-0 right-0 z-50 transition-all duration-300`}
      style={{ top: "36px" }}
    >
      <div className={`transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border/50"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5 group">
            <img src={logoWhite} alt="PromoCéu" className="h-8 w-auto" />
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.sub && setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <a
                  href={link.href}
                  className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                >
                  {link.label}
                  {link.sub && <ChevronDown className="w-3.5 h-3.5" />}
                </a>
                <AnimatePresence>
                  {link.sub && openDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-48 rounded-xl shadow-lg overflow-hidden"
                      style={{
                        background: "hsl(199 60% 12% / 0.9)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid hsl(193 76% 38% / 0.15)",
                      }}
                    >
                      {link.sub.map((sub) => (
                        <a
                          key={sub.label}
                          href={sub.href}
                          className="block px-4 py-2.5 text-sm text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a href="#planos" className="glow-button text-sm !px-5 !py-2.5 flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Assinar agora
            </a>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-foreground">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden"
            style={{
              background: "hsl(199 60% 10% / 0.95)",
              backdropFilter: "blur(16px)",
              borderBottom: "1px solid hsl(193 76% 38% / 0.15)",
            }}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <a href={link.href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                    {link.label}
                  </a>
                  {link.sub && (
                    <div className="pl-6">
                      {link.sub.map((sub) => (
                        <a key={sub.label} href={sub.href} onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <a href="#planos" onClick={() => setMobileOpen(false)} className="block glow-button text-sm text-center mt-4">
                Assinar agora
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
