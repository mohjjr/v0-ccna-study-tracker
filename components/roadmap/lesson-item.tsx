"use client"

import { useStudyStore } from "@/lib/store"
import { type Lesson } from "@/lib/data/curriculum"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Beaker, 
  MoreHorizontal,
  Play,
  RotateCcw,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface LessonItemProps {
  lesson: Lesson
}

export function LessonItem({ lesson }: LessonItemProps) {
  const { 
    lessonProgress, 
    markLessonComplete, 
    markLessonInProgress, 
    resetLessonProgress 
  } = useStudyStore()
  
  const progress = lessonProgress[lesson.id]
  const status = progress?.status || "not-started"
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  
  const StatusIcon = () => {
    if (status === "completed") {
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    }
    if (status === "in-progress") {
      return (
        <div className="flex h-5 w-5 items-center justify-center">
          <div className="h-3 w-3 rounded-full border-2 border-amber-500 bg-amber-500/20" />
        </div>
      )
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />
  }

  return (
    <div className={cn(
      "flex items-center gap-4 py-4 transition-colors",
      status === "completed" && "opacity-75"
    )}>
      <StatusIcon />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">
            Day {lesson.day}
          </span>
          <span className="font-medium truncate">{lesson.title}</span>
        </div>
        
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(lesson.duration)}
          </span>
          {lesson.hasLab && (
            <Badge variant="outline" className="gap-1 text-xs py-0 h-5">
              <Beaker className="h-3 w-3" />
              Lab
            </Badge>
          )}
          {progress?.labCompleted && lesson.hasLab && (
            <Badge className="gap-1 text-xs py-0 h-5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3" />
              Lab Done
            </Badge>
          )}
        </div>
        
        {progress?.timeSpent > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDuration(progress.timeSpent)} studied
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {status !== "completed" && (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/sessions?lesson=${lesson.id}`}>
              <Play className="mr-1 h-3 w-3" />
              Study
            </Link>
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {status !== "completed" && (
              <DropdownMenuItem onClick={() => markLessonComplete(lesson.id)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Complete
              </DropdownMenuItem>
            )}
            {status !== "in-progress" && status !== "completed" && (
              <DropdownMenuItem onClick={() => markLessonInProgress(lesson.id)}>
                <Play className="mr-2 h-4 w-4" />
                Mark as In Progress
              </DropdownMenuItem>
            )}
            {status !== "not-started" && (
              <DropdownMenuItem onClick={() => resetLessonProgress(lesson.id)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Progress
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
