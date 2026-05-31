"use client"

import { useStudyStore } from "@/lib/store"
import { type Module, CCNA_DOMAINS } from "@/lib/data/curriculum"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { LessonItem } from "./lesson-item"
import { cn } from "@/lib/utils"

interface ModuleCardProps {
  module: Module
}

export function ModuleCard({ module }: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { lessonProgress } = useStudyStore()
  
  const completedLessons = module.lessons.filter(
    l => lessonProgress[l.id]?.status === "completed"
  ).length
  const inProgressLessons = module.lessons.filter(
    l => lessonProgress[l.id]?.status === "in-progress"
  ).length
  const totalLessons = module.lessons.length
  const progressPercent = Math.round((completedLessons / totalLessons) * 100)
  
  const domain = CCNA_DOMAINS[module.domain]

  return (
    <Card className="overflow-hidden">
      <CardHeader 
        className="cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button 
              className="mt-1 flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <div className="space-y-1">
              <CardTitle className="text-lg">{module.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{module.description}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="secondary" className="text-xs">
                  {domain.weight}% of exam
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {totalLessons} lessons
                </Badge>
                {inProgressLessons > 0 && (
                  <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400">
                    {inProgressLessons} in progress
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className="text-2xl font-bold">{progressPercent}%</span>
            <span className="text-xs text-muted-foreground">
              {completedLessons}/{totalLessons} completed
            </span>
          </div>
        </div>
        
        <Progress value={progressPercent} className="mt-4 h-2" />
      </CardHeader>
      
      <CardContent className={cn("pt-0", !isExpanded && "hidden")}>
        <div className="divide-y">
          {module.lessons.map((lesson) => (
            <LessonItem key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
