"use client"

import { useState, useEffect } from "react"
import { useStudyStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Flame, Target, Sparkles } from "lucide-react"

export function WelcomeBanner() {
  const { settings, currentStreak, hasCompletedOnboarding } = useStudyStore()
  const [greeting, setGreeting] = useState("Welcome")
  
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 17) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  const getMotivationalMessage = () => {
    if (currentStreak >= 30) return "You're on fire! 30+ day streak - incredible dedication!"
    if (currentStreak >= 14) return "Two weeks strong! Keep that momentum going!"
    if (currentStreak >= 7) return "One week streak! You're building great habits!"
    if (currentStreak >= 3) return "Nice streak going! Consistency is key!"
    if (currentStreak >= 1) return "Great start! Every session counts!"
    return "Ready to begin your CCNA journey?"
  }

  return (
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
      <div className="relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {greeting}, {settings.name}!
            </h1>
            <p className="text-muted-foreground max-w-md">
              {getMotivationalMessage()}
            </p>
          </div>
          
          {currentStreak > 0 && (
            <div className="flex items-center gap-3 rounded-lg bg-orange-500/10 px-4 py-3 text-orange-600 dark:text-orange-400">
              <Flame className="h-6 w-6" />
              <div>
                <p className="text-2xl font-bold">{currentStreak}</p>
                <p className="text-xs">Day Streak</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <a href="/sessions">
              <Target className="mr-2 h-4 w-4" />
              Start Study Session
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/roadmap">
              <Sparkles className="mr-2 h-4 w-4" />
              Continue Learning
            </a>
          </Button>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
    </div>
  )
}
