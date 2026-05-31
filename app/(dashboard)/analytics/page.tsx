"use client"

import { Header } from "@/components/layout/header"
import { TimeTrendsChart } from "@/components/analytics/time-trends-chart"
import { DomainProgressChart } from "@/components/analytics/domain-progress-chart"
import { StudyHeatmap } from "@/components/analytics/study-heatmap"
import { StatsCards } from "@/components/analytics/stats-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyticsPage() {
  return (
    <>
      <Header title="Analytics" description="Track your study performance" />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-6xl space-y-6 p-4 md:p-6">
          {/* Stats Overview */}
          <StatsCards />
          
          {/* Time Trends with Period Selector */}
          <Tabs defaultValue="week" className="space-y-4">
            <TabsList>
              <TabsTrigger value="week">Past Week</TabsTrigger>
              <TabsTrigger value="month">Past Month</TabsTrigger>
            </TabsList>
            <TabsContent value="week">
              <TimeTrendsChart period="week" />
            </TabsContent>
            <TabsContent value="month">
              <TimeTrendsChart period="month" />
            </TabsContent>
          </Tabs>
          
          {/* Domain Progress and Heatmap */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DomainProgressChart />
            <StudyHeatmap />
          </div>
        </div>
      </main>
    </>
  )
}
