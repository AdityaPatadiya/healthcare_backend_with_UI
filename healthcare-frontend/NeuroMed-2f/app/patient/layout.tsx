"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== "patient") {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user || user.role !== "patient") {
    return null
  }

  return <>{children}</>
}
