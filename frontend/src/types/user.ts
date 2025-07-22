export type UserRole = 'admin' | 'dispatcher' | 'driver' | 'accountant' | 'it_support'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  isOnline: boolean
  hasTrainingAccess: boolean
  mfaEnabled: boolean
  createdAt: Date
  lastLogin?: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
  mfaCode?: string
}
