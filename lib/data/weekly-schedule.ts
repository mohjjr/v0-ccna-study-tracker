import { getLessonById, getAllLessons } from './curriculum'

export interface WeekSchedule {
  week: number
  startDay: number
  endDay: number
  lessons: ReturnType<typeof getLessonById>[]
}

// 6-week study plan distribution
const WEEK_DISTRIBUTION = [
  { week: 1, startDay: 1, endDay: 10 },   // Network Fundamentals
  { week: 2, startDay: 11, endDay: 20 },  // Network Access
  { week: 3, startDay: 21, endDay: 33 },  // IP Connectivity
  { week: 4, startDay: 34, endDay: 47 },  // IP Services/Security start
  { week: 5, startDay: 48, endDay: 57 },  // Security/Wireless
  { week: 6, startDay: 58, endDay: 68 },  // Automation & Programmability
]

// Helper function to get all weeks
export function getAllWeeks(): WeekSchedule[] {
  return WEEK_DISTRIBUTION.map(({ week, startDay, endDay }) => {
    const lessons: any[] = []
    const allLessons = getAllLessons()
    
    for (let day = startDay; day <= endDay; day++) {
      const lesson = allLessons.find(l => l.day === day)
      if (lesson) {
        lessons.push(lesson)
      }
    }
    
    return {
      week,
      startDay,
      endDay,
      lessons,
    }
  })
}

// Helper function to get a specific week
export function getWeekByNumber(weekNumber: number): WeekSchedule | undefined {
  const weeks = getAllWeeks()
  return weeks.find(w => w.week === weekNumber)
}

// Helper function to get current week based on date
export function getCurrentWeek(): number {
  const startDate = new Date('2024-01-08') // Course start date
  const today = new Date()
  const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const weekNumber = Math.floor(daysElapsed / 7) + 1
  return Math.max(1, Math.min(6, weekNumber))
}

// Helper function to get weeks with progress
export interface WeekProgress extends WeekSchedule {
  tasksAssigned: number
  tasksCompleted: number
  progressPercentage: number
  completedLessons: string[]
}

export function getWeeksWithProgress(completedLessons: string[]): WeekProgress[] {
  const weeks = getAllWeeks()
  
  return weeks.map(week => {
    const weekLessonIds = week.lessons.map(l => l.id)
    const completedInWeek = completedLessons.filter(id => weekLessonIds.includes(id))
    const tasksAssigned = week.lessons.length * 2 // Each lesson has a lab
    const tasksCompleted = completedInWeek.length * 2
    const progressPercentage = tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0
    
    return {
      ...week,
      tasksAssigned,
      tasksCompleted,
      progressPercentage,
      completedLessons: completedInWeek,
    }
  })
}

// Helper function to get schedule status
export function getScheduleStatus(weekNumber: number, progressPercentage: number): 'ahead' | 'on-track' | 'behind' {
  const expectedCompletion = (weekNumber / 6) * 100
  
  if (progressPercentage >= expectedCompletion + 10) {
    return 'ahead'
  } else if (progressPercentage < expectedCompletion - 10) {
    return 'behind'
  }
  return 'on-track'
}

// Helper function to estimate completion date
export function estimateCompletionDate(totalLessonsCompleted: number): Date {
  const avgLessonsPerWeek = totalLessonsCompleted > 0 ? totalLessonsCompleted / (getCurrentWeek() - 1 || 1) : 11
  const remainingLessons = 68 - totalLessonsCompleted
  const weeksRemaining = Math.ceil(remainingLessons / avgLessonsPerWeek)
  
  const completionDate = new Date()
  completionDate.setDate(completionDate.getDate() + weeksRemaining * 7)
  
  return completionDate
}
