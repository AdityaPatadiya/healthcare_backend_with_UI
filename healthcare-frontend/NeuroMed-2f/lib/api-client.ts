// API client for Django backend
// const BASE_URL = "http://backend:8000/api"

// For browser access, you might need to handle both cases
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // In browser, use the external port
    return "http://localhost:8000/api"
  }
  // In server-side or Docker context, use service name
  return "http://backend:8000/api"
}

const BASE_URL = getBaseUrl()

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

class APIClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }
    return url.toString()
  }

  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return headers
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    const url = this.buildUrl(endpoint, params)
    console.log("Request URL:", url)
    const headers = {
      ...this.getAuthHeaders(),
      ...fetchOptions.headers,
    }

    // const response = await fetch(url, {
    //   ...fetchOptions,
    //   headers,
    // })

    // if (!response.ok) {
    //   const error = await response.json().catch(() => ({}))
    //   throw new Error(error.detail || error.message || `API Error: ${response.status}`)
    // }

    // return response.json() as Promise<T>
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'include', // Include cookies if needed
      })

      console.log(`Response status: ${response.status}`) // Debug log
      console.log('Response headers:', Array.from(response.headers.entries()))

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log("Error response data:", errorData);
        } catch (e) {
          errorData = { detail: `HTTP Error: ${response.status}` };
        }
        throw new Error(errorData.detail || errorData.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) })
  }

  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) })
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

export const apiClient = new APIClient(BASE_URL)

// Auth API
export const authAPI = {
  register: (data: any) => {
    // Transform data to match backend expectations
    const registrationData = {
      email: data.email,
      password: data.password,
      password2: data.password2,
      full_name: data.full_name,
      role: data.role,
      ...(data.role === 'patient' ? {
        age: data.age,
        gender: data.gender,
        contact_number: data.contact_number,
        medical_history: data.medical_history || ''
      } : {
        specializations: Array.isArray(data.specializations) ? data.specializations : [data.specializations],
        license_number: data.license_number,
        years_of_experience: data.years_of_experience,
        contact_number: data.contact_number
      })
    };
    console.log("Sending registration data:", registrationData);
    return apiClient.post("/v1/auth/register/", registrationData);
  },
  login: (email: string, password: string) => apiClient.post("/v1/auth/login/", { email, password }),
  refreshToken: (refresh: string) => apiClient.post("/v1/auth/token/refresh/", { refresh }),
  getProfile: () => apiClient.get("/v1/auth/profile/"),
  changePassword: (current_password: string, new_password: string) =>
    apiClient.post("/v1/auth/change-password/", { current_password, new_password }),
};

// Patient API
export const patientAPI = {
  list: (params?: any) => apiClient.get("/v1/patients/", { params }),
  create: (data: any) => apiClient.post("/v1/patients/", data),
  detail: (id: number) => apiClient.get(`/v1/patients/${id}/`),
  update: (id: number, data: any) => apiClient.put(`/v1/patients/${id}/`, data),
}

// Doctor API
export const doctorAPI = {
  list: (params?: any) => apiClient.get("/v1/doctors/", { params }),
  create: (data: any) => apiClient.post("/v1/doctors/", data),
  detail: (id: number) => apiClient.get(`/v1/doctors/${id}/`),
  update: (id: number, data: any) => apiClient.put(`/v1/doctors/${id}/`, data),
  getMyPatients: () => apiClient.get("/v1/doctor/my-patients/"),
}

// Mapping API
export const mappingAPI = {
  list: (params?: any) => apiClient.get("/v1/mappings/", { params }),
  create: (data: any) => apiClient.post("/v1/mappings/", data),
  detail: (id: number) => apiClient.get(`/v1/mappings/${id}/`),
  update: (id: number, data: any) => apiClient.put(`/v1/mappings/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/v1/mappings/${id}/`),
  getByPatient: (patientId: number) => apiClient.get(`/v1/mappings/patient/${patientId}/`),
}

// User API (admin only)
export const userAPI = {
  list: (params?: any) => apiClient.get("/v1/users/", { params }),
  detail: (id: number) => apiClient.get(`/v1/users/${id}/`),
}

// System API (admin only)
export const systemAPI = {
  settings: () => apiClient.get("/v1/system-settings/"),
  updateSettings: (data: any) => apiClient.put("/v1/system-settings/", data),
}
