"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Define types for the chart data
interface SpeedChartDataItem {
  speed: string;
  totalTickets: number;
  fill: string;
}

interface SpeedHorizontalChartProps {
  data: SpeedChartDataItem[];
  waitingTime: number;
  title?: string;
  subtitle?: string;
  footerText?: string;
}

const chartConfig = {
  slow: {
    label: "Slow",
    color: "hsl(221.2, 83.2%, 53.3%)",
  },
  normal: {
    label: "Normal",
    color: "hsl(212, 95%, 68%)",
  },
  fast: {
    label: "Fast",
    color: "hsl(216, 92%, 60%)",
  },
  urgent: {
    label: "Urgent",
    color: "hsl(210, 98%, 78%)",
  },
} satisfies ChartConfig;

export function SpeedHorizontalChart({
  data,
  waitingTime,
  title = "Speed Distribution",
  subtitle = `Ticket resolution times `,
  footerText = "Showing resolution speed for all tickets",
}: SpeedHorizontalChartProps) {
  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {subtitle} - {waitingTime} mins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="speed"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <XAxis dataKey="totalTickets" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="totalTickets"
              layout="vertical"
              radius={5}
              fill={(entry) => entry.fill}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">{footerText}</div>
      </CardFooter>
    </Card>
  );
}

// Example usage:
// const speedChartData = [
//   { speed: 'slow', totalTickets: 0, fill: 'hsl(221.2, 83.2%, 53.3%)' },
//   { speed: 'normal', totalTickets: 16, fill: 'hsl(212, 95%, 68%)' },
//   { speed: 'fast', totalTickets: 2, fill: 'hsl(216, 92%, 60%)' },
//   { speed: 'urgent', totalTickets: 0, fill: 'hsl(210, 98%, 78%)' }
// ];
//
// <SpeedHorizontalChart data={speedChartData} />
