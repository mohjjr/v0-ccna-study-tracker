"use client"

import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import SessionsPageContent from "./sessions-content"

export default function SessionsPage() {
  return (
    <>
      <Header title="Study Sessions" description="Focus with the Pomodoro technique" />
      <Suspense fallback={<div className="flex-1 overflow-y-auto" />}>
        <SessionsPageContent />
      </Suspense>
    </>
  )
}
