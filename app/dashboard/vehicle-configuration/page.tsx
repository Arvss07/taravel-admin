"use client"

import { useState, useEffect } from "react"
import { Bus, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppLayout from "@/components/layout/app-layout"
import { getVehicleTypes, initializeVehicleTypes, type VehicleType } from "@/lib/vehicle-types"
import VehicleTypeCard from "@/components/vehicles/vehicle-type-card"
import AddVehicleTypeModal from "@/components/vehicles/add-vehicle-type-modal"
import EditVehicleTypeModal from "@/components/vehicles/edit-vehicle-type-modal"
import DeleteVehicleTypeModal from "@/components/vehicles/delete-vehicle-type-modal"
import { useToast } from "@/hooks/use-toast"

export default function VehicleConfigurationPage() {
  const { toast } = useToast()
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | null>(null)

  // Load vehicle types on mount
  useEffect(() => {
    const loadVehicleTypes = () => {
      try {
        // Initialize with sample data if empty
        const types = initializeVehicleTypes()
        setVehicleTypes(types)
      } catch (error) {
        console.error("Error loading vehicle types:", error)
        toast({
          title: "Error",
          description: "Failed to load vehicle types. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadVehicleTypes()
  }, [toast])

  // Filter vehicle types based on search term and status filter
  const filteredVehicleTypes = vehicleTypes.filter((vehicleType) => {
    const matchesSearch =
      vehicleType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicleType.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && vehicleType.status === "active") ||
      (statusFilter === "maintenance" && vehicleType.status === "maintenance") ||
      (statusFilter === "inactive" && vehicleType.status === "inactive")

    return matchesSearch && matchesStatus
  })

  // Handle edit button click
  const handleEditClick = (vehicleType: VehicleType) => {
    setSelectedVehicleType(vehicleType)
    setIsEditModalOpen(true)
  }

  // Handle delete button click
  const handleDeleteClick = (vehicleType: VehicleType) => {
    setSelectedVehicleType(vehicleType)
    setIsDeleteModalOpen(true)
  }

  // Refresh vehicle types list
  const refreshVehicleTypes = () => {
    const updatedTypes = getVehicleTypes()
    setVehicleTypes(updatedTypes)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bus/Van Configuration</h1>
            <p className="text-muted-foreground">Manage vehicle types and their configurations</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle Type
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vehicle types..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <p>Loading vehicle types...</p>
          </div>
        ) : filteredVehicleTypes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredVehicleTypes.map((vehicleType) => (
              <VehicleTypeCard
                key={vehicleType.id}
                vehicleType={vehicleType}
                onEdit={() => handleEditClick(vehicleType)}
                onDelete={() => handleDeleteClick(vehicleType)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Bus className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="mb-1 text-lg font-medium">No vehicle types found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter"
                : "Get started by adding your first vehicle type"}
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle Type
            </Button>
          </div>
        )}
      </div>

      {/* Add Vehicle Type Modal */}
      <AddVehicleTypeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refreshVehicleTypes()
          setIsAddModalOpen(false)
          toast({
            title: "Vehicle Type Added",
            description: "The vehicle type has been successfully added.",
            variant: "success",
          })
        }}
      />

      {/* Edit Vehicle Type Modal */}
      {selectedVehicleType && (
        <EditVehicleTypeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          vehicleType={selectedVehicleType}
          onSuccess={() => {
            refreshVehicleTypes()
            setIsEditModalOpen(false)
            toast({
              title: "Vehicle Type Updated",
              description: "The vehicle type has been successfully updated.",
              variant: "success",
            })
          }}
        />
      )}

      {/* Delete Vehicle Type Modal */}
      {selectedVehicleType && (
        <DeleteVehicleTypeModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          vehicleType={selectedVehicleType}
          onSuccess={() => {
            refreshVehicleTypes()
            setIsDeleteModalOpen(false)
            toast({
              title: "Vehicle Type Deleted",
              description: "The vehicle type has been successfully deleted.",
              variant: "success",
            })
          }}
        />
      )}
    </AppLayout>
  )
}
