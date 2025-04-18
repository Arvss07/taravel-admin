"use client"

import { useState } from "react"
import { ArrowLeft, Bus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createVehicleType } from "@/lib/vehicle-types"

interface AddVehicleTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddVehicleTypeModal({ isOpen, onClose, onSuccess }: AddVehicleTypeModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [capacity, setCapacity] = useState("")
  const [seatingArrangement, setSeatingArrangement] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [status, setStatus] = useState<"active" | "maintenance" | "inactive">("active")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form on close
  const handleClose = () => {
    setName("")
    setDescription("")
    setCapacity("")
    setSeatingArrangement("")
    setIsActive(true)
    setStatus("active")
    setErrors({})
    onClose()
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Vehicle type name is required"
    }

    if (!description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!capacity) {
      newErrors.capacity = "Maximum capacity is required"
    } else if (isNaN(Number(capacity)) || Number(capacity) <= 0) {
      newErrors.capacity = "Capacity must be a positive number"
    }

    if (!seatingArrangement.trim()) {
      newErrors.seatingArrangement = "Seating arrangement is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    // Create new vehicle type
    createVehicleType({
      name,
      description,
      capacity: Number(capacity),
      seatingArrangement,
      isActive,
      status,
    })

    onSuccess()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-auto max-h-[90vh]">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create Vehicle Type</h2>
              <p className="text-muted-foreground">Add a new vehicle type to the system</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleClose} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to List
            </Button>
          </div>

          <div className="border rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Vehicle Type Information</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="block mb-1">
                    Vehicle Type Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Standard Bus, Mini Van"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="description" className="block mb-1">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a description of this vehicle type"
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity" className="block mb-1">
                      Maximum Capacity
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="Number of seats"
                      min="1"
                      className={errors.capacity ? "border-red-500" : ""}
                    />
                    {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
                  </div>

                  <div>
                    <Label htmlFor="seatingArrangement" className="block mb-1">
                      Seating Arrangement
                    </Label>
                    <Input
                      id="seatingArrangement"
                      value={seatingArrangement}
                      onChange={(e) => setSeatingArrangement(e.target.value)}
                      placeholder="e.g., 2x2 with center aisle"
                      className={errors.seatingArrangement ? "border-red-500" : ""}
                    />
                    {errors.seatingArrangement && (
                      <p className="text-red-500 text-sm mt-1">{errors.seatingArrangement}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status" className="block mb-1">
                      Status
                    </Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Bus className="h-4 w-4" />
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
