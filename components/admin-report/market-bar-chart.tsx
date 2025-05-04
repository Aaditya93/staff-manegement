"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, Legend } from "recharts";

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

// Define props interface to accept destination data
interface DestinationChartProps {
  data?: { destination: string; totalTickets: number; revenue: number }[];
}

// Default data in case no data is provided
const defaultChartData = [
  { destination: "Singapore", totalTickets: 6, revenue: 0 },
  { destination: "Vietnam", totalTickets: 7, revenue: 0 },
];

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

export function DestinationBarChart({
  data = defaultChartData,
}: DestinationChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Destination Statistics</CardTitle>
        <CardDescription>Tickets and Revenue by Destination</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
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
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing ticket counts and revenue by destination
        </div>
      </CardFooter>
    </Card>
  );
}
