import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataProvider } from "@/lib/data-provider";

interface DeviceChartProps {
  linkId: string;
}

const DEVICE_COLORS: Record<string, string> = {
  mobile: "oklch(0.685 0.169 237.323)",
  desktop: "oklch(0.808 0.111 237.323)",
  tablet: "oklch(0.917 0.058 237.323)",
};

function buildChartConfig(data: { device: string }[]): ChartConfig {
  const config: ChartConfig = {};
  for (const row of data) {
    const key = row.device.toLowerCase();
    config[key] = {
      label: row.device.charAt(0).toUpperCase() + row.device.slice(1),
      color: DEVICE_COLORS[key] ?? "oklch(0.685 0.169 237.323)",
    };
  }
  return config;
}

export function DeviceChart({ linkId }: DeviceChartProps) {
  const { useDeviceBreakdown } = useDataProvider();
  const { data } = useDeviceBreakdown(linkId);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Device breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No data yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    name: d.device.toLowerCase(),
    fill: DEVICE_COLORS[d.device.toLowerCase()] ?? DEVICE_COLORS.mobile,
  }));

  const chartConfig = buildChartConfig(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Device breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto h-[200px] w-full">
          <PieChart>
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
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
