"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { mockPatients, mockDoctors, mockMappings } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, Calendar } from "lucide-react"

export default function ReportsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [reportData, setReportData] = useState({
    patientStats: [] as any[],
    appointmentTrends: [] as any[],
    specializationBreakdown: [] as any[],
  })

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    // Generate report data
    const specializations = Array.from(new Set(mockDoctors.map((d) => d.specialization)))
    const specializationData = specializations.map((spec) => ({
      name: spec,
      count: mockDoctors.filter((d) => d.specialization === spec).length,
    }))

    const patientStats = [
      { month: "Jan", patients: 45, doctors: 12 },
      { month: "Feb", patients: 52, doctors: 14 },
      { month: "Mar", patients: 48, doctors: 13 },
      { month: "Apr", patients: 61, doctors: 15 },
      { month: "May", patients: 55, doctors: 14 },
      { month: "Jun", patients: 67, doctors: 16 },
    ]

    const appointmentTrends = [
      { week: "Week 1", appointments: 28, completed: 24 },
      { week: "Week 2", appointments: 35, completed: 32 },
      { week: "Week 3", appointments: 42, completed: 39 },
      { week: "Week 4", appointments: 38, completed: 36 },
    ]

    setReportData({
      patientStats,
      appointmentTrends,
      specializationBreakdown: specializationData,
    })
  }, [user, router])

  if (!user) return null

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">System Reports</h1>
            <p className="text-muted-foreground">Analytics and insights</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPatients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDoctors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Mappings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMappings.filter((m) => m.status === "active").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Patient and Doctor Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Growth Trend</CardTitle>
              <CardDescription>Patient and doctor growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.patientStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="patients" stroke="#0088FE" name="Patients" />
                  <Line type="monotone" dataKey="doctors" stroke="#00C49F" name="Doctors" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Appointment Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Trends</CardTitle>
              <CardDescription>Weekly appointment completion rate</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.appointmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="appointments" fill="#0088FE" name="Total" />
                  <Bar dataKey="completed" fill="#00C49F" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Specialization Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Doctors by Specialization</CardTitle>
              <CardDescription>Distribution across specializations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.specializationBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {reportData.specializationBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>System Statistics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Cases per Doctor</span>
                  <span className="font-semibold">3.4</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: "68%" }} />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">System Uptime</span>
                  <span className="font-semibold">99.8%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: "99.8%" }} />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">Data Security</span>
                  <span className="font-semibold">Compliant</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: "100%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Report Options</CardTitle>
            <CardDescription>Generate and export reports in different formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Download as PDF
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Download as Excel
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
