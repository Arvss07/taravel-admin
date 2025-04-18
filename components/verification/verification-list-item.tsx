"use client"

import { Calendar, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Verification } from "@/lib/storage"

interface VerificationListItemProps {
  verification: Verification
  onClick: () => void
  showActions?: boolean
}

export function VerificationListItem({ verification, onClick, showActions = false }: VerificationListItemProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHrs < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHrs < 24) {
      return `${diffHrs} hour${diffHrs !== 1 ? "s" : ""} ago`
    } else {
      const diffDays = Math.floor(diffHrs / 24)
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  const isExpired =
    verification.idType === "student" &&
    verification.expirationDate &&
    new Date(verification.expirationDate) < new Date()

  const getStatusBadge = () => {
    if (isExpired) {
      return <div className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">Expired</div>
    }

    switch (verification.status) {
      case "valid":
        return <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Approved</div>
      case "pending":
        return <div className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">Pending</div>
      case "rejected":
        return <div className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">Rejected</div>
      default:
        return null
    }
  }

  // Convert single imageUrl to array if needed for backward compatibility
  const imageUrls = verification.imageUrls || (verification.imageUrl ? [verification.imageUrl] : [])
  const displayImage = imageUrls.length > 0 ? imageUrls[0] : "/placeholder.svg?height=48&width=48"

  return (
    <div
      className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 relative">
          <img
            src={displayImage || "/placeholder.svg"}
            alt={`${verification.idType} ID`}
            className="h-full w-full object-cover"
          />
          {imageUrls.length > 1 && (
            <div className="absolute top-0 right-0 bg-black/50 text-white text-xs px-1 rounded-bl">
              {imageUrls.length}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium capitalize">
              {verification.idType} ID #{verification.idNumber}
            </p>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground">
            Uploaded by {verification.uploaderName} • {formatTimestamp(verification.timestamp)}
          </p>
          {verification.idType === "student" && verification.expirationDate && (
            <p className={`text-xs ${isExpired ? "text-amber-600" : "text-muted-foreground"} flex items-center mt-1`}>
              {isExpired ? <AlertTriangle className="h-3 w-3 mr-1" /> : <Calendar className="h-3 w-3 mr-1" />}
              {isExpired ? "Expired on: " : "Expires: "}
              {new Date(verification.expirationDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {showActions && (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          View Details
        </Button>
      )}
    </div>
  )
}
