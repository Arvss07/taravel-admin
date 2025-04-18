"use client"
import { Input } from "@/components/ui/input"
import type { Verification } from "@/lib/storage"

interface VerificationDetailsProps {
  verification: Verification
  isEditingExpiration: boolean
  expirationDate: string
  onExpirationDateChange: (date: string) => void
}

export function VerificationDetails({
  verification,
  isEditingExpiration,
  expirationDate,
  onExpirationDateChange,
}: VerificationDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const isExpired =
    verification.idType === "student" &&
    verification.expirationDate &&
    new Date(verification.expirationDate) < new Date()

  const needsRevalidation =
    (verification.idType === "senior" || verification.idType === "pwd") && verification.needsRevalidation

  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="font-medium text-muted-foreground">ID Number</p>
        <p>{verification.idNumber}</p>
      </div>
      <div>
        <p className="font-medium text-muted-foreground">ID Type</p>
        <p className="capitalize">{verification.idType}</p>
      </div>
      <div>
        <p className="font-medium text-muted-foreground">Uploaded By</p>
        <p>{verification.uploaderName}</p>
      </div>
      <div>
        <p className="font-medium text-muted-foreground">Uploaded On</p>
        <p>{formatDate(verification.timestamp)}</p>
      </div>
      <div className="col-span-2">
        <p className="font-medium text-muted-foreground">Status</p>
        <p className="capitalize">{verification.status}</p>
      </div>
      {verification.status === "rejected" && verification.rejectionReason && (
        <div className="col-span-2">
          <p className="font-medium text-muted-foreground">Rejection Reason</p>
          <p>{verification.rejectionReason}</p>
        </div>
      )}
      {verification.idType === "student" && (
        <div className={`col-span-2 ${isExpired ? "text-amber-600" : ""}`}>
          <p className="font-medium text-muted-foreground">Expiration Date</p>
          {isEditingExpiration ? (
            <div className="mt-1">
              <Input type="date" value={expirationDate} onChange={(e) => onExpirationDateChange(e.target.value)} />
            </div>
          ) : (
            <p>
              {verification.expirationDate ? new Date(verification.expirationDate).toLocaleDateString() : "Not set"}
              {isExpired && " (Expired)"}
            </p>
          )}
        </div>
      )}
      {(verification.idType === "senior" || verification.idType === "pwd") && (
        <div className={`col-span-2 ${needsRevalidation ? "text-amber-600" : ""}`}>
          <p className="font-medium text-muted-foreground">Last Revalidation</p>
          <p>
            {verification.lastRevalidationDate
              ? new Date(verification.lastRevalidationDate).toLocaleDateString()
              : "Not validated yet"}
            {needsRevalidation && " (Needs Revalidation)"}
          </p>
        </div>
      )}
    </div>
  )
}
