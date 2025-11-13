"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { mockMappings, mockDoctors } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SearchIcon, Eye, Mail, Phone, Badge } from "lucide-react"
import type { PatientDoctorMapping } from "@/lib/types"

export default function PatientMappingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [mappings, setMappings] = useState<PatientDoctorMapping[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMapping, setSelectedMapping] = useState<PatientDoctorMapping | null>(null)

  useEffect(() => {
    if (!user || user.role !== "patient") {
      router.push("/dashboard")
      return
    }

    // Get mappings for this patient
    const patientMappings = mockMappings.filter((m) => m.patientId === user.id && m.status === "active")
    setMappings(patientMappings)
  }, [user, router])

  const filtered = mappings.filter((m) => {
    const doctor = mockDoctors.find((d) => d.id === m.doctorId)
    return (
      doctor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor?.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const getDoctorInfo = (doctorId: string) => mockDoctors.find((d) => d.id === doctorId)

  if (!user) return null

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">My Doctors</h1>
          <p className="text-muted-foreground">Your assigned healthcare providers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctors List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Doctors</CardTitle>
                <CardDescription>{filtered.length} doctors assigned to you</CardDescription>
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
                  {filtered.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No doctors assigned yet</p>
                    </div>
                  ) : (
                    filtered.map((mapping) => {
                      const doctor = getDoctorInfo(mapping.doctorId)
                      return (
                        <div
                          key={mapping.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedMapping(mapping)}
                        >
                          <div className="flex-1">
                            <p className="font-medium">{doctor?.name}</p>
                            <p className="text-sm text-muted-foreground">{doctor?.specialization}</p>
                          </div>
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Doctor Details */}
          {selectedMapping && getDoctorInfo(selectedMapping.doctorId) && (
            <Card>
              <CardHeader>
                <CardTitle>Doctor Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getDoctorInfo(selectedMapping.doctorId) && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{getDoctorInfo(selectedMapping.doctorId)?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Specialization</p>
                      <p className="font-medium">{getDoctorInfo(selectedMapping.doctorId)?.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium">{getDoctorInfo(selectedMapping.doctorId)?.experience} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Availability</p>
                      <Badge className="mt-1">{getDoctorInfo(selectedMapping.doctorId)?.availability}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your Symptoms</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedMapping.symptoms.map((symptom, idx) => (
                          <span key={idx} className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="font-medium text-sm">{selectedMapping.notes || "None"}</p>
                    </div>
                    <div className="pt-4 border-t border-border space-y-2">
                      <a
                        href={`mailto:${getDoctorInfo(selectedMapping.doctorId)?.email}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Mail className="w-4 h-4" />
                        {getDoctorInfo(selectedMapping.doctorId)?.email}
                      </a>
                      <a
                        href={`tel:${getDoctorInfo(selectedMapping.doctorId)?.phone}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Phone className="w-4 h-4" />
                        {getDoctorInfo(selectedMapping.doctorId)?.phone}
                      </a>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
