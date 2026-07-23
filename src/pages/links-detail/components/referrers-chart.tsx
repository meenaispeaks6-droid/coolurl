import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataProvider } from "@/lib/data-provider";

interface ReferrersChartProps {
  linkId: string;
}

const chartConfig: ChartConfig = {
  count: {
    label: "Clicks",
    color: "oklch(0.685 0.169 237.323)",
  },
};

export function ReferrersChart({ linkId }: ReferrersChartProps) {
  const { useReferrerBreakdown } = useDataProvider();
  const { data } = useReferrerBreakdown(linkId);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top referrers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No data yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top referrers</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 4, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="referrer"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={100}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => {
                    const pct = item.payload.pct;
                    return `${value} (${pct}%)`;
                  }}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
