"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"
import { CreditCard, ArrowRight, Clock, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface Verification {
  id: string
  idNumber: string
  idType: string
  status: string
  timestamp: string
  conductorName?: string
}

export default function RecentVerifications() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const verificationsQuery = query(collection(db, "verifications"), orderBy("timestamp", "desc"), limit(5))

        const snapshot = await getDocs(verificationsQuery)

        if (snapshot.empty) {
          // Sample data for development
          setVerifications([
            {
              id: "v1",
              idNumber: "ST12345",
              idType: "Student ID",
              status: "valid",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              conductorName: "John Doe",
            },
            {
              id: "v2",
              idNumber: "SC6789",
              idType: "Senior Citizen ID",
              status: "valid",
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
              conductorName: "Jane Smith",
            },
            {
              id: "v3",
              idNumber: "PW4321",
              idType: "PWD ID",
              status: "valid",
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              conductorName: "Mike Johnson",
            },
          ])
        } else {
          const fetchedVerifications = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Verification[]

          setVerifications(fetchedVerifications)
        }
      } catch (error) {
        console.error("Error fetching verifications:", error)
        // Sample data for development
        setVerifications([
          {
            id: "v1",
            idNumber: "ST12345",
            idType: "Student ID",
            status: "valid",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            conductorName: "John Doe",
          },
          {
            id: "v2",
            idNumber: "SC6789",
            idType: "Senior Citizen ID",
            status: "valid",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            conductorName: "Jane Smith",
          },
          {
            id: "v3",
            idNumber: "PW4321",
            idType: "PWD ID",
            status: "valid",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            conductorName: "Mike Johnson",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchVerifications()
  }, [])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <CreditCard className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verified</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="border-b bg-muted/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent ID Verifications</CardTitle>
            <CardDescription className="text-xs mt-1">Latest commuter ID verifications</CardDescription>
          </div>
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/dashboard/id-verification">
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">View all verifications</span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {verifications.length > 0 ? (
          <div className="divide-y">
            {verifications.map((verification) => (
              <div key={verification.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {verification.idType} #{verification.idNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatTimestamp(verification.timestamp)}</p>
                  </div>
                </div>
                {getStatusBadge(verification.status)}
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
  )
}
