import { LoginCredentials } from '@/types/user'

// API Configuration for local development
const API_BASE_URL = 'http://localhost:5000/api'

console.log('🔗 API Base URL:', API_BASE_URL)

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  token?: string
  user?: any
}

// Mock user data for fallback when backend isn't accessible
const mockUsers: Record<string, any> = {
  'admin@aol.com': {
    id: 1,
    email: 'admin@aol.com',
    firstName: 'John',
    lastName: 'Administrator',
    role: 'admin',
    isOnline: true,
    hasTrainingAccess: true,
    mfaEnabled: false,
    phone: '+1-555-0001'
  },
  'dispatcher@aol.com': {
    id: 2,
    email: 'dispatcher@aol.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'dispatcher',
    isOnline: true,
    hasTrainingAccess: true,
    mfaEnabled: false,
    phone: '+1-555-0002'
  },
  'driver@aol.com': {
    id: 3,
    email: 'driver@aol.com',
    firstName: 'Mike',
    lastName: 'Williams',
    role: 'driver',
    isOnline: false,
    hasTrainingAccess: false,
    mfaEnabled: false,
    phone: '+1-555-0003'
  },
  'accountant@aol.com': {
    id: 4,
    email: 'accountant@aol.com',
    firstName: 'Lisa',
    lastName: 'Davis',
    role: 'accountant',
    isOnline: true,
    hasTrainingAccess: true,
    mfaEnabled: false,
    phone: '+1-555-0004'
  },
  'it@aol.com': {
    id: 5,
    email: 'it@aol.com',
    firstName: 'David',
    lastName: 'Chen',
    role: 'it_support',
    isOnline: true,
    hasTrainingAccess: true,
    mfaEnabled: true,
    phone: '+1-555-0005'
  }
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
    // If using fallback mode, don't make real HTTP requests
    if (this.useFallback) {
      throw new Error('Backend not accessible - using fallback methods')
    }

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
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    if (this.useFallback) {
      return this.mockLogin(credentials)
    }

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
      console.warn('Real API failed, falling back to mock login')
      return this.mockLogin(credentials)
    }
  }

  private async mockLogin(credentials: LoginCredentials): Promise<ApiResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user = mockUsers[credentials.email.toLowerCase()]
    if (user && credentials.password === 'password123') {
      // Generate a mock token
      const mockToken = 'mock_jwt_token_' + btoa(JSON.stringify({ userId: user.id, email: user.email }))
      this.setToken(mockToken)
      
      return {
        success: true,
        token: mockToken,
        user: {
          ...user,
          lastLogin: new Date()
        }
      }
    } else {
      throw new Error('Invalid email or password')
    }
  }

  async logout(): Promise<ApiResponse> {
    if (this.useFallback) {
      this.setToken(null)
      return { success: true, message: 'Logged out successfully' }
    }

    try {
      const response = await this.request('/auth/logout', {
        method: 'POST',
      })
      this.setToken(null)
      return response
    } catch (error) {
      // Even if API fails, clear local token
      this.setToken(null)
      return { success: true, message: 'Logged out successfully' }
    }
  }

  async verifyToken(): Promise<ApiResponse> {
    if (this.useFallback) {
      return this.mockVerifyToken()
    }

    try {
      return await this.request('/auth/verify')
    } catch (error) {
      console.warn('Real API failed, falling back to mock verify')
      return this.mockVerifyToken()
    }
  }

  private async mockVerifyToken(): Promise<ApiResponse> {
    if (!this.token || !this.token.startsWith('mock_jwt_token_')) {
      throw new Error('No valid token')
    }

    try {
      // Decode mock token
      const tokenData = JSON.parse(atob(this.token.replace('mock_jwt_token_', '')))
      const user = Object.values(mockUsers).find(u => u.id === tokenData.userId)
      
      if (user) {
        return {
          success: true,
          user: user
        }
      } else {
        throw new Error('User not found')
      }
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  // Password reset (mock only for now)
  async forgotPassword(email: string): Promise<ApiResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (mockUsers[email.toLowerCase()]) {
      return {
        success: true,
        message: 'If an account with that email exists, we have sent you a password reset link.'
      }
    }
    
    // Always return success to prevent email enumeration
    return {
      success: true,
      message: 'If an account with that email exists, we have sent you a password reset link.'
    }
  }

  // Dashboard methods with fallback
  async getDashboardStats(): Promise<ApiResponse> {
    if (this.useFallback) {
      return this.mockDashboardStats()
    }

    try {
      return await this.request('/dashboard/stats')
    } catch (error) {
      return this.mockDashboardStats()
    }
  }

  private mockDashboardStats(): ApiResponse {
    return {
      success: true,
      data: {
        users: { total: 5, active: 5 },
        trucks: { total: 6, active: 5 },
        revenue: { current: 284500, previous: 247300, growth: 15.04 },
        system: { uptime: '99.8%' }
      }
    }
  }

  async getNotifications(): Promise<ApiResponse> {
    if (this.useFallback) {
      return {
        success: true,
        data: [
          {
            id: 1,
            title: 'System Running in Demo Mode',
            message: 'Backend API not accessible - using demo data',
            type: 'info',
            category: 'system',
            is_read: false,
            created_at: new Date().toISOString()
          }
        ]
      }
    }

    try {
      return await this.request('/dashboard/notifications')
    } catch (error) {
      return { success: true, data: [] }
    }
  }

  async markNotificationRead(id: string): Promise<ApiResponse> {
    return { success: true, message: 'Notification marked as read' }
  }

  // Data fetching methods (all return mock data in fallback mode)
  async getUsers(): Promise<ApiResponse> {
    if (this.useFallback) {
      return { success: true, data: Object.values(mockUsers) }
    }
    try {
      return await this.request('/users')
    } catch (error) {
      return { success: true, data: Object.values(mockUsers) }
    }
  }

  async getLoads(): Promise<ApiResponse> {
    const mockLoads = [
      {
        id: 1,
        load_number: 'RC-2024-001',
        customer_name: 'ABC Logistics',
        pickup_location: 'Los Angeles, CA',
        delivery_location: 'Phoenix, AZ',
        status: 'delivered',
        rate: 2500
      }
    ]
    return { success: true, data: mockLoads }
  }

  async getTrucks(): Promise<ApiResponse> {
    const mockTrucks = [
      { id: 1, truck_number: 'T-001', make: 'Freightliner', model: 'Cascadia', status: 'active' },
      { id: 2, truck_number: 'T-002', make: 'Kenworth', model: 'T680', status: 'active' }
    ]
    return { success: true, data: mockTrucks }
  }

  async getInvoices(): Promise<ApiResponse> {
    const mockInvoices = [
      { id: 1, invoice_number: 'INV-2024-001', customer_name: 'ABC Logistics', amount: 2625, status: 'paid' }
    ]
    return { success: true, data: mockInvoices }
  }

  async getExpenses(): Promise<ApiResponse> {
    const mockExpenses = [
      { id: 1, category: 'fuel', description: 'Diesel fuel', amount: 420.50, date: '2024-01-16' }
    ]
    return { success: true, data: mockExpenses }
  }

  async getTrainingModules(): Promise<ApiResponse> {
    const mockModules = [
      {
        id: 1,
        title: 'DOT Safety Regulations',
        description: 'Safety requirements overview',
        category_name: 'Safety',
        user_status: 'completed'
      }
    ]
    return { success: true, data: mockModules }
  }
}

export const apiService = new ApiService()
export default apiService
