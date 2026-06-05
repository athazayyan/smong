import { Navbar } from "@/components/marketing/Navbar";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { ModuleTeaserSection } from "@/components/marketing/ModuleTeaserSection";
import { ModulePreviewSection } from "@/components/marketing/ModulePreviewSection";
import { MascotIntroSection } from "@/components/marketing/MascotIntroSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { TrustSafetyNote } from "@/components/marketing/TrustSafetyNote";
import { CTASection } from "@/components/marketing/CTASection";
import { Footer } from "@/components/marketing/Footer";
import { LandingPreloader } from "@/components/marketing/LandingPreloader";

export default function Home() {
  return (
    <>
      <LandingPreloader />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ModuleTeaserSection />
        <ModulePreviewSection />
        <MascotIntroSection />
        <TestimonialsSection />
        <TrustSafetyNote />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
