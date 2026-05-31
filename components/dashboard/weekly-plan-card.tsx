"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useStudyStore } from "@/lib/store"
import {
  getCurrentWeek,
  getWeekByNumber,
  getWeeksWithProgress,
  getScheduleStatus,
  estimateCompletionDate,
} from "@/lib/data/weekly-schedule"
import { Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"

export function WeeklyPlanCard() {
  const { getCompletedLessonIds, getTotalStudyTimeTodayInMinutes } = useStudyStore()
  
  const completedLessonIds = getCompletedLessonIds()
  const currentWeek = getCurrentWeek()
  const weeksWithProgress = useMemo(() => getWeeksWithProgress(completedLessonIds), [completedLessonIds])
  const currentWeekData = weeksWithProgress.find(w => w.week === currentWeek)
  
  if (!currentWeekData) {
    return null
  }
  
  const scheduleStatus = getScheduleStatus(currentWeek, currentWeekData.progressPercentage)
  const estimatedCompletion = estimateCompletionDate(completedLessonIds.length)
  const studyTimeTodayMinutes = getTotalStudyTimeTodayInMinutes()
  
  const statusConfig = {
    ahead: { badge: "Ahead of Schedule", color: "bg-green-100 text-green-800", icon: TrendingUp },
    "on-track": { badge: "On Track", color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
    behind: { badge: "Behind Schedule", color: "bg-orange-100 text-orange-800", icon: AlertCircle },
  }
  
  const statusInfo = statusConfig[scheduleStatus]
  const StatusIcon = statusInfo.icon
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Week {currentWeek} Study Plan</CardTitle>
            <CardDescription>Current week progress and schedule status</CardDescription>
          </div>
          <Badge className={statusInfo.color} variant="secondary">
            <StatusIcon className="mr-1 h-3 w-3" />
            {statusInfo.badge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Weekly Progress</span>
            <span className="text-muted-foreground">{currentWeekData.progressPercentage}%</span>
          </div>
          <Progress value={currentWeekData.progressPercentage} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 rounded-lg bg-muted/50 p-3">
            <div className="text-sm text-muted-foreground">Tasks Assigned</div>
            <div className="text-2xl font-bold">{currentWeekData.tasksAssigned}</div>
          </div>
          <div className="space-y-1 rounded-lg bg-muted/50 p-3">
            <div className="text-sm text-muted-foreground">Tasks Completed</div>
            <div className="text-2xl font-bold">{currentWeekData.tasksCompleted}</div>
          </div>
          <div className="space-y-1 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Study Today</div>
            </div>
            <div className="text-2xl font-bold">{studyTimeTodayMinutes}m</div>
          </div>
          <div className="space-y-1 rounded-lg bg-muted/50 p-3">
            <div className="text-sm text-muted-foreground">Est. Completion</div>
            <div className="text-sm font-bold">
              {estimatedCompletion.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Lessons in Week */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Lessons This Week</div>
          <div className="flex flex-wrap gap-2">
            {currentWeekData.lessons.slice(0, 3).map(lesson => (
              <Badge key={lesson?.id} variant="outline" className="text-xs">
                Day {lesson?.day}
              </Badge>
            ))}
            {currentWeekData.lessons.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{currentWeekData.lessons.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button asChild className="w-full">
          <Link href="/weekly-plan">View Full Weekly Plan</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
