"use client"

import { useStudyStore } from "@/lib/store"
import { getTotalLessonCount, getTotalLabCount } from "@/lib/data/curriculum"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, BookOpen, Beaker, Calendar, Flame, Target } from "lucide-react"

export function StatsCards() {
  const { 
    totalStudyTime, 
    sessions, 
    currentStreak, 
    longestStreak,
    lessonProgress,
    settings 
  } = useStudyStore()
  
  const completedSessions = sessions.filter(s => s.completed).length
  const completedLessons = Object.values(lessonProgress).filter(p => p.status === "completed").length
  const completedLabs = Object.values(lessonProgress).filter(p => p.labCompleted).length
  
  const totalLessons = getTotalLessonCount()
  const totalLabs = getTotalLabCount()
  
  const avgSessionDuration = completedSessions > 0 
    ? Math.round(totalStudyTime / completedSessions)
    : 0

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const stats = [
    {
      label: "Total Study Time",
      value: formatTime(totalStudyTime),
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Completed Sessions",
      value: completedSessions.toString(),
      icon: Target,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Lessons Completed",
      value: `${completedLessons}/${totalLessons}`,
      icon: BookOpen,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Labs Completed",
      value: `${completedLabs}/${totalLabs}`,
      icon: Beaker,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "Current Streak",
      value: `${currentStreak} days`,
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Avg Session",
      value: formatTime(avgSessionDuration),
      icon: Calendar,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
