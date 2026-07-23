import { Card, CardContent } from "@/components/ui/card";
import { useDataProvider } from "@/lib/data-provider";

export function StatRow() {
  const { useDashboardStats } = useDataProvider();
  const { data: stats } = useDashboardStats();

  const items = [
    { label: "Total links", value: stats.totalLinks },
    { label: "Total clicks", value: stats.totalClicks },
    { label: "Clicks today", value: stats.clicksToday },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {item.value.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
