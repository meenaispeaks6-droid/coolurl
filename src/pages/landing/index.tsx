import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { FeatureShowcase } from "./components/feature-showcase-01";
import { Testimonial01 } from "./components/testimonial-01";
import { Cta03 } from "./components/cta-03";
import { Footer } from "./components/footer";
import { ShortenMockup, CustomizeMockup, AnalyzeMockup } from "./components/showcase-mockups";
import { useFeatureTabs } from "@/lib/data-provider";
import { quoteTestimonials } from "@/data/landing";

const MOCKUPS: Record<string, React.ReactNode> = {
  shorten: <ShortenMockup />,
  customize: <CustomizeMockup />,
  analyze: <AnalyzeMockup />,
};

export default function Landing() {
  const featureTabs = useFeatureTabs();
  const features = featureTabs.map((t) => ({
    key: t.id,
    label: t.label,
    heading: t.description,
    mockup: MOCKUPS[t.id],
  }));

  return (
    <>
      <Header />
      <Hero />

      <section id="how-it-works">
        <FeatureShowcase features={features} />
      </section>

      <section id="testimonials" className="bg-muted/40 py-24">
        <div className="mx-auto max-w-page px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center landing">
            <p className="text-sm font-semibold text-primary">Testimonials</p>
            <h2 className="mt-2 text-balance">
              Teams that ship faster with LinkShort
            </h2>
          </div>
          <Testimonial01 testimonials={quoteTestimonials} />
        </div>
      </section>

      <Cta03
        heading="Your links. Your data. No bloat."
        subtitle="Ship faster with links that actually tell you what happened after the click."
        primaryCta={{ label: "Get started free", href: "/auth?intent=signup" }}
        secondaryCta={{ label: "Sign in", href: "/auth?intent=signin" }}
      />

      <Footer />
    </>
  );
}
