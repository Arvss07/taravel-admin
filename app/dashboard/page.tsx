"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import AppLayout from "@/components/layout/app-layout"
import { useAuth } from "@/lib/auth-context"
import DashboardOverview from "@/components/dashboard/dashboard-overview"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Simplify the authentication check
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <AppLayout>
      <DashboardOverview />
    </AppLayout>
  )
}
