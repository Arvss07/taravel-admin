"use client"

import { useState } from "react"
import { ArrowLeft, Calendar, Check, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { updateExpirationDate, notifyUserAboutExpiredId, type Verification } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
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
// Import the ImageCarousel component
import { ImageCarousel } from "@/components/ui/image-carousel"

interface VerificationModalProps {
  verification: Verification
  isOpen: boolean
  onClose: () => void
  onAccept: (id: string, expirationDate: string) => void
  onReject: (id: string, reason: string) => void
}

// Update the component to handle multiple images
export default function VerificationModal({
  verification,
  isOpen,
  onClose,
  onAccept,
  onReject,
}: VerificationModalProps) {
  const { toast } = useToast()
  const [rejectionReason, setRejectionReason] = useState(verification.rejectionReason || "")
  const [isRejecting, setIsRejecting] = useState(false)

  // Initialize expiration date - default to 1 year from now if not set
  const defaultExpirationDate = () => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    return date.toISOString().split("T")[0]
  }

  const [expirationDate, setExpirationDate] = useState(
    verification.expirationDate
      ? new Date(verification.expirationDate).toISOString().split("T")[0]
      : defaultExpirationDate(),
  )

  const [isEditingExpiration, setIsEditingExpiration] = useState(verification.status === "pending")
  const [notes, setNotes] = useState("")
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [showNotifyConfirm, setShowNotifyConfirm] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const isExpired = verification.expirationDate && new Date(verification.expirationDate) < new Date()

  const handleAccept = () => {
    // Validate expiration date
    if (!expirationDate) {
      toast({
        title: "Error",
        description: "Please provide a valid expiration date.",
        variant: "destructive",
      })
      return
    }

    // Log the operation in JSON format for Firebase compatibility
    console.log(
      JSON.stringify(
        {
          operation: "accept_verification",
          verificationId: verification.id,
          status: "valid",
          expirationDate: expirationDate,
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
    )

    setShowAcceptConfirm(true)
  }

  const confirmAccept = () => {
    onAccept(verification.id, expirationDate)
    toast({
      title: "ID Verified",
      description: `${verification.idType.toUpperCase()} ID #${verification.idNumber} has been verified successfully.`,
      variant: "success",
    })
    setShowAcceptConfirm(false)
  }

  const handleReject = () => {
    if (!isRejecting) {
      setIsRejecting(true)
      return
    }

    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      })
      return
    }

    // Log the operation in JSON format for Firebase compatibility
    console.log(
      JSON.stringify(
        {
          operation: "reject_verification",
          verificationId: verification.id,
          status: "rejected",
          rejectionReason: rejectionReason,
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
    )

    setShowRejectConfirm(true)
  }

  const confirmReject = () => {
    onReject(verification.id, rejectionReason)
    toast({
      title: "ID Rejected",
      description: `${verification.idType.toUpperCase()} ID #${verification.idNumber} has been rejected.`,
      variant: "default",
    })
    setIsRejecting(false)
    setShowRejectConfirm(false)
  }

  const handleNotifyUser = () => {
    // Log the operation in JSON format for Firebase compatibility
    console.log(
      JSON.stringify(
        {
          operation: "notify_user",
          verificationId: verification.id,
          idType: verification.idType,
          idNumber: verification.idNumber,
          expirationDate: verification.expirationDate,
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
    )

    setShowNotifyConfirm(true)
  }

  const confirmNotifyUser = () => {
    notifyUserAboutExpiredId(verification.id)
    toast({
      title: "User Notified",
      description: `User has been notified about their expired ${verification.idType} ID.`,
      variant: "success",
    })
    setShowNotifyConfirm(false)
    onClose()
  }

  const handleUpdateExpiration = () => {
    if (!isEditingExpiration) {
      setIsEditingExpiration(true)
      return
    }

    if (!expirationDate) {
      toast({
        title: "Error",
        description: "Please provide a valid expiration date.",
        variant: "destructive",
      })
      return
    }

    // Log the operation in JSON format for Firebase compatibility
    console.log(
      JSON.stringify(
        {
          operation: "update_expiration",
          verificationId: verification.id,
          expirationDate: expirationDate,
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
    )

    updateExpirationDate(verification.id, new Date(expirationDate).toISOString())
    toast({
      title: "Expiration Date Updated",
      description: `Expiration date for ${verification.idType.toUpperCase()} ID #${
        verification.idNumber
      } has been updated.`,
      variant: "success",
    })
    setIsEditingExpiration(false)
    onClose()
  }

  const getStatusBadge = () => {
    switch (verification.status) {
      case "valid":
        return <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">Approved</div>
      case "pending":
        return <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">Pending</div>
      case "rejected":
        return <div className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">Rejected</div>
      default:
        return null
    }
  }

  // Convert single imageUrl to array if needed for backward compatibility
  const imageUrls = verification.imageUrls || (verification.imageUrl ? [verification.imageUrl] : [])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-auto max-h-[90vh]">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">ID Verification Details</h2>
                <p className="text-muted-foreground">Review and process ID verification request</p>
              </div>
              <Button variant="outline" size="sm" onClick={onClose} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to List
              </Button>
            </div>

            <div className="border rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">User Information</h3>
                  <p className="text-muted-foreground">Details of the ID submission and user</p>
                </div>
                {getStatusBadge()}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center">
                  <ImageCarousel
                    images={imageUrls.length > 0 ? imageUrls : ["/placeholder.svg?height=300&width=500"]}
                    alt={`${verification.idType} ID`}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium">User {verification.uploaderName?.split(" ")[0] || ""}</h4>
                    <p className="text-sm text-muted-foreground">
                      User ID: {verification.uploaderId || "Not available"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">ID Type</p>
                      <p className="font-medium capitalize">{verification.idType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ID Number</p>
                      <p className="font-medium">ID-{verification.idNumber}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Submitted on</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{formatDate(verification.timestamp)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Verification Status</h4>
                  <div className="flex items-center gap-3 mb-4">
                    {verification.status === "valid" ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : verification.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Pending Verification</span>
                      </div>
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium capitalize">
                      {verification.status === "valid" ? "Approved" : verification.status}
                    </span>
                    {verification.status !== "pending" && (
                      <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</span>
                    )}
                  </div>

                  {verification.status !== "pending" && (
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Verified by</p>
                        <p className="font-medium">Admin User</p> {/* Replace with actual admin user if available */}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">ID Validity</h4>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiration Date</p>
                    {isEditingExpiration && verification.status !== 'rejected' ? ( // Allow editing only if not rejected
                      <div className="mt-1">
                        <Input
                          type="date"
                          value={expirationDate}
                          onChange={(e) => setExpirationDate(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          min={new Date().toISOString().split("T")[0]} // Optional: prevent setting past dates
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className={isExpired ? "text-red-500 font-medium" : ""}>
                          {verification.expirationDate
                            ? formatDate(verification.expirationDate)
                            : "No expiration date set"}
                          {isExpired && " (Expired)"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {verification.status === "rejected" && verification.rejectionReason && (
                <div>
                  <h4 className="font-medium mb-2">Rejection Reason</h4>
                  <div className="p-4 bg-red-50 text-red-800 rounded-md">{verification.rejectionReason}</div>
                </div>
              )}

              {verification.status === "valid" && verification.notes && (
                <div>
                  <h4 className="font-medium mb-2">Additional Notes</h4>
                  <div className="p-4 bg-gray-50 rounded-md">{verification.notes}</div>
                </div>
              )}

              {/* This is the Valid Period section, displayed only when status is valid */}
              {verification.status === "valid" && (
                <div>
                  <h4 className="font-medium mb-2">Valid Period</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Approved Date:</p>
                      {/* Use approvedDate if available, otherwise fallback to timestamp */}
                      <p className="font-medium">{formatDate(verification.approvedDate || verification.timestamp)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expiration Date:</p>
                      <p className="font-medium">
                        {verification.expirationDate ? formatDate(verification.expirationDate) : "No expiration"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* REMOVED DUPLICATE BLOCK HERE */}
            </div> {/* This closes the div from line 256 */}


            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Verification Actions</h3>

              <Textarea
                placeholder="Add notes about this verification..."
                className="mb-4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                // Disable notes if already approved/rejected? Maybe not needed.
              />

              {isRejecting && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Rejection Reason *</h4>
                  <Textarea
                    placeholder="Please provide a reason for rejection"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="border-red-300 focus:border-red-500" // Enhanced styling
                    required // Make visually/semantically required
                  />
                </div>
              )}

              <div className="space-y-2">
                {verification.status === "pending" && (
                  <>
                    {/* Allow editing expiration date during approval */}
                    {!isEditingExpiration && (
                       <Button variant="outline" className="w-full gap-2" onClick={() => setIsEditingExpiration(true)}>
                           <Calendar className="h-4 w-4" /> Edit Expiration Date Before Approving
                       </Button>
                    )}
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2" onClick={handleAccept}>
                      <Check className="h-4 w-4" />
                      Approve ID
                    </Button>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white gap-2" onClick={handleReject}>
                      <X className="h-4 w-4" />
                      {isRejecting ? "Confirm Rejection" : "Reject ID"}
                    </Button>
                    {/* Cancel rejection if reason input is shown */}
                    {isRejecting && (
                        <Button variant="outline" className="w-full" onClick={() => setIsRejecting(false)}>
                             Cancel Rejection
                        </Button>
                     )}
                  </>
                )}

                {verification.status === "valid" && isExpired && (
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2"
                    onClick={handleNotifyUser}
                  >
                    <Calendar className="h-4 w-4" />
                    Notify User of Expiration
                  </Button>
                )}

                {/* Allow updating expiration for valid, non-expired IDs */}
                {verification.status === "valid" && !isExpired && (
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-2"
                    onClick={handleUpdateExpiration}
                  >
                    <Calendar className="h-4 w-4" />
                    {isEditingExpiration ? "Save Updated Expiration Date" : "Update Expiration Date"}
                  </Button>
                )}
                 {/* Allow canceling the edit expiration action */}
                 {isEditingExpiration && verification.status === "valid" && !isExpired && (
                    <Button variant="outline" className="w-full" onClick={() => setIsEditingExpiration(false)}>
                         Cancel Update
                    </Button>
                 )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Accept Confirmation Dialog */}
      <AlertDialog open={showAcceptConfirm} onOpenChange={setShowAcceptConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Verification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify this {verification.idType.toUpperCase()} ID? This action cannot be undone.
            </AlertDialogDescription>
            <div className="mt-2 p-2 bg-gray-50 rounded-md border">
              <div className="font-medium">Set Expiration Date: {formatDate(expirationDate)}</div>
              {notes && <div className="text-sm text-muted-foreground mt-1">Notes: {notes}</div>}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAccept} className="bg-green-600 hover:bg-green-700">
              Verify ID
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this {verification.idType.toUpperCase()} ID? This action cannot be undone.
            </AlertDialogDescription>
             <div className="mt-2 p-2 bg-red-50 rounded-md border border-red-200">
               <div className="font-medium text-red-800">Rejection Reason:</div>
               <p className="text-sm text-red-700">{rejectionReason || "No reason provided (ensure validation prevents this)"}</p>
             </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsRejecting(false)}>Cancel</AlertDialogCancel> {/* Also hide reason input on cancel */}
            <AlertDialogAction onClick={confirmReject} className="bg-red-600 hover:bg-red-700">
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notify User Confirmation Dialog */}
      <AlertDialog open={showNotifyConfirm} onOpenChange={setShowNotifyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to notify the user about their expired {verification.idType.toUpperCase()} ID?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNotifyUser} className="bg-amber-600 hover:bg-amber-700">
              Notify User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}