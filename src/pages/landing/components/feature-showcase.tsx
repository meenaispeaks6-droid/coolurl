import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFeatureTabs } from "@/lib/data-provider";
import { ShortenMockup, CustomizeMockup, AnalyzeMockup } from "./showcase-mockups";

const DEMO_DOMAIN = "link-shortner-template.lovable.app";

const MOCKUPS: Record<string, React.ReactNode> = {
  shorten: <ShortenMockup />,
  customize: <CustomizeMockup />,
  analyze: <AnalyzeMockup />,
};

export function FeatureShowcase() {
  const featureTabs = useFeatureTabs();
  const [activeTab, setActiveTab] = useState("shorten");

  return (
    <section id="how-it-works" className="landing py-24">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">How it works</p>
          <h2 className="mt-2 text-balance">
            Three steps to every short link
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <nav
            className="flex flex-wrap items-center justify-center gap-2 mb-8"
            aria-label="Feature tabs"
          >
            {featureTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {featureTabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(activeTab === tab.id ? "block" : "hidden")}
            >
              <p className="mb-6 text-center text-muted-foreground">
                {tab.description}
              </p>
              <figure className="relative overflow-hidden rounded-xl border border-border shadow-lg">
                <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="size-3 rounded-full bg-border" />
                    <span className="size-3 rounded-full bg-border" />
                    <span className="size-3 rounded-full bg-border" />
                  </div>
                  <div className="mx-auto rounded-md bg-background px-4 py-1 text-xs text-muted-foreground">
                    {DEMO_DOMAIN}/dashboard
                  </div>
                </div>
                <div className="bg-card">
                  {MOCKUPS[tab.id]}
                </div>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
