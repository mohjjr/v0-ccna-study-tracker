"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useStudyStore } from "@/lib/store"
import { WEEKLY_PLAN, getLessonsForWeek, getWeekTotalTasks } from "@/lib/data/curriculum"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle2, Clock, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { differenceInDays, addWeeks, format } from "date-fns"

export function WeeklyPlanCard() {
  const { lessonProgress, settings } = useStudyStore()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const currentWeekData = useMemo(() => {
    // Calculate which week user should be on based on start date or progress
    // For simplicity, calculate based on lesson progress
    let currentWeek = 1
    
    for (let week = 1; week <= 6; week++) {
      const lessons = getLessonsForWeek(week)
      const completedInWeek = lessons.filter(
        l => lessonProgress[l.id]?.status === "completed"
      ).length
      const totalLessons = lessons.length
      
      // If this week is not 100% complete, it's the current week
      if (completedInWeek < totalLessons) {
        currentWeek = week
        break
      }
      // If all weeks complete, stay on week 6
      if (week === 6) currentWeek = 6
    }
    
    return currentWeek
  }, [lessonProgress])

  const weekProgress = useMemo(() => {
    const weekPlan = WEEKLY_PLAN.find(w => w.week === currentWeekData)
    if (!weekPlan) return { completed: 0, total: 0, percent: 0, lessons: [], labsCompleted: 0, totalLabs: 0 }
    
    const lessons = getLessonsForWeek(currentWeekData)
    const completedLessons = lessons.filter(l => lessonProgress[l.id]?.status === "completed").length
    const labsCompleted = lessons.filter(l => l.hasLab && lessonProgress[l.id]?.labCompleted).length
    const totalLabs = lessons.filter(l => l.hasLab).length
    
    const totalTasks = lessons.length + totalLabs
    const completedTasks = completedLessons + labsCompleted
    
    return {
      completed: completedTasks,
      total: totalTasks,
      percent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      lessons,
      completedLessons,
      labsCompleted,
      totalLabs,
    }
  }, [currentWeekData, lessonProgress])

  const scheduleStatus = useMemo(() => {
    // Calculate expected progress based on exam date or default 6 weeks
    const examDate = settings.examDate ? new Date(settings.examDate) : addWeeks(new Date(), 6)
    const today = new Date()
    const totalDays = 42 // 6 weeks
    const daysElapsed = Math.max(0, Math.min(42, 42 - differenceInDays(examDate, today)))
    const expectedWeek = Math.min(6, Math.ceil((daysElapsed / totalDays) * 6) || 1)
    
    // Calculate overall progress
    let totalCompleted = 0
    let totalTasks = 0
    for (let week = 1; week <= 6; week++) {
      const lessons = getLessonsForWeek(week)
      totalTasks += getWeekTotalTasks(week)
      totalCompleted += lessons.filter(l => lessonProgress[l.id]?.status === "completed").length
      totalCompleted += lessons.filter(l => l.hasLab && lessonProgress[l.id]?.labCompleted).length
    }
    
    const actualProgress = totalTasks > 0 ? totalCompleted / totalTasks : 0
    const expectedProgress = daysElapsed / totalDays
    
    if (actualProgress > expectedProgress + 0.05) {
      return { status: "ahead", label: "Ahead of Schedule", color: "text-green-600 dark:text-green-400" }
    } else if (actualProgress < expectedProgress - 0.05) {
      return { status: "behind", label: "Behind Schedule", color: "text-amber-600 dark:text-amber-400" }
    }
    return { status: "on-track", label: "On Schedule", color: "text-blue-600 dark:text-blue-400" }
  }, [settings.examDate, lessonProgress])

  const estimatedCompletion = useMemo(() => {
    // Calculate estimated completion based on current pace
    let totalCompleted = 0
    let totalTasks = 0
    for (let week = 1; week <= 6; week++) {
      const lessons = getLessonsForWeek(week)
      totalTasks += getWeekTotalTasks(week)
      totalCompleted += lessons.filter(l => lessonProgress[l.id]?.status === "completed").length
      totalCompleted += lessons.filter(l => l.hasLab && lessonProgress[l.id]?.labCompleted).length
    }
    
    if (totalCompleted === 0) {
      return settings.examDate ? new Date(settings.examDate) : addWeeks(new Date(), 6)
    }
    
    // Simple linear projection based on average pace
    const percentComplete = totalCompleted / totalTasks
    if (percentComplete >= 1) return new Date() // Already complete
    
    const daysPerTask = 42 / totalTasks // Assuming 6 week plan
    const remainingTasks = totalTasks - totalCompleted
    const estimatedDaysRemaining = remainingTasks * daysPerTask
    
    return addWeeks(new Date(), Math.ceil(estimatedDaysRemaining / 7))
  }, [lessonProgress, settings.examDate])

  const currentWeekPlan = WEEKLY_PLAN.find(w => w.week === currentWeekData)
  
  if (!mounted) {
    return (
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Weekly Study Plan</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Weekly Study Plan</CardTitle>
            <CardDescription>Week {currentWeekData} of 6 - {currentWeekPlan?.title}</CardDescription>
          </div>
          <Badge variant="outline" className={scheduleStatus.color}>
            {scheduleStatus.status === "ahead" && <TrendingUp className="mr-1 h-3 w-3" />}
            {scheduleStatus.status === "behind" && <TrendingDown className="mr-1 h-3 w-3" />}
            {scheduleStatus.status === "on-track" && <Minus className="mr-1 h-3 w-3" />}
            {scheduleStatus.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Week Progress</span>
            <span className="font-medium">{weekProgress.percent}%</span>
          </div>
          <Progress value={weekProgress.percent} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs">Completed</span>
            </div>
            <p className="mt-1 text-xl font-semibold">{weekProgress.completed}/{weekProgress.total}</p>
            <p className="text-xs text-muted-foreground">tasks this week</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Weekly Goal</span>
            </div>
            <p className="mt-1 text-xl font-semibold">{currentWeekPlan?.weeklyHoursGoal}h</p>
            <p className="text-xs text-muted-foreground">study hours</p>
          </div>
        </div>

        {/* Estimated Completion */}
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Estimated Completion</p>
              <p className="text-xs text-muted-foreground">Based on current pace</p>
            </div>
          </div>
          <span className="text-sm font-semibold">{format(estimatedCompletion, "MMM d, yyyy")}</span>
        </div>

        {/* View All Link */}
        <Button variant="outline" className="w-full" asChild>
          <Link href="/schedule">
            View Full Schedule
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
