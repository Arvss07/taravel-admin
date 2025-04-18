export interface Verification {
  id: string
  idNumber: string
  idType: "student" | "senior" | "pwd" | "other"
  status: "valid" | "invalid" | "pending" | "rejected"
  organizationId: string
  conductorId: string
  conductorName?: string
  timestamp: string
  imageUrl?: string
  rejectionReason?: string
  uploaderId: string
  uploaderName: string
}
