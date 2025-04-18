"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/firebase"

interface Vehicle {
  id: string
  type: string
  capacity: number
  licensePlate: string
  status: string
  driverId?: string
  driverName?: string
}

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehiclesSnapshot = await getDocs(collection(db, "vehicles"))

        if (vehiclesSnapshot.empty) {
          // Sample data for development
          setVehicles([
            {
              id: "v1",
              type: "Bus",
              capacity: 45,
              licensePlate: "ABC-123",
              status: "active",
              driverId: "d1",
              driverName: "John Doe",
            },
            {
              id: "v2",
              type: "Van",
              capacity: 15,
              licensePlate: "XYZ-789",
              status: "active",
              driverId: "d2",
              driverName: "Jane Smith",
            },
            {
              id: "v3",
              type: "Bus",
              capacity: 50,
              licensePlate: "DEF-456",
              status: "maintenance",
            },
          ])
        } else {
          const vehiclesData = vehiclesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Vehicle[]
          
          setVehicles(vehiclesData)
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error)
        // Sample data for development
        setVehicles([
          {
            id: "v1",
            type: "Bus",
            capacity: 45,
            licensePlate: "ABC-123",
            status: "active",
            driverId: "d1",
            driverName: "John Doe",
          },
          {
            id: "v2",
            type: "Van",
            capacity: 15,
            licensePlate: "XYZ-789",
            status: "active",
            driverId: "d2",
            driverName: "Jane Smith",
          },
          {
            id: "v3",
            type: "Bus",
            capacity: 50,
            licensePlate: "DEF-456",
            status: "maintenance",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.driverName && vehicle.driverName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter = filterType === "all" || vehicle.type.toLowerCase() === filterType.toLowerCase()

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vehicles..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          &lt;Select value={filterType} onValueChange={setFilterType}&gt;\
\
\
