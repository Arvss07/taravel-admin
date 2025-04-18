"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, login as loginUser, logout as logoutUser, type User, initializeStorage } from "@/lib/storage"

interface AuthContextType {
  user: Partial<User> | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Partial<User> | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize storage once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeStorage()
    }
  }, [])

  // Load user from session storage once on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const user = loginUser(email, password)

      if (user) {
        setUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        })
        return { success: true }
      }

      return { success: false, error: "Invalid email or password" }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An error occurred during login" }
    }
  }, [])

  const logout = useCallback(() => {
    logoutUser()
    setUser(null)
    router.push("/login")
  }, [router])

  const contextValue = {
    user,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
