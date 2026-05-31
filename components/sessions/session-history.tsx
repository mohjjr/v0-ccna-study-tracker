"use client"

import { useStudyStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, BookOpen } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

export function SessionHistory() {
  const { sessions } = useStudyStore()
  
  const completedSessions = sessions
    .filter(s => s.completed)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session History</CardTitle>
        <CardDescription>Your recent study sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {completedSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium">No sessions yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start a study session to track your progress
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {completedSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {session.lessonTitle || "General Study"}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(session.startTime), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(session.startTime), "h:mm a")}
                        </span>
                        <span>
                          {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {session.notes && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {session.notes}
                        </p>
                      )}
                      
                      {session.topicsCovered.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {session.topicsCovered.slice(0, 3).map((topic, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {session.topicsCovered.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{session.topicsCovered.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Badge className="shrink-0">
                      {formatDuration(session.duration)}
                    </Badge>
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
