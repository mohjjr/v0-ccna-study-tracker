import { create } from "zustand"
import { persist } from "zustand/middleware"

export type LessonStatus = "not-started" | "in-progress" | "completed"

export interface LessonProgress {
  lessonId: string
  status: LessonStatus
  completedAt?: string
  timeSpent: number // minutes
  notes: string
  labCompleted: boolean
}

export interface StudySession {
  id: string
  lessonId?: string
  lessonTitle?: string
  startTime: string
  endTime?: string
  duration: number // minutes
  notes: string
  topicsCovered: string[]
  completed: boolean
}

export interface UserSettings {
  name: string
  examDate?: string
  dailyGoal: number // minutes
  pomodoroLength: number // minutes
  breakLength: number // minutes
}

interface StudyState {
  // User settings
  settings: UserSettings
  hasCompletedOnboarding: boolean
  
  // Lesson progress
  lessonProgress: Record<string, LessonProgress>
  
  // Study sessions
  sessions: StudySession[]
  activeSession: StudySession | null
  
  // Computed stats
  currentStreak: number
  longestStreak: number
  totalStudyTime: number
  lastStudyDate: string | null
  
  // Actions
  updateSettings: (settings: Partial<UserSettings>) => void
  completeOnboarding: () => void
  
  // Lesson actions
  updateLessonProgress: (lessonId: string, progress: Partial<LessonProgress>) => void
  markLessonComplete: (lessonId: string) => void
  markLessonInProgress: (lessonId: string) => void
  resetLessonProgress: (lessonId: string) => void
  
  // Session actions
  startSession: (lessonId?: string, lessonTitle?: string) => void
  endSession: (notes?: string, topicsCovered?: string[]) => void
  cancelSession: () => void
  addManualSession: (session: Omit<StudySession, "id">) => void
  
  // Streak management
  checkAndUpdateStreak: () => void
  
  // Stats
  getCompletedLessonsCount: () => number
  getInProgressLessonsCount: () => number
  getTotalLessonsStudied: () => number
  getStudyTimeByDate: (date: string) => number
  getWeeklyStudyData: () => { day: string; minutes: number }[]
  getDomainProgress: () => Record<string, { completed: number; total: number }>
  
  // Weekly plan stats
  getCompletedLessonIds: () => string[]
  getTotalStudyTimeTodayInMinutes: () => number
}

const DEFAULT_SETTINGS: UserSettings = {
  name: "Student",
  dailyGoal: 60,
  pomodoroLength: 25,
  breakLength: 5,
}

function calendarDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isSameDay(date1: string, date2: string): boolean {
  return calendarDate(date1) === calendarDate(date2)
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return calendarDate(dateStr) === calendarDate(yesterday)
}

function isToday(dateStr: string): boolean {
  return calendarDate(dateStr) === calendarDate(new Date())
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: DEFAULT_SETTINGS,
      hasCompletedOnboarding: false,
      lessonProgress: {},
      sessions: [],
      activeSession: null,
      currentStreak: 0,
      longestStreak: 0,
      totalStudyTime: 0,
      lastStudyDate: null,
      
      // Settings actions
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },
      
      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true })
      },
      
      // Lesson progress actions
      updateLessonProgress: (lessonId, progress) => {
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: {
              ...state.lessonProgress[lessonId],
              lessonId,
              status: state.lessonProgress[lessonId]?.status || "not-started",
              timeSpent: state.lessonProgress[lessonId]?.timeSpent || 0,
              notes: state.lessonProgress[lessonId]?.notes || "",
              labCompleted: state.lessonProgress[lessonId]?.labCompleted || false,
              ...progress,
            },
          },
        }))
      },
      
      markLessonComplete: (lessonId) => {
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: {
              ...state.lessonProgress[lessonId],
              lessonId,
              status: "completed",
              completedAt: new Date().toISOString(),
              timeSpent: state.lessonProgress[lessonId]?.timeSpent || 0,
              notes: state.lessonProgress[lessonId]?.notes || "",
              labCompleted: state.lessonProgress[lessonId]?.labCompleted || false,
            },
          },
        }))
      },
      
      markLessonInProgress: (lessonId) => {
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: {
              ...state.lessonProgress[lessonId],
              lessonId,
              status: "in-progress",
              timeSpent: state.lessonProgress[lessonId]?.timeSpent || 0,
              notes: state.lessonProgress[lessonId]?.notes || "",
              labCompleted: state.lessonProgress[lessonId]?.labCompleted || false,
            },
          },
        }))
      },
      
      resetLessonProgress: (lessonId) => {
        set((state) => {
          const { [lessonId]: _, ...rest } = state.lessonProgress
          return { lessonProgress: rest }
        })
      },
      
      // Session actions
      startSession: (lessonId, lessonTitle) => {
        const session: StudySession = {
          id: crypto.randomUUID(),
          lessonId,
          lessonTitle,
          startTime: new Date().toISOString(),
          duration: 0,
          notes: "",
          topicsCovered: [],
          completed: false,
        }
        set({ activeSession: session })
        
        // Mark lesson as in progress if provided
        if (lessonId) {
          get().markLessonInProgress(lessonId)
        }
      },
      
      endSession: (notes = "", topicsCovered = []) => {
        const { activeSession, sessions, totalStudyTime, lastStudyDate } = get()
        if (!activeSession) return
        
        const endTime = new Date().toISOString()
        const duration = Math.round(
          (new Date(endTime).getTime() - new Date(activeSession.startTime).getTime()) / 60000
        )
        
        const completedSession: StudySession = {
          ...activeSession,
          endTime,
          duration,
          notes,
          topicsCovered,
          completed: true,
        }
        
        // Update lesson time spent
        if (activeSession.lessonId) {
          const currentProgress = get().lessonProgress[activeSession.lessonId]
          get().updateLessonProgress(activeSession.lessonId, {
            timeSpent: (currentProgress?.timeSpent || 0) + duration,
          })
        }
        
        set({
          activeSession: null,
          sessions: [...sessions, completedSession],
          totalStudyTime: totalStudyTime + duration,
          lastStudyDate: endTime,
        })
        
        // Check streak
        get().checkAndUpdateStreak()
      },
      
      cancelSession: () => {
        set({ activeSession: null })
      },
      
      addManualSession: (session) => {
        const newSession: StudySession = {
          ...session,
          id: crypto.randomUUID(),
        }
        set((state) => ({
          sessions: [...state.sessions, newSession],
          totalStudyTime: state.totalStudyTime + session.duration,
          lastStudyDate: session.endTime || session.startTime,
        }))
        get().checkAndUpdateStreak()
      },
      
      // Streak management
      checkAndUpdateStreak: () => {
        const { lastStudyDate, currentStreak, longestStreak } = get()
        const now = new Date().toISOString()
        
        if (!lastStudyDate) {
          set({ currentStreak: 1, longestStreak: Math.max(1, longestStreak) })
          return
        }
        
  if (isToday(lastStudyDate)) {
    // A persisted session can exist while the cached streak is still zero.
    if (currentStreak === 0) {
      set({ currentStreak: 1, longestStreak: Math.max(1, longestStreak) })
    }
    return
  }
        
        if (isYesterday(lastStudyDate)) {
          // Studied yesterday, increment streak
          const newStreak = currentStreak + 1
          set({
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, longestStreak),
          })
        } else {
          // Streak broken, reset to 1
          set({ currentStreak: 1 })
        }
      },
      
      // Stats getters
      getCompletedLessonsCount: () => {
        const { lessonProgress } = get()
        return Object.values(lessonProgress).filter(p => p.status === "completed").length
      },
      
      getInProgressLessonsCount: () => {
        const { lessonProgress } = get()
        return Object.values(lessonProgress).filter(p => p.status === "in-progress").length
      },
      
      getTotalLessonsStudied: () => {
        const { lessonProgress } = get()
        return Object.values(lessonProgress).filter(
          p => p.status === "completed" || p.status === "in-progress"
        ).length
      },
      
      getStudyTimeByDate: (date) => {
        const { sessions } = get()
        return sessions
          .filter(s => s.completed && isSameDay(s.startTime, date))
          .reduce((total, s) => total + s.duration, 0)
      },
      
      getWeeklyStudyData: () => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const result: { day: string; minutes: number }[] = []
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dayName = days[date.getDay()]
          const minutes = get().getStudyTimeByDate(date.toISOString())
          result.push({ day: dayName, minutes })
        }
        
        return result
      },
      
      getDomainProgress: () => {
        // This would need curriculum data - will be implemented when used
        return {}
      },
      
      getCompletedLessonIds: () => {
        const { lessonProgress } = get()
        return Object.entries(lessonProgress)
          .filter(([_, p]) => p.status === "completed")
          .map(([id]) => id)
      },
      
      getTotalStudyTimeTodayInMinutes: () => {
        const today = new Date().toISOString()
        return get().getStudyTimeByDate(today)
      },
    }),
    {
      name: "ccna-study-storage",
      onRehydrateStorage: () => (state) => {
        state?.checkAndUpdateStreak()
      },
    }
  )
)
