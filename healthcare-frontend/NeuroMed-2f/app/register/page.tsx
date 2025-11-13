"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { RegistrationForm } from "@/components/auth/registration-form"

export default function RegisterPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-background to-muted p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 w-full max-w-2xl">
        <RegistrationForm />
      </div>
    </div>
  )
}
