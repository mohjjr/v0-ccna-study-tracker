"use client"

import { useStudyStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format, subDays, startOfDay, getDay } from "date-fns"

export function StudyHeatmap() {
  const { sessions } = useStudyStore()
  
  // Generate data for the past 12 weeks (84 days)
  const days = 84
  const weeks = 12
  
  const data = Array.from({ length: days }, (_, i) => {
    const date = startOfDay(subDays(new Date(), days - 1 - i))
    const dateStr = date.toISOString().split("T")[0]
    
    const dayMinutes = sessions
      .filter(s => s.completed && s.startTime.split("T")[0] === dateStr)
      .reduce((sum, s) => sum + s.duration, 0)
    
    return {
      date,
      dateStr,
      minutes: dayMinutes,
      level: getActivityLevel(dayMinutes),
    }
  })
  
  // Group by weeks
  const weekData: typeof data[] = []
  for (let i = 0; i < weeks; i++) {
    weekData.push(data.slice(i * 7, (i + 1) * 7))
  }
  
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Activity</CardTitle>
        <CardDescription>Your study consistency over the past 12 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pr-2 text-xs text-muted-foreground">
              {dayLabels.map((day, i) => (
                <div key={day} className="flex h-3 w-6 items-center justify-end">
                  {i % 2 === 1 && day.slice(0, 1)}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            {weekData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.dateStr}
                    className={cn(
                      "h-3 w-3 rounded-sm transition-colors",
                      getLevelColor(day.level)
                    )}
                    title={`${format(day.date, "MMM d, yyyy")}: ${formatMinutes(day.minutes)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn("h-3 w-3 rounded-sm", getLevelColor(level))}
            />
          ))}
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}

function getActivityLevel(minutes: number): number {
  if (minutes === 0) return 0
  if (minutes < 15) return 1
  if (minutes < 45) return 2
  if (minutes < 90) return 3
  return 4
}

function getLevelColor(level: number): string {
  switch (level) {
    case 0:
      return "bg-muted"
    case 1:
      return "bg-primary/20"
    case 2:
      return "bg-primary/40"
    case 3:
      return "bg-primary/60"
    case 4:
      return "bg-primary"
    default:
      return "bg-muted"
  }
}

function formatMinutes(minutes: number): string {
  if (minutes === 0) return "No study"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}
