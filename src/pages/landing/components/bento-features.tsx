import {
  IconLink,
  IconCopy,
  IconChartBar,
  IconDeviceMobile,
} from "@tabler/icons-react";
import type { ElementType } from "react";
import { useBentoFeatures } from "@/lib/data-provider";

const ICON_MAP: Record<string, ElementType> = {
  Link2: IconLink,
  Copy: IconCopy,
  BarChart2: IconChartBar,
  Smartphone: IconDeviceMobile,
};

export function BentoFeatures() {
  const bentoFeatures = useBentoFeatures();
  return (
    <section id="features" className="landing py-24">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">
            Why Link Shortener
          </p>
          <h2 className="mt-2 text-balance">
            Everything you need, nothing you don't
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bentoFeatures.map((feature) => {
            const Icon = ICON_MAP[feature.icon] ?? IconLink;
            return (
              <div key={feature.title} className="rounded-lg border border-border p-6">
                <Icon className="size-5 text-primary" />
                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
