"use client"

import { useState } from "react"
import { ArrowLeft, Copy, Check, Key, Trash2, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  regenerateAccessKey,
  regenerateMasterKey,
  deleteAccount,
  toggleAccountStatus,
  type User,
} from "@/lib/account-utils"
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

interface ViewAccountModalProps {
  isOpen: boolean
  onClose: () => void
  account: User
  onSuccess: () => void
}

export default function ViewAccountModal({ isOpen, onClose, account, onSuccess }: ViewAccountModalProps) {
  const { toast } = useToast()
  const [showNewKeys, setShowNewKeys] = useState(false)
  const [newAccessKey, setNewAccessKey] = useState("")
  const [newMasterKey, setNewMasterKey] = useState("")
  const [copySuccess, setCopySuccess] = useState<Record<string, boolean>>({})

  // Confirmation dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)
  const [regenerateType, setRegenerateType] = useState<"access" | "master">("access")

  // Copy text to clipboard
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopySuccess((prev) => ({ ...prev, [key]: true }))
        setTimeout(() => {
          setCopySuccess((prev) => ({ ...prev, [key]: false }))
        }, 2000)
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
        toast({
          title: "Copy failed",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        })
      })
  }

  // Handle regenerate access key
  const handleRegenerateAccessKey = async () => {
    try {
      const key = await regenerateAccessKey(account.id)
      setNewAccessKey(key)
      setShowNewKeys(true)
      toast({
        title: "Access Key Regenerated",
        description: "The access key has been successfully regenerated.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error regenerating access key:", error)
      toast({
        title: "Error",
        description: "Failed to regenerate access key. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle regenerate master key
  const handleRegenerateMasterKey = async () => {
    try {
      const key = await regenerateMasterKey(account.id)
      setNewMasterKey(key)
      setShowNewKeys(true)
      toast({
        title: "Master Key Regenerated",
        description: "The master key has been successfully regenerated.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error regenerating master key:", error)
      toast({
        title: "Error",
        description: "Failed to regenerate master key. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(account.id)
      toast({
        title: "Account Deleted",
        description: "The account has been successfully deleted.",
        variant: "success",
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle toggle account status
  const handleToggleStatus = async () => {
    try {
      const newStatus = account.status === "active" ? "disabled" : "active"
      await toggleAccountStatus(account.id, newStatus)
      toast({
        title: `Account ${newStatus === "active" ? "Enabled" : "Disabled"}`,
        description: `The account has been successfully ${newStatus === "active" ? "enabled" : "disabled"}.`,
        variant: "success",
      })
      onSuccess()
    } catch (error) {
      console.error("Error toggling account status:", error)
      toast({
        title: "Error",
        description: "Failed to update account status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Show regenerate confirmation
  const showRegenerateKeyConfirm = (type: "access" | "master") => {
    setRegenerateType(type)
    setShowRegenerateConfirm(true)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-auto max-h-[90vh]">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Account Details</h2>
                <p className="text-muted-foreground">View and manage account information</p>
              </div>
              <Button variant="outline" size="sm" onClick={onClose} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to List
              </Button>
            </div>

            {showNewKeys ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
                  <p className="font-medium">Important: Copy these credentials now!</p>
                  <p className="text-sm">
                    These credentials will only be shown once. Make sure to save them in a secure location.
                  </p>
                </div>

                {newAccessKey && (
                  <div className="space-y-2">
                    <Label>New Access Key</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-gray-100 rounded-md font-mono text-sm">{newAccessKey}</div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(newAccessKey, "newAccessKey")}>
                        {copySuccess["newAccessKey"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {newMasterKey && (
                  <div className="space-y-2">
                    <Label>New Master Key</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-gray-100 rounded-md font-mono text-sm">{newMasterKey}</div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(newMasterKey, "newMasterKey")}>
                        {copySuccess["newMasterKey"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={() => setShowNewKeys(false)}>Done</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Account Type</Label>
                      <p className="font-medium capitalize">{account.accountType || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Service Type</Label>
                      <p className="font-medium capitalize">
                        {account.serviceType ? `${account.serviceType} Operator` : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Name</Label>
                      <p className="font-medium">{account.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{account.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Username</Label>
                      <p className="font-medium">{account.username || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge
                        className={
                          account.status === "active"
                            ? "bg-green-100 text-green-800"
                            : account.status === "disabled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {account.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Created At</Label>
                    <p className="font-medium">{formatDate(account.createdAt)}</p>
                  </div>

                  {account.vehicles && account.vehicles.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground">Vehicles</Label>
                      <div className="border rounded-md overflow-hidden mt-1">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-2">Vehicle Type</th>
                              <th className="text-left p-2">Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {account.vehicles.map((vehicle, index) => (
                              <tr key={index} className="border-t">
                                <td className="p-2">{vehicle.vehicleTypeId}</td>
                                <td className="p-2">{vehicle.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Security</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => showRegenerateKeyConfirm("access")}>
                      <Key className="h-4 w-4" />
                      Regenerate Access Key
                    </Button>

                    {account.accountType === "organization" && (
                      <Button variant="outline" className="gap-2" onClick={() => showRegenerateKeyConfirm("master")}>
                        <Key className="h-4 w-4" />
                        Regenerate Master Key
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Management</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={account.status === "active" ? "destructive" : "outline"}
                      className="gap-2"
                      onClick={() => setShowDisableConfirm(true)}
                    >
                      <Ban className="h-4 w-4" />
                      {account.status === "active" ? "Disable Account" : "Enable Account"}
                    </Button>

                    <Button variant="destructive" className="gap-2" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate Key Confirmation Dialog */}
      <AlertDialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate {regenerateType === "access" ? "Access" : "Master"} Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to regenerate the {regenerateType === "access" ? "access" : "master"} key for this
              account? The old key will no longer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={regenerateType === "access" ? handleRegenerateAccessKey : handleRegenerateMasterKey}
            >
              Regenerate Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? This action cannot be undone.
              {account.accountType === "organization" &&
                " All user accounts under this organization will also be deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable Confirmation Dialog */}
      <AlertDialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{account.status === "active" ? "Disable" : "Enable"} Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {account.status === "active" ? "disable" : "enable"} this account?
              {account.status === "active" &&
                account.accountType === "organization" &&
                " All user accounts under this organization will also be disabled."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {account.status === "active" ? "Disable" : "Enable"} Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
