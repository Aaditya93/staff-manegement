"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  totalApplications: {
    label: "Total Applications",
    color: "hsl(212, 95%, 68%)",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(221.2, 83.2%, 53.3%)",
  },
} satisfies ChartConfig;

interface ChartData {
  date: string;
  totalApplication: number;
  revenue: number;
}

export const MainLineChart = ({ data }: { data: ChartData[] }) => {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("totalApplications");

  const total = React.useMemo(
    () => ({
      totalApplications:
        data?.reduce((acc, curr) => acc + curr.totalApplication, 0) || 0,
      revenue: data?.reduce((acc, curr) => acc + (curr.revenue || 0), 0) || 0,
    }),
    [data]
  );

  // Format currency for displaying revenue
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="rounded-none">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>
            Data from {data[0]?.date} to {data[data.length - 1]?.date}
          </CardDescription>
        </div>
        <div className="flex">
          <button
            data-active={activeChart === "totalApplications"}
            className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
            onClick={() => setActiveChart("totalApplications")}
          >
            <span className="text-xs text-muted-foreground">
              Total Applications
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {total.totalApplications.toLocaleString()}
            </span>
          </button>
          <button
            data-active={activeChart === "revenue"}
            className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
            onClick={() => setActiveChart("revenue")}
          >
            <span className="text-xs text-muted-foreground">Total Revenue</span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {formatCurrency(total.revenue)}
            </span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6 ">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={data.map((item) => ({
              ...item,
              totalApplications: item.totalApplication,
            }))}
            margin={{
              top: 20,
              left: 12,
              right: 12,
              bottom: 10,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              domain={[0, "auto"]}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={30}
              hide={activeChart === "revenue"}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, "auto"]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={60}
              tickFormatter={(value) => `$${value}`}
              hide={activeChart === "totalApplications"}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[170px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  formatter={(value, name) => {
                    if (name === "revenue") {
                      return [`$${value}`, "Revenue"];
                    }
                    return [value, "Applications"];
                  }}
                />
              }
            />
            {activeChart === "totalApplications" && (
              <Line
                dataKey="totalApplications"
                type="monotone"
                stroke="hsl(212, 95%, 68%)"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "hsl(212, 95%, 68%)",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            )}
            {activeChart === "revenue" && (
              <Line
                dataKey="revenue"
                type="monotone"
                stroke="hsl(221.2, 83.2%, 53.3%)"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "hsl(221.2, 83.2%, 53.3%)",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
