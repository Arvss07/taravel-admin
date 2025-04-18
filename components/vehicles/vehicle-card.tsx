import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Vehicle } from "@/lib/storage"

interface VehicleCardProps {
  vehicle: Vehicle
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{vehicle.type}</CardTitle>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              vehicle.status === "active"
                ? "bg-green-100 text-green-800"
                : vehicle.status === "maintenance"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {vehicle.status === "active" ? "Active" : vehicle.status === "maintenance" ? "Maintenance" : vehicle.status}
          </div>
        </div>
        <CardDescription>{vehicle.licensePlate}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">ID</p>
            <p className="font-medium">{vehicle.id}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Capacity</p>
            <p className="font-medium">{vehicle.capacity} passengers</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Driver</p>
            <p className="font-medium">{vehicle.driverName || "Not assigned"}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
