"use client"

import { useStudyStore } from "@/lib/store"
import { CURRICULUM, CCNA_DOMAINS, type CCNADomain } from "@/lib/data/curriculum"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

export function DomainProgressChart() {
  const { lessonProgress } = useStudyStore()
  
  const domainData = Object.entries(CCNA_DOMAINS).map(([domainId, domain]) => {
    const domainLessons = CURRICULUM
      .flatMap(m => m.lessons)
      .filter(l => l.domain === domainId)
    
    const completedCount = domainLessons.filter(
      l => lessonProgress[l.id]?.status === "completed"
    ).length
    
    const percent = domainLessons.length > 0 
      ? Math.round((completedCount / domainLessons.length) * 100)
      : 0
    
    return {
      domain: domain.name.replace("Network ", "").replace(" Fundamentals", ""),
      progress: percent,
      weight: domain.weight,
      fullMark: 100,
    }
  })

  const chartConfig = {
    progress: {
      label: "Progress",
      color: "var(--color-primary)",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Mastery</CardTitle>
        <CardDescription>Progress across CCNA exam domains</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto h-[300px] w-full max-w-md">
          <RadarChart data={domainData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid className="stroke-muted" />
            <PolarAngleAxis 
              dataKey="domain" 
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            />
            <Radar
              name="Progress"
              dataKey="progress"
              stroke="var(--color-primary)"
              fill="var(--color-primary)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
        
        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {domainData.map((d) => (
            <div key={d.domain} className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1">
              <span className="truncate">{d.domain}</span>
              <span className="font-medium">{d.progress}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
