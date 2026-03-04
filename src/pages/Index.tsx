import UrgencyBar from "@/components/landing/UrgencyBar";
import SocialProofNotifications from "@/components/landing/SocialProofNotifications";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowPromoCeuWorksSection from "@/components/landing/HowPromoCeuWorksSection";
import TechnologySection from "@/components/landing/TechnologySection";
import NumbersSection from "@/components/landing/NumbersSection";
import PriceDropChartSection from "@/components/landing/PriceDropChartSection";
import SavingsCounterSection from "@/components/landing/SavingsCounterSection";
import MidCTASection from "@/components/landing/MidCTASection";
import ProofSection from "@/components/landing/ProofSection";
import FlightBoardSection from "@/components/landing/FlightBoardSection";
import GlobalMapSection from "@/components/landing/GlobalMapSection";
import BrazilStatesSection from "@/components/landing/BrazilStatesSection";
import AirlinePartnersSection from "@/components/landing/AirlinePartnersSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import PlansSection from "@/components/landing/PlansSection";
import GuaranteeSection from "@/components/landing/GuaranteeSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import HolographicParticles from "@/components/landing/HolographicParticles";
import PromoCeuLogo from "@/components/landing/PromoCeuLogo";

const Index = () => {
  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      <HolographicParticles count={15} />
      <UrgencyBar />
      <SocialProofNotifications />
      <Navbar />
      <HeroSection />

      {/* Como funciona (unified Pain + Mechanism) */}
      <HowPromoCeuWorksSection />
      <TechnologySection />

      {/* Números + Dados */}
      <NumbersSection />
      <PriceDropChartSection />
      <SavingsCounterSection />

      {/* CTA intermediário */}
      <MidCTASection />

      {/* Destinos + Rotas */}
      <ProofSection />
      <FlightBoardSection />
      <GlobalMapSection />
      <BrazilStatesSection />

      {/* Companhias + Depoimentos */}
      <AirlinePartnersSection />
      <TestimonialsSection />

      {/* Como funciona + Comparativo */}
      <HowItWorksSection />
      <ComparisonSection />

      {/* Conversão */}
      <PlansSection />
      <GuaranteeSection />
      <FAQSection />
      <FinalCTASection />

      {/* Footer */}
      <footer className="py-12 px-4" style={{ borderTop: "1px solid hsl(193 76% 38% / 0.15)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <PromoCeuLogo size={28} />
                <span className="font-display font-bold text-foreground">PromoCéu</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Plataforma de inteligência de mercado para passagens aéreas. Monitoramento 24/7, alertas em tempo real e compra direta na companhia.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-4 text-sm text-foreground">Navegação</h4>
              <div className="space-y-2">
                {[
                  { label: "Como funciona", href: "#como-funciona" },
                  { label: "Tecnologia", href: "#tecnologia" },
                  { label: "Destinos", href: "#destinos" },
                  { label: "Depoimentos", href: "#depoimentos" },
                  { label: "Planos", href: "#planos" },
                  { label: "FAQ", href: "#faq" },
                ].map((link) => (
                  <a key={link.label} href={link.href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-4 text-sm text-foreground">Informações</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>contato@promoceu.com.br</p>
                <p>CNPJ: 00.000.000/0001-00</p>
                <p>São Paulo, SP — Brasil</p>
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid hsl(193 76% 38% / 0.1)" }}>
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} PromoCéu. Todos os direitos reservados.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
