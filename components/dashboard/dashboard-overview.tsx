"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  ShieldAlert,
  Users,
  Bus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { getVerifications, getIdsNeedingAttention, type Verification } from "@/lib/storage"
import { Badge } from "@/components/ui/badge"

// Helper function to format timestamps
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHrs < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
  } else if (diffHrs < 24) {
    return `${diffHrs} hour${diffHrs !== 1 ? "s" : ""} ago`
  } else {
    const diffDays = Math.floor(diffHrs / 24)
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  }
}

export default function DashboardOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    validVerifications: 0,
    rejectedVerifications: 0,
    totalVerifications: 0,
    needsAttentionCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentVerifications, setRecentVerifications] = useState<Verification[]>([])
  const [needsAttentionIds, setNeedsAttentionIds] = useState<Verification[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user?.id) return

        // Get verifications
        const verifications = getVerifications()
        const pendingVerifications = verifications.filter((v) => v.status === "pending")
        const validVerifications = verifications.filter((v) => v.status === "valid")
        const rejectedVerifications = verifications.filter((v) => v.status === "rejected")

        // Get IDs needing attention (expired or needs revalidation)
        const attentionIds = getIdsNeedingAttention()

        // Get recent verifications (limit to 3)
        const recent = [...verifications]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 3)

        setRecentVerifications(recent)
        setNeedsAttentionIds(attentionIds)
        setStats({
          pendingVerifications: pendingVerifications.length,
          validVerifications: validVerifications.length,
          rejectedVerifications: rejectedVerifications.length,
          totalVerifications: verifications.length,
          needsAttentionCount: attentionIds.length,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchStats()
    }
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/dashboard/id-verification">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Verification Center</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold">{stats.pendingVerifications}</p>
              {stats.pendingVerifications > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <Link href="/dashboard/id-verification">
                    <ArrowRight className="h-4 w-4" />
                    <span className="sr-only">View pending verifications</span>
                  </Link>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Verified IDs</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold">{stats.validVerifications}</p>
              {stats.validVerifications > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <Link href="/dashboard/id-verification?tab=history&status=valid">
                    <ArrowRight className="h-4 w-4" />
                    <span className="sr-only">View verified IDs</span>
                  </Link>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Successfully verified</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-red-500">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Rejected IDs</CardTitle>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold">{stats.rejectedVerifications}</p>
              {stats.rejectedVerifications > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <Link href="/dashboard/id-verification?tab=history&status=rejected">
                    <ArrowRight className="h-4 w-4" />
                    <span className="sr-only">View rejected IDs</span>
                  </Link>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Rejected verifications</p>
          </CardContent>
        </Card>

        <Card
          className={`overflow-hidden border-l-4 ${stats.needsAttentionCount > 0 ? "border-l-amber-500 bg-amber-50/50" : "border-l-gray-300"}`}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
              <AlertTriangle
                className={`h-4 w-4 ${stats.needsAttentionCount > 0 ? "text-amber-500" : "text-muted-foreground"}`}
              />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold">{stats.needsAttentionCount}</p>
              {stats.needsAttentionCount > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <Link href="/dashboard/id-verification?tab=attention">
                    <ArrowRight className="h-4 w-4" />
                    <span className="sr-only">View IDs needing attention</span>
                  </Link>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Verifications</CardTitle>
                <CardDescription className="text-xs mt-1">Latest ID verification activity</CardDescription>
              </div>
              {stats.totalVerifications > 0 && (
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <Link href="/dashboard/id-verification">
                    <ArrowRight className="h-4 w-4" />
                    <span className="sr-only">View all verifications</span>
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentVerifications.length > 0 ? (
              <div className="divide-y">
                {recentVerifications.map((verification) => (
                  <div key={verification.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {verification.idType.charAt(0).toUpperCase() + verification.idType.slice(1)} ID #
                          {verification.idNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(verification.timestamp)}</p>
                      </div>
                    </div>
                    <Badge
                      className={`${
                        verification.status === "valid"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : verification.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {verification.status === "valid"
                        ? "Verified"
                        : verification.status === "pending"
                          ? "Pending"
                          : "Rejected"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium">No verifications yet</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                  When IDs are submitted for verification, they will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`overflow-hidden ${stats.needsAttentionCount > 0 ? "border-amber-200 bg-amber-50/30" : ""}`}>
          <CardHeader className="border-b bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Attention Required</CardTitle>
                <CardDescription className="text-xs mt-1">Expired or needs revalidation</CardDescription>
              </div>
              {needsAttentionIds.length > 0 && (
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <Link href="/dashboard/id-verification?tab=attention">
                    <ArrowRight className="h-4 w-4" />
                    <span className="sr-only">View all IDs needing attention</span>
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {needsAttentionIds.length > 0 ? (
              <div className="divide-y">
                {needsAttentionIds.slice(0, 3).map((verification) => {
                  const isExpired =
                    verification.idType === "student" &&
                    verification.expirationDate &&
                    new Date(verification.expirationDate) < new Date()

                  return (
                    <div key={verification.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {verification.idType.charAt(0).toUpperCase() + verification.idType.slice(1)} ID #
                            {verification.idNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isExpired
                              ? `Expired on ${new Date(verification.expirationDate!).toLocaleDateString()}`
                              : `Needs revalidation since ${new Date(verification.lastRevalidationDate!).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"
                      >
                        {isExpired ? "Expired" : "Revalidate"}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium">All IDs are up to date</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                  There are no IDs that require your attention at this time.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader className="border-b bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">System Overview</CardTitle>
                <CardDescription className="text-xs mt-1">Summary of your verification system</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Verifications</p>
                    <p className="text-2xl font-bold">{stats.totalVerifications}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Verification Rate</p>
                    <p className="text-2xl font-bold">
                      {stats.totalVerifications > 0
                        ? Math.round((stats.validVerifications / stats.totalVerifications) * 100)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                    <Bus className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Active Vehicles</p>
                    <p className="text-2xl font-bold">
                      {/* This would need to be fetched from the vehicles data */}
                      {3}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <CardDescription className="text-xs mt-1">Common tasks and actions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 divide-y">
              <Button variant="ghost" asChild className="flex h-auto items-center justify-start gap-3 p-4 text-left">
                <Link href="/dashboard/id-verification">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Verification Center</p>
                    <p className="text-xs text-muted-foreground">Review and manage ID verifications</p>
                  </div>
                </Link>
              </Button>
              <Button variant="ghost" asChild className="flex h-auto items-center justify-start gap-3 p-4 text-left">
                <Link href="/dashboard/vehicle-configuration">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                    <Bus className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Vehicle Management</p>
                    <p className="text-xs text-muted-foreground">Manage your fleet and vehicles</p>
                  </div>
                </Link>
              </Button>
              <Button variant="ghost" asChild className="flex h-auto items-center justify-start gap-3 p-4 text-left">
                <Link href="/dashboard/account-management">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">User Management</p>
                    <p className="text-xs text-muted-foreground">Manage drivers and conductors</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
