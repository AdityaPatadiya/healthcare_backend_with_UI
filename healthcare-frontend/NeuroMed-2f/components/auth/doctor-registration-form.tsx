"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2, Info } from "lucide-react"
import { authAPI } from "@/lib/api-client"
import { useRouter } from "next/navigation";

interface DoctorRegistrationFormProps {
  onSuccess: (message: string, roleType: "patient" | "doctor") => void
}

interface DoctorFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  specialization: string
  licenseNumber: string
  experience: string
  contactNumber: string
}

interface FormErrors {
  [key: string]: string
}

export function DoctorRegistrationForm({ onSuccess }: DoctorRegistrationFormProps) {
  const [formData, setFormData] = useState<DoctorFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    licenseNumber: "",
    experience: "",
    contactNumber: "",
  })
  const router = useRouter();

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } // else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
    //   newErrors.password = "Password must contain uppercase, lowercase, number, and special character"
    // }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.specialization) {
      newErrors.specialization = "Specialization is required"
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = "License number is required"
    }

    if (!formData.experience) {
      newErrors.experience = "Experience is required"
    } else if (isNaN(Number(formData.experience)) || Number(formData.experience) < 0) {
      newErrors.experience = "Please enter valid years of experience"
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required"
    } else if (!/^\d{10,}$/.test(formData.contactNumber.replace(/\D/g, ""))) {
      newErrors.contactNumber = "Please enter a valid contact number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        full_name: formData.fullName,
        role: "doctor",
        specializations: [formData.specialization],
        license_number: formData.licenseNumber,
        years_of_experience: Number.parseInt(formData.experience),
        contact_number: formData.contactNumber,
      })

      // Store tokens and user data
      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);

      onSuccess("Registration successful! Your account is pending admin approval.", "doctor")

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      // setFormData({
      //   fullName: "",
      //   email: "",
      //   password: "",
      //   confirmPassword: "",
      //   specialization: "",
      //   licenseNumber: "",
      //   experience: "",
      //   contactNumber: "",
      // })
    } catch (err: any) {
      console.error("Registration error details:", err);

      let errorMessage = "Registration failed. Please try again.";

      if (err.message) {
        // Try to parse the error message as it might be a JSON string
        try {
          const errorData = JSON.parse(err.message);
          // If it's an object, extract the first error message
          if (typeof errorData === 'object') {
            const firstKey = Object.keys(errorData)[0];
            const firstError = errorData[firstKey];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0];
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            } else {
              errorMessage = "Registration failed. Please check your input.";
            }
          }
        } catch (parseError) {
          // If it's not JSON, use the string message directly
          errorMessage = err.message;
        }
      }

      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const specializations = [
    "Cardiology",
    "Dermatology",
    "General Practice",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Surgery",
    "Dental",
    "Other",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitError && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive border border-destructive/20">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      {/* ... existing form fields ... */}
      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          Full Name
        </label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Dr. Sarah Johnson"
          value={formData.fullName}
          onChange={handleChange}
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="doctor@example.com"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="specialization" className="text-sm font-medium">
          Specialization
        </label>
        <select
          id="specialization"
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          className={`w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.specialization ? "border-destructive" : ""
            }`}
        >
          <option value="">Select specialization</option>
          {specializations.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
        {errors.specialization && <p className="text-xs text-destructive">{errors.specialization}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="licenseNumber" className="text-sm font-medium">
            License Number
          </label>
          <Input
            id="licenseNumber"
            name="licenseNumber"
            type="text"
            placeholder="LIC-123456"
            value={formData.licenseNumber}
            onChange={handleChange}
            className={errors.licenseNumber ? "border-destructive" : ""}
          />
          {errors.licenseNumber && <p className="text-xs text-destructive">{errors.licenseNumber}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="experience" className="text-sm font-medium">
            Years of Experience
          </label>
          <Input
            id="experience"
            name="experience"
            type="number"
            placeholder="5"
            value={formData.experience}
            onChange={handleChange}
            className={errors.experience ? "border-destructive" : ""}
          />
          {errors.experience && <p className="text-xs text-destructive">{errors.experience}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="contactNumber" className="text-sm font-medium">
          Contact Number
        </label>
        <Input
          id="contactNumber"
          name="contactNumber"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.contactNumber}
          onChange={handleChange}
          className={errors.contactNumber ? "border-destructive" : ""}
        />
        {errors.contactNumber && <p className="text-xs text-destructive">{errors.contactNumber}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={errors.confirmPassword ? "border-destructive" : ""}
        />
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Register as Doctor"
        )}
      </Button>

      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900">Your account will be reviewed and activated by the admin.</p>
      </div>
    </form>
  )
}
