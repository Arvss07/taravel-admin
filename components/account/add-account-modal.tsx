"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getVehicleTypes, type VehicleType } from "@/lib/vehicle-types"
import {
  createAccount,
  createOrganizationWithAccounts,
  generateAccessKey,
  generateMasterKey,
  generateUsername,
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

interface AddAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface VehicleCount {
  vehicleTypeId: string
  count: number
  vehicleTypeName: string
}

export default function AddAccountModal({ isOpen, onClose, onSuccess }: AddAccountModalProps) {
  const { toast } = useToast()
  const [accountType, setAccountType] = useState<"organization" | "individual">("organization")
  const [serviceType, setServiceType] = useState<"bus" | "van">("bus")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [secondaryContactNumber, setSecondaryContactNumber] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [vehicleCounts, setVehicleCounts] = useState<VehicleCount[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [selectedVehicleType, setSelectedVehicleType] = useState("")
  const [vehicleCount, setVehicleCount] = useState("1")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [totalVehicles, setTotalVehicles] = useState(0)

  // States for generated keys and accounts
  const [showKeysDialog, setShowKeysDialog] = useState(false)
  const [accessKey, setAccessKey] = useState("")
  const [masterKey, setMasterKey] = useState("")
  const [generatedAccounts, setGeneratedAccounts] = useState<Array<{ username: string; accessKey: string }>>([])
  const [copySuccess, setCopySuccess] = useState<Record<string, boolean>>({})

  // State for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load vehicle types on mount
  useEffect(() => {
    const loadVehicleTypes = () => {
      try {
        const types = getVehicleTypes()
        setVehicleTypes(types)
      } catch (error) {
        console.error("Error loading vehicle types:", error)
      }
    }

    loadVehicleTypes()
  }, [])

  // Update total vehicles when vehicle counts change
  useEffect(() => {
    const total = vehicleCounts.reduce((sum, item) => sum + item.count, 0)
    setTotalVehicles(total)
  }, [vehicleCounts])

  // Reset form on close
  const handleClose = () => {
    if (showKeysDialog) {
      setShowConfirmDialog(true)
      return
    }

    resetForm()
    onClose()
  }

  const resetForm = () => {
    setAccountType("organization")
    setServiceType("bus")
    setName("")
    setEmail("")
    setContactNumber("")
    setSecondaryContactNumber("")
    setContactPerson("")
    setVehicleCounts([])
    setSelectedVehicleType("")
    setVehicleCount("1")
    setErrors({})
    setShowKeysDialog(false)
    setAccessKey("")
    setMasterKey("")
    setGeneratedAccounts([])
    setCopySuccess({})
    setIsSubmitting(false)
    setTotalVehicles(0)
  }

  // Add a vehicle type
  const addVehicleType = () => {
    if (!selectedVehicleType) {
      toast({
        title: "Error",
        description: "Please select a vehicle type",
        variant: "destructive",
      })
      return
    }

    const count = Number.parseInt(vehicleCount) || 0
    if (count <= 0) {
      toast({
        title: "Error",
        description: "Vehicle count must be greater than 0",
        variant: "destructive",
      })
      return
    }

    // Check if individual account already has a vehicle
    if (accountType === "individual") {
      if (vehicleCounts.length > 0) {
        toast({
          title: "Limit Exceeded",
          description: "Individual accounts can have only 1 vehicle",
          variant: "destructive",
        })
        return
      }
    }

    // Check if vehicle type already exists
    const existingIndex = vehicleCounts.findIndex((v) => v.vehicleTypeId === selectedVehicleType)
    if (existingIndex >= 0) {
      // Update existing count
      const updatedCounts = [...vehicleCounts]
      updatedCounts[existingIndex].count += count
      setVehicleCounts(updatedCounts)
    } else {
      // Add new vehicle type
      const vehicleType = vehicleTypes.find((vt) => vt.id === selectedVehicleType)
      if (vehicleType) {
        setVehicleCounts([
          ...vehicleCounts,
          {
            vehicleTypeId: selectedVehicleType,
            count,
            vehicleTypeName: vehicleType.name,
          },
        ])
      }
    }

    // Reset selection
    setSelectedVehicleType("")
    setVehicleCount("1")
  }

  // Remove a vehicle type
  const removeVehicleType = (typeId: string) => {
    setVehicleCounts(vehicleCounts.filter((v) => v.vehicleTypeId !== typeId))
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }

    if (accountType === "individual" && !contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required"
    }

    if (accountType === "organization") {
      if (!contactPerson.trim()) {
        newErrors.contactPerson = "Contact person is required"
      }
      if (!contactNumber.trim()) {
        newErrors.contactNumber = "Primary contact number is required"
      }
    }

    if (vehicleCounts.length === 0) {
      newErrors.vehicles = "At least one vehicle must be added"
    }

    // Check vehicle count limit for individual accounts
    if (accountType === "individual" && vehicleCounts.length > 1) {
      newErrors.vehicles = "Individual accounts can have only 1 vehicle"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      // Generate keys
      const newAccessKey = generateAccessKey()
      setAccessKey(newAccessKey)

      if (accountType === "organization") {
        const newMasterKey = generateMasterKey()
        setMasterKey(newMasterKey)

        // Generate accounts based on total vehicles
        const accounts = []

        for (let i = 0; i < totalVehicles; i++) {
          const username = generateUsername(name, new Date(), i)
          const accountAccessKey = generateAccessKey()
          accounts.push({ username, accessKey: accountAccessKey })
        }

        setGeneratedAccounts(accounts)

        // Create organization with accounts
        await createOrganizationWithAccounts({
          name,
          email: email || undefined,
          accountType,
          serviceType,
          accessKey: newAccessKey,
          masterKey: newMasterKey,
          vehicles: vehicleCounts,
          accounts,
          contactPerson,
          contactNumber,
          secondaryContactNumber: secondaryContactNumber || undefined,
          totalVehicles,
        })
      } else {
        // Create individual account
        const username = generateUsername(name, new Date())
        setGeneratedAccounts([{ username, accessKey: newAccessKey }])

        await createAccount({
          name,
          email: email || undefined,
          accountType,
          serviceType,
          accessKey: newAccessKey,
          username,
          vehicles: vehicleCounts,
          contactNumber,
          totalVehicles,
        })
      }

      // Show keys dialog
      setShowKeysDialog(true)
    } catch (error) {
      console.error("Error creating account:", error)
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

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

  // Copy all accounts to clipboard
  const copyAllAccounts = () => {
    const text = generatedAccounts.map((acc) => `Username: ${acc.username}, Access Key: ${acc.accessKey}`).join("\n")

    copyToClipboard(text, "allAccounts")
  }

  // Confirm leaving the keys dialog
  const confirmLeave = () => {
    setShowConfirmDialog(false)
    resetForm()
    onSuccess()
  }

  // Cancel leaving the keys dialog
  const cancelLeave = () => {
    setShowConfirmDialog(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-auto max-h-[90vh]">
          {!showKeysDialog ? (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Add Account</h2>
                  <p className="text-muted-foreground">Create a new organization or individual account</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select
                      value={accountType}
                      onValueChange={(value: "organization" | "individual") => {
                        setAccountType(value)
                        // Clear vehicle counts when switching to individual
                        if (value === "individual") {
                          setVehicleCounts([])
                        }
                      }}
                    >
                      <SelectTrigger id="accountType">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="organization">For Organization</SelectItem>
                        <SelectItem value="individual">For Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select value={serviceType} onValueChange={(value: "bus" | "van") => setServiceType(value)}>
                      <SelectTrigger id="serviceType">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bus">Bus Operator</SelectItem>
                        <SelectItem value="van">Van Operator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {accountType === "organization" ? (
                  // Organization fields
                  <>
                    <div>
                      <Label htmlFor="name">Organization Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Organization Name"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Contact Person Name"
                        className={errors.contactPerson ? "border-red-500" : ""}
                      />
                      {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
                    </div>

                    <div>
                      <Label htmlFor="contactNumber">Primary Contact Number</Label>
                      <Input
                        id="contactNumber"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="Primary Contact Number"
                        className={errors.contactNumber ? "border-red-500" : ""}
                      />
                      {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
                    </div>

                    <div>
                      <Label htmlFor="secondaryContactNumber">Secondary Contact Number (Optional)</Label>
                      <Input
                        id="secondaryContactNumber"
                        value={secondaryContactNumber}
                        onChange={(e) => setSecondaryContactNumber(e.target.value)}
                        placeholder="Secondary Contact Number"
                      />
                    </div>
                  </>
                ) : (
                  // Individual fields
                  <>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Individual Name"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactNumber">Contact Number</Label>
                      <Input
                        id="contactNumber"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="Contact Number"
                        className={errors.contactNumber ? "border-red-500" : ""}
                      />
                      {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
                    </div>
                  </>
                )}

                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Vehicles</h3>
                    {errors.vehicles && <p className="text-red-500 text-sm">{errors.vehicles}</p>}

                    {vehicleCounts.length > 0 ? (
                      <div className="border rounded-md overflow-hidden mb-4">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-2">Vehicle Type</th>
                              <th className="text-left p-2">Count</th>
                              <th className="text-left p-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vehicleCounts.map((item) => (
                              <tr key={item.vehicleTypeId} className="border-t">
                                <td className="p-2">{item.vehicleTypeName}</td>
                                <td className="p-2">{item.count}</td>
                                <td className="p-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVehicleType(item.vehicleTypeId)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center p-4 border rounded-md mb-4 text-muted-foreground">
                        No vehicles added. Add a vehicle type below.
                      </div>
                    )}

                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor="vehicleType" className="mb-2">
                          Vehicle Type
                        </Label>
                        <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                          <SelectTrigger id="vehicleType">
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicleTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Label htmlFor="vehicleCount" className="mb-2">
                          Count
                        </Label>
                        <Input
                          id="vehicleCount"
                          type="number"
                          min="1"
                          value={vehicleCount}
                          onChange={(e) => setVehicleCount(e.target.value)}
                          disabled={accountType === "individual"}
                        />
                      </div>
                      <Button
                        onClick={addVehicleType}
                        className="gap-2"
                        disabled={accountType === "individual" && vehicleCounts.length > 0}
                      >
                        <Plus className="h-4 w-4" /> Add
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add the types and quantities of vehicles in this {accountType}
                      {accountType === "individual" && (
                        <span className="text-amber-600 ml-1">(individual accounts can have only 1 vehicle)</span>
                      )}
                    </p>
                  </div>

                  {accountType === "organization" && (
                    <div className="p-4 bg-blue-50 rounded-md">
                      <p className="text-blue-800">
                        <strong>Note:</strong> {totalVehicles} account(s) will be created based on the total number of
                        vehicles.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Account Created Successfully</h2>
                  <p className="text-muted-foreground">Please save these credentials. They will only be shown once.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
                  <p className="font-medium">Important: Copy these credentials now!</p>
                  <p className="text-sm">
                    These credentials will only be shown once. Make sure to save them in a secure location.
                  </p>
                </div>

                {accountType === "organization" && (
                  <div className="space-y-2">
                    <Label>Organization Master Key</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-gray-100 rounded-md font-mono text-sm">{masterKey}</div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(masterKey, "masterKey")}>
                        {copySuccess["masterKey"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Access Key</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-gray-100 rounded-md font-mono text-sm">{accessKey}</div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(accessKey, "accessKey")}>
                      {copySuccess["accessKey"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {generatedAccounts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Generated Accounts</Label>
                      <Button variant="outline" size="sm" onClick={copyAllAccounts}>
                        {copySuccess["allAccounts"] ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Copy All
                      </Button>
                    </div>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-2">Username</th>
                            <th className="text-left p-2">Access Key</th>
                            <th className="text-left p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generatedAccounts.map((account, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2 font-mono text-sm">{account.username}</td>
                              <td className="p-2 font-mono text-sm">{account.accessKey}</td>
                              <td className="p-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(
                                      `Username: ${account.username}, Access Key: ${account.accessKey}`,
                                      `account_${index}`,
                                    )
                                  }
                                >
                                  {copySuccess[`account_${index}`] ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowConfirmDialog(true)}>Done</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to leave this page. Make sure you have copied all the credentials as they will not be shown
              again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelLeave}>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave}>Yes, I've Saved the Credentials</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
