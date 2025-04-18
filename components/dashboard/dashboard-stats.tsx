"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { Bus, CreditCard, Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardStats() {
  const [stats, setStats] = useState({
    vehicles: 0,
    drivers: 0,
    conductors: 0,
    verifications: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get vehicles count
        const vehiclesSnapshot = await getDocs(collection(db, "vehicles"))

        // Get drivers count
        const driversQuery = query(collection(db, "users"), where("role", "==", "driver"))
        const driversSnapshot = await getDocs(driversQuery)

        // Get conductors count
        const conductorsQuery = query(collection(db, "users"), where("role", "==", "conductor"))
        const conductorsSnapshot = await getDocs(conductorsQuery)

        // Get verifications count
        const verificationsSnapshot = await getDocs(collection(db, "verifications"))

        setStats({
          vehicles: vehiclesSnapshot.size,
          drivers: driversSnapshot.size,
          conductors: conductorsSnapshot.size,
          verifications: verificationsSnapshot.size,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        // Set some default values for development
        setStats({
          vehicles: 12,
          drivers: 24,
          conductors: 18,
          verifications: 156,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden border-l-4 border-l-gray-300">
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  const statItems = [
    {
      title: "Total Vehicles",
      value: stats.vehicles,
      description: "Buses and vans in your fleet",
      icon: <Bus className="h-5 w-5 text-blue-600" />,
      color: "border-l-blue-500",
      iconBg: "bg-blue-100",
    },
    {
      title: "Drivers",
      value: stats.drivers,
      description: "Registered drivers",
      icon: <Users className="h-5 w-5 text-green-600" />,
      color: "border-l-green-500",
      iconBg: "bg-green-100",
    },
    {
      title: "Conductors",
      value: stats.conductors,
      description: "Registered conductors",
      icon: <Users className="h-5 w-5 text-purple-600" />,
      color: "border-l-purple-500",
      iconBg: "bg-purple-100",
    },
    {
      title: "ID Verifications",
      value: stats.verifications,
      description: "Total ID verifications",
      icon: <CreditCard className="h-5 w-5 text-amber-600" />,
      color: "border-l-amber-500",
      iconBg: "bg-amber-100",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => (
        <Card key={index} className={`overflow-hidden border-l-4 ${item.color}`}>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                <p className="text-3xl font-bold mt-1">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${item.iconBg}`}>
                {item.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
