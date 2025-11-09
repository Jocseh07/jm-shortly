"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { Smartphone, Monitor, Tablet, HelpCircle } from "lucide-react";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-1)",
    icon: Smartphone,
  },
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
    icon: Monitor,
  },
  tablet: {
    label: "Tablet",
    color: "var(--chart-3)",
    icon: Tablet,
  },
  unknown: {
    label: "Unknown",
    color: "var(--chart-4)",
    icon: HelpCircle,
  },
} satisfies ChartConfig;

export function DeviceBreakdown({
  breakdown,
}: {
  breakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
    unknown: number;
  };
}) {
  const id = "device-breakdown";
  const data = [
    { device: "mobile", visitors: breakdown.mobile, fill: "var(--color-mobile)" },
    { device: "desktop", visitors: breakdown.desktop, fill: "var(--color-desktop)" },
    { device: "tablet", visitors: breakdown.tablet, fill: "var(--color-tablet)" },
    { device: "unknown", visitors: breakdown.unknown, fill: "var(--color-unknown)" },
  ].filter((item) => item.visitors > 0);

  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  const [activeDevice, setActiveDevice] = React.useState<string | null>(
    data.length > 0 ? data[0].device : null
  );

  React.useEffect(() => {
    if (data.length > 0) {
      const currentDeviceExists = data.some((item) => item.device === activeDevice);
      if (!currentDeviceExists) {
        setActiveDevice(data[0].device);
      }
    } else {
      setActiveDevice(null);
    }
  }, [data, activeDevice]);

  const activeIndex = React.useMemo(
    () => data.findIndex((item) => item.device === activeDevice),
    [activeDevice, data]
  );

  const devices = React.useMemo(() => data.map((item) => item.device), [data]);

  if (total === 0) {
    return (
      <Card data-chart={id} className="flex flex-col">
        <ChartStyle id={id} config={chartConfig} />
        <CardHeader className="flex-row items-start space-y-0 pb-0">
          <div className="grid gap-1">
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Click distribution by device type</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No device data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Device Breakdown</CardTitle>
          <CardDescription>Click distribution by device type</CardDescription>
        </div>
        {activeDevice && (
          <Select value={activeDevice} onValueChange={setActiveDevice}>
            <SelectTrigger
              className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
              aria-label="Select a device"
            >
              <SelectValue placeholder="Select device" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {devices.map((key) => {
                const config = chartConfig[key as keyof typeof chartConfig];
                if (!config) {
                  return null;
                }
                return (
                  <SelectItem
                    key={key}
                    value={key}
                    className="rounded-lg [&_span]:flex"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="flex h-3 w-3 shrink-0 rounded-xs"
                        style={{
                          backgroundColor: `var(--color-${key})`,
                        }}
                      />
                      {config?.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="visitors"
              nameKey="device"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex >= 0 ? activeIndex : undefined}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              {activeDevice && activeIndex >= 0 && (
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const activeData = data[activeIndex];
                      const percentage = total > 0 
                        ? ((activeData.visitors / total) * 100).toFixed(1)
                        : "0";
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {activeData.visitors.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            {percentage}%
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              )}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
