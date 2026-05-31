"use client"

import { useStudyStore } from "@/lib/store"
import { CURRICULUM, CCNA_DOMAINS, type CCNADomain } from "@/lib/data/curriculum"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function DomainProgress() {
  const { lessonProgress } = useStudyStore()
  
  // Calculate progress per domain
  const domainStats = Object.entries(CCNA_DOMAINS).map(([domainId, domain]) => {
    const domainLessons = CURRICULUM
      .flatMap(m => m.lessons)
      .filter(l => l.domain === domainId)
    
    const completedCount = domainLessons.filter(
      l => lessonProgress[l.id]?.status === "completed"
    ).length
    
    const percent = domainLessons.length > 0 
      ? Math.round((completedCount / domainLessons.length) * 100)
      : 0
    
    return {
      id: domainId as CCNADomain,
      name: domain.name,
      weight: domain.weight,
      completed: completedCount,
      total: domainLessons.length,
      percent,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Progress</CardTitle>
        <CardDescription>CCNA exam topic coverage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {domainStats.map((domain) => (
            <div key={domain.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{domain.name}</span>
                <span className="text-muted-foreground">
                  {domain.completed}/{domain.total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={domain.percent} className="h-2 flex-1" />
                <span className="w-10 text-right text-xs text-muted-foreground">
                  {domain.percent}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {domain.weight}% of exam
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
