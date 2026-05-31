"use client"

import { Header } from "@/components/layout/header"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { ProgressCards } from "@/components/dashboard/progress-cards"
import { WeeklyPlanCard } from "@/components/dashboard/weekly-plan-card"
import { WeeklyChart } from "@/components/dashboard/weekly-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DomainProgress } from "@/components/dashboard/domain-progress"
import { WeeklyPlanCard } from "@/components/dashboard/weekly-plan-card"

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" description="Track your CCNA certification journey" />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl space-y-6 p-4 md:p-6">
          <WelcomeBanner />
          <ProgressCards />
          <WeeklyPlanCard />
          <div className="grid gap-6 lg:grid-cols-3">
            <WeeklyPlanCard />
            <WeeklyChart />
            <RecentActivity />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <DomainProgress />
          </div>
        </div>
      </main>
    </>
  )
}
