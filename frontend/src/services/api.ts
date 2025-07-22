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
  message?: string
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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API Request failed:', error)

      // For fly.dev demo, throw a specific error to trigger demo mode
      if (API_BASE_URL.includes('fly.dev') || (error instanceof Error && (error.message.includes('Failed to fetch') || error.name === 'AbortError'))) {
        throw new Error('DEMO_MODE_BACKEND_UNAVAILABLE')
      }

      throw error
    }
  }

  // Demo mode authentication for fly.dev deployment
  private demoLogin(credentials: LoginCredentials): ApiResponse {
    const validUsers = {
      'admin@alloverlogistics.com': {
        id: 1,
        email: 'admin@alloverlogistics.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '+1234567890'
      },
      'dispatcher@alloverlogistics.com': {
        id: 2,
        email: 'dispatcher@alloverlogistics.com',
        firstName: 'John',
        lastName: 'Dispatcher',
        role: 'dispatcher',
        phone: '+1234567891'
      }
    }

    const user = validUsers[credentials.email as keyof typeof validUsers]

    if (user && credentials.password === 'admin123') {
      const demoToken = 'demo_token_' + Date.now()
      this.setToken(demoToken)

      return {
        success: true,
        token: demoToken,
        user
      }
    }

    return {
      success: false,
      error: 'Invalid email or password'
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })

      if (response.token) {
        this.setToken(response.token)
      }

      return response
    } catch (error) {
      // If backend unavailable, use demo mode
      if (error instanceof Error && error.message === 'DEMO_MODE_BACKEND_UNAVAILABLE') {
        console.log('🚀 Using demo mode authentication')
        return this.demoLogin(credentials)
      }
      throw error
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.request('/auth/logout', {
        method: 'POST',
      })

      this.setToken(null)
      return response
    } catch (error) {
      // Demo mode logout
      if (error instanceof Error && error.message === 'DEMO_MODE_BACKEND_UNAVAILABLE') {
        this.setToken(null)
        return { success: true, message: 'Logged out (demo mode)' }
      }
      throw error
    }
  }

  async verifyToken(): Promise<ApiResponse> {
    try {
      return await this.request('/auth/verify')
    } catch (error) {
      // Demo mode token verification
      if (error instanceof Error && error.message === 'DEMO_MODE_BACKEND_UNAVAILABLE') {
        if (this.token && this.token.startsWith('demo_token_')) {
          return {
            success: true,
            user: {
              id: 1,
              email: 'admin@alloverlogistics.com',
              firstName: 'Admin',
              lastName: 'User',
              role: 'admin'
            }
          }
        }
        return { success: false, error: 'No valid demo token' }
      }
      throw error
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      return await this.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
    } catch (error) {
      // Demo mode password reset
      if (error instanceof Error && error.message === 'DEMO_MODE_BACKEND_UNAVAILABLE') {
        return {
          success: true,
          message: 'Password reset email sent (demo mode)'
        }
      }
      throw error
    }
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
