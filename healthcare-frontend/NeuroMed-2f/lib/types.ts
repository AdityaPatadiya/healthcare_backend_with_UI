// User roles in the healthcare system
export type UserRole = "patient" | "doctor" | "admin"

// Base User interface
export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  role: UserRole
  is_active: boolean
  profile?: PatientProfile | DoctorProfile
}

// Patient Profile interface
export interface PatientProfile {
  id: number
  user: number
  full_name: string
  email: string
  age: number
  gender: string
  contact_number: string
  medical_history: string
  created_at: string
}

// Doctor Profile interface  
export interface DoctorProfile {
  id: number
  user: number
  full_name: string
  email: string
  specializations: string[]
  license_number: string
  years_of_experience: number
  contact_number: string
  is_approved: boolean
  created_by: number
  created_at: string
}

// Patient-Doctor Mapping
export interface PatientDoctorMapping {
  id: number
  patient: number
  patient_name: string
  doctor: number
  doctor_name: string
  doctor_specializations: string[]
  created_at: string
}

// Login Response
export interface LoginResponse {
  access: string
  refresh: string
  user: User
}

// Registration Data
export interface PatientRegistrationData {
  email: string
  password: string
  full_name: string
  role: 'patient'
  age: number
  gender: string
  contact_number: string
  medical_history?: string
}

export interface DoctorRegistrationData {
  email: string
  password: string
  full_name: string
  role: 'doctor'
  specializations: string[]
  license_number: string
  years_of_experience: number
  contact_number: string
}
