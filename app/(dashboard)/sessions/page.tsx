"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { StudyTimer } from "@/components/sessions/study-timer"
import { SessionHistory } from "@/components/sessions/session-history"
import { useStudyStore } from "@/lib/store"
import { getAllLessons, getLessonById } from "@/lib/data/curriculum"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Settings2, Target } from "lucide-react"

export default function SessionsPage() {
  const searchParams = useSearchParams()
  const lessonIdParam = searchParams.get("lesson")
  
  const { settings, updateSettings } = useStudyStore()
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessonIdParam || "general")
  
  const allLessons = getAllLessons()
  const selectedLesson = selectedLessonId && selectedLessonId !== "general" ? getLessonById(selectedLessonId) : undefined
  
  // Update selected lesson when URL param changes
  useEffect(() => {
    if (lessonIdParam) {
      setSelectedLessonId(lessonIdParam)
    }
  }, [lessonIdParam])

  return (
    <>
      <Header title="Study Sessions" description="Focus with the Pomodoro technique" />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-6xl space-y-6 p-4 md:p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Timer Section */}
            <div className="space-y-6">
              {/* Lesson Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Study Topic
                  </CardTitle>
                  <CardDescription>
                    Select a lesson to track time against specific topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lesson (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Study</SelectItem>
                      {allLessons.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          Day {lesson.day}: {lesson.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedLesson && (
                    <div className="mt-4 rounded-lg bg-muted/50 p-3">
                      <p className="font-medium">{selectedLesson.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Topics: {selectedLesson.topics.join(", ")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timer */}
              <StudyTimer
                lessonId={selectedLessonId !== "general" ? selectedLessonId : undefined}
                lessonTitle={selectedLesson?.title}
              />
            </div>

            {/* Settings & History */}
            <div className="space-y-6">
              {/* Timer Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    Timer Settings
                  </CardTitle>
                  <CardDescription>
                    Customize your Pomodoro timer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Focus Duration</Label>
                      <span className="text-sm font-medium">{settings.pomodoroLength} min</span>
                    </div>
                    <Slider
                      value={[settings.pomodoroLength]}
                      onValueChange={([value]) => updateSettings({ pomodoroLength: value })}
                      min={5}
                      max={60}
                      step={5}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Break Duration</Label>
                      <span className="text-sm font-medium">{settings.breakLength} min</span>
                    </div>
                    <Slider
                      value={[settings.breakLength]}
                      onValueChange={([value]) => updateSettings({ breakLength: value })}
                      min={1}
                      max={30}
                      step={1}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Daily Goal</Label>
                      <span className="text-sm font-medium">{settings.dailyGoal} min</span>
                    </div>
                    <Slider
                      value={[settings.dailyGoal]}
                      onValueChange={([value]) => updateSettings({ dailyGoal: value })}
                      min={15}
                      max={180}
                      step={15}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Session History */}
              <SessionHistory />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
