import HeroSection from "@/components/landing/HeroSection";
import PainSection from "@/components/landing/PainSection";
import MechanismSection from "@/components/landing/MechanismSection";
import ProofSection from "@/components/landing/ProofSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PlansSection from "@/components/landing/PlansSection";
import GuaranteeSection from "@/components/landing/GuaranteeSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import logo from "@/assets/logo-promoceu.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection />
      <PainSection />
      <MechanismSection />
      <ProofSection />
      <HowItWorksSection />
      <PlansSection />
      <GuaranteeSection />
      <FAQSection />
      <FinalCTASection />

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="PromoCéu" className="w-8 h-8 invert opacity-70" />
            <span className="font-display font-semibold text-muted-foreground">PromoCéu</span>
          </div>
          <p className="text-muted-foreground/50 text-sm">
            © {new Date().getFullYear()} PromoCéu. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
