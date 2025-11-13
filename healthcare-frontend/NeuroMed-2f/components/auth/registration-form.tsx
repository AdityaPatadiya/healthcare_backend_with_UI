"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Lock, Users, UserCog } from "lucide-react"
import { PatientRegistrationForm } from "./patient-registration-form"
import { DoctorRegistrationForm } from "./doctor-registration-form"

export function RegistrationForm() {
  const [activeTab, setActiveTab] = useState<"patient" | "doctor">("patient")
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()

  const handleSuccessfulRegistration = (message: string, roleType: "patient" | "doctor") => {
    setSuccessMessage(message)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setActiveTab(roleType === "patient" ? "patient" : "doctor")
    }, 3000)
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Success Message */}
      {success && (
        <div className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200 shadow-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      <Card className="border-2 shadow-lg overflow-hidden">
        <CardHeader className="space-y-4 bg-gradient-to-r from-blue-50 to-primary/5 pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>Join HealthCare System to get started</CardDescription>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 bg-muted rounded-lg p-1 mt-4">
            <button
              onClick={() => setActiveTab("patient")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 font-medium text-sm ${
                activeTab === "patient"
                  ? "bg-white text-primary shadow-sm border border-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4" />
              Patient
            </button>
            <button
              onClick={() => setActiveTab("doctor")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 font-medium text-sm ${
                activeTab === "doctor"
                  ? "bg-white text-primary shadow-sm border border-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCog className="w-4 h-4" />
              Doctor
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <div className="animate-in fade-in duration-300">
            {activeTab === "patient" ? (
              <PatientRegistrationForm onSuccess={handleSuccessfulRegistration} />
            ) : (
              <DoctorRegistrationForm onSuccess={handleSuccessfulRegistration} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-primary hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  )
}
