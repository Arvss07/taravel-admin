"use client"

import { Bus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteVehicleType, type VehicleType } from "@/lib/vehicle-types"

interface DeleteVehicleTypeModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleType: VehicleType
  onSuccess: () => void
}

export default function DeleteVehicleTypeModal({
  isOpen,
  onClose,
  vehicleType,
  onSuccess,
}: DeleteVehicleTypeModalProps) {
  const handleDelete = () => {
    deleteVehicleType(vehicleType.id)
    onSuccess()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Vehicle Type</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the vehicle type <strong>{vehicleType.name}</strong>? This action cannot be
            undone.
          </AlertDialogDescription>
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-blue-600" />
              <span className="font-medium">{vehicleType.name}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">{vehicleType.description}</div>
            <div className="text-sm mt-2">
              <span className="font-medium">Capacity:</span> {vehicleType.capacity} passengers
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
