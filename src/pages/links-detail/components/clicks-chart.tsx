import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDataProvider } from "@/lib/data-provider";
import { useFilters } from "@/lib/filter-context";

interface ClicksChartProps {
  linkId: string;
}

const chartConfig: ChartConfig = {
  clicks: {
    label: "Clicks",
    color: "oklch(0.685 0.169 237.323)",
  },
};

export function ClicksChart({ linkId }: ClicksChartProps) {
  const { filters, setTimeSeriesFilters } = useFilters();
  const { useClicksTimeSeries } = useDataProvider();
  const { data } = useClicksTimeSeries(linkId, filters.timeSeries);

  const hasData = data.some((d) => d.clicks > 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Clicks over time</CardTitle>
        <ToggleGroup
          type="single"
          value={filters.timeSeries.range}
          onValueChange={(value) => {
            if (value) setTimeSeriesFilters({ range: value as "7d" | "30d" });
          }}
          className="gap-1"
        >
          <ToggleGroupItem value="7d" className="h-8 px-3 text-sm">
            Last 7 days
          </ToggleGroupItem>
          <ToggleGroupItem value="30d" className="h-8 px-3 text-sm">
            Last 30 days
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No clicks yet. Share your link to start tracking.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-clicks)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--color-clicks)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(val: string) => {
                  const d = new Date(val + "T00:00:00");
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(val: string) => {
                      const d = new Date(val + "T00:00:00");
                      return d.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                  />
                }
              />
              <Area
                dataKey="clicks"
                type="monotone"
                stroke="var(--color-clicks)"
                strokeWidth={2}
                fill="url(#clicksFill)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
