"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { mockMappings, mockPatients, mockDoctors } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, Trash2, Eye, Badge } from "lucide-react"
import type { PatientDoctorMapping } from "@/lib/types"

export default function AdminMappingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [mappings, setMappings] = useState<PatientDoctorMapping[]>(mockMappings)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMapping, setSelectedMapping] = useState<PatientDoctorMapping | null>(null)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  const filtered = mappings.filter((m) => {
    const patient = mockPatients.find((p) => p.id === m.patientId)
    const doctor = mockDoctors.find((d) => d.id === m.doctorId)
    return (
      patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleDelete = (id: string) => {
    setMappings(mappings.filter((m) => m.id !== id))
    setSelectedMapping(null)
  }

  const getPatientName = (patientId: string) => mockPatients.find((p) => p.id === patientId)?.name || "Unknown"

  const getDoctorName = (doctorId: string) => mockDoctors.find((d) => d.id === doctorId)?.name || "Unknown"

  if (!user) return null

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Patient-Doctor Mappings</h1>
          <p className="text-muted-foreground">View and manage all patient-doctor relationships</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mappings List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>All Mappings</CardTitle>
                <CardDescription>{filtered.length} mappings found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient or doctor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filtered.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedMapping(mapping)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{getPatientName(mapping.patientId)}</p>
                        <p className="text-sm text-muted-foreground">→ {getDoctorName(mapping.doctorId)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={mapping.status === "active" ? "default" : "secondary"}>{mapping.status}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(mapping.id)
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

          {/* Mapping Details */}
          {selectedMapping && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Mapping Details</span>
                  <Eye className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">{getPatientName(selectedMapping.patientId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">{getDoctorName(selectedMapping.doctorId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="mt-1">{selectedMapping.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Date</p>
                  <p className="font-medium">{new Date(selectedMapping.assignedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Symptoms</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMapping.symptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium text-sm">{selectedMapping.notes || "None"}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
