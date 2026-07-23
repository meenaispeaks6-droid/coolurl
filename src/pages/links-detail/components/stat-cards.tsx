import { IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDataProvider } from "@/lib/data-provider";

interface StatCardsProps {
  linkId: string;
}

export function StatCards({ linkId }: StatCardsProps) {
  const { useLinkStats } = useDataProvider();
  const { data: stats } = useLinkStats(linkId);

  const deltaDisplay = (() => {
    if (stats.wowDelta === null) return { label: "—", color: "text-muted-foreground" };
    if (stats.wowDelta >= 0)
      return {
        label: (
          <span className="flex items-center gap-0.5">
            <IconArrowUp className="size-4" />
            +{stats.wowDelta}%
          </span>
        ),
        color: "text-green-600",
      };
    return {
      label: (
        <span className="flex items-center gap-0.5">
          <IconArrowDown className="size-4" />
          {stats.wowDelta}%
        </span>
      ),
      color: "text-red-600",
    };
  })();

  const items = [
    {
      label: "Total clicks",
      value: stats.totalClicks.toLocaleString(),
      extra: null,
    },
    {
      label: "Last 7 days",
      value: stats.last7Days.toLocaleString(),
      extra: null,
    },
    {
      label: "vs. prev week",
      value: deltaDisplay.label,
      extra: deltaDisplay.color,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className={`mt-1 text-2xl font-semibold tabular-nums ${item.extra ?? ""}`}>
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
