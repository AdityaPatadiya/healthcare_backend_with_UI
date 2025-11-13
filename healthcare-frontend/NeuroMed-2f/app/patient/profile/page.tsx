"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { mockPatients } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Patient } from "@/lib/types"
import { Edit2 } from "lucide-react"

export default function PatientProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "patient") {
      router.push("/dashboard")
      return
    }

    const foundPatient = mockPatients.find((p) => p.id === user.id)
    setPatient(foundPatient || null)
  }, [user, router])

  if (!user || !patient) return null

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">My Profile</h1>
            <p className="text-muted-foreground">Manage your health information</p>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit2 className="w-4 h-4 mr-2" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium break-all">{patient.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{patient.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{patient.dateOfBirth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{patient.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Medical History</p>
                  <p className="font-medium">{patient.medicalHistory || "No medical history recorded"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Symptoms</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {patient.currentSymptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-3 py-1 text-xs font-medium bg-destructive/10 text-destructive rounded-full"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Account Type</span>
                  <span className="text-sm font-medium capitalize">Patient</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">{new Date(patient.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Privacy Notice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Your medical information is securely stored and only accessible to your assigned healthcare providers
                  and administrators.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
