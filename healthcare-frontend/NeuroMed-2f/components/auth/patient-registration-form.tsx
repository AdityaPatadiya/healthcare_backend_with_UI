"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2 } from "lucide-react"
import { authAPI } from "@/lib/api-client"
import { useRouter } from "next/navigation";

interface PatientRegistrationFormProps {
  onSuccess: (message: string, roleType: "patient" | "doctor") => void
}

interface PatientFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  age: string
  gender: string
  contactNumber: string
  medicalHistory: string
}

interface FormErrors {
  [key: string]: string
}

export function PatientRegistrationForm({ onSuccess }: PatientRegistrationFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    contactNumber: "",
    medicalHistory: "",
  })
  const router = useRouter();

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // ... existing validation code ...
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

    if (!formData.age) {
      newErrors.age = "Age is required"
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 18) {
      newErrors.age = "Must be at least 18 years old"
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required"
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required"
    } else if (!/^\d{10,}$/.test(formData.contactNumber.replace(/\D/g, ""))) {
      newErrors.contactNumber = "Please enter a valid contact number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        role: "patient",
        age: Number.parseInt(formData.age),
        gender: formData.gender,
        contact_number: formData.contactNumber,
        medical_history: formData.medicalHistory,
      })

      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);

      onSuccess("Registration successful! Please log in to your account.", "patient")

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

      // setFormData({
      //   fullName: "",
      //   email: "",
      //   password: "",
      //   confirmPassword: "",
      //   age: "",
      //   gender: "",
      //   contactNumber: "",
      //   medicalHistory: "",
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
          placeholder="John Doe"
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
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="age" className="text-sm font-medium">
            Age
          </label>
          <Input
            id="age"
            name="age"
            type="number"
            placeholder="25"
            value={formData.age}
            onChange={handleChange}
            className={errors.age ? "border-destructive" : ""}
          />
          {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="gender" className="text-sm font-medium">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.gender ? "border-destructive" : ""
              }`}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
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
        <label htmlFor="medicalHistory" className="text-sm font-medium">
          Medical History
          <span className="text-muted-foreground text-xs ml-1">(Optional)</span>
        </label>
        <textarea
          id="medicalHistory"
          name="medicalHistory"
          placeholder="Any existing conditions, allergies, or previous surgeries..."
          value={formData.medicalHistory}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
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
          "Register as Patient"
        )}
      </Button>
    </form>
  )
}
