"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { ModuleCard } from "@/components/roadmap/module-card"
import { CURRICULUM, getTotalLessonCount, getAllLessons } from "@/lib/data/curriculum"
import { useStudyStore } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { Progress } from "@/components/ui/progress"

type FilterStatus = "all" | "not-started" | "in-progress" | "completed"

export default function RoadmapPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const { lessonProgress, getCompletedLessonsCount } = useStudyStore()
  
  const totalLessons = getTotalLessonCount()
  const completedLessons = getCompletedLessonsCount()
  const overallProgress = Math.round((completedLessons / totalLessons) * 100)
  
  // Filter modules based on search and status
  const filteredModules = CURRICULUM.map(module => {
    const filteredLessons = module.lessons.filter(lesson => {
      const matchesSearch = searchQuery === "" || 
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      
      if (!matchesSearch) return false
      
      if (statusFilter === "all") return true
      
      const status = lessonProgress[lesson.id]?.status || "not-started"
      return status === statusFilter
    })
    
    return {
      ...module,
      lessons: filteredLessons,
    }
  }).filter(module => module.lessons.length > 0)

  return (
    <>
      <Header title="Learning Roadmap" description="Jeremy's IT Lab CCNA Course" />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-5xl space-y-6 p-4 md:p-6">
          {/* Overall Progress */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Course Progress</h2>
                <p className="text-sm text-muted-foreground">
                  {completedLessons} of {totalLessons} lessons completed
                </p>
              </div>
              <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
            </div>
            <Progress value={overallProgress} className="mt-4 h-3" />
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search lessons or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lessons</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Modules */}
          <div className="space-y-6">
            {filteredModules.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                <p className="text-muted-foreground">No lessons found</p>
                <Button 
                  variant="link" 
                  onClick={() => { setSearchQuery(""); setStatusFilter("all") }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              filteredModules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))
            )}
          </div>
        </div>
      </main>
    </>
  )
}
