"use client"

import { useState, useEffect, useCallback } from "react"
import { useStudyStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Square, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"

type TimerMode = "focus" | "break"

interface StudyTimerProps {
  lessonId?: string
  lessonTitle?: string
  onSessionEnd?: (duration: number) => void
}

export function StudyTimer({ lessonId, lessonTitle, onSessionEnd }: StudyTimerProps) {
  const { settings, activeSession, startSession, endSession, cancelSession } = useStudyStore()
  
  const [mode, setMode] = useState<TimerMode>("focus")
  const [timeRemaining, setTimeRemaining] = useState(settings.pomodoroLength * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [totalSessionTime, setTotalSessionTime] = useState(0)
  
  const currentDuration = mode === "focus" ? settings.pomodoroLength : settings.breakLength
  const progress = ((currentDuration * 60 - timeRemaining) / (currentDuration * 60)) * 100
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = useCallback(() => {
    if (!activeSession && mode === "focus") {
      startSession(lessonId, lessonTitle)
    }
    setIsRunning(true)
  }, [activeSession, mode, lessonId, lessonTitle, startSession])

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeRemaining(currentDuration * 60)
  }

  const handleStop = () => {
    setIsRunning(false)
    if (activeSession) {
      endSession()
      onSessionEnd?.(totalSessionTime)
    }
    setMode("focus")
    setTimeRemaining(settings.pomodoroLength * 60)
    setTotalSessionTime(0)
  }

  const switchMode = useCallback(() => {
    if (mode === "focus") {
      setMode("break")
      setTimeRemaining(settings.breakLength * 60)
    } else {
      setMode("focus")
      setTimeRemaining(settings.pomodoroLength * 60)
    }
  }, [mode, settings.breakLength, settings.pomodoroLength])

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
        if (mode === "focus") {
          setTotalSessionTime((prev) => prev + 1)
        }
      }, 1000)
    } else if (timeRemaining === 0) {
      // Timer completed
      setIsRunning(false)
      // Play a sound or show notification
      if (typeof window !== "undefined" && "Notification" in window) {
        new Notification(mode === "focus" ? "Focus session complete!" : "Break time over!")
      }
      switchMode()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeRemaining, mode, switchMode])

  // Update timer when settings change
  useEffect(() => {
    if (!isRunning) {
      setTimeRemaining(currentDuration * 60)
    }
  }, [settings.pomodoroLength, settings.breakLength, isRunning, currentDuration])

  return (
    <Card className={cn(
      "transition-colors",
      mode === "break" && "border-emerald-500/50 bg-emerald-500/5"
    )}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {mode === "focus" ? "Focus Time" : (
            <>
              <Coffee className="h-5 w-5" />
              Break Time
            </>
          )}
        </CardTitle>
        <CardDescription>
          {lessonTitle || "General Study Session"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="relative mx-auto h-48 w-48">
          {/* Progress Ring */}
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="stroke-muted"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
            />
            <circle
              className={cn(
                "transition-all duration-1000",
                mode === "focus" ? "stroke-primary" : "stroke-emerald-500"
              )}
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.827} 282.7`}
            />
          </svg>
          
          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tabular-nums">
              {formatTime(timeRemaining)}
            </span>
            <span className="text-sm text-muted-foreground">
              {mode === "focus" ? `${settings.pomodoroLength} min focus` : `${settings.breakLength} min break`}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isRunning ? (
            <Button size="lg" onClick={handleStart} className="gap-2">
              <Play className="h-5 w-5" />
              {activeSession ? "Resume" : "Start"}
            </Button>
          ) : (
            <Button size="lg" variant="secondary" onClick={handlePause} className="gap-2">
              <Pause className="h-5 w-5" />
              Pause
            </Button>
          )}
          
          <Button size="lg" variant="outline" onClick={handleReset}>
            <RotateCcw className="h-5 w-5" />
          </Button>
          
          {(activeSession || totalSessionTime > 0) && (
            <Button size="lg" variant="destructive" onClick={handleStop}>
              <Square className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Session Stats */}
        {totalSessionTime > 0 && (
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Total session time</p>
            <p className="text-2xl font-bold">{formatTime(totalSessionTime)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
