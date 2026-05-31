"use client"

import { Header } from "@/components/layout/header"
import { useStudyStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { User, Target, Timer, Trash2, Download } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const { settings, updateSettings, sessions, lessonProgress, totalStudyTime } = useStudyStore()
  const [name, setName] = useState(settings.name)
  const [examDate, setExamDate] = useState(settings.examDate || "")

  const handleSaveProfile = () => {
    updateSettings({ 
      name, 
      examDate: examDate || undefined 
    })
  }

  const handleExportData = () => {
    const data = {
      settings,
      sessions,
      lessonProgress,
      totalStudyTime,
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ccna-study-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleResetAllData = () => {
    localStorage.removeItem("ccna-study-storage")
    window.location.reload()
  }

  return (
    <>
      <Header title="Settings" description="Manage your preferences" />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-3xl space-y-6 p-4 md:p-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Personalize your study experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="examDate">Target Exam Date (Optional)</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Set a target date to track your countdown
                </p>
              </div>
              
              <Button onClick={handleSaveProfile}>
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Study Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Study Goals
              </CardTitle>
              <CardDescription>
                Set your daily study targets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Daily Study Goal</Label>
                  <span className="text-sm font-medium">{settings.dailyGoal} min</span>
                </div>
                <Slider
                  value={[settings.dailyGoal]}
                  onValueChange={([value]) => updateSettings({ dailyGoal: value })}
                  min={15}
                  max={180}
                  step={15}
                />
                <p className="text-xs text-muted-foreground">
                  How many minutes you want to study each day
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timer Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
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
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export or reset your study data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" onClick={handleExportData} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Reset All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your study progress, sessions, and settings.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, reset everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <p className="text-xs text-muted-foreground">
                Export your data as JSON before resetting if you want to keep a backup.
              </p>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                CCNA Study Tracker helps you prepare for your Cisco CCNA certification
                using Jeremy&apos;s IT Lab comprehensive course curriculum.
              </p>
              <p>
                Track your progress, manage study sessions with the Pomodoro technique,
                and visualize your learning journey with detailed analytics.
              </p>
              <Separator className="my-4" />
              <p className="text-xs">
                Curriculum based on Jeremy&apos;s IT Lab Free CCNA Course.
                Not affiliated with Cisco or Jeremy&apos;s IT Lab.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
