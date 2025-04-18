"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"
import { UserPlus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  joinedAt: string
}

export default function UserOverview() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, "users"), orderBy("joinedAt", "desc"), limit(5))

        const snapshot = await getDocs(usersQuery)

        if (snapshot.empty) {
          // Sample data for development
          setUsers([
            {
              id: "u1",
              name: "John Doe",
              email: "john.doe@example.com",
              role: "driver",
              status: "active",
              joinedAt: "2023-01-15",
            },
            {
              id: "u2",
              name: "Jane Smith",
              email: "jane.smith@example.com",
              role: "driver",
              status: "active",
              joinedAt: "2023-02-20",
            },
            {
              id: "u3",
              name: "Mike Johnson",
              email: "mike.johnson@example.com",
              role: "conductor",
              status: "active",
              joinedAt: "2023-03-10",
            },
            {
              id: "u4",
              name: "Sarah Williams",
              email: "sarah.williams@example.com",
              role: "conductor",
              status: "inactive",
              joinedAt: "2023-04-05",
            },
          ])
        } else {
          const fetchedUsers = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as User[]

          setUsers(fetchedUsers)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        // Sample data for development
        setUsers([
          {
            id: "u1",
            name: "John Doe",
            email: "john.doe@example.com",
            role: "driver",
            status: "active",
            joinedAt: "2023-01-15",
          },
          {
            id: "u2",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            role: "driver",
            status: "active",
            joinedAt: "2023-02-20",
          },
          {
            id: "u3",
            name: "Mike Johnson",
            email: "mike.johnson@example.com",
            role: "conductor",
            status: "active",
            joinedAt: "2023-03-10",
          },
          {
            id: "u4",
            name: "Sarah Williams",
            email: "sarah.williams@example.com",
            role: "conductor",
            status: "inactive",
            joinedAt: "2023-04-05",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36 mb-1" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left p-2">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left p-2">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left p-2">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left p-2">
                    <Skeleton className="h-4 w-16" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </td>
                      <td className="p-2">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-2">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="p-2">
                        <Skeleton className="h-6 w-16" />
                      </td>
                      <td className="p-2">
                        <Skeleton className="h-4 w-16" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Recently added users</CardDescription>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/users/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">{user.email}</td>
                    <td className="p-2">
                      <span className="capitalize">{user.role}</span>
                    </td>
                    <td className="p-2">
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">{user.joinedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No users added yet</p>
            <Button className="mt-4" size="sm" asChild>
              <Link href="/admin/users/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
