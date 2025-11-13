"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Heart, AlertCircle, Calendar, Loader2 } from "lucide-react"
import { patientAPI } from "@/lib/api-client"
import type { PatientProfile } from "@/lib/types"

interface DashboardStats {
  assignedDoctors: number
  activeSymptoms: number
  nextAppointment: string
  healthScore: number
}

export default function PatientDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [patient, setPatient] = useState<PatientProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    assignedDoctors: 0,
    activeSymptoms: 0,
    nextAppointment: "N/A",
    healthScore: 0,
  })
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "patient")) {
      router.push("/dashboard")
      return
    }

    const fetchPatientData = async () => {
      if (user) {
        try {
          setIsLoadingData(true)
          // Fetch patient data from API
          const patientData = await patientAPI.detail(user.id)
          console.log("Patient data:", patientData) // Debug log
          
          setPatient(patientData)
          
          // Calculate stats from real data
          setStats({
            assignedDoctors: patientData.assigned_doctors_count || 0,
            activeSymptoms: patientData.current_symptoms?.length || 0,
            nextAppointment: patientData.next_appointment || "N/A",
            healthScore: patientData.health_score || 75, // Default value
          })
        } catch (error) {
          console.error("Failed to fetch patient data:", error)
        } finally {
          setIsLoadingData(false)
        }
      }
    }

    if (user) {
      fetchPatientData()
    }
  }, [user, isLoading, router])

  if (isLoading || isLoadingData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </MainLayout>
    )
  }

  if (!user || !patient) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">No patient data found</h1>
            <p className="text-muted-foreground">Please contact support</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Welcome, {patient.full_name}</h1>
          <p className="text-muted-foreground">Your health dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Assigned Doctors</span>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assignedDoctors}</div>
              <p className="text-xs text-muted-foreground mt-1">Healthcare providers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Age</span>
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patient.age}</div>
              <p className="text-xs text-muted-foreground mt-1">Years</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Gender</span>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold capitalize">{patient.gender}</div>
              <p className="text-xs text-muted-foreground mt-1">Patient</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Contact</span>
                <Heart className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{patient.contact_number}</div>
              <p className="text-xs text-muted-foreground mt-1">Phone number</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Your Health Information</CardTitle>
              <CardDescription>Personal medical details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{patient.gender}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medical History</p>
                <p className="font-medium">{patient.medical_history || "No medical history recorded"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Navigate sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/patient/profile"
                className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                My Profile
              </a>
              <a
                href="/doctors"
                className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                Browse Doctors
              </a>
              <a
                href="/patient/mappings"
                className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                My Doctors
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
