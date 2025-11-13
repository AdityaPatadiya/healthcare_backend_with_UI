"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, UserRole } from "./types"
import { authAPI } from "./api-client"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (role: UserRole | UserRole[]) => boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth from localStorage and refresh from backend
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token")
      if (token) {
        try {
          // Fetch current user profile from backend
          const profile = await authAPI.getProfile()
          console.log("Profile from backend:", profile) // Debug log
          
          // Transform backend data to match frontend User type
          const transformedUser: User = {
            id: profile.id,
            email: profile.email,
            name: profile.full_name || profile.username || profile.email,
            role: profile.role as UserRole,
            is_active: profile.is_active !== undefined ? profile.is_active : true,
            profile: profile.profile // This contains role-specific data
          }
          
          setUser(transformedUser)
        } catch (err) {
          console.error("Failed to refresh user:", err)
          // Clear invalid tokens
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Call Django backend login endpoint
      const response = await authAPI.login(email, password)

      // Store tokens
      localStorage.setItem("access_token", response.access)
      localStorage.setItem("refresh_token", response.refresh)

      // Fetch user profile
      const profile = await authAPI.getProfile()
      console.log("Login profile:", profile) // Debug log

      // Transform backend data to match frontend User type
      const userData: User = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name || profile.username || profile.email,
        role: profile.role as UserRole,
        is_active: profile.is_active !== undefined ? profile.is_active : true,
        profile: profile.profile
      }

      setUser(userData)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  }

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role as UserRole)
  }

  const refreshUser = async () => {
    try {
      const profile = await authAPI.getProfile()
      console.log("Refreshed profile:", profile) // Debug log
      
      const transformedUser: User = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name || profile.username || profile.email,
        role: profile.role as UserRole,
        is_active: profile.is_active !== undefined ? profile.is_active : true,
        profile: profile.profile
      }
      
      setUser(transformedUser)
    } catch (err) {
      logout()
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
