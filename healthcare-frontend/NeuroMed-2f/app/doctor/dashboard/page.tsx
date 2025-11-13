"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { mockDoctors, mockMappings } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Clock, TrendingUp } from "lucide-react"
import type { Doctor } from "@/lib/types"

export default function DoctorDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeMappings: 0,
    consultationsThisWeek: 0,
    avgPatientsSeen: 0,
  })

  useEffect(() => {
    if (!user || user.role !== "doctor") {
      router.push("/dashboard")
      return
    }

    const foundDoctor = mockDoctors.find((d) => d.id === user.id)
    if (foundDoctor) {
      setDoctor(foundDoctor)

      // Calculate stats
      const doctorMappings = mockMappings.filter((m) => m.doctorId === user.id)
      setStats({
        totalPatients: foundDoctor.patients?.length || 0,
        activeMappings: doctorMappings.filter((m) => m.status === "active").length,
        consultationsThisWeek: Math.floor(Math.random() * 8) + 3,
        avgPatientsSeen: 24,
      })
    }
  }, [user, router])

  if (!user || !doctor) return null

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {doctor.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Total Patients</span>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground mt-1">Patients assigned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Active Cases</span>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeMappings}</div>
              <p className="text-xs text-muted-foreground mt-1">Active patient mappings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>This Week</span>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.consultationsThisWeek}</div>
              <p className="text-xs text-muted-foreground mt-1">Consultations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Specialization</span>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{doctor.experience}y</div>
              <p className="text-xs text-muted-foreground mt-1">{doctor.specialization}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Info and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{doctor.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Years of Experience</p>
                  <p className="font-medium">{doctor.experience} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specialization</p>
                  <p className="font-medium">{doctor.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <p className="font-medium capitalize">{doctor.availability}</p>
                </div>
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
                href="/doctor/patients"
                className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                My Patients
              </a>
              <a
                href="/doctor/mappings"
                className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                Manage Mappings
              </a>
              <a
                href="/doctors"
                className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                Other Doctors
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
