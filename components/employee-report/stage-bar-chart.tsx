"use client";

import * as React from "react";
import { TrendingUp, CheckCircle } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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

const chartConfig = {
  status: {
    label: "Status",
  },
  quote_sent: {
    label: "Quote Sent",
    color: "hsl(212, 95%, 68%)",
  },
  pending: {
    label: "Pending",
    color: "hsl(221.2, 83.2%, 53.3%)",
  },
  in_progress: {
    label: "In Progress",
    color: "hsl(210, 98%, 78%)",
  },
  cancelled: {
    label: "Cancelled",
    color: "hsl(212, 97%, 87%)",
  },
  completed: {
    label: "Completed",
    color: "hsl(216, 92%, 60%)",
  },
} satisfies ChartConfig;

export type ChartDataItem = {
  status: string;
  totalTickets: number;
  fill?: string;
};

export type ChartMetrics = {
  totalInquiries: number;
  completedInquiries: number;
  conversionRate: number;
};

interface StageBarChartProps {
  chartData: ChartDataItem[];
  metrics?: ChartMetrics;
}

export function StageBarChart({ chartData, metrics }: StageBarChartProps) {
  const totalTickets = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.totalTickets, 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col rounded-none">
      <CardHeader className="items-center pb-0">
        <CardTitle>Ticket Status</CardTitle>
        <CardDescription>Current Ticket Distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="totalTickets"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
              fill="#8884d8"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
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
                          {totalTickets.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Inquiries
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <TrendingUp className="mr-1 h-4 w-4 text-muted-foreground" />
          <span>
            Pending Ticket:{" "}
            {chartData.find((item) => item.status === "pending")
              ?.totalTickets || 0}
          </span>
        </div>
        {metrics && (
          <div className="flex items-center text-sm text-muted-foreground">
            <CheckCircle className="mr-1 h-4 w-4 text-primary" />
            <span>Conversion rate: {metrics.conversionRate}%</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
