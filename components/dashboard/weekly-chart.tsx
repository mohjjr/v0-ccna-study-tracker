"use client"

import { useMemo } from "react"
import { useStudyStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function WeeklyChart() {
  const sessions = useStudyStore((state) => state.sessions)
  
  const weeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const result: { day: string; minutes: number }[] = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayName = days[date.getDay()]
      
      const minutes = sessions
        .filter(s => s.completed && s.startTime.split("T")[0] === dateStr)
        .reduce((sum, s) => sum + s.duration, 0)
      
      result.push({ day: dayName, minutes })
    }
    
    return result
  }, [sessions])
  
  const chartConfig = {
    minutes: {
      label: "Minutes",
      color: "var(--color-primary)",
    },
  }

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    const minutes = mins % 60
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Weekly Study Time</CardTitle>
        <CardDescription>Your study activity over the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
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
            <Bar 
              dataKey="minutes" 
              fill="var(--color-primary)" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
