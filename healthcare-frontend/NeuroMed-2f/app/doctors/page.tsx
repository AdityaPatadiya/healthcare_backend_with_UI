"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { mockDoctors, mockMappings } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, MapPin, Stethoscope, CheckCircle } from "lucide-react"
import type { Doctor } from "@/lib/types"

export default function DoctorsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [filterSpecialization, setFilterSpecialization] = useState("")

  // Only patients and admins can view all doctors
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const specializations = Array.from(new Set(mockDoctors.map((d) => d.specialization))).sort()

  const filtered = doctors.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = !filterSpecialization || d.specialization === filterSpecialization
    return matchesSearch && matchesSpecialization
  })

  const getDoctorPatientCount = (doctorId: string) => {
    return mockMappings.filter((m) => m.doctorId === doctorId && m.status === "active").length
  }

  const isAlreadyMapped = (doctorId: string) => {
    if (user?.role !== "patient") return false
    return mockMappings.some((m) => m.patientId === user.id && m.doctorId === doctorId && m.status === "active")
  }

  if (!user) return null

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Find Healthcare Providers</h1>
          <p className="text-muted-foreground">
            {user.role === "patient" ? "Browse and connect with doctors" : "View all registered doctors"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filter Doctors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Specialization</label>
                  <select
                    value={filterSpecialization}
                    onChange={(e) => setFilterSpecialization(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                  >
                    <option value="">All Specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-medium">Results: {filtered.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Doctors Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {filtered.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No doctors found matching your criteria</p>
                  </CardContent>
                </Card>
              ) : (
                filtered.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{doctor.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Stethoscope className="w-4 h-4" />
                            {doctor.specialization}
                          </CardDescription>
                        </div>
                        {doctor.availability === "available" && <CheckCircle className="w-5 h-5 text-green-600" />}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Experience</span>
                        <span className="font-medium">{doctor.experience}+ years</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">License</span>
                        <span className="font-medium">{doctor.licenseNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Active Patients</span>
                        <span className="font-medium">{getDoctorPatientCount(doctor.id)}</span>
                      </div>
                      <Button
                        className="w-full mt-4"
                        variant={isAlreadyMapped(doctor.id) ? "secondary" : "default"}
                        disabled={isAlreadyMapped(doctor.id)}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDoctor(doctor)
                        }}
                      >
                        {isAlreadyMapped(doctor.id) ? "Already Connected" : "View Details"}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Doctor Details Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle>{selectedDoctor.name}</CardTitle>
                    <CardDescription>{selectedDoctor.specialization}</CardDescription>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{selectedDoctor.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium">{selectedDoctor.experience} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <p className="font-medium capitalize">{selectedDoctor.availability}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{selectedDoctor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedDoctor.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Patients</p>
                  <p className="font-medium">{getDoctorPatientCount(selectedDoctor.id)}</p>
                </div>

                {user.role === "patient" && !isAlreadyMapped(selectedDoctor.id) && (
                  <Button className="w-full mt-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    Connect with Doctor
                  </Button>
                )}

                {isAlreadyMapped(selectedDoctor.id) && user.role === "patient" && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm text-green-800">Already connected with this doctor</p>
                  </div>
                )}

                <Button variant="outline" className="w-full bg-transparent" onClick={() => setSelectedDoctor(null)}>
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
