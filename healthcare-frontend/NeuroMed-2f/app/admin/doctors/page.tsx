"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { mockDoctors } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, Trash2, Eye, CheckCircle } from "lucide-react"
import type { Doctor } from "@/lib/types"

export default function AdminDoctorsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    setDoctors(doctors.filter((d) => d.id !== id))
    setSelectedDoctor(null)
  }

  if (!user) return null

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Doctor Management</h1>
          <p className="text-muted-foreground">View and manage all registered doctors</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctors List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>All Doctors</CardTitle>
                <CardDescription>{filtered.length} doctors registered</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filtered.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {doctor.availability === "available" && <CheckCircle className="w-4 h-4 text-green-600" />}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(doctor.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Doctor Details */}
          {selectedDoctor && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Doctor Details</span>
                  <Eye className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedDoctor.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specialization</p>
                  <p className="font-medium">{selectedDoctor.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{selectedDoctor.email}</p>
                </div>
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
                  <p className="text-sm text-muted-foreground">Active Patients</p>
                  <p className="font-medium">{selectedDoctor.patients?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
