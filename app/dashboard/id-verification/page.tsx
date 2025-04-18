"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CreditCard, Search, AlertTriangle } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AppLayout from "@/components/layout/app-layout"
import { useAuth } from "@/lib/auth-context"
import {
  getVerifications,
  updateVerificationStatus,
  getIdsNeedingAttention,
  revalidateId,
  type Verification,
} from "@/lib/storage"
import VerificationModal from "@/components/verification/verification-modal"
import { VerificationListItem } from "@/components/verification/verification-list-item"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function IDVerificationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [verifications, setVerifications] = useState<Verification[]>([])
  const [attentionIds, setAttentionIds] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")

  // Debug logging
  useEffect(() => {
    console.log("Current tab:", activeTab)
    console.log("Current status filter:", statusFilter)
    console.log("Total verifications:", verifications.length)
    console.log("Pending verifications:", verifications.filter((v) => v.status === "pending").length)
    console.log("Attention IDs:", attentionIds.length)
  }, [activeTab, statusFilter, verifications, attentionIds])

  // Set initial tab and status filter from URL params
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    const statusParam = searchParams.get("status")

    if (tabParam === "pending" || tabParam === "history" || tabParam === "attention") {
      setActiveTab(tabParam)
    } else {
      // Default to pending if no valid tab is specified
      setActiveTab("pending")
      // Update URL to include the default tab
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", "pending")
      const newUrl = params.toString() ? `?${params.toString()}` : ""
      router.push(`/dashboard/id-verification${newUrl}`, { scroll: false })
    }

    if (
      statusParam &&
      (statusParam === "all" || statusParam === "pending" || statusParam === "valid" || statusParam === "rejected")
    ) {
      setStatusFilter(statusParam)
    } else {
      // Default to all if no valid status is specified
      setStatusFilter("all")
    }
  }, [searchParams, router])

  // Fetch verifications data
  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        if (!user?.id) return

        const allVerifications = getVerifications()
        const needsAttentionIds = getIdsNeedingAttention()

        console.log("Fetched verifications:", allVerifications.length)
        console.log("Pending count:", allVerifications.filter((v) => v.status === "pending").length)

        setVerifications(allVerifications)
        setAttentionIds(needsAttentionIds)
      } catch (error) {
        console.error("Error fetching verifications:", error)
        toast({
          title: "Error",
          description: "Failed to fetch verification data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchVerifications()
    }
  }, [user?.id, toast])

  // Handle tab change
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value)
    setActiveTab(value)

    // Create a new URLSearchParams object based on the current URL
    const params = new URLSearchParams(searchParams.toString())

    // Always set the tab parameter explicitly
    params.set("tab", value)

    // Handle status filter based on tab
    if (value === "attention") {
      params.delete("status") // Status filter is not applicable for attention tab
    } else if (value === "pending") {
      // When switching to pending tab, set status to pending or all
      if (statusFilter !== "pending" && statusFilter !== "all") {
        setStatusFilter("all")
        params.delete("status")
      }
    } else if (value === "history" && statusFilter === "pending") {
      // Reset status when switching to history if current status is pending
      setStatusFilter("all")
      params.delete("status")
    }

    const newUrl = params.toString() ? `?${params.toString()}` : ""
    router.push(`/dashboard/id-verification${newUrl}`, { scroll: false })
  }

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    console.log("Status filter changed to:", value)
    setStatusFilter(value)

    // Create a new URLSearchParams object based on the current URL
    const params = new URLSearchParams(searchParams.toString())

    // Update or remove the status parameter
    if (value === "all") {
      params.delete("status")
    } else {
      params.set("status", value)
    }

    // Keep the tab parameter if it exists
    if (activeTab !== "pending" && !params.has("tab")) {
      params.set("tab", activeTab)
    }

    const newUrl = params.toString() ? `?${params.toString()}` : ""
    router.push(`/dashboard/id-verification${newUrl}`, { scroll: false })
  }

  const handleVerificationClick = (verification: Verification) => {
    setSelectedVerification(verification)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedVerification(null)
  }

  const handleAccept = (id: string, expirationDate: string) => {
    if (updateVerificationStatus(id, "valid", undefined, expirationDate)) {
      // Update the local state with the updated verification
      const updatedVerifications = getVerifications()
      setVerifications(updatedVerifications)
      setAttentionIds(getIdsNeedingAttention())

      toast({
        title: "ID Verified",
        description: "The ID has been successfully verified.",
        variant: "success",
      })
    }
    setIsModalOpen(false)
  }

  const handleReject = (id: string, reason: string) => {
    if (updateVerificationStatus(id, "rejected", reason)) {
      // Update the local state with the updated verification
      const updatedVerifications = getVerifications()
      setVerifications(updatedVerifications)
      setAttentionIds(getIdsNeedingAttention())

      toast({
        title: "ID Rejected",
        description: "The ID has been rejected.",
        variant: "default",
      })
    }
    setIsModalOpen(false)
  }

  const handleRevalidate = (id: string) => {
    if (revalidateId(id)) {
      // Update the local state with the updated verification
      const updatedVerifications = getVerifications()
      setVerifications(updatedVerifications)
      setAttentionIds(getIdsNeedingAttention())

      toast({
        title: "ID Revalidated",
        description: "The ID has been successfully revalidated.",
        variant: "success",
      })
    }
  }

  // Filter verifications based on active tab, search term, and status filter
  const getFilteredVerifications = () => {
    // For the attention tab, we use the pre-filtered attentionIds
    if (activeTab === "attention") {
      return attentionIds.filter(
        (verification) =>
          verification.idNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          verification.idType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (verification.uploaderName && verification.uploaderName.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // For other tabs, filter based on tab, search, and status
    return verifications.filter((verification) => {
      // Match search term
      const matchesSearch =
        verification.idNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.idType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (verification.uploaderName && verification.uploaderName.toLowerCase().includes(searchTerm.toLowerCase()))

      // Match status filter
      let matchesFilter = true
      if (statusFilter !== "all") {
        matchesFilter = verification.status === statusFilter
      }

      // Match tab
      let matchesTab = false
      if (activeTab === "pending") {
        matchesTab = verification.status === "pending"
      } else if (activeTab === "history") {
        matchesTab = verification.status === "valid" || verification.status === "rejected"
      }

      return matchesSearch && matchesFilter && matchesTab
    })
  }

  const filteredVerifications = getFilteredVerifications()

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">ID Verification</h1>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Verifications</TabsTrigger>
            <TabsTrigger value="history">Verification History</TabsTrigger>
            <TabsTrigger value="attention" className="relative">
              Needs Attention
              {attentionIds.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs text-white">
                  {attentionIds.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <div className="flex flex-col gap-4 sm:flex-row mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by ID number, type, or uploader..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {activeTab !== "attention" && (
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {activeTab === "pending" ? (
                      <SelectItem value="pending">Pending</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="valid">Verified</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending ID Verification Requests</CardTitle>
                  <CardDescription>Review and verify uploaded IDs</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <p>Loading verifications...</p>
                    </div>
                  ) : filteredVerifications.length > 0 ? (
                    <div className="space-y-4">
                      {filteredVerifications.map((verification) => (
                        <VerificationListItem
                          key={verification.id}
                          verification={verification}
                          onClick={() => handleVerificationClick(verification)}
                          showActions={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <CreditCard className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="mb-1 text-lg font-medium">No pending verification requests</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm ? "Try adjusting your search" : "All ID verification requests have been processed"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Verification History</CardTitle>
                  <CardDescription>View past ID verification results</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <p>Loading verification history...</p>
                    </div>
                  ) : filteredVerifications.length > 0 ? (
                    <div className="space-y-4">
                      {filteredVerifications.map((verification) => (
                        <VerificationListItem
                          key={verification.id}
                          verification={verification}
                          onClick={() => handleVerificationClick(verification)}
                          showActions={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <CreditCard className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="mb-1 text-lg font-medium">No verification history found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your search or filter"
                          : "Completed verifications will appear here"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attention">
              <Card className="border-amber-300">
                <CardHeader>
                  <CardTitle>IDs Needing Attention</CardTitle>
                  <CardDescription>Expired student IDs or IDs requiring revalidation</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <p>Loading IDs needing attention...</p>
                    </div>
                  ) : filteredVerifications.length > 0 ? (
                    <div className="space-y-4">
                      {filteredVerifications.map((verification) => (
                        <VerificationListItem
                          key={verification.id}
                          verification={verification}
                          onClick={() => handleVerificationClick(verification)}
                          showActions={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="mb-1 text-lg font-medium">No IDs need attention</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm ? "Try adjusting your search" : "All IDs are up to date and valid"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {selectedVerification && (
        <VerificationModal
          verification={selectedVerification}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAccept={handleAccept}
          onReject={handleReject}
          onRevalidate={handleRevalidate}
        />
      )}

      <Toaster />
    </AppLayout>
  )
}
