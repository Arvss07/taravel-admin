// Vehicle type model
export interface VehicleType {
  id: string
  name: string
  description: string
  capacity: number
  seatingArrangement: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  status: "active" | "maintenance" | "inactive"
}

// Get vehicle types from localStorage
export function getVehicleTypes(): VehicleType[] {
  try {
    const vehicleTypes = localStorage.getItem("vehicleTypes")
    if (!vehicleTypes) {
      console.warn("No vehicle types found in localStorage")
      return []
    }
    return JSON.parse(vehicleTypes) as VehicleType[]
  } catch (error) {
    console.error("Error retrieving vehicle types:", error)
    return []
  }
}

// Get a single vehicle type by ID
export function getVehicleType(id: string): VehicleType | null {
  const vehicleTypes = getVehicleTypes()
  return vehicleTypes.find((vt) => vt.id === id) || null
}

// Create a new vehicle type
export function createVehicleType(vehicleType: Omit<VehicleType, "id" | "createdAt" | "updatedAt">): VehicleType {
  const vehicleTypes = getVehicleTypes()

  const newVehicleType: VehicleType = {
    ...vehicleType,
    id: Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  vehicleTypes.push(newVehicleType)
  localStorage.setItem("vehicleTypes", JSON.stringify(vehicleTypes))

  // Log the operation in JSON format for Firebase compatibility
  console.log(
    JSON.stringify(
      {
        operation: "create_vehicle_type",
        vehicleType: newVehicleType,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    ),
  )

  return newVehicleType
}

// Update an existing vehicle type
export function updateVehicleType(id: string, updates: Partial<Omit<VehicleType, "id" | "createdAt">>): boolean {
  const vehicleTypes = getVehicleTypes()
  const index = vehicleTypes.findIndex((vt) => vt.id === id)

  if (index >= 0) {
    vehicleTypes[index] = {
      ...vehicleTypes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem("vehicleTypes", JSON.stringify(vehicleTypes))

    // Log the operation in JSON format for Firebase compatibility
    console.log(
      JSON.stringify(
        {
          operation: "update_vehicle_type",
          vehicleTypeId: id,
          updates: updates,
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
    )

    return true
  }

  return false
}

// Delete a vehicle type
export function deleteVehicleType(id: string): boolean {
  const vehicleTypes = getVehicleTypes()
  const filteredVehicleTypes = vehicleTypes.filter((vt) => vt.id !== id)

  if (filteredVehicleTypes.length < vehicleTypes.length) {
    localStorage.setItem("vehicleTypes", JSON.stringify(filteredVehicleTypes))

    // Log the operation in JSON format for Firebase compatibility
    console.log(
      JSON.stringify(
        {
          operation: "delete_vehicle_type",
          vehicleTypeId: id,
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
    )

    return true
  }

  return false
}

// Initialize vehicle types with sample data
export function initializeVehicleTypes() {
  const existingVehicleTypes = getVehicleTypes()

  if (existingVehicleTypes.length === 0) {
    const sampleVehicleTypes: VehicleType[] = [
      {
        id: "vt1",
        name: "Standard Bus",
        description: "40-seat standard city bus",
        capacity: 40,
        seatingArrangement: "2x2 with center aisle",
        isActive: true,
        status: "active",
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "vt2",
        name: "Mini Bus",
        description: "25-seat mini bus for narrow routes",
        capacity: 25,
        seatingArrangement: "2x1 with side aisle",
        isActive: true,
        status: "active",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "vt3",
        name: "Passenger Van",
        description: "15-seat passenger van for short routes",
        capacity: 15,
        seatingArrangement: "3 rows of bench seats",
        isActive: true,
        status: "active",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "vt4",
        name: "Articulated Bus",
        description: "60-seat articulated bus for high-traffic routes",
        capacity: 60,
        seatingArrangement: "2x2 with extended cabin",
        isActive: false,
        status: "inactive",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    localStorage.setItem("vehicleTypes", JSON.stringify(sampleVehicleTypes))

    // Log the operation in JSON format for Firebase compatibility
    console.log(
      JSON.stringify(
        {
          operation: "initialize_vehicle_types",
          count: sampleVehicleTypes.length,
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
    )

    return sampleVehicleTypes
  }

  return existingVehicleTypes
}
