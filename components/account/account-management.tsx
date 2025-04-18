"use client"

import { useState, useEffect } from "react"
import { Plus, Search, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getUsers, type User } from "@/lib/storage"
import { Badge } from "@/components/ui/badge"
import AddAccountModal from "@/components/account/add-account-modal"
import ViewAccountModal from "@/components/account/view-account-modal"

export default function AccountManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [accountTypeFilter, setAccountTypeFilter] = useState("all")
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all")

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<User | null>(null)

  // Load users on mount
  useEffect(() => {
    const loadUsers = () => {
      try {
        // Get all users and filter out admin accounts
        const allUsers = getUsers().filter((user) => user.role !== "admin")
        setUsers(allUsers)
      } catch (error) {
        console.error("Error loading users:", error)
        toast({
          title: "Error",
          description: "Failed to load accounts. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [toast])

  // Filter users based on search term and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesAccountType =
      accountTypeFilter === "all" ||
      (accountTypeFilter === "organization" && user.accountType === "organization") ||
      (accountTypeFilter === "individual" && user.accountType === "individual")

    const matchesServiceType =
      serviceTypeFilter === "all" ||
      (serviceTypeFilter === "bus" && user.serviceType === "bus") ||
      (serviceTypeFilter === "van" && user.serviceType === "van")

    return matchesSearch && matchesAccountType && matchesServiceType
  })

  // Handle view account click
  const handleViewAccount = (account: User) => {
    setSelectedAccount(account)
    setIsViewModalOpen(true)
  }

  // Refresh user list
  const refreshUsers = () => {
    const updatedUsers = getUsers().filter((user) => user.role !== "admin")
    setUsers(updatedUsers)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Account Management</h1>
          <p className="text-muted-foreground">Manage organization and individual accounts</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search accounts..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Account Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            <SelectItem value="organization">Organization</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="bus">Bus Operator</SelectItem>
            <SelectItem value="van">Van Operator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p>Loading accounts...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>List of all accounts in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Username</th>
                    <th className="text-left p-2">Account Type</th>
                    <th className="text-left p-2">Service Type</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-2">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="p-2">{user.username || "N/A"}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="capitalize">
                          {user.accountType || "N/A"}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="capitalize">
                          {user.serviceType ? `${user.serviceType} Operator` : "N/A"}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge
                          className={
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : user.status === "disabled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewAccount(user)}>
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Users className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="mb-1 text-lg font-medium">No accounts found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || accountTypeFilter !== "all" || serviceTypeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first account"}
          </p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
      )}

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refreshUsers()
          setIsAddModalOpen(false)
          toast({
            title: "Account Added",
            description: "The account has been successfully added.",
            variant: "success",
          })
        }}
      />

      {/* View Account Modal */}
      {selectedAccount && (
        <ViewAccountModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          account={selectedAccount}
          onSuccess={() => {
            refreshUsers()
            setIsViewModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
