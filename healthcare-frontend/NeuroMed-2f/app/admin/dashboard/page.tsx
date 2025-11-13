"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { mockDoctors, mockPatients, mockMappings } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Stethoscope, Link2, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    activeMappings: 0,
    systemHealth: 0,
  })

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    // Calculate stats
    setStats({
      totalPatients: mockPatients.length,
      totalDoctors: mockDoctors.length,
      activeMappings: mockMappings.filter((m) => m.status === "active").length,
      systemHealth: 98,
    })
  }, [])

  if (!user) return null

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
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
              <p className="text-xs text-muted-foreground mt-1">Active patients in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Total Doctors</span>
                <Stethoscope className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDoctors}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered practitioners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Active Mappings</span>
                <Link2 className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeMappings}</div>
              <p className="text-xs text-muted-foreground mt-1">Patient-doctor relationships</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>System Health</span>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.systemHealth}%</div>
              <p className="text-xs text-muted-foreground mt-1">Overall system status</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "New patient registered", time: "2 hours ago", user: "John Doe" },
                  { action: "Doctor mapping created", time: "4 hours ago", user: "Dr. Sarah Johnson" },
                  { action: "System backup completed", time: "1 day ago", user: "System" },
                  { action: "New doctor added", time: "2 days ago", user: "Dr. Emma Wilson" },
                ].map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Navigate to management sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/admin/patients"
                className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                Manage Patients
              </a>
              <a
                href="/admin/doctors"
                className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                Manage Doctors
              </a>
              <a
                href="/admin/mappings"
                className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                View Mappings
              </a>
              <a
                href="/reports"
                className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                Generate Reports
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
