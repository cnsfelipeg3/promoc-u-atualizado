import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FlightSearchSection from "@/components/landing/FlightSearchSection";
import PainSection from "@/components/landing/PainSection";
import MechanismSection from "@/components/landing/MechanismSection";
import TechnologySection from "@/components/landing/TechnologySection";
import ProofSection from "@/components/landing/ProofSection";
import PriceDropChartSection from "@/components/landing/PriceDropChartSection";
import FlightBoardSection from "@/components/landing/FlightBoardSection";
import GlobalMapSection from "@/components/landing/GlobalMapSection";
import SavingsCounterSection from "@/components/landing/SavingsCounterSection";
import NumbersSection from "@/components/landing/NumbersSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import AirlinePartnersSection from "@/components/landing/AirlinePartnersSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import TravelTipsSection from "@/components/landing/TravelTipsSection";
import MidCTASection from "@/components/landing/MidCTASection";
import InspirationSection from "@/components/landing/InspirationSection";
import PlansSection from "@/components/landing/PlansSection";
import GuaranteeSection from "@/components/landing/GuaranteeSection";
import BrazilStatesSection from "@/components/landing/BrazilStatesSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import HolographicParticles from "@/components/landing/HolographicParticles";
import PromoCeuLogo from "@/components/landing/PromoCeuLogo";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HolographicParticles count={8} />
      <Navbar />
      <HeroSection />
      
      {/* Simulador de passagens */}
      <FlightSearchSection />

      {/* Bloco 1: Problema + Solução */}
      <PainSection />
      <MechanismSection />
      <TechnologySection />
      
      {/* Bloco 2: Prova social + Dados */}
      <NumbersSection />
      <PriceDropChartSection />
      <SavingsCounterSection />
      
      {/* CTA intermediário */}
      <MidCTASection />
      
      {/* Bloco 3: Destinos + Rotas */}
      <ProofSection />
      <FlightBoardSection />
      <GlobalMapSection />
      <BrazilStatesSection />
      
      {/* Bloco 4: Companhias + Depoimentos */}
      <AirlinePartnersSection />
      <TestimonialsSection />
      
      {/* Bloco 5: Como funciona + Comparativo */}
      <HowItWorksSection />
      <ComparisonSection />
      
      {/* Bloco 6: Conteúdo educativo */}
      <TravelTipsSection />
      <InspirationSection />
      
      {/* Bloco 7: Conversão */}
      <PlansSection />
      <GuaranteeSection />
      <FAQSection />
      <FinalCTASection />

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
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
              <h4 className="font-display font-semibold mb-4 text-sm">Navegação</h4>
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
              <h4 className="font-display font-semibold mb-4 text-sm">Informações</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>contato@promoceu.com.br</p>
                <p>CNPJ: 00.000.000/0001-00</p>
                <p>São Paulo, SP — Brasil</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
