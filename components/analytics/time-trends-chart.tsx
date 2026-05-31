"use client"

import { useStudyStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format, subDays, startOfDay } from "date-fns"

interface TimeTrendsChartProps {
  period?: "week" | "month"
}

export function TimeTrendsChart({ period = "week" }: TimeTrendsChartProps) {
  const { sessions } = useStudyStore()
  
  const days = period === "week" ? 7 : 30
  
  // Generate data for each day
  const data = Array.from({ length: days }, (_, i) => {
    const date = startOfDay(subDays(new Date(), days - 1 - i))
    const dateStr = date.toISOString().split("T")[0]
    
    const dayMinutes = sessions
      .filter(s => s.completed && s.startTime.split("T")[0] === dateStr)
      .reduce((sum, s) => sum + s.duration, 0)
    
    return {
      date: format(date, period === "week" ? "EEE" : "MMM d"),
      minutes: dayMinutes,
      hours: Math.round(dayMinutes / 60 * 10) / 10,
    }
  })

  const chartConfig = {
    minutes: {
      label: "Study Time",
      color: "var(--color-primary)",
    },
  }

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    const minutes = mins % 60
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0)
  const avgMinutes = Math.round(totalMinutes / days)

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Study Time Trends</CardTitle>
            <CardDescription>
              Your study activity over the past {period === "week" ? "7 days" : "30 days"}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{formatMinutes(totalMinutes)}</p>
            <p className="text-xs text-muted-foreground">
              {formatMinutes(avgMinutes)} avg/day
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              axisLine={false}
              fontSize={12}
              tickMargin={8}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false}
              fontSize={12}
              tickMargin={8}
              tickFormatter={(value) => formatMinutes(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  formatter={(value) => formatMinutes(Number(value))}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="var(--color-primary)"
              fill="url(#fillMinutes)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
