"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { mockDoctors, mockPatients } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/types"
import { Edit2, Mail, Phone } from "lucide-react"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Find the full profile based on role
    if (user.role === "doctor") {
      const doctor = mockDoctors.find((d) => d.id === user.id)
      setProfile(doctor || user)
    } else if (user.role === "patient") {
      const patient = mockPatients.find((p) => p.id === user.id)
      setProfile(patient || user)
    } else {
      setProfile(user)
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user || !profile) return null

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">My Profile</h1>
            <p className="text-muted-foreground">Manage your account</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium break-all">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Type</p>
                    <p className="font-medium capitalize">{profile.role}</p>
                  </div>
                </div>

                {profile.role === "doctor" && "specialization" in profile && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">Specialization</p>
                      <p className="font-medium">{(profile as any).specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">License Number</p>
                      <p className="font-medium">{(profile as any).licenseNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium">{(profile as any).experience} years</p>
                    </div>
                  </div>
                )}

                {profile.role === "patient" && "dateOfBirth" in profile && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{(profile as any).dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Blood Group</p>
                      <p className="font-medium">{(profile as any).bloodGroup}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Help Center
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
