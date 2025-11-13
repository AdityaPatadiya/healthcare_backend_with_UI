"use client"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (user.role === "doctor") {
        router.push("/doctor/dashboard")
      } else if (user.role === "patient") {
        router.push("/patient/dashboard")
      }
    }
  }, [user, isLoading, router])
  useEffect(() => {
    console.log("User:", user)
    console.log("Loading:", isLoading)
  }, [user, isLoading])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  // Show nothing while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="ml-2">Redirecting to your dashboard...</span>
    </div>
  )
}
