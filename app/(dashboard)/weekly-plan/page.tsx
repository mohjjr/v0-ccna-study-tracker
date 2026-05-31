"use client"

import { useMemo } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStudyStore } from "@/lib/store"
import {
  getAllWeeks,
  getWeeksWithProgress,
  getScheduleStatus,
  estimateCompletionDate,
} from "@/lib/data/weekly-schedule"
import { TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"

export default function WeeklyPlanPage() {
  const { getCompletedLessonIds } = useStudyStore()
  
  const completedLessonIds = getCompletedLessonIds()
  const weeksWithProgress = useMemo(() => getWeeksWithProgress(completedLessonIds), [completedLessonIds])
  const estimatedCompletion = estimateCompletionDate(completedLessonIds.length)

  const statusConfig = {
    ahead: { badge: "Ahead of Schedule", color: "bg-green-100 text-green-800", icon: TrendingUp },
    "on-track": { badge: "On Track", color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
    behind: { badge: "Behind Schedule", color: "bg-orange-100 text-orange-800", icon: AlertCircle },
  }

  return (
    <>
      <Header 
        title="Weekly Study Plan" 
        description="6-week CCNA study plan with progress tracking"
      />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl space-y-6 p-4 md:p-6">
          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <div className="space-y-2">
                <CardTitle>Course Progress</CardTitle>
                <CardDescription>
                  Lessons completed: {completedLessonIds.length} / 68
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={(completedLessonIds.length / 68) * 100} className="h-3" />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Completion %</div>
                  <div className="text-2xl font-bold">
                    {Math.round((completedLessonIds.length / 68) * 100)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Est. Completion</div>
                  <div className="text-sm font-bold">
                    {estimatedCompletion.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="text-2xl font-bold">{68 - completedLessonIds.length}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Avg per Week</div>
                  <div className="text-2xl font-bold">
                    {Math.round(completedLessonIds.length / Math.max(1, Math.floor(completedLessonIds.length / 11)))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Breakdown */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Weekly Breakdown</h2>
            
            <div className="grid gap-4">
              {weeksWithProgress.map(week => {
                const scheduleStatus = getScheduleStatus(week.week, week.progressPercentage)
                const statusInfo = statusConfig[scheduleStatus]
                const StatusIcon = statusInfo.icon

                const topics = {
                  1: "Network Fundamentals",
                  2: "Network Access",
                  3: "IP Connectivity",
                  4: "IP Services / Security",
                  5: "Security / Wireless",
                  6: "Automation & Programmability",
                }

                return (
                  <Card key={week.week}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            Week {week.week}: {topics[week.week as keyof typeof topics]}
                          </CardTitle>
                          <CardDescription>
                            Days {week.startDay}-{week.endDay} • {week.lessons.length} lessons
                          </CardDescription>
                        </div>
                        <Badge className={statusInfo.color} variant="secondary">
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.badge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{week.progressPercentage}%</span>
                        </div>
                        <Progress value={week.progressPercentage} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-muted/50 p-2 text-center">
                          <div className="text-xs text-muted-foreground">Assigned</div>
                          <div className="text-lg font-bold">{week.tasksAssigned}</div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2 text-center">
                          <div className="text-xs text-muted-foreground">Completed</div>
                          <div className="text-lg font-bold">{week.tasksCompleted}</div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2 text-center">
                          <div className="text-xs text-muted-foreground">Remaining</div>
                          <div className="text-lg font-bold">
                            {week.tasksAssigned - week.tasksCompleted}
                          </div>
                        </div>
                      </div>

                      {/* Lessons */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Lessons</div>
                        <div className="flex flex-wrap gap-2">
                          {week.lessons.map(lesson => (
                            <Badge
                              key={lesson.id}
                              variant={week.completedLessons.includes(lesson.id) ? "default" : "outline"}
                              className="text-xs"
                            >
                              Day {lesson.day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Study Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Study Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Aim to complete at least 1-2 lessons per day to stay on track</p>
              <p>• Use the Pomodoro timer in Study Sessions for focused study blocks</p>
              <p>• Complete the lab for each lesson to reinforce concepts</p>
              <p>• Track your study sessions to monitor daily progress</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
