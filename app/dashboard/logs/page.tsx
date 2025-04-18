"use client"

import { useState } from "react"
import { FileText, Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AppLayout from "@/components/layout/app-layout"

// Define log entry type
interface LogEntry {
  id: string
  timestamp: string
  action: string
  user: string
  details: string
  level: "info" | "warning" | "error"
}

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState("all")
  const [filterAction, setFilterAction] = useState("all")

  // Sample log data
  const logs: LogEntry[] = [
    {
      id: "log1",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      action: "ID Verification",
      user: "John Doe",
      details: "Verified Student ID #ST12345",
      level: "info",
    },
    {
      id: "log2",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      action: "ID Verification",
      user: "Jane Smith",
      details: "Rejected Senior Citizen ID #SC6789 - ID appears to be expired",
      level: "warning",
    },
    {
      id: "log3",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      action: "Login",
      user: "Admin User",
      details: "Successful login",
      level: "info",
    },
    {
      id: "log4",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      action: "Login",
      user: "Unknown",
      details: "Failed login attempt - Invalid credentials",
      level: "error",
    },
    {
      id: "log5",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      action: "ID Verification",
      user: "Mike Johnson",
      details: "Revalidated PWD ID #PW4321",
      level: "info",
    },
  ]

  // Filter logs based on search term and filters
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLevel = filterLevel === "all" || log.level === filterLevel
    const matchesAction = filterAction === "all" || log.action === filterAction

    return matchesSearch && matchesLevel && matchesAction
  })

  // Get unique actions for filter
  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)))

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Get level badge color
  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case "info":
        return "bg-blue-100 text-blue-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">System Logs</h1>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>View system activity and audit logs</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Timestamp</th>
                      <th className="text-left p-2">Action</th>
                      <th className="text-left p-2">User</th>
                      <th className="text-left p-2">Details</th>
                      <th className="text-left p-2">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b">
                        <td className="p-2 text-sm text-muted-foreground">{formatTimestamp(log.timestamp)}</td>
                        <td className="p-2">{log.action}</td>
                        <td className="p-2">{log.user}</td>
                        <td className="p-2 text-sm">{log.details}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeClass(log.level)}`}
                          >
                            {log.level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="mb-1 text-lg font-medium">No logs found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || filterLevel !== "all" || filterAction !== "all"
                    ? "Try adjusting your search or filters"
                    : "No system activity has been recorded yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
