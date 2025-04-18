"use client"

import { Bus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { VehicleType } from "@/lib/vehicle-types"

interface VehicleTypeCardProps {
  vehicleType: VehicleType
  onEdit: () => void
  onDelete: () => void
}

export default function VehicleTypeCard({ vehicleType, onEdit, onDelete }: VehicleTypeCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-amber-100 text-amber-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className={!vehicleType.isActive ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-blue-600" />
            <CardTitle>{vehicleType.name}</CardTitle>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicleType.status)}`}>
            {vehicleType.status === "active"
              ? "Active"
              : vehicleType.status === "maintenance"
                ? "Maintenance"
                : "Inactive"}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{vehicleType.description}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Max Capacity</p>
            <p className="font-medium">{vehicleType.capacity} passengers</p>
          </div>
          <div>
            <p className="text-muted-foreground">Seating</p>
            <p className="font-medium">{vehicleType.seatingArrangement}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{formatDate(vehicleType.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">ID</p>
            <p className="font-medium text-xs truncate">{vehicleType.id}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
