import { LoginCredentials } from '@/types/user'
import { ENV_CONFIG } from '@/config/environment'

// Dynamic API Configuration based on environment
const API_BASE_URL = ENV_CONFIG.apiBaseUrl

console.log('🔗 API Base URL:', API_BASE_URL)

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  token?: string
  user?: any
}

class ApiService {
  private token: string | null = null

  constructor() {
    // Get token from localStorage on initialization
    this.token = localStorage.getItem('aol_token')
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('aol_token', token)
    } else {
      localStorage.removeItem('aol_token')
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${response.status}). Backend may not be deployed.`)
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API Request failed:', error)

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running.`)
        }
        if (error.message.includes('non-JSON response')) {
          throw new Error(`Backend server not found at ${API_BASE_URL}. Please check deployment.`)
        }
      }

      throw error
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.token) {
      this.setToken(response.token)
    }

    return response
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    })

    this.setToken(null)
    return response
  }

  async verifyToken(): Promise<ApiResponse> {
    return this.request('/auth/verify')
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  // Dashboard methods
  async getDashboardStats(): Promise<ApiResponse> {
    return this.request('/dashboard/stats')
  }

  async getNotifications(): Promise<ApiResponse> {
    return this.request('/dashboard/notifications')
  }

  async markNotificationRead(id: string): Promise<ApiResponse> {
    return this.request(`/dashboard/notifications/${id}/read`, {
      method: 'PATCH',
    })
  }

  // Data fetching methods
  async getUsers(): Promise<ApiResponse> {
    return this.request('/users')
  }

  async getLoads(): Promise<ApiResponse> {
    return this.request('/loads')
  }

  async getTrucks(): Promise<ApiResponse> {
    return this.request('/trucks')
  }

  async getInvoices(): Promise<ApiResponse> {
    return this.request('/invoices')
  }

  async getExpenses(): Promise<ApiResponse> {
    return this.request('/expenses')
  }

  async getTrainingModules(): Promise<ApiResponse> {
    return this.request('/training/modules')
  }
}

export const apiService = new ApiService()
export default apiService
