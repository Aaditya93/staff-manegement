"use client";

import { Bar, BarChart, CartesianGrid, XAxis, Legend } from "recharts";

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

// Define props interface to accept destination data
interface DestinationChartProps {
  data?: { destination: string; totalTickets: number; revenue: number }[];
}

const chartConfig = {
  totalTickets: {
    label: "Tickets",
    color: "hsl(221.2, 83.2%, 53.3%)",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(212, 95%, 68%)",
  },
} satisfies ChartConfig;

export function DestinationBarChart({ data }: DestinationChartProps) {
  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Destination Statistics</CardTitle>
        <CardDescription>Tickets and Revenue by Destination</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="destination"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 10)} // Show first 10 characters of destination
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Legend />
            <Bar
              dataKey="totalTickets"
              name="Tickets"
              fill="hsl(221.2, 83.2%, 53.3%)"
              radius={8}
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="hsl(212, 95%, 68%)"
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
