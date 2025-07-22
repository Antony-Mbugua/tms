// Mock API service for development when backend is not available
import { LoginCredentials } from '@/types/user'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  token?: string
  user?: any
}

class MockApiService {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('aol_token', token)
    } else {
      localStorage.removeItem('aol_token')
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock user validation
    const mockUsers = {
      'admin@alloverlogistics.com': {
        id: '1',
        email: 'admin@alloverlogistics.com',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567890',
        role: 'admin',
        isOnline: true,
        hasTrainingAccess: true,
        mfaEnabled: false
      },
      'test@test.com': {
        id: '2',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        role: 'dispatcher',
        isOnline: true,
        hasTrainingAccess: true,
        mfaEnabled: false
      }
    }

    const user = mockUsers[credentials.email as keyof typeof mockUsers]
    
    if (user && credentials.password === 'admin123') {
      const mockToken = 'mock_jwt_token_' + Date.now()
      this.setToken(mockToken)
      
      return {
        success: true,
        token: mockToken,
        user
      }
    }

    return {
      success: false,
      error: 'Invalid email or password'
    }
  }

  async logout(): Promise<ApiResponse> {
    this.setToken(null)
    return {
      success: true,
      message: 'Logged out successfully'
    }
  }

  async verifyToken(): Promise<ApiResponse> {
    if (this.token) {
      return {
        success: true,
        user: {
          id: '1',
          email: 'admin@alloverlogistics.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        }
      }
    }
    return {
      success: false,
      error: 'No token provided'
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      success: true,
      message: 'Password reset email sent (mock mode)'
    }
  }

  // Mock other methods
  async getDashboardStats(): Promise<ApiResponse> {
    return { success: true, data: { totalLoads: 0, activeTrucks: 0 } }
  }

  async getNotifications(): Promise<ApiResponse> {
    return { success: true, data: [] }
  }

  async markNotificationRead(id: string): Promise<ApiResponse> {
    return { success: true }
  }

  async getUsers(): Promise<ApiResponse> {
    return { success: true, data: [] }
  }

  async getLoads(): Promise<ApiResponse> {
    return { success: true, data: [] }
  }

  async getTrucks(): Promise<ApiResponse> {
    return { success: true, data: [] }
  }

  async getInvoices(): Promise<ApiResponse> {
    return { success: true, data: [] }
  }

  async getExpenses(): Promise<ApiResponse> {
    return { success: true, data: [] }
  }

  async getTrainingModules(): Promise<ApiResponse> {
    return { success: true, data: [] }
  }
}

export const mockApiService = new MockApiService()
