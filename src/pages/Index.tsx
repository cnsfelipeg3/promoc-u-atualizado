import HeroSection from "@/components/landing/HeroSection";
import PainSection from "@/components/landing/PainSection";
import MechanismSection from "@/components/landing/MechanismSection";
import ProofSection from "@/components/landing/ProofSection";
import PriceDropChartSection from "@/components/landing/PriceDropChartSection";
import FlightBoardSection from "@/components/landing/FlightBoardSection";
import GlobalMapSection from "@/components/landing/GlobalMapSection";
import SavingsCounterSection from "@/components/landing/SavingsCounterSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import InspirationSection from "@/components/landing/InspirationSection";
import PlansSection from "@/components/landing/PlansSection";
import GuaranteeSection from "@/components/landing/GuaranteeSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import BrazilStatesSection from "@/components/landing/BrazilStatesSection";
import HolographicParticles from "@/components/landing/HolographicParticles";
import PromoCeuLogo from "@/components/landing/PromoCeuLogo";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HolographicParticles count={12} />
      <HeroSection />
      <PainSection />
      <MechanismSection />
      <PriceDropChartSection />
      <ProofSection />
      <SavingsCounterSection />
      <FlightBoardSection />
      <GlobalMapSection />
      <BrazilStatesSection />
      <HowItWorksSection />
      <InspirationSection />
      <PlansSection />
      <GuaranteeSection />
      <FAQSection />
      <FinalCTASection />

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PromoCeuLogo size={32} />
            <span className="font-display font-semibold text-foreground">PromoCéu</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} PromoCéu. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
