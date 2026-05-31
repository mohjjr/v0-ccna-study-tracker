"use client"

import { useMemo } from "react"
import { useStudyStore } from "@/lib/store"
import { getTotalLessonCount, getTotalLabCount, getTotalEstimatedTime } from "@/lib/data/curriculum"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Target, Beaker } from "lucide-react"

export function ProgressCards() {
  const { lessonProgress, totalStudyTime, settings, sessions } = useStudyStore()
  
  const totalLessons = getTotalLessonCount()
  const totalLabs = getTotalLabCount()
  
  const completedLessons = useMemo(() => 
    Object.values(lessonProgress).filter(p => p.status === "completed").length
  , [lessonProgress])
  
  const completedLabs = useMemo(() => 
    Object.values(lessonProgress).filter(p => p.labCompleted).length
  , [lessonProgress])
  
  const todayMinutes = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0]
    return sessions
      .filter(s => s.completed && s.startTime.split("T")[0] === todayStr)
      .reduce((sum, s) => sum + s.duration, 0)
  }, [sessions])
  
  const lessonProgressPercent = Math.round((completedLessons / totalLessons) * 100)
  const labProgressPercent = Math.round((completedLabs / totalLabs) * 100)
  const dailyGoalPercent = Math.min(100, Math.round((todayMinutes / settings.dailyGoal) * 100))

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const cards = [
    {
      title: "Lessons Completed",
      value: `${completedLessons}/${totalLessons}`,
      description: `${lessonProgressPercent}% complete`,
      progress: lessonProgressPercent,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      title: "Labs Completed",
      value: `${completedLabs}/${totalLabs}`,
      description: `${labProgressPercent}% complete`,
      progress: labProgressPercent,
      icon: Beaker,
      color: "text-emerald-500",
    },
    {
      title: "Total Study Time",
      value: formatTime(totalStudyTime),
      description: `${formatTime(getTotalEstimatedTime())} estimated total`,
      progress: Math.min(100, Math.round((totalStudyTime / getTotalEstimatedTime()) * 100)),
      icon: Clock,
      color: "text-amber-500",
    },
    {
      title: "Today's Goal",
      value: formatTime(todayMinutes),
      description: `${formatTime(settings.dailyGoal)} daily target`,
      progress: dailyGoalPercent,
      icon: Target,
      color: dailyGoalPercent >= 100 ? "text-emerald-500" : "text-primary",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <Progress value={card.progress} className="mt-3 h-1.5" />
            <p className="mt-2 text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
