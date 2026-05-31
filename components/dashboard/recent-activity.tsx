"use client"

import { useStudyStore } from "@/lib/store"
import { getLessonById } from "@/lib/data/curriculum"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Timer, CheckCircle2, Play } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function RecentActivity() {
  const { sessions, lessonProgress } = useStudyStore()
  
  // Get last 5 activities (sessions + lesson completions)
  const sessionActivities = sessions
    .filter(s => s.completed)
    .slice(-10)
    .map(s => ({
      id: s.id,
      type: "session" as const,
      title: s.lessonTitle || "General Study",
      time: s.endTime || s.startTime,
      duration: s.duration,
    }))
  
  const lessonActivities = Object.entries(lessonProgress)
    .filter(([_, p]) => p.status === "completed" && p.completedAt)
    .map(([id, p]) => {
      const lesson = getLessonById(id)
      return {
        id,
        type: "completion" as const,
        title: lesson?.title || "Unknown Lesson",
        time: p.completedAt!,
        duration: p.timeSpent,
      }
    })
  
  const allActivities = [...sessionActivities, ...lessonActivities]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5)

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest study sessions and completions</CardDescription>
      </CardHeader>
      <CardContent>
        {allActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium">No activity yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start a study session to see your progress here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-4">
              {allActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    activity.type === "completion" 
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {activity.type === "completion" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Timer className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.type === "completion" ? "Completed: " : "Studied: "}
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(activity.time), { addSuffix: true })}</span>
                      {activity.duration > 0 && (
                        <>
                          <span>·</span>
                          <span>{formatDuration(activity.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
