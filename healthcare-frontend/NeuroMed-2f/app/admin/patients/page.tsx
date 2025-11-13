"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { mockPatients } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, Trash2, Eye } from "lucide-react"
import type { Patient } from "@/lib/types"

export default function AdminPatientsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    setPatients(patients.filter((p) => p.id !== id))
    setSelectedPatient(null)
  }

  if (!user) return null

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Patient Management</h1>
          <p className="text-muted-foreground">View and manage all patients (without symptoms)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patients List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>All Patients</CardTitle>
                <CardDescription>{filtered.length} patients found</CardDescription>
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
                  {filtered.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(patient.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Details */}
          {selectedPatient && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Patient Details</span>
                  <Eye className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{selectedPatient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedPatient.phone}</p>
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
                  <p className="text-sm text-muted-foreground">Assigned Doctors</p>
                  <p className="font-medium">{selectedPatient.assignedDoctors?.length || 0} doctors</p>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Note: Patient symptoms are not displayed in admin view for privacy
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
