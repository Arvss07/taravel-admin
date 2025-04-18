// Types
// Update the User interface to include new fields
export interface User {
  id: string
  name: string
  email?: string // Now optional
  password: string // In a real app, this would be hashed
  role: "admin" | "organization" | "driver" | "conductor" | "individual"
  status: "active" | "inactive" | "disabled"
  createdAt: string
  organizationId?: string
  accountType?: "organization" | "individual"
  serviceType?: "bus" | "van"
  accessKey?: string
  masterKey?: string // Only for organization accounts
  username?: string // Format: org first 3 letters + last 2 digits of year + 5-digit unique number
  vehicles?: VehicleCount[] // Array of vehicle counts by type
  contactNumber?: string // Added for both individual and organization
  secondaryContactNumber?: string // Added for organization
  contactPerson?: string // Added for organization
  totalVehicles?: number // Total number of vehicles
}

// Add a new interface for vehicle counts
export interface VehicleCount {
  vehicleTypeId: string
  count: number
}

export interface Vehicle {
  id: string
  type: string
  licensePlate: string
  capacity: number
  status: "active" | "maintenance" | "inactive"
  driverId?: string
  driverName?: string
  createdAt: string
  lastMaintenance?: string
  notes?: string
  organizationId: string
}

// Update the Verification interface to handle multiple images
export interface Verification {
  id: string
  idNumber: string
  idType: "student" | "senior" | "pwd" | "other"
  status: "valid" | "invalid" | "pending" | "rejected"
  timestamp: string
  imageUrls?: string[] // Changed from imageUrl to imageUrls as an array
  rejectionReason?: string
  uploaderId: string
  uploaderName: string
  organizationId: string
  expirationDate?: string // For student IDs
  lastRevalidationDate?: string // For senior/PWD IDs
  needsRevalidation?: boolean // Flag for IDs needing revalidation
  userNotified?: boolean // Flag for expired ID notification
  notificationDate?: string // Date when user was notified
}

// Initialize local storage with sample data if empty
export function initializeStorage() {
  // Check if storage is already initialized
  if (localStorage.getItem("storage_initialized")) {
    return
  }

  const adminId = "admin1"
  const orgId = "org1"

  // Sample users - only admin
  const users: User[] = [
    {
      id: adminId,
      name: "Admin User",
      email: "admin@example.com",
      password: "password", // In a real app, this would be hashed
      role: "admin",
      status: "active",
      createdAt: "2023-01-01T00:00:00.000Z",
    },
  ]

  // Sample vehicles
  const vehicles: Vehicle[] = [
    // {
    //   id: "v1",
    //   type: "Bus",
    //   licensePlate: "ABC-123",
    //   capacity: 45,
    //   status: "active",
    //   driverName: "John Doe",
    //   createdAt: "2023-02-10T00:00:00.000Z",
    //   lastMaintenance: "2023-04-15T00:00:00.000Z",
    //   notes: "Regular maintenance performed. All systems operational.",
    //   organizationId: orgId,
    // },
    // {
    //   id: "v2",
    //   type: "Van",
    //   licensePlate: "XYZ-789",
    //   capacity: 15,
    //   status: "active",
    //   driverName: "Jane Smith",
    //   createdAt: "2023-02-20T00:00:00.000Z",
    //   lastMaintenance: "2023-04-10T00:00:00.000Z",
    //   organizationId: orgId,
    // },
    // {
    //   id: "v3",
    //   type: "Bus",
    //   licensePlate: "DEF-456",
    //   capacity: 50,
    //   status: "maintenance",
    //   createdAt: "2023-03-05T00:00:00.000Z",
    //   lastMaintenance: "2023-04-20T00:00:00.000Z",
    //   notes: "Engine maintenance in progress.",
    //   organizationId: orgId,
    // },
  ]

  // Get current date and calculate dates for sample data
  const now = new Date()
  const oneYearFromNow = new Date(now)
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

  const sixMonthsAgo = new Date(now)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const oneYearAgo = new Date(now)
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const twoMonthsFromNow = new Date(now)
  twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)

  // Sample verifications with uploaded IDs - more comprehensive data
  const verifications: Verification[] = [
    // Pending verifications
    // {
    //   id: "ver1",
    //   idNumber: "ST12345",
    //   idType: "student",
    //   status: "pending",
    //   timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    //   imageUrls: [
    //     "/placeholder.svg?height=300&width=500",
    //     "/placeholder.svg?height=300&width=500&text=ID-Front",
    //     "/placeholder.svg?height=300&width=500&text=ID-Back",
    //   ],
    //   uploaderId: "user1",
    //   uploaderName: "Maria Garcia",
    //   organizationId: orgId,
    // },
    // {
    //   id: "ver2",
    //   idNumber: "SC6789",
    //   idType: "senior",
    //   status: "pending",
    //   timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    //   imageUrls: ["/placeholder.svg?height=300&width=500"],
    //   uploaderId: "user2",
    //   uploaderName: "Robert Chen",
    //   organizationId: orgId,
    // },
    // {
    //   id: "ver3",
    //   idNumber: "PW4321",
    //   idType: "pwd",
    //   status: "pending",
    //   timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    //   imageUrls: ["/placeholder.svg?height=300&width=500"],
    //   uploaderId: "user3",
    //   uploaderName: "James Wilson",
    //   organizationId: orgId,
    // },

    // // Valid verifications
    // {
    //   id: "ver4",
    //   idNumber: "ST7890",
    //   idType: "student",
    //   status: "valid",
    //   timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    //   imageUrls: [
    //     "/placeholder.svg?height=300&width=500&text=Student-ID-Front",
    //     "/placeholder.svg?height=300&width=500&text=Student-ID-Back",
    //   ],
    //   uploaderId: "user4",
    //   uploaderName: "Emily Johnson",
    //   organizationId: orgId,
    //   expirationDate: oneYearFromNow.toISOString(), // Expires in one year
    // },
    // {
    //   id: "ver5",
    //   idNumber: "SC2468",
    //   idType: "senior",
    //   status: "valid",
    //   timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    //   imageUrls: ["/placeholder.svg?height=300&width=500"],
    //   uploaderId: "user5",
    //   uploaderName: "David Brown",
    //   organizationId: orgId,
    //   lastRevalidationDate: sixMonthsAgo.toISOString(), // Revalidated 6 months ago
    //   needsRevalidation: false,
    // },
    // {
    //   id: "ver6",
    //   idNumber: "PW9876",
    //   idType: "pwd",
    //   status: "valid",
    //   timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    //   imageUrls: ["/placeholder.svg?height=300&width=500"],
    //   uploaderId: "user6",
    //   uploaderName: "Sophia Martinez",
    //   organizationId: orgId,
    //   lastRevalidationDate: oneYearAgo.toISOString(), // Revalidated 1 year ago
    //   needsRevalidation: true, // Needs revalidation
    // },

    // // Rejected verifications
    // {
    //   id: "ver7",
    //   idNumber: "ST5432",
    //   idType: "student",
    //   status: "rejected",
    //   timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    //   imageUrls: ["/placeholder.svg?height=300&width=500"],
    //   rejectionReason: "ID appears to be expired. Please upload a valid ID.",
    //   uploaderId: "user7",
    //   uploaderName: "Daniel Lee",
    //   organizationId: orgId,
    // },
    // {
    //   id: "ver8",
    //   idNumber: "SC1357",
    //   idType: "senior",
    //   status: "rejected",
    //   timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    //   imageUrls: ["/placeholder.svg?height=300&width=500"],
    //   rejectionReason: "The ID information is not clearly visible. Please upload a clearer image.",
    //   uploaderId: "user8",
    //   uploaderName: "Olivia Taylor",
    //   organizationId: orgId,
    // },
    // {
    //   id: "ver9",
    //   idNumber: "PW2468",
    //   idType: "pwd",
    //   status: "rejected",
    //   timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    //   imageUrls: ["/placeholder.svg?height=300&width=500"],
    //   rejectionReason: "The ID appears to be damaged or tampered with. Please provide an official ID.",
    //   uploaderId: "user9",
    //   uploaderName: "William Anderson",
    //   organizationId: orgId,
    // },

    // // More historical verifications
    // {
    //   id: "ver10",
    //   idNumber: "ST9753",
    //   idType: "student",
    //   status: "valid",
    //   timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    //   imageUrls: ["/placeholder.svg?height=300&width=500"],
    //   uploaderId: "user10",
    //   uploaderName: "Emma Thompson",
    //   organizationId: orgId,
    //   expirationDate: twoMonthsFromNow.toISOString(), // Expires in 2 months
    // },
    // {
    //   id: "ver11",
    //   idNumber: "SC8642",
    //   idType: "senior",
    //   status: "valid",
    //   timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    //   imageUrls: ["/placeholder.svg?height=300&width=500"],
    //   uploaderId: "user11",
    //   uploaderName: "Noah Wilson",
    //   organizationId: orgId,
    //   lastRevalidationDate: oneYearAgo.toISOString(), // Revalidated 1 year ago
    //   needsRevalidation: true, // Needs revalidation
    // },
    // {
    //   id: "ver12",
    //   idNumber: "PW7531",
    //   idType: "pwd",
    //   status: "valid",
    //   timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    //   imageUrls: ["/placeholder.svg?height=300&width=500"],
    //   uploaderId: "user12",
    //   uploaderName: "Ava Johnson",
    //   organizationId: orgId,
    //   lastRevalidationDate: sixMonthsAgo.toISOString(), // Revalidated 6 months ago
    //   needsRevalidation: false,
    // },

    // // Expired student ID
    // {
    //   id: "ver13",
    //   idNumber: "ST1111",
    //   idType: "student",
    //   status: "valid",
    //   timestamp: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), // Over a year ago
    //   imageUrls: ["/placeholder.svg?height=300&width=500"],
    //   uploaderId: "user13",
    //   uploaderName: "Lucas Martin",
    //   organizationId: orgId,
    //   expirationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Expired 30 days ago
    // },
  ]

  // Store data in localStorage
  localStorage.setItem("users", JSON.stringify(users))
  localStorage.setItem("vehicles", JSON.stringify(vehicles))
  localStorage.setItem("verifications", JSON.stringify(verifications))
  localStorage.setItem("storage_initialized", "true")
}

// Storage utility functions
export function getUsers(): User[] {
  const users = localStorage.getItem("users")
  return users ? JSON.parse(users) : []
}

export function getUser(id: string): User | null {
  const users = getUsers()
  return users.find((user) => user.id === id) || null
}

export function getUserByEmail(email: string): User | null {
  const users = getUsers()
  return users.find((user) => user.email === email) || null
}

export function saveUser(user: User): void {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === user.id)

  if (index >= 0) {
    users[index] = user
  } else {
    users.push(user)
  }

  localStorage.setItem("users", JSON.stringify(users))
}

export function getVehicles(): Vehicle[] {
  const vehicles = localStorage.getItem("vehicles")
  return vehicles ? JSON.parse(vehicles) : []
}

export function getVehicle(id: string): Vehicle | null {
  const vehicles = getVehicles()
  return vehicles.find((vehicle) => vehicle.id === id) || null
}

export function saveVehicle(vehicle: Vehicle): void {
  const vehicles = getVehicles()
  const index = vehicles.findIndex((v) => v.id === vehicle.id)

  if (index >= 0) {
    vehicles[index] = vehicle
  } else {
    vehicles.push(vehicle)
  }

  localStorage.setItem("vehicles", JSON.stringify(vehicles))
}

export function getVerifications(): Verification[] {
  try {
    const verifications = localStorage.getItem("verifications")
    if (!verifications) {
      console.warn("No verifications found in localStorage")
      return []
    }
    const parsedVerifications = JSON.parse(verifications) as Verification[]
    console.log(`Retrieved ${parsedVerifications.length} verifications from storage`)
    console.log(`Pending: ${parsedVerifications.filter((v) => v.status === "pending").length}`)
    return parsedVerifications
  } catch (error) {
    console.error("Error retrieving verifications:", error)
    return []
  }
}

export function getVerification(id: string): Verification | null {
  const verifications = getVerifications()
  return verifications.find((v) => v.id === id) || null
}

export function saveVerification(verification: Verification): void {
  const verifications = getVerifications()
  const index = verifications.findIndex((v) => v.id === verification.id)

  if (index >= 0) {
    verifications[index] = verification
  } else {
    verifications.push(verification)
  }

  localStorage.setItem("verifications", JSON.stringify(verifications))
}

// Update the updateVerificationStatus function to handle expiration dates
export function updateVerificationStatus(
  id: string,
  status: "valid" | "invalid" | "pending" | "rejected",
  rejectionReason?: string,
  expirationDate?: string,
): boolean {
  try {
    const verifications = getVerifications()
    const index = verifications.findIndex((v) => v.id === id)

    if (index >= 0) {
      console.log(`Updating verification ${id} status from ${verifications[index].status} to ${status}`)
      verifications[index].status = status

      if (rejectionReason) {
        verifications[index].rejectionReason = rejectionReason
      }

      // Set expiration date if provided, otherwise set default (1 year from now)
      if (status === "valid") {
        if (expirationDate) {
          verifications[index].expirationDate = expirationDate
        } else {
          const oneYearFromNow = new Date()
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
          verifications[index].expirationDate = oneYearFromNow.toISOString()
        }

        // Set approved date
        verifications[index].approvedDate = new Date().toISOString()

        // Log the operation in JSON format for Firebase compatibility
        console.log(
          JSON.stringify(
            {
              operation: "update_verification_status",
              verificationId: id,
              status: status,
              expirationDate: verifications[index].expirationDate,
              timestamp: new Date().toISOString(),
            },
            null,
            2,
          ),
        )
      }

      // If status is valid and it's a senior or PWD ID, set last revalidation date to now
      if (status === "valid" && (verifications[index].idType === "senior" || verifications[index].idType === "pwd")) {
        verifications[index].lastRevalidationDate = new Date().toISOString()
        verifications[index].needsRevalidation = false
      }

      localStorage.setItem("verifications", JSON.stringify(verifications))
      return true
    } else {
      console.error(`Verification with ID ${id} not found`)
      return false
    }
  } catch (error) {
    console.error("Error updating verification status:", error)
    return false
  }
}

// Session management
export function login(email: string, password: string): User | null {
  const user = getUserByEmail(email)

  if (user && user.password === password) {
    // Store user session
    sessionStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      }),
    )
    return user
  }

  return null
}

export function getCurrentUser() {
  const userJson = sessionStorage.getItem("currentUser")
  return userJson ? JSON.parse(userJson) : null
}

export function logout() {
  sessionStorage.removeItem("currentUser")
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function resetPassword(email: string): boolean {
  const user = getUserByEmail(email)

  if (user) {
    // In a real app, this would send an email with a reset link
    // For this demo, we'll just reset the password to a default value
    user.password = "resetpassword123"
    saveUser(user)
    return true
  }

  return false
}

export function getVehiclesByOrganization(organizationId: string): Vehicle[] {
  const vehicles = getVehicles()
  return vehicles.filter((vehicle) => vehicle.organizationId === organizationId)
}

export function getVerificationsByOrganization(organizationId: string): Verification[] {
  const verifications = getVerifications()
  return verifications.filter((verification) => verification.organizationId === organizationId)
}

// New functions for expiration and revalidation
export function updateExpirationDate(id: string, expirationDate: string): boolean {
  const verifications = getVerifications()
  const index = verifications.findIndex((v) => v.id === id)

  if (index >= 0 && verifications[index].idType === "student") {
    verifications[index].expirationDate = expirationDate
    localStorage.setItem("verifications", JSON.stringify(verifications))
    return true
  }

  return false
}

export function revalidateId(id: string): boolean {
  const verifications = getVerifications()
  const index = verifications.findIndex((v) => v.id === id)

  if (index >= 0 && (verifications[index].idType === "senior" || verifications[index].idType === "pwd")) {
    verifications[index].lastRevalidationDate = new Date().toISOString()
    verifications[index].needsRevalidation = false
    localStorage.setItem("verifications", JSON.stringify(verifications))
    return true
  }

  return false
}

export function markIdForRevalidation(id: string): boolean {
  const verifications = getVerifications()
  const index = verifications.findIndex((v) => v.id === id)

  if (index >= 0 && (verifications[index].idType === "senior" || verifications[index].idType === "pwd")) {
    verifications[index].needsRevalidation = true
    localStorage.setItem("verifications", JSON.stringify(verifications))
    return true
  }

  return false
}

export function getExpiredStudentIds(): Verification[] {
  const verifications = getVerifications()
  const now = new Date().toISOString()

  return verifications.filter(
    (v) => v.idType === "student" && v.status === "valid" && v.expirationDate && v.expirationDate < now,
  )
}

export function getIdsNeedingRevalidation(): Verification[] {
  const verifications = getVerifications()

  return verifications.filter(
    (v) => (v.idType === "senior" || v.idType === "pwd") && v.status === "valid" && v.needsRevalidation === true,
  )
}

export function getIdsNeedingAttention(): Verification[] {
  return [...getExpiredStudentIds(), ...getIdsNeedingRevalidation()]
}

export function notifyUserAboutExpiredId(id: string): boolean {
  try {
    const verifications = getVerifications()
    const index = verifications.findIndex((v) => v.id === id)

    if (index >= 0 && verifications[index].idType === "student" && verifications[index].status === "valid") {
      // In a real app, this would send an email or notification to the user
      // For this demo, we'll just mark the ID as notified
      verifications[index].userNotified = true
      verifications[index].notificationDate = new Date().toISOString()
      localStorage.setItem("verifications", JSON.stringify(verifications))
      return true
    }

    return false
  } catch (error) {
    console.error("Error notifying user about expired ID:", error)
    return false
  }
}
