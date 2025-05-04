"use client";

import * as React from "react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

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
  totalApplication: {
    label: "Total Tickets",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface ChartData {
  date: string;
  totalApplication: number;
}

export const MainLineChart = ({ data }: { data: ChartData[] }) => {
  const total = React.useMemo(
    () => ({
      total: data?.reduce((acc, curr) => acc + curr.totalApplication, 0) || 0,
    }),
    [data]
  );

  // Calculate trend percentage (comparing last two data points)
  const trend = React.useMemo(() => {
    if (data.length < 2) return { percentage: 0, isUp: true };

    const lastValue = data[data.length - 1].totalApplication;
    const previousValue = data[data.length - 2].totalApplication;

    // Avoid division by zero
    if (previousValue === 0) {
      return {
        percentage: lastValue > 0 ? 100 : 0,
        isUp: lastValue > 0,
      };
    }

    const percentage = ((lastValue - previousValue) / previousValue) * 100;
    return {
      percentage: Math.abs(percentage).toFixed(1),
      isUp: percentage >= 0,
    };
  }, [data]);

  return (
    <Card className="rounded-none  p-0  pt-0">
      <CardHeader className="flex flex-col items-stretch border-b -mb-4  sm:flex-row p-0 ">
        <div className="flex flex-1 flex-col justify-center -mb-4 gap-1 px-6 pb-0 ">
          <CardTitle>Total Applications</CardTitle>
          <CardDescription>
            Applications from {data[0]?.date} to {data[data.length - 1]?.date}
          </CardDescription>
        </div>
        <div className="flex mb-0 pb-0 ">
          <button className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">
              Total Applications
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl pb-0">
              {total.total}
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
            data={data}
            margin={{
              top: 30,
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
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Line
              dataKey="totalApplication"
              type="monotone"
              stroke="hsl(221.2, 83.2%, 53.3%)"
              strokeWidth={2}
              dot={{
                fill: "hsl(221.2, 83.2%, 53.3%)",
                r: 4,
              }}
              activeDot={{
                r: 6,
                fill: "hsl(221.2, 83.2%, 53.3%)",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            >
              <LabelList
                dataKey="totalApplication"
                position="top"
                offset={10}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => (value > 0 ? value : "")}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
