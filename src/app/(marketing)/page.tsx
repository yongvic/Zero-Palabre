import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/layout/hero-section";
import { InteractiveFeatures } from "@/components/layout/interactive-features";
import { FinalCta } from "@/components/layout/final-cta";
import { PricingFaq } from "@/components/layout/pricing-faq";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-hidden">
        <HeroSection />
        <InteractiveFeatures />
        <PricingFaq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
