"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { mockMappings, mockPatients } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, Trash2, Eye, Loader2 } from "lucide-react"
import type { PatientDoctorMapping } from "@/lib/types"

export default function DoctorMappingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [mappings, setMappings] = useState<PatientDoctorMapping[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMapping, setSelectedMapping] = useState<PatientDoctorMapping | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "doctor") {
      router.push("/dashboard")
      return
    }

    // Get mappings for this doctor
    const doctorMappings = mockMappings.filter((m) => m.doctorId === user.id)
    setMappings(doctorMappings)
  }, [user, router])

  const filtered = mappings.filter((m) => {
    const patient = mockPatients.find((p) => p.id === m.patientId)
    return patient?.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleRemoveMapping = async (id: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    setMappings(mappings.filter((m) => m.id !== id))
    setSelectedMapping(null)
    setLoading(false)
  }

  const getPatientName = (patientId: string) => mockPatients.find((p) => p.id === patientId)?.name || "Unknown"

  if (!user) return null

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Manage My Patient Mappings</h1>
          <p className="text-muted-foreground">Create or remove mappings with your patients</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mappings List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Mappings</CardTitle>
                <CardDescription>{filtered.length} active mappings</CardDescription>
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
                      <p className="text-muted-foreground">No mappings found</p>
                    </div>
                  ) : (
                    filtered.map((mapping) => (
                      <div
                        key={mapping.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedMapping(mapping)}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{getPatientName(mapping.patientId)}</p>
                          <p className="text-sm text-muted-foreground">{mapping.symptoms.join(", ")}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveMapping(mapping.id)
                          }}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
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
                  <p className="text-sm text-muted-foreground">Symptoms</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMapping.symptoms.map((symptom, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedMapping.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Date</p>
                  <p className="font-medium">{new Date(selectedMapping.assignedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium text-sm">{selectedMapping.notes || "None"}</p>
                </div>
                <Button
                  variant="destructive"
                  className="w-full mt-4"
                  onClick={() => handleRemoveMapping(selectedMapping.id)}
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Remove Mapping
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
