"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { mockMappings, mockPatients } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SearchIcon, Eye, Phone, Mail } from "lucide-react"
import type { Patient } from "@/lib/types"

export default function DoctorPatientsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  useEffect(() => {
    if (!user || user.role !== "doctor") {
      router.push("/dashboard")
      return
    }

    // Get patients mapped to this doctor
    const mappedPatientIds = mockMappings
      .filter((m) => m.doctorId === user.id && m.status === "active")
      .map((m) => m.patientId)

    const doctorPatients = mockPatients.filter((p) => mappedPatientIds.includes(p.id))

    setPatients(doctorPatients)
  }, [user, router])

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!user) return null

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">My Patients</h1>
          <p className="text-muted-foreground">Patients assigned to you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patients List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient List</CardTitle>
                <CardDescription>{filtered.length} patients assigned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No patients assigned yet</p>
                    </div>
                  ) : (
                    filtered.map((patient) => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.bloodGroup}</p>
                        </div>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Details */}
          {selectedPatient && (
            <Card>
              <CardHeader>
                <CardTitle>Patient Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{selectedPatient.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{selectedPatient.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Medical History</p>
                  <p className="font-medium text-sm">{selectedPatient.medicalHistory || "None"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Symptoms</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPatient.currentSymptoms.map((symptom, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-border space-y-2">
                  <a
                    href={`mailto:${selectedPatient.email}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    {selectedPatient.email}
                  </a>
                  <a
                    href={`tel:${selectedPatient.phone}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {selectedPatient.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
